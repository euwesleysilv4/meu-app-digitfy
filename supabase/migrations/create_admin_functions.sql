-- Função para verificar se o usuário atual é o administrador específico
CREATE OR REPLACE FUNCTION is_specific_admin()
RETURNS BOOLEAN AS $$
DECLARE
  is_admin BOOLEAN;
BEGIN
  -- Verificar se o usuário atual tem a flag isAdmin definida como true nos metadados
  -- OU se tem o papel de admin no perfil
  SELECT EXISTS (
    SELECT 1 
    FROM auth.users u
    LEFT JOIN public.profiles p ON u.id = p.id
    WHERE u.id = auth.uid() 
    AND (
      u.raw_user_meta_data->>'isAdmin' = 'true'
      OR p.role = 'admin'
    )
  ) INTO is_admin;
  
  RETURN is_admin;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para verificar se o usuário atual é qualquer tipo de administrador
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
DECLARE
  is_admin BOOLEAN;
BEGIN
  -- Verificar se o usuário atual tem a flag isAdmin definida como true nos metadados
  -- ou se tem o papel de 'admin' no perfil
  SELECT EXISTS (
    SELECT 1 FROM auth.users u
    LEFT JOIN public.profiles p ON u.id = p.id
    WHERE u.id = auth.uid() 
    AND (
      u.raw_user_meta_data->>'isAdmin' = 'true'
      OR p.role = 'admin'
    )
  ) INTO is_admin;
  
  RETURN is_admin;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para listar todos os usuários (para administradores)
CREATE OR REPLACE FUNCTION list_all_users(
  search_term TEXT DEFAULT NULL,
  filter_plan TEXT DEFAULT NULL
)
RETURNS SETOF profiles AS $$
BEGIN
  -- Verificar se o usuário atual é o administrador específico
  IF NOT (SELECT is_specific_admin()) THEN
    RAISE EXCEPTION 'Permissão negada: Apenas o administrador autorizado pode listar usuários';
  END IF;

  RETURN QUERY
  SELECT * FROM profiles
  WHERE 
    (search_term IS NULL OR 
     email ILIKE '%' || search_term || '%' OR
     nome ILIKE '%' || search_term || '%' OR
     instagram ILIKE '%' || search_term || '%') 
    AND
    (filter_plan IS NULL OR plano = filter_plan)
  ORDER BY created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para atualizar o plano de um usuário (para administradores)
CREATE OR REPLACE FUNCTION update_user_plan_v2(
  user_id UUID,
  new_plan TEXT
)
RETURNS BOOLEAN AS $$
BEGIN
  -- Verificar se o usuário atual é o administrador específico
  IF NOT (SELECT is_specific_admin()) THEN
    RAISE EXCEPTION 'Permissão negada: Apenas o administrador autorizado pode atualizar planos';
  END IF;

  -- Atualizar o plano do usuário
  UPDATE profiles
  SET 
    plano = new_plan,
    updated_at = NOW()
  WHERE id = user_id;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para atualizar o papel de um usuário (para administradores)
CREATE OR REPLACE FUNCTION update_user_role_v2(
  user_id UUID,
  new_role TEXT
)
RETURNS BOOLEAN AS $$
BEGIN
  -- Verificar se o usuário atual é o administrador específico
  IF NOT (SELECT is_specific_admin()) THEN
    RAISE EXCEPTION 'Permissão negada: Apenas o administrador autorizado pode atualizar papéis';
  END IF;

  -- Atualizar o papel do usuário
  UPDATE profiles
  SET 
    role = new_role,
    updated_at = NOW()
  WHERE id = user_id;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para banir/desbanir um usuário (para administradores)
CREATE OR REPLACE FUNCTION toggle_user_ban(
  user_id UUID,
  is_banned BOOLEAN
)
RETURNS BOOLEAN AS $$
BEGIN
  -- Verificar se o usuário atual é o administrador específico
  IF NOT (SELECT is_specific_admin()) THEN
    RAISE EXCEPTION 'Permissão negada: Apenas o administrador autorizado pode banir usuários';
  END IF;

  -- Atualizar o status de banimento do usuário
  UPDATE profiles
  SET 
    is_banned = toggle_user_ban.is_banned,
    updated_at = NOW()
  WHERE id = user_id;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para promover um usuário a administrador (para administradores)
CREATE OR REPLACE FUNCTION promote_to_admin(
  user_id UUID
)
RETURNS BOOLEAN AS $$
BEGIN
  -- Verificar se o usuário atual é o administrador específico
  IF NOT (SELECT is_specific_admin()) THEN
    RAISE EXCEPTION 'Permissão negada: Apenas o administrador autorizado pode promover usuários';
  END IF;

  -- Atualizar o papel do usuário para 'admin'
  UPDATE profiles
  SET 
    role = 'admin',
    updated_at = NOW()
  WHERE id = user_id;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Remover funções existentes antes de recriar
DROP FUNCTION IF EXISTS check_user_permission();

-- Função para verificar permissão de usuário
CREATE OR REPLACE FUNCTION check_user_permission()
RETURNS TABLE (
  is_authenticated BOOLEAN,
  user_id UUID,
  is_admin BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    auth.uid() IS NOT NULL AS is_authenticated,
    auth.uid() AS user_id,
    (SELECT is_admin()) AS is_admin;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 