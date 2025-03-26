-- Script para adicionar política específica de inserção para administradores (v2)
-- Executar este script no SQL Editor do Supabase após o fix_policy_recursion_v2.sql

-- Adicionar política específica para inserção de produtos por administradores
DROP POLICY IF EXISTS "Administradores podem inserir produtos" ON recommended_products;

CREATE POLICY "Administradores podem inserir produtos" 
ON recommended_products 
FOR INSERT
WITH CHECK (public.is_admin_user(auth.uid()));

-- Permitir inserção de todos os campos
ALTER TABLE recommended_products ALTER COLUMN "addedByAdmin" DROP NOT NULL;
ALTER TABLE recommended_products ALTER COLUMN "addedAt" DROP NOT NULL;
ALTER TABLE recommended_products ALTER COLUMN "approvedAt" DROP NOT NULL;

-- Adicionar valores padrão para facilitar inserções
ALTER TABLE recommended_products 
  ALTER COLUMN "addedByAdmin" SET DEFAULT true,
  ALTER COLUMN "addedAt" SET DEFAULT NOW(),
  ALTER COLUMN "approvedAt" SET DEFAULT NOW(),
  ALTER COLUMN "eliteBadge" SET DEFAULT false,
  ALTER COLUMN "topPick" SET DEFAULT false;

-- Remover restrições de referência problemáticas na tabela de produtos submetidos (se houver)
ALTER TABLE IF EXISTS submitted_products 
  ALTER COLUMN "userId" DROP NOT NULL;

-- Verificar os produtos atuais na tabela
SELECT id, name, category, status, "addedAt" FROM recommended_products; 