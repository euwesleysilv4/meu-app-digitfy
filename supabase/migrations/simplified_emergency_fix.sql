-- Script SQL simplificado para resolver o problema da referência à coluna data_expiracao_plano
-- Esta versão evita o uso da tabela "role_column_grants" que não existe

-- 1. Apenas recriar as funções relacionadas ao plano do usuário
-- Esta é a parte mais importante para resolver o problema

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

-- 2. Recriar a view profiles_admin_view, se existir
DO $$
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
END $$;

-- 3. Conceder permissões para usuários autenticados
GRANT EXECUTE ON FUNCTION public.update_user_plan_v2 TO authenticated;
GRANT EXECUTE ON FUNCTION public.force_update_user_plan TO authenticated;

-- 4. Remover colunas problemáticas se ainda existirem
DO $$
BEGIN
    -- Tentar remover data_expiracao_plano se existir
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'data_expiracao_plano'
    ) THEN
        ALTER TABLE public.profiles DROP COLUMN data_expiracao_plano CASCADE;
        RAISE NOTICE 'Coluna data_expiracao_plano removida com sucesso';
    END IF;

    -- Tentar remover a coluna 'plan' duplicada se existir
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'plan'
    ) THEN
        ALTER TABLE public.profiles DROP COLUMN plan CASCADE;
        RAISE NOTICE 'Coluna plan (duplicada) removida com sucesso';
    END IF;
END $$; 