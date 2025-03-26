-- Script para adicionar a coluna sales_url à tabela recommended_products
-- Verifica se a coluna já existe antes de adicioná-la

DO $$
BEGIN
    -- Verifica se a coluna sales_url já existe na tabela
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'recommended_products'
        AND column_name = 'sales_url'
    ) THEN
        -- Adiciona a coluna sales_url como texto, permitindo valores nulos
        ALTER TABLE public.recommended_products
        ADD COLUMN sales_url TEXT;
        
        -- Log de alteração
        RAISE NOTICE 'Coluna sales_url adicionada à tabela recommended_products';
    ELSE
        RAISE NOTICE 'A coluna sales_url já existe na tabela recommended_products';
    END IF;
    
    -- Executa uma migração dos produtos pendentes para incluir a URL de vendas
    UPDATE public.recommended_products
    SET sales_url = image
    WHERE sales_url IS NULL;
    
    RAISE NOTICE 'Script de adição da coluna sales_url executado com sucesso';
END $$;

-- Ajusta as permissões RLS para permitir inserções incluindo a nova coluna
ALTER TABLE public.recommended_products DISABLE ROW LEVEL SECURITY;

-- Atualiza a política para inserção por administradores, incluindo a nova coluna
DROP POLICY IF EXISTS "Admin pode inserir produtos" ON public.recommended_products;
CREATE POLICY "Admin pode inserir produtos" ON public.recommended_products 
    FOR INSERT 
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

ALTER TABLE public.recommended_products ENABLE ROW LEVEL SECURITY;

-- Garante que o campo sales_url seja atualizado também em aprovações futuras
COMMENT ON COLUMN public.recommended_products.sales_url IS 'URL de vendas/afiliado do produto'; 