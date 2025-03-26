-- Script para recriar as tabelas de produtos com nomes em camelCase
-- ⚠️ ATENÇÃO: Este script irá excluir e recriar as tabelas. Faça backup dos dados antes de executar!
-- Executar este script no SQL Editor do Supabase

-- Primeiro, vamos fazer backup dos dados existentes (se houver)
CREATE TABLE IF NOT EXISTS recommended_products_backup AS
SELECT * FROM recommended_products;

CREATE TABLE IF NOT EXISTS submitted_products_backup AS
SELECT * FROM submitted_products;

-- Agora, vamos remover as tabelas existentes
DROP TABLE IF EXISTS recommended_products CASCADE;
DROP TABLE IF EXISTS submitted_products CASCADE;

-- Recriar a tabela de produtos recomendados (aprovados) com nomes em camelCase
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

-- Recriar a tabela de produtos enviados pelos usuários (pendentes de aprovação)
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
  "userId" UUID NOT NULL REFERENCES auth.users(id),
  status TEXT NOT NULL DEFAULT 'pendente',
  "submittedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Políticas de segurança (RLS) para a tabela de produtos recomendados
ALTER TABLE recommended_products ENABLE ROW LEVEL SECURITY;

-- Qualquer pessoa pode visualizar os produtos recomendados
CREATE POLICY "Produtos recomendados visíveis para todos" 
ON recommended_products FOR SELECT 
USING (true);

-- Apenas administradores podem inserir, atualizar ou excluir produtos recomendados
CREATE POLICY "Apenas administradores podem gerenciar produtos recomendados" 
ON recommended_products FOR ALL 
USING (
  auth.uid() IN (
    SELECT id FROM profiles WHERE role = 'admin'
  )
);

-- Políticas de segurança (RLS) para a tabela de produtos enviados
ALTER TABLE submitted_products ENABLE ROW LEVEL SECURITY;

-- Usuários podem ver seus próprios produtos enviados ou administradores podem ver todos
CREATE POLICY "Usuários podem ver seus próprios produtos enviados" 
ON submitted_products FOR SELECT 
USING (
  auth.uid() = "userId" OR
  auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')
);

-- Usuários podem inserir novos produtos
CREATE POLICY "Usuários podem enviar novos produtos" 
ON submitted_products FOR INSERT 
WITH CHECK (auth.uid() = "userId");

-- Administradores podem atualizar qualquer produto enviado
CREATE POLICY "Administradores podem atualizar qualquer produto enviado" 
ON submitted_products FOR UPDATE 
USING (
  auth.uid() IN (
    SELECT id FROM profiles WHERE role = 'admin'
  )
);

-- Administradores podem excluir qualquer produto enviado
CREATE POLICY "Administradores podem excluir qualquer produto enviado" 
ON submitted_products FOR DELETE 
USING (
  auth.uid() IN (
    SELECT id FROM profiles WHERE role = 'admin'
  )
);

-- Conceder permissões
GRANT SELECT ON recommended_products TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON recommended_products TO authenticated;
GRANT SELECT ON submitted_products TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON submitted_products TO authenticated;

-- Inserir alguns exemplos de produtos recomendados para teste
INSERT INTO recommended_products (name, description, benefits, price, rating, image, category, "eliteBadge", "topPick")
VALUES 
(
  'Curso de Marketing Digital', 
  'Aprenda estratégias avançadas de marketing digital com especialistas do mercado.', 
  ARRAY['Certificado reconhecido', 'Acesso vitalício', 'Suporte especializado', 'Comunidade exclusiva'], 
  'R$ 497,00', 
  4.8, 
  'https://placehold.co/600x400?text=Curso+Marketing', 
  'Cursos', 
  true, 
  true
),
(
  'Ebook: Guia de Tráfego Pago', 
  'Um guia completo para maximizar seus resultados com tráfego pago em diferentes plataformas.', 
  ARRAY['Estratégias comprovadas', 'Passo a passo prático', 'Cases de sucesso'], 
  'R$ 97,00', 
  4.5, 
  'https://placehold.co/600x400?text=Ebook+Trafego', 
  'Ebooks', 
  false, 
  true
);

-- Verificar a estrutura da tabela
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'recommended_products'
ORDER BY ordinal_position;

-- Verificar os dados inseridos
SELECT * FROM recommended_products; 