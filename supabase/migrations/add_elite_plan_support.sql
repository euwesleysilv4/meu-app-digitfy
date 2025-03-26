-- Script para adicionar suporte ao Plano Elite e produtos em destaque

-- === PARTE 1: ADICIONAR CAMPO DE PLANO NA TABELA PROFILES ===
DO $$
BEGIN
    -- Verifica se a coluna plano já existe
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'plano'
    ) THEN
        -- Adiciona coluna de plano com valores possíveis
        ALTER TABLE public.profiles 
        ADD COLUMN plano TEXT DEFAULT 'basic' NOT NULL;
        
        -- Adiciona comentário explicativo
        COMMENT ON COLUMN public.profiles.plano IS 'Plano do usuário: basic, premium, elite';
        
        RAISE NOTICE 'Coluna plano adicionada à tabela profiles';
    ELSE
        RAISE NOTICE 'A coluna plano já existe na tabela profiles';
    END IF;
END $$;

-- === PARTE 2: ADICIONAR CAMPO DE DESTAQUE NA TABELA RECOMMENDED_PRODUCTS ===
DO $$
BEGIN
    -- Verifica se a coluna is_featured já existe
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'recommended_products' 
        AND column_name = 'is_featured'
    ) THEN
        -- Adiciona coluna de destaque
        ALTER TABLE public.recommended_products 
        ADD COLUMN is_featured BOOLEAN DEFAULT false;
        
        -- Adiciona coluna para relacionar com o usuário que enviou o produto
        ALTER TABLE public.recommended_products 
        ADD COLUMN user_id UUID REFERENCES public.profiles(id);
        
        -- Adiciona comentário explicativo
        COMMENT ON COLUMN public.recommended_products.is_featured IS 'Indica se o produto aparece na seção de destaque';
        COMMENT ON COLUMN public.recommended_products.user_id IS 'ID do usuário que enviou o produto';
        
        RAISE NOTICE 'Colunas is_featured e user_id adicionadas à tabela recommended_products';
    ELSE
        RAISE NOTICE 'A coluna is_featured já existe na tabela recommended_products';
    END IF;
END $$;

-- === PARTE 3: CRIAR FUNÇÃO PARA VERIFICAR SE UM USUÁRIO TEM PLANO ELITE ===
CREATE OR REPLACE FUNCTION public.user_has_elite_plan(user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    user_plan TEXT;
BEGIN
    -- Obter o plano do usuário
    SELECT plano INTO user_plan 
    FROM public.profiles 
    WHERE id = user_id;
    
    -- Verificar se é elite
    RETURN user_plan = 'elite';
EXCEPTION
    WHEN OTHERS THEN
        RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- === PARTE 4: ADICIONAR GATILHO PARA MARCAR PRODUTOS DE USUÁRIOS ELITE COMO DESTAQUE ===
CREATE OR REPLACE FUNCTION public.mark_elite_user_products_as_featured()
RETURNS TRIGGER AS $$
BEGIN
    -- Se estamos inserindo um produto na tabela recommended_products e o user_id está definido
    IF (TG_OP = 'INSERT' AND NEW.user_id IS NOT NULL) THEN
        -- Verifica se o usuário tem plano elite
        IF public.user_has_elite_plan(NEW.user_id) THEN
            -- Define o produto como destaque
            NEW.is_featured := TRUE;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Remover trigger existente, se houver
DROP TRIGGER IF EXISTS set_product_featured_status ON public.recommended_products;

-- Criar o trigger que é disparado antes da inserção
CREATE TRIGGER set_product_featured_status
BEFORE INSERT ON public.recommended_products
FOR EACH ROW
EXECUTE FUNCTION public.mark_elite_user_products_as_featured();

-- Adicionar índice para melhorar performance de consultas de produtos em destaque
CREATE INDEX IF NOT EXISTS idx_recommended_products_featured ON public.recommended_products(is_featured);

-- === PARTE 5: ATUALIZAR PLANO DE ALGUNS USUÁRIOS PARA ELITE (TESTE) ===
-- UPDATE public.profiles SET plano = 'elite' WHERE role = 'admin' LIMIT 1;

DO $$
BEGIN
    RAISE NOTICE 'Suporte a Plano Elite e produtos em destaque configurado com sucesso';
END $$; 