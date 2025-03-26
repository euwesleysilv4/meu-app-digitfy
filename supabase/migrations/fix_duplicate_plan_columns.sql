-- Script para resolver o problema de colunas duplicadas para plano de usuário
-- Este script remove a coluna 'plan' (text) e mantém apenas a coluna 'plano' (user_plan)

-- 1. Verificar se a coluna duplicada 'plan' existe
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'plan'
    ) THEN
        -- Usar CASCADE para remover objetos dependentes também
        ALTER TABLE public.profiles DROP COLUMN plan CASCADE;
        RAISE NOTICE 'Coluna plan (duplicada) removida com sucesso (incluindo objetos dependentes)';
        
        -- Se existirem views que dependiam dela, recriar essas views sem a coluna removida
        -- Por exemplo, se existir uma view profiles_admin_view:
        IF EXISTS (
            SELECT 1 FROM pg_views WHERE viewname = 'profiles_admin_view'
        ) THEN
            CREATE OR REPLACE VIEW profiles_admin_view AS
            SELECT 
                id, 
                nome, 
                email, 
                avatar_url, 
                status, 
                plano, -- note que usamos apenas 'plano', não 'plan'
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
            
            RAISE NOTICE 'View profiles_admin_view recriada sem a coluna plan duplicada';
        END IF;
    ELSE
        RAISE NOTICE 'A coluna plan (duplicada) não existe';
    END IF;
END $$;

-- 2. Atualizar a função force_update_user_plan para garantir que usa apenas 'plano'
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

-- 3. Atualizar a função update_user_plan_v2 para garantir que usa apenas 'plano'
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

-- 4. Conceder permissão para os usuários autenticados chamarem as funções
GRANT EXECUTE ON FUNCTION public.update_user_plan_v2 TO authenticated;
GRANT EXECUTE ON FUNCTION public.force_update_user_plan TO authenticated;

-- Comentário para documentação
COMMENT ON FUNCTION public.update_user_plan_v2 IS 'Atualiza o plano de um usuário. Apenas o administrador pode executar esta função.';
COMMENT ON FUNCTION public.force_update_user_plan IS 'Força a atualização do plano de um usuário sem verificações adicionais. Use com cuidado.'; 