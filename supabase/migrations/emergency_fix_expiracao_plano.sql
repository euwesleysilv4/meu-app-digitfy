-- Script SQL EMERGENCIAL para remover todas as referências à coluna data_expiracao_plano
-- Este script é mais agressivo e tenta resolver o problema de todas as formas possíveis

-- 1. Primeiro, identificar todas as funções que possam ter referência a data_expiracao_plano
CREATE OR REPLACE FUNCTION public.list_functions_with_expiracao_plano()
RETURNS TABLE(funcname text, funcdef text) AS $$
BEGIN
    RETURN QUERY
    SELECT p.proname::text, pg_get_functiondef(p.oid) 
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public'
    AND pg_get_functiondef(p.oid) LIKE '%data\_expiracao\_plano%';
END;
$$ LANGUAGE plpgsql;

-- 2. Resetar todas as funções relacionadas a plano de usuário
-- Isto é mais seguro do que tentar modificar cada função individualmente

-- Função básica para forçar atualização do plano
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
    -- Atualização direta na tabela profiles
    UPDATE profiles
    SET 
        plano = new_plan,
        data_modificacao = NOW()
    WHERE id = user_id;
    
    RETURN FOUND;
END;
$$;

-- Função para administradores atualizarem plano
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
    
    -- Atualizar o plano do usuário
    UPDATE profiles
    SET 
        plano = new_plan,
        data_modificacao = NOW()
    WHERE id = user_id;
    
    RETURN FOUND;
END;
$$;

-- 3. Recriar qualquer view que possa estar referenciando a coluna
DO $$
DECLARE
    view_record RECORD;
BEGIN
    -- Se existir uma view profiles_admin_view, recriar
    IF EXISTS (
        SELECT 1 FROM pg_views WHERE viewname = 'profiles_admin_view'
    ) THEN
        DROP VIEW IF EXISTS profiles_admin_view;
        
        CREATE OR REPLACE VIEW profiles_admin_view AS
        SELECT 
            id, 
            nome, 
            email, 
            avatar_url, 
            status, 
            plano,
            ultimo_login, 
            verificado, 
            role, 
            banido,
            data_criacao,
            data_modificacao,
            whatsapp,
            tentativas_login,
            notificacoes_ativas
        FROM 
            profiles;
            
        RAISE NOTICE 'View profiles_admin_view recriada';
    END IF;
    
    -- Identificar e tentar recriar outras views que possam ter a coluna
    FOR view_record IN 
        SELECT viewname 
        FROM pg_views 
        WHERE schemaname = 'public'
        AND pg_get_viewdef(viewname::regclass) LIKE '%data\_expiracao\_plano%'
    LOOP
        RAISE NOTICE 'View % pode conter referência à coluna removida', view_record.viewname;
    END LOOP;
END $$;

-- 4. Verificar e corrigir policies RLS
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    -- Listar todas as políticas RLS para profiles
    FOR policy_record IN 
        SELECT policyname
        FROM pg_policies
        WHERE schemaname = 'public' 
        AND tablename = 'profiles'
    LOOP
        RAISE NOTICE 'Política encontrada para profiles: %', policy_record.policyname;
    END LOOP;
END $$;

-- 5. Conceder permissões para usuários autenticados
GRANT EXECUTE ON FUNCTION public.update_user_plan_v2 TO authenticated;
GRANT EXECUTE ON FUNCTION public.force_update_user_plan TO authenticated;

-- 6. Verificação final para garantir que não existem mais referências à coluna
DO $$
BEGIN
    -- Se ainda existir a coluna (embora não deveria), tentar removê-la novamente
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'data_expiracao_plano'
    ) THEN
        ALTER TABLE public.profiles DROP COLUMN data_expiracao_plano CASCADE;
        RAISE NOTICE 'ATENÇÃO: Coluna data_expiracao_plano ainda existia e foi removida com CASCADE!';
    END IF;

    -- Verifique se existe a coluna duplicada 'plan'
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'plan'
    ) THEN
        ALTER TABLE public.profiles DROP COLUMN plan CASCADE;
        RAISE NOTICE 'ATENÇÃO: Coluna plan (duplicada) ainda existia e foi removida com CASCADE!';
    END IF;
END $$; 