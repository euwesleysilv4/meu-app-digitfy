-- Função para listar todos os usuários
-- Esta função é segura e só pode ser executada por administradores
CREATE OR REPLACE FUNCTION public.list_all_users(
    search_term TEXT DEFAULT NULL,
    filter_plan user_plan DEFAULT NULL
)
RETURNS SETOF profiles
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
    is_admin BOOLEAN;
BEGIN
    -- Verificar se o usuário que está executando é um administrador
    SELECT EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid() AND role = 'admin'
    ) INTO is_admin;
    
    -- Se não for administrador, retornar um conjunto vazio
    IF NOT is_admin THEN
        RAISE EXCEPTION 'Permissão negada: Apenas administradores podem listar todos os usuários';
        RETURN;
    END IF;
    
    -- Retornar os usuários com base nos filtros
    RETURN QUERY
    SELECT *
    FROM profiles
    WHERE 
        (search_term IS NULL OR 
         nome ILIKE '%' || search_term || '%' OR 
         email ILIKE '%' || search_term || '%')
        AND
        (filter_plan IS NULL OR plano = filter_plan)
    ORDER BY data_criacao DESC;
END;
$$;

-- Criar uma RPC para chamar a função de listagem de usuários
-- Esta chamada de função pode ser usada diretamente pelo cliente frontend
COMMENT ON FUNCTION public.list_all_users IS 'Lista todos os usuários do sistema. Apenas administradores podem executar esta função.';

-- Conceder permissão para autenticados chamarem a função
GRANT EXECUTE ON FUNCTION public.list_all_users TO authenticated; 