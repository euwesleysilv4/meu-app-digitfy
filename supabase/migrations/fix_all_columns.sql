-- Script para resolver todos os problemas de colunas obrigatórias

-- Tornar todas as colunas potencialmente obrigatórias temporariamente nullable
ALTER TABLE public.affiliate_products
  ALTER COLUMN image DROP NOT NULL,
  ALTER COLUMN affiliate_link DROP NOT NULL,
  ALTER COLUMN vendor_name DROP NOT NULL,
  ALTER COLUMN vendor_id DROP NOT NULL,
  ALTER COLUMN status DROP NOT NULL,
  ALTER COLUMN approved_by DROP NOT NULL,
  ALTER COLUMN platform DROP NOT NULL,
  ALTER COLUMN created_by DROP NOT NULL,
  ALTER COLUMN approved_date DROP NOT NULL,
  ALTER COLUMN approved_reason DROP NOT NULL,
  ALTER COLUMN rejected_reason DROP NOT NULL,
  ALTER COLUMN start_date DROP NOT NULL,
  ALTER COLUMN end_date DROP NOT NULL;

-- Adicionar valores padrão para as colunas
UPDATE public.affiliate_products SET
  vendor_name = 'Hotmart' WHERE vendor_name IS NULL;

UPDATE public.affiliate_products SET
  vendor_id = '12345' WHERE vendor_id IS NULL;

UPDATE public.affiliate_products SET
  status = 'aprovado' WHERE status IS NULL;

UPDATE public.affiliate_products SET
  platform = 'Hotmart' WHERE platform IS NULL;

-- Coloque valores padrão para outros campos que possam ser obrigatórios
-- mas não apareceram nos erros ainda 