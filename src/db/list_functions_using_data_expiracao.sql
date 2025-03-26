-- Script para listar todas as funções que ainda referenciam data_expiracao_plano

DO $$
DECLARE
    func_record RECORD;
    has_functions BOOLEAN := FALSE;
BEGIN
    RAISE NOTICE 'Iniciando busca por funções que referenciam data_expiracao_plano...';
    
    FOR func_record IN 
        SELECT n.nspname as schema_name, p.proname as function_name, pg_get_functiondef(p.oid) as function_code
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname = 'public'
        AND pg_get_functiondef(p.oid) LIKE '%data_expiracao_plano%'
        ORDER BY n.nspname, p.proname
    LOOP
        has_functions := TRUE;
        RAISE NOTICE '----------------------------------------';
        RAISE NOTICE 'Função: %.%', func_record.schema_name, func_record.function_name;
        RAISE NOTICE 'Código:';
        RAISE NOTICE '%', func_record.function_code;
    END LOOP;
    
    IF NOT has_functions THEN
        RAISE NOTICE 'Nenhuma função encontrada que referencie data_expiracao_plano.';
    END IF;
    
    RAISE NOTICE '----------------------------------------';
    RAISE NOTICE 'Iniciando busca por gatilhos que referenciam data_expiracao_plano...';
    
    has_functions := FALSE;
    
    FOR func_record IN
        SELECT t.tgname as trigger_name, p.proname as function_name, pg_get_functiondef(p.oid) as function_code
        FROM pg_trigger t
        JOIN pg_proc p ON t.tgfoid = p.oid
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE pg_get_functiondef(p.oid) LIKE '%data_expiracao_plano%'
        ORDER BY t.tgname
    LOOP
        has_functions := TRUE;
        RAISE NOTICE '----------------------------------------';
        RAISE NOTICE 'Gatilho: % (função: %)', func_record.trigger_name, func_record.function_name;
        RAISE NOTICE 'Código:';
        RAISE NOTICE '%', func_record.function_code;
    END LOOP;
    
    IF NOT has_functions THEN
        RAISE NOTICE 'Nenhum gatilho encontrado que referencie data_expiracao_plano.';
    END IF;
    
    RAISE NOTICE '----------------------------------------';
    RAISE NOTICE 'Busca concluída.';
END $$; 