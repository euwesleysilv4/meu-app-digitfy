-- Script para verificar e corrigir problemas na tabela de produtos pendentes
-- Executar este script no SQL Editor do Supabase

-- 1. Verificar estrutura atual da tabela
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'submitted_products'
ORDER BY ordinal_position;

-- 2. Temporariamente desabilitar RLS para debug
ALTER TABLE submitted_products DISABLE ROW LEVEL SECURITY;

-- 3. Verificar se há registros na tabela
SELECT COUNT(*) as total_pending_products FROM submitted_products;

-- 4. Verificar referências à coluna userId vs user_id
-- (resolver discrepâncias na nomenclatura)
DO $$
DECLARE
    user_id_exists BOOLEAN;
    userId_exists BOOLEAN;
BEGIN
    -- Verificar se a coluna user_id existe
    SELECT EXISTS (
       SELECT FROM information_schema.columns 
       WHERE table_schema = 'public' 
         AND table_name = 'submitted_products'
         AND column_name = 'user_id'
    ) INTO user_id_exists;
    
    -- Verificar se a coluna userId existe
    SELECT EXISTS (
       SELECT FROM information_schema.columns 
       WHERE table_schema = 'public' 
         AND table_name = 'submitted_products'
         AND column_name = 'userId'
    ) INTO userId_exists;
    
    -- Renomear a coluna se necessário
    IF user_id_exists AND NOT userId_exists THEN
        ALTER TABLE submitted_products RENAME COLUMN user_id TO "userId";
        RAISE NOTICE 'Renomeada coluna user_id para userId';
    END IF;
    
    -- Verificar se a coluna submittedAt existe
    SELECT EXISTS (
       SELECT FROM information_schema.columns 
       WHERE table_schema = 'public' 
         AND table_name = 'submitted_products'
         AND column_name = 'submittedAt'
    ) INTO userId_exists;
    
    IF NOT userId_exists THEN
        -- Verificar se existe submitted_at
        SELECT EXISTS (
           SELECT FROM information_schema.columns 
           WHERE table_schema = 'public' 
             AND table_name = 'submitted_products'
             AND column_name = 'submitted_at'
        ) INTO user_id_exists;
        
        IF user_id_exists THEN
            ALTER TABLE submitted_products RENAME COLUMN submitted_at TO "submittedAt";
            RAISE NOTICE 'Renomeada coluna submitted_at para submittedAt';
        ELSE
            -- Adicionar a coluna se não existir
            ALTER TABLE submitted_products ADD COLUMN "submittedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW();
            RAISE NOTICE 'Adicionada coluna submittedAt';
        END IF;
    END IF;
    
    -- Verificar se a coluna updatedAt existe
    SELECT EXISTS (
       SELECT FROM information_schema.columns 
       WHERE table_schema = 'public' 
         AND table_name = 'submitted_products'
         AND column_name = 'updatedAt'
    ) INTO userId_exists;
    
    IF NOT userId_exists THEN
        -- Verificar se existe updated_at
        SELECT EXISTS (
           SELECT FROM information_schema.columns 
           WHERE table_schema = 'public' 
             AND table_name = 'submitted_products'
             AND column_name = 'updated_at'
        ) INTO user_id_exists;
        
        IF user_id_exists THEN
            ALTER TABLE submitted_products RENAME COLUMN updated_at TO "updatedAt";
            RAISE NOTICE 'Renomeada coluna updated_at para updatedAt';
        ELSE
            -- Adicionar a coluna se não existir
            ALTER TABLE submitted_products ADD COLUMN "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW();
            RAISE NOTICE 'Adicionada coluna updatedAt';
        END IF;
    END IF;
END $$;

-- 5. Corrigir políticas para usuários verem produtos pendentes
DROP POLICY IF EXISTS "Usuários podem ver seus próprios produtos enviados" ON submitted_products;

CREATE POLICY "Usuários podem ver seus próprios produtos enviados" 
ON submitted_products FOR SELECT 
USING (
  auth.uid() = "userId" OR public.check_product_admin_role(auth.uid())
);

-- 6. Corrigir referências a perfis
CREATE POLICY "Administradores podem ver todos os produtos enviados" 
ON submitted_products FOR SELECT 
USING (public.check_product_admin_role(auth.uid()));

-- 7. Verificar a estrutura após correções
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'submitted_products'
ORDER BY ordinal_position;

-- 8. Inserir produto de exemplo para testes (se a tabela estiver vazia)
DO $$
DECLARE
    count_records INTEGER;
    admin_id UUID;
BEGIN
    SELECT COUNT(*) FROM submitted_products INTO count_records;
    
    IF count_records = 0 THEN
        -- Buscar ID de um admin para inserir um exemplo
        SELECT id INTO admin_id FROM profiles WHERE role = 'admin' LIMIT 1;
        
        IF admin_id IS NOT NULL THEN
            INSERT INTO submitted_products (
                name, 
                description, 
                benefits, 
                price, 
                rating, 
                image, 
                category, 
                "userId", 
                status, 
                "submittedAt", 
                "updatedAt"
            ) VALUES (
                'Curso de SEO para Iniciantes', 
                'Aprenda os fundamentos de SEO e como rankear seu site nos mecanismos de busca.',
                ARRAY['Material completo', 'Suporte por email', 'Certificado de conclusão'],
                'R$ 197,00',
                4.7,
                'https://placehold.co/600x400?text=Curso+SEO',
                'Cursos',
                admin_id,
                'pendente',
                NOW(),
                NOW()
            );
            RAISE NOTICE 'Inserido produto de exemplo para testes';
        END IF;
    END IF;
END $$;

-- 9. Reabilitar RLS
ALTER TABLE submitted_products ENABLE ROW LEVEL SECURITY;

-- 10. Verificar produtos atuais
SELECT id, name, category, status, "submittedAt", "userId"
FROM submitted_products
LIMIT 10; 