-- Script para inspecionar e corrigir todas as referências à coluna data_expiracao_plano
-- Verifica todas as funções, triggers, views e procedimentos armazenados

-- 1. Primeiro, vamos verificar quais objetos fazem referência a data_expiracao_plano
DO $$
DECLARE
    obj_record RECORD;
    obj_code TEXT;
    has_references BOOLEAN := FALSE;
BEGIN
    -- Verificar referências em funções (procedimentos)
    FOR obj_record IN 
        SELECT p.proname AS name, pg_get_functiondef(p.oid) AS code
        FROM pg_proc p 
        JOIN pg_namespace n ON p.pronamespace = n.oid 
        WHERE n.nspname = 'public'
    LOOP
        obj_code := obj_record.code;
        IF position('data_expiracao_plano' in obj_code) > 0 THEN
            RAISE NOTICE 'Função % contém referências a data_expiracao_plano', obj_record.name;
            has_references := TRUE;
        END IF;
    END LOOP;
    
    -- Verificar referências em gatilhos
    FOR obj_record IN 
        SELECT t.tgname AS name, pg_get_triggerdef(t.oid) AS code
        FROM pg_trigger t
        JOIN pg_class c ON t.tgrelid = c.oid
        JOIN pg_namespace n ON c.relnamespace = n.oid
        WHERE n.nspname = 'public'
    LOOP
        obj_code := obj_record.code;
        IF position('data_expiracao_plano' in obj_code) > 0 THEN
            RAISE NOTICE 'Gatilho % contém referências a data_expiracao_plano', obj_record.name;
            has_references := TRUE;
        END IF;
    END LOOP;
    
    -- Verificar referências em views
    FOR obj_record IN 
        SELECT v.viewname AS name, pg_get_viewdef(v.viewname::regclass) AS code
        FROM pg_views v
        WHERE v.schemaname = 'public'
    LOOP
        obj_code := obj_record.code;
        IF position('data_expiracao_plano' in obj_code) > 0 THEN
            RAISE NOTICE 'View % contém referências a data_expiracao_plano', obj_record.name;
            has_references := TRUE;
        END IF;
    END LOOP;
    
    IF NOT has_references THEN
        RAISE NOTICE 'Nenhuma referência a data_expiracao_plano encontrada em funções, gatilhos ou views.';
    END IF;
END $$;

-- 2. Agora vamos verificar referências específicas em funções que interagem com o plano do usuário
-- Estas são as mais prováveis de conter o problema

-- Verifica a função update_user_plan_v2
DO $$
DECLARE
    fn_code TEXT;
BEGIN
    SELECT pg_get_functiondef(p.oid) INTO fn_code
    FROM pg_proc p 
    JOIN pg_namespace n ON p.pronamespace = n.oid 
    WHERE n.nspname = 'public' AND p.proname = 'update_user_plan_v2';
    
    IF position('data_expiracao_plano' in fn_code) > 0 THEN
        RAISE NOTICE 'A função update_user_plan_v2 contém referências a data_expiracao_plano e será corrigida.';
    ELSE
        RAISE NOTICE 'A função update_user_plan_v2 não contém referências a data_expiracao_plano.';
    END IF;
END $$;

-- Verifica a função force_update_user_plan
DO $$
DECLARE
    fn_code TEXT;
BEGIN
    SELECT pg_get_functiondef(p.oid) INTO fn_code
    FROM pg_proc p 
    JOIN pg_namespace n ON p.pronamespace = n.oid 
    WHERE n.nspname = 'public' AND p.proname = 'force_update_user_plan';
    
    IF position('data_expiracao_plano' in fn_code) > 0 THEN
        RAISE NOTICE 'A função force_update_user_plan contém referências a data_expiracao_plano e será corrigida.';
    ELSE
        RAISE NOTICE 'A função force_update_user_plan não contém referências a data_expiracao_plano.';
    END IF;
END $$;

-- 3. Recrear as funções de atualização de plano para garantir que não haja referências
-- à coluna data_expiracao_plano

-- Atualizar a função force_update_user_plan
CREATE OR REPLACE FUNCTION public.force_update_user_plan(
    user_id UUID,
    new_plan user_plan
)
RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
    -- Atualização direta e simples apenas na coluna 'plano'
    UPDATE profiles
    SET 
        plano = new_plan,
        data_modificacao = NOW()
    WHERE id = user_id;
    
    RETURN FOUND;
END;
$$;

-- Atualizar a função update_user_plan_v2
CREATE OR REPLACE FUNCTION public.update_user_plan_v2(
    user_id UUID,
    new_plan user_plan
)
RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
    is_admin BOOLEAN;
    current_plan user_plan;
    profile_exists BOOLEAN;
BEGIN
    -- Verificar se o perfil existe
    SELECT EXISTS (
        SELECT 1 FROM profiles
        WHERE id = user_id
    ) INTO profile_exists;
    
    IF NOT profile_exists THEN
        RAISE EXCEPTION 'Perfil não encontrado: O usuário com ID % não existe', user_id;
        RETURN FALSE;
    END IF;

    -- Verificar se o usuário que está executando é um administrador
    SELECT EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid() AND role = 'admin'
    ) INTO is_admin;
    
    -- Se não for administrador, retornar falso
    IF NOT is_admin THEN
        RAISE EXCEPTION 'Permissão negada: Apenas administradores podem atualizar planos de usuários';
        RETURN FALSE;
    END IF;
    
    -- Obter o plano atual para não atualizar se for o mesmo
    SELECT plano INTO current_plan FROM profiles WHERE id = user_id;
    
    IF current_plan = new_plan THEN
        -- O plano é o mesmo, não precisa atualizar
        RETURN TRUE;
    END IF;
    
    -- Atualizar o plano do usuário de forma simplificada
    -- Sem chamadas a outras funções que possam causar recursão
    UPDATE profiles
    SET 
        plano = new_plan,
        data_modificacao = NOW()
    WHERE id = user_id;
    
    RETURN FOUND;
END;
$$;

-- 4. Verificar se existem procedimentos armazenados que possam estar referenciando a coluna
DO $$
DECLARE
    proc_record RECORD;
BEGIN
    FOR proc_record IN 
        SELECT p.proname, pg_get_function_arguments(p.oid) as args
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname = 'public' 
        AND p.proname LIKE '%plan%' OR p.proname LIKE '%plano%'
    LOOP
        RAISE NOTICE 'Procedimento relacionado a plano encontrado: % com argumentos: %', 
            proc_record.proname, proc_record.args;
    END LOOP;
END $$;

-- 5. Conceder permissão para os usuários autenticados chamarem as funções
GRANT EXECUTE ON FUNCTION public.update_user_plan_v2 TO authenticated;
GRANT EXECUTE ON FUNCTION public.force_update_user_plan TO authenticated;

-- Verificar se as policy RLS fazem alguma referência à coluna data_expiracao_plano
DO $$
DECLARE
    policy_record RECORD;
    policy_def TEXT;
BEGIN
    FOR policy_record IN 
        SELECT tablename, policyname
        FROM pg_policies
        WHERE schemaname = 'public'
    LOOP
        -- Não há uma maneira direta de obter a definição da política, então pulamos esta parte
        RAISE NOTICE 'Política encontrada: % na tabela %', policy_record.policyname, policy_record.tablename;
    END LOOP;
END $$; 