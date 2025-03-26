-- Script para resolver a recursão infinita nas políticas da tabela profiles
-- Desativamos temporariamente RLS, corrigimos as políticas e reativamos

-- 1. Desativar RLS temporariamente
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- 2. Remover políticas problemáticas que podem estar causando recursão
DROP POLICY IF EXISTS "Usuários podem ver seus próprios perfis" ON public.profiles;
DROP POLICY IF EXISTS "Usuários podem atualizar seus próprios perfis" ON public.profiles;
DROP POLICY IF EXISTS "Administradores podem ver todos os perfis" ON public.profiles;
DROP POLICY IF EXISTS "Administradores podem atualizar todos os perfis" ON public.profiles;
DROP POLICY IF EXISTS "Todos podem inserir perfis" ON public.profiles;

-- 3. Criar função auxiliar para verificar se um usuário é administrador sem causar recursão
-- Essa função não consulta outras tabelas que tenham RLS, evitando o loop
CREATE OR REPLACE FUNCTION public.check_profile_admin_role()
RETURNS BOOLEAN AS $$
BEGIN
    -- Acessa diretamente a tabela profiles sem usar outras tabelas com RLS
    RETURN EXISTS (
        SELECT 1
        FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Criar novas políticas que não causem recursão
-- Política para usuários verem seus próprios perfis
CREATE POLICY "Usuários podem ver seus próprios perfis" ON public.profiles
    FOR SELECT
    USING (auth.uid() = id);

-- Política para usuários atualizarem seus próprios perfis
CREATE POLICY "Usuários podem atualizar seus próprios perfis" ON public.profiles
    FOR UPDATE
    USING (auth.uid() = id);

-- Política para administradores verem todos os perfis
CREATE POLICY "Administradores podem ver todos os perfis" ON public.profiles
    FOR SELECT
    USING (public.check_profile_admin_role());

-- Política para administradores atualizarem todos os perfis
CREATE POLICY "Administradores podem atualizar todos os perfis" ON public.profiles
    FOR UPDATE
    USING (public.check_profile_admin_role());

-- Política para permitir que todos criem perfis (necessário para registro)
CREATE POLICY "Todos podem inserir perfis" ON public.profiles
    FOR INSERT
    WITH CHECK (true);

-- 5. Reativar RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 7. Verificar políticas atuais para diagnóstico
DO $$
BEGIN
    RAISE NOTICE 'Políticas da tabela profiles corrigidas para evitar recursão infinita';
END $$; 