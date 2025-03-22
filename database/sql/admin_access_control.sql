-- Arquivo: admin_access_control.sql
-- Este arquivo configura as políticas de acesso para permitir que apenas
-- o usuário com email específico tenha acesso às funcionalidades de administrador.

-- 1. Garantir que a tabela profiles tenha um índice para email para consultas rápidas
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'profiles_email_idx') THEN
        CREATE INDEX IF NOT EXISTS profiles_email_idx ON profiles(email);
    END IF;
END $$;

-- 2. Criar uma função para verificar se o usuário atual é o administrador específico
CREATE OR REPLACE FUNCTION public.is_specific_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND email = 'wexxxleycomercial@gmail.com'
  );
$$;

-- 3. Promover o usuário específico a administrador (caso ainda não seja)
DO $$
DECLARE
  admin_user_id UUID;
  admin_exists BOOLEAN;
BEGIN
  -- Verificar se o usuário com email específico existe
  SELECT id, (role = 'admin') INTO admin_user_id, admin_exists
  FROM profiles
  WHERE email = 'wexxxleycomercial@gmail.com'
  LIMIT 1;
  
  -- Se o usuário existe, mas não é admin, promovê-lo
  IF admin_user_id IS NOT NULL AND NOT admin_exists THEN
    UPDATE profiles
    SET role = 'admin',
        data_modificacao = NOW()
    WHERE id = admin_user_id;
    
    RAISE NOTICE 'Usuário wexxxleycomercial@gmail.com promovido a administrador.';
  ELSIF admin_user_id IS NULL THEN
    RAISE NOTICE 'Usuário wexxxleycomercial@gmail.com não encontrado no banco de dados.';
  ELSE
    RAISE NOTICE 'Usuário wexxxleycomercial@gmail.com já é administrador.';
  END IF;
END$$;

-- 4. Remover políticas antigas e criar novas políticas mais restritas
-- Modificar as políticas de administrador para permitir apenas o administrador específico
DROP POLICY IF EXISTS "Administradores podem ver todos os perfis" ON profiles;
DROP POLICY IF EXISTS "Administradores podem atualizar todos os perfis" ON profiles;

-- Nova política para permitir que apenas o administrador específico veja todos os perfis
CREATE POLICY "Administrador específico pode ver todos os perfis"
ON profiles FOR SELECT
USING (
  is_specific_admin()
);

-- Nova política para permitir que apenas o administrador específico atualize todos os perfis
CREATE POLICY "Administrador específico pode atualizar todos os perfis"
ON profiles FOR UPDATE
USING (
  is_specific_admin()
);

-- 5. Sobrescrever as funções RPC para verificar o email específico
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
    is_specific_admin BOOLEAN;
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

    -- Verificar se o usuário que está executando é o administrador específico
    SELECT EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid() AND email = 'wexxxleycomercial@gmail.com'
    ) INTO is_specific_admin;
    
    -- Se não for o administrador específico, retornar falso
    IF NOT is_specific_admin THEN
        RAISE EXCEPTION 'Permissão negada: Apenas o administrador autorizado pode atualizar planos de usuários';
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
    
    -- Registrar a alteração em um log
    INSERT INTO profile_changes(user_id, field_changed, old_value, new_value, changed_by)
    VALUES (user_id, 'plano', current_plan::text, new_plan::text, auth.uid());
    
    RETURN FOUND;
END;
$$;

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
    is_specific_admin BOOLEAN;
BEGIN
    -- Verificar se o usuário que está executando é o administrador específico
    SELECT EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid() AND email = 'wexxxleycomercial@gmail.com'
    ) INTO is_specific_admin;
    
    -- Se não for o administrador específico, retornar um conjunto vazio
    IF NOT is_specific_admin THEN
        RAISE EXCEPTION 'Permissão negada: Apenas o administrador autorizado pode listar todos os usuários';
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
    is_specific_admin BOOLEAN;
BEGIN
    -- Verificar se o usuário que está executando é o administrador específico
    SELECT EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid() AND email = 'wexxxleycomercial@gmail.com'
    ) INTO is_specific_admin;
    
    -- Se não for o administrador específico, retornar falso
    IF NOT is_specific_admin THEN
        RAISE EXCEPTION 'Permissão negada: Apenas o administrador autorizado pode alterar papéis de usuários';
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

-- Adicionar função para banir/desbanir usuários
CREATE OR REPLACE FUNCTION public.toggle_user_ban(
    user_id UUID,
    is_banned BOOLEAN
)
RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
    is_specific_admin BOOLEAN;
    profile_exists BOOLEAN;
    current_ban_status BOOLEAN;
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

    -- Verificar se o usuário que está executando é o administrador específico
    SELECT EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid() AND email = 'wexxxleycomercial@gmail.com'
    ) INTO is_specific_admin;
    
    -- Se não for o administrador específico, retornar falso
    IF NOT is_specific_admin THEN
        RAISE EXCEPTION 'Permissão negada: Apenas o administrador autorizado pode banir/desbanir usuários';
        RETURN FALSE;
    END IF;
    
    -- Obter o status atual de banimento para não atualizar se for o mesmo
    SELECT banido INTO current_ban_status FROM profiles WHERE id = user_id;
    
    -- Se o status for o mesmo, não precisa atualizar
    IF current_ban_status IS NOT DISTINCT FROM is_banned THEN
        RETURN TRUE;
    END IF;
    
    -- Atualizar o status de banimento do usuário
    UPDATE profiles
    SET 
        banido = is_banned,
        data_modificacao = NOW()
    WHERE id = user_id;
    
    -- Registrar a alteração em um log
    INSERT INTO profile_changes(user_id, field_changed, old_value, new_value, changed_by)
    VALUES (user_id, 'banido', current_ban_status::text, is_banned::text, auth.uid());
    
    RETURN FOUND;
END;
$$;

-- 6. Criar uma tabela de log para rastrear alterações nos perfis (se ainda não existir)
CREATE TABLE IF NOT EXISTS profile_changes (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id),
  field_changed TEXT NOT NULL,
  old_value TEXT,
  new_value TEXT,
  changed_by UUID NOT NULL,
  change_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índice para melhorar a performance das consultas de log
CREATE INDEX IF NOT EXISTS profile_changes_user_id_idx ON profile_changes(user_id);
CREATE INDEX IF NOT EXISTS profile_changes_changed_by_idx ON profile_changes(changed_by);

-- 7. Comentários e permissões para as funções
COMMENT ON FUNCTION public.is_specific_admin IS 'Verifica se o usuário atual é o administrador específico.';
COMMENT ON FUNCTION public.update_user_plan_v2 IS 'Atualiza o plano de um usuário. Apenas o administrador específico pode executar esta função.';
COMMENT ON FUNCTION public.list_all_users IS 'Lista todos os usuários do sistema. Apenas o administrador específico pode executar esta função.';
COMMENT ON FUNCTION public.update_user_role_v2 IS 'Atualiza o papel de um usuário. Apenas o administrador específico pode executar esta função.';
COMMENT ON FUNCTION public.toggle_user_ban IS 'Altera o status de banimento de um usuário. Apenas o administrador específico pode executar esta função.';

-- Conceder permissão para todos os usuários autenticados chamarem essas funções
GRANT EXECUTE ON FUNCTION public.is_specific_admin TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_user_plan_v2 TO authenticated;
GRANT EXECUTE ON FUNCTION public.list_all_users TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_user_role_v2 TO authenticated;
GRANT EXECUTE ON FUNCTION public.toggle_user_ban TO authenticated; 