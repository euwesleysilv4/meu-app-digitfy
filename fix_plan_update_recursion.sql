-- Script para corrigir o problema de "stack depth limit exceeded" na atualização de planos
-- Este script remove as colunas não utilizadas e corrige a função de atualização do plano

-- 1. Verificar e remover a coluna data_expiracao_plano se existir
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'data_expiracao_plano'
    ) THEN
        ALTER TABLE public.profiles DROP COLUMN data_expiracao_plano;
        RAISE NOTICE 'Coluna data_expiracao_plano removida com sucesso';
    ELSE
        RAISE NOTICE 'A coluna data_expiracao_plano não existe';
    END IF;
END $$;

-- 2. Recriando a função update_user_plan_v2 para garantir que não há recursão
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

-- 3. Recriar a função de força atualização para ser mais simples e robusta
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
    -- Atualização direta e simples sem verificações adicionais
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