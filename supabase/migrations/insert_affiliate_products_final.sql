-- Script final para inserir produtos de afiliados com TODOS os campos possíveis

-- Função auxiliar para gerar IDs de usuário aleatórios
CREATE OR REPLACE FUNCTION random_uuid()
RETURNS UUID AS
$$
BEGIN
    RETURN gen_random_uuid();
END;
$$ LANGUAGE plpgsql;

-- Limpar tabela antes de inserir (opcional)
-- DELETE FROM public.affiliate_products;

-- Inserir o primeiro produto com todos os campos possíveis
INSERT INTO public.affiliate_products (
  name,
  description,
  image_url,
  image,
  benefits,
  price,
  price_display,
  category,
  featured,
  active,
  order_index,
  sales_url,
  commission_rate,
  affiliate_link,
  vendor_name,
  vendor_id,
  status,
  approved_by,
  platform,
  created_by,
  approved_date,
  approved_reason,
  rejected_reason,
  start_date,
  end_date
) VALUES
(
  'Curso Completo de Marketing Digital',
  'Domine todas as estratégias e ferramentas de marketing digital para impulsionar seus resultados online.',
  'https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?auto=format&fit=crop&q=80&w=300&h=200',
  'https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?auto=format&fit=crop&q=80&w=300&h=200',
  ARRAY['Mais de 100 horas de conteúdo', 'Certificado reconhecido pelo mercado', 'Acesso vitalício', 'Suporte personalizado'],
  497.00,
  'R$ 497,00',
  'Marketing Digital',
  TRUE,
  TRUE,
  1,
  'https://exemplo.com/curso-marketing-digital',
  50.00,
  'https://hotm.art/marketing-digital',
  'Hotmart',
  '12345',
  'aprovado',
  random_uuid(),
  'Hotmart',
  random_uuid(),
  NOW(),
  'Produto de qualidade e relevante para os afiliados',
  NULL,
  NOW(),
  NOW() + INTERVAL '1 year'
);

-- Inserir o segundo produto
INSERT INTO public.affiliate_products (
  name,
  description,
  image_url,
  image,
  benefits,
  price,
  price_display,
  category,
  featured,
  active,
  order_index,
  sales_url,
  commission_rate,
  affiliate_link,
  vendor_name,
  vendor_id,
  status,
  approved_by,
  platform,
  created_by,
  approved_date,
  approved_reason,
  rejected_reason,
  start_date,
  end_date
) VALUES
(
  'Programa Expert em SEO',
  'Aprenda técnicas avançadas de SEO para aumentar o tráfego orgânico e posicionar seu site no topo dos resultados de busca.',
  'https://images.unsplash.com/photo-1571171637578-41bc2dd41cd2?auto=format&fit=crop&q=80&w=300&h=200',
  'https://images.unsplash.com/photo-1571171637578-41bc2dd41cd2?auto=format&fit=crop&q=80&w=300&h=200',
  ARRAY['Otimização técnica completa', 'Estratégias de link building', 'Análise de concorrentes', 'Plano de conteúdo otimizado'],
  397.00,
  'R$ 397,00',
  'SEO',
  TRUE,
  TRUE,
  2,
  'https://exemplo.com/expert-seo',
  40.00,
  'https://hotm.art/expert-seo',
  'Hotmart',
  '12346',
  'aprovado',
  random_uuid(),
  'Hotmart',
  random_uuid(),
  NOW(),
  'Produto de qualidade na área de SEO',
  NULL,
  NOW(),
  NOW() + INTERVAL '1 year'
);

-- Inserir o terceiro produto
INSERT INTO public.affiliate_products (
  name,
  description,
  image_url,
  image,
  benefits,
  price,
  price_display,
  category,
  featured,
  active,
  order_index,
  sales_url,
  commission_rate,
  affiliate_link,
  vendor_name,
  vendor_id,
  status,
  approved_by,
  platform,
  created_by,
  approved_date,
  approved_reason,
  rejected_reason,
  start_date,
  end_date
) VALUES
(
  'Mentoria Tráfego Pago',
  'Programa completo de mentoria para dominar campanhas de tráfego pago em todas as principais plataformas de anúncios.',
  'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=300&h=200',
  'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=300&h=200',
  ARRAY['Facebook Ads', 'Google Ads', 'TikTok Ads', 'Consultoria individual'],
  997.00,
  'R$ 997,00',
  'Anúncios',
  TRUE,
  TRUE,
  3,
  'https://exemplo.com/mentoria-trafego',
  60.00,
  'https://hotm.art/trafego-pago',
  'Hotmart',
  '12347',
  'aprovado',
  random_uuid(),
  'Hotmart',
  random_uuid(),
  NOW(),
  'Mentoria com excelentes resultados comprovados',
  NULL,
  NOW(),
  NOW() + INTERVAL '1 year'
);

-- Inserir o quarto produto
INSERT INTO public.affiliate_products (
  name,
  description,
  image_url,
  image,
  benefits,
  price,
  price_display,
  category,
  featured,
  active,
  order_index,
  sales_url,
  commission_rate,
  affiliate_link,
  vendor_name,
  vendor_id,
  status,
  approved_by,
  platform,
  created_by,
  approved_date,
  approved_reason,
  rejected_reason,
  start_date,
  end_date
) VALUES
(
  'Copywriting Avançado',
  'Domine a arte de escrever textos persuasivos que vendem e convertem em qualquer plataforma.',
  'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&q=80&w=300&h=200',
  'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&q=80&w=300&h=200',
  ARRAY['Fórmulas de copywriting', 'Gatilhos mentais', 'Templates prontos', 'Revisão de textos'],
  347.00,
  'R$ 347,00',
  'Copywriting',
  TRUE,
  TRUE,
  4,
  'https://exemplo.com/copywriting-avancado',
  45.00,
  'https://hotm.art/copywriting',
  'Hotmart',
  '12348',
  'aprovado',
  random_uuid(),
  'Hotmart',
  random_uuid(),
  NOW(),
  'Curso com alta taxa de conversão para afiliados',
  NULL,
  NOW(),
  NOW() + INTERVAL '1 year'
);

-- Inserir o quinto produto
INSERT INTO public.affiliate_products (
  name,
  description,
  image_url,
  image,
  benefits,
  price,
  price_display,
  category,
  featured,
  active,
  order_index,
  sales_url,
  commission_rate,
  affiliate_link,
  vendor_name,
  vendor_id,
  status,
  approved_by,
  platform,
  created_by,
  approved_date,
  approved_reason,
  rejected_reason,
  start_date,
  end_date
) VALUES
(
  'Programa de Lançamentos',
  'Estratégia completa para realizar lançamentos de produtos digitais de sucesso e escalar seus resultados.',
  'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?auto=format&fit=crop&q=80&w=300&h=200',
  'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?auto=format&fit=crop&q=80&w=300&h=200',
  ARRAY['Fórmula de lançamento', 'Estratégia de conteúdo', 'Funil de vendas', 'Comunidade exclusiva'],
  1297.00,
  'R$ 1.297,00',
  'Lançamentos',
  TRUE,
  TRUE,
  5,
  'https://exemplo.com/programa-lancamentos',
  70.00,
  'https://hotm.art/lancamentos',
  'Hotmart',
  '12349',
  'aprovado',
  random_uuid(),
  'Hotmart',
  random_uuid(),
  NOW(),
  'Programa com alto valor percebido e ótima reputação',
  NULL,
  NOW(),
  NOW() + INTERVAL '1 year'
); 