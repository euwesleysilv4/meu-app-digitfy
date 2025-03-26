-- Script para inserir produtos de afiliados na tabela affiliate_products (Parte 2)

-- Inserir os outros produtos
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
  sales_url,
  commission_rate
) VALUES
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
  'https://exemplo.com/expert-seo',
  40.00
);

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
  sales_url,
  commission_rate
) VALUES
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
  'https://exemplo.com/mentoria-trafego',
  60.00
);

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
  sales_url,
  commission_rate
) VALUES
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
  'https://exemplo.com/copywriting-avancado',
  45.00
);

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
  sales_url,
  commission_rate
) VALUES
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
  'https://exemplo.com/programa-lancamentos',
  70.00
); 