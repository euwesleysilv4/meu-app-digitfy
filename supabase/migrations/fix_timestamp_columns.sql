-- Script para adicionar colunas de timestamp ausentes e corrigir trigger de atualização

-- 1. Primeiro verificamos quais tabelas têm o problema de timestamp ausente
DO $$
BEGIN
    -- Adicionar coluna updated_at à tabela profiles se não existir
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE public.profiles
        ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
        
        RAISE NOTICE 'Coluna updated_at adicionada à tabela profiles';
    END IF;
    
    -- Adicionar coluna updated_at à tabela recommended_products se não existir
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'recommended_products' 
        AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE public.recommended_products
        ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
        
        RAISE NOTICE 'Coluna updated_at adicionada à tabela recommended_products';
    END IF;
    
    -- Adicionar coluna created_at à tabela recommended_products se não existir
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'recommended_products' 
        AND column_name = 'created_at'
    ) THEN
        ALTER TABLE public.recommended_products
        ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
        
        RAISE NOTICE 'Coluna created_at adicionada à tabela recommended_products';
    END IF;
    
    -- Adicionar coluna updated_at à tabela submitted_products se não existir
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'submitted_products' 
        AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE public.submitted_products
        ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
        
        RAISE NOTICE 'Coluna updated_at adicionada à tabela submitted_products';
    END IF;
END $$;

-- 2. Criar função de trigger que verifica se a coluna updated_at existe antes de tentar atualizar
CREATE OR REPLACE FUNCTION public.update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    -- Verificar se a tabela tem a coluna updated_at antes de tentar atualizá-la
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = TG_TABLE_SCHEMA
        AND table_name = TG_TABLE_NAME
        AND column_name = 'updated_at'
    ) THEN
        NEW.updated_at = NOW();
    END IF;
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Em caso de erro, apenas retorna o NEW sem alterá-lo
        RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Tentar novamente a atualização dos usuários elite
UPDATE public.profiles
SET plano = 'elite'
WHERE id IN (
    SELECT id 
    FROM public.profiles 
    WHERE role = 'admin' 
    LIMIT 1
);

-- 4. Tentar novamente atualizar os produtos
DO $$
DECLARE
    admin_id UUID;
BEGIN
    -- Obter o ID de um usuário administrador
    SELECT id INTO admin_id
    FROM public.profiles
    WHERE role = 'admin'
    LIMIT 1;
    
    -- Se encontramos um administrador
    IF admin_id IS NOT NULL THEN
        -- Atualizar alguns produtos para pertencerem a este administrador
        UPDATE public.recommended_products
        SET 
            user_id = admin_id,
            is_featured = TRUE
        WHERE id IN (
            SELECT id 
            FROM public.recommended_products 
            WHERE user_id IS NULL 
            LIMIT 5
        );
        
        RAISE NOTICE 'Produtos atualizados com sucesso para usuário Elite (ID: %)', admin_id;
    ELSE
        RAISE NOTICE 'Nenhum administrador encontrado para atribuir plano Elite';
    END IF;
END $$; 