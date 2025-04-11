-- Tabela para armazenar os funis dos usuários
CREATE TABLE IF NOT EXISTS public.user_funnels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT,
  icon TEXT,
  steps JSONB NOT NULL DEFAULT '[]'::JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  
  -- Índices para melhorar performance
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Índice para busca rápida por usuário
CREATE INDEX IF NOT EXISTS idx_user_funnels_user_id ON public.user_funnels(user_id);

-- Habilitar Row Level Security
ALTER TABLE public.user_funnels ENABLE ROW LEVEL SECURITY;

-- Criar políticas de segurança
-- Usuário só pode ver seus próprios funis
CREATE POLICY "Users can view their own funnels" 
  ON public.user_funnels 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Usuário só pode inserir seus próprios funis
CREATE POLICY "Users can insert their own funnels" 
  ON public.user_funnels 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Usuário só pode atualizar seus próprios funis
CREATE POLICY "Users can update their own funnels" 
  ON public.user_funnels 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Usuário só pode deletar seus próprios funis
CREATE POLICY "Users can delete their own funnels" 
  ON public.user_funnels 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Adicionar trigger para atualizar o updated_at
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = now();
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_funnels_modtime
  BEFORE UPDATE ON public.user_funnels
  FOR EACH ROW
  EXECUTE PROCEDURE update_modified_column(); 