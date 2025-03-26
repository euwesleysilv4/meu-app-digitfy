-- Script simplificado para inserir apenas um produto com o mínimo de colunas

-- Inserir o primeiro produto (versão simplificada)
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
  'https://exemplo.com/curso-marketing-digital',
  50.00
); 