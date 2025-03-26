-- Script para criação da tabela de produtos de afiliados no Supabase
-- Esta tabela armazenará os produtos exibidos na Área do Afiliado

-- Tabela principal para produtos de afiliados
CREATE TABLE IF NOT EXISTS public.affiliate_products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT NOT NULL,
  benefits TEXT[] NOT NULL DEFAULT '{}',
  price NUMERIC(10,2) NOT NULL,
  price_display TEXT NOT NULL, -- Formato para exibição (ex: "R$ 197/única")
  category TEXT NOT NULL,
  featured BOOLEAN DEFAULT FALSE, -- Se o produto deve ser destacado
  active BOOLEAN DEFAULT TRUE, -- Se o produto está ativo para exibição
  order_index INTEGER DEFAULT 0, -- Ordem de exibição dos produtos
  sales_url TEXT, -- URL para página de vendas do produto
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar Row Level Security
ALTER TABLE public.affiliate_products ENABLE ROW LEVEL SECURITY;

-- Política para permitir leitura pública
CREATE POLICY "Produtos de afiliados visíveis para todos"
ON public.affiliate_products
FOR SELECT
USING (active = TRUE);

-- Política para permitir que apenas administradores gerenciem os produtos
CREATE POLICY "Apenas administradores podem gerenciar produtos de afiliados"
ON public.affiliate_products
FOR ALL
USING (
  auth.uid() IN (
    SELECT id FROM profiles WHERE role = 'admin'
  )
);

-- Trigger para atualizar o campo updated_at automaticamente
CREATE OR REPLACE FUNCTION update_affiliate_products_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_timestamp_affiliate_products
BEFORE UPDATE ON public.affiliate_products
FOR EACH ROW
EXECUTE FUNCTION update_affiliate_products_timestamp();

-- Inserir os produtos mencionados na página da Área do Afiliado como dados iniciais
INSERT INTO public.affiliate_products (
  name,
  description,
  image_url,
  benefits,
  price,
  price_display,
  category,
  featured,
  active,
  order_index,
  sales_url
) VALUES
(
  'Curso Completo de Marketing Digital',
  'Domine todas as estratégias e ferramentas de marketing digital para impulsionar seus resultados online.',
  'https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?auto=format&fit=crop&q=80&w=300&h=200',
  ARRAY['Mais de 100 horas de conteúdo', 'Certificado reconhecido pelo mercado', 'Acesso vitalício', 'Suporte personalizado'],
  497.00,
  'R$ 497,00',
  'Marketing Digital',
  TRUE,
  TRUE,
  1,
  'https://exemplo.com/curso-marketing-digital'
),
(
  'Programa Expert em SEO',
  'Aprenda técnicas avançadas de SEO para aumentar o tráfego orgânico e posicionar seu site no topo dos resultados de busca.',
  'https://images.unsplash.com/photo-1571171637578-41bc2dd41cd2?auto=format&fit=crop&q=80&w=300&h=200',
  ARRAY['Otimização técnica completa', 'Estratégias de link building', 'Análise de concorrentes', 'Plano de conteúdo otimizado'],
  397.00,
  'R$ 397,00',
  'SEO',
  TRUE,
  TRUE,
  2,
  'https://exemplo.com/expert-seo'
),
(
  'Mentoria Tráfego Pago',
  'Programa completo de mentoria para dominar campanhas de tráfego pago em todas as principais plataformas de anúncios.',
  'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=300&h=200',
  ARRAY['Facebook Ads', 'Google Ads', 'TikTok Ads', 'Consultoria individual'],
  997.00,
  'R$ 997,00',
  'Anúncios',
  TRUE,
  TRUE,
  3,
  'https://exemplo.com/mentoria-trafego'
),
(
  'Copywriting Avançado',
  'Domine a arte de escrever textos persuasivos que vendem e convertem em qualquer plataforma.',
  'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&q=80&w=300&h=200',
  ARRAY['Fórmulas de copywriting', 'Gatilhos mentais', 'Templates prontos', 'Revisão de textos'],
  347.00,
  'R$ 347,00',
  'Copywriting',
  TRUE,
  TRUE,
  4,
  'https://exemplo.com/copywriting-avancado'
),
(
  'Programa de Lançamentos',
  'Estratégia completa para realizar lançamentos de produtos digitais de sucesso e escalar seus resultados.',
  'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?auto=format&fit=crop&q=80&w=300&h=200',
  ARRAY['Fórmula de lançamento', 'Estratégia de conteúdo', 'Funil de vendas', 'Comunidade exclusiva'],
  1297.00,
  'R$ 1.297,00',
  'Lançamentos',
  TRUE,
  TRUE,
  5,
  'https://exemplo.com/programa-lancamentos'
); 