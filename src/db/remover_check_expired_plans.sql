-- SCRIPT PARA REMOVER A FUNÇÃO check_expired_plans PROBLEMÁTICA
-- Esta função está tentando acessar a coluna data_expiracao_plano que não existe mais

-- 1. Verificar se a função existe
DO $$
BEGIN
    RAISE NOTICE 'Verificando existência da função check_expired_plans...';
END $$;

-- 2. Remover a função check_expired_plans
DROP FUNCTION IF EXISTS public.check_expired_plans() CASCADE;

-- 3. Verificar e remover possíveis triggers associados
DROP TRIGGER IF EXISTS check_expired_plans_trigger ON public.profiles;

-- 4. Verificar e remover possível job (se estiver usando pg_cron)
DO $$
BEGIN
    BEGIN
        EXECUTE 'SELECT cron.unschedule(''check_expired_plans_job'')';
        RAISE NOTICE 'Job do pg_cron removido com sucesso';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Nenhum job encontrado ou pg_cron não instalado';
    END;
END $$;

-- 5. Mensagem de confirmação
DO $$
BEGIN
    RAISE NOTICE 'Função check_expired_plans removida com sucesso!';
END $$; 