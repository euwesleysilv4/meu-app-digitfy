-- Corrigir problema de funis compartilhados vazios
-- Esta função garante que os passos do funil sejam preservados durante o compartilhamento

-- 1. Corrigir a função de cópia de funil para garantir a preservação dos passos
CREATE OR REPLACE FUNCTION copy_shared_funnel(p_token TEXT)
RETURNS JSONB AS $$
DECLARE
  v_token_data JSONB;
  v_new_funnel_id UUID;
  v_funnel_steps JSONB;
  v_token_record RECORD;
  v_original_funnel RECORD;
BEGIN
  -- Buscar dados do token diretamente para ter certeza que temos todos os dados
  SELECT * INTO v_token_record
  FROM funnel_share_tokens
  WHERE token = p_token
  AND is_active = true
  AND (expires_at IS NULL OR expires_at > now());
  
  -- Verificar se o token existe e está válido
  IF v_token_record IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Token inválido ou expirado'
    );
  END IF;
  
  RAISE NOTICE 'Token encontrado: id=%, funnel_id=%', v_token_record.id, v_token_record.funnel_id;
  
  -- Primeiro verificamos se o token tem os dados completos do funil
  IF v_token_record.funnel_data IS NULL OR 
     v_token_record.funnel_data->'steps' IS NULL OR 
     jsonb_array_length(v_token_record.funnel_data->'steps') = 0 THEN
    
    -- O token não tem os passos do funil, então buscamos do funil original
    SELECT * INTO v_original_funnel
    FROM user_funnels
    WHERE id = v_token_record.funnel_id;
    
    IF v_original_funnel FOUND THEN
      -- Usar os passos do funil original
      v_funnel_steps := v_original_funnel.steps;
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
  DECLARE
    v_title TEXT;
    v_description TEXT;
    v_type TEXT;
    v_icon TEXT;
  BEGIN
    -- Verificar de onde obter os metadados do funil
    IF v_token_record.funnel_data IS NOT NULL AND (v_token_record.funnel_data->>'title') IS NOT NULL THEN
      -- Obter do token
      v_title := v_token_record.funnel_data->>'title';
      v_description := COALESCE(v_token_record.funnel_data->>'description', 'Funil compartilhado');
      v_type := COALESCE(v_token_record.funnel_data->>'type', 'sales');
      v_icon := COALESCE(v_token_record.funnel_data->>'icon', 'ShoppingCart');
    ELSIF v_original_funnel.id IS NOT NULL THEN
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
  END;
  
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
    END IF;
  END;
  
  -- Retornar sucesso com ID do novo funil
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Funil copiado com sucesso',
    'funnel_id', v_new_funnel_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Função para atualizar um funil compartilhado que veio vazio
CREATE OR REPLACE FUNCTION fix_empty_shared_funnel(p_funnel_id UUID, p_token TEXT)
RETURNS JSONB AS $$
DECLARE
  v_token_record RECORD;
  v_original_funnel RECORD;
  v_funnel_steps JSONB;
  v_updated BOOLEAN := false;
BEGIN
  -- Verificar se o funil existe e está vazio
  DECLARE
    v_funnel RECORD;
  BEGIN
    SELECT * INTO v_funnel
    FROM user_funnels
    WHERE id = p_funnel_id;
    
    IF v_funnel IS NULL THEN
      RETURN jsonb_build_object(
        'success', false,
        'message', 'Funil não encontrado'
      );
    END IF;
    
    IF v_funnel.steps IS NOT NULL AND jsonb_array_length(v_funnel.steps) > 0 THEN
      RETURN jsonb_build_object(
        'success', true,
        'message', 'Funil já possui elementos',
        'steps_count', jsonb_array_length(v_funnel.steps)
      );
    END IF;
  END;
  
  -- Buscar dados do token
  IF p_token IS NOT NULL THEN
    SELECT * INTO v_token_record
    FROM funnel_share_tokens
    WHERE token = p_token;
    
    IF v_token_record FOUND THEN
      -- Token encontrado, verificar se tem dados
      IF v_token_record.funnel_data IS NOT NULL AND 
         v_token_record.funnel_data->'steps' IS NOT NULL AND 
         jsonb_array_length(v_token_record.funnel_data->'steps') > 0 THEN
        -- Usar os passos do token
        v_funnel_steps := v_token_record.funnel_data->'steps';
        v_updated := true;
        RAISE NOTICE 'Usando passos do token - encontrados % passos', 
            jsonb_array_length(v_funnel_steps);
      ELSE
        -- Token encontrado, mas sem passos, buscar do funil original
        SELECT * INTO v_original_funnel
        FROM user_funnels
        WHERE id = v_token_record.funnel_id;
        
        IF v_original_funnel FOUND THEN
          -- Verificar se o funil original tem passos
          IF v_original_funnel.steps IS NOT NULL AND 
             jsonb_array_length(v_original_funnel.steps) > 0 THEN
            -- Usar os passos do funil original
            v_funnel_steps := v_original_funnel.steps;
            v_updated := true;
            RAISE NOTICE 'Usando passos do funil original - encontrados % passos', 
                jsonb_array_length(v_funnel_steps);
          END IF;
        END IF;
      END IF;
    END IF;
  END IF;
  
  -- Se não encontrou pelo token, tentar buscar pelo título
  IF NOT v_updated THEN
    DECLARE
      v_base_title TEXT;
      v_matching_funnel RECORD;
    BEGIN
      -- Extrair o título base sem "(Compartilhado)"
      SELECT REPLACE(title, ' (Compartilhado)', '') INTO v_base_title
      FROM user_funnels
      WHERE id = p_funnel_id;
      
      -- Buscar funil original pelo título
      SELECT * INTO v_matching_funnel
      FROM user_funnels
      WHERE 
        title = v_base_title AND 
        steps IS NOT NULL AND 
        jsonb_array_length(steps) > 0
      ORDER BY created_at DESC
      LIMIT 1;
      
      IF v_matching_funnel FOUND THEN
        v_funnel_steps := v_matching_funnel.steps;
        v_updated := true;
        RAISE NOTICE 'Usando passos de outro funil com mesmo título - encontrados % passos', 
            jsonb_array_length(v_funnel_steps);
      END IF;
    END;
  END IF;
  
  -- Se encontrou passos, atualizar o funil
  IF v_updated AND v_funnel_steps IS NOT NULL AND jsonb_array_length(v_funnel_steps) > 0 THEN
    -- Processar os passos para garantir conformidade
    FOR i IN 0..jsonb_array_length(v_funnel_steps) - 1 LOOP
      -- Garantir que o tipo está definido
      IF v_funnel_steps->i->>'tipo' IS NULL OR v_funnel_steps->i->>'tipo' = '' THEN
        v_funnel_steps := jsonb_set(v_funnel_steps, ARRAY[i::text, 'tipo'], '"social"'::jsonb);
      END IF;
      
      -- Garantir que o iconType está definido
      IF v_funnel_steps->i->>'iconType' IS NULL OR v_funnel_steps->i->>'iconType' = '' THEN
        DECLARE
          v_element_name TEXT := LOWER(COALESCE(v_funnel_steps->i->>'name', ''));
          v_element_url TEXT := LOWER(COALESCE(v_funnel_steps->i->>'url', ''));
          v_tipo TEXT := LOWER(COALESCE(v_funnel_steps->i->>'tipo', 'social'));
          v_icon_type TEXT := 'FileText';
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
        END;
      END IF;
      
      -- Garantir que o id está definido
      IF v_funnel_steps->i->>'id' IS NULL THEN
        v_funnel_steps := jsonb_set(v_funnel_steps, ARRAY[i::text, 'id'], to_jsonb(gen_random_uuid()::text));
      END IF;
    END LOOP;
    
    -- Atualizar o funil com os passos recuperados
    UPDATE user_funnels
    SET 
      steps = v_funnel_steps,
      updated_at = now()
    WHERE id = p_funnel_id;
    
    RETURN jsonb_build_object(
      'success', true,
      'message', 'Funil atualizado com sucesso',
      'steps_count', jsonb_array_length(v_funnel_steps)
    );
  ELSE
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Não foi possível encontrar passos para este funil'
    );
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Verificador de consistência para todos os funis compartilhados
CREATE OR REPLACE FUNCTION check_shared_funnels_consistency()
RETURNS TABLE (
  funnel_id UUID,
  title TEXT,
  is_shared BOOLEAN,
  steps_count INTEGER,
  needs_repair BOOLEAN
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
    CASE
      WHEN f.title LIKE '%(Compartilhado)' AND 
           (f.steps IS NULL OR jsonb_array_length(f.steps) = 0)
      THEN true
      ELSE false
    END AS needs_repair
  FROM user_funnels f
  ORDER BY 
    needs_repair DESC,
    is_shared DESC,
    steps_count ASC,
    f.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Conceder permissões para as funções
GRANT EXECUTE ON FUNCTION copy_shared_funnel TO authenticated;
GRANT EXECUTE ON FUNCTION fix_empty_shared_funnel TO authenticated;
GRANT EXECUTE ON FUNCTION check_shared_funnels_consistency TO authenticated; 