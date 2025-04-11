-- Corrigir sistema de tokens e segurança dos funis

-- 1. Primeiro, corrigir as políticas da tabela user_funnels
ALTER TABLE public.user_funnels ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes apenas se existirem
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_funnels' AND policyname = 'Users can view their own funnels') THEN
    DROP POLICY "Users can view their own funnels" ON public.user_funnels;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_funnels' AND policyname = 'Users can insert their own funnels') THEN
    DROP POLICY "Users can insert their own funnels" ON public.user_funnels;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_funnels' AND policyname = 'Users can update their own funnels') THEN
    DROP POLICY "Users can update their own funnels" ON public.user_funnels;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_funnels' AND policyname = 'Users can delete their own funnels') THEN
    DROP POLICY "Users can delete their own funnels" ON public.user_funnels;
  END IF;

  -- Verificar se já existem as novas políticas antes de criá-las
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_funnels' AND policyname = 'Users can view only their own funnels') THEN
    CREATE POLICY "Users can view only their own funnels" 
      ON public.user_funnels 
      FOR SELECT 
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_funnels' AND policyname = 'Users can insert only their own funnels') THEN
    CREATE POLICY "Users can insert only their own funnels" 
      ON public.user_funnels 
      FOR INSERT 
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_funnels' AND policyname = 'Users can update only their own funnels') THEN
    CREATE POLICY "Users can update only their own funnels" 
      ON public.user_funnels 
      FOR UPDATE 
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_funnels' AND policyname = 'Users can delete only their own funnels') THEN
    CREATE POLICY "Users can delete only their own funnels" 
      ON public.user_funnels 
      FOR DELETE 
      USING (auth.uid() = user_id);
  END IF;
END$$;

-- 2. Corrigir a tabela funnel_share_tokens
ALTER TABLE public.funnel_share_tokens ENABLE ROW LEVEL SECURITY;

-- Criar uma política anônima para validação de tokens se não existir
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'funnel_share_tokens' AND policyname = 'Anyone can validate tokens') THEN
    DROP POLICY "Anyone can validate tokens" ON public.funnel_share_tokens;
  END IF;

  CREATE POLICY "Anyone can validate tokens" 
    ON public.funnel_share_tokens 
    FOR SELECT 
    USING (true);
END$$;

-- 3. Criar função de validação de token simples
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
    RETURN jsonb_build_object('valid', false, 'message', 'Token inválido ou expirado');
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

-- 4. Criar função para copiar um funil compartilhado com todos seus elementos
CREATE OR REPLACE FUNCTION copy_shared_funnel(p_token TEXT)
RETURNS JSONB AS $$
DECLARE
  v_token_data JSONB;
  v_new_funnel_id UUID;
  v_funnel_steps JSONB;
BEGIN
  -- Primeiro, validar o token
  v_token_data := validate_funnel_token(p_token);
  
  RAISE NOTICE 'Token validado: %', v_token_data;
  
  IF NOT (v_token_data->>'valid')::BOOLEAN THEN
    RETURN v_token_data;
  END IF;

  -- Verificar se há dados do funil
  IF v_token_data->'funnel_data' IS NULL THEN
    RAISE NOTICE 'Dados do funil não encontrados no token: %', v_token_data;
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Dados do funil não encontrados no token'
    );
  END IF;

  -- Verificar se há elementos do funil e garantir que os tipos estejam definidos
  v_funnel_steps := v_token_data->'funnel_data'->'steps';
  
  RAISE NOTICE 'Passos originais: %', v_funnel_steps;
  
  IF v_funnel_steps IS NULL THEN
    v_funnel_steps := '[]'::JSONB;
    RAISE NOTICE 'Passos do funil ausentes, criando array vazio';
  ELSIF jsonb_array_length(v_funnel_steps) = 0 THEN
    RAISE NOTICE 'Passos do funil vazios: %', v_token_data->'funnel_data';
  ELSE
    -- Verificar e corrigir cada elemento
    FOR i IN 0..jsonb_array_length(v_funnel_steps) - 1 LOOP
      RAISE NOTICE 'Processando passo %: %', i+1, v_funnel_steps->i;
      
      -- Garantir que o tipo está definido
      IF v_funnel_steps->i->>'tipo' IS NULL OR v_funnel_steps->i->>'tipo' = '' THEN
        RAISE NOTICE 'Tipo não definido para passo %, usando social', i+1;
        v_funnel_steps := jsonb_set(v_funnel_steps, ARRAY[i::text, 'tipo'], '"social"'::jsonb);
      END IF;
      
      -- Garantir que o iconType está definido
      IF v_funnel_steps->i->>'iconType' IS NULL OR v_funnel_steps->i->>'iconType' = '' THEN
        -- Determinar o ícone com base na URL ou nome
        DECLARE
          v_element_name TEXT := LOWER(COALESCE(v_funnel_steps->i->>'name', ''));
          v_element_url TEXT := LOWER(COALESCE(v_funnel_steps->i->>'url', ''));
          v_icon_type TEXT := 'FileText'; -- ícone padrão
        BEGIN
          RAISE NOTICE 'iconType não definido para passo %, nome: %, url: %', i+1, v_element_name, v_element_url;
          
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
          
          RAISE NOTICE 'Definindo iconType como % para o passo %', v_icon_type, i+1;
          v_funnel_steps := jsonb_set(v_funnel_steps, ARRAY[i::text, 'iconType'], to_jsonb(v_icon_type));
        END;
      END IF;
    END LOOP;
  END IF;
  
  -- Log dos passos processados
  FOR i IN 0..jsonb_array_length(v_funnel_steps) - 1 LOOP
    RAISE NOTICE 'Passo % processado: id=%, name=%, tipo=%, iconType=%', 
      i+1, 
      v_funnel_steps->i->>'id',
      v_funnel_steps->i->>'name',
      v_funnel_steps->i->>'tipo',
      v_funnel_steps->i->>'iconType';
  END LOOP;
  
  -- Usar valores padrão para o tipo e ícone do funil se estiverem ausentes
  DECLARE
    v_funnel_type TEXT := COALESCE(v_token_data->'funnel_data'->>'type', 'sales');
    v_funnel_icon TEXT := COALESCE(v_token_data->'funnel_data'->>'icon', 'ShoppingCart');
  BEGIN
    RAISE NOTICE 'Inserindo novo funil: tipo=%, ícone=%, passos=%', 
      v_funnel_type, v_funnel_icon, jsonb_array_length(v_funnel_steps);
      
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
    RAISE NOTICE 'Falha ao criar o funil: nenhum ID retornado';
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
    RAISE NOTICE 'Erro ao registrar uso do token: %', SQLERRM;
  END;
  
  -- Verificar o funil criado
  DECLARE
    v_created_funnel JSONB;
  BEGIN
    SELECT jsonb_build_object(
      'id', id,
      'title', title,
      'steps_count', jsonb_array_length(steps)
    ) INTO v_created_funnel
    FROM user_funnels
    WHERE id = v_new_funnel_id;
    
    RAISE NOTICE 'Funil criado: %', v_created_funnel;
  END;
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Funil copiado com sucesso',
    'funnel_id', v_new_funnel_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Criar tabela de uso se não existir
CREATE TABLE IF NOT EXISTS public.funnel_share_token_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token_id UUID NOT NULL,
  used_by UUID NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  action TEXT NOT NULL
);

-- 6. Criar ou atualizar a função para gerar tokens simples
CREATE OR REPLACE FUNCTION generate_simple_token(p_funnel_id TEXT, p_days_valid INTEGER DEFAULT 30)
RETURNS TEXT AS $$
DECLARE
  v_token TEXT;
BEGIN
  -- Gerar um token simples
  v_token := encode(gen_random_bytes(8), 'hex');
  
  -- Verificar se o token já existe
  WHILE EXISTS (SELECT 1 FROM funnel_share_tokens WHERE token = v_token) LOOP
    v_token := encode(gen_random_bytes(8), 'hex');
  END LOOP;
  
  RETURN v_token;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Adicionar função de diagnóstico para desenvolvedores
CREATE OR REPLACE FUNCTION debug_shared_funnel_token(p_token TEXT)
RETURNS JSONB AS $$
DECLARE
  v_token_info JSONB;
BEGIN
  SELECT 
    jsonb_build_object(
      'token', token,
      'funnel_id', funnel_id,
      'created_by', created_by,
      'created_at', created_at,
      'expires_at', expires_at,
      'is_active', is_active,
      'funnel_data', funnel_data
    ) INTO v_token_info
  FROM funnel_share_tokens
  WHERE token = p_token;
  
  IF v_token_info IS NULL THEN
    RETURN jsonb_build_object('exists', false, 'message', 'Token não encontrado');
  END IF;
  
  RETURN jsonb_build_object('exists', true, 'info', v_token_info);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Função para reparar tokens e funis compartilhados existentes
CREATE OR REPLACE FUNCTION repair_shared_funnels()
RETURNS TEXT AS $$
DECLARE
  v_token_count INTEGER := 0;
  v_funnel_count INTEGER := 0;
  v_token RECORD;
  v_funnel RECORD;
  v_original_funnel RECORD;
  v_funnel_data JSONB;
  v_steps JSONB;
BEGIN
  -- 1. Primeiro reparar tokens - garantir que todos têm os dados do funil original
  FOR v_token IN 
    SELECT t.id, t.funnel_id, t.funnel_data, t.token 
    FROM funnel_share_tokens t
  LOOP
    -- Verificar se o token tem dados de funil válidos
    IF v_token.funnel_data IS NULL OR (v_token.funnel_data->>'title') IS NULL THEN
      -- Buscar dados do funil original
      SELECT * INTO v_original_funnel
      FROM user_funnels
      WHERE id = v_token.funnel_id;
      
      IF v_original_funnel FOUND THEN
        -- Atualizar dados do token com informações do funil original
        v_funnel_data := jsonb_build_object(
          'id', v_original_funnel.id,
          'title', v_original_funnel.title,
          'description', v_original_funnel.description,
          'type', COALESCE(v_original_funnel.type, 'sales'),
          'icon', COALESCE(v_original_funnel.icon, 'ShoppingCart'),
          'steps', COALESCE(v_original_funnel.steps, '[]'::jsonb)
        );
        
        UPDATE funnel_share_tokens
        SET funnel_data = v_funnel_data
        WHERE id = v_token.id;
        
        v_token_count := v_token_count + 1;
        RAISE NOTICE 'Token % reparado com dados do funil original', v_token.token;
      ELSE
        RAISE NOTICE 'Funil original não encontrado para token %', v_token.token;
      END IF;
    END IF;
  END LOOP;
  
  -- 2. Reparar funis compartilhados existentes que estão vazios
  FOR v_funnel IN 
    SELECT f.id, f.title, f.steps
    FROM user_funnels f
    WHERE 
      f.title LIKE '%(Compartilhado)' AND 
      (f.steps IS NULL OR jsonb_array_length(f.steps) = 0)
  LOOP
    -- Buscar um token que tenha o título base deste funil
    DECLARE
      v_base_title TEXT := replace(v_funnel.title, ' (Compartilhado)', '');
      v_matching_token RECORD;
    BEGIN
      SELECT t.* INTO v_matching_token
      FROM funnel_share_tokens t
      WHERE 
        t.funnel_data->>'title' = v_base_title
        OR t.funnel_data->>'title' = v_base_title || ' (Compartilhado)'
      LIMIT 1;
      
      IF v_matching_token FOUND AND jsonb_array_length(v_matching_token.funnel_data->'steps') > 0 THEN
        -- Atualizar o funil compartilhado com os dados do token
        UPDATE user_funnels
        SET 
          steps = v_matching_token.funnel_data->'steps',
          type = COALESCE(v_matching_token.funnel_data->>'type', 'sales'),
          icon = COALESCE(v_matching_token.funnel_data->>'icon', 'ShoppingCart')
        WHERE id = v_funnel.id;
        
        v_funnel_count := v_funnel_count + 1;
        RAISE NOTICE 'Funil compartilhado "%" reparado com dados do token', v_funnel.title;
      ELSE
        -- Buscar qualquer funil original com este nome base
        SELECT * INTO v_original_funnel
        FROM user_funnels
        WHERE 
          title = v_base_title AND 
          steps IS NOT NULL AND 
          jsonb_array_length(steps) > 0
        LIMIT 1;
        
        IF v_original_funnel FOUND THEN
          UPDATE user_funnels
          SET 
            steps = v_original_funnel.steps,
            type = COALESCE(v_original_funnel.type, 'sales'),
            icon = COALESCE(v_original_funnel.icon, 'ShoppingCart')
          WHERE id = v_funnel.id;
          
          v_funnel_count := v_funnel_count + 1;
          RAISE NOTICE 'Funil compartilhado "%" reparado com dados de funil original', v_funnel.title;
        END IF;
      END IF;
    END;
  END LOOP;
  
  RETURN format('Reparo completo. Tokens atualizados: %s. Funis compartilhados reparados: %s', 
                v_token_count::text, v_funnel_count::text);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Conceder permissões para funções
GRANT EXECUTE ON FUNCTION validate_funnel_token TO authenticated, anon;
GRANT EXECUTE ON FUNCTION copy_shared_funnel TO authenticated;
GRANT EXECUTE ON FUNCTION generate_simple_token TO authenticated;
GRANT EXECUTE ON FUNCTION debug_shared_funnel_token TO authenticated;
GRANT EXECUTE ON FUNCTION repair_shared_funnels TO authenticated;

-- 10. Executar a função de reparo para corrigir funis existentes
DO $$
DECLARE
  v_result TEXT;
BEGIN
  -- Verificar se existem funis para reparar
  IF EXISTS (
    SELECT 1 
    FROM user_funnels f
    WHERE 
      f.title LIKE '%(Compartilhado)' AND 
      (f.steps IS NULL OR jsonb_array_length(f.steps) = 0)
  ) OR EXISTS (
    SELECT 1
    FROM funnel_share_tokens t
    WHERE t.funnel_data IS NULL OR (t.funnel_data->>'title') IS NULL
  ) THEN
    SELECT repair_shared_funnels() INTO v_result;
    RAISE NOTICE 'Resultado da reparação: %', v_result;
  ELSE
    RAISE NOTICE 'Não foram encontrados funis ou tokens que precisem de reparo.';
  END IF;
END$$; 