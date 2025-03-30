-- Script para configurar alguns usuários como plano Elite para testes (VERSÃO CORRIGIDA)

-- Atualizar o primeiro administrador para ter plano Elite
UPDATE public.profiles
SET plano = 'elite'
WHERE id IN (
    SELECT id 
    FROM public.profiles 
    WHERE role = 'admin' 
    LIMIT 1
);

-- Atualizar produtos aprovados para incluir o user_id e marcar como destaque para usuários Elite
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

-- Garantir que TODOS os produtos de usuários Elite sejam marcados como featured
DO $$
DECLARE
    products_count INT;
BEGIN
    UPDATE public.recommended_products 
    SET is_featured = TRUE
    WHERE user_id IN (
        SELECT id FROM public.profiles WHERE plano = 'elite'
    )
    AND (is_featured IS NULL OR is_featured = FALSE);
    
    GET DIAGNOSTICS products_count = ROW_COUNT;
    
    RAISE NOTICE 'Atualizados % produtos de usuários Elite para serem exibidos em destaque', products_count;
END $$; 