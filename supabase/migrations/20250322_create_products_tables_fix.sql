-- Script para criação das tabelas de produtos no Supabase (versão corrigida)
-- Executar este script no SQL Editor do Supabase

-- Tabela para produtos recomendados (aprovados)
CREATE TABLE IF NOT EXISTS recommended_products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  benefits TEXT[] NOT NULL DEFAULT '{}',
  price TEXT NOT NULL,
  rating NUMERIC(3,1) NOT NULL DEFAULT 5.0,
  image TEXT NOT NULL,
  category TEXT NOT NULL,
  elite_badge BOOLEAN DEFAULT FALSE,
  top_pick BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'aprovado',
  added_by_admin BOOLEAN DEFAULT FALSE,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  approved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para produtos enviados pelos usuários (pendentes de aprovação)
CREATE TABLE IF NOT EXISTS submitted_products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  benefits TEXT[] NOT NULL DEFAULT '{}',
  price TEXT NOT NULL,
  rating NUMERIC(3,1) NOT NULL DEFAULT 5.0,
  image TEXT NOT NULL,
  category TEXT NOT NULL,
  elite_badge BOOLEAN DEFAULT FALSE,
  top_pick BOOLEAN DEFAULT FALSE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  status TEXT NOT NULL DEFAULT 'pendente',
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Políticas de segurança (RLS) para a tabela de produtos recomendados
ALTER TABLE recommended_products ENABLE ROW LEVEL SECURITY;

-- Verifica se a política já existe antes de criá-la
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'recommended_products' 
        AND policyname = 'Produtos recomendados visíveis para todos'
    ) THEN
        CREATE POLICY "Produtos recomendados visíveis para todos" 
        ON recommended_products FOR SELECT 
        USING (status = 'aprovado');
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'recommended_products' 
        AND policyname = 'Apenas administradores podem gerenciar produtos recomendados'
    ) THEN
        CREATE POLICY "Apenas administradores podem gerenciar produtos recomendados" 
        ON recommended_products FOR ALL 
        USING (
          auth.uid() IN (
            SELECT id FROM profiles WHERE role = 'admin'
          )
        );
    END IF;
END;
$$;

-- Políticas de segurança (RLS) para a tabela de produtos enviados
ALTER TABLE submitted_products ENABLE ROW LEVEL SECURITY;

-- Verifica se as políticas já existem antes de criá-las
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'submitted_products' 
        AND policyname = 'Usuários podem ver seus próprios produtos enviados'
    ) THEN
        CREATE POLICY "Usuários podem ver seus próprios produtos enviados" 
        ON submitted_products FOR SELECT 
        USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'submitted_products' 
        AND policyname = 'Administradores podem ver todos os produtos enviados'
    ) THEN
        CREATE POLICY "Administradores podem ver todos os produtos enviados" 
        ON submitted_products FOR SELECT 
        USING (
          auth.uid() IN (
            SELECT id FROM profiles WHERE role = 'admin'
          )
        );
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'submitted_products' 
        AND policyname = 'Usuários podem enviar novos produtos'
    ) THEN
        CREATE POLICY "Usuários podem enviar novos produtos" 
        ON submitted_products FOR INSERT 
        WITH CHECK (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'submitted_products' 
        AND policyname = 'Usuários podem atualizar seus próprios produtos pendentes'
    ) THEN
        CREATE POLICY "Usuários podem atualizar seus próprios produtos pendentes" 
        ON submitted_products FOR UPDATE 
        USING (
          auth.uid() = user_id AND 
          status = 'pendente'
        );
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'submitted_products' 
        AND policyname = 'Administradores podem atualizar qualquer produto enviado'
    ) THEN
        CREATE POLICY "Administradores podem atualizar qualquer produto enviado" 
        ON submitted_products FOR UPDATE 
        USING (
          auth.uid() IN (
            SELECT id FROM profiles WHERE role = 'admin'
          )
        );
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'submitted_products' 
        AND policyname = 'Administradores podem excluir qualquer produto enviado'
    ) THEN
        CREATE POLICY "Administradores podem excluir qualquer produto enviado" 
        ON submitted_products FOR DELETE 
        USING (
          auth.uid() IN (
            SELECT id FROM profiles WHERE role = 'admin'
          )
        );
    END IF;
END;
$$;

-- Inserir alguns exemplos de produtos recomendados para teste
-- (Verificar se já existem produtos antes de inserir)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM recommended_products LIMIT 1) THEN
        INSERT INTO recommended_products (name, description, benefits, price, rating, image, category, elite_badge, top_pick)
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
    END IF;
END;
$$;

-- Função para validar produtos antes da inserção/atualização
CREATE OR REPLACE FUNCTION validate_product()
RETURNS TRIGGER AS $$
BEGIN
  -- Validar nome
  IF LENGTH(NEW.name) < 3 THEN
    RAISE EXCEPTION 'O nome do produto deve ter pelo menos 3 caracteres';
  END IF;
  
  -- Validar descrição
  IF LENGTH(NEW.description) < 10 THEN
    RAISE EXCEPTION 'A descrição do produto deve ter pelo menos 10 caracteres';
  END IF;
  
  -- Validar preço (formato)
  IF NEW.price !~ '^R\$\s*\d+(\,\d{2})?(\.\d{2})?$' THEN
    RAISE EXCEPTION 'O preço deve estar no formato "R$ X,XX" ou "R$ X.XX"';
  END IF;
  
  -- Validar imagem (URL)
  IF NEW.image !~ '^https?://' THEN
    RAISE EXCEPTION 'A imagem deve ser uma URL válida iniciando com http:// ou https://';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Remover os triggers existentes se necessário
DROP TRIGGER IF EXISTS validate_recommended_product ON recommended_products;
DROP TRIGGER IF EXISTS validate_submitted_product ON submitted_products;

-- Aplicar trigger de validação aos produtos recomendados
CREATE TRIGGER validate_recommended_product
BEFORE INSERT OR UPDATE ON recommended_products
FOR EACH ROW
EXECUTE FUNCTION validate_product();

-- Aplicar trigger de validação aos produtos enviados
CREATE TRIGGER validate_submitted_product
BEFORE INSERT OR UPDATE ON submitted_products
FOR EACH ROW
EXECUTE FUNCTION validate_product(); 