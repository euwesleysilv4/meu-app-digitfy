-- Solução de emergência para o problema de geração de token

-- 1. Verifica se a tabela de tokens existe, e se não existir, cria
CREATE TABLE IF NOT EXISTS public.funnel_share_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token TEXT UNIQUE NOT NULL,
  funnel_id UUID NOT NULL,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  funnel_data JSONB NOT NULL
);

-- 2. Adiciona as políticas RLS se não existirem
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_policies 
    WHERE tablename = 'funnel_share_tokens' AND policyname = 'Users can view their own share tokens'
  ) THEN
    -- Habilitar Row Level Security
    ALTER TABLE public.funnel_share_tokens ENABLE ROW LEVEL SECURITY;
    
    -- Criar políticas de segurança
    CREATE POLICY "Users can view their own share tokens" 
      ON public.funnel_share_tokens 
      FOR SELECT 
      USING (auth.uid() = created_by);
      
    CREATE POLICY "Users can insert share tokens" 
      ON public.funnel_share_tokens 
      FOR INSERT 
      WITH CHECK (auth.uid() = created_by);
      
    CREATE POLICY "Users can update their own share tokens" 
      ON public.funnel_share_tokens 
      FOR UPDATE 
      USING (auth.uid() = created_by);
      
    CREATE POLICY "Users can delete their own share tokens" 
      ON public.funnel_share_tokens 
      FOR DELETE 
      USING (auth.uid() = created_by);
  END IF;
END
$$;

-- 3. Adiciona indexes para performance se não existirem
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_indexes 
    WHERE tablename = 'funnel_share_tokens' AND indexname = 'idx_funnel_share_tokens_token'
  ) THEN
    CREATE INDEX IF NOT EXISTS idx_funnel_share_tokens_token ON public.funnel_share_tokens(token);
    CREATE INDEX IF NOT EXISTS idx_funnel_share_tokens_funnel_id ON public.funnel_share_tokens(funnel_id);
    CREATE INDEX IF NOT EXISTS idx_funnel_share_tokens_created_by ON public.funnel_share_tokens(created_by);
  END IF;
END
$$;

-- 4. Cria uma função EXTREMAMENTE simples para gerar token
CREATE OR REPLACE FUNCTION generate_simple_token(p_funnel_id TEXT, p_days_valid INT DEFAULT 30)
RETURNS TEXT AS $$
BEGIN
  RETURN md5(random()::text || now()::text);
END;
$$ LANGUAGE plpgsql;

-- 5. Concede permissões para a função
GRANT EXECUTE ON FUNCTION generate_simple_token TO authenticated; 