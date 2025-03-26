-- Criar extensão pg_trgm para busca de texto similar
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Descartar funções existentes para evitar erros de recriação
DROP FUNCTION IF EXISTS search_ebooks(TEXT, TEXT);
DROP FUNCTION IF EXISTS increment_ebook_downloads(UUID);

-- Criar tabela de ebooks
CREATE TABLE IF NOT EXISTS public.ebooks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    content TEXT,  -- Descrição completa ou conteúdo markdown do ebook
    cover_image_url TEXT,  -- URL da imagem de capa
    file_url TEXT NOT NULL,  -- URL para download do arquivo
    file_size TEXT,  -- Tamanho do arquivo (ex: "5MB")
    file_type TEXT,  -- Tipo de arquivo (PDF, EPUB, etc)
    external_url TEXT,  -- URL externa opcional
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('published', 'draft', 'scheduled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    author TEXT,  -- Autor do ebook
    created_by UUID REFERENCES auth.users,  -- Criado por qual usuário admin
    instagram TEXT,  -- @ do Instagram se for enviado por um usuário
    tags TEXT[],  -- Array de tags
    download_count INTEGER DEFAULT 0,  -- Contador de downloads
    like_count INTEGER DEFAULT 0  -- Contador de curtidas
);

-- Criar índices para melhorar a performance
DROP INDEX IF EXISTS ebooks_title_idx;
DROP INDEX IF EXISTS ebooks_description_idx;
DROP INDEX IF EXISTS ebooks_tags_idx;
DROP INDEX IF EXISTS ebooks_status_idx;

CREATE INDEX IF NOT EXISTS ebooks_title_idx ON public.ebooks USING gin(title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS ebooks_description_idx ON public.ebooks USING gin(description gin_trgm_ops);
CREATE INDEX IF NOT EXISTS ebooks_tags_idx ON public.ebooks USING gin(tags);
CREATE INDEX IF NOT EXISTS ebooks_status_idx ON public.ebooks(status);

-- Adicionar comentários à tabela e colunas
COMMENT ON TABLE public.ebooks IS 'Tabela com ebooks e PDFs disponíveis na plataforma';
COMMENT ON COLUMN public.ebooks.id IS 'ID único do ebook';
COMMENT ON COLUMN public.ebooks.title IS 'Título do ebook';
COMMENT ON COLUMN public.ebooks.description IS 'Descrição curta do ebook';
COMMENT ON COLUMN public.ebooks.content IS 'Conteúdo detalhado ou descrição completa em markdown';
COMMENT ON COLUMN public.ebooks.cover_image_url IS 'URL da imagem de capa do ebook';
COMMENT ON COLUMN public.ebooks.file_url IS 'URL para download do arquivo';
COMMENT ON COLUMN public.ebooks.file_size IS 'Tamanho do arquivo em formato legível';
COMMENT ON COLUMN public.ebooks.file_type IS 'Tipo de arquivo (PDF, EPUB, etc)';
COMMENT ON COLUMN public.ebooks.status IS 'Status de publicação: publicado, rascunho ou agendado';
COMMENT ON COLUMN public.ebooks.created_at IS 'Data de criação do registro';
COMMENT ON COLUMN public.ebooks.updated_at IS 'Data da última atualização';
COMMENT ON COLUMN public.ebooks.author IS 'Nome do autor do ebook';
COMMENT ON COLUMN public.ebooks.created_by IS 'ID do usuário admin que criou o registro';
COMMENT ON COLUMN public.ebooks.instagram IS 'Conta do Instagram do contribuidor';
COMMENT ON COLUMN public.ebooks.tags IS 'Tags relacionadas ao ebook';
COMMENT ON COLUMN public.ebooks.download_count IS 'Contagem de downloads realizados';
COMMENT ON COLUMN public.ebooks.like_count IS 'Contagem de curtidas';

-- Função para atualizar o timestamp de atualização
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar o timestamp automaticamente
DROP TRIGGER IF EXISTS update_ebooks_updated_at ON public.ebooks;
CREATE TRIGGER update_ebooks_updated_at
BEFORE UPDATE ON public.ebooks
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Função para incrementar contador de downloads
CREATE OR REPLACE FUNCTION increment_ebook_downloads(ebook_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.ebooks
  SET download_count = download_count + 1
  WHERE id = ebook_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para pesquisar ebooks
CREATE OR REPLACE FUNCTION search_ebooks(search_term TEXT, search_tags TEXT)
RETURNS SETOF public.ebooks AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM public.ebooks
  WHERE 
    status = 'published' AND
    (
      search_term IS NULL OR
      search_term = '' OR
      title ILIKE '%' || search_term || '%' OR
      description ILIKE '%' || search_term || '%' OR
      content ILIKE '%' || search_term || '%' OR
      author ILIKE '%' || search_term || '%'
    ) AND
    (
      search_tags IS NULL OR
      search_tags = '' OR
      tags ILIKE '%' || search_tags || '%'
    )
  ORDER BY created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ativar segurança em nível de linha
ALTER TABLE public.ebooks ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança
DROP POLICY IF EXISTS "Admins podem inserir ebooks" ON public.ebooks;
CREATE POLICY "Admins podem inserir ebooks"
  ON public.ebooks FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT is_specific_admin()));

DROP POLICY IF EXISTS "Admins podem atualizar ebooks" ON public.ebooks;
CREATE POLICY "Admins podem atualizar ebooks"
  ON public.ebooks FOR UPDATE
  TO authenticated
  USING ((SELECT is_specific_admin()));

DROP POLICY IF EXISTS "Admins podem deletar ebooks" ON public.ebooks;
CREATE POLICY "Admins podem deletar ebooks"
  ON public.ebooks FOR DELETE
  TO authenticated
  USING ((SELECT is_specific_admin()));

DROP POLICY IF EXISTS "Ebooks publicados são visíveis para todos" ON public.ebooks;
CREATE POLICY "Ebooks publicados são visíveis para todos"
  ON public.ebooks FOR SELECT
  USING (status = 'published' OR (
    auth.uid() IS NOT NULL AND
    (SELECT is_specific_admin())
  ));

-- Inserir dados de exemplo (os dois ebooks mencionados)
INSERT INTO public.ebooks (title, description, cover_image_url, file_url, file_size, file_type, status, author, tags)
VALUES
  (
    'Guia Completo de Marketing Digital', 
    'Aprenda tudo sobre marketing digital e como aplicá-lo no seu negócio.',
    'https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=600&q=80',
    'https://exemplo.com/ebooks/marketing-digital.pdf',
    '5 MB',
    'PDF',
    'published',
    'Digital Fy',
    ARRAY['Marketing Digital', 'Guia', 'Negócios']
  ),
  (
    'Manual de Copywriting', 
    'Descubra como escrever textos persuasivos que convertem.',
    'https://images.unsplash.com/photo-1515378960530-7c0da6231fb1?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=600&q=80',
    'https://exemplo.com/ebooks/copywriting.pdf',
    '3 MB',
    'PDF',
    'published',
    'Digital Fy',
    ARRAY['Copywriting', 'Escrita', 'Persuasão']
  );

-- Criar tabela para sugestões de ebooks
CREATE TABLE IF NOT EXISTS public.ebook_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  author TEXT,
  link TEXT,
  submitter_email TEXT,
  submitter_name TEXT,
  submitter_instagram TEXT,
  status TEXT DEFAULT 'pending',
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  user_id UUID REFERENCES auth.users(id)
);

-- Ativar segurança em nível de linha
ALTER TABLE public.ebook_suggestions ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança para ebook_suggestions
DROP POLICY IF EXISTS "Usuários podem visualizar suas próprias sugestões" ON public.ebook_suggestions;
CREATE POLICY "Usuários podem visualizar suas próprias sugestões"
  ON public.ebook_suggestions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários autenticados podem enviar sugestões" ON public.ebook_suggestions;
CREATE POLICY "Usuários autenticados podem enviar sugestões"
  ON public.ebook_suggestions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Administradores podem gerenciar todas as sugestões" ON public.ebook_suggestions;
CREATE POLICY "Administradores podem gerenciar todas as sugestões"
  ON public.ebook_suggestions FOR ALL
  TO authenticated
  USING ((SELECT is_specific_admin()));

-- Trigger para atualizar updated_at na tabela ebook_suggestions
DROP TRIGGER IF EXISTS update_ebook_suggestions_updated_at ON public.ebook_suggestions;
CREATE TRIGGER update_ebook_suggestions_updated_at
BEFORE UPDATE ON public.ebook_suggestions
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Função para processar sugestões de eBooks (aprovar/rejeitar)
CREATE OR REPLACE FUNCTION process_ebook_suggestion(
  suggestion_id UUID,
  new_status TEXT,
  admin_notes TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
  -- Verificar se o usuário atual é administrador
  IF NOT (SELECT is_specific_admin()) THEN
    RAISE EXCEPTION 'Permissão negada: Apenas administradores podem processar sugestões de eBooks';
  END IF;

  -- Verificar se o status é válido
  IF new_status NOT IN ('approved', 'rejected', 'pending') THEN
    RAISE EXCEPTION 'Status inválido. Deve ser: approved, rejected ou pending';
  END IF;

  -- Atualizar o status da sugestão
  UPDATE public.ebook_suggestions
  SET 
    status = new_status,
    admin_notes = COALESCE(process_ebook_suggestion.admin_notes, ebook_suggestions.admin_notes),
    updated_at = NOW()
  WHERE id = suggestion_id;

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 