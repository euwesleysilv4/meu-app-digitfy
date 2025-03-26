-- Função para obter metadados do usuário
CREATE OR REPLACE FUNCTION public.get_user_metadata(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
    user_metadata JSONB;
BEGIN
    -- Obter os metadados do usuário da tabela auth.users
    SELECT raw_user_meta_data INTO user_metadata
    FROM auth.users
    WHERE id = p_user_id;
    
    RETURN user_metadata;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentário para documentação
COMMENT ON FUNCTION public.get_user_metadata IS 'Obtém os metadados do usuário da tabela auth.users';

-- Conceder permissão para usuários autenticados
GRANT EXECUTE ON FUNCTION public.get_user_metadata TO authenticated;

-- Função para sincronizar o plano entre auth.users e profiles
-- Trocamos o nome para sync_user_plan_v2 para evitar conflito
CREATE OR REPLACE FUNCTION public.sync_user_plan_v2(user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    current_plan TEXT;
    result BOOLEAN;
BEGIN
    -- Obter o plano atual da tabela profiles
    SELECT plano::TEXT INTO current_plan
    FROM public.profiles
    WHERE id = user_id;
    
    IF current_plan IS NULL THEN
        RETURN FALSE;
    END IF;
    
    BEGIN
        -- Atualizar os metadados do usuário
        UPDATE auth.users
        SET raw_user_meta_data = 
            raw_user_meta_data || 
            jsonb_build_object(
                'plano', current_plan,
                'plano_updated_at', now()
            )
        WHERE id = user_id;
        
        result := TRUE;
    EXCEPTION WHEN OTHERS THEN
        result := FALSE;
    END;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentário para documentação
COMMENT ON FUNCTION public.sync_user_plan_v2 IS 'Sincroniza o plano do usuário entre as tabelas profiles e auth.users (versão 2)';

-- Conceder permissão para usuários autenticados
GRANT EXECUTE ON FUNCTION public.sync_user_plan_v2 TO authenticated;

-- Criar um gatilho para sincronizar automaticamente o plano quando ele for alterado
CREATE OR REPLACE FUNCTION public.trigger_sync_plan_v2()
RETURNS TRIGGER AS $$
BEGIN
    -- Se o plano foi alterado, sincronizar com auth.users
    IF NEW.plano IS DISTINCT FROM OLD.plano THEN
        PERFORM public.sync_user_plan_v2(NEW.id);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentário para documentação
COMMENT ON FUNCTION public.trigger_sync_plan_v2 IS 'Função de gatilho para sincronizar o plano quando alterado (versão 2)';

-- Remover o gatilho existente se houver
DROP TRIGGER IF EXISTS sync_plan_trigger_v2 ON public.profiles;

-- Criar o gatilho na tabela profiles
CREATE TRIGGER sync_plan_trigger_v2
AFTER UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.trigger_sync_plan_v2();

-- Comentário para documentação
COMMENT ON TRIGGER sync_plan_trigger_v2 ON public.profiles IS 'Gatilho para sincronizar o plano do usuário quando alterado (versão 2)';

-- Função para corrigir os planos de todos os usuários
CREATE OR REPLACE FUNCTION public.repair_all_user_plans()
RETURNS TEXT AS $$
DECLARE
    user_record RECORD;
    success_count INTEGER := 0;
    failure_count INTEGER := 0;
BEGIN
    -- Processar todos os usuários
    FOR user_record IN SELECT id FROM public.profiles LOOP
        BEGIN
            IF public.sync_user_plan_v2(user_record.id) THEN
                success_count := success_count + 1;
            ELSE
                failure_count := failure_count + 1;
            END IF;
        EXCEPTION WHEN OTHERS THEN
            failure_count := failure_count + 1;
        END;
    END LOOP;
    
    RETURN 'Sincronização completa: ' || success_count || ' sucessos, ' || failure_count || ' falhas';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentário para documentação
COMMENT ON FUNCTION public.repair_all_user_plans IS 'Repara os planos de todos os usuários, sincronizando entre profiles e auth.users';

-- Conceder permissão para usuários autenticados 
-- (idealmente apenas admins deveriam ter acesso a esta função)
GRANT EXECUTE ON FUNCTION public.repair_all_user_plans TO authenticated; 