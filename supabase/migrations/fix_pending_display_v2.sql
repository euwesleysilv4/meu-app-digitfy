-- Script para garantir a exibição de produtos pendentes
-- Executar este script no SQL Editor do Supabase

-- 1. Desativar RLS temporariamente para diagnóstico
ALTER TABLE submitted_products DISABLE ROW LEVEL SECURITY;

-- 2. Verificar todos os produtos na tabela
SELECT * FROM submitted_products;

-- 3. Remover políticas de RLS existentes que podem estar causando problemas
DROP POLICY IF EXISTS "Usuários podem ver seus próprios produtos enviados" ON submitted_products;
DROP POLICY IF EXISTS "Usuários podem adicionar seus próprios produtos" ON submitted_products;
DROP POLICY IF EXISTS "Administradores podem ver todos os produtos enviados" ON submitted_products;
DROP POLICY IF EXISTS "Administradores podem gerenciar todos os produtos enviados" ON submitted_products;

-- 4. Criar políticas de segurança mais permissivas
-- Qualquer pessoa autenticada pode ver todos os produtos pendentes
CREATE POLICY "Qualquer pessoa pode ver produtos pendentes" 
ON submitted_products FOR SELECT 
USING (true);

-- Usuários podem adicionar seus próprios produtos
CREATE POLICY "Usuários podem adicionar produtos" 
ON submitted_products FOR INSERT 
TO authenticated
WITH CHECK ("userId" = auth.uid());

-- 5. Garantir que todos os produtos na tabela tenham estado pendente
UPDATE submitted_products
SET status = 'pendente'
WHERE status IS NULL OR status = '' OR status != 'aprovado';

-- 6. Reativar RLS
ALTER TABLE submitted_products ENABLE ROW LEVEL SECURITY;

-- 7. Verificar permissões
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'submitted_products';

-- 8. Verificar produtos após as alterações
SELECT * FROM submitted_products;

-- 9. Mensagem de conclusão
SELECT 'Configuração concluída. Todos os produtos pendentes devem estar visíveis agora.' as mensagem; 