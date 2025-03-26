-- Função para corrigir problemas nas tabelas de produtos
CREATE OR REPLACE FUNCTION fix_product_tables_issues()
RETURNS TEXT
SECURITY DEFINER
AS $$
DECLARE
    result TEXT := '';
    userId_exists BOOLEAN;
    user_id_exists BOOLEAN;
    submittedAt_exists BOOLEAN;
    submitted_at_exists BOOLEAN;
    updatedAt_exists BOOLEAN;
    updated_at_exists BOOLEAN;
    recommended_exists BOOLEAN;
    submitted_exists BOOLEAN;
BEGIN
    -- Verificar se as tabelas existem
    SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'recommended_products'
    ) INTO recommended_exists;
    
    SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'submitted_products'
    ) INTO submitted_exists;
    
    -- Criar tabelas se não existirem
    IF NOT recommended_exists THEN
        CREATE TABLE IF NOT EXISTS recommended_products (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            name TEXT NOT NULL,
            description TEXT NOT NULL,
            benefits TEXT[] NOT NULL DEFAULT '{}',
            price TEXT NOT NULL,
            rating NUMERIC(3,1) NOT NULL DEFAULT 5.0,
            image TEXT NOT NULL,
            category TEXT NOT NULL,
            "eliteBadge" BOOLEAN DEFAULT FALSE,
            "topPick" BOOLEAN DEFAULT FALSE,
            status TEXT DEFAULT 'aprovado',
            "addedByAdmin" BOOLEAN DEFAULT FALSE,
            "addedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            "approvedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        result := result || 'Tabela recommended_products criada. ';
    END IF;

    IF NOT submitted_exists THEN
        CREATE TABLE IF NOT EXISTS submitted_products (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            name TEXT NOT NULL,
            description TEXT NOT NULL,
            benefits TEXT[] NOT NULL DEFAULT '{}',
            price TEXT NOT NULL,
            rating NUMERIC(3,1) NOT NULL DEFAULT 5.0,
            image TEXT NOT NULL,
            category TEXT NOT NULL,
            "eliteBadge" BOOLEAN DEFAULT FALSE,
            "topPick" BOOLEAN DEFAULT FALSE,
            "userId" UUID REFERENCES auth.users(id),
            status TEXT NOT NULL DEFAULT 'pendente',
            "submittedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        result := result || 'Tabela submitted_products criada. ';
    END IF;
    
    -- Se a tabela submitted_products existe, verificar e corrigir suas colunas
    IF submitted_exists THEN
        -- Verificar se as colunas userId existem e converter caso necessário
        SELECT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_schema = 'public' 
              AND table_name = 'submitted_products'
              AND column_name = 'userId'
        ) INTO userId_exists;
        
        SELECT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_schema = 'public' 
              AND table_name = 'submitted_products'
              AND column_name = 'user_id'
        ) INTO user_id_exists;
        
        -- Corrigir userId/user_id
        IF NOT userId_exists AND user_id_exists THEN
            ALTER TABLE submitted_products RENAME COLUMN user_id TO "userId";
            result := result || 'Renomeada coluna user_id para userId. ';
        ELSIF NOT user_id_exists AND userId_exists THEN
            ALTER TABLE submitted_products ADD COLUMN user_id UUID;
            UPDATE submitted_products SET user_id = "userId";
            result := result || 'Adicionada coluna user_id espelhando userId. ';
        END IF;
        
        -- Corrigir submittedAt/submitted_at
        SELECT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_schema = 'public' 
              AND table_name = 'submitted_products'
              AND column_name = 'submittedAt'
        ) INTO submittedAt_exists;
        
        SELECT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_schema = 'public' 
              AND table_name = 'submitted_products'
              AND column_name = 'submitted_at'
        ) INTO submitted_at_exists;
        
        IF NOT submittedAt_exists AND submitted_at_exists THEN
            ALTER TABLE submitted_products RENAME COLUMN submitted_at TO "submittedAt";
            result := result || 'Renomeada coluna submitted_at para submittedAt. ';
        ELSIF NOT submitted_at_exists AND submittedAt_exists THEN
            ALTER TABLE submitted_products ADD COLUMN submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
            UPDATE submitted_products SET submitted_at = "submittedAt";
            result := result || 'Adicionada coluna submitted_at espelhando submittedAt. ';
        END IF;
        
        -- Corrigir updatedAt/updated_at
        SELECT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_schema = 'public' 
              AND table_name = 'submitted_products'
              AND column_name = 'updatedAt'
        ) INTO updatedAt_exists;
        
        SELECT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_schema = 'public' 
              AND table_name = 'submitted_products'
              AND column_name = 'updated_at'
        ) INTO updated_at_exists;
        
        IF NOT updatedAt_exists AND updated_at_exists THEN
            ALTER TABLE submitted_products RENAME COLUMN updated_at TO "updatedAt";
            result := result || 'Renomeada coluna updated_at para updatedAt. ';
        ELSIF NOT updated_at_exists AND updatedAt_exists THEN
            ALTER TABLE submitted_products ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
            UPDATE submitted_products SET updated_at = "updatedAt";
            result := result || 'Adicionada coluna updated_at espelhando updatedAt. ';
        END IF;
    END IF;
    
    -- Verificar e corrigir RLS policies
    IF recommended_exists THEN
        ALTER TABLE recommended_products ENABLE ROW LEVEL SECURITY;
        
        -- Adicionar políticas
        DROP POLICY IF EXISTS "Produtos recomendados visíveis para todos" ON recommended_products;
        CREATE POLICY "Produtos recomendados visíveis para todos" 
        ON recommended_products FOR SELECT USING (true);
        
        DROP POLICY IF EXISTS "Apenas administradores podem gerenciar produtos recomendados" ON recommended_products;
        CREATE POLICY "Apenas administradores podem gerenciar produtos recomendados" 
        ON recommended_products FOR ALL 
        USING (
          EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
          )
        );
        
        result := result || 'Políticas RLS para recommended_products atualizadas. ';
    END IF;
    
    IF submitted_exists THEN
        ALTER TABLE submitted_products ENABLE ROW LEVEL SECURITY;
        
        DROP POLICY IF EXISTS "Usuários podem ver seus próprios produtos enviados" ON submitted_products;
        CREATE POLICY "Usuários podem ver seus próprios produtos enviados" 
        ON submitted_products FOR SELECT 
        USING (
          auth.uid() = "userId" OR 
          (user_id_exists AND auth.uid() = user_id) OR
          EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
          )
        );
        
        DROP POLICY IF EXISTS "Administradores podem ver todos os produtos enviados" ON submitted_products;
        CREATE POLICY "Administradores podem ver todos os produtos enviados" 
        ON submitted_products FOR SELECT 
        USING (
          EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
          )
        );
        
        DROP POLICY IF EXISTS "Usuários podem enviar novos produtos" ON submitted_products;
        CREATE POLICY "Usuários podem enviar novos produtos" 
        ON submitted_products FOR INSERT 
        WITH CHECK (
          auth.uid() = "userId" OR
          (user_id_exists AND auth.uid() = user_id)
        );
        
        DROP POLICY IF EXISTS "Administradores podem atualizar qualquer produto enviado" ON submitted_products;
        CREATE POLICY "Administradores podem atualizar qualquer produto enviado" 
        ON submitted_products FOR UPDATE 
        USING (
          EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
          )
        );
        
        result := result || 'Políticas RLS para submitted_products atualizadas. ';
    END IF;
    
    -- Retornar resultado das operações
    IF result = '' THEN
        RETURN 'Nenhuma alteração foi necessária.';
    ELSE
        RETURN 'Correções aplicadas: ' || result;
    END IF;
EXCEPTION WHEN OTHERS THEN
    RETURN 'Erro ao aplicar correções: ' || SQLERRM;
END;
$$ LANGUAGE plpgsql; 