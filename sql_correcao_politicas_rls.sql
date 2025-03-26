-- Remover políticas existentes que podem estar causando problemas
DROP POLICY IF EXISTS "challenges_select_policy" ON "public"."challenges";
DROP POLICY IF EXISTS "challenges_insert_policy" ON "public"."challenges";
DROP POLICY IF EXISTS "challenges_update_policy" ON "public"."challenges";
DROP POLICY IF EXISTS "challenges_delete_policy" ON "public"."challenges";

DROP POLICY IF EXISTS "challenge_steps_select_policy" ON "public"."challenge_steps";
DROP POLICY IF EXISTS "challenge_steps_insert_policy" ON "public"."challenge_steps";
DROP POLICY IF EXISTS "challenge_steps_update_policy" ON "public"."challenge_steps";
DROP POLICY IF EXISTS "challenge_steps_delete_policy" ON "public"."challenge_steps";

-- Criar novas políticas para a tabela challenges
-- Política SELECT: Qualquer pessoa autenticada pode visualizar
CREATE POLICY "challenges_select_policy"
ON "public"."challenges"
FOR SELECT
USING (auth.role() = 'authenticated');

-- Política INSERT: Apenas administradores podem inserir
CREATE POLICY "challenges_insert_policy"
ON "public"."challenges"
FOR INSERT
WITH CHECK ((auth.role() = 'authenticated') AND (auth.jwt() ->> 'role' = 'admin'));

-- Política UPDATE: Apenas administradores podem atualizar
CREATE POLICY "challenges_update_policy"
ON "public"."challenges"
FOR UPDATE
USING ((auth.role() = 'authenticated') AND (auth.jwt() ->> 'role' = 'admin'));

-- Política DELETE: Apenas administradores podem excluir
CREATE POLICY "challenges_delete_policy"
ON "public"."challenges"
FOR DELETE
USING ((auth.role() = 'authenticated') AND (auth.jwt() ->> 'role' = 'admin'));

-- Criar novas políticas para a tabela challenge_steps
-- Política SELECT: Qualquer pessoa autenticada pode visualizar
CREATE POLICY "challenge_steps_select_policy"
ON "public"."challenge_steps"
FOR SELECT
USING (auth.role() = 'authenticated');

-- Política INSERT: Apenas administradores podem inserir
CREATE POLICY "challenge_steps_insert_policy"
ON "public"."challenge_steps"
FOR INSERT
WITH CHECK ((auth.role() = 'authenticated') AND (auth.jwt() ->> 'role' = 'admin'));

-- Política UPDATE: Apenas administradores podem atualizar
CREATE POLICY "challenge_steps_update_policy"
ON "public"."challenge_steps"
FOR UPDATE
USING ((auth.role() = 'authenticated') AND (auth.jwt() ->> 'role' = 'admin'));

-- Política DELETE: Apenas administradores podem excluir
CREATE POLICY "challenge_steps_delete_policy"
ON "public"."challenge_steps"
FOR DELETE
USING ((auth.role() = 'authenticated') AND (auth.jwt() ->> 'role' = 'admin'));

-- Verificar se a coluna role existe na tabela auth.users
-- Se não existir, você precisará executar a seguinte consulta para adicioná-la:
-- ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';

-- Para atribuir o papel de admin a um usuário (substitua 'ID_DO_USUARIO' pelo ID real):
-- UPDATE auth.users SET role = 'admin' WHERE id = 'ID_DO_USUARIO';

-- Alternativa: Se você estiver usando metadados personalizados para armazenar o papel do usuário,
-- Você pode modificar as políticas acima para usar a verificação apropriada, como:
-- (auth.uid() IN (SELECT id FROM users WHERE is_admin = true)) 