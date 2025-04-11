-- Tabela para armazenar os tokens de compartilhamento de funis
CREATE TABLE IF NOT EXISTS public.funnel_share_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token TEXT UNIQUE NOT NULL,
  funnel_id UUID NOT NULL REFERENCES public.user_funnels(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  funnel_data JSONB NOT NULL, -- Dados do funil no momento da criação do token
  CONSTRAINT fk_funnel FOREIGN KEY (funnel_id) REFERENCES public.user_funnels(id) ON DELETE CASCADE,
  CONSTRAINT fk_user FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_funnel_share_tokens_token ON public.funnel_share_tokens(token);
CREATE INDEX IF NOT EXISTS idx_funnel_share_tokens_funnel_id ON public.funnel_share_tokens(funnel_id);
CREATE INDEX IF NOT EXISTS idx_funnel_share_tokens_created_by ON public.funnel_share_tokens(created_by);

-- Habilitar Row Level Security
ALTER TABLE public.funnel_share_tokens ENABLE ROW LEVEL SECURITY;

-- Criar políticas de segurança
-- Usuários podem ver apenas tokens que eles criaram
CREATE POLICY "Users can view their own share tokens" 
  ON public.funnel_share_tokens 
  FOR SELECT 
  USING (auth.uid() = created_by);

-- Usuários podem criar tokens para seus próprios funis
CREATE POLICY "Users can insert share tokens for their funnels" 
  ON public.funnel_share_tokens 
  FOR INSERT 
  WITH CHECK (
    auth.uid() = created_by AND 
    EXISTS (
      SELECT 1 FROM public.user_funnels
      WHERE id = funnel_id AND user_id = auth.uid()
    )
  );

-- Usuários podem atualizar apenas seus próprios tokens
CREATE POLICY "Users can update their own share tokens" 
  ON public.funnel_share_tokens 
  FOR UPDATE 
  USING (auth.uid() = created_by);

-- Usuários podem deletar apenas seus próprios tokens
CREATE POLICY "Users can delete their own share tokens" 
  ON public.funnel_share_tokens 
  FOR DELETE 
  USING (auth.uid() = created_by);

-- Tabela para log de uso dos tokens de compartilhamento
CREATE TABLE IF NOT EXISTS public.funnel_share_token_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token_id UUID NOT NULL REFERENCES public.funnel_share_tokens(id) ON DELETE CASCADE,
  used_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  used_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  action TEXT NOT NULL, -- 'view', 'copy', etc.
  CONSTRAINT fk_token FOREIGN KEY (token_id) REFERENCES public.funnel_share_tokens(id) ON DELETE CASCADE,
  CONSTRAINT fk_user FOREIGN KEY (used_by) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_funnel_share_token_usage_token_id ON public.funnel_share_token_usage(token_id);
CREATE INDEX IF NOT EXISTS idx_funnel_share_token_usage_used_by ON public.funnel_share_token_usage(used_by);

-- Habilitar Row Level Security
ALTER TABLE public.funnel_share_token_usage ENABLE ROW LEVEL SECURITY;

-- Criar políticas de segurança
-- Usuários podem ver logs de uso apenas dos seus próprios tokens
CREATE POLICY "Users can view usage logs of their tokens" 
  ON public.funnel_share_token_usage 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.funnel_share_tokens
      WHERE id = token_id AND created_by = auth.uid()
    )
  );

-- Qualquer usuário autenticado pode inserir registros de uso
CREATE POLICY "Users can log token usage" 
  ON public.funnel_share_token_usage 
  FOR INSERT 
  WITH CHECK (auth.uid() = used_by);

-- Função para gerar token de compartilhamento
CREATE OR REPLACE FUNCTION generate_funnel_share_token(p_funnel_id UUID, p_days_valid INT DEFAULT 30)
RETURNS TEXT AS $$
DECLARE
  v_token TEXT;
  v_funnel_data JSONB;
  v_funnel_exists BOOLEAN;
BEGIN
  -- Verificar se o funil existe e pertence ao usuário autenticado
  SELECT EXISTS (
    SELECT 1 FROM public.user_funnels
    WHERE id = p_funnel_id AND user_id = auth.uid()
  ) INTO v_funnel_exists;
  
  IF NOT v_funnel_exists THEN
    RAISE EXCEPTION 'Funil não existe ou não pertence ao usuário autenticado';
  END IF;
  
  -- Gerar token único
  v_token := encode(gen_random_bytes(16), 'hex');
  
  -- Obter dados do funil
  SELECT jsonb_build_object(
    'id', uf.id,
    'title', uf.title,
    'description', uf.description,
    'type', uf.type,
    'icon', uf.icon,
    'steps', uf.steps
  ) INTO v_funnel_data
  FROM public.user_funnels uf
  WHERE uf.id = p_funnel_id;
  
  -- Inserir token na tabela
  INSERT INTO public.funnel_share_tokens (
    token,
    funnel_id,
    created_by,
    expires_at,
    funnel_data
  ) VALUES (
    v_token,
    p_funnel_id,
    auth.uid(),
    CASE WHEN p_days_valid IS NULL THEN NULL ELSE now() + (p_days_valid || ' days')::INTERVAL END,
    v_funnel_data
  );
  
  -- Retornar o token gerado (garante que o retorno seja não nulo)
  RETURN v_token;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Erro ao gerar token: %', SQLERRM;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para validar e obter dados de um token de compartilhamento
CREATE OR REPLACE FUNCTION validate_funnel_share_token(p_token TEXT)
RETURNS JSONB AS $$
DECLARE
  v_token_data JSONB;
  v_token_id UUID;
BEGIN
  -- Verificar se o token existe e está ativo
  SELECT 
    id,
    jsonb_build_object(
      'token_id', id,
      'funnel_id', funnel_id,
      'created_by', created_by,
      'created_at', created_at,
      'expires_at', expires_at,
      'funnel_data', funnel_data
    ) INTO v_token_id, v_token_data
  FROM public.funnel_share_tokens
  WHERE 
    token = p_token AND 
    is_active = true AND
    (expires_at IS NULL OR expires_at > now());
  
  IF v_token_data IS NULL THEN
    RETURN jsonb_build_object('valid', false, 'message', 'Token inválido ou expirado');
  END IF;
  
  -- Registrar uso do token
  INSERT INTO public.funnel_share_token_usage (
    token_id,
    used_by,
    action
  ) VALUES (
    v_token_id,
    auth.uid(),
    'view'
  );
  
  RETURN jsonb_build_object('valid', true, 'data', v_token_data);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para copiar um funil compartilhado via token para a conta do usuário
CREATE OR REPLACE FUNCTION copy_shared_funnel(p_token TEXT)
RETURNS JSONB AS $$
DECLARE
  v_token_data JSONB;
  v_funnel_data JSONB;
  v_new_funnel_id UUID;
  v_token_id UUID;
BEGIN
  -- Validar o token
  SELECT 
    id,
    funnel_data INTO v_token_id, v_funnel_data
  FROM public.funnel_share_tokens
  WHERE 
    token = p_token AND 
    is_active = true AND
    (expires_at IS NULL OR expires_at > now());
  
  IF v_funnel_data IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'Token inválido ou expirado');
  END IF;
  
  -- Criar novo funil para o usuário atual
  INSERT INTO public.user_funnels (
    user_id,
    title,
    description,
    type,
    icon,
    steps
  ) VALUES (
    auth.uid(),
    (v_funnel_data->>'title') || ' (Compartilhado)',
    v_funnel_data->>'description',
    v_funnel_data->>'type',
    v_funnel_data->>'icon',
    v_funnel_data->'steps'
  ) RETURNING id INTO v_new_funnel_id;
  
  -- Registrar uso do token
  INSERT INTO public.funnel_share_token_usage (
    token_id,
    used_by,
    action
  ) VALUES (
    v_token_id,
    auth.uid(),
    'copy'
  );
  
  RETURN jsonb_build_object(
    'success', true, 
    'message', 'Funil copiado com sucesso',
    'funnel_id', v_new_funnel_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 