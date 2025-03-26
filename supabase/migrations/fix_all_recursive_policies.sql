-- Script completo para resolver todos os problemas de recursão infinita
-- Esta abordagem mais radical remove todas as políticas problemáticas e as substitui
-- com uma abordagem que garante que não haja recursão entre políticas

-- ===== PARTE 1: DESATIVAR RLS EM TODAS AS TABELAS RELEVANTES =====
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.recommended_products DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.submitted_products DISABLE ROW LEVEL SECURITY;

-- ===== PARTE 2: REMOVER TODAS AS POLÍTICAS EXISTENTES =====
-- Remover políticas da tabela profiles
DROP POLICY IF EXISTS "Usuários podem ver seus próprios perfis" ON public.profiles;
DROP POLICY IF EXISTS "Usuários podem atualizar seus próprios perfis" ON public.profiles;
DROP POLICY IF EXISTS "Administradores podem ver todos os perfis" ON public.profiles;
DROP POLICY IF EXISTS "Administradores podem atualizar todos os perfis" ON public.profiles;
DROP POLICY IF EXISTS "Todos podem inserir perfis" ON public.profiles;

-- Remover políticas da tabela recommended_products
DROP POLICY IF EXISTS "Todos podem ver produtos recomendados" ON public.recommended_products;
DROP POLICY IF EXISTS "Admin pode inserir produtos" ON public.recommended_products;
DROP POLICY IF EXISTS "Leitura de produtos recomendados" ON public.recommended_products;
DROP POLICY IF EXISTS "Escrita de produtos recomendados" ON public.recommended_products;

-- Remover políticas da tabela submitted_products
DROP POLICY IF EXISTS "Usuários podem ver seus produtos submetidos" ON public.submitted_products;
DROP POLICY IF EXISTS "Usuários podem inserir produtos" ON public.submitted_products;
DROP POLICY IF EXISTS "Administradores podem ver todos os produtos" ON public.submitted_products;
DROP POLICY IF EXISTS "Administradores podem atualizar produtos" ON public.submitted_products;

-- ===== PARTE 3: CRIAR FUNÇÕES AUXILIARES SEM RECURSÃO =====
-- Função para verificar se um usuário é administrador - SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.is_user_admin()
RETURNS BOOLEAN AS $$
DECLARE
    user_role TEXT;
BEGIN
    -- Acessa diretamente a coluna role sem verificar políticas
    SELECT role INTO user_role FROM public.profiles WHERE id = auth.uid();
    RETURN user_role = 'admin';
EXCEPTION
    WHEN OTHERS THEN
        RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===== PARTE 4: RECRIAR POLÍTICAS SEGURAS =====
-- Políticas para a tabela profiles

-- Todos podem criar perfis (necessário para registro)
CREATE POLICY "Todos podem inserir perfis" ON public.profiles
    FOR INSERT
    WITH CHECK (true);

-- Usuários podem ver seus próprios perfis
CREATE POLICY "Usuários podem ver seus próprios perfis" ON public.profiles
    FOR SELECT
    USING (id = auth.uid());

-- Usuários podem atualizar seus próprios perfis
CREATE POLICY "Usuários podem atualizar seus próprios perfis" ON public.profiles
    FOR UPDATE
    USING (id = auth.uid());

-- Administradores podem ver todos os perfis usando a função SECURITY DEFINER
CREATE POLICY "Administradores podem ver todos os perfis" ON public.profiles
    FOR SELECT
    USING (public.is_user_admin() = true);

-- Administradores podem atualizar todos os perfis
CREATE POLICY "Administradores podem atualizar todos os perfis" ON public.profiles
    FOR UPDATE
    USING (public.is_user_admin() = true);

-- Políticas para a tabela recommended_products

-- Todos podem ver os produtos recomendados
CREATE POLICY "Todos podem ver produtos recomendados" ON public.recommended_products
    FOR SELECT
    USING (true);

-- Apenas administradores podem inserir produtos recomendados
CREATE POLICY "Admin pode inserir produtos" ON public.recommended_products
    FOR INSERT
    WITH CHECK (public.is_user_admin() = true);

-- Apenas administradores podem atualizar produtos recomendados
CREATE POLICY "Admin pode atualizar produtos" ON public.recommended_products
    FOR UPDATE
    USING (public.is_user_admin() = true);

-- Apenas administradores podem excluir produtos recomendados
CREATE POLICY "Admin pode excluir produtos" ON public.recommended_products
    FOR DELETE
    USING (public.is_user_admin() = true);

-- Políticas para a tabela submitted_products

-- Usuários podem ver seus próprios produtos submetidos
CREATE POLICY "Usuários podem ver seus produtos submetidos" ON public.submitted_products
    FOR SELECT
    USING ("userId" = auth.uid());

-- Usuários podem inserir produtos (submetê-los para aprovação)
CREATE POLICY "Usuários podem inserir produtos" ON public.submitted_products
    FOR INSERT
    WITH CHECK ("userId" = auth.uid());

-- Administradores podem ver todos os produtos submetidos
CREATE POLICY "Administradores podem ver todos os produtos" ON public.submitted_products
    FOR SELECT
    USING (public.is_user_admin() = true);

-- Administradores podem atualizar produtos submetidos
CREATE POLICY "Administradores podem atualizar produtos" ON public.submitted_products
    FOR UPDATE
    USING (public.is_user_admin() = true);

-- Administradores podem excluir produtos submetidos
CREATE POLICY "Administradores podem excluir produtos" ON public.submitted_products
    FOR DELETE
    USING (public.is_user_admin() = true);

-- ===== PARTE 5: VERIFICAR/ADICIONAR A COLUNA SALES_URL =====
-- Adiciona a coluna sales_url caso não exista
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'recommended_products'
        AND column_name = 'sales_url'
    ) THEN
        ALTER TABLE public.recommended_products
        ADD COLUMN sales_url TEXT;
        
        -- Inicializa valores padrão
        UPDATE public.recommended_products
        SET sales_url = image
        WHERE sales_url IS NULL;
        
        RAISE NOTICE 'Coluna sales_url adicionada à tabela recommended_products';
    ELSE
        RAISE NOTICE 'A coluna sales_url já existe na tabela recommended_products';
    END IF;
END $$;

-- ===== PARTE 6: REATIVAR RLS =====
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recommended_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submitted_products ENABLE ROW LEVEL SECURITY;

-- ===== PARTE 7: GARANTIR PERMISSÕES CORRETAS =====
-- Garantir que o role anon (usuário não autenticado) pode ver os produtos recomendados
GRANT SELECT ON public.recommended_products TO anon;
-- Garantir que o role authenticated (usuário autenticado) pode inserir/selecionar produtos
GRANT SELECT, INSERT, UPDATE, DELETE ON public.recommended_products TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.submitted_products TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;

DO $$
BEGIN
    RAISE NOTICE 'Script de correção completo foi executado com sucesso';
END $$; 