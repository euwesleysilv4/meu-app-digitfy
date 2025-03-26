-- Extensão para busca de texto com similarity (verifica se já existe)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Criação da tabela 'free_packs'
CREATE TABLE IF NOT EXISTS public.free_packs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    content TEXT,
    image_url TEXT,
    file_url TEXT NOT NULL, -- URL para o arquivo que pode ser baixado
    status TEXT NOT NULL CHECK (status IN ('published', 'draft', 'scheduled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    author TEXT NOT NULL,
    tags TEXT[] DEFAULT '{}'::TEXT[],
    
    -- Metadados e estatísticas opcionais
    download_count INTEGER DEFAULT 0,
    view_count INTEGER DEFAULT 0, 
    like_count INTEGER DEFAULT 0,
    scheduled_date TIMESTAMP WITH TIME ZONE,
    file_size TEXT, -- Tamanho do arquivo em formato legível (ex: "2.5MB")
    file_type TEXT, -- Tipo de arquivo (PDF, ZIP, etc)
    
    -- Relação com usuário criador (admin)
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Criar índices para melhorar performance de busca
CREATE INDEX IF NOT EXISTS free_packs_status_idx ON public.free_packs(status);
CREATE INDEX IF NOT EXISTS free_packs_title_idx ON public.free_packs USING gin(title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS free_packs_description_idx ON public.free_packs USING gin(description gin_trgm_ops);
CREATE INDEX IF NOT EXISTS free_packs_tags_idx ON public.free_packs USING gin(tags);

-- Adicionar comentários à tabela e colunas
COMMENT ON TABLE public.free_packs IS 'Tabela para armazenar pacotes gratuitos disponíveis para download';
COMMENT ON COLUMN public.free_packs.id IS 'ID único do pacote gratuito';
COMMENT ON COLUMN public.free_packs.title IS 'Título do pacote gratuito';
COMMENT ON COLUMN public.free_packs.description IS 'Descrição breve do pacote';
COMMENT ON COLUMN public.free_packs.content IS 'Conteúdo/descrição detalhada do pacote em formato text/markdown';
COMMENT ON COLUMN public.free_packs.image_url IS 'URL da imagem de capa do pacote';
COMMENT ON COLUMN public.free_packs.file_url IS 'URL para download do arquivo/pacote';
COMMENT ON COLUMN public.free_packs.status IS 'Status do pacote: published, draft ou scheduled';
COMMENT ON COLUMN public.free_packs.created_at IS 'Data de criação do pacote';
COMMENT ON COLUMN public.free_packs.updated_at IS 'Data da última atualização do pacote';
COMMENT ON COLUMN public.free_packs.author IS 'Nome do autor do pacote';
COMMENT ON COLUMN public.free_packs.tags IS 'Array de tags associadas ao pacote';
COMMENT ON COLUMN public.free_packs.download_count IS 'Contador de downloads do pacote';
COMMENT ON COLUMN public.free_packs.view_count IS 'Contador de visualizações do pacote';
COMMENT ON COLUMN public.free_packs.like_count IS 'Contador de likes do pacote';
COMMENT ON COLUMN public.free_packs.scheduled_date IS 'Data agendada para publicação (se status for scheduled)';
COMMENT ON COLUMN public.free_packs.file_size IS 'Tamanho do arquivo em formato legível';
COMMENT ON COLUMN public.free_packs.file_type IS 'Tipo de arquivo (PDF, ZIP, etc)';
COMMENT ON COLUMN public.free_packs.created_by IS 'Referência ao usuário admin que criou o pacote';

-- Trigger para atualizar automaticamente o campo 'updated_at'
CREATE OR REPLACE FUNCTION public.handle_free_packs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar o trigger na tabela
DROP TRIGGER IF EXISTS set_free_packs_updated_at ON public.free_packs;
CREATE TRIGGER set_free_packs_updated_at
BEFORE UPDATE ON public.free_packs
FOR EACH ROW
EXECUTE FUNCTION public.handle_free_packs_updated_at();

-- Definir políticas de segurança (Row Level Security)
ALTER TABLE public.free_packs ENABLE ROW LEVEL SECURITY;

-- Políticas para administradores
CREATE POLICY "Administradores podem inserir pacotes gratuitos" ON public.free_packs
    FOR INSERT 
    WITH CHECK (
        (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
    );

CREATE POLICY "Administradores podem atualizar pacotes gratuitos" ON public.free_packs
    FOR UPDATE
    USING (
        (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
    );

CREATE POLICY "Administradores podem excluir pacotes gratuitos" ON public.free_packs
    FOR DELETE
    USING (
        (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
    );

-- Políticas para todos os usuários (leitura)
CREATE POLICY "Todos podem ver pacotes gratuitos publicados" ON public.free_packs
    FOR SELECT
    USING (
        status = 'published' OR 
        (
            -- Admins podem ver todos os pacotes
            (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
        )
    );

-- Função para incrementar contador de downloads
CREATE OR REPLACE FUNCTION public.increment_pack_download_count(pack_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.free_packs
  SET download_count = download_count + 1
  WHERE id = pack_id;
END;
$$ LANGUAGE plpgsql;

-- Função para incrementar contador de visualizações
CREATE OR REPLACE FUNCTION public.increment_pack_view_count(pack_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.free_packs
  SET view_count = view_count + 1
  WHERE id = pack_id;
END;
$$ LANGUAGE plpgsql;

-- Função para incrementar contador de likes
CREATE OR REPLACE FUNCTION public.increment_pack_like_count(pack_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.free_packs
  SET like_count = like_count + 1
  WHERE id = pack_id;
END;
$$ LANGUAGE plpgsql;

-- Função para buscar pacotes gratuitos por texto e tags
CREATE OR REPLACE FUNCTION public.search_free_packs(search_term TEXT, tag_filter TEXT[] DEFAULT NULL)
RETURNS SETOF public.free_packs AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM public.free_packs
  WHERE 
    status = 'published' AND
    (
      search_term IS NULL OR
      search_term = '' OR
      title ILIKE '%' || search_term || '%' OR
      description ILIKE '%' || search_term || '%' OR
      content ILIKE '%' || search_term || '%'
    ) AND
    (
      tag_filter IS NULL OR
      array_length(tag_filter, 1) IS NULL OR
      tags && tag_filter
    )
  ORDER BY updated_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Dados iniciais de exemplo
INSERT INTO public.free_packs (
  title, 
  description, 
  content,
  image_url,
  file_url,
  status, 
  author, 
  tags,
  file_size,
  file_type,
  download_count
) VALUES (
  'Templates Instagram',
  'Modelos prontos para marketing digital',
  '# Templates Instagram para Marketing Digital

Este pacote contém 10 templates editáveis para Instagram, perfeitos para estratégias de marketing digital.

## O que está incluído:

* 5 templates de posts para feed
* 3 templates de histórias
* 2 templates de carrossel

Todos os arquivos estão no formato PSD, compatíveis com Photoshop e Canva Pro.

## Como usar:

1. Baixe o arquivo ZIP
2. Extraia os arquivos
3. Abra no Photoshop ou importe para o Canva
4. Edite as cores, textos e imagens conforme sua marca
5. Exporte e publique!

Estes templates foram desenvolvidos para ajudar empreendedores e criadores de conteúdo a manter um feed profissional e consistente sem precisar investir em design.',
  'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d1',
  'https://example.com/downloads/templates-instagram.zip',
  'published',
  'Admin',
  ARRAY['instagram', 'templates', 'marketing', 'design'],
  '15.7MB',
  'ZIP',
  5243
),
(
  'Kit Storytelling',
  'Histórias que convertem',
  '# Kit Completo de Storytelling para Conversão

Este kit contém todas as ferramentas e templates que você precisa para criar histórias envolventes que se conectam com sua audiência e convertem em vendas.

## O que está incluído:

* Guia PDF de 45 páginas sobre estruturas narrativas
* Planilha com 20 frameworks de storytelling
* 5 exemplos completos aplicados a diferentes nichos
* Checklist para validação da sua história

## Como criar histórias poderosas:

1. Identifique a jornada do seu cliente ideal
2. Estruture sua narrativa usando os frameworks
3. Injete emoção nos pontos-chave
4. Conecte a história com seu produto ou serviço
5. Converta através de um chamado à ação irresistível

O storytelling é uma das habilidades mais importantes para qualquer marketeiro ou empreendedor. Com este kit, você conseguirá dominar esta técnica em tempo recorde.',
  'https://images.unsplash.com/photo-1516321497487-e288fb19713f',
  'https://example.com/downloads/kit-storytelling.zip',
  'published',
  'Admin',
  ARRAY['storytelling', 'conversão', 'marketing', 'vendas'],
  '8.3MB',
  'ZIP',
  3720
); 