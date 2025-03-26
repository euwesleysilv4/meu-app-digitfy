-- Script para resolver problemas de colunas obrigatórias (versão simplificada)

-- Procedimento para verificar e ajustar colunas uma a uma
DO $$
DECLARE
    column_exists boolean;
BEGIN
    -- Verificar e ajustar image
    SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'affiliate_products' AND column_name = 'image'
    ) INTO column_exists;
    
    IF column_exists THEN
        EXECUTE 'ALTER TABLE public.affiliate_products ALTER COLUMN image DROP NOT NULL';
    END IF;

    -- Verificar e ajustar affiliate_link
    SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'affiliate_products' AND column_name = 'affiliate_link'
    ) INTO column_exists;
    
    IF column_exists THEN
        EXECUTE 'ALTER TABLE public.affiliate_products ALTER COLUMN affiliate_link DROP NOT NULL';
    END IF;

    -- Verificar e ajustar vendor_name
    SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'affiliate_products' AND column_name = 'vendor_name'
    ) INTO column_exists;
    
    IF column_exists THEN
        EXECUTE 'ALTER TABLE public.affiliate_products ALTER COLUMN vendor_name DROP NOT NULL';
        EXECUTE 'UPDATE public.affiliate_products SET vendor_name = ''Hotmart'' WHERE vendor_name IS NULL';
    END IF;

    -- Verificar e ajustar status
    SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'affiliate_products' AND column_name = 'status'
    ) INTO column_exists;
    
    IF column_exists THEN
        EXECUTE 'ALTER TABLE public.affiliate_products ALTER COLUMN status DROP NOT NULL';
        EXECUTE 'UPDATE public.affiliate_products SET status = ''aprovado'' WHERE status IS NULL';
    END IF;

    -- Verificar e ajustar platform
    SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'affiliate_products' AND column_name = 'platform'
    ) INTO column_exists;
    
    IF column_exists THEN
        EXECUTE 'ALTER TABLE public.affiliate_products ALTER COLUMN platform DROP NOT NULL';
        EXECUTE 'UPDATE public.affiliate_products SET platform = ''Hotmart'' WHERE platform IS NULL';
    END IF;
END $$; 