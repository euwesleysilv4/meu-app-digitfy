-- Criar tabela para armazenar alterações no perfil
-- Versão simplificada sem referências complexas
DROP TABLE IF EXISTS public.profile_changes;

CREATE TABLE IF NOT EXISTS public.profile_changes (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL,
  field_changed TEXT NOT NULL,
  old_value TEXT,
  new_value TEXT,
  changed_by UUID NOT NULL,
  changed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Habilitar o RLS (Row Level Security)
ALTER TABLE public.profile_changes ENABLE ROW LEVEL SECURITY;

-- Adicionar política para administradores visualizarem todas as alterações
CREATE POLICY "Admins can view all profile changes" 
ON public.profile_changes FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Adicionar política para usuários verem suas próprias alterações
CREATE POLICY "Users can view their own profile changes" 
ON public.profile_changes FOR SELECT 
USING (
  user_id = auth.uid()
);

-- Criar índice para melhorar performance em consultas frequentes
CREATE INDEX IF NOT EXISTS idx_profile_changes_user_id ON public.profile_changes(user_id);
CREATE INDEX IF NOT EXISTS idx_profile_changes_changed_by ON public.profile_changes(changed_by);
CREATE INDEX IF NOT EXISTS idx_profile_changes_changed_at ON public.profile_changes(changed_at);

-- Conceder permissões
GRANT SELECT ON public.profile_changes TO authenticated;
GRANT SELECT, INSERT ON public.profile_changes TO service_role; 