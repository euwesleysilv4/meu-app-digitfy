-- Desativar temporariamente RLS para a tabela profiles
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Remover políticas existentes (se houver)
DROP POLICY IF EXISTS "Usuários podem ver seus próprios perfis" ON profiles;
DROP POLICY IF EXISTS "Usuários podem atualizar seus próprios perfis" ON profiles;
DROP POLICY IF EXISTS "Usuários podem inserir seus próprios perfis" ON profiles;
DROP POLICY IF EXISTS "Administradores podem ver todos os perfis" ON profiles;
DROP POLICY IF EXISTS "Administradores podem atualizar todos os perfis" ON profiles;
DROP POLICY IF EXISTS "Administradores podem inserir perfis" ON profiles;

-- Reativar RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Criar políticas para usuários normais
CREATE POLICY "Usuários podem ver seus próprios perfis"
ON profiles FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Usuários podem atualizar seus próprios perfis"
ON profiles FOR UPDATE
USING (auth.uid() = id);

-- Política para permitir a inserção de perfis durante o registro
CREATE POLICY "Permitir inserção de perfis durante registro"
ON profiles FOR INSERT
WITH CHECK (true);

-- Política para administradores (opcional)
CREATE POLICY "Administradores podem ver todos os perfis"
ON profiles FOR SELECT
USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Administradores podem atualizar todos os perfis"
ON profiles FOR UPDATE
USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Administradores podem inserir perfis"
ON profiles FOR INSERT
WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- Função para criar perfil automaticamente após registro
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    nome, 
    email, 
    data_criacao, 
    data_modificacao,
    status, 
    plano, 
    verificado, 
    role, 
    tentativas_login, 
    banido, 
    notificacoes_ativas
  )
  VALUES (
    NEW.id, 
    NEW.raw_user_meta_data->>'nome', 
    NEW.email, 
    NOW(), 
    NOW(),
    'offline', 
    'gratuito', 
    FALSE, 
    'user', 
    0, 
    FALSE, 
    TRUE
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar perfil automaticamente
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user(); 