-- Corrigir problema de funis compartilhados vazios
-- Este script resolve o problema de funis que são compartilhados mas chegam vazios ao destinatário
-- Também inclui uma função de diagnóstico e reparo de funis vazios já existentes

-- 1. Melhorar a função de geração de token para incluir TODOS os passos
CREATE OR REPLACE FUNCTION generate_funnel_share_token(p_funnel_id UUID, p_days_valid INT DEFAULT 30)
RETURNS TEXT AS $$
DECLARE
  v_token TEXT;
  v_funnel_data JSONB;
  v_funnel_exists BOOLEAN;
  v_user_id UUID := auth.uid();
BEGIN
  RAISE NOTICE 'Gerando token para funil % pelo usuário %', p_funnel_id, v_user_id;
  
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
  
  -- Obter dados completos do funil
  SELECT jsonb_build_object(
    'id', uf.id,
    'title', uf.title,
    'description', uf.description,
    'type', uf.type,
    'icon', uf.icon,
    'steps', uf.steps,
    'created_at', uf.created_at
  ) INTO v_funnel_data
  FROM public.user_funnels uf
  WHERE uf.id = p_funnel_id;
  
  -- Verificar que obtemos os dados do funil e que os passos estão presentes
  IF v_funnel_data IS NULL THEN
    RAISE EXCEPTION 'Falha ao obter dados do funil %', p_funnel_id;
  END IF;
  
  -- Verificar se temos passos e registrar em log
  IF v_funnel_data->'steps' IS NULL THEN
    RAISE NOTICE 'Alerta: Funil não tem passos definidos!';
  ELSE
    RAISE NOTICE 'Funil tem % passos', jsonb_array_length(v_funnel_data->'steps');
  END IF;
  
  -- Inserir token na tabela com dados completos do funil
  INSERT INTO public.funnel_share_tokens (
    token,
    funnel_id,
    created_by,
    created_at,
    expires_at,
    funnel_data,
    is_active
  ) VALUES (
    v_token,
    p_funnel_id,
    v_user_id,
    now(),
    CASE WHEN p_days_valid IS NULL THEN NULL ELSE now() + (p_days_valid || ' days')::INTERVAL END,
    v_funnel_data,
    true
  );
  
  -- Verificar token gerado e retornar
  RETURN v_token;
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'Erro ao gerar token: %', SQLERRM;
    RAISE EXCEPTION 'Erro ao gerar token: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Melhorar a função de validação de token para verificar melhor os dados
CREATE OR REPLACE FUNCTION validate_funnel_token(p_token TEXT)
RETURNS JSONB AS $$
DECLARE
  v_token_record RECORD;
  v_token_data JSONB;
  v_original_funnel RECORD;
  v_steps_count INT := 0;
BEGIN
  -- Buscar o token
  SELECT * INTO v_token_record
  FROM public.funnel_share_tokens
  WHERE
    token = p_token AND
    is_active = true AND
    (expires_at IS NULL OR expires_at > now());

  IF v_token_record IS NULL THEN
    RETURN jsonb_build_object('valid', false, 'message', 'Token inválido ou expirado');
  END IF;
  
  -- Verificar se o token tem os dados do funil
  IF v_token_record.funnel_data IS NULL THEN
    -- Buscar os dados do funil original
    SELECT * INTO v_original_funnel
    FROM public.user_funnels
    WHERE id = v_token_record.funnel_id;
    
    IF v_original_funnel FOUND THEN
      -- Criar dados do funil a partir do original
      v_token_data := jsonb_build_object(
        'valid', true,
        'token_id', v_token_record.id,
        'funnel_id', v_token_record.funnel_id,
        'funnel_data', jsonb_build_object(
          'id', v_original_funnel.id,
          'title', v_original_funnel.title,
          'description', v_original_funnel.description,
          'type', v_original_funnel.type,
          'icon', v_original_funnel.icon,
          'steps', v_original_funnel.steps
        )
      );
      
      -- Atualizar o token com os dados do funil para próximas consultas
      UPDATE public.funnel_share_tokens
      SET funnel_data = v_token_data->'funnel_data'
      WHERE id = v_token_record.id;
    ELSE
      -- Funil original não encontrado
      v_token_data := jsonb_build_object(
        'valid', true,
        'token_id', v_token_record.id,
        'funnel_id', v_token_record.funnel_id,
        'funnel_data', jsonb_build_object(
          'title', 'Funil Compartilhado',
          'description', 'Funil compartilhado (original não encontrado)',
          'steps', '[]'::jsonb
        )
      );
    END IF;
  ELSE
    -- Usar dados do token
    v_token_data := jsonb_build_object(
      'valid', true,
      'token_id', v_token_record.id,
      'funnel_id', v_token_record.funnel_id,
      'funnel_data', v_token_record.funnel_data
    );
  END IF;
  
  -- Verificar se temos passos
  IF (v_token_data->'funnel_data'->'steps') IS NULL THEN
    -- Tentar buscar passos do original mesmo que já tenhamos dados parciais
    SELECT * INTO v_original_funnel
    FROM public.user_funnels
    WHERE id = v_token_record.funnel_id AND 
          steps IS NOT NULL AND 
          jsonb_array_length(steps) > 0;
    
    IF v_original_funnel FOUND THEN
      -- Adicionar passos do funil original
      v_token_data := jsonb_set(
        v_token_data, 
        '{funnel_data,steps}', 
        v_original_funnel.steps
      );
      
      -- Atualizar o token
      UPDATE public.funnel_share_tokens
      SET funnel_data = jsonb_set(funnel_data, '{steps}', v_original_funnel.steps)
      WHERE id = v_token_record.id;
    END IF;
  END IF;
  
  -- Registrar uso do token
  BEGIN
    INSERT INTO public.funnel_share_token_usage (
      token_id,
      used_by,
      action
    ) VALUES (
      v_token_record.id,
      auth.uid(),
      'view'
    );
  EXCEPTION WHEN OTHERS THEN
    -- Ignorar erros de log
    RAISE NOTICE 'Erro ao registrar uso do token: %', SQLERRM;
  END;
  
  RETURN v_token_data;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Função de diagnóstico para identificar funis vazios
CREATE OR REPLACE FUNCTION check_empty_funnels()
RETURNS TABLE (
  funnel_id UUID,
  title TEXT,
  is_shared BOOLEAN,
  steps_count INTEGER,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    f.id,
    f.title,
    f.title LIKE '%(Compartilhado)' AS is_shared,
    CASE
      WHEN f.steps IS NULL THEN 0
      ELSE jsonb_array_length(f.steps)
    END AS steps_count,
    f.created_at
  FROM user_funnels f
  WHERE
    (f.steps IS NULL OR jsonb_array_length(f.steps) = 0)
  ORDER BY 
    is_shared DESC,
    f.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Remover a função existente antes de criar a nova com tipo de retorno diferente
DROP FUNCTION IF EXISTS repair_shared_funnels();

-- 5. Função para reparar funis compartilhados vazios existentes
CREATE OR REPLACE FUNCTION repair_shared_funnels()
RETURNS JSONB AS $$
DECLARE
  v_funnel RECORD;
  v_original_funnel RECORD;
  v_token RECORD;
  v_repaired INTEGER := 0;
  v_failed INTEGER := 0;
BEGIN
  -- Procurar todos os funis compartilhados vazios
  FOR v_funnel IN 
    SELECT * 
    FROM user_funnels 
    WHERE 
      title LIKE '%(Compartilhado)' AND 
      (steps IS NULL OR jsonb_array_length(steps) = 0)
  LOOP
    RAISE NOTICE 'Analisando funil vazio: % (id=%)', v_funnel.title, v_funnel.id;
    
    -- Tentar encontrar um token correspondente
    SELECT * INTO v_token
    FROM funnel_share_tokens
    WHERE funnel_data->>'title' = REPLACE(v_funnel.title, ' (Compartilhado)', '')
    ORDER BY created_at DESC
    LIMIT 1;
    
    IF FOUND THEN
      -- Verificar se o token tem passos
      IF v_token.funnel_data->'steps' IS NOT NULL AND 
         jsonb_array_length(v_token.funnel_data->'steps') > 0 THEN
        
        -- Atualizar o funil com os passos do token
        UPDATE user_funnels
        SET steps = v_token.funnel_data->'steps'
        WHERE id = v_funnel.id;
        
        v_repaired := v_repaired + 1;
        RAISE NOTICE 'Funil % reparado com sucesso usando token', v_funnel.title;
        CONTINUE;
      END IF;
    END IF;
    
    -- Se não encontrou token ou o token não tinha passos, buscar pelo nome original
    SELECT * INTO v_original_funnel
    FROM user_funnels
    WHERE 
      title = REPLACE(v_funnel.title, ' (Compartilhado)', '') AND
      steps IS NOT NULL AND
      jsonb_array_length(steps) > 0
    LIMIT 1;
    
    IF FOUND THEN
      -- Atualizar o funil com os passos do original
      UPDATE user_funnels
      SET steps = v_original_funnel.steps
      WHERE id = v_funnel.id;
      
      v_repaired := v_repaired + 1;
      RAISE NOTICE 'Funil % reparado com sucesso usando funil original', v_funnel.title;
    ELSE
      v_failed := v_failed + 1;
      RAISE NOTICE 'Não foi possível reparar o funil %', v_funnel.title;
    END IF;
  END LOOP;
  
  RETURN jsonb_build_object(
    'reparados', v_repaired,
    'falhas', v_failed
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Conceder permissões para as funções
GRANT EXECUTE ON FUNCTION generate_funnel_share_token TO authenticated;
GRANT EXECUTE ON FUNCTION validate_funnel_token TO authenticated;
GRANT EXECUTE ON FUNCTION check_empty_funnels TO authenticated;
GRANT EXECUTE ON FUNCTION repair_shared_funnels TO authenticated;

-- 7. Executar reparo de funis compartilhados vazios
SELECT repair_shared_funnels(); 