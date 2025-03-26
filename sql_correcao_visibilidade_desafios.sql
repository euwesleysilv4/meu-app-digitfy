-- Correção de problemas de visibilidade dos desafios na página pública
-- Este script verifica e corrige a visualização utilizada para exibir desafios

-- 1. Verifique a definição da view atual
SELECT pg_get_viewdef('vw_complete_challenges'::regclass, true);

-- 2. Recrie a view para garantir que está atualizada
DROP VIEW IF EXISTS vw_complete_challenges;

CREATE OR REPLACE VIEW vw_complete_challenges AS
SELECT 
  c.id,
  c.slug,
  c.title,
  c.image_url,
  c.description,
  c.duration,
  c.difficulty,
  c.reward,
  c.is_active,
  c.created_at,
  c.updated_at,
  ARRAY_AGG(cs.title ORDER BY cs.step_order) AS steps,
  ARRAY_AGG(cs.content ORDER BY cs.step_order) AS step_details
FROM 
  challenges c
LEFT JOIN 
  challenge_steps cs ON c.id = cs.challenge_id
GROUP BY 
  c.id, c.slug, c.title, c.image_url, c.description, c.duration, c.difficulty, c.reward, c.is_active, c.created_at, c.updated_at;

-- 3. Verificar se existem índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_challenges_is_active ON challenges(is_active);
CREATE INDEX IF NOT EXISTS idx_challenge_steps_challenge_id ON challenge_steps(challenge_id);

-- 4. Verificar se a função toggle_challenge_status está atualizando corretamente
-- Revisar a função toggle_challenge_status
CREATE OR REPLACE FUNCTION toggle_challenge_status(challenge_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_status BOOLEAN;
BEGIN
  -- Obter status atual
  SELECT is_active INTO current_status
  FROM challenges
  WHERE id = challenge_id;
  
  -- Atualizar com o status oposto
  UPDATE challenges
  SET 
    is_active = NOT current_status,
    updated_at = NOW()  -- Importante: atualizar timestamp
  WHERE id = challenge_id;
  
  -- Registrar log da operação para debug
  INSERT INTO logs(operation, table_name, record_id, details)
  VALUES ('toggle_status', 'challenges', challenge_id, 
          'Status changed from ' || current_status || ' to ' || (NOT current_status));
EXCEPTION
  WHEN OTHERS THEN
    -- Registrar erro
    INSERT INTO logs(operation, table_name, record_id, details)
    VALUES ('toggle_status_error', 'challenges', challenge_id, SQLERRM);
    RAISE;
END;
$$;

-- 5. Criar tabela de logs se não existir
CREATE TABLE IF NOT EXISTS logs (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  operation TEXT,
  table_name TEXT,
  record_id UUID,
  details TEXT
);

-- 6. Verificar se a RLS está permitindo visualização na página pública
-- Isso é crítico - garantir que qualquer usuário possa visualizar desafios ativos

-- Remover política de SELECT antiga se existir
DROP POLICY IF EXISTS "challenges_public_select_policy" ON "public"."challenges";

-- Criar política específica para visualização pública
CREATE POLICY "challenges_public_select_policy"
ON "public"."challenges"
FOR SELECT 
USING (true);  -- Qualquer pessoa pode visualizar todos os desafios

-- 7. Verificar se a função de inserção de desafios está atualizando a view
-- Testar um insert para verificar se aparece na visualização pública
SELECT * FROM vw_complete_challenges WHERE is_active = true ORDER BY created_at DESC LIMIT 5; 