-- Script para verificar e diagnosticar tabelas de produtos
-- Executar no SQL Editor do Supabase

-- Verificar se as tabelas existem
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'recommended_products'
) AS recommended_products_exists;

SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'submitted_products'
) AS submitted_products_exists;

-- Contar registros em cada tabela (se existirem)
SELECT COUNT(*) AS recommended_products_count 
FROM recommended_products;

SELECT COUNT(*) AS submitted_products_count 
FROM submitted_products;

-- Verificar políticas RLS nas tabelas
SELECT
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
    tablename IN ('recommended_products', 'submitted_products')
ORDER BY
    tablename, policyname;

-- Verificar estrutura da tabela recommended_products
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM 
    information_schema.columns
WHERE 
    table_schema = 'public' 
    AND table_name = 'recommended_products'
ORDER BY 
    ordinal_position;

-- Verificar quais produtos existem na tabela recommended_products
SELECT 
    id, 
    name, 
    category, 
    status, 
    price, 
    added_at
FROM 
    recommended_products
LIMIT 10;

-- Verificar configuração de RLS para a tabela
SELECT relname, relrowsecurity
FROM pg_class
WHERE relname IN ('recommended_products', 'submitted_products'); 