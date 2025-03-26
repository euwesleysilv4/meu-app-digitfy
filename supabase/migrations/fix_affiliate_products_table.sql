-- Script para corrigir a tabela affiliate_products

-- Criar a tabela se ela não existir
CREATE TABLE IF NOT EXISTS public.affiliate_products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT NOT NULL,
  benefits TEXT[] NOT NULL DEFAULT '{}',
  price NUMERIC(10,2) NOT NULL,
  price_display TEXT NOT NULL,
  category TEXT NOT NULL,
  featured BOOLEAN DEFAULT FALSE,
  active BOOLEAN DEFAULT TRUE,
  order_index INTEGER DEFAULT 0,
  sales_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar Row Level Security
ALTER TABLE public.affiliate_products ENABLE ROW LEVEL SECURITY;

-- Criar a função para atualizar o timestamp
CREATE OR REPLACE FUNCTION update_affiliate_products_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar o trigger se não existir
DROP TRIGGER IF EXISTS set_timestamp_affiliate_products ON public.affiliate_products;
CREATE TRIGGER set_timestamp_affiliate_products
BEFORE UPDATE ON public.affiliate_products
FOR EACH ROW
EXECUTE FUNCTION update_affiliate_products_timestamp();

-- Adicionar a coluna active se não existir (usando sintaxe alternativa)
ALTER TABLE public.affiliate_products ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT TRUE;

-- Atualizar a política de RLS
DROP POLICY IF EXISTS "Produtos de afiliados visíveis para todos" ON public.affiliate_products;
CREATE POLICY "Produtos de afiliados visíveis para todos"
ON public.affiliate_products
FOR SELECT
USING (active = TRUE);

-- Adicionar política para administradores
DROP POLICY IF EXISTS "Apenas administradores podem gerenciar produtos de afiliados" ON public.affiliate_products;
CREATE POLICY "Apenas administradores podem gerenciar produtos de afiliados"
ON public.affiliate_products
FOR ALL
USING (
  auth.uid() IN (
    SELECT id FROM profiles WHERE role = 'admin'
  )
); 