-- Script para encontrar e corrigir referências à coluna data_expiracao_plano em funções do banco de dados
-- Executar este script após as funções V2 já terem sido criadas

DO $$
DECLARE
    func_count INTEGER;
    func_record RECORD;
BEGIN
    RAISE NOTICE 'Iniciando verificação de funções com referência a data_expiracao_plano...';

    -- 1. Buscar funções que ainda referenciam a coluna removida
    SELECT COUNT(*)
    INTO func_count
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public'
    AND p.prosrc LIKE '%data_expiracao_plano%';

    RAISE NOTICE 'Encontradas % funções com referências a data_expiracao_plano.', func_count;

    -- 2. Remover funções RPC antigas que possam estar causando o problema
    -- Remover a função update_user_plan se existir
    DROP FUNCTION IF EXISTS public.update_user_plan(UUID, TEXT);
    DROP FUNCTION IF EXISTS public.update_user_plan(UUID, user_plan);
    RAISE NOTICE 'Função update_user_plan removida.';

    -- Remover a função force_update_user_plan se existir (sem o _v2)
    DROP FUNCTION IF EXISTS public.force_update_user_plan(UUID, TEXT);
    DROP FUNCTION IF EXISTS public.force_update_user_plan(UUID, user_plan);
    RAISE NOTICE 'Função force_update_user_plan removida.';

    -- Remover a função sync_user_plan se existir (sem o _v2)
    DROP FUNCTION IF EXISTS public.sync_user_plan(UUID);
    RAISE NOTICE 'Função sync_user_plan removida.';

    -- 3. Verificar gatilhos que possam estar referenciando a coluna
    DROP TRIGGER IF EXISTS sync_plan_trigger ON public.profiles;
    DROP FUNCTION IF EXISTS public.trigger_sync_plan();
    RAISE NOTICE 'Gatilho sync_plan_trigger e sua função removidos.';

    -- 4. Verificar se a coluna ainda existe fisicamente no banco (para casos de tabelas com problemas)
    -- Este é um teste que pode evitar erro se a coluna já não existir
    BEGIN
        EXECUTE 'ALTER TABLE public.profiles DROP COLUMN IF EXISTS data_expiracao_plano';
        RAISE NOTICE 'Coluna data_expiracao_plano removida (se existia).';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'A coluna data_expiracao_plano já foi removida anteriormente.';
    END;

    -- 5. Verificar funções com nomes parecidos que podem estar com problemas
    DROP FUNCTION IF EXISTS public.update_plan(UUID, TEXT);
    DROP FUNCTION IF EXISTS public.update_plan(UUID, user_plan);
    RAISE NOTICE 'Função update_plan removida (se existia).';

    -- 6. Verificar todas as funções com "plan" no nome
    RAISE NOTICE 'Lista de todas as funções com "plan" no nome que ainda existem:';
    FOR func_record IN 
        SELECT p.proname
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname = 'public'
        AND p.proname LIKE '%plan%'
    LOOP
        RAISE NOTICE '%', func_record.proname;
    END LOOP;

    RAISE NOTICE 'Script de limpeza concluído. Por favor, verifique se o problema foi resolvido.';
END $$;

-- Adicionar permissões novamente para garantir que as funções V2 estão acessíveis
GRANT EXECUTE ON FUNCTION public.update_plan_direct_v2 TO authenticated;
GRANT EXECUTE ON FUNCTION public.reset_and_update_plan_v2 TO authenticated;
GRANT EXECUTE ON FUNCTION public.sync_user_plan_v2 TO authenticated;
GRANT EXECUTE ON FUNCTION public.execute_sql_safe TO authenticated; 