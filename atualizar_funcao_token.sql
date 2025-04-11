-- Atualizar a função de geração de token para corrigir problemas
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
  
  -- Gerar token único (utilizando token menor para facilitar compartilhamento)
  v_token := encode(gen_random_bytes(16), 'hex');
  
  -- Registrar log para depuração
  RAISE NOTICE 'Token gerado: %', v_token;
  
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
  
  -- Retornar o token gerado
  RETURN v_token;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Erro ao gerar token: %', SQLERRM;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 