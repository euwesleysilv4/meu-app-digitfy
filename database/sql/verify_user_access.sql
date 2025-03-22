-- Script para verificar problemas com o acesso do usuário ao seu próprio perfil
-- Executar este script como um usuário administrador no Supabase SQL Editor

-- Verificar se existem políticas conflitantes
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM
    pg_policies
WHERE
    tablename = 'profiles'
ORDER BY
    policyname;

-- Verificar se existem problemas com as políticas de RLS para a tabela profiles
DO $$
DECLARE
    rls_enabled BOOLEAN;
BEGIN
    -- Verificar se RLS está habilitado na tabela profiles
    SELECT relrowsecurity INTO rls_enabled
    FROM pg_class
    WHERE relname = 'profiles';
    
    RAISE NOTICE 'RLS está habilitado na tabela profiles: %', rls_enabled;
    
    -- Verificar se todos os usuários têm a permissão correta de SELECT no seu próprio perfil
    IF EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'profiles'
        AND cmd = 'SELECT'
        AND qual = 'auth.uid() = id'
    ) THEN
        RAISE NOTICE 'Política de SELECT para o próprio perfil está configurada corretamente.';
    ELSE
        RAISE WARNING 'A política de SELECT para o próprio perfil NÃO está configurada corretamente!';
    END IF;
    
    -- Verificar se todos os usuários têm a permissão correta de UPDATE no seu próprio perfil
    IF EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'profiles'
        AND cmd = 'UPDATE'
        AND qual = 'auth.uid() = id'
    ) THEN
        RAISE NOTICE 'Política de UPDATE para o próprio perfil está configurada corretamente.';
    ELSE
        RAISE WARNING 'A política de UPDATE para o próprio perfil NÃO está configurada corretamente!';
    END IF;
END $$;

-- Verificar permissões da função auth.uid()
SELECT
    p.proname,
    pg_get_function_result(p.oid) AS result_type,
    pg_get_function_arguments(p.oid) AS arg_list,
    CASE WHEN p.prosecdef THEN 'SECURITY DEFINER' ELSE 'SECURITY INVOKER' END AS security
FROM
    pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE
    n.nspname = 'auth'
    AND p.proname = 'uid';

-- Criar uma função de teste para verificar o acesso direto
CREATE OR REPLACE FUNCTION public.test_user_profile_access(user_id UUID)
RETURNS TABLE (
    id UUID,
    nome TEXT,
    email TEXT,
    plano TEXT
)
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        p.id,
        p.nome,
        p.email,
        p.plano::TEXT
    FROM
        profiles p
    WHERE
        p.id = user_id;
END $$;

-- Diagnóstico adicional: verificar se há algum perfil cadastrado
SELECT
    COUNT(*) AS total_profiles,
    COUNT(CASE WHEN plano = 'gratuito' THEN 1 END) AS free_plans,
    COUNT(CASE WHEN plano = 'member' THEN 1 END) AS member_plans,
    COUNT(CASE WHEN plano = 'pro' THEN 1 END) AS pro_plans,
    COUNT(CASE WHEN plano = 'elite' THEN 1 END) AS elite_plans
FROM
    profiles;

-- Verificar permissões da tabela profiles
SELECT
    table_schema,
    table_name,
    privilege_type,
    grantee
FROM
    information_schema.table_privileges
WHERE
    table_name = 'profiles'
ORDER BY
    privilege_type,
    grantee; 