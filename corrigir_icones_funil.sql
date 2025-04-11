-- Script para corrigir ícones de elementos em funis
-- Este script identifica e corrige elementos com iconType não definido

-- Função para corrigir ícones de elementos em todos os funis
CREATE OR REPLACE FUNCTION fix_funnel_element_icons()
RETURNS TEXT AS $$
DECLARE
  v_funnel RECORD;
  v_steps JSONB;
  v_updated BOOLEAN;
  v_funnel_count INTEGER := 0;
  v_element_count INTEGER := 0;
  v_log TEXT := '';
BEGIN
  -- Processar todos os funis no sistema
  FOR v_funnel IN 
    SELECT id, title, steps 
    FROM user_funnels
    WHERE steps IS NOT NULL AND jsonb_array_length(steps) > 0
  LOOP
    v_steps := v_funnel.steps;
    v_updated := false;
    
    -- Verificar cada elemento nos passos
    FOR i IN 0..jsonb_array_length(v_steps) - 1 LOOP
      -- Extrair dados do elemento para análise
      DECLARE
        v_element JSONB := v_steps->i;
        v_name TEXT := LOWER(COALESCE(v_element->>'name', ''));
        v_url TEXT := LOWER(COALESCE(v_element->>'url', ''));
        v_tipo TEXT := LOWER(COALESCE(v_element->>'tipo', ''));
        v_icon_type TEXT := v_element->>'iconType';
        v_new_icon_type TEXT := NULL;
      BEGIN
        -- Verificar se o iconType está definido
        IF v_icon_type IS NULL OR v_icon_type = '' OR v_icon_type = 'undefined' THEN
          -- Determinar o iconType com base no nome, URL ou tipo
          -- Primeiro, definições específicas de redes sociais
          IF v_name LIKE '%whatsapp%' OR v_url LIKE '%whatsapp%' THEN
            v_new_icon_type := 'WhatsApp';
          ELSIF v_name LIKE '%tiktok%' OR v_url LIKE '%tiktok%' THEN
            v_new_icon_type := 'TikTok';
          ELSIF v_name LIKE '%youtube%' OR v_url LIKE '%youtube%' OR v_url LIKE '%youtu.be%' THEN
            v_new_icon_type := 'Youtube';
          ELSIF v_name LIKE '%instagram%' OR v_url LIKE '%instagram%' OR v_url LIKE '%insta%' THEN
            v_new_icon_type := 'Instagram';
          ELSIF v_name LIKE '%linkedin%' OR v_url LIKE '%linkedin%' THEN
            v_new_icon_type := 'Linkedin';
          ELSIF v_name LIKE '%facebook%' OR v_url LIKE '%facebook%' OR v_url LIKE '%fb.com%' THEN
            v_new_icon_type := 'Facebook';
          ELSIF v_name LIKE '%telegram%' OR v_url LIKE '%telegram%' OR v_url LIKE '%t.me%' THEN
            v_new_icon_type := 'Send';
          ELSIF v_name LIKE '%twitter%' OR v_url LIKE '%twitter%' OR v_url LIKE '%x.com%' THEN
            v_new_icon_type := 'Twitter';
          ELSIF v_name LIKE '%pinterest%' OR v_url LIKE '%pinterest%' THEN
            v_new_icon_type := 'Pinterest';
          ELSIF v_name LIKE '%snapchat%' OR v_url LIKE '%snapchat%' THEN
            v_new_icon_type := 'Camera';
          ELSIF v_name LIKE '%email%' OR v_url LIKE '%mailto:%' OR v_name LIKE '%mail%' THEN
            v_new_icon_type := 'Mail';
          ELSIF v_name LIKE '%site%' OR v_name LIKE '%website%' OR v_name LIKE '%pagina%' OR v_name LIKE '%página%' THEN
            v_new_icon_type := 'Globe';
          ELSIF v_name LIKE '%telefone%' OR v_name LIKE '%ligar%' OR v_url LIKE '%tel:%' OR v_name LIKE '%fone%' THEN
            v_new_icon_type := 'Phone';
          ELSIF v_name LIKE '%form%' OR v_name LIKE '%cadastro%' OR v_name LIKE '%registro%' THEN
            v_new_icon_type := 'FileText';
          
          -- Determinar pelo tipo se ainda não definido
          ELSIF v_tipo = 'social' THEN
            v_new_icon_type := 'Share2';
          ELSIF v_tipo = 'link' THEN
            v_new_icon_type := 'Link';
          ELSIF v_tipo = 'venda' OR v_tipo = 'vendas' THEN
            v_new_icon_type := 'ShoppingCart';
          ELSIF v_tipo = 'contato' THEN
            v_new_icon_type := 'PhoneCall';
          ELSE
            -- Ícone padrão para outros casos
            v_new_icon_type := 'FileText';
          END IF;
          
          -- Atualizar o iconType no elemento
          v_steps := jsonb_set(v_steps, ARRAY[i::text, 'iconType'], to_jsonb(v_new_icon_type));
          v_updated := true;
          v_element_count := v_element_count + 1;
          
          -- Adicionar log
          v_log := v_log || format('Funil "%s" - Elemento %s: iconType definido como %s%s', 
                                  v_funnel.title, v_name, v_new_icon_type, E'\n');
        END IF;
      END;
    END LOOP;
    
    -- Atualizar o funil se houve mudanças
    IF v_updated THEN
      UPDATE user_funnels
      SET 
        steps = v_steps,
        updated_at = now()
      WHERE id = v_funnel.id;
      
      v_funnel_count := v_funnel_count + 1;
      RAISE NOTICE 'Funil "%" atualizado com ícones corrigidos', v_funnel.title;
    END IF;
  END LOOP;
  
  -- Verificar se há tokens de compartilhamento que precisam ser atualizados
  DECLARE
    v_token RECORD;
    v_token_count INTEGER := 0;
    v_token_steps JSONB;
  BEGIN
    FOR v_token IN
      SELECT id, token, funnel_id, funnel_data
      FROM funnel_share_tokens
      WHERE funnel_data IS NOT NULL
    LOOP
      -- Verificar se o token tem dados de passos
      IF v_token.funnel_data->'steps' IS NOT NULL AND jsonb_array_length(v_token.funnel_data->'steps') > 0 THEN
        v_token_steps := v_token.funnel_data->'steps';
        v_updated := false;
        
        -- Verificar cada elemento nos passos do token
        FOR i IN 0..jsonb_array_length(v_token_steps) - 1 LOOP
          -- Extrair dados do elemento para análise
          DECLARE
            v_element JSONB := v_token_steps->i;
            v_name TEXT := LOWER(COALESCE(v_element->>'name', ''));
            v_url TEXT := LOWER(COALESCE(v_element->>'url', ''));
            v_tipo TEXT := LOWER(COALESCE(v_element->>'tipo', ''));
            v_icon_type TEXT := v_element->>'iconType';
            v_new_icon_type TEXT := NULL;
          BEGIN
            -- Verificar se o iconType está definido
            IF v_icon_type IS NULL OR v_icon_type = '' OR v_icon_type = 'undefined' THEN
              -- Usar a mesma lógica de determinação de iconType
              IF v_name LIKE '%whatsapp%' OR v_url LIKE '%whatsapp%' THEN
                v_new_icon_type := 'WhatsApp';
              ELSIF v_name LIKE '%tiktok%' OR v_url LIKE '%tiktok%' THEN
                v_new_icon_type := 'TikTok';
              ELSIF v_name LIKE '%youtube%' OR v_url LIKE '%youtube%' OR v_url LIKE '%youtu.be%' THEN
                v_new_icon_type := 'Youtube';
              ELSIF v_name LIKE '%instagram%' OR v_url LIKE '%instagram%' OR v_url LIKE '%insta%' THEN
                v_new_icon_type := 'Instagram';
              ELSIF v_name LIKE '%linkedin%' OR v_url LIKE '%linkedin%' THEN
                v_new_icon_type := 'Linkedin';
              ELSIF v_name LIKE '%facebook%' OR v_url LIKE '%facebook%' OR v_url LIKE '%fb.com%' THEN
                v_new_icon_type := 'Facebook';
              ELSIF v_name LIKE '%telegram%' OR v_url LIKE '%telegram%' OR v_url LIKE '%t.me%' THEN
                v_new_icon_type := 'Send';
              ELSIF v_name LIKE '%twitter%' OR v_url LIKE '%twitter%' OR v_url LIKE '%x.com%' THEN
                v_new_icon_type := 'Twitter';
              ELSIF v_name LIKE '%pinterest%' OR v_url LIKE '%pinterest%' THEN
                v_new_icon_type := 'Pinterest';
              ELSIF v_name LIKE '%snapchat%' OR v_url LIKE '%snapchat%' THEN
                v_new_icon_type := 'Camera';
              ELSIF v_name LIKE '%email%' OR v_url LIKE '%mailto:%' OR v_name LIKE '%mail%' THEN
                v_new_icon_type := 'Mail';
              ELSIF v_tipo = 'social' THEN
                v_new_icon_type := 'Share2';
              ELSIF v_tipo = 'link' THEN
                v_new_icon_type := 'Link';
              ELSIF v_tipo = 'venda' OR v_tipo = 'vendas' THEN
                v_new_icon_type := 'ShoppingCart';
              ELSIF v_tipo = 'contato' THEN
                v_new_icon_type := 'PhoneCall';
              ELSE
                v_new_icon_type := 'FileText';
              END IF;
              
              -- Atualizar o iconType no elemento
              v_token_steps := jsonb_set(v_token_steps, ARRAY[i::text, 'iconType'], to_jsonb(v_new_icon_type));
              v_updated := true;
              v_element_count := v_element_count + 1;
            END IF;
          END;
        END LOOP;
        
        -- Atualizar o token se houve mudanças
        IF v_updated THEN
          -- Atualizar os passos no funnel_data
          UPDATE funnel_share_tokens
          SET funnel_data = jsonb_set(funnel_data, '{steps}', v_token_steps)
          WHERE id = v_token.id;
          
          v_token_count := v_token_count + 1;
          RAISE NOTICE 'Token % atualizado com ícones corrigidos', v_token.token;
        END IF;
      END IF;
    END LOOP;
    
    -- Adicionar contagem de tokens ao resultado
    RETURN format('Ícones corrigidos. Funis atualizados: %s. Tokens atualizados: %s. Elementos corrigidos: %s. %s',
                 v_funnel_count::text, v_token_count::text, v_element_count::text,
                 CASE WHEN length(v_log) > 0 THEN E'\n\nDetalhes:\n' || v_log ELSE '' END);
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Conceder permissão para execução da função
GRANT EXECUTE ON FUNCTION fix_funnel_element_icons TO authenticated;

-- Executar a função de correção de ícones
DO $$
DECLARE
  v_result TEXT;
BEGIN
  SELECT fix_funnel_element_icons() INTO v_result;
  RAISE NOTICE '%', v_result;
END$$; 