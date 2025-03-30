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
    -- Desabilitar temporariamente os triggers para evitar recursão
    SET LOCAL session_replication_role = 'replica';
    
    UPDATE profiles
    SET 
        plano = new_plan,
        data_modificacao = NOW()
    WHERE id = user_id;
    
    -- Restaurar o comportamento normal dos triggers
    SET LOCAL session_replication_role = 'origin';
    
    -- Atualizar diretamente os metadados do usuário para evitar chamada recursiva
    UPDATE auth.users
    SET raw_user_meta_data = 
        COALESCE(raw_user_meta_data, '{}'::jsonb) || 
        jsonb_build_object(
            'plano', new_plan::TEXT,
            'plano_updated_at', now()
        )
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
    -- Desabilitar temporariamente os triggers para evitar recursão
    SET LOCAL session_replication_role = 'replica';
    
    -- Atualização direta e simples sem verificações adicionais
    UPDATE profiles
    SET 
        plano = new_plan,
        data_modificacao = NOW()
    WHERE id = user_id;
    
    -- Restaurar o comportamento normal dos triggers
    SET LOCAL session_replication_role = 'origin';
    
    -- Atualizar diretamente os metadados do usuário para evitar chamada recursiva
    UPDATE auth.users
    SET raw_user_meta_data = 
        COALESCE(raw_user_meta_data, '{}'::jsonb) || 
        jsonb_build_object(
            'plano', new_plan::TEXT,
            'plano_updated_at', now()
        )
    WHERE id = user_id;
    
    RETURN FOUND;
END;
$$;

-- 4. Corrigir a função sync_user_plan_v2 para evitar recursão
CREATE OR REPLACE FUNCTION public.sync_user_plan_v2(user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    current_plan TEXT;
    result BOOLEAN;
BEGIN
    -- Usar variável de sessão para evitar recursão
    IF current_setting('my.sync_in_progress', true) = 'true' THEN
        RETURN true; -- Já está em andamento, saia sem fazer nada
    END IF;
    
    -- Definir flag de sincronização em andamento
    PERFORM set_config('my.sync_in_progress', 'true', true);
    
    -- Obter o plano atual da tabela profiles
    SELECT plano::TEXT INTO current_plan
    FROM public.profiles
    WHERE id = user_id;
    
    IF current_plan IS NULL THEN
        -- Limpar flag
        PERFORM set_config('my.sync_in_progress', 'false', true);
        RETURN FALSE;
    END IF;
    
    BEGIN
        -- Atualizar os metadados do usuário
        UPDATE auth.users
        SET raw_user_meta_data = 
            COALESCE(raw_user_meta_data, '{}'::jsonb) || 
            jsonb_build_object(
                'plano', current_plan,
                'plano_updated_at', now()
            )
        WHERE id = user_id;
        
        result := TRUE;
    EXCEPTION WHEN OTHERS THEN
        result := FALSE;
    END;
    
    -- Limpar flag de sincronização
    PERFORM set_config('my.sync_in_progress', 'false', true);
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Corrigir o trigger para ser mais seguro
CREATE OR REPLACE FUNCTION public.trigger_sync_plan_v2()
RETURNS TRIGGER AS $$
BEGIN
    -- Se o plano foi alterado, sincronizar com auth.users
    IF NEW.plano IS DISTINCT FROM OLD.plano THEN
        -- Verificação adicional de segurança para evitar recursão
        IF current_setting('my.trigger_in_progress', true) != 'true' THEN
            PERFORM set_config('my.trigger_in_progress', 'true', true);
            PERFORM public.sync_user_plan_v2(NEW.id);
            PERFORM set_config('my.trigger_in_progress', 'false', true);
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Remover e recriar o trigger
DROP TRIGGER IF EXISTS sync_plan_trigger_v2 ON public.profiles;

CREATE TRIGGER sync_plan_trigger_v2
AFTER UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.trigger_sync_plan_v2();

-- 7. Conceder permissões
GRANT EXECUTE ON FUNCTION public.update_user_plan_v2 TO authenticated;
GRANT EXECUTE ON FUNCTION public.force_update_user_plan TO authenticated;
GRANT EXECUTE ON FUNCTION public.sync_user_plan_v2 TO authenticated;
GRANT EXECUTE ON FUNCTION public.trigger_sync_plan_v2 TO authenticated;

-- Comentários para documentação
COMMENT ON FUNCTION public.update_user_plan_v2 IS 'Atualiza o plano de um usuário. Apenas o administrador pode executar esta função.';
COMMENT ON FUNCTION public.force_update_user_plan IS 'Força a atualização do plano de um usuário sem verificações adicionais. Use com cuidado.';
COMMENT ON FUNCTION public.sync_user_plan_v2 IS 'Sincroniza o plano do usuário entre as tabelas profiles e auth.users (versão 2) com proteção contra recursão.';
COMMENT ON FUNCTION public.trigger_sync_plan_v2 IS 'Função de gatilho para sincronizar o plano quando alterado (versão 2) com proteção contra recursão.'; 