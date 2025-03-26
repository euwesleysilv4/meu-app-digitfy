-- Verificar e adicionar colunas necessárias
DO $$
BEGIN
  -- Adiciona a coluna is_free se ela não existir
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'tools' 
    AND column_name = 'is_free'
  ) THEN
    ALTER TABLE tools ADD COLUMN is_free BOOLEAN DEFAULT true;
  END IF;

  -- Adiciona a coluna is_online se ela não existir
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'tools' 
    AND column_name = 'is_online'
  ) THEN
    ALTER TABLE tools ADD COLUMN is_online BOOLEAN DEFAULT true;
  END IF;
END $$;

-- Inserir dados de exemplo
INSERT INTO tools (id, title, description, icon, path, color, image_url, status, is_free, is_online, last_updated, priority)
VALUES
  -- Ferramenta 1: Trend Rush
  (
    'ca8c3428-69b7-4e16-9c39-40f8bfcb63a8', 
    'Trend Rush', 
    'Descubra as tendências do momento', 
    'Music', 
    '/tools/trend-rush', 
    'violet', 
    'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=300', 
    'published', 
    true, 
    true, 
    NOW(), 
    1
  ),
  
  -- Ferramenta 2: Comparador de Plataformas
  (
    '3b9a3e68-dec1-4e9c-b196-19f945e25078', 
    'Comparador de Plataformas', 
    'Compare comissões e recursos entre plataformas', 
    'Scale', 
    '/tools/commission-calculator', 
    'emerald', 
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=300', 
    'published', 
    true, 
    true, 
    NOW(), 
    2
  ),
  
  -- Ferramenta 3: Jogos Digitais
  (
    'f72e3c57-08a3-4ef2-b175-3e2c9d744428', 
    'Jogos Digitais', 
    'Jogos educativos para impulsionar seu marketing', 
    'Gamepad', 
    '/tools/digital-games', 
    'blue', 
    'https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?auto=format&fit=crop&q=80&w=300', 
    'published', 
    false, 
    true, 
    NOW(), 
    3
  ),
  
  -- Ferramenta 4: Gerador de Storytelling
  (
    'ed5dcd06-7a38-49b5-a096-a12b4dce3baf', 
    'Gerador de Storytelling', 
    'Crie histórias envolventes para suas campanhas', 
    'BookOpen', 
    '/tools/storytelling-generator', 
    'teal', 
    'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&q=80&w=300', 
    'published', 
    false, 
    true, 
    NOW(), 
    4
  ),
  
  -- Ferramenta 5: Simulador de Notificações
  (
    '7d827851-a527-4e6e-a042-cb50b1c63a8f', 
    'Simulador de Notificações', 
    'Simule e teste diferentes estilos de notificações', 
    'Bell', 
    '/tools/notification-simulator', 
    'indigo', 
    'https://images.unsplash.com/photo-1481349518771-20055b2a7b24?auto=format&fit=crop&q=80&w=300', 
    'published', 
    true, 
    true, 
    NOW(), 
    5
  ),
  
  -- Ferramenta 6: Sites Úteis
  (
    'a9ad5bd1-63c3-45ef-9a8d-f9b13287436d', 
    'Sites Úteis', 
    'Coleção de sites e ferramentas para marketing digital', 
    'Globe', 
    '/tools/useful-sites', 
    'cyan', 
    'https://images.unsplash.com/photo-1520085601670-ee14aa5fa3e8?auto=format&fit=crop&q=80&w=300', 
    'published', 
    true, 
    true, 
    NOW(), 
    6
  ),
  
  -- Ferramenta 7: Gerador de Order Bump
  (
    'b1b40c4d-f9f3-4e9b-8515-e4ea587b917c', 
    'Gerador de Order Bump', 
    'Crie ofertas irresistíveis para aumentar o valor médio de pedido', 
    'ShoppingCart', 
    '/tools/order-bump-generator', 
    'purple', 
    'https://images.unsplash.com/photo-1607083206968-13611e3d76db?auto=format&fit=crop&q=80&w=300', 
    'published', 
    false, 
    true, 
    NOW(), 
    7
  ),
  
  -- Ferramenta 8: Criativos Personalizados
  (
    'c4d2f9ae-6dcb-42fa-8c4e-abe459ce7c5f', 
    'Criativos Personalizados', 
    'Crie layouts e designs para suas campanhas', 
    'PenTool', 
    '/tools/custom-creatives', 
    'fuchsia', 
    'https://images.unsplash.com/photo-1475669698648-2f144fcaaeb1?auto=format&fit=crop&q=80&w=300', 
    'published', 
    false, 
    true, 
    NOW(), 
    8
  ),
  
  -- Ferramenta 9: Funil LTV
  (
    'd3e4f569-c7c8-49e2-9d8b-1ab4c82ffa85', 
    'Funil LTV', 
    'Calcule e otimize o valor vitalício do cliente', 
    'User', 
    '/tools/ltv-funnel', 
    'rose', 
    'https://images.unsplash.com/photo-1553729459-efe14ef6055d?auto=format&fit=crop&q=80&w=300', 
    'published', 
    false, 
    true, 
    NOW(), 
    9
  )
ON CONFLICT (id) DO NOTHING; 