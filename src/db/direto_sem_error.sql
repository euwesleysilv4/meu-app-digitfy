-- SOLUÇÃO DIRETA PARA O PROBLEMA data_expiracao_plano
-- Execute cada comando individualmente

-- 1. LIMPAR TODAS FUNÇÕES COM REFERÊNCIA AO CAMPO PROBLEMÁTICO
DROP FUNCTION IF EXISTS public.update_user_plan(uuid, user_plan) CASCADE;
DROP FUNCTION IF EXISTS public.update_user_plan_v2(uuid, user_plan) CASCADE;
DROP FUNCTION IF EXISTS public.force_update_user_plan(uuid, user_plan) CASCADE;
DROP FUNCTION IF EXISTS public.sync_user_plan(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.sync_user_plan_v2(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.trigger_sync_plan() CASCADE;
DROP FUNCTION IF EXISTS public.trigger_sync_plan_v2() CASCADE;
DROP FUNCTION IF EXISTS public.update_plan(uuid, user_plan) CASCADE;
DROP FUNCTION IF EXISTS public.update_plan_direct(uuid, text) CASCADE;
DROP FUNCTION IF EXISTS public.update_plan_direct_v2(uuid, text) CASCADE;
DROP FUNCTION IF EXISTS public.reset_and_update_plan(uuid, text) CASCADE;
DROP FUNCTION IF EXISTS public.reset_and_update_plan_v2(uuid, text) CASCADE;

-- 2. REMOVER TRIGGERS MANUALMENTE
DROP TRIGGER IF EXISTS sync_plan_trigger ON public.profiles;
DROP TRIGGER IF EXISTS sync_plan_trigger_v2 ON public.profiles;
DROP TRIGGER IF EXISTS update_plan_trigger ON public.profiles;
DROP TRIGGER IF EXISTS check_plan_trigger ON public.profiles;

-- 3. CRIAR FUNÇÕES NOVAS LIMPAS SEM REFERÊNCIA À COLUNA PROBLEMÁTICA

-- 3.1 Função para atualização simples
CREATE OR REPLACE FUNCTION public.update_plan_clean(user_id UUID, new_plan TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    -- Atualizar perfil diretamente (sem condicionais)
    UPDATE public.profiles
    SET plano = new_plan::user_plan,
        data_modificacao = NOW()
    WHERE id = user_id;
    
    -- Atualizar metadados também
    UPDATE auth.users
    SET raw_user_meta_data = 
        COALESCE(raw_user_meta_data, '{}'::jsonb) || 
        jsonb_build_object(
            'plano', new_plan,
            'plano_updated_at', now()::text
        )
    WHERE id = user_id;
    
    RETURN TRUE;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Erro na atualização: %', SQLERRM;
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.update_plan_clean TO authenticated;

-- 3.2 Função de sincronização limpa
CREATE OR REPLACE FUNCTION public.sync_plan_clean(user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    current_plan TEXT;
BEGIN
    -- Obter plano atual
    SELECT plano::TEXT INTO current_plan
    FROM public.profiles
    WHERE id = user_id;
    
    IF current_plan IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Sincronizar com metadados
    UPDATE auth.users
    SET raw_user_meta_data = 
        COALESCE(raw_user_meta_data, '{}'::jsonb) || 
        jsonb_build_object(
            'plano', current_plan,
            'plano_updated_at', now()::text
        )
    WHERE id = user_id;
    
    RETURN TRUE;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Erro na sincronização: %', SQLERRM;
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.sync_plan_clean TO authenticated;

-- 4. ATUALIZAÇÃO DIRETA PARA UM USUÁRIO ESPECÍFICO
-- Substitua os valores conforme necessário:

-- UPDATE public.profiles 
-- SET plano = 'pro'::user_plan, 
--     data_modificacao = NOW() 
-- WHERE id = 'SEU-ID-AQUI';

-- UPDATE auth.users
-- SET raw_user_meta_data = 
--     COALESCE(raw_user_meta_data, '{}'::jsonb) || 
--     jsonb_build_object(
--         'plano', 'pro',
--         'plano_updated_at', now()::text
--     )
-- WHERE id = 'SEU-ID-AQUI'; 