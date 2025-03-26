-- Script para corrigir recursão infinita nas políticas RLS (versão 2)
-- Executar este script no SQL Editor do Supabase

-- 1. Primeiro, desabilitar temporariamente RLS nas tabelas para fazer as alterações
ALTER TABLE IF EXISTS recommended_products DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS submitted_products DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS profiles DISABLE ROW LEVEL SECURITY;

-- 2. Remover as políticas problemáticas que estão causando recursão
DROP POLICY IF EXISTS "Apenas administradores podem gerenciar produtos recomendados" ON recommended_products;
DROP POLICY IF EXISTS "Administradores podem ver todos os produtos enviados" ON submitted_products;
DROP POLICY IF EXISTS "Administradores podem atualizar qualquer produto enviado" ON submitted_products;
DROP POLICY IF EXISTS "Administradores podem excluir qualquer produto enviado" ON submitted_products;

-- 3. Remover função existente is_admin e criar uma nova com nome único
DROP FUNCTION IF EXISTS public.is_admin(UUID);
DROP FUNCTION IF EXISTS public.is_admin_user(UUID);

-- Criar função com nome único para evitar conflitos
CREATE OR REPLACE FUNCTION public.is_admin_user(user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    user_role TEXT;
BEGIN
    -- Buscar diretamente o role do usuário sem usar políticas
    SELECT role INTO user_role
    FROM profiles
    WHERE id = user_id;
    
    RETURN user_role = 'admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Recriar as políticas usando a função auxiliar para evitar recursão
-- Política para produtos recomendados
CREATE POLICY "Apenas administradores podem gerenciar produtos recomendados" 
ON recommended_products FOR ALL 
USING (public.is_admin_user(auth.uid()));

-- Políticas para produtos enviados
CREATE POLICY "Administradores podem ver todos os produtos enviados" 
ON submitted_products FOR SELECT 
USING (public.is_admin_user(auth.uid()));

CREATE POLICY "Administradores podem atualizar qualquer produto enviado" 
ON submitted_products FOR UPDATE 
USING (public.is_admin_user(auth.uid()));

CREATE POLICY "Administradores podem excluir qualquer produto enviado" 
ON submitted_products FOR DELETE 
USING (public.is_admin_user(auth.uid()));

-- 5. Reabilitar RLS nas tabelas
ALTER TABLE IF EXISTS recommended_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS submitted_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS profiles ENABLE ROW LEVEL SECURITY;

-- 6. Atualizar política para usuários verem seus próprios produtos (ajuste para nova nomenclatura)
DROP POLICY IF EXISTS "Usuários podem ver seus próprios produtos enviados" ON submitted_products;

CREATE POLICY "Usuários podem ver seus próprios produtos enviados" 
ON submitted_products FOR SELECT 
USING (
  auth.uid() = "userId" OR public.is_admin_user(auth.uid())
);

-- 7. Garantir permissões corretas
GRANT SELECT ON recommended_products TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON recommended_products TO authenticated;
GRANT SELECT ON submitted_products TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON submitted_products TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin_user TO authenticated; 