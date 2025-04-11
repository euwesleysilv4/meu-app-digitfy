-- Script para corrigir a preservação dos icones durante o compartilhamento e salvamento
-- Este script modifica as funções de compartilhamento e cópia de funis para preservar os iconTypes

-- 1. Modificar a função copy_shared_funnel para garantir que iconType seja preservado
CREATE OR REPLACE FUNCTION copy_shared_funnel(p_token TEXT)
RETURNS JSONB AS $$
DECLARE
  v_token_data JSONB;
  v_new_funnel_id UUID;
  v_funnel_steps JSONB;
BEGIN
  -- Primeiro, validar o token
  v_token_data := validate_funnel_token(p_token);
  
  IF NOT (v_token_data->>'valid')::BOOLEAN THEN
    RETURN v_token_data;
  END IF;

  -- Verificar se há dados do funil
  IF v_token_data->'funnel_data' IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Dados do funil não encontrados no token'
    );
  END IF;

  -- Verificar se há elementos do funil e garantir que os tipos estejam definidos
  v_funnel_steps := v_token_data->'funnel_data'->'steps';
  
  IF v_funnel_steps IS NULL THEN
    v_funnel_steps := '[]'::JSONB;
    RAISE NOTICE 'Passos do funil ausentes, criando array vazio';
  ELSIF jsonb_array_length(v_funnel_steps) = 0 THEN
    RAISE NOTICE 'Passos do funil vazios: %', v_token_data->'funnel_data';
  ELSE
    -- Verificar e corrigir cada elemento
    FOR i IN 0..jsonb_array_length(v_funnel_steps) - 1 LOOP
      -- Verificar se tipo está definido
      IF v_funnel_steps->i->>'tipo' IS NULL OR v_funnel_steps->i->>'tipo' = '' THEN
        v_funnel_steps := jsonb_set(v_funnel_steps, ARRAY[i::text, 'tipo'], '"social"'::jsonb);
      END IF;
      
      -- Verificar se iconType está definido
      IF v_funnel_steps->i->>'iconType' IS NULL OR v_funnel_steps->i->>'iconType' = '' THEN
        -- Determinar o ícone com base no nome ou URL
        DECLARE
          v_element_name TEXT := LOWER(COALESCE(v_funnel_steps->i->>'name', ''));
          v_element_url TEXT := LOWER(COALESCE(v_funnel_steps->i->>'url', ''));
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
          END IF;
          
          v_funnel_steps := jsonb_set(v_funnel_steps, ARRAY[i::text, 'iconType'], to_jsonb(v_icon_type));
        END;
      END IF;
      
      -- Garantir que o iconType não é perdido no processo de cópia (preservar explicitamente)
      DECLARE 
        v_existing_icon_type TEXT := v_funnel_steps->i->>'iconType';
      BEGIN
        IF v_existing_icon_type IS NOT NULL AND v_existing_icon_type <> '' THEN
          -- Reforçar o iconType existente para garantir que não seja perdido
          v_funnel_steps := jsonb_set(v_funnel_steps, ARRAY[i::text, 'iconType'], to_jsonb(v_existing_icon_type));
          RAISE NOTICE 'Preservando iconType % para elemento %', v_existing_icon_type, v_funnel_steps->i->>'name';
        END IF;
      END;
    END LOOP;
  END IF;
  
  -- Criar log para verificar os dados finais
  RAISE NOTICE 'Passos do funil preparados para cópia:';
  FOR i IN 0..jsonb_array_length(v_funnel_steps) - 1 LOOP
    RAISE NOTICE 'Elemento %: nome=%, tipo=%, iconType=%', 
      i+1, 
      v_funnel_steps->i->>'name',
      v_funnel_steps->i->>'tipo',
      v_funnel_steps->i->>'iconType';
  END LOOP;
  
  -- Usar valores padrão para o tipo e ícone do funil se estiverem ausentes
  DECLARE
    v_funnel_type TEXT := COALESCE(v_token_data->'funnel_data'->>'type', 'sales');
    v_funnel_icon TEXT := COALESCE(v_token_data->'funnel_data'->>'icon', 'ShoppingCart');
  BEGIN
    -- Inserir novo funil para o usuário atual com todos os dados e garantindo valores padrão
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
      ((v_token_data->'funnel_data'->>'title') || ' (Compartilhado)'),
      COALESCE(v_token_data->'funnel_data'->>'description', 'Funil compartilhado'),
      v_funnel_type,
      v_funnel_icon,
      v_funnel_steps,
      now(),
      now()
    ) RETURNING id INTO v_new_funnel_id;
  END;
  
  -- Verificar se o funil foi criado corretamente
  IF v_new_funnel_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Falha ao criar o funil'
    );
  END IF;
  
  -- Registrar uso do token (cópia)
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
  
  -- Criar log detalhado da cópia
  RAISE NOTICE 'Funil copiado com sucesso: id=%, elementos=%', 
                v_new_funnel_id, 
                jsonb_array_length(v_funnel_steps);
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Funil copiado com sucesso',
    'funnel_id', v_new_funnel_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Criar um gatilho para verificar e preservar os iconTypes após cada atualização de funil
CREATE OR REPLACE FUNCTION preserve_icons_trigger_function()
RETURNS TRIGGER AS $$
DECLARE
  v_steps JSONB;
  v_updated BOOLEAN := false;
BEGIN
  -- Verificar se há passos no funil
  IF NEW.steps IS NULL OR jsonb_array_length(NEW.steps) = 0 THEN
    RETURN NEW;
  END IF;
  
  v_steps := NEW.steps;
  
  -- Processar cada elemento para garantir que o iconType é preservado
  FOR i IN 0..jsonb_array_length(v_steps) - 1 LOOP
    DECLARE
      v_element JSONB := v_steps->i;
      v_icon_type TEXT := v_element->>'iconType';
      v_new_icon_type TEXT;
    BEGIN
      -- Se não tiver iconType, determinar com base no nome ou URL
      IF v_icon_type IS NULL OR v_icon_type = '' OR v_icon_type = 'undefined' THEN
        v_updated := true;
        
        -- Determinar o iconType com base no nome e URL
        DECLARE
          v_name TEXT := LOWER(COALESCE(v_element->>'name', ''));
          v_url TEXT := LOWER(COALESCE(v_element->>'url', ''));
          v_tipo TEXT := LOWER(COALESCE(v_element->>'tipo', 'social'));
        BEGIN
          IF v_name LIKE '%whatsapp%' OR v_url LIKE '%whatsapp%' THEN
            v_new_icon_type := 'WhatsApp';
          ELSIF v_name LIKE '%tiktok%' OR v_url LIKE '%tiktok%' THEN
            v_new_icon_type := 'TikTok';
          ELSIF v_name LIKE '%youtube%' OR v_url LIKE '%youtube%' THEN
            v_new_icon_type := 'Youtube';
          ELSIF v_name LIKE '%instagram%' OR v_url LIKE '%instagram%' THEN
            v_new_icon_type := 'Instagram';
          ELSIF v_name LIKE '%linkedin%' OR v_url LIKE '%linkedin%' THEN
            v_new_icon_type := 'Linkedin';
          ELSIF v_name LIKE '%facebook%' OR v_url LIKE '%facebook%' THEN
            v_new_icon_type := 'Facebook';
          ELSIF v_name LIKE '%telegram%' OR v_url LIKE '%telegram%' THEN
            v_new_icon_type := 'Send';
          ELSIF v_name LIKE '%twitter%' OR v_url LIKE '%twitter%' THEN
            v_new_icon_type := 'Twitter';
          ELSIF v_name LIKE '%pinterest%' OR v_url LIKE '%pinterest%' THEN
            v_new_icon_type := 'Pinterest';
          ELSIF v_tipo = 'social' THEN
            v_new_icon_type := 'Share2';
          ELSIF v_tipo = 'link' THEN
            v_new_icon_type := 'Link';
          ELSIF v_tipo = 'venda' OR v_tipo = 'vendas' THEN
            v_new_icon_type := 'ShoppingCart';
          ELSIF v_tipo = 'contato' THEN
            v_new_icon_type := 'PhoneCall';
          ELSIF v_tipo = 'web' THEN
            v_new_icon_type := 'Globe';
          ELSIF v_tipo = 'marketing' THEN
            v_new_icon_type := 'LineChart';
          ELSIF v_tipo = 'conversions' THEN
            v_new_icon_type := 'DollarSign';
          ELSIF v_tipo = 'lead' THEN
            v_new_icon_type := 'User';
          ELSE
            v_new_icon_type := 'FileText';
          END IF;
          
          -- Atualizar o iconType
          v_steps := jsonb_set(v_steps, ARRAY[i::text, 'iconType'], to_jsonb(v_new_icon_type));
        END;
      END IF;
    END;
  END LOOP;
  
  -- Se houve alterações, atualizar os passos
  IF v_updated THEN
    NEW.steps := v_steps;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Remover o gatilho se já existir
DROP TRIGGER IF EXISTS preserve_icons_trigger ON user_funnels;

-- Criar o gatilho antes da inserção ou atualização
CREATE TRIGGER preserve_icons_trigger
BEFORE INSERT OR UPDATE ON user_funnels
FOR EACH ROW
EXECUTE FUNCTION preserve_icons_trigger_function();

-- 3. Modificar a função de compartilhamento para garantir que os iconTypes são preservados
CREATE OR REPLACE FUNCTION generate_funnel_share_token(p_funnel_id UUID, p_days_valid INTEGER DEFAULT 30)
RETURNS TEXT AS $$
DECLARE
  v_token TEXT;
  v_funnel_data JSONB;
  v_steps JSONB;
  v_updated BOOLEAN := false;
BEGIN
  -- Verificar se o funil existe
  SELECT
    jsonb_build_object(
      'id', f.id,
      'title', f.title,
      'description', f.description,
      'type', f.type,
      'icon', f.icon,
      'steps', f.steps
    ) INTO v_funnel_data
  FROM user_funnels f
  WHERE f.id = p_funnel_id AND f.user_id = auth.uid();
  
  IF v_funnel_data IS NULL THEN
    RAISE EXCEPTION 'Funil não encontrado ou sem permissão para compartilhar';
  END IF;
  
  -- Verificar se há passos e garantir que os iconTypes estão definidos
  v_steps := v_funnel_data->'steps';
  
  IF v_steps IS NOT NULL AND jsonb_array_length(v_steps) > 0 THEN
    -- Processar cada elemento para garantir que o iconType é preservado
    FOR i IN 0..jsonb_array_length(v_steps) - 1 LOOP
      DECLARE
        v_element JSONB := v_steps->i;
        v_icon_type TEXT := v_element->>'iconType';
        v_new_icon_type TEXT;
      BEGIN
        -- Se não tiver iconType, determinar com base no nome ou URL
        IF v_icon_type IS NULL OR v_icon_type = '' OR v_icon_type = 'undefined' THEN
          v_updated := true;
          
          -- Determinar o iconType com base no nome e URL
          DECLARE
            v_name TEXT := LOWER(COALESCE(v_element->>'name', ''));
            v_url TEXT := LOWER(COALESCE(v_element->>'url', ''));
            v_tipo TEXT := LOWER(COALESCE(v_element->>'tipo', 'social'));
          BEGIN
            IF v_name LIKE '%whatsapp%' OR v_url LIKE '%whatsapp%' THEN
              v_new_icon_type := 'WhatsApp';
            ELSIF v_name LIKE '%tiktok%' OR v_url LIKE '%tiktok%' THEN
              v_new_icon_type := 'TikTok';
            ELSIF v_name LIKE '%youtube%' OR v_url LIKE '%youtube%' THEN
              v_new_icon_type := 'Youtube';
            ELSIF v_name LIKE '%instagram%' OR v_url LIKE '%instagram%' THEN
              v_new_icon_type := 'Instagram';
            ELSIF v_name LIKE '%linkedin%' OR v_url LIKE '%linkedin%' THEN
              v_new_icon_type := 'Linkedin';
            ELSIF v_name LIKE '%facebook%' OR v_url LIKE '%facebook%' THEN
              v_new_icon_type := 'Facebook';
            ELSIF v_name LIKE '%telegram%' OR v_url LIKE '%telegram%' THEN
              v_new_icon_type := 'Send';
            ELSIF v_name LIKE '%twitter%' OR v_url LIKE '%twitter%' THEN
              v_new_icon_type := 'Twitter';
            ELSIF v_name LIKE '%pinterest%' OR v_url LIKE '%pinterest%' THEN
              v_new_icon_type := 'Pinterest';
            ELSIF v_tipo = 'social' THEN
              v_new_icon_type := 'Share2';
            ELSIF v_tipo = 'link' THEN
              v_new_icon_type := 'Link';
            ELSIF v_tipo = 'venda' OR v_tipo = 'vendas' THEN
              v_new_icon_type := 'ShoppingCart';
            ELSIF v_tipo = 'contato' THEN
              v_new_icon_type := 'PhoneCall';
            ELSIF v_tipo = 'web' THEN
              v_new_icon_type := 'Globe';
            ELSIF v_tipo = 'marketing' THEN
              v_new_icon_type := 'LineChart';
            ELSIF v_tipo = 'conversions' THEN
              v_new_icon_type := 'DollarSign';
            ELSIF v_tipo = 'lead' THEN
              v_new_icon_type := 'User';
            ELSE
              v_new_icon_type := 'FileText';
            END IF;
            
            -- Atualizar o iconType
            v_steps := jsonb_set(v_steps, ARRAY[i::text, 'iconType'], to_jsonb(v_new_icon_type));
          END;
        END IF;
      END;
    END LOOP;
    
    -- Se houve alterações, atualizar os passos
    IF v_updated THEN
      v_funnel_data := jsonb_set(v_funnel_data, '{steps}', v_steps);
    END IF;
  END IF;
  
  -- Gerar um token único
  v_token := encode(gen_random_bytes(8), 'hex');
  
  -- Verificar se o token já existe
  WHILE EXISTS (SELECT 1 FROM funnel_share_tokens WHERE token = v_token) LOOP
    v_token := encode(gen_random_bytes(8), 'hex');
  END LOOP;
  
  -- Criar o token de compartilhamento
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
    auth.uid(),
    now(),
    CASE WHEN p_days_valid IS NULL THEN NULL ELSE now() + (p_days_valid || ' days')::interval END,
    v_funnel_data,
    true
  );
  
  RETURN v_token;
EXCEPTION WHEN OTHERS THEN
  RAISE EXCEPTION 'Erro ao gerar token de compartilhamento: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Executar correção para todos os funis existentes
DO $$
DECLARE
  v_funnel RECORD;
  v_steps JSONB;
  v_updated BOOLEAN;
  v_funil_count INTEGER := 0;
BEGIN
  -- Corrigir todos os funis existentes
  FOR v_funnel IN
    SELECT id, steps
    FROM user_funnels
    WHERE steps IS NOT NULL AND jsonb_array_length(steps) > 0
  LOOP
    v_steps := v_funnel.steps;
    v_updated := false;
    
    -- Processar cada elemento
    FOR i IN 0..jsonb_array_length(v_steps) - 1 LOOP
      DECLARE
        v_element JSONB := v_steps->i;
        v_icon_type TEXT := v_element->>'iconType';
        v_new_icon_type TEXT;
      BEGIN
        -- Se não tiver iconType, determinar com base no nome ou URL
        IF v_icon_type IS NULL OR v_icon_type = '' OR v_icon_type = 'undefined' THEN
          v_updated := true;
          
          -- Determinar o iconType com base no nome e URL
          DECLARE
            v_name TEXT := LOWER(COALESCE(v_element->>'name', ''));
            v_url TEXT := LOWER(COALESCE(v_element->>'url', ''));
            v_tipo TEXT := LOWER(COALESCE(v_element->>'tipo', 'social'));
          BEGIN
            IF v_name LIKE '%whatsapp%' OR v_url LIKE '%whatsapp%' THEN
              v_new_icon_type := 'WhatsApp';
            ELSIF v_name LIKE '%tiktok%' OR v_url LIKE '%tiktok%' THEN
              v_new_icon_type := 'TikTok';
            ELSIF v_name LIKE '%youtube%' OR v_url LIKE '%youtube%' THEN
              v_new_icon_type := 'Youtube';
            ELSIF v_name LIKE '%instagram%' OR v_url LIKE '%instagram%' THEN
              v_new_icon_type := 'Instagram';
            ELSIF v_name LIKE '%linkedin%' OR v_url LIKE '%linkedin%' THEN
              v_new_icon_type := 'Linkedin';
            ELSIF v_name LIKE '%facebook%' OR v_url LIKE '%facebook%' THEN
              v_new_icon_type := 'Facebook';
            ELSIF v_name LIKE '%telegram%' OR v_url LIKE '%telegram%' THEN
              v_new_icon_type := 'Send';
            ELSIF v_name LIKE '%twitter%' OR v_url LIKE '%twitter%' THEN
              v_new_icon_type := 'Twitter';
            ELSIF v_name LIKE '%pinterest%' OR v_url LIKE '%pinterest%' THEN
              v_new_icon_type := 'Pinterest';
            ELSIF v_tipo = 'social' THEN
              v_new_icon_type := 'Share2';
            ELSIF v_tipo = 'link' THEN
              v_new_icon_type := 'Link';
            ELSIF v_tipo = 'venda' OR v_tipo = 'vendas' THEN
              v_new_icon_type := 'ShoppingCart';
            ELSIF v_tipo = 'contato' THEN
              v_new_icon_type := 'PhoneCall';
            ELSIF v_tipo = 'web' THEN
              v_new_icon_type := 'Globe';
            ELSIF v_tipo = 'marketing' THEN
              v_new_icon_type := 'LineChart';
            ELSIF v_tipo = 'conversions' THEN
              v_new_icon_type := 'DollarSign';
            ELSIF v_tipo = 'lead' THEN
              v_new_icon_type := 'User';
            ELSE
              v_new_icon_type := 'FileText';
            END IF;
            
            -- Atualizar o iconType
            v_steps := jsonb_set(v_steps, ARRAY[i::text, 'iconType'], to_jsonb(v_new_icon_type));
          END;
        END IF;
      END;
    END LOOP;
    
    -- Se houve alterações, atualizar o funil
    IF v_updated THEN
      UPDATE user_funnels
      SET 
        steps = v_steps,
        updated_at = now()
      WHERE id = v_funnel.id;
      
      v_funil_count := v_funil_count + 1;
      RAISE NOTICE 'Funil ID % atualizado com iconTypes preservados', v_funnel.id;
    END IF;
  END LOOP;
  
  -- Corrigir todos os tokens
  DECLARE
    v_token RECORD;
    v_token_data JSONB;
    v_token_steps JSONB;
    v_token_count INTEGER := 0;
  BEGIN
    FOR v_token IN
      SELECT id, funnel_data
      FROM funnel_share_tokens
      WHERE funnel_data IS NOT NULL
    LOOP
      v_token_data := v_token.funnel_data;
      v_token_steps := v_token_data->'steps';
      v_updated := false;
      
      IF v_token_steps IS NOT NULL AND jsonb_array_length(v_token_steps) > 0 THEN
        -- Processar cada elemento
        FOR i IN 0..jsonb_array_length(v_token_steps) - 1 LOOP
          DECLARE
            v_element JSONB := v_token_steps->i;
            v_icon_type TEXT := v_element->>'iconType';
            v_new_icon_type TEXT;
          BEGIN
            -- Se não tiver iconType, determinar com base no nome ou URL
            IF v_icon_type IS NULL OR v_icon_type = '' OR v_icon_type = 'undefined' THEN
              v_updated := true;
              
              -- Determinar o iconType com base no nome e URL
              DECLARE
                v_name TEXT := LOWER(COALESCE(v_element->>'name', ''));
                v_url TEXT := LOWER(COALESCE(v_element->>'url', ''));
                v_tipo TEXT := LOWER(COALESCE(v_element->>'tipo', 'social'));
              BEGIN
                IF v_name LIKE '%whatsapp%' OR v_url LIKE '%whatsapp%' THEN
                  v_new_icon_type := 'WhatsApp';
                ELSIF v_name LIKE '%tiktok%' OR v_url LIKE '%tiktok%' THEN
                  v_new_icon_type := 'TikTok';
                ELSIF v_name LIKE '%youtube%' OR v_url LIKE '%youtube%' THEN
                  v_new_icon_type := 'Youtube';
                ELSIF v_name LIKE '%instagram%' OR v_url LIKE '%instagram%' THEN
                  v_new_icon_type := 'Instagram';
                ELSIF v_name LIKE '%linkedin%' OR v_url LIKE '%linkedin%' THEN
                  v_new_icon_type := 'Linkedin';
                ELSIF v_name LIKE '%facebook%' OR v_url LIKE '%facebook%' THEN
                  v_new_icon_type := 'Facebook';
                ELSIF v_name LIKE '%telegram%' OR v_url LIKE '%telegram%' THEN
                  v_new_icon_type := 'Send';
                ELSIF v_name LIKE '%twitter%' OR v_url LIKE '%twitter%' THEN
                  v_new_icon_type := 'Twitter';
                ELSIF v_name LIKE '%pinterest%' OR v_url LIKE '%pinterest%' THEN
                  v_new_icon_type := 'Pinterest';
                ELSIF v_tipo = 'social' THEN
                  v_new_icon_type := 'Share2';
                ELSIF v_tipo = 'link' THEN
                  v_new_icon_type := 'Link';
                ELSIF v_tipo = 'venda' OR v_tipo = 'vendas' THEN
                  v_new_icon_type := 'ShoppingCart';
                ELSIF v_tipo = 'contato' THEN
                  v_new_icon_type := 'PhoneCall';
                ELSIF v_tipo = 'web' THEN
                  v_new_icon_type := 'Globe';
                ELSIF v_tipo = 'marketing' THEN
                  v_new_icon_type := 'LineChart';
                ELSIF v_tipo = 'conversions' THEN
                  v_new_icon_type := 'DollarSign';
                ELSIF v_tipo = 'lead' THEN
                  v_new_icon_type := 'User';
                ELSE
                  v_new_icon_type := 'FileText';
                END IF;
                
                -- Atualizar o iconType
                v_token_steps := jsonb_set(v_token_steps, ARRAY[i::text, 'iconType'], to_jsonb(v_new_icon_type));
              END;
            END IF;
          END;
        END LOOP;
        
        -- Se houve alterações, atualizar o token
        IF v_updated THEN
          v_token_data := jsonb_set(v_token_data, '{steps}', v_token_steps);
          
          UPDATE funnel_share_tokens
          SET funnel_data = v_token_data
          WHERE id = v_token.id;
          
          v_token_count := v_token_count + 1;
          RAISE NOTICE 'Token ID % atualizado com iconTypes preservados', v_token.id;
        END IF;
      END IF;
    END LOOP;
    
    RAISE NOTICE 'Correção concluída. Funis atualizados: %. Tokens atualizados: %', v_funil_count, v_token_count;
  END;
END$$;

-- 5. Conceder permissões para as funções
GRANT EXECUTE ON FUNCTION copy_shared_funnel TO authenticated;
GRANT EXECUTE ON FUNCTION preserve_icons_trigger_function TO authenticated;
GRANT EXECUTE ON FUNCTION generate_funnel_share_token TO authenticated; 