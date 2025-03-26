-- Script para corrigir problemas com a tabela submitted_products
-- Executar este script no SQL Editor do Supabase

-- Verificar a estrutura atual da tabela
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'submitted_products'
ORDER BY ordinal_position;

-- Verificar se a tabela existe
DO $$
DECLARE
  table_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
      AND table_name = 'submitted_products'
  ) INTO table_exists;
  
  IF NOT table_exists THEN
    -- Criar a tabela se não existir
    CREATE TABLE submitted_products (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      benefits TEXT[] NOT NULL DEFAULT '{}',
      price TEXT NOT NULL,
      rating NUMERIC(3,1) DEFAULT 5.0,
      image TEXT NOT NULL,
      category TEXT NOT NULL,
      "eliteBadge" BOOLEAN DEFAULT FALSE,
      "topPick" BOOLEAN DEFAULT FALSE,
      "userId" UUID REFERENCES auth.users(id),
      status TEXT NOT NULL DEFAULT 'pendente',
      "submittedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      sales_url TEXT
    );

    RAISE NOTICE 'Tabela submitted_products criada com sucesso';
  ELSE
    RAISE NOTICE 'Tabela submitted_products já existe';
    
    -- Verificar e adicionar coluna sales_url se não existir
    IF NOT EXISTS (
      SELECT FROM information_schema.columns 
      WHERE table_schema = 'public' 
        AND table_name = 'submitted_products'
        AND column_name = 'sales_url'
    ) THEN
      ALTER TABLE submitted_products ADD COLUMN sales_url TEXT;
      RAISE NOTICE 'Coluna sales_url adicionada';
    END IF;
  END IF;
END$$;

-- Configurar políticas de segurança para a tabela
ALTER TABLE submitted_products ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes para evitar conflitos
DROP POLICY IF EXISTS "Usuários podem ver seus próprios produtos enviados" ON submitted_products;
DROP POLICY IF EXISTS "Usuários podem adicionar seus próprios produtos" ON submitted_products;
DROP POLICY IF EXISTS "Administradores podem ver todos os produtos enviados" ON submitted_products;

-- Criar políticas para usuários
CREATE POLICY "Usuários podem ver seus próprios produtos enviados" 
ON submitted_products FOR SELECT 
TO authenticated
USING ("userId" = auth.uid());

CREATE POLICY "Usuários podem adicionar seus próprios produtos" 
ON submitted_products FOR INSERT 
TO authenticated
WITH CHECK ("userId" = auth.uid());

-- Criar política para administradores
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE POLICY "Administradores podem ver todos os produtos enviados" 
ON submitted_products FOR SELECT 
TO authenticated
USING (is_admin());

CREATE POLICY "Administradores podem gerenciar todos os produtos enviados" 
ON submitted_products FOR ALL 
TO authenticated
USING (is_admin());

-- Inserir um produto de teste para verificar se funciona
INSERT INTO submitted_products (
  name,
  description,
  benefits,
  price,
  image,
  category,
  "eliteBadge",
  "userId",
  status,
  sales_url
) VALUES (
  'Produto de Teste',
  'Descrição de um produto de teste',
  ARRAY['Benefício 1', 'Benefício 2'],
  'R$ 99,90',
  'https://placehold.co/600x400?text=Produto+Teste',
  'Infoproduto',
  FALSE,
  '00000000-0000-0000-0000-000000000000', -- ID de usuário fictício
  'pendente',
  'https://example.com/produto'
)
ON CONFLICT DO NOTHING;

-- Verificar conteúdo da tabela após correção
SELECT * FROM submitted_products LIMIT 10; 