-- SCRIPT DE DIAGNÓSTICO COMPLETO PARA ENCONTRAR REFERÊNCIAS À COLUNA data_expiracao_plano
-- Execute este script no SQL Editor do Supabase para identificar a origem do problema

-- 1. Verificar estrutura atual da tabela profiles
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'profiles';

-- 2. Verificar todos os triggers na tabela profiles
SELECT tgname AS trigger_name, 
       pg_get_triggerdef(t.oid) AS trigger_definition
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE n.nspname = 'public' 
  AND c.relname = 'profiles';

-- 3. Listar todas as funções que possuem referência à coluna data_expiracao_plano
SELECT n.nspname AS schema_name, 
       p.proname AS function_name, 
       pg_get_functiondef(p.oid) AS function_definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE pg_get_functiondef(p.oid) LIKE '%data_expiracao_plano%';

-- 4. Listar todas as funções relacionadas a planos
SELECT n.nspname AS schema_name, 
       p.proname AS function_name
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public' 
  AND (p.proname LIKE '%plan%' OR p.proname LIKE '%plano%');

-- 5. Verificar constraints na tabela profiles
SELECT conname AS constraint_name,
       pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'public.profiles'::regclass;

-- 6. Verificar se existem regras (rules) na tabela
SELECT rulename, 
       definition
FROM pg_rules
WHERE schemaname = 'public' 
  AND tablename = 'profiles';

-- 7. Verificar se a coluna existe em outras tabelas
SELECT table_schema, 
       table_name, 
       column_name
FROM information_schema.columns
WHERE column_name LIKE '%expiracao%';

-- 8. Verificar todas as políticas de segurança (RLS)
SELECT n.nspname AS schema_name,
       c.relname AS table_name,
       polname AS policy_name,
       pg_get_expr(polqual, c.oid) AS policy_definition
FROM pg_policy p
JOIN pg_class c ON p.polrelid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE pg_get_expr(polqual, c.oid) LIKE '%data_expiracao_plano%';

-- 9. Verificar views que possam usar a coluna
SELECT viewname, 
       definition
FROM pg_views
WHERE schemaname = 'public' 
  AND definition LIKE '%data_expiracao_plano%';

-- 10. Verificar índices que possam usar a coluna
SELECT 
    t.relname AS table_name,
    i.relname AS index_name,
    pg_get_indexdef(i.oid) AS index_definition
FROM pg_index x
JOIN pg_class t ON t.oid = x.indrelid
JOIN pg_class i ON i.oid = x.indexrelid
JOIN pg_namespace n ON n.oid = t.relnamespace
WHERE t.relkind = 'r'
  AND n.nspname = 'public'
  AND pg_get_indexdef(i.oid) LIKE '%data_expiracao_plano%'; 