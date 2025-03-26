-- Script para adicionar a coluna affiliate_link à tabela affiliate_products

-- Tornar a coluna affiliate_link nullable temporariamente (se já existir)
ALTER TABLE public.affiliate_products
  ALTER COLUMN affiliate_link DROP NOT NULL;

-- Adicionar valores padrão para a coluna affiliate_link
UPDATE public.affiliate_products
SET affiliate_link = 'https://hotm.art/afiliados'
WHERE affiliate_link IS NULL; 