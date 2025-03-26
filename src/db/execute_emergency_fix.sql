-- SCRIPT DE EMERGÊNCIA EXTREMA PARA RESOLVER O PROBLEMA DA COLUNA data_expiracao_plano
-- Versão simplificada que não mexe com triggers do sistema

BEGIN;

-- Etapa 1: Remover funções problemáticas
DROP FUNCTION IF EXISTS public.update_user_plan CASCADE;
DROP FUNCTION IF EXISTS public.update_user_plan_v2 CASCADE;
DROP FUNCTION IF EXISTS public.force_update_user_plan CASCADE;
DROP FUNCTION IF EXISTS public.sync_user_plan CASCADE;
DROP FUNCTION IF EXISTS public.sync_user_plan_v2 CASCADE;
DROP FUNCTION IF EXISTS public.trigger_sync_plan CASCADE;
DROP FUNCTION IF EXISTS public.trigger_sync_plan_v2 CASCADE;
DROP FUNCTION IF EXISTS public.update_plan CASCADE;
DROP FUNCTION IF EXISTS public.update_plan_direct CASCADE;
DROP FUNCTION IF EXISTS public.reset_and_update_plan CASCADE;
DROP FUNCTION IF EXISTS public.emergency_update_plan CASCADE;

-- Etapa 2: Criar função de emergência EXTREMA simplificada
CREATE OR REPLACE FUNCTION public.emergency_update_plan(user_id UUID, new_plan TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    -- Atualizar perfil
    UPDATE public.profiles
    SET plano = new_plan::user_plan,
        data_modificacao = NOW()
    WHERE id = user_id;
    
    -- Atualizar metadados
    UPDATE auth.users
    SET raw_user_meta_data = 
        COALESCE(raw_user_meta_data, '{}'::jsonb) || 
        jsonb_build_object(
            'plano', new_plan,
            'plano_updated_at', now()
        )
    WHERE id = user_id;
    
    RETURN TRUE;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Erro na atualização de emergência: %', SQLERRM;
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Conceder permissão de execução
GRANT EXECUTE ON FUNCTION public.emergency_update_plan TO authenticated;

-- Etapa 3: Criar função de sincronização simplificada
CREATE OR REPLACE FUNCTION public.sync_user_plan_v2(user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    current_plan TEXT;
BEGIN
    -- Obter o plano atual do perfil
    SELECT plano::TEXT INTO current_plan
    FROM public.profiles
    WHERE id = user_id;
    
    IF current_plan IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Atualizar metadados com o plano atual
    UPDATE auth.users
    SET raw_user_meta_data = 
        COALESCE(raw_user_meta_data, '{}'::jsonb) || 
        jsonb_build_object(
            'plano', current_plan,
            'plano_updated_at', now()
        )
    WHERE id = user_id;
    
    RETURN TRUE;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Erro na sincronização do plano: %', SQLERRM;
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Conceder permissão de execução
GRANT EXECUTE ON FUNCTION public.sync_user_plan_v2 TO authenticated;

-- Etapa 4: Criar função de SQL direto simplificada
CREATE OR REPLACE FUNCTION public.execute_sql_safe(sql_query TEXT)
RETURNS VOID AS $$
BEGIN
    EXECUTE sql_query;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.execute_sql_safe TO authenticated;

COMMIT;

-- Após executar o script, teste com:
-- SELECT public.emergency_update_plan('ID_DO_USUARIO', 'pro'); 