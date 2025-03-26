-- Funções RPC para diagnóstico do sistema
-- Executar este script no SQL Editor do Supabase

-- Função para verificar se uma tabela tem RLS habilitado
CREATE OR REPLACE FUNCTION check_table_rls(table_name TEXT)
RETURNS BOOLEAN
SECURITY DEFINER
AS $$
DECLARE
    rls_enabled BOOLEAN;
BEGIN
    SELECT relrowsecurity INTO rls_enabled
    FROM pg_class
    WHERE oid = (quote_ident('public') || '.' || quote_ident(table_name))::regclass;
    
    RETURN rls_enabled;
EXCEPTION WHEN OTHERS THEN
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Função para obter políticas RLS de uma tabela
CREATE OR REPLACE FUNCTION get_policies_for_table(table_name TEXT)
RETURNS JSON
SECURITY DEFINER
AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_agg(policies)
    INTO result
    FROM (
        SELECT 
            policyname AS policy_name,
            permissive,
            cmd AS operation,
            roles.rolname AS role_name,
            with_check AS with_check_expression,
            qual AS using_expression
        FROM pg_policy
        JOIN pg_class ON pg_class.oid = pg_policy.polrelid
        LEFT JOIN pg_roles AS roles ON pg_policy.polrole = roles.oid
        WHERE pg_class.relname = table_name
          AND pg_class.relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
    ) AS policies;
    
    RETURN result;
EXCEPTION WHEN OTHERS THEN
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Função simplificada para contar produtos
CREATE OR REPLACE FUNCTION count_products()
RETURNS JSON
SECURITY DEFINER
AS $$
DECLARE
    recommended_count INTEGER;
    submitted_count INTEGER;
    recommended_error TEXT;
    submitted_error TEXT;
BEGIN
    BEGIN
        SELECT COUNT(*) INTO recommended_count FROM public.recommended_products;
    EXCEPTION WHEN OTHERS THEN
        recommended_error := SQLERRM;
        recommended_count := 0;
    END;
    
    BEGIN
        SELECT COUNT(*) INTO submitted_count FROM public.submitted_products;
    EXCEPTION WHEN OTHERS THEN
        submitted_error := SQLERRM;
        submitted_count := 0;
    END;
    
    RETURN json_build_object(
        'recommended', json_build_object(
            'count', recommended_count,
            'error', recommended_error
        ),
        'submitted', json_build_object(
            'count', submitted_count,
            'error', submitted_error
        )
    );
END;
$$ LANGUAGE plpgsql; 