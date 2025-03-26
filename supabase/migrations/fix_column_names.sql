-- Script para corrigir nomes de colunas na tabela recommended_products
-- Executar este script no SQL Editor do Supabase

-- Verifica se as colunas existem com nomes em formato snake_case
DO $$
DECLARE
    column_exists BOOLEAN;
BEGIN
    -- Verificar se a coluna added_at existe
    SELECT EXISTS (
       SELECT FROM information_schema.columns 
       WHERE table_schema = 'public' 
         AND table_name = 'recommended_products'
         AND column_name = 'added_at'
    ) INTO column_exists;
    
    -- Se a coluna added_at existe, renomeá-la para addedAt
    IF column_exists THEN
        ALTER TABLE recommended_products RENAME COLUMN added_at TO "addedAt";
        RAISE NOTICE 'Coluna added_at renomeada para addedAt';
    END IF;
    
    -- Verificar se a coluna approved_at existe
    SELECT EXISTS (
       SELECT FROM information_schema.columns 
       WHERE table_schema = 'public' 
         AND table_name = 'recommended_products'
         AND column_name = 'approved_at'
    ) INTO column_exists;
    
    -- Se a coluna approved_at existe, renomeá-la para approvedAt
    IF column_exists THEN
        ALTER TABLE recommended_products RENAME COLUMN approved_at TO "approvedAt";
        RAISE NOTICE 'Coluna approved_at renomeada para approvedAt';
    END IF;
    
    -- Verificar se a coluna added_by_admin existe
    SELECT EXISTS (
       SELECT FROM information_schema.columns 
       WHERE table_schema = 'public' 
         AND table_name = 'recommended_products'
         AND column_name = 'added_by_admin'
    ) INTO column_exists;
    
    -- Se a coluna added_by_admin existe, renomeá-la para addedByAdmin
    IF column_exists THEN
        ALTER TABLE recommended_products RENAME COLUMN added_by_admin TO "addedByAdmin";
        RAISE NOTICE 'Coluna added_by_admin renomeada para addedByAdmin';
    END IF;
    
    -- Verificar se a coluna elite_badge existe
    SELECT EXISTS (
       SELECT FROM information_schema.columns 
       WHERE table_schema = 'public' 
         AND table_name = 'recommended_products'
         AND column_name = 'elite_badge'
    ) INTO column_exists;
    
    -- Se a coluna elite_badge existe, renomeá-la para eliteBadge
    IF column_exists THEN
        ALTER TABLE recommended_products RENAME COLUMN elite_badge TO "eliteBadge";
        RAISE NOTICE 'Coluna elite_badge renomeada para eliteBadge';
    END IF;
    
    -- Verificar se a coluna top_pick existe
    SELECT EXISTS (
       SELECT FROM information_schema.columns 
       WHERE table_schema = 'public' 
         AND table_name = 'recommended_products'
         AND column_name = 'top_pick'
    ) INTO column_exists;
    
    -- Se a coluna top_pick existe, renomeá-la para topPick
    IF column_exists THEN
        ALTER TABLE recommended_products RENAME COLUMN top_pick TO "topPick";
        RAISE NOTICE 'Coluna top_pick renomeada para topPick';
    END IF;
END $$;

-- Verificar também na tabela submitted_products
DO $$
DECLARE
    column_exists BOOLEAN;
BEGIN
    -- Verificar se a coluna submitted_at existe
    SELECT EXISTS (
       SELECT FROM information_schema.columns 
       WHERE table_schema = 'public' 
         AND table_name = 'submitted_products'
         AND column_name = 'submitted_at'
    ) INTO column_exists;
    
    -- Se a coluna submitted_at existe, renomeá-la para submittedAt
    IF column_exists THEN
        ALTER TABLE submitted_products RENAME COLUMN submitted_at TO "submittedAt";
        RAISE NOTICE 'Coluna submitted_at renomeada para submittedAt';
    END IF;
    
    -- Verificar se a coluna updated_at existe
    SELECT EXISTS (
       SELECT FROM information_schema.columns 
       WHERE table_schema = 'public' 
         AND table_name = 'submitted_products'
         AND column_name = 'updated_at'
    ) INTO column_exists;
    
    -- Se a coluna updated_at existe, renomeá-la para updatedAt
    IF column_exists THEN
        ALTER TABLE submitted_products RENAME COLUMN updated_at TO "updatedAt";
        RAISE NOTICE 'Coluna updated_at renomeada para updatedAt';
    END IF;
    
    -- Verificar se a coluna user_id existe
    SELECT EXISTS (
       SELECT FROM information_schema.columns 
       WHERE table_schema = 'public' 
         AND table_name = 'submitted_products'
         AND column_name = 'user_id'
    ) INTO column_exists;
    
    -- Se a coluna user_id existe, renomeá-la para userId
    IF column_exists THEN
        ALTER TABLE submitted_products RENAME COLUMN user_id TO "userId";
        RAISE NOTICE 'Coluna user_id renomeada para userId';
    END IF;
    
    -- Verificar se a coluna elite_badge existe
    SELECT EXISTS (
       SELECT FROM information_schema.columns 
       WHERE table_schema = 'public' 
         AND table_name = 'submitted_products'
         AND column_name = 'elite_badge'
    ) INTO column_exists;
    
    -- Se a coluna elite_badge existe, renomeá-la para eliteBadge
    IF column_exists THEN
        ALTER TABLE submitted_products RENAME COLUMN elite_badge TO "eliteBadge";
        RAISE NOTICE 'Coluna elite_badge renomeada para eliteBadge';
    END IF;
    
    -- Verificar se a coluna top_pick existe
    SELECT EXISTS (
       SELECT FROM information_schema.columns 
       WHERE table_schema = 'public' 
         AND table_name = 'submitted_products'
         AND column_name = 'top_pick'
    ) INTO column_exists;
    
    -- Se a coluna top_pick existe, renomeá-la para topPick
    IF column_exists THEN
        ALTER TABLE submitted_products RENAME COLUMN top_pick TO "topPick";
        RAISE NOTICE 'Coluna top_pick renomeada para topPick';
    END IF;
END $$;

-- Verificar a estrutura atualizada da tabela
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'recommended_products'
ORDER BY ordinal_position;

-- Conceder permissões novamente após as alterações
GRANT SELECT ON recommended_products TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON recommended_products TO authenticated; 