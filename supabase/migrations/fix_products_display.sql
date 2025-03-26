-- Script para diagnosticar e corrigir problemas de exibição de produtos recomendados

-- === PARTE 1: DIAGNÓSTICO ===

-- Verificar quantos produtos existem na tabela
DO $$
DECLARE
    total_count INTEGER;
    featured_count INTEGER;
    user_id_count INTEGER;
BEGIN
    -- Contar total de produtos
    SELECT COUNT(*) INTO total_count FROM public.recommended_products;
    
    -- Contar produtos em destaque
    SELECT COUNT(*) INTO featured_count FROM public.recommended_products WHERE is_featured = TRUE;
    
    -- Contar produtos com user_id
    SELECT COUNT(*) INTO user_id_count FROM public.recommended_products WHERE user_id IS NOT NULL;
    
    RAISE NOTICE 'Diagnóstico de produtos recomendados:';
    RAISE NOTICE '- Total de produtos: %', total_count;
    RAISE NOTICE '- Produtos em destaque: %', featured_count;
    RAISE NOTICE '- Produtos com user_id: %', user_id_count;
    
    -- Verificar políticas RLS
    RAISE NOTICE 'Verificando políticas RLS...';
END $$;

-- === PARTE 2: INSERIR PRODUTOS DE TESTE (SE NECESSÁRIO) ===

-- Inserir produtos de teste se a tabela estiver vazia
DO $$
BEGIN
    -- Verificar se não há produtos
    IF (SELECT COUNT(*) FROM public.recommended_products) = 0 THEN
        -- Inserir alguns produtos de teste
        INSERT INTO public.recommended_products (name, description, price, image, category, benefits, rating, sales_url, is_featured)
        VALUES 
            ('Produto Teste 1', 'Este é um produto de teste para validação', 199.99, 'https://via.placeholder.com/300', 'Tecnologia', ARRAY['Benefício 1', 'Benefício 2'], 4.5, 'https://example.com/produto1', FALSE),
            ('Produto Teste 2', 'Produto em destaque para validação', 299.99, 'https://via.placeholder.com/300', 'Saúde', ARRAY['Benefício 1', 'Benefício 2'], 5.0, 'https://example.com/produto2', TRUE);
            
        RAISE NOTICE 'Produtos de teste inseridos com sucesso';
    END IF;
END $$;

-- === PARTE 3: CORRIGIR PROBLEMAS DE POLÍTICAS RLS ===

-- Garantir que todos possam visualizar os produtos recomendados
ALTER TABLE public.recommended_products DISABLE ROW LEVEL SECURITY;

-- Remover políticas existentes que possam estar restritivas demais
DROP POLICY IF EXISTS "Todos podem ver produtos recomendados" ON public.recommended_products;

-- Criar nova política mais permissiva
CREATE POLICY "Todos podem ver produtos recomendados" ON public.recommended_products
    FOR SELECT
    USING (true);
    
-- Habilitar RLS novamente
ALTER TABLE public.recommended_products ENABLE ROW LEVEL SECURITY;

-- Garantir que o role anon (usuário não autenticado) pode ver os produtos recomendados
GRANT SELECT ON public.recommended_products TO anon;
GRANT SELECT ON public.recommended_products TO authenticated;

-- === PARTE 4: CORRIGIR O CÓDIGO DA CONSULTA ===

-- Fazer uma consulta de teste simulando o que o frontend faz
DO $$
DECLARE
    regular_count INTEGER;
    featured_count INTEGER;
BEGIN
    -- Simular consulta do frontend para produtos regulares
    SELECT COUNT(*) INTO regular_count 
    FROM public.recommended_products 
    WHERE is_featured = FALSE OR is_featured IS NULL;
    
    -- Simular consulta do frontend para produtos em destaque
    SELECT COUNT(*) INTO featured_count 
    FROM public.recommended_products 
    WHERE is_featured = TRUE;
    
    RAISE NOTICE 'Teste de consulta:';
    RAISE NOTICE '- Produtos regulares consultáveis: %', regular_count;
    RAISE NOTICE '- Produtos em destaque consultáveis: %', featured_count;
    
    -- Se não houver produtos regulares, converter alguns produtos em destaque para regulares
    IF regular_count = 0 AND featured_count > 0 THEN
        UPDATE public.recommended_products
        SET is_featured = FALSE
        WHERE id IN (
            SELECT id FROM public.recommended_products WHERE is_featured = TRUE LIMIT (featured_count / 2)
        );
        RAISE NOTICE 'Convertidos alguns produtos em destaque para produtos regulares';
    END IF;
END $$;

-- Diagnóstico final
DO $$
DECLARE
    regular_count INTEGER;
    featured_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO regular_count FROM public.recommended_products WHERE is_featured = FALSE OR is_featured IS NULL;
    SELECT COUNT(*) INTO featured_count FROM public.recommended_products WHERE is_featured = TRUE;
    
    RAISE NOTICE 'Diagnóstico final:';
    RAISE NOTICE '- Produtos regulares: %', regular_count;
    RAISE NOTICE '- Produtos em destaque: %', featured_count;
END $$; 