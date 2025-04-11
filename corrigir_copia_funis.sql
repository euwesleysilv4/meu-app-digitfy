-- Corrigir problema de funis compartilhados chegando vazios
-- Este script corrige o problema específico da cópia de funis compartilhados

-- 1. Corrigir a função copy_shared_funnel para garantir que os passos são preservados
CREATE OR REPLACE FUNCTION copy_shared_funnel(p_token TEXT)
RETURNS JSONB AS $$
DECLARE
  v_token_record RECORD;
  v_new_funnel_id UUID;
  v_funnel_steps JSONB;
  v_original_funnel RECORD;
  v_title TEXT;
  v_description TEXT;
  v_type TEXT;
  v_icon TEXT;
  v_debug JSONB;
BEGIN
  RAISE NOTICE 'Iniciando cópia de funil compartilhado com token: %', p_token;
  
  -- Buscar dados do token diretamente para ter certeza que temos todos os dados
  SELECT * INTO v_token_record
  FROM funnel_share_tokens
  WHERE token = p_token
  AND is_active = true
  AND (expires_at IS NULL OR expires_at > now());
  
  -- Verificar se o token existe e está válido
  IF v_token_record IS NULL THEN
    RAISE NOTICE 'Token inválido ou expirado: %', p_token;
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Token inválido ou expirado'
    );
  END IF;
  
  -- Registrar informações do token para debug
  v_debug := jsonb_build_object(
    'token_id', v_token_record.id,
    'funnel_id', v_token_record.funnel_id,
    'has_funnel_data', v_token_record.funnel_data IS NOT NULL,
    'token', p_token
  );
  
  RAISE NOTICE 'Token encontrado: %', v_debug;
  
  -- Primeiro verificamos se o token tem os dados completos do funil
  IF v_token_record.funnel_data IS NULL OR 
     v_token_record.funnel_data->'steps' IS NULL OR 
     jsonb_array_length(v_token_record.funnel_data->'steps') = 0 THEN
    
    RAISE NOTICE 'Token não tem dados completos do funil, buscando do original';
    
    -- O token não tem os passos do funil, então buscamos do funil original
    SELECT * INTO v_original_funnel
    FROM user_funnels
    WHERE id = v_token_record.funnel_id;
    
    IF v_original_funnel FOUND THEN
      -- Usar os passos do funil original
      v_funnel_steps := v_original_funnel.steps;
      
      -- Atualizar o token com os dados do funil para futuras cópias
      UPDATE funnel_share_tokens
      SET funnel_data = jsonb_build_object(
        'id', v_original_funnel.id,
        'title', v_original_funnel.title,
        'description', v_original_funnel.description,
        'type', COALESCE(v_original_funnel.type, 'sales'),
        'icon', COALESCE(v_original_funnel.icon, 'ShoppingCart'),
        'steps', v_original_funnel.steps
      )
      WHERE id = v_token_record.id;
      
      RAISE NOTICE 'Usando passos do funil original - encontrados % passos', 
          jsonb_array_length(v_funnel_steps);
    ELSE
      -- Funil original não encontrado, criar array vazio
      v_funnel_steps := '[]'::JSONB;
      RAISE NOTICE 'Funil original não encontrado, criando array vazio de passos';
    END IF;
  ELSE
    -- Usar os passos que já estão no token
    v_funnel_steps := v_token_record.funnel_data->'steps';
    RAISE NOTICE 'Usando passos do token - encontrados % passos', 
        jsonb_array_length(v_funnel_steps);
  END IF;
  
  -- Verificar e corrigir os passos encontrados
  IF jsonb_array_length(v_funnel_steps) > 0 THEN
    -- Processar cada elemento para garantir dados completos
    FOR i IN 0..jsonb_array_length(v_funnel_steps) - 1 LOOP
      -- Garantir que o tipo está definido
      IF v_funnel_steps->i->>'tipo' IS NULL OR v_funnel_steps->i->>'tipo' = '' THEN
        v_funnel_steps := jsonb_set(v_funnel_steps, ARRAY[i::text, 'tipo'], '"social"'::jsonb);
        RAISE NOTICE 'Passo %: tipo definido como "social"', i+1;
      END IF;
      
      -- Garantir que o iconType está definido
      IF v_funnel_steps->i->>'iconType' IS NULL OR v_funnel_steps->i->>'iconType' = '' THEN
        -- Determinar o ícone com base no nome ou URL
        DECLARE
          v_element_name TEXT := LOWER(COALESCE(v_funnel_steps->i->>'name', ''));
          v_element_url TEXT := LOWER(COALESCE(v_funnel_steps->i->>'url', ''));
          v_tipo TEXT := LOWER(COALESCE(v_funnel_steps->i->>'tipo', 'social'));
          v_icon_type TEXT := 'FileText'; -- ícone padrão
        BEGIN
          IF v_element_name LIKE '%whatsapp%' OR v_element_url LIKE '%whatsapp%' THEN
            v_icon_type := 'WhatsApp';
          ELSIF v_element_name LIKE '%tiktok%' OR v_element_url LIKE '%tiktok%' THEN
            v_icon_type := 'TikTok';
          ELSIF v_element_name LIKE '%youtube%' OR v_element_url LIKE '%youtube%' THEN
            v_icon_type := 'Youtube';
          ELSIF v_element_name LIKE '%instagram%' OR v_element_url LIKE '%instagram%' THEN
            v_icon_type := 'Instagram';
          ELSIF v_element_name LIKE '%linkedin%' OR v_element_url LIKE '%linkedin%' THEN
            v_icon_type := 'Linkedin';
          ELSIF v_element_name LIKE '%facebook%' OR v_element_url LIKE '%facebook%' THEN
            v_icon_type := 'Facebook';
          ELSIF v_element_name LIKE '%telegram%' OR v_element_url LIKE '%telegram%' THEN
            v_icon_type := 'Send';
          ELSIF v_tipo = 'social' THEN
            v_icon_type := 'Share2';
          ELSIF v_tipo = 'link' THEN
            v_icon_type := 'Link';
          ELSIF v_tipo = 'venda' OR v_tipo = 'vendas' THEN
            v_icon_type := 'ShoppingCart';
          ELSIF v_tipo = 'contato' THEN
            v_icon_type := 'PhoneCall';
          END IF;
          
          v_funnel_steps := jsonb_set(v_funnel_steps, ARRAY[i::text, 'iconType'], to_jsonb(v_icon_type));
          RAISE NOTICE 'Passo %: iconType definido como "%"', i+1, v_icon_type;
        END;
      END IF;
      
      -- Garantir que o id é válido
      IF v_funnel_steps->i->>'id' IS NULL THEN
        v_funnel_steps := jsonb_set(v_funnel_steps, ARRAY[i::text, 'id'], to_jsonb(gen_random_uuid()::text));
        RAISE NOTICE 'Passo %: gerado novo ID', i+1;
      END IF;
    END LOOP;
  END IF;
  
  -- Obter título, tipo e ícone para o novo funil
  IF v_token_record.funnel_data IS NOT NULL AND (v_token_record.funnel_data->>'title') IS NOT NULL THEN
    -- Obter do token
    v_title := v_token_record.funnel_data->>'title';
    v_description := COALESCE(v_token_record.funnel_data->>'description', 'Funil compartilhado');
    v_type := COALESCE(v_token_record.funnel_data->>'type', 'sales');
    v_icon := COALESCE(v_token_record.funnel_data->>'icon', 'ShoppingCart');
  ELSIF v_original_funnel FOUND THEN
    -- Obter do funil original
    v_title := v_original_funnel.title;
    v_description := COALESCE(v_original_funnel.description, 'Funil compartilhado');
    v_type := COALESCE(v_original_funnel.type, 'sales');
    v_icon := COALESCE(v_original_funnel.icon, 'ShoppingCart');
  ELSE
    -- Valores padrão
    v_title := 'Funil Compartilhado';
    v_description := 'Funil compartilhado sem título';
    v_type := 'sales';
    v_icon := 'ShoppingCart';
  END IF;
  
  RAISE NOTICE 'Criando novo funil com título: %, passos: %', 
      v_title, jsonb_array_length(v_funnel_steps);
  
  -- Inserir o novo funil para o usuário atual
  INSERT INTO public.user_funnels (
    user_id,
    title,
    description,
    type,
    icon,
    steps,
    created_at,
    updated_at
  ) VALUES (
    auth.uid(),
    (v_title || ' (Compartilhado)'),
    v_description,
    v_type,
    v_icon,
    v_funnel_steps,
    now(),
    now()
  ) RETURNING id INTO v_new_funnel_id;
  
  -- Verificar se o funil foi criado
  IF v_new_funnel_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Erro ao criar o funil'
    );
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
      'copy'
    );
  EXCEPTION WHEN OTHERS THEN
    -- Ignorar erros de log
    RAISE NOTICE 'Erro ao registrar uso do token: %', SQLERRM;
  END;
  
  -- Verificar o funil criado
  DECLARE
    v_created_steps_count INTEGER;
  BEGIN
    SELECT jsonb_array_length(steps) INTO v_created_steps_count
    FROM user_funnels
    WHERE id = v_new_funnel_id;
    
    RAISE NOTICE 'Funil criado com sucesso: id=%, passos=%', 
      v_new_funnel_id, v_created_steps_count;
      
    IF v_created_steps_count = 0 AND jsonb_array_length(v_funnel_steps) > 0 THEN
      RAISE NOTICE 'ALERTA: Funil criado com 0 passos, mas array original tinha % passos!', 
        jsonb_array_length(v_funnel_steps);
        
      -- Tentar corrigir o funil recém-criado
      UPDATE user_funnels
      SET steps = v_funnel_steps
      WHERE id = v_new_funnel_id;
    END IF;
  END;
  
  -- Retornar sucesso com ID do novo funil
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Funil copiado com sucesso',
    'funnel_id', v_new_funnel_id,
    'steps_count', jsonb_array_length(v_funnel_steps)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Corrigir a função de validação de token para reforçar a obtenção dos passos
CREATE OR REPLACE FUNCTION validate_funnel_token(p_token TEXT)
RETURNS JSONB AS $$
DECLARE
  v_token_record RECORD;
  v_funnel_data JSONB;
  v_original_funnel RECORD;
BEGIN
  -- Buscar token
  SELECT * INTO v_token_record
  FROM funnel_share_tokens
  WHERE 
    token = p_token AND
    is_active = true AND
    (expires_at IS NULL OR expires_at > now());
  
  IF v_token_record IS NULL THEN
    RETURN jsonb_build_object(
      'valid', false,
      'message', 'Token inválido ou expirado'
    );
  END IF;
  
  -- Verificar e corrigir dados do funil
  IF v_token_record.funnel_data IS NULL OR
     v_token_record.funnel_data->'steps' IS NULL OR
     jsonb_array_length(v_token_record.funnel_data->'steps') = 0 THEN
    
    -- Buscar do funil original
    SELECT * INTO v_original_funnel
    FROM user_funnels
    WHERE id = v_token_record.funnel_id;
    
    IF v_original_funnel FOUND AND
       v_original_funnel.steps IS NOT NULL AND
       jsonb_array_length(v_original_funnel.steps) > 0 THEN
       
      -- Construir dados completos
      v_funnel_data := jsonb_build_object(
        'id', v_original_funnel.id,
        'title', v_original_funnel.title,
        'description', COALESCE(v_original_funnel.description, ''),
        'type', COALESCE(v_original_funnel.type, 'sales'),
        'icon', COALESCE(v_original_funnel.icon, 'ShoppingCart'),
        'steps', v_original_funnel.steps
      );
      
      -- Atualizar o token para futuras consultas
      UPDATE funnel_share_tokens
      SET funnel_data = v_funnel_data
      WHERE id = v_token_record.id;
      
      RETURN jsonb_build_object(
        'valid', true,
        'token_id', v_token_record.id,
        'funnel_id', v_token_record.funnel_id,
        'funnel_data', v_funnel_data
      );
    ELSE
      -- Funil original não encontrado ou sem passos
      RETURN jsonb_build_object(
        'valid', true,
        'token_id', v_token_record.id,
        'funnel_id', v_token_record.funnel_id,
        'funnel_data', COALESCE(v_token_record.funnel_data, '{}'::jsonb),
        'warning', 'Dados originais do funil não estão disponíveis'
      );
    END IF;
  ELSE
    -- Usar dados já presentes no token
    RETURN jsonb_build_object(
      'valid', true,
      'token_id', v_token_record.id,
      'funnel_id', v_token_record.funnel_id,
      'funnel_data', v_token_record.funnel_data
    );
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Consertar os tokens existentes que não tenham dados completos
DO $$
DECLARE
  v_token RECORD;
  v_original_funnel RECORD;
  v_fixed_count INTEGER := 0;
BEGIN
  FOR v_token IN 
    SELECT * FROM funnel_share_tokens
    WHERE 
      funnel_data IS NULL OR
      funnel_data->'steps' IS NULL OR
      jsonb_array_length(funnel_data->'steps') = 0
  LOOP
    -- Buscar funil original
    SELECT * INTO v_original_funnel
    FROM user_funnels
    WHERE id = v_token.funnel_id;
    
    IF v_original_funnel FOUND AND
       v_original_funnel.steps IS NOT NULL AND
       jsonb_array_length(v_original_funnel.steps) > 0 THEN
      
      -- Atualizar o token
      UPDATE funnel_share_tokens
      SET funnel_data = jsonb_build_object(
        'id', v_original_funnel.id,
        'title', v_original_funnel.title,
        'description', COALESCE(v_original_funnel.description, ''),
        'type', COALESCE(v_original_funnel.type, 'sales'),
        'icon', COALESCE(v_original_funnel.icon, 'ShoppingCart'),
        'steps', v_original_funnel.steps
      )
      WHERE id = v_token.id;
      
      v_fixed_count := v_fixed_count + 1;
      RAISE NOTICE 'Token % corrigido com dados do funil original', v_token.token;
    END IF;
  END LOOP;
  
  RAISE NOTICE 'Total de tokens corrigidos: %', v_fixed_count;
END;
$$;

-- 4. Conceder permissões
GRANT EXECUTE ON FUNCTION copy_shared_funnel TO authenticated;
GRANT EXECUTE ON FUNCTION validate_funnel_token TO authenticated; 