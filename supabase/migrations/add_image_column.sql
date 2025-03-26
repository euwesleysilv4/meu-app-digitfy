-- Script para adicionar a coluna image à tabela affiliate_products

-- Tornar a coluna image nullable temporariamente (se já existir)
ALTER TABLE public.affiliate_products
  ALTER COLUMN image DROP NOT NULL;

-- Atualizar campos image com base na coluna image_url
UPDATE public.affiliate_products
SET image = image_url
WHERE image IS NULL AND image_url IS NOT NULL; 