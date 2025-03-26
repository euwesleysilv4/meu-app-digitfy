-- SCRIPT DE DIAGNÓSTICO SIMPLIFICADO PARA ENCONTRAR REFERÊNCIAS À COLUNA data_expiracao_plano
-- Execute este script no SQL Editor do Supabase para identificar a origem do problema

-- 1. Verificar estrutura atual da tabela profiles
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'profiles';

-- 2. Verificar todos os triggers na tabela profiles (simplificado)
SELECT tgname AS trigger_name, 
       tgtype,
       tgenabled
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE n.nspname = 'public' 
  AND c.relname = 'profiles';

-- 3. Listar apenas os nomes das funções com referência à coluna data_expiracao_plano
SELECT n.nspname AS schema_name, 
       p.proname AS function_name
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE pg_get_functiondef(p.oid) LIKE '%data_expiracao_plano%';

-- 4. Listar todas as funções relacionadas a planos (apenas nomes)
SELECT n.nspname AS schema_name, 
       p.proname AS function_name
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public' 
  AND (p.proname LIKE '%plan%' OR p.proname LIKE '%plano%');

-- 5. Verificar constraints na tabela profiles (simplificado)
SELECT conname AS constraint_name,
       contype AS constraint_type
FROM pg_constraint
WHERE conrelid = 'public.profiles'::regclass;

-- 6. Verificar triggers específicos por nome
SELECT trigger_schema, trigger_name, event_manipulation, action_statement
FROM information_schema.triggers
WHERE event_object_schema = 'public' 
  AND event_object_table = 'profiles';

-- 7. Verificar se a coluna existe em outras tabelas
SELECT table_schema, 
       table_name, 
       column_name
FROM information_schema.columns
WHERE column_name LIKE '%expiracao%'; 