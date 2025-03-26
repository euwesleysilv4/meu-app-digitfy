-- Script para corrigir problemas comuns nas tabelas de produtos
-- Executar este script no SQL Editor do Supabase para resolver problemas de acesso

-- 1. Desativar temporariamente RLS para permitir debugging e correções
ALTER TABLE IF EXISTS recommended_products DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS submitted_products DISABLE ROW LEVEL SECURITY;

-- 2. Verificar se a coluna status tem valores padrão
-- Preencher status em branco (se houver)
UPDATE recommended_products
SET status = 'aprovado'
WHERE status IS NULL OR status = '';

-- 3. Remover todas as políticas existentes nas tabelas de produtos
DROP POLICY IF EXISTS "Produtos recomendados visíveis para todos" ON recommended_products;
DROP POLICY IF EXISTS "Apenas administradores podem gerenciar produtos recomendados" ON recommended_products;

DROP POLICY IF EXISTS "Usuários podem ver seus próprios produtos enviados" ON submitted_products;
DROP POLICY IF EXISTS "Administradores podem ver todos os produtos enviados" ON submitted_products;
DROP POLICY IF EXISTS "Usuários podem enviar novos produtos" ON submitted_products;
DROP POLICY IF EXISTS "Usuários podem atualizar seus próprios produtos pendentes" ON submitted_products;
DROP POLICY IF EXISTS "Administradores podem atualizar qualquer produto enviado" ON submitted_products;
DROP POLICY IF EXISTS "Administradores podem excluir qualquer produto enviado" ON submitted_products;

-- 4. Recriar políticas de maneira mais permissiva
-- Política para permitir acesso de leitura para todos na tabela de produtos recomendados
CREATE POLICY "Produtos recomendados visíveis para todos" 
ON recommended_products FOR SELECT 
USING (true);

-- Política para permitir acesso de gestão para administradores na tabela de produtos recomendados
CREATE POLICY "Apenas administradores podem gerenciar produtos recomendados" 
ON recommended_products FOR ALL 
USING (
  auth.uid() IN (
    SELECT id FROM profiles WHERE role = 'admin'
  )
);

-- Política para permitir acesso de leitura aos próprios produtos submetidos
CREATE POLICY "Usuários podem ver seus próprios produtos enviados" 
ON submitted_products FOR SELECT 
USING (
  auth.uid() = user_id OR
  auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')
);

-- Política para permitir inserção de produtos pelos usuários
CREATE POLICY "Usuários podem enviar novos produtos" 
ON submitted_products FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Política para permitir atualização de produtos pelos administradores
CREATE POLICY "Administradores podem atualizar qualquer produto enviado" 
ON submitted_products FOR UPDATE 
USING (
  auth.uid() IN (
    SELECT id FROM profiles WHERE role = 'admin'
  )
);

-- Política para permitir exclusão de produtos pelos administradores
CREATE POLICY "Administradores podem excluir qualquer produto enviado" 
ON submitted_products FOR DELETE 
USING (
  auth.uid() IN (
    SELECT id FROM profiles WHERE role = 'admin'
  )
);

-- 5. Reativar RLS
ALTER TABLE IF EXISTS recommended_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS submitted_products ENABLE ROW LEVEL SECURITY;

-- 6. Conceder permissões explícitas para o usuário anônimo (apenas SELECT)
GRANT SELECT ON recommended_products TO anon;
GRANT SELECT ON submitted_products TO anon;

-- 7. Conceder permissões completas para usuários autenticados
GRANT SELECT, INSERT, UPDATE, DELETE ON recommended_products TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON submitted_products TO authenticated;

-- 8. Verificar se há produtos na tabela
SELECT COUNT(*) FROM recommended_products;

-- Mostrar as primeiras 5 linhas para verificar
SELECT id, name, description, category, status 
FROM recommended_products 
LIMIT 5; 