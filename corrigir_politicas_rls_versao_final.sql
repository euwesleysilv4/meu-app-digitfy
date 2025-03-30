-- CORREÇÃO DE POLÍTICAS RLS QUE CAUSAM RECURSÃO INFINITA (VERSÃO FINAL)
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

-- Passo 6: Verificar se a função is_admin já existe e remover
DO $$
BEGIN
    -- Verificar todas as funções is_admin existentes
    IF EXISTS (
        SELECT 1 FROM pg_proc 
        WHERE proname = 'is_admin' 
        AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
    ) THEN
        -- Remover todas as funções is_admin
        EXECUTE '
            DROP FUNCTION IF EXISTS public.is_admin(uuid);
            DROP FUNCTION IF EXISTS public.is_admin();
            DROP FUNCTION IF EXISTS public.is_admin(text);
        ';
        RAISE NOTICE 'Funções is_admin anteriores removidas';
    END IF;
END $$;

-- Passo 7: Criar uma função segura para verificar se um usuário é administrador
-- Esta função evita recursão ao não usar políticas RLS internamente
CREATE OR REPLACE FUNCTION public.check_admin_status(user_id UUID DEFAULT NULL)
RETURNS BOOLEAN AS $$
DECLARE
    v_role text;
    v_check_id UUID;
BEGIN
    -- Se nenhum ID for fornecido, use o ID do usuário atual
    v_check_id := COALESCE(user_id, auth.uid());
    
    -- Usar consulta direta sem passar por políticas RLS
    SELECT role::text INTO v_role 
    FROM public.profiles 
    WHERE id = v_check_id;
    
    -- Verificar se o usuário é administrador
    RETURN v_role = 'admin';
EXCEPTION WHEN OTHERS THEN
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Passo 8: Adicionar comentários e conceder permissões
COMMENT ON FUNCTION public.check_admin_status IS 'Verifica se um usuário é administrador, evitando recursão';
GRANT EXECUTE ON FUNCTION public.check_admin_status TO authenticated; 