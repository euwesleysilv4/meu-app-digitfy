-- Função para verificar se um usuário é administrador
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- Função para promover um usuário a administrador
-- Somente administradores podem executar esta função
CREATE OR REPLACE FUNCTION public.promote_to_admin(
    user_id UUID
)
RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
    is_caller_admin BOOLEAN;
BEGIN
    -- Verificar se o usuário que está executando é um administrador
    SELECT EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid() AND role = 'admin'
    ) INTO is_caller_admin;
    
    -- Se não for administrador, retornar falso
    IF NOT is_caller_admin THEN
        RAISE EXCEPTION 'Permissão negada: Apenas administradores podem promover usuários';
        RETURN FALSE;
    END IF;
    
    -- Atualizar o papel do usuário para administrador
    UPDATE profiles
    SET 
        role = 'admin',
        data_modificacao = NOW()
    WHERE id = user_id;
    
    RETURN FOUND;
END;
$$;

-- Função para alterar o papel de um usuário (user, moderator, admin)
CREATE OR REPLACE FUNCTION public.update_user_role_v2(
    user_id UUID,
    new_role user_role
)
RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
    is_caller_admin BOOLEAN;
BEGIN
    -- Verificar se o usuário que está executando é um administrador
    SELECT EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid() AND role = 'admin'
    ) INTO is_caller_admin;
    
    -- Se não for administrador, retornar falso
    IF NOT is_caller_admin THEN
        RAISE EXCEPTION 'Permissão negada: Apenas administradores podem alterar papéis de usuários';
        RETURN FALSE;
    END IF;
    
    -- Atualizar o papel do usuário
    UPDATE profiles
    SET 
        role = new_role,
        data_modificacao = NOW()
    WHERE id = user_id;
    
    RETURN FOUND;
END;
$$;

-- Conceder permissão para autenticados chamarem as funções
COMMENT ON FUNCTION public.is_admin IS 'Verifica se o usuário atual é um administrador.';
COMMENT ON FUNCTION public.promote_to_admin IS 'Promove um usuário a administrador. Apenas administradores podem executar esta função.';
COMMENT ON FUNCTION public.update_user_role_v2 IS 'Atualiza o papel de um usuário. Apenas administradores podem executar esta função.';

GRANT EXECUTE ON FUNCTION public.is_admin TO authenticated;
GRANT EXECUTE ON FUNCTION public.promote_to_admin TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_user_role_v2 TO authenticated; 