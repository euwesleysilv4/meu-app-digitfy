-- CORREÇÃO DE PERMISSÕES EM TABELAS RELACIONADAS (VERSÃO CORRIGIDA)
-- Este script corrige permissões em tabelas relacionadas que podem ter sido afetadas pelo problema em profiles

-- PRIMEIRA PARTE: TABELAS DE CONTEÚDO (CURSOS, MAPAS MENTAIS, ETC)

-- Função auxiliar para processar tabelas de maneira segura
CREATE OR REPLACE FUNCTION fix_table_permissions(tablename text) RETURNS void AS $$
DECLARE
    policy_record RECORD;
BEGIN
    -- Ativar RLS na tabela
    EXECUTE 'ALTER TABLE public.' || quote_ident(tablename) || ' ENABLE ROW LEVEL SECURITY';
    
    -- Remover políticas existentes que possam estar causando problemas
    FOR policy_record IN 
        SELECT policyname FROM pg_policies 
        WHERE tablename = $1 AND schemaname = 'public'
    LOOP
        -- Usar aspas duplas para proteger nomes com espaços
        EXECUTE 'DROP POLICY IF EXISTS "' || policy_record.policyname || '" ON public.' || quote_ident(tablename);
        RAISE NOTICE 'Política removida de %: %', tablename, policy_record.policyname;
    END LOOP;
    
    -- Criar política simplificada
    EXECUTE 'CREATE POLICY ' || quote_ident(tablename || '_select_policy') || 
            ' ON public.' || quote_ident(tablename) || ' FOR SELECT USING (true)';
    
    -- Garantir permissões
    EXECUTE 'GRANT SELECT ON public.' || quote_ident(tablename) || ' TO authenticated';
    
    RAISE NOTICE 'Tabela % corrigida com sucesso', tablename;
END;
$$ LANGUAGE plpgsql;

-- 1. Processar tabelas principais
DO $$
DECLARE
    tabelas text[] := ARRAY[
        'cursos', 'mapas_mentais', 'estrategias_vendas', 'pacotes_gratuitos',
        'ferramentas', 'trend_rush', 'afiliados', 'depoimentos'
    ];
    t text;
BEGIN
    FOREACH t IN ARRAY tabelas LOOP
        IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = t AND schemaname = 'public') THEN
            PERFORM fix_table_permissions(t);
        ELSE
            RAISE NOTICE 'Tabela % não encontrada, pulando...', t;
        END IF;
    END LOOP;
END $$;

-- SEGUNDA PARTE: CORRIGIR FUNÇÕES DE VERIFICAÇÃO DE PERMISSÕES

-- Criar função segura para verificar permissões sem recursão
CREATE OR REPLACE FUNCTION public.check_permissions(feature text, user_id UUID DEFAULT NULL)
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
        RETURN feature IN ('cursos_gratuitos', 'mapas_mentais', 'pacotes_gratuitos');
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
COMMENT ON FUNCTION public.check_permissions IS 'Verifica permissões de acesso a features sem causar recursão';
GRANT EXECUTE ON FUNCTION public.check_permissions TO authenticated;

-- TERCEIRA PARTE: CORREÇÃO ESPECÍFICA PARA DEPOIMENTOS (TESTIMONIALS)

-- Corrigir tabela de depoimentos de forma segura
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'testimonials' AND schemaname = 'public') THEN
        -- Desativar RLS temporariamente
        EXECUTE 'ALTER TABLE public.testimonials DISABLE ROW LEVEL SECURITY';
        
        -- Remover todas as políticas existentes
        FOR r IN 
            SELECT policyname FROM pg_policies 
            WHERE tablename = 'testimonials' AND schemaname = 'public'
        LOOP
            EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.testimonials';
            RAISE NOTICE 'Política removida de testimonials: %', r.policyname;
        END LOOP;
        
        -- Criar política simplificada para SELECT
        EXECUTE 'CREATE POLICY testimonials_select_policy ON public.testimonials FOR SELECT USING (true)';
        
        -- Criar política para INSERT/UPDATE/DELETE para administradores
        EXECUTE 'CREATE POLICY testimonials_admin_policy ON public.testimonials FOR ALL USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = ''admin'')';
        
        -- Reativar RLS
        EXECUTE 'ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY';
        
        -- Garantir permissões
        EXECUTE 'GRANT SELECT, INSERT, UPDATE, DELETE ON public.testimonials TO authenticated';
        
        RAISE NOTICE 'Tabela testimonials corrigida com sucesso';
    ELSE
        RAISE NOTICE 'Tabela testimonials não encontrada';
    END IF;
END $$;

-- QUARTA PARTE: CORREÇÃO PARA LINKS EXTERNOS (WHATSAPP, DISCORD, TELEGRAM)

-- Corrigir tabela de links externos
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'external_links' AND schemaname = 'public') THEN
        -- Desativar RLS temporariamente
        EXECUTE 'ALTER TABLE public.external_links DISABLE ROW LEVEL SECURITY';
        
        -- Remover todas as políticas existentes
        FOR r IN 
            SELECT policyname FROM pg_policies 
            WHERE tablename = 'external_links' AND schemaname = 'public'
        LOOP
            EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.external_links';
            RAISE NOTICE 'Política removida de external_links: %', r.policyname;
        END LOOP;
        
        -- Criar política simplificada
        EXECUTE 'CREATE POLICY external_links_select_policy ON public.external_links FOR SELECT USING (true)';
        
        -- Reativar RLS
        EXECUTE 'ALTER TABLE public.external_links ENABLE ROW LEVEL SECURITY';
        
        -- Garantir permissões
        EXECUTE 'GRANT SELECT ON public.external_links TO authenticated';
        
        RAISE NOTICE 'Tabela external_links corrigida com sucesso';
    ELSE
        RAISE NOTICE 'Tabela external_links não encontrada';
    END IF;
END $$;

-- Remover a função auxiliar
DROP FUNCTION IF EXISTS fix_table_permissions; 