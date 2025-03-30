-- CORREÇÃO DE POLÍTICAS RLS QUE CAUSAM RECURSÃO INFINITA (MANTENDO IS_ADMIN)
-- Execute este script para resolver problemas de permissão em múltiplas páginas

-- Passo 1: Desativar temporariamente o RLS para realizar as alterações
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Passo 2: Remover TODAS as políticas existentes para a tabela profiles
-- Usando o método seguro para lidar com nomes de políticas com espaços

DO $$
DECLARE
    policy_record RECORD;
BEGIN
    -- Listar todas as políticas da tabela
    RAISE NOTICE 'Removendo políticas existentes da tabela profiles...';
    
    FOR policy_record IN 
        SELECT policyname FROM pg_policies WHERE tablename = 'profiles' AND schemaname = 'public'
    LOOP
        -- Usar aspas duplas para lidar com nomes que contêm espaços
        EXECUTE 'DROP POLICY IF EXISTS "' || policy_record.policyname || '" ON public.profiles';
        RAISE NOTICE 'Política removida: %', policy_record.policyname;
    END LOOP;
END $$;

-- Passo 3: Criar NOVAS políticas simplificadas que evitam recursão

-- 3.1: Política para SELECT - Todo usuário autenticado pode ver perfis
CREATE POLICY profiles_public_select ON public.profiles
    FOR SELECT USING (true);  -- Permite SELECT para qualquer usuário autenticado

-- 3.2: Política para UPDATE - Apenas o próprio usuário ou administradores
-- Usar diretamente role = 'admin' sem chamar função
CREATE POLICY profiles_owner_update ON public.profiles
    FOR UPDATE USING (
        auth.uid() = id 
        OR 
        (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
    );

-- 3.3: Política para INSERT - Apenas para o próprio perfil ou administradores
CREATE POLICY profiles_owner_insert ON public.profiles
    FOR INSERT WITH CHECK (
        auth.uid() = id
        OR
        (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
    );

-- 3.4: Política para DELETE - Apenas administradores
CREATE POLICY profiles_admin_delete ON public.profiles
    FOR DELETE USING (
        (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
    );

-- Passo 4: Reativar o RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Passo 5: Garantir que todos os usuários tenham permissão para usar a tabela
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;

-- Passo 6: Modificar a função is_admin em vez de tentar removê-la
-- Isto é necessário pois outras tabelas dependem dela
DO $$
BEGIN
    -- Verificar se a função is_admin(uuid) existe
    IF EXISTS (
        SELECT 1 FROM pg_proc 
        WHERE proname = 'is_admin' 
        AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
        AND pg_get_function_arguments(oid) = 'user_id uuid'
    ) THEN
        -- Substituir a função is_admin sem removê-la
        EXECUTE $FUNC$
            CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid) 
            RETURNS boolean
            LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
            AS $BODY$
            DECLARE
                v_role text;
            BEGIN
                -- Verificar se há recursão em andamento
                IF current_setting('my.is_admin_in_progress', true) = 'true' THEN
                    RETURN false;
                END IF;
                
                -- Definir flag para evitar recursão
                PERFORM set_config('my.is_admin_in_progress', 'true', true);
                
                -- Consulta direta sem passar por políticas RLS
                SELECT role::text INTO v_role 
                FROM public.profiles 
                WHERE id = user_id;
                
                -- Limpar flag 
                PERFORM set_config('my.is_admin_in_progress', 'false', true);
                
                -- Verificar se o usuário é administrador
                RETURN v_role = 'admin';
            EXCEPTION WHEN OTHERS THEN
                -- Garantir que a flag é limpa mesmo em caso de erro
                PERFORM set_config('my.is_admin_in_progress', 'false', true);
                RETURN false;
            END;
            $BODY$;
        $FUNC$;
        
        RAISE NOTICE 'Função is_admin(uuid) foi modificada para evitar recursão';
    END IF;
    
    -- Verificar se a função is_admin() sem parâmetros existe
    IF EXISTS (
        SELECT 1 FROM pg_proc 
        WHERE proname = 'is_admin' 
        AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
        AND pg_get_function_arguments(oid) = ''
    ) THEN
        -- Substituir a função is_admin() sem removê-la
        EXECUTE $FUNC$
            CREATE OR REPLACE FUNCTION public.is_admin() 
            RETURNS boolean
            LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
            AS $BODY$
            DECLARE
                v_role text;
            BEGIN
                -- Verificar se há recursão em andamento
                IF current_setting('my.is_admin_in_progress', true) = 'true' THEN
                    RETURN false;
                END IF;
                
                -- Definir flag para evitar recursão
                PERFORM set_config('my.is_admin_in_progress', 'true', true);
                
                -- Consulta direta sem passar por políticas RLS
                SELECT role::text INTO v_role 
                FROM public.profiles 
                WHERE id = auth.uid();
                
                -- Limpar flag
                PERFORM set_config('my.is_admin_in_progress', 'false', true);
                
                -- Verificar se o usuário é administrador
                RETURN v_role = 'admin';
            EXCEPTION WHEN OTHERS THEN
                -- Garantir que a flag é limpa mesmo em caso de erro
                PERFORM set_config('my.is_admin_in_progress', 'false', true);
                RETURN false;
            END;
            $BODY$;
        $FUNC$;
        
        RAISE NOTICE 'Função is_admin() foi modificada para evitar recursão';
    END IF;
    
    -- Verificar se existem outras variantes da função is_admin
    IF EXISTS (
        SELECT 1 FROM pg_proc 
        WHERE proname = 'is_admin' 
        AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
        AND pg_get_function_arguments(oid) <> 'user_id uuid'
        AND pg_get_function_arguments(oid) <> ''
    ) THEN
        RAISE WARNING 'Existem outras variantes da função is_admin que podem causar recursão';
    END IF;
END $$;

-- Passo 7: Adicionar comentários nas funções
COMMENT ON FUNCTION public.is_admin(uuid) IS 'Verifica se um usuário é administrador, com proteção contra recursão';
COMMENT ON FUNCTION public.is_admin() IS 'Verifica se o usuário atual é administrador, com proteção contra recursão'; 