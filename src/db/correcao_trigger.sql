-- SCRIPT DE CORREÇÃO DE TRIGGERS PROBLEMÁTICOS
-- Este script remove e recria triggers que possam estar causando problemas

-- Parte 1: Identificar gatilhos específicos
SELECT trigger_name, event_manipulation, action_statement
FROM information_schema.triggers
WHERE event_object_schema = 'public' 
  AND event_object_table = 'profiles';

-- Parte 2: Remover todos os gatilhos relacionados a plano
DROP TRIGGER IF EXISTS sync_plan_trigger ON public.profiles;
DROP TRIGGER IF EXISTS sync_plan_trigger_v2 ON public.profiles;
DROP TRIGGER IF EXISTS update_plan_trigger ON public.profiles;
DROP TRIGGER IF EXISTS check_plan_trigger ON public.profiles;

-- Parte 3: Remover todas as funções de gatilho relacionadas
DROP FUNCTION IF EXISTS public.trigger_sync_plan() CASCADE;
DROP FUNCTION IF EXISTS public.trigger_sync_plan_v2() CASCADE;
DROP FUNCTION IF EXISTS public.trigger_update_plan() CASCADE;
DROP FUNCTION IF EXISTS public.trigger_check_plan() CASCADE;

-- Parte 4: Investigar tabela profiles para encontrar referências à coluna
SELECT column_name 
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'profiles' 
  AND column_name LIKE '%expiracao%';

-- Parte 5: Criar uma função de gatilho limpa para sincronização do plano
CREATE OR REPLACE FUNCTION public.trigger_sync_plan_clean()
RETURNS TRIGGER AS $$
BEGIN
    -- Atualizar metadados com o plano atual - versão limpa sem referências a data_expiracao_plano
    UPDATE auth.users
    SET raw_user_meta_data = 
        COALESCE(raw_user_meta_data, '{}'::jsonb) || 
        jsonb_build_object(
            'plano', NEW.plano::TEXT,
            'plano_updated_at', now()::text
        )
    WHERE id = NEW.id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Parte 6: Criar um novo gatilho limpo
CREATE TRIGGER sync_plan_trigger_clean
AFTER INSERT OR UPDATE OF plano ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.trigger_sync_plan_clean();

-- Parte 7: Conceder permissões
GRANT EXECUTE ON FUNCTION public.trigger_sync_plan_clean() TO authenticated; 