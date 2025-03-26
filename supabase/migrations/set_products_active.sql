-- Script para garantir que todos os produtos de afiliados estejam ativos

-- Atualizar o status ativo para todos os produtos
UPDATE public.affiliate_products SET active = TRUE;

-- Preencher image_url com image se estiver vazio/nulo
UPDATE public.affiliate_products SET image_url = image WHERE image_url IS NULL AND image IS NOT NULL;

-- Preencher image com image_url se estiver vazio/nulo
UPDATE public.affiliate_products SET image = image_url WHERE image IS NULL AND image_url IS NOT NULL;

-- Preencher campos de comissão caso estejam vazios
UPDATE public.affiliate_products SET commission_rate = 50 WHERE commission_rate IS NULL;

-- Verificar status dos produtos
SELECT id, name, active, price, commission_rate, vendor_name, platform, image_url, sales_url, affiliate_link, image
FROM public.affiliate_products
ORDER BY order_index; 