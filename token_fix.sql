-- Corrigir sistema de tokens e seguranca dos funis

-- 1. Primeiro, corrigir as politicas da tabela user_funnels
ALTER TABLE public.user_funnels ENABLE ROW LEVEL SECURITY;

-- Limpar politicas existentes
DROP POLICY IF EXISTS "Users can view their own funnels" ON public.user_funnels;
DROP POLICY IF EXISTS "Users can insert their own funnels" ON public.user_funnels;
DROP POLICY IF EXISTS "Users can update their own funnels" ON public.user_funnels;
DROP POLICY IF EXISTS "Users can delete their own funnels" ON public.user_funnels;

-- Recriar politicas mais restritivas
CREATE POLICY "Users can view only their own funnels"
  ON public.user_funnels
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert only their own funnels"
  ON public.user_funnels
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update only their own funnels"
  ON public.user_funnels
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete only their own funnels"
  ON public.user_funnels
  FOR DELETE
  USING (auth.uid() = user_id);

-- 2. Corrigir a tabela funnel_share_tokens
ALTER TABLE public.funnel_share_tokens ENABLE ROW LEVEL SECURITY;

-- Criar uma politica anonima para validacao de tokens
DROP POLICY IF EXISTS "Anyone can validate tokens" ON public.funnel_share_tokens;
CREATE POLICY "Anyone can validate tokens"
  ON public.funnel_share_tokens
  FOR SELECT
  USING (true);

-- 3. Criar tabela de uso se nao existir
CREATE TABLE IF NOT EXISTS public.funnel_share_token_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token_id UUID NOT NULL,
  used_by UUID NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  action TEXT NOT NULL
);

-- 4. Criar funcao para gerar tokens simples
CREATE OR REPLACE FUNCTION generate_simple_token(p_funnel_id TEXT, p_days_valid INTEGER DEFAULT 30)
RETURNS TEXT AS $$
DECLARE
  v_token TEXT;
BEGIN
  -- Gerar um token simples
  v_token := encode(gen_random_bytes(8), 'hex');
  
  -- Verificar se o token ja existe
  WHILE EXISTS (SELECT 1 FROM funnel_share_tokens WHERE token = v_token) LOOP
    v_token := encode(gen_random_bytes(8), 'hex');
  END LOOP;
  
  RETURN v_token;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Criar funcao de validacao de token
CREATE OR REPLACE FUNCTION validate_funnel_token(p_token TEXT)
RETURNS JSONB AS $$
DECLARE
  v_token_data JSONB;
  v_token_id UUID;
BEGIN
  -- Buscar o token
  SELECT
    jsonb_build_object(
      'valid', true,
      'token_id', id,
      'funnel_id', funnel_id,
      'funnel_data', funnel_data
    ) INTO v_token_data
  FROM public.funnel_share_tokens
  WHERE
    token = p_token AND
    is_active = true AND
    (expires_at IS NULL OR expires_at > now());

  IF v_token_data IS NULL THEN
    RETURN jsonb_build_object('valid', false, 'message', 'Token invalido ou expirado');
  END IF;

  -- Registrar uso do token
  BEGIN
    INSERT INTO public.funnel_share_token_usage (
      token_id,
      used_by,
      action
    ) VALUES (
      (v_token_data->>'token_id')::UUID,
      auth.uid(),
      'view'
    );
  EXCEPTION WHEN OTHERS THEN
    -- Ignorar erros de log
    NULL;
  END;
  
  RETURN v_token_data;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Criar funcao para copiar um funil compartilhado
CREATE OR REPLACE FUNCTION copy_shared_funnel(p_token TEXT)
RETURNS JSONB AS $$
DECLARE
  v_token_data JSONB;
  v_new_funnel_id UUID;
BEGIN
  -- Primeiro, validar o token
  v_token_data := validate_funnel_token(p_token);

  IF NOT (v_token_data->>'valid')::BOOLEAN THEN
    RETURN v_token_data;
  END IF;

  -- Inserir novo funil para o usuario atual
  INSERT INTO public.user_funnels (
    user_id,
    title,
    description,
    type,
    icon,
    steps
  ) VALUES (
    auth.uid(),
    ((v_token_data->'funnel_data'->>'title') || ' (Compartilhado)'),
    (v_token_data->'funnel_data'->>'description'),
    (v_token_data->'funnel_data'->>'type'),
    (v_token_data->'funnel_data'->>'icon'),
    COALESCE(v_token_data->'funnel_data'->'steps', '[]'::JSONB)
  ) RETURNING id INTO v_new_funnel_id;

  -- Registrar uso do token (copia)
  BEGIN
    INSERT INTO public.funnel_share_token_usage (
      token_id,
      used_by,
      action
    ) VALUES (
      (v_token_data->>'token_id')::UUID,
      auth.uid(),
      'copy'
    );
  EXCEPTION WHEN OTHERS THEN
    -- Ignorar erros de log
    NULL;
  END;

  RETURN jsonb_build_object(
    'success', true,
    'message', 'Funil copiado com sucesso',
    'funnel_id', v_new_funnel_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Conceder permissoes
GRANT EXECUTE ON FUNCTION validate_funnel_token TO authenticated;
GRANT EXECUTE ON FUNCTION copy_shared_funnel TO authenticated;
GRANT EXECUTE ON FUNCTION generate_simple_token TO authenticated;

-- Reinicializar a tabela de tokens se necessario
ALTER TABLE public.funnel_share_tokens ENABLE ROW LEVEL SECURITY; 