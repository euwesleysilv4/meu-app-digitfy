-- SCRIPT DE EMERGÊNCIA PARA RESOLVER O PROBLEMA DE RECURSÃO INFINITA
-- Execute este script no console SQL do Supabase imediatamente para resolver o problema

BEGIN;

-- Etapa 1: Desativar os triggers problemáticos
DROP TRIGGER IF EXISTS sync_plan_trigger_v2 ON public.profiles;
DROP TRIGGER IF EXISTS sync_plan_trigger ON public.profiles;
DROP TRIGGER IF EXISTS on_profile_updated ON public.profiles;

-- Etapa 2: Remover as funções problemáticas
DROP FUNCTION IF EXISTS public.sync_user_plan(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.sync_user_plan_v2(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.trigger_sync_plan() CASCADE;
DROP FUNCTION IF EXISTS public.trigger_sync_plan_v2() CASCADE;

-- Etapa 3: Recriar a função sync_user_plan_v2 com proteção contra recursão
CREATE OR REPLACE FUNCTION public.sync_user_plan_v2(user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    current_plan TEXT;
    result BOOLEAN;
BEGIN
    -- Proteção contra recursão
    -- Se a função já estiver sendo executada, saia imediatamente
    IF NULLIF(current_setting('my.sync_in_progress', true), '')::boolean IS TRUE THEN
        RETURN true;
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

-- Etapa 4: Recriar o trigger com proteção contra recursão
CREATE OR REPLACE FUNCTION public.trigger_sync_plan_v2()
RETURNS TRIGGER AS $$
BEGIN
    -- Se o plano foi alterado, sincronizar com auth.users
    IF NEW.plano IS DISTINCT FROM OLD.plano THEN
        -- Verificação adicional de segurança para evitar recursão
        IF NULLIF(current_setting('my.trigger_in_progress', true), '')::boolean IS NOT TRUE THEN
            PERFORM set_config('my.trigger_in_progress', 'true', true);
            
            -- Não chamar sync_user_plan_v2 aqui, fazer a atualização diretamente
            -- para evitar recursão
            UPDATE auth.users
            SET raw_user_meta_data = 
                COALESCE(raw_user_meta_data, '{}'::jsonb) || 
                jsonb_build_object(
                    'plano', NEW.plano::TEXT,
                    'plano_updated_at', now()
                )
            WHERE id = NEW.id;
            
            PERFORM set_config('my.trigger_in_progress', 'false', true);
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Etapa 5: Recriar o trigger com a nova função
CREATE TRIGGER sync_plan_trigger_v2
AFTER UPDATE ON public.profiles
FOR EACH ROW
WHEN (NEW.plano IS DISTINCT FROM OLD.plano)
EXECUTE FUNCTION public.trigger_sync_plan_v2();

-- Etapa 6: Verificar e remover políticas RLS problemáticas que podem causar recursão
DO $$
DECLARE
    v_policy_exists boolean;
BEGIN
    -- Verificar e remover políticas que podem estar chamando funções de sincronização de plano
    FOR v_policy_exists IN 
        SELECT EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE tablename = 'profiles' 
            AND (qual::text LIKE '%sync_user_plan%' OR with_check::text LIKE '%sync_user_plan%')
        ) LOOP
        
        IF v_policy_exists THEN
            -- Exibir as políticas problemáticas
            RAISE NOTICE 'Políticas RLS problemáticas encontradas:';
            
            FOR v_policy_name IN 
                SELECT policyname 
                FROM pg_policies 
                WHERE tablename = 'profiles' 
                AND (qual::text LIKE '%sync_user_plan%' OR with_check::text LIKE '%sync_user_plan%')
            LOOP
                RAISE NOTICE 'Política: %', v_policy_name;
                EXECUTE 'DROP POLICY IF EXISTS ' || v_policy_name || ' ON public.profiles';
                RAISE NOTICE 'Política % removida', v_policy_name;
            END LOOP;
        ELSE
            RAISE NOTICE 'Nenhuma política RLS problemática encontrada';
        END IF;
    END LOOP;
END $$;

-- Etapa 7: Conceder permissões
GRANT EXECUTE ON FUNCTION public.sync_user_plan_v2 TO authenticated;
GRANT EXECUTE ON FUNCTION public.trigger_sync_plan_v2 TO authenticated;

COMMIT;

-- AVISO: Execute as consultas abaixo manualmente para verificar o status DEPOIS de aplicar as correções
-- SELECT * FROM pg_trigger WHERE tgrelid = 'public.profiles'::regclass;
-- SELECT * FROM pg_policies WHERE tablename = 'profiles';

-- OPCIONAL: Se ainda houver problemas, execute para desativar temporariamente o RLS
-- ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;