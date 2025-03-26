-- Criar tabela para logs de alteração de plano
CREATE TABLE IF NOT EXISTS public.plan_change_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    old_plan TEXT NOT NULL,
    new_plan TEXT NOT NULL,
    change_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    changed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    change_method TEXT,
    client_info JSONB,
    CONSTRAINT plan_change_logs_old_plan_check CHECK (old_plan IN ('gratuito', 'member', 'pro', 'elite')),
    CONSTRAINT plan_change_logs_new_plan_check CHECK (new_plan IN ('gratuito', 'member', 'pro', 'elite'))
);

-- Adicionar índices para melhorar a performance de consultas frequentes
CREATE INDEX IF NOT EXISTS plan_change_logs_user_id_idx ON public.plan_change_logs(user_id);
CREATE INDEX IF NOT EXISTS plan_change_logs_change_date_idx ON public.plan_change_logs(change_date);

-- Adicionar comentários para documentação
COMMENT ON TABLE public.plan_change_logs IS 'Registra todas as alterações de plano para auditoria e solução de problemas';
COMMENT ON COLUMN public.plan_change_logs.id IS 'ID único do registro de log';
COMMENT ON COLUMN public.plan_change_logs.user_id IS 'ID do usuário que teve o plano alterado';
COMMENT ON COLUMN public.plan_change_logs.old_plan IS 'Plano anterior do usuário';
COMMENT ON COLUMN public.plan_change_logs.new_plan IS 'Novo plano do usuário';
COMMENT ON COLUMN public.plan_change_logs.change_date IS 'Data e hora da alteração do plano';
COMMENT ON COLUMN public.plan_change_logs.changed_by IS 'ID do usuário que fez a alteração (se disponível)';
COMMENT ON COLUMN public.plan_change_logs.change_method IS 'Método usado para alterar o plano (API, interface admin, etc.)';
COMMENT ON COLUMN public.plan_change_logs.client_info IS 'Informações adicionais do cliente no momento da alteração';

-- Configurar RLS (Row Level Security) para esta tabela
ALTER TABLE public.plan_change_logs ENABLE ROW LEVEL SECURITY;

-- Política para administradores (podem ver todos os logs)
CREATE POLICY admin_plan_logs_policy 
    ON public.plan_change_logs 
    FOR ALL 
    TO authenticated 
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

-- Política para usuários (podem ver apenas seus próprios logs)
CREATE POLICY user_plan_logs_policy 
    ON public.plan_change_logs 
    FOR SELECT 
    TO authenticated 
    USING (user_id = auth.uid());

-- Criar função para adicionar automaticamente quem fez a alteração
CREATE OR REPLACE FUNCTION public.set_plan_change_user()
RETURNS TRIGGER AS $$
BEGIN
    NEW.changed_by = auth.uid();
    NEW.client_info = jsonb_build_object(
        'user_agent', current_setting('request.headers', true)::json->>'user-agent',
        'ip', current_setting('request.headers', true)::json->>'x-forwarded-for'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar trigger para a função acima
CREATE TRIGGER set_plan_change_user_trigger
BEFORE INSERT ON public.plan_change_logs
FOR EACH ROW
EXECUTE FUNCTION public.set_plan_change_user(); 