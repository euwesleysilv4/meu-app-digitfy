-- Script para corrigir recursão infinita nas políticas RLS (versão 3)
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

-- 3. Criar uma nova função com nome único (muito específico)
CREATE OR REPLACE FUNCTION public.check_product_admin_role(user_id UUID)
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
USING (public.check_product_admin_role(auth.uid()));

-- Políticas para produtos enviados
CREATE POLICY "Administradores podem ver todos os produtos enviados" 
ON submitted_products FOR SELECT 
USING (public.check_product_admin_role(auth.uid()));

CREATE POLICY "Administradores podem atualizar qualquer produto enviado" 
ON submitted_products FOR UPDATE 
USING (public.check_product_admin_role(auth.uid()));

CREATE POLICY "Administradores podem excluir qualquer produto enviado" 
ON submitted_products FOR DELETE 
USING (public.check_product_admin_role(auth.uid()));

-- 5. Adicionar política específica para inserção de produtos por administradores
DROP POLICY IF EXISTS "Administradores podem inserir produtos" ON recommended_products;

CREATE POLICY "Administradores podem inserir produtos" 
ON recommended_products 
FOR INSERT
WITH CHECK (public.check_product_admin_role(auth.uid()));

-- 6. Atualizar política para usuários verem seus próprios produtos (ajuste para nova nomenclatura)
DROP POLICY IF EXISTS "Usuários podem ver seus próprios produtos enviados" ON submitted_products;

CREATE POLICY "Usuários podem ver seus próprios produtos enviados" 
ON submitted_products FOR SELECT 
USING (
  auth.uid() = "userId" OR public.check_product_admin_role(auth.uid())
);

-- 7. Permitir inserção de todos os campos
ALTER TABLE recommended_products ALTER COLUMN "addedByAdmin" DROP NOT NULL;
ALTER TABLE recommended_products ALTER COLUMN "addedAt" DROP NOT NULL;
ALTER TABLE recommended_products ALTER COLUMN "approvedAt" DROP NOT NULL;

-- 8. Adicionar valores padrão para facilitar inserções
ALTER TABLE recommended_products 
  ALTER COLUMN "addedByAdmin" SET DEFAULT true,
  ALTER COLUMN "addedAt" SET DEFAULT NOW(),
  ALTER COLUMN "approvedAt" SET DEFAULT NOW(),
  ALTER COLUMN "eliteBadge" SET DEFAULT false,
  ALTER COLUMN "topPick" SET DEFAULT false;

-- 9. Remover restrições de referência problemáticas na tabela de produtos submetidos (se houver)
ALTER TABLE IF EXISTS submitted_products 
  ALTER COLUMN "userId" DROP NOT NULL;

-- 10. Reabilitar RLS nas tabelas
ALTER TABLE IF EXISTS recommended_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS submitted_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS profiles ENABLE ROW LEVEL SECURITY;

-- 11. Garantir permissões corretas
GRANT SELECT ON recommended_products TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON recommended_products TO authenticated;
GRANT SELECT ON submitted_products TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON submitted_products TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_product_admin_role TO authenticated;

-- 12. Verificar os produtos atuais na tabela
SELECT id, name, category, status, "addedAt" FROM recommended_products; 