-- Migração para adicionar a coluna 'platform' à tabela affiliate_products

-- Verificar se a coluna já existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'affiliate_products'
        AND column_name = 'platform'
    ) THEN
        -- Adicionar a coluna platform
        ALTER TABLE public.affiliate_products ADD COLUMN platform TEXT DEFAULT 'Hotmart';
    END IF;
    
    -- Verificar se a coluna commission_rate já existe
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'affiliate_products'
        AND column_name = 'commission_rate'
    ) THEN
        -- Adicionar a coluna commission_rate
        ALTER TABLE public.affiliate_products ADD COLUMN commission_rate INTEGER DEFAULT 50;
    END IF;
    
    -- Verificar se a coluna affiliate_link já existe
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'affiliate_products'
        AND column_name = 'affiliate_link'
    ) THEN
        -- Adicionar a coluna affiliate_link
        ALTER TABLE public.affiliate_products ADD COLUMN affiliate_link TEXT DEFAULT '';
    END IF;
    
    -- Verificar se a coluna vendor_name já existe
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'affiliate_products'
        AND column_name = 'vendor_name'
    ) THEN
        -- Adicionar a coluna vendor_name
        ALTER TABLE public.affiliate_products ADD COLUMN vendor_name TEXT DEFAULT '';
    END IF;
    
    -- Verificar se a coluna image já existe
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'affiliate_products'
        AND column_name = 'image'
    ) THEN
        -- Adicionar a coluna image
        ALTER TABLE public.affiliate_products ADD COLUMN image TEXT DEFAULT '';
    END IF;
END
$$; 