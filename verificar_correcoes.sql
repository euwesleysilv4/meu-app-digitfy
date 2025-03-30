-- SCRIPT DE VERIFICAÇÃO DE CORREÇÕES
-- Execute este script após aplicar as correções para verificar se foram bem-sucedidas

-- Função auxiliar para imprimir resultados formatados
CREATE OR REPLACE FUNCTION temp_print_result(
    test_name text,
    passou boolean,
    detalhe text DEFAULT NULL
) RETURNS void AS $$
BEGIN
    IF passou THEN
        RAISE NOTICE '✅ % - APROVADO', test_name;
    ELSE
        RAISE NOTICE '❌ % - FALHOU: %', test_name, COALESCE(detalhe, 'Sem detalhes');
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Início dos testes
DO $$
DECLARE
    v_resultado boolean;
    v_detalhes text;
    v_count integer;
    v_policy_text text;
BEGIN
    RAISE NOTICE '==== INICIANDO VERIFICAÇÃO DE CORREÇÕES ====';
    
    -- Teste 1: Verificar se a tabela profiles tem RLS ativado
    SELECT rls_enabled INTO v_resultado 
    FROM pg_tables 
    WHERE tablename = 'profiles' AND schemaname = 'public';
    
    PERFORM temp_print_result(
        'Verificação de RLS na tabela profiles',
        v_resultado,
        CASE WHEN NOT v_resultado THEN 'RLS não está ativado' ELSE NULL END
    );
    
    -- Teste 2: Verificar políticas RLS da tabela profiles
    SELECT COUNT(*) INTO v_count 
    FROM pg_policies 
    WHERE tablename = 'profiles';
    
    PERFORM temp_print_result(
        'Verificação de políticas RLS na tabela profiles',
        v_count > 0,
        CASE WHEN v_count = 0 THEN 'Nenhuma política RLS encontrada' 
             ELSE v_count || ' políticas encontradas' END
    );
    
    -- Teste 3: Verificar se não há recursão nas políticas
    SELECT COUNT(*) INTO v_count 
    FROM pg_policies 
    WHERE tablename = 'profiles' 
    AND (qual::text LIKE '%sync_user_plan%' OR with_check::text LIKE '%sync_user_plan%');
    
    PERFORM temp_print_result(
        'Verificação de recursão nas políticas',
        v_count = 0,
        CASE WHEN v_count > 0 THEN 'Ainda existem ' || v_count || ' políticas com potencial recursão' ELSE NULL END
    );
    
    -- Teste 4: Verificar função is_admin
    BEGIN
        v_resultado := (SELECT EXISTS (
            SELECT 1 FROM pg_proc 
            WHERE proname = 'is_admin' 
            AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
        ));
        
        PERFORM temp_print_result(
            'Verificação da função is_admin',
            v_resultado,
            CASE WHEN NOT v_resultado THEN 'Função is_admin não encontrada' ELSE NULL END
        );
    EXCEPTION WHEN OTHERS THEN
        PERFORM temp_print_result(
            'Verificação da função is_admin',
            false,
            'Erro ao verificar função: ' || SQLERRM
        );
    END;
    
    -- Teste 5: Testar política de SELECT em profiles
    BEGIN
        SELECT qual::text INTO v_policy_text
        FROM pg_policies 
        WHERE tablename = 'profiles' 
        AND operation = 'SELECT'
        LIMIT 1;
        
        PERFORM temp_print_result(
            'Verificação da política SELECT em profiles',
            v_policy_text IS NOT NULL,
            CASE WHEN v_policy_text IS NULL THEN 'Política SELECT não encontrada' 
                 ELSE 'Política encontrada: ' || v_policy_text END
        );
    EXCEPTION WHEN OTHERS THEN
        PERFORM temp_print_result(
            'Verificação da política SELECT em profiles',
            false,
            'Erro ao verificar política: ' || SQLERRM
        );
    END;
    
    -- Teste 6: Verificar tabela testimonials (se existir)
    BEGIN
        IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'testimonials' AND schemaname = 'public') THEN
            SELECT COUNT(*) INTO v_count 
            FROM pg_policies 
            WHERE tablename = 'testimonials';
            
            PERFORM temp_print_result(
                'Verificação de políticas na tabela testimonials',
                v_count > 0,
                CASE WHEN v_count = 0 THEN 'Nenhuma política encontrada' 
                     ELSE v_count || ' políticas encontradas' END
            );
        ELSE
            PERFORM temp_print_result(
                'Verificação da tabela testimonials',
                false,
                'Tabela testimonials não encontrada'
            );
        END IF;
    EXCEPTION WHEN OTHERS THEN
        PERFORM temp_print_result(
            'Verificação da tabela testimonials',
            false,
            'Erro ao verificar tabela: ' || SQLERRM
        );
    END;
    
    -- Teste 7: Verificar triggers problemáticos
    SELECT COUNT(*) INTO v_count 
    FROM pg_trigger 
    WHERE tgrelid = 'public.profiles'::regclass 
    AND tgname IN ('sync_plan_trigger', 'sync_plan_trigger_v2');
    
    PERFORM temp_print_result(
        'Verificação de triggers problemáticos',
        v_count = 0,
        CASE WHEN v_count > 0 THEN 'Ainda existem ' || v_count || ' triggers problemáticos' ELSE NULL END
    );
    
    RAISE NOTICE '';
    RAISE NOTICE '==== RESUMO DA VERIFICAÇÃO ====';
    RAISE NOTICE 'Se você vir mensagens de FALHA, execute novamente os scripts de correção.';
    RAISE NOTICE 'Se todas as verificações passaram, sua aplicação deve estar funcionando corretamente.';
    RAISE NOTICE '';
    RAISE NOTICE 'IMPORTANTE: Teste a aplicação para confirmar que o problema foi resolvido.';
END $$;

-- Limpar função temporária
DROP FUNCTION IF EXISTS temp_print_result; 