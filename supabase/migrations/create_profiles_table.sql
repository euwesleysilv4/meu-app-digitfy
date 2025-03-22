-- Criar tipos enumerados apenas se não existirem
DO $$ 
BEGIN
    -- Verificar e criar user_role
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('user', 'admin', 'moderator');
    END IF;
    
    -- Verificar e criar user_plan
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_plan') THEN
        CREATE TYPE user_plan AS ENUM ('gratuito', 'member', 'pro', 'elite');
    END IF;
    
    -- Verificar e criar user_status
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_status') THEN
        CREATE TYPE user_status AS ENUM ('online', 'offline');
    END IF;
END $$;

-- Criar tabela de perfis se não existir
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  nome TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  data_criacao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  data_modificacao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status user_status DEFAULT 'offline',
  plano user_plan DEFAULT 'gratuito',
  ultimo_login TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  verificado BOOLEAN DEFAULT FALSE,
  role user_role DEFAULT 'user',
  tentativas_login INTEGER DEFAULT 0,
  banido BOOLEAN DEFAULT FALSE,
  notificacoes_ativas BOOLEAN DEFAULT TRUE,
  whatsapp TEXT
);

-- Criar índices para melhorar a performance (apenas se não existirem)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'profiles_email_idx') THEN
        CREATE INDEX profiles_email_idx ON profiles(email);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'profiles_status_idx') THEN
        CREATE INDEX profiles_status_idx ON profiles(status);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'profiles_plano_idx') THEN
        CREATE INDEX profiles_plano_idx ON profiles(plano);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'profiles_role_idx') THEN
        CREATE INDEX profiles_role_idx ON profiles(role);
    END IF;
END $$;

-- Função para atualizar o timestamp de modificação
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.data_modificacao = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Verificar se o trigger já existe antes de criá-lo
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_profiles_modified') THEN
        CREATE TRIGGER update_profiles_modified
        BEFORE UPDATE ON profiles
        FOR EACH ROW
        EXECUTE FUNCTION update_modified_column();
    END IF;
END $$;

-- Configurar RLS (Row Level Security)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes antes de criar novas
DROP POLICY IF EXISTS "Usuários podem ver seus próprios perfis" ON profiles;
DROP POLICY IF EXISTS "Usuários podem atualizar seus próprios perfis" ON profiles;
DROP POLICY IF EXISTS "Administradores podem ver todos os perfis" ON profiles;
DROP POLICY IF EXISTS "Administradores podem atualizar todos os perfis" ON profiles;

-- Políticas de segurança
-- Permitir que usuários vejam seus próprios perfis
CREATE POLICY "Usuários podem ver seus próprios perfis"
ON profiles FOR SELECT
USING (auth.uid() = id);

-- Permitir que usuários atualizem seus próprios perfis
CREATE POLICY "Usuários podem atualizar seus próprios perfis"
ON profiles FOR UPDATE
USING (auth.uid() = id);

-- Permitir que administradores vejam todos os perfis
CREATE POLICY "Administradores podem ver todos os perfis"
ON profiles FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);

-- Permitir que administradores atualizem todos os perfis
CREATE POLICY "Administradores podem atualizar todos os perfis"
ON profiles FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);

-- Função para criar perfil automaticamente após registro
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, nome, email, verificado)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'nome', NEW.email, FALSE);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Verificar se o trigger já existe antes de criá-lo
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created') THEN
        CREATE TRIGGER on_auth_user_created
        AFTER INSERT ON auth.users
        FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
    END IF;
END $$; 