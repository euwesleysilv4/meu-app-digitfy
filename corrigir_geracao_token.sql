-- Solução robusta para o problema de geração de token

-- 1. Primeiro, verificamos se a tabela de tokens existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM pg_tables
        WHERE schemaname = 'public' AND tablename = 'funnel_share_tokens'
    ) THEN
        RAISE EXCEPTION 'A tabela funnel_share_tokens não existe. Execute primeiro o script de criação de tabelas.';
    END IF;
END
$$;

-- 2. Verificamos a estrutura da tabela para garantir que está correta
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'funnel_share_tokens' AND column_name = 'token'
    ) THEN
        RAISE EXCEPTION 'A tabela funnel_share_tokens não tem a coluna token.';
    END IF;
END
$$;

-- 3. Redefinimos a função para torná-la mais robusta
CREATE OR REPLACE FUNCTION generate_funnel_share_token(p_funnel_id UUID, p_days_valid INT DEFAULT 30)
RETURNS TEXT AS $$
DECLARE
  v_token TEXT;
  v_funnel_data JSONB;
  v_funnel_exists BOOLEAN;
  v_user_id UUID;
BEGIN
  -- Obter o ID do usuário atual
  v_user_id := auth.uid();
  
  -- Garantir que temos um usuário autenticado
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Usuário não autenticado';
  END IF;

  -- Verificar se o funil existe e pertence ao usuário autenticado
  SELECT EXISTS (
    SELECT 1 FROM public.user_funnels
    WHERE id = p_funnel_id AND user_id = v_user_id
  ) INTO v_funnel_exists;
  
  IF NOT v_funnel_exists THEN
    RAISE EXCEPTION 'Funil não existe ou não pertence ao usuário autenticado: % / %', p_funnel_id, v_user_id;
  END IF;
  
  -- Gerar token simples e fácil de compartilhar (16 caracteres alfanuméricos)
  v_token := substr(md5(random()::text || clock_timestamp()::text), 1, 16);
  
  -- Verificar que geramos um token válido
  IF v_token IS NULL OR v_token = '' THEN
    RAISE EXCEPTION 'Falha ao gerar token';
  END IF;
  
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
  
  -- Verificar que obtemos os dados do funil
  IF v_funnel_data IS NULL THEN
    RAISE EXCEPTION 'Falha ao obter dados do funil %', p_funnel_id;
  END IF;
  
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
    v_user_id,
    CASE WHEN p_days_valid IS NULL THEN NULL ELSE now() + (p_days_valid || ' days')::INTERVAL END,
    v_funnel_data
  );
  
  -- Verificar token gerado e retornar
  RETURN v_token;
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'Erro ao gerar token: %', SQLERRM;
    RAISE EXCEPTION 'Erro ao gerar token: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Teste de função para verificar se está funcionando
DO $$
DECLARE
  v_count INT;
BEGIN
  -- Verificar se temos funis criados
  SELECT COUNT(*) INTO v_count FROM public.user_funnels;
  
  RAISE NOTICE 'Número de funis disponíveis: %', v_count;
  
  -- Verificar se temos tokens compartilhados
  SELECT COUNT(*) INTO v_count FROM public.funnel_share_tokens;
  
  RAISE NOTICE 'Número de tokens existentes: %', v_count;
END
$$; 