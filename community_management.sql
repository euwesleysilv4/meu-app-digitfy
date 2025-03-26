-- Criação da tabela para armazenar as comunidades enviadas
CREATE TABLE submitted_communities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_name TEXT NOT NULL,
  description TEXT NOT NULL,
  link TEXT NOT NULL,
  category TEXT NOT NULL,
  members_count INTEGER NOT NULL,
  contact_email TEXT NOT NULL,
  type TEXT NOT NULL,
  image_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  approved_at TIMESTAMP WITH TIME ZONE,
  approved_by UUID REFERENCES auth.users(id)
);

-- Índices para melhorar a performance das consultas
CREATE INDEX idx_submitted_communities_status ON submitted_communities(status);
CREATE INDEX idx_submitted_communities_type ON submitted_communities(type);
CREATE INDEX idx_submitted_communities_created_at ON submitted_communities(created_at);

-- Função para atualizar o campo updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar o campo updated_at
CREATE TRIGGER update_submitted_communities_updated_at
BEFORE UPDATE ON submitted_communities
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Função RPC para submeter uma nova comunidade (pode ser chamada pelo frontend)
CREATE OR REPLACE FUNCTION submit_community(
  p_community_name TEXT,
  p_description TEXT,
  p_link TEXT,
  p_category TEXT,
  p_members_count INTEGER,
  p_contact_email TEXT,
  p_type TEXT,
  p_image_url TEXT
)
RETURNS UUID AS $$
DECLARE
  new_id UUID;
BEGIN
  INSERT INTO submitted_communities (
    community_name,
    description,
    link,
    category,
    members_count,
    contact_email,
    type,
    image_url
  ) VALUES (
    p_community_name,
    p_description,
    p_link,
    p_category,
    p_members_count,
    p_contact_email,
    p_type,
    p_image_url
  )
  RETURNING id INTO new_id;
  
  RETURN new_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função RPC para aprovar uma comunidade
CREATE OR REPLACE FUNCTION approve_community(
  community_id UUID,
  approver_id UUID
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE submitted_communities
  SET status = 'approved',
      approved_at = NOW(),
      approved_by = approver_id
  WHERE id = community_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função RPC para rejeitar uma comunidade
CREATE OR REPLACE FUNCTION reject_community(
  community_id UUID
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE submitted_communities
  SET status = 'rejected'
  WHERE id = community_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Políticas de segurança (RLS)
ALTER TABLE submitted_communities ENABLE ROW LEVEL SECURITY;

-- Política para permitir que apenas administradores vejam todas as comunidades
CREATE POLICY admin_read_policy ON submitted_communities 
  FOR SELECT 
  USING (
    auth.uid() IN (
      SELECT auth.uid() FROM auth.users 
      WHERE auth.uid() IN (SELECT user_id FROM user_roles WHERE role = 'admin')
    )
  );

-- Política para permitir que usuários vejam apenas as comunidades aprovadas
CREATE POLICY user_read_approved_policy ON submitted_communities 
  FOR SELECT 
  USING (status = 'approved');

-- Política para permitir que usuários submetam novas comunidades
CREATE POLICY user_insert_policy ON submitted_communities 
  FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL);

-- Política para permitir que apenas administradores atualizem o status das comunidades
CREATE POLICY admin_update_policy ON submitted_communities 
  FOR UPDATE 
  USING (
    auth.uid() IN (
      SELECT auth.uid() FROM auth.users 
      WHERE auth.uid() IN (SELECT user_id FROM user_roles WHERE role = 'admin')
    )
  );

-- Visão para mostrar grupos de WhatsApp aprovados
CREATE VIEW approved_whatsapp_groups AS
SELECT 
  id,
  community_name as name,
  description,
  link,
  image_url as image,
  members_count as members,
  category,
  created_at
FROM submitted_communities
WHERE type = 'whatsapp' AND status = 'approved'
ORDER BY created_at DESC;

-- Visão para mostrar servidores do Discord aprovados
CREATE VIEW approved_discord_servers AS
SELECT 
  id,
  community_name as name,
  description,
  link,
  image_url as image,
  members_count as members,
  category,
  created_at
FROM submitted_communities
WHERE type = 'discord' AND status = 'approved'
ORDER BY created_at DESC;

-- Visão para mostrar canais do Telegram aprovados
CREATE VIEW approved_telegram_channels AS
SELECT 
  id,
  community_name as name,
  description,
  link,
  image_url as image,
  members_count as members,
  category,
  created_at
FROM submitted_communities
WHERE type = 'telegram' AND status = 'approved'
ORDER BY created_at DESC;

-- Função para verificar se o usuário é administrador
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Configuração para armazenar imagens das comunidades (opcional)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela para armazenar as imagens das comunidades (opcional)
CREATE TABLE community_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  community_id UUID REFERENCES submitted_communities(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice para a tabela de imagens
CREATE INDEX idx_community_images_community_id ON community_images(community_id); 