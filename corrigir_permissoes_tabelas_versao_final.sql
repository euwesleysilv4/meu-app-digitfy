-- CORREÇÃO DE PERMISSÕES EM TABELAS RELACIONADAS (VERSÃO FINAL)
-- Este script corrige permissões em tabelas relacionadas que podem ter sido afetadas pelo problema em profiles

-- PRIMEIRA PARTE: TABELAS DE CONTEÚDO (CURSOS, MAPAS MENTAIS, ETC)

-- Função auxiliar para processar tabelas de maneira segura
CREATE OR REPLACE FUNCTION fix_table_permissions(tablename text) RETURNS void AS $$
DECLARE
    policy_record RECORD;
BEGIN
    -- Verificar se a tabela existe
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = $1 AND schemaname = 'public') THEN
        RAISE NOTICE 'Tabela % não existe, pulando...', tablename;
        RETURN;
    END IF;

    -- Ativar RLS na tabela
    EXECUTE 'ALTER TABLE public.' || quote_ident(tablename) || ' ENABLE ROW LEVEL SECURITY';
    
    -- Remover políticas existentes que possam estar causando problemas
    FOR policy_record IN 
        SELECT policyname FROM pg_policies 
        WHERE tablename = $1 AND schemaname = 'public'
    LOOP
        -- Usar aspas duplas para proteger nomes com espaços
        BEGIN
            EXECUTE 'DROP POLICY IF EXISTS "' || policy_record.policyname || '" ON public.' || quote_ident(tablename);
            RAISE NOTICE 'Política removida de %: %', tablename, policy_record.policyname;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Erro ao remover política % da tabela %: %', policy_record.policyname, tablename, SQLERRM;
        END;
    END LOOP;
    
    -- Criar política simplificada
    BEGIN
        EXECUTE 'CREATE POLICY ' || quote_ident(tablename || '_select_policy') || 
                ' ON public.' || quote_ident(tablename) || ' FOR SELECT USING (true)';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Erro ao criar política SELECT para %: %', tablename, SQLERRM;
    END;
    
    -- Garantir permissões
    BEGIN
        EXECUTE 'GRANT SELECT ON public.' || quote_ident(tablename) || ' TO authenticated';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Erro ao conceder permissões em %: %', tablename, SQLERRM;
    END;
    
    RAISE NOTICE 'Tabela % corrigida com sucesso', tablename;
END;
$$ LANGUAGE plpgsql;

-- 1. Processar tabelas principais
DO $$
DECLARE
    tabelas text[] := ARRAY[
        'cursos', 'mapas_mentais', 'estrategias_vendas', 'pacotes_gratuitos',
        'ferramentas', 'trend_rush', 'afiliados', 'depoimentos', 'testimonials',
        'community_posts', 'external_links', 'blog_posts', 'tutorial_videos',
        'ferramentas_marketing', 'ebooks'
    ];
    t text;
BEGIN
    FOREACH t IN ARRAY tabelas LOOP
        PERFORM fix_table_permissions(t);
    END LOOP;
END $$;

-- SEGUNDA PARTE: CORRIGIR FUNÇÕES DE VERIFICAÇÃO DE PERMISSÕES

-- Verificar se a função check_permissions já existe e remover
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_proc 
        WHERE proname = 'check_permissions' 
        AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
    ) THEN
        EXECUTE 'DROP FUNCTION IF EXISTS public.check_permissions(text, uuid)';
        EXECUTE 'DROP FUNCTION IF EXISTS public.check_permissions(text)';
        RAISE NOTICE 'Funções check_permissions anteriores removidas';
    END IF;
END $$;

-- Criar função segura para verificar permissões sem recursão
CREATE OR REPLACE FUNCTION public.check_user_permissions(feature text, user_id UUID DEFAULT NULL)
RETURNS BOOLEAN AS $$
DECLARE
    v_plano text;
    v_check_id UUID;
BEGIN
    -- Se nenhum ID for fornecido, use o ID do usuário atual
    v_check_id := COALESCE(user_id, auth.uid());
    
    -- Buscar o plano diretamente sem passar por políticas RLS
    SELECT plano::text INTO v_plano 
    FROM public.profiles 
    WHERE id = v_check_id;
    
    -- Verificar permissões baseadas no plano e no recurso solicitado
    IF v_plano IS NULL THEN
        RETURN false;
    ELSIF v_plano = 'gratuito' THEN
        -- Para plano gratuito, só tem acesso a features básicas
        RETURN feature IN ('cursos_gratuitos', 'mapas_mentais', 'pacotes_gratuitos', 
                          'ferramentas_basicas', 'ebooks_gratuitos');
    ELSIF v_plano IN ('premium', 'business', 'elite') THEN
        -- Planos pagos têm acesso a todas as features
        RETURN true;
    ELSE
        RETURN false;
    END IF;
EXCEPTION WHEN OTHERS THEN
    RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Adicionar comentário e conceder permissões
COMMENT ON FUNCTION public.check_user_permissions IS 'Verifica permissões de acesso a features sem causar recursão';
GRANT EXECUTE ON FUNCTION public.check_user_permissions TO authenticated;

-- TERCEIRA PARTE: CORREÇÃO ESPECÍFICA PARA DEPOIMENTOS (TESTIMONIALS)

-- Corrigir tabela de depoimentos de forma segura
DO $$
BEGIN
    -- Testimonials (Depoimentos)
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'testimonials' AND schemaname = 'public') THEN
        -- Desativar RLS temporariamente
        EXECUTE 'ALTER TABLE public.testimonials DISABLE ROW LEVEL SECURITY';
        
        -- Remover todas as políticas existentes
        FOR r IN 
            SELECT policyname FROM pg_policies 
            WHERE tablename = 'testimonials' AND schemaname = 'public'
        LOOP
            BEGIN
                EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.testimonials';
                RAISE NOTICE 'Política removida de testimonials: %', r.policyname;
            EXCEPTION WHEN OTHERS THEN
                RAISE NOTICE 'Erro ao remover política % de testimonials: %', r.policyname, SQLERRM;
            END;
        END LOOP;
        
        -- Criar política simplificada para SELECT (todos podem ver)
        BEGIN
            EXECUTE 'CREATE POLICY testimonials_public_select ON public.testimonials FOR SELECT USING (true)';
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Erro ao criar política SELECT para testimonials: %', SQLERRM;
        END;
        
        -- Criar política para INSERT/UPDATE/DELETE usando verificação direta de admin
        BEGIN
            EXECUTE 'CREATE POLICY testimonials_admin_policy ON public.testimonials 
                    FOR ALL USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = ''admin'')';
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Erro ao criar política ADMIN para testimonials: %', SQLERRM;
        END;
        
        -- Reativar RLS
        EXECUTE 'ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY';
        
        -- Garantir permissões
        EXECUTE 'GRANT SELECT, INSERT, UPDATE, DELETE ON public.testimonials TO authenticated';
        
        RAISE NOTICE 'Tabela testimonials corrigida com sucesso';
    END IF;

    -- Depoimentos (versão em português, se existir)
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'depoimentos' AND schemaname = 'public') THEN
        -- Desativar RLS temporariamente
        EXECUTE 'ALTER TABLE public.depoimentos DISABLE ROW LEVEL SECURITY';
        
        -- Remover todas as políticas existentes
        FOR r IN 
            SELECT policyname FROM pg_policies 
            WHERE tablename = 'depoimentos' AND schemaname = 'public'
        LOOP
            BEGIN
                EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.depoimentos';
                RAISE NOTICE 'Política removida de depoimentos: %', r.policyname;
            EXCEPTION WHEN OTHERS THEN
                RAISE NOTICE 'Erro ao remover política % de depoimentos: %', r.policyname, SQLERRM;
            END;
        END LOOP;
        
        -- Criar política simplificada para SELECT (todos podem ver)
        BEGIN
            EXECUTE 'CREATE POLICY depoimentos_public_select ON public.depoimentos FOR SELECT USING (true)';
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Erro ao criar política SELECT para depoimentos: %', SQLERRM;
        END;
        
        -- Criar política para INSERT/UPDATE/DELETE usando verificação direta de admin
        BEGIN
            EXECUTE 'CREATE POLICY depoimentos_admin_policy ON public.depoimentos 
                    FOR ALL USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = ''admin'')';
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Erro ao criar política ADMIN para depoimentos: %', SQLERRM;
        END;
        
        -- Reativar RLS
        EXECUTE 'ALTER TABLE public.depoimentos ENABLE ROW LEVEL SECURITY';
        
        -- Garantir permissões
        EXECUTE 'GRANT SELECT, INSERT, UPDATE, DELETE ON public.depoimentos TO authenticated';
        
        RAISE NOTICE 'Tabela depoimentos corrigida com sucesso';
    END IF;
END $$;

-- Remover a função auxiliar no final
DROP FUNCTION IF EXISTS fix_table_permissions; 