-- SCRIPT DE DIAGNÓSTICO PARA PROBLEMAS DE RECURSÃO INFINITA NO SUPABASE
-- Execute este script no console SQL do Supabase para identificar problemas

-- Parte 1: Informações gerais do sistema
SELECT version() AS versao_postgres;

-- Parte 2: Verificar políticas RLS que podem causar recursão
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual::text AS condicao,
    with_check::text AS with_check
FROM 
    pg_policies
WHERE 
    tablename IN ('profiles', 'users')
    OR qual::text LIKE '%sync_user_plan%'
    OR qual::text LIKE '%recursion%'
    OR with_check::text LIKE '%sync_user_plan%'
ORDER BY 
    tablename, policyname;

-- Parte 3: Verificar triggers que podem causar recursão
SELECT 
    tgname AS nome_trigger, 
    tgrelid::regclass AS tabela,
    tgtype,
    CASE 
        WHEN tgenabled = 'D' THEN 'Desabilitado'
        WHEN tgenabled = 'O' THEN 'Origin'
        WHEN tgenabled = 'R' THEN 'Replica'
        WHEN tgenabled = 'A' THEN 'Always'
        ELSE tgenabled::text 
    END AS status,
    tgfoid::regproc AS funcao,
    pg_get_triggerdef(oid) AS definicao_trigger
FROM 
    pg_trigger
WHERE 
    tgrelid::regclass::text LIKE 'public.%'
    AND (
        tgrelid::regclass::text = 'public.profiles' 
        OR tgfoid::regproc::text LIKE '%sync%'
        OR tgfoid::regproc::text LIKE '%plan%'
    )
ORDER BY 
    tgrelid::regclass::text, tgname;

-- Parte 4: Verificar funções que podem estar envolvidas na recursão
SELECT 
    n.nspname AS esquema,
    p.proname AS nome_funcao,
    pg_get_function_arguments(p.oid) AS argumentos,
    CASE 
        WHEN p.prosecdef THEN 'SECURITY DEFINER'
        ELSE 'SECURITY INVOKER'
    END AS seguranca,
    pg_get_function_result(p.oid) AS tipo_retorno,
    pg_get_functiondef(p.oid) AS definicao_funcao
FROM 
    pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE 
    n.nspname = 'public'
    AND (
        p.proname LIKE '%sync%'
        OR p.proname LIKE '%plan%'
        OR p.proname LIKE '%update%'
        OR p.proname LIKE '%trigger%'
    )
ORDER BY 
    p.proname;

-- Parte 5: Verificar chamadas circulares entre funções
WITH RECURSIVE chamadas_recursivas AS (
    -- Funções base que queremos analisar
    SELECT 
        p.oid,
        n.nspname AS esquema,
        p.proname AS nome_funcao,
        0 AS nivel,
        ARRAY[p.proname::text] AS caminho
    FROM 
        pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE 
        n.nspname = 'public'
        AND (
            p.proname = 'sync_user_plan_v2'
            OR p.proname = 'trigger_sync_plan_v2'
            OR p.proname = 'update_user_plan_v2'
            OR p.proname = 'force_update_user_plan'
        )
    
    UNION ALL
    
    -- Funções chamadas recursivamente
    SELECT 
        p.oid,
        n.nspname,
        p.proname,
        r.nivel + 1,
        r.caminho || p.proname::text
    FROM 
        pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        JOIN chamadas_recursivas r ON 
            pg_get_functiondef(p.oid) LIKE '%' || r.nome_funcao || '%'
            AND p.proname <> r.nome_funcao  -- Evitar auto-referência direta
    WHERE 
        n.nspname = 'public'
        AND r.nivel < 5  -- Limitar profundidade para evitar loop infinito
        AND NOT (p.proname = ANY(r.caminho))  -- Evitar ciclos
)
SELECT 
    esquema,
    nome_funcao,
    nivel,
    caminho
FROM 
    chamadas_recursivas
ORDER BY 
    nivel, nome_funcao;

-- Parte 6: Verificar estrutura e integridade da tabela profiles
SELECT 
    column_name, 
    data_type,
    is_nullable,
    column_default
FROM 
    information_schema.columns 
WHERE 
    table_schema = 'public' 
    AND table_name = 'profiles'
ORDER BY 
    ordinal_position;

-- Parte 7: Verificar se há constraints ou foreign keys que podem estar causando problemas
SELECT 
    conname AS nome_constraint,
    contype AS tipo_constraint,
    conrelid::regclass AS tabela,
    confrelid::regclass AS tabela_referenciada,
    pg_get_constraintdef(oid) AS definicao_constraint
FROM 
    pg_constraint
WHERE 
    conrelid::regclass::text = 'public.profiles'
    OR confrelid::regclass::text = 'public.profiles';

-- Parte 8: Verificar logs de erro recentes (se disponível no Supabase)
-- Isso só funcionará se você tiver permissões de superusuário e os logs estiverem habilitados
DO $$
BEGIN
    BEGIN
        CREATE TEMPORARY TABLE temp_pg_logs AS
        SELECT * FROM pg_catalog.pg_logs
        WHERE log_time > now() - interval '1 hour'
        AND (message LIKE '%recursion%' OR message LIKE '%stack depth%' OR error_message LIKE '%recursion%')
        ORDER BY log_time DESC
        LIMIT 100;
        
        RAISE NOTICE 'Logs de erro encontrados:';
        PERFORM 'Horário: ' || log_time || ', Mensagem: ' || message 
        FROM temp_pg_logs;
        
    EXCEPTION WHEN undefined_table THEN
        RAISE NOTICE 'Tabela pg_logs não está disponível (requer privilégios de superusuário)';
    END;
END $$;

-- Parte 9: Verificação direta de chamadas recursivas em políticas RLS
WITH funcoes_rls AS (
    SELECT
        schemaname,
        tablename,
        policyname,
        qual::text AS condicao
    FROM
        pg_policies
    WHERE
        qual IS NOT NULL
)
SELECT
    f.schemaname,
    f.tablename,
    f.policyname,
    p.proname AS funcao_chamada,
    f.condicao
FROM
    funcoes_rls f,
    pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE
    f.condicao LIKE '%' || p.proname || '%'
    AND n.nspname = 'public'
    AND (
        p.proname LIKE '%sync%'
        OR p.proname LIKE '%plan%'
        OR p.proname LIKE '%update%'
    );

-- Parte 10: Verificar o uso de variáveis de sessão para controle de recursão
DO $$
DECLARE
    v_result text;
BEGIN
    BEGIN
        SELECT current_setting('my.sync_in_progress') INTO v_result;
        RAISE NOTICE 'my.sync_in_progress = %', v_result;
    EXCEPTION WHEN undefined_object THEN
        RAISE NOTICE 'Variável my.sync_in_progress não está definida';
    END;
    
    BEGIN
        SELECT current_setting('my.trigger_in_progress') INTO v_result;
        RAISE NOTICE 'my.trigger_in_progress = %', v_result;
    EXCEPTION WHEN undefined_object THEN
        RAISE NOTICE 'Variável my.trigger_in_progress não está definida';
    END;
END $$;

-- Parte 11: Verificar se há dependências circulares em triggers/funções
WITH RECURSIVE dependencias AS (
    -- Base: triggers que afetam a tabela profiles
    SELECT 
        t.tgfoid AS funcao_id,
        t.tgrelid AS tabela_id,
        f.proname AS funcao_nome,
        t.tgrelid::regclass AS tabela_nome,
        1 AS nivel,
        ARRAY[f.proname::text] AS caminho
    FROM 
        pg_trigger t
        JOIN pg_proc f ON t.tgfoid = f.oid
    WHERE 
        t.tgrelid::regclass::text = 'public.profiles'
    
    UNION ALL
    
    -- Recursão: funções que são chamadas por outras funções
    SELECT 
        p.oid,
        d.tabela_id,
        p.proname,
        d.tabela_nome,
        d.nivel + 1,
        d.caminho || p.proname::text
    FROM 
        pg_proc p
        JOIN dependencias d ON pg_get_functiondef(p.oid) LIKE '%' || d.funcao_nome || '%'
    WHERE 
        p.proname <> d.funcao_nome
        AND d.nivel < 5
        AND NOT (p.proname = ANY(d.caminho))
)
SELECT 
    funcao_nome,
    tabela_nome::text,
    nivel,
    caminho
FROM 
    dependencias
WHERE 
    nivel > 1
    AND (caminho[1] = ANY(caminho[2:array_length(caminho, 1)]))
ORDER BY 
    tabela_nome, nivel, funcao_nome;

-- Parte 12: Lista de correções recomendadas

DO $$
BEGIN
    RAISE NOTICE '----- RECOMENDAÇÕES DE CORREÇÃO -----';
    RAISE NOTICE '1. Aplicar o script de correção que adiciona proteção contra recursão';
    RAISE NOTICE '2. Verificar e corrigir políticas RLS que possam estar chamando funções recursivamente';
    RAISE NOTICE '3. Desabilitar temporariamente triggers problemáticos para testes';
    RAISE NOTICE '4. Considerar usar SET LOCAL session_replication_role = ''replica'' nas funções críticas';
    RAISE NOTICE '5. Utilizar variáveis de sessão para controle de recursão';
    RAISE NOTICE '6. Se necessário, desativar RLS temporariamente para testes:';
    RAISE NOTICE '   ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;';
    RAISE NOTICE '   (Não esqueça de reativar depois: ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;)';
END $$; 