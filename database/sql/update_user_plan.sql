-- Função para atualizar o plano de um usuário
-- Esta função é segura e só pode ser executada por administradores
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
    
    -- Registrar a alteração em uma tabela de log (opcional)
    -- INSERT INTO profile_changes (user_id, field_changed, old_value, new_value, changed_by)
    -- VALUES (user_id, 'plano', current_plan::text, new_plan::text, auth.uid());
    
    RETURN FOUND;
END;
$$;

-- Criar uma RPC para chamar a função de atualização de plano
-- Esta chamada de função pode ser usada diretamente pelo cliente frontend
COMMENT ON FUNCTION public.update_user_plan_v2 IS 'Atualiza o plano de um usuário específico. Apenas administradores podem executar esta função.';

-- Conceder permissão para autenticados chamarem a função
GRANT EXECUTE ON FUNCTION public.update_user_plan_v2 TO authenticated; 