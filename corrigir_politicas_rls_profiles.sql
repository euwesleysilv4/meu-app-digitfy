-- CORREÇÃO DE POLÍTICAS RLS QUE CAUSAM RECURSÃO INFINITA
-- Execute este script para resolver problemas de permissão em múltiplas páginas

-- Primeiro, vamos visualizar as políticas atuais (não executar, apenas informativo)
-- SELECT * FROM pg_policies WHERE tablename = 'profiles';

-- Passo 1: Desativar temporariamente o RLS para realizar as alterações
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Passo 2: Remover TODAS as políticas existentes para a tabela profiles
-- Isso removerá qualquer política que possa estar causando recursão
DROP POLICY IF EXISTS profiles_select_policy ON public.profiles;
DROP POLICY IF EXISTS profiles_insert_policy ON public.profiles;
DROP POLICY IF EXISTS profiles_update_policy ON public.profiles;
DROP POLICY IF EXISTS profiles_delete_policy ON public.profiles;
DROP POLICY IF EXISTS enable_profiles_for_all_users ON public.profiles;
DROP POLICY IF EXISTS enable_profiles_for_users ON public.profiles;
DROP POLICY IF EXISTS profiles_admin_policy ON public.profiles;
DROP POLICY IF EXISTS profiles_admin_select ON public.profiles;
DROP POLICY IF EXISTS profiles_admin_crud ON public.profiles;
DROP POLICY IF EXISTS profiles_owner_policy ON public.profiles;
DROP POLICY IF EXISTS profiles_owner_select ON public.profiles;
DROP POLICY IF EXISTS profiles_owner_update ON public.profiles;
-- Remover quaisquer outras políticas que possam existir (Supabase pode gerar nomes diferentes)
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT policyname FROM pg_policies WHERE tablename = 'profiles'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || policy_record.policyname || ' ON public.profiles';
    END LOOP;
END $$;

-- Passo 3: Criar NOVAS políticas simplificadas que evitam recursão

-- 3.1: Política para SELECT - Todo usuário autenticado pode ver perfis
CREATE POLICY profiles_public_select ON public.profiles
    FOR SELECT USING (true);  -- Permite SELECT para qualquer usuário autenticado

-- 3.2: Política para UPDATE - Apenas o próprio usuário ou administradores
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

-- Passo 6: Criar uma função segura para verificar se um usuário é administrador
-- Esta função evita recursão ao não usar políticas RLS internamente
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID DEFAULT NULL)
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

-- Passo 7: Adicionar comentários e conceder permissões
COMMENT ON FUNCTION public.is_admin IS 'Verifica se um usuário é administrador, evitando recursão';
GRANT EXECUTE ON FUNCTION public.is_admin TO authenticated;

-- IMPORTANTE: Execute o script abaixo para garantir que não há recursão nas políticas RLS
-- Este comando só deveria ser executado se o problema persistir
-- ALTER TABLE public.profiles ALTER COLUMN role SET DEFAULT 'user'::user_role; 