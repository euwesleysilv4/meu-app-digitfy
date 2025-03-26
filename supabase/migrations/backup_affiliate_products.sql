-- Script para fazer backup dos produtos de afiliados antes de alterações

-- Criar tabela de backup
CREATE TABLE IF NOT EXISTS public.affiliate_products_backup AS
SELECT * FROM public.affiliate_products;

-- Verificar contagem de produtos na tabela original e na tabela de backup
SELECT 'Original' AS tabela, COUNT(*) AS quantidade FROM public.affiliate_products
UNION ALL
SELECT 'Backup' AS tabela, COUNT(*) AS quantidade FROM public.affiliate_products_backup; 