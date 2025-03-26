-- Script para adicionar a coluna commission_rate à tabela affiliate_products

-- Adicionar a coluna commission_rate se não existir
ALTER TABLE public.affiliate_products 
  ADD COLUMN IF NOT EXISTS commission_rate NUMERIC(10,2) DEFAULT 50.00,
  ALTER COLUMN commission_rate SET NOT NULL; 