-- Script para adicionar a coluna order_index à tabela affiliate_products

-- Adicionar a coluna order_index se não existir
ALTER TABLE public.affiliate_products ADD COLUMN IF NOT EXISTS order_index INTEGER DEFAULT 0;

-- Verificar e corrigir todas as colunas necessárias
ALTER TABLE public.affiliate_products ADD COLUMN IF NOT EXISTS name TEXT DEFAULT '';
ALTER TABLE public.affiliate_products ADD COLUMN IF NOT EXISTS description TEXT DEFAULT '';
ALTER TABLE public.affiliate_products ADD COLUMN IF NOT EXISTS image_url TEXT DEFAULT '';
ALTER TABLE public.affiliate_products ADD COLUMN IF NOT EXISTS benefits TEXT[] DEFAULT '{}';
ALTER TABLE public.affiliate_products ADD COLUMN IF NOT EXISTS price NUMERIC(10,2) DEFAULT 0;
ALTER TABLE public.affiliate_products ADD COLUMN IF NOT EXISTS price_display TEXT DEFAULT '';
ALTER TABLE public.affiliate_products ADD COLUMN IF NOT EXISTS category TEXT DEFAULT '';
ALTER TABLE public.affiliate_products ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT FALSE;
ALTER TABLE public.affiliate_products ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT TRUE;
ALTER TABLE public.affiliate_products ADD COLUMN IF NOT EXISTS sales_url TEXT DEFAULT '';
ALTER TABLE public.affiliate_products ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE public.affiliate_products ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Atualizar a tabela para tornar as colunas NOT NULL após adicioná-las (se necessário)
ALTER TABLE public.affiliate_products ALTER COLUMN name SET NOT NULL;
ALTER TABLE public.affiliate_products ALTER COLUMN description SET NOT NULL;
ALTER TABLE public.affiliate_products ALTER COLUMN image_url SET NOT NULL;
ALTER TABLE public.affiliate_products ALTER COLUMN benefits SET NOT NULL;
ALTER TABLE public.affiliate_products ALTER COLUMN price SET NOT NULL;
ALTER TABLE public.affiliate_products ALTER COLUMN price_display SET NOT NULL;
ALTER TABLE public.affiliate_products ALTER COLUMN category SET NOT NULL; 