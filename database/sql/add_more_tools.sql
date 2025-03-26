-- Inserir ferramentas adicionais
INSERT INTO tools (id, title, description, icon, path, color, image_url, status, is_free, is_online, last_updated, priority)
VALUES
  -- Ferramenta 10: Gerador de Copy Persuasiva
  (
    'f28a39d1-e457-4985-b98e-72b72c02c412', 
    'Gerador de Copy Persuasiva', 
    'Crie textos persuasivos que convertem para suas campanhas', 
    'Edit3', 
    '/tools/persuasive-copy', 
    'orange', 
    'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&q=80&w=300', 
    'published', 
    false, 
    true, 
    NOW(), 
    10
  ),
  
  -- Ferramenta 11: Gerador de Hashtag
  (
    '3d7f8b09-5a1e-4e3f-8d91-36e9c7ec49a2', 
    'Gerador de Hashtag', 
    'Crie hashtags relevantes para aumentar o alcance do seu conteúdo', 
    'Hash', 
    '/tools/hashtag-generator', 
    'blue', 
    'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&q=80&w=300', 
    'published', 
    true, 
    true, 
    NOW(), 
    11
  ),
  
  -- Ferramenta 12: Gerador de Estrutura de Perfil
  (
    'b4a5d7e2-9c63-4b87-a12f-e89d2f108935', 
    'Gerador de Estrutura de Perfil', 
    'Crie perfis otimizados para redes sociais e conversão', 
    'User', 
    '/tools/profile-structure', 
    'indigo', 
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300', 
    'published', 
    true, 
    true, 
    NOW(), 
    12
  ),
  
  -- Ferramenta 13: Gerador de Prova Social
  (
    'a1c9e508-7d76-42f3-b82d-6ec362c9d1f5', 
    'Gerador de Prova Social', 
    'Crie elementos de prova social para aumentar a confiança e conversão', 
    'ThumbsUp', 
    '/tools/social-proof', 
    'green', 
    'https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&q=80&w=300', 
    'published', 
    false, 
    true, 
    NOW(), 
    13
  ),
  
  -- Ferramenta 14: Gerador de Link de WhatsApp
  (
    '5e7d90f3-6a24-4b8c-84d3-0f18e5c06a41', 
    'Gerador de Link de WhatsApp', 
    'Crie links personalizados para iniciar conversas no WhatsApp', 
    'MessageCircle', 
    '/tools/whatsapp-link', 
    'emerald', 
    'https://images.unsplash.com/photo-1614680376408-81e91ffe3db7?auto=format&fit=crop&q=80&w=300', 
    'published', 
    true, 
    true, 
    NOW(), 
    14
  )
ON CONFLICT (id) DO NOTHING; 