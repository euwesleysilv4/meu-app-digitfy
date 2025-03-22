-- Desativar temporariamente RLS para a tabela profiles
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Remover políticas existentes (se houver)
DROP POLICY IF EXISTS "Usuários podem ver seus próprios perfis" ON profiles;
DROP POLICY IF EXISTS "Usuários podem atualizar seus próprios perfis" ON profiles;
DROP POLICY IF EXISTS "Usuários podem inserir seus próprios perfis" ON profiles;
DROP POLICY IF EXISTS "Administradores podem ver todos os perfis" ON profiles;
DROP POLICY IF EXISTS "Administradores podem atualizar todos os perfis" ON profiles;
DROP POLICY IF EXISTS "Administradores podem inserir perfis" ON profiles;
DROP POLICY IF EXISTS "Administrador específico pode ver todos os perfis" ON profiles;
DROP POLICY IF EXISTS "Administrador específico pode atualizar todos os perfis" ON profiles;
DROP POLICY IF EXISTS "Permitir inserção de perfis durante registro" ON profiles;

-- Reativar RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- IMPORTANTE: Política para permitir que todos os usuários vejam seus próprios perfis
CREATE POLICY "Usuários podem ver seus próprios perfis"
ON profiles FOR SELECT
USING (auth.uid() = id);

-- IMPORTANTE: Política para permitir que todos os usuários atualizem seus próprios perfis
CREATE POLICY "Usuários podem atualizar seus próprios perfis"
ON profiles FOR UPDATE
USING (auth.uid() = id);

-- Política para permitir a inserção de perfis durante o registro
CREATE POLICY "Permitir inserção de perfis durante registro"
ON profiles FOR INSERT
WITH CHECK (true);

-- Políticas para o administrador específico
CREATE POLICY "Administrador específico pode ver todos os perfis"
ON profiles FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND email = 'wexxxleycomercial@gmail.com'
  )
);

CREATE POLICY "Administrador específico pode atualizar todos os perfis"
ON profiles FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND email = 'wexxxleycomercial@gmail.com'
  )
);

CREATE POLICY "Administrador específico pode inserir perfis"
ON profiles FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND email = 'wexxxleycomercial@gmail.com'
  )
);

-- Função para verificar cliente autenticado
CREATE OR REPLACE FUNCTION auth.client_has_valid_token() RETURNS BOOLEAN AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN FALSE;
  ELSE
    RETURN TRUE;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Política para permitir leitura anônima de perfis em situações especiais (descomente se necessário)
-- CREATE POLICY "Leitura anônima permitida para perfis"
-- ON profiles FOR SELECT
-- USING (true);

-- Verificar se existem problemas com as políticas
DO $$
BEGIN
  RAISE NOTICE 'Políticas RLS para tabela profiles atualizadas com sucesso.';
  RAISE NOTICE 'Verifique se todos os usuários podem acessar seus próprios perfis agora.';
END $$; 