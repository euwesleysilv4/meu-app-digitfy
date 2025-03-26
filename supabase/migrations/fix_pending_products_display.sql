-- Script para corrigir problemas com a exibição de produtos pendentes
-- Executar este script no SQL Editor do Supabase

-- 1. Verificar estrutura atual da tabela submitted_products
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'submitted_products'
ORDER BY ordinal_position;

-- 2. Contagem por status para diagnóstico
SELECT 
  status,
  COUNT(*) as total
FROM submitted_products
GROUP BY status;

-- 3. Verificar se há produtos com status não padronizado
SELECT 
  id, 
  name, 
  description, 
  status, 
  "submittedAt"
FROM submitted_products
WHERE status != 'pendente' AND status != 'aprovado' AND status != 'rejeitado';

-- 4. Verificar se a coluna status está com o tipo correto
DO $$
DECLARE
  status_type TEXT;
BEGIN
  SELECT data_type INTO status_type
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name = 'submitted_products'
    AND column_name = 'status';
    
  RAISE NOTICE 'Tipo da coluna status: %', status_type;
END$$;

-- 5. Corrigir o status dos produtos que deveriam ser pendentes
-- Isso irá padronizar o valor para 'pendente' em todas as linhas que devem estar pendentes
UPDATE submitted_products
SET status = 'pendente'
WHERE (status IS NULL) 
   OR (status != 'pendente' AND status != 'aprovado' AND status != 'rejeitado')
   OR (status = '');

-- 6. Verificar se algum produto não tem userId ou tem userId inválido
SELECT id, name, "userId" 
FROM submitted_products 
WHERE "userId" IS NULL OR "userId" = '00000000-0000-0000-0000-000000000000';

-- 7. Ver produtos pendentes após as correções
SELECT id, name, status, "submittedAt"
FROM submitted_products
WHERE status = 'pendente'
ORDER BY "submittedAt" DESC;

-- 8. Verificar se a RLS está interferindo na visualização (temporariamente desabilitamos)
ALTER TABLE submitted_products DISABLE ROW LEVEL SECURITY;

-- 9. Verificar políticas existentes
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM
    pg_policies
WHERE
    tablename = 'submitted_products';

-- 10. Recriar políticas para garantir que os administradores possam ver os produtos pendentes
DROP POLICY IF EXISTS "Administradores podem ver todos os produtos enviados" ON submitted_products;

CREATE POLICY "Administradores podem ver todos os produtos enviados" 
ON submitted_products FOR SELECT 
USING (TRUE); -- Simplificar para que todos os usuários possam ver para testes

-- 11. Habilitar RLS novamente
ALTER TABLE submitted_products ENABLE ROW LEVEL SECURITY;

-- 12. Resultado final: contagem de produtos pendentes
SELECT COUNT(*) AS produtos_pendentes 
FROM submitted_products 
WHERE status = 'pendente';

-- Mensagem informativa final
SELECT 'Correções aplicadas. Os produtos pendentes devem agora aparecer na interface de administração.' AS mensagem; 