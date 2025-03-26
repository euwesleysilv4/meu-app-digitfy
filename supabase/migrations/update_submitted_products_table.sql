-- Migração para atualizar a tabela submitted_products
-- Adiciona os campos necessários para corresponder à nova interface SubmittedProduct

-- Verificar e atualizar estrutura da tabela
DO $$
DECLARE
  table_exists BOOLEAN;
BEGIN
  -- Verificar se a tabela existe
  SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
      AND table_name = 'submitted_products'
  ) INTO table_exists;
  
  IF NOT table_exists THEN
    -- Criar a tabela se não existir
    CREATE TABLE public.submitted_products (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      image TEXT NOT NULL,
      image_url TEXT,
      benefits TEXT[] NOT NULL DEFAULT '{}',
      price NUMERIC(10,2) NOT NULL,
      price_display TEXT NOT NULL,
      category TEXT NOT NULL,
      sales_url TEXT,
      commission_rate INTEGER DEFAULT 50,
      affiliate_link TEXT,
      vendor_name TEXT,
      platform TEXT DEFAULT 'Hotmart',
      "userId" UUID REFERENCES auth.users(id),
      status TEXT NOT NULL DEFAULT 'pendente',
      "submittedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      "reviewerId" UUID REFERENCES auth.users(id),
      "reviewerComments" TEXT,
      "reviewedAt" TIMESTAMP WITH TIME ZONE
    );

    RAISE NOTICE 'Tabela submitted_products criada com sucesso';
  ELSE
    -- Adicionar colunas necessárias se a tabela já existir
    -- Coluna benefits com tipo array
    IF NOT EXISTS (
      SELECT FROM information_schema.columns 
      WHERE table_schema = 'public' 
        AND table_name = 'submitted_products'
        AND column_name = 'benefits'
    ) THEN
      ALTER TABLE public.submitted_products ADD COLUMN benefits TEXT[] DEFAULT '{}';
      RAISE NOTICE 'Coluna benefits adicionada';
    END IF;
    
    -- Coluna image_url
    IF NOT EXISTS (
      SELECT FROM information_schema.columns 
      WHERE table_schema = 'public' 
        AND table_name = 'submitted_products'
        AND column_name = 'image_url'
    ) THEN
      ALTER TABLE public.submitted_products ADD COLUMN image_url TEXT;
      RAISE NOTICE 'Coluna image_url adicionada';
    END IF;
    
    -- Coluna price_display
    IF NOT EXISTS (
      SELECT FROM information_schema.columns 
      WHERE table_schema = 'public' 
        AND table_name = 'submitted_products'
        AND column_name = 'price_display'
    ) THEN
      ALTER TABLE public.submitted_products ADD COLUMN price_display TEXT DEFAULT '';
      RAISE NOTICE 'Coluna price_display adicionada';
    END IF;
    
    -- Coluna commission_rate
    IF NOT EXISTS (
      SELECT FROM information_schema.columns 
      WHERE table_schema = 'public' 
        AND table_name = 'submitted_products'
        AND column_name = 'commission_rate'
    ) THEN
      ALTER TABLE public.submitted_products ADD COLUMN commission_rate INTEGER DEFAULT 50;
      RAISE NOTICE 'Coluna commission_rate adicionada';
    END IF;
    
    -- Coluna affiliate_link
    IF NOT EXISTS (
      SELECT FROM information_schema.columns 
      WHERE table_schema = 'public' 
        AND table_name = 'submitted_products'
        AND column_name = 'affiliate_link'
    ) THEN
      ALTER TABLE public.submitted_products ADD COLUMN affiliate_link TEXT;
      RAISE NOTICE 'Coluna affiliate_link adicionada';
    END IF;
    
    -- Coluna vendor_name
    IF NOT EXISTS (
      SELECT FROM information_schema.columns 
      WHERE table_schema = 'public' 
        AND table_name = 'submitted_products'
        AND column_name = 'vendor_name'
    ) THEN
      ALTER TABLE public.submitted_products ADD COLUMN vendor_name TEXT;
      RAISE NOTICE 'Coluna vendor_name adicionada';
    END IF;
    
    -- Coluna platform
    IF NOT EXISTS (
      SELECT FROM information_schema.columns 
      WHERE table_schema = 'public' 
        AND table_name = 'submitted_products'
        AND column_name = 'platform'
    ) THEN
      ALTER TABLE public.submitted_products ADD COLUMN platform TEXT DEFAULT 'Hotmart';
      RAISE NOTICE 'Coluna platform adicionada';
    END IF;
    
    -- Colunas para review
    IF NOT EXISTS (
      SELECT FROM information_schema.columns 
      WHERE table_schema = 'public' 
        AND table_name = 'submitted_products'
        AND column_name = 'reviewerId'
    ) THEN
      ALTER TABLE public.submitted_products ADD COLUMN "reviewerId" UUID REFERENCES auth.users(id);
      RAISE NOTICE 'Coluna reviewerId adicionada';
    END IF;
    
    IF NOT EXISTS (
      SELECT FROM information_schema.columns 
      WHERE table_schema = 'public' 
        AND table_name = 'submitted_products'
        AND column_name = 'reviewerComments'
    ) THEN
      ALTER TABLE public.submitted_products ADD COLUMN "reviewerComments" TEXT;
      RAISE NOTICE 'Coluna reviewerComments adicionada';
    END IF;
    
    IF NOT EXISTS (
      SELECT FROM information_schema.columns 
      WHERE table_schema = 'public' 
        AND table_name = 'submitted_products'
        AND column_name = 'reviewedAt'
    ) THEN
      ALTER TABLE public.submitted_products ADD COLUMN "reviewedAt" TIMESTAMP WITH TIME ZONE;
      RAISE NOTICE 'Coluna reviewedAt adicionada';
    END IF;
  END IF;
END$$;

-- Atualizar políticas de segurança para a tabela
ALTER TABLE public.submitted_products ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes para evitar conflitos
DROP POLICY IF EXISTS "Usuários podem ver seus próprios produtos enviados" ON public.submitted_products;
DROP POLICY IF EXISTS "Usuários podem adicionar seus próprios produtos" ON public.submitted_products;
DROP POLICY IF EXISTS "Administradores podem ver todos os produtos enviados" ON public.submitted_products;
DROP POLICY IF EXISTS "Administradores podem gerenciar todos os produtos enviados" ON public.submitted_products;

-- Criar políticas para usuários
CREATE POLICY "Usuários podem ver seus próprios produtos enviados" 
ON public.submitted_products FOR SELECT 
TO authenticated
USING ("userId" = auth.uid());

CREATE POLICY "Usuários podem adicionar seus próprios produtos" 
ON public.submitted_products FOR INSERT 
TO authenticated
WITH CHECK ("userId" = auth.uid());

-- Função para verificar se o usuário é admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar política para administradores
CREATE POLICY "Administradores podem ver todos os produtos enviados" 
ON public.submitted_products FOR SELECT 
TO authenticated
USING (public.is_admin());

CREATE POLICY "Administradores podem gerenciar todos os produtos enviados" 
ON public.submitted_products FOR ALL 
TO authenticated
USING (public.is_admin());

-- Informativo final
SELECT 'Tabela submitted_products foi atualizada com sucesso.' AS mensagem; 