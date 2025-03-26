-- Criar tabela para sugestões de ebooks
CREATE TABLE IF NOT EXISTS public.ebook_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  drive_link TEXT NOT NULL,
  instagram TEXT,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  admin_notes TEXT,
  processed_by UUID REFERENCES auth.users(id)
);

-- Adicionar comentários à tabela e colunas
COMMENT ON TABLE public.ebook_suggestions IS 'Tabela para armazenar sugestões de ebooks enviadas pelos usuários';
COMMENT ON COLUMN public.ebook_suggestions.id IS 'Identificador único da sugestão';
COMMENT ON COLUMN public.ebook_suggestions.drive_link IS 'Link do Google Drive para o arquivo sugerido';
COMMENT ON COLUMN public.ebook_suggestions.instagram IS 'Perfil do Instagram do usuário que enviou a sugestão';
COMMENT ON COLUMN public.ebook_suggestions.description IS 'Descrição opcional da sugestão';
COMMENT ON COLUMN public.ebook_suggestions.status IS 'Status da sugestão: pending, approved ou rejected';
COMMENT ON COLUMN public.ebook_suggestions.created_at IS 'Data de criação da sugestão';
COMMENT ON COLUMN public.ebook_suggestions.updated_at IS 'Data da última atualização da sugestão';
COMMENT ON COLUMN public.ebook_suggestions.user_id IS 'ID do usuário que enviou a sugestão (se estiver logado)';
COMMENT ON COLUMN public.ebook_suggestions.admin_notes IS 'Notas do administrador sobre a sugestão';
COMMENT ON COLUMN public.ebook_suggestions.processed_by IS 'ID do administrador que processou a sugestão';

-- Trigger para atualizar o updated_at automaticamente
CREATE TRIGGER update_ebook_suggestions_updated_at
BEFORE UPDATE ON public.ebook_suggestions
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- Configurar segurança
ALTER TABLE public.ebook_suggestions ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança - usuários podem ver suas próprias sugestões
CREATE POLICY "Usuários podem ver suas próprias sugestões" ON public.ebook_suggestions
  FOR SELECT
  USING (
    auth.uid() = user_id
  );

-- Políticas de segurança - usuários podem inserir sugestões
CREATE POLICY "Usuários podem inserir sugestões" ON public.ebook_suggestions
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id OR user_id IS NULL
  );

-- Políticas para administradores - gerenciar todas as sugestões
CREATE POLICY "Administradores podem visualizar todas as sugestões" ON public.ebook_suggestions
  FOR SELECT
  USING (
    is_admin(auth.uid())
  );

CREATE POLICY "Administradores podem atualizar sugestões" ON public.ebook_suggestions
  FOR UPDATE
  USING (
    is_admin(auth.uid())
  );

CREATE POLICY "Administradores podem deletar sugestões" ON public.ebook_suggestions
  FOR DELETE
  USING (
    is_admin(auth.uid())
  );

-- Conceder permissões para funções anônimas e autenticadas
GRANT SELECT, INSERT ON public.ebook_suggestions TO anon, authenticated; 