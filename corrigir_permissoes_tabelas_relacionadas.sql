-- CORREÇÃO DE PERMISSÕES EM TABELAS RELACIONADAS
-- Este script corrige permissões em tabelas relacionadas que podem ter sido afetadas pelo problema em profiles

-- Verificar quais tabelas podem estar relacionadas ao problema
-- (Execute esta consulta separadamente para diagnóstico)
/*
SELECT 
    tablename,
    COUNT(*) as politicas 
FROM 
    pg_policies 
WHERE 
    qual::text LIKE '%profile%' OR
    qual::text LIKE '%admin%' OR
    with_check::text LIKE '%profile%' OR
    with_check::text LIKE '%admin%'
GROUP BY 
    tablename
ORDER BY 
    politicas DESC;
*/

-- PRIMEIRA PARTE: TABELAS DE CONTEÚDO (CURSOS, MAPAS MENTAIS, ETC)

-- 1. Cursos Gratuitos (supondo que a tabela seja 'cursos')
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'cursos' AND schemaname = 'public') THEN
        -- Garantir que RLS está ativado
        EXECUTE 'ALTER TABLE public.cursos ENABLE ROW LEVEL SECURITY';
        
        -- Remover políticas existentes que possam estar causando problemas
        EXECUTE 'DROP POLICY IF EXISTS cursos_select_policy ON public.cursos';
        
        -- Criar política simplificada
        EXECUTE 'CREATE POLICY cursos_select_policy ON public.cursos FOR SELECT USING (true)';
        
        -- Garantir permissões
        EXECUTE 'GRANT SELECT ON public.cursos TO authenticated';
    END IF;
END $$;

-- 2. Mapas Mentais
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'mapas_mentais' AND schemaname = 'public') THEN
        EXECUTE 'ALTER TABLE public.mapas_mentais ENABLE ROW LEVEL SECURITY';
        EXECUTE 'DROP POLICY IF EXISTS mapas_mentais_select_policy ON public.mapas_mentais';
        EXECUTE 'CREATE POLICY mapas_mentais_select_policy ON public.mapas_mentais FOR SELECT USING (true)';
        EXECUTE 'GRANT SELECT ON public.mapas_mentais TO authenticated';
    END IF;
END $$;

-- 3. Estratégias de Vendas
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'estrategias_vendas' AND schemaname = 'public') THEN
        EXECUTE 'ALTER TABLE public.estrategias_vendas ENABLE ROW LEVEL SECURITY';
        EXECUTE 'DROP POLICY IF EXISTS estrategias_vendas_select_policy ON public.estrategias_vendas';
        EXECUTE 'CREATE POLICY estrategias_vendas_select_policy ON public.estrategias_vendas FOR SELECT USING (true)';
        EXECUTE 'GRANT SELECT ON public.estrategias_vendas TO authenticated';
    END IF;
END $$;

-- 4. Pacotes Gratuitos
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'pacotes_gratuitos' AND schemaname = 'public') THEN
        EXECUTE 'ALTER TABLE public.pacotes_gratuitos ENABLE ROW LEVEL SECURITY';
        EXECUTE 'DROP POLICY IF EXISTS pacotes_gratuitos_select_policy ON public.pacotes_gratuitos';
        EXECUTE 'CREATE POLICY pacotes_gratuitos_select_policy ON public.pacotes_gratuitos FOR SELECT USING (true)';
        EXECUTE 'GRANT SELECT ON public.pacotes_gratuitos TO authenticated';
    END IF;
END $$;

-- 5. Ferramentas
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'ferramentas' AND schemaname = 'public') THEN
        EXECUTE 'ALTER TABLE public.ferramentas ENABLE ROW LEVEL SECURITY';
        EXECUTE 'DROP POLICY IF EXISTS ferramentas_select_policy ON public.ferramentas';
        EXECUTE 'CREATE POLICY ferramentas_select_policy ON public.ferramentas FOR SELECT USING (true)';
        EXECUTE 'GRANT SELECT ON public.ferramentas TO authenticated';
    END IF;
END $$;

-- 6. Trend Rush
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'trend_rush' AND schemaname = 'public') THEN
        EXECUTE 'ALTER TABLE public.trend_rush ENABLE ROW LEVEL SECURITY';
        EXECUTE 'DROP POLICY IF EXISTS trend_rush_select_policy ON public.trend_rush';
        EXECUTE 'CREATE POLICY trend_rush_select_policy ON public.trend_rush FOR SELECT USING (true)';
        EXECUTE 'GRANT SELECT ON public.trend_rush TO authenticated';
    END IF;
END $$;

-- 7. Área de Afiliados
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'afiliados' AND schemaname = 'public') THEN
        EXECUTE 'ALTER TABLE public.afiliados ENABLE ROW LEVEL SECURITY';
        EXECUTE 'DROP POLICY IF EXISTS afiliados_select_policy ON public.afiliados';
        EXECUTE 'CREATE POLICY afiliados_select_policy ON public.afiliados FOR SELECT USING (true)';
        EXECUTE 'GRANT SELECT ON public.afiliados TO authenticated';
    END IF;
END $$;

-- 8. Depoimentos
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'depoimentos' AND schemaname = 'public') THEN
        EXECUTE 'ALTER TABLE public.depoimentos ENABLE ROW LEVEL SECURITY';
        EXECUTE 'DROP POLICY IF EXISTS depoimentos_select_policy ON public.depoimentos';
        EXECUTE 'CREATE POLICY depoimentos_select_policy ON public.depoimentos FOR SELECT USING (true)';
        EXECUTE 'GRANT SELECT ON public.depoimentos TO authenticated';
    END IF;
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

-- Essa parte é específica para corrigir o erro "Acesso Restrito" na área de depoimentos
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'testimonials' AND schemaname = 'public') THEN
        -- Desativar RLS temporariamente
        EXECUTE 'ALTER TABLE public.testimonials DISABLE ROW LEVEL SECURITY';
        
        -- Remover todas as políticas existentes
        FOR r IN SELECT policyname FROM pg_policies WHERE tablename = 'testimonials' LOOP
            EXECUTE 'DROP POLICY IF EXISTS ' || r.policyname || ' ON public.testimonials';
        END LOOP;
        
        -- Criar política simplificada para SELECT
        EXECUTE 'CREATE POLICY testimonials_select_policy ON public.testimonials FOR SELECT USING (true)';
        
        -- Criar política para INSERT/UPDATE/DELETE para administradores
        EXECUTE 'CREATE POLICY testimonials_admin_policy ON public.testimonials FOR ALL USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = ''admin'')';
        
        -- Reativar RLS
        EXECUTE 'ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY';
        
        -- Garantir permissões
        EXECUTE 'GRANT SELECT, INSERT, UPDATE, DELETE ON public.testimonials TO authenticated';
    END IF;
END $$;

-- QUARTA PARTE: CORREÇÃO PARA LINKS EXTERNOS (WHATSAPP, DISCORD, TELEGRAM)

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'external_links' AND schemaname = 'public') THEN
        EXECUTE 'ALTER TABLE public.external_links ENABLE ROW LEVEL SECURITY';
        EXECUTE 'DROP POLICY IF EXISTS external_links_select_policy ON public.external_links';
        EXECUTE 'CREATE POLICY external_links_select_policy ON public.external_links FOR SELECT USING (true)';
        EXECUTE 'GRANT SELECT ON public.external_links TO authenticated';
    END IF;
END $$; 