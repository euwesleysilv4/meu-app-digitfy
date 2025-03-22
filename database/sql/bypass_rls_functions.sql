-- Funções seguras para contornar restrições RLS
-- Estas funções usam SECURITY DEFINER para permitir acesso aos dados mesmo com RLS ativo

-- Função para obter os dados do próprio perfil
CREATE OR REPLACE FUNCTION public.get_own_profile()
RETURNS SETOF profiles
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
    current_user_id UUID;
BEGIN
    -- Obter o ID do usuário atual
    current_user_id := auth.uid();
    
    -- Verificar se o usuário está autenticado
    IF current_user_id IS NULL THEN
        RAISE EXCEPTION 'Usuário não autenticado';
        RETURN;
    END IF;
    
    -- Retornar o perfil do usuário contornando RLS
    RETURN QUERY
    SELECT *
    FROM profiles
    WHERE id = current_user_id;
END;
$$;

-- Função para obter o plano atual do usuário
CREATE OR REPLACE FUNCTION public.get_current_user_plan()
RETURNS TEXT
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
    current_user_id UUID;
    user_plan TEXT;
BEGIN
    -- Obter o ID do usuário atual
    current_user_id := auth.uid();
    
    -- Verificar se o usuário está autenticado
    IF current_user_id IS NULL THEN
        RAISE EXCEPTION 'Usuário não autenticado';
        RETURN NULL;
    END IF;
    
    -- Consultar o plano do usuário diretamente
    SELECT plano::TEXT INTO user_plan
    FROM profiles
    WHERE id = current_user_id;
    
    RETURN user_plan;
END;
$$;

-- Função para atualizar o perfil do próprio usuário
CREATE OR REPLACE FUNCTION public.update_own_profile(
    profile_updates JSONB
)
RETURNS JSONB
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
    current_user_id UUID;
    updated_profile JSONB;
BEGIN
    -- Obter o ID do usuário atual
    current_user_id := auth.uid();
    
    -- Verificar se o usuário está autenticado
    IF current_user_id IS NULL THEN
        RAISE EXCEPTION 'Usuário não autenticado';
        RETURN NULL;
    END IF;
    
    -- Atualizar o perfil com os campos fornecidos
    WITH updated AS (
        UPDATE profiles
        SET
            nome = COALESCE(profile_updates->>'nome', nome),
            avatar_url = COALESCE(profile_updates->>'avatar_url', avatar_url),
            whatsapp = COALESCE(profile_updates->>'whatsapp', whatsapp),
            notificacoes_ativas = COALESCE((profile_updates->>'notificacoes_ativas')::boolean, notificacoes_ativas),
            data_modificacao = NOW()
        WHERE id = current_user_id
        RETURNING *
    )
    SELECT row_to_json(updated)::jsonb INTO updated_profile FROM updated;
    
    RETURN updated_profile;
END;
$$;

-- Função específica para sincronizar o plano do usuário
CREATE OR REPLACE FUNCTION public.sync_user_plan()
RETURNS TEXT
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
    current_user_id UUID;
    user_plan TEXT;
BEGIN
    -- Obter o ID do usuário atual
    current_user_id := auth.uid();
    
    -- Verificar se o usuário está autenticado
    IF current_user_id IS NULL THEN
        RAISE EXCEPTION 'Usuário não autenticado';
        RETURN NULL;
    END IF;
    
    -- Consultar o plano do usuário diretamente
    SELECT plano::TEXT INTO user_plan
    FROM profiles
    WHERE id = current_user_id;
    
    -- Registrar a sincronização no log
    INSERT INTO profile_changes(
        user_id, 
        field_changed, 
        old_value, 
        new_value, 
        changed_by, 
        change_details
    )
    VALUES (
        current_user_id, 
        'plano', 
        user_plan, 
        user_plan, 
        current_user_id,
        'Sincronização manual do plano'
    );
    
    RETURN user_plan;
END;
$$;

-- Conceder permissões para usuários autenticados chamarem estas funções
GRANT EXECUTE ON FUNCTION public.get_own_profile TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_current_user_plan TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_own_profile TO authenticated;
GRANT EXECUTE ON FUNCTION public.sync_user_plan TO authenticated; 