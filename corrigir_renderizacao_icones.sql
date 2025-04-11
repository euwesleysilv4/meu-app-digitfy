-- Script para garantir que a renderização dos ícones funcione corretamente no frontend
-- Este script adiciona uma tabela de mapeamento na configuração do sistema

-- 1. Verificar e criar função para atualizar configurações globais
CREATE OR REPLACE FUNCTION update_system_icon_map()
RETURNS TEXT AS $$
DECLARE
  v_config JSONB;
  v_icon_map JSONB;
  v_is_updated BOOLEAN := false;
BEGIN
  -- Criar mapeamento completo de ícones para todas as redes sociais e tipos
  v_icon_map := jsonb_build_object(
    -- Redes sociais
    'TikTok', 'TikTok',
    'tiktok', 'TikTok',
    'Youtube', 'Youtube',
    'youtube', 'Youtube',
    'YouTube', 'Youtube',
    'WhatsApp', 'WhatsApp',
    'whatsapp', 'WhatsApp',
    'Whatsapp', 'WhatsApp',
    'Instagram', 'Instagram',
    'instagram', 'Instagram',
    'insta', 'Instagram',
    'Facebook', 'Facebook',
    'facebook', 'Facebook',
    'Linkedin', 'Linkedin',
    'LinkedIn', 'Linkedin',
    'linkedin', 'Linkedin',
    'Twitter', 'Twitter',
    'twitter', 'Twitter',
    'Pinterest', 'Pinterest',
    'pinterest', 'Pinterest',
    'Send', 'Send',
    'Telegram', 'Send',
    'telegram', 'Send',
    -- Tipos gerais
    'social', 'Share2',
    'link', 'Link',
    'venda', 'ShoppingCart',
    'vendas', 'ShoppingCart',
    'contato', 'PhoneCall',
    'phone', 'Phone',
    'telefone', 'Phone',
    'email', 'Mail',
    'mail', 'Mail',
    'site', 'Globe',
    'website', 'Globe',
    'form', 'FileText',
    'cadastro', 'FileText',
    -- Valores padrão
    'default', 'FileText',
    'undefined', 'FileText',
    'null', 'FileText'
  );
  
  -- Buscar tabela de configuração do sistema
  BEGIN
    -- Verificar se a tabela de configuração existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'system_config') THEN
      -- Criar tabela se não existir
      CREATE TABLE system_config (
        id SERIAL PRIMARY KEY,
        key TEXT UNIQUE NOT NULL,
        value JSONB NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
      );
      
      v_is_updated := true;
    END IF;
    
    -- Verificar se a entrada de mapeamento de ícones existe
    IF NOT EXISTS (SELECT 1 FROM system_config WHERE key = 'icon_mapping') THEN
      -- Inserir nova configuração
      INSERT INTO system_config (key, value)
      VALUES ('icon_mapping', v_icon_map);
      
      v_is_updated := true;
      RAISE NOTICE 'Criado novo mapeamento de ícones no sistema';
    ELSE
      -- Atualizar a configuração existente
      UPDATE system_config
      SET 
        value = v_icon_map,
        updated_at = now()
      WHERE key = 'icon_mapping';
      
      v_is_updated := true;
      RAISE NOTICE 'Atualizado mapeamento de ícones no sistema';
    END IF;
    
    -- Verificar se é necessário adicionar configuração de renderização
    IF NOT EXISTS (SELECT 1 FROM system_config WHERE key = 'rendering_settings') THEN
      -- Inserir configurações de renderização
      INSERT INTO system_config (key, value)
      VALUES ('rendering_settings', jsonb_build_object(
        'use_icon_mapping', true,
        'force_icon_refresh', true,
        'debug_icons', true,
        'last_refresh', extract(epoch from now())::bigint
      ));
      
      v_is_updated := true;
      RAISE NOTICE 'Criadas configurações de renderização no sistema';
    ELSE
      -- Atualizar configurações de renderização para forçar atualização
      UPDATE system_config
      SET 
        value = jsonb_set(
          jsonb_set(
            jsonb_set(
              value, 
              '{use_icon_mapping}', 
              'true'::jsonb
            ),
            '{force_icon_refresh}', 
            'true'::jsonb
          ),
          '{last_refresh}', 
          to_jsonb(extract(epoch from now())::bigint)
        ),
        updated_at = now()
      WHERE key = 'rendering_settings';
      
      v_is_updated := true;
      RAISE NOTICE 'Atualizadas configurações de renderização no sistema';
    END IF;
    
    -- Retornar status da operação
    IF v_is_updated THEN
      RETURN 'Configurações de ícones atualizadas com sucesso. Recarregue a aplicação para ver as mudanças.';
    ELSE
      RETURN 'Nenhuma atualização necessária nas configurações de ícones.';
    END IF;
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Erro ao atualizar configurações: %', SQLERRM;
    RETURN 'Erro ao atualizar configurações: ' || SQLERRM;
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Criar função para forçar atualização do cache de ícones no frontend
CREATE OR REPLACE FUNCTION force_icon_cache_refresh()
RETURNS BOOLEAN AS $$
BEGIN
  -- Atualizar configuração para forçar recarregamento
  UPDATE system_config
  SET 
    value = jsonb_set(
      jsonb_set(
        value,
        '{force_icon_refresh}', 
        'true'::jsonb
      ),
      '{last_refresh}', 
      to_jsonb(extract(epoch from now())::bigint)
    ),
    updated_at = now()
  WHERE key = 'rendering_settings';
  
  RETURN true;
EXCEPTION WHEN OTHERS THEN
  RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Definir um gatilho para atualizar o cache quando um funil é modificado
CREATE OR REPLACE FUNCTION update_funnel_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
  -- Chamar função para forçar atualização do cache
  PERFORM force_icon_cache_refresh();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Remover o gatilho se já existir
DROP TRIGGER IF EXISTS funnel_update_trigger ON user_funnels;

-- Criar o gatilho
CREATE TRIGGER funnel_update_trigger
AFTER UPDATE ON user_funnels
FOR EACH ROW
EXECUTE FUNCTION update_funnel_trigger_function();

-- 4. Conceder permissões
GRANT EXECUTE ON FUNCTION update_system_icon_map TO authenticated;
GRANT EXECUTE ON FUNCTION force_icon_cache_refresh TO authenticated;

-- 5. Executar funções
SELECT update_system_icon_map(); 