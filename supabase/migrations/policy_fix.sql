-- Remover políticas existentes para reiniciar
DROP POLICY IF EXISTS "Administradores podem inserir conteúdos" ON public.relevant_contents;
DROP POLICY IF EXISTS "Administradores podem atualizar conteúdos" ON public.relevant_contents;
DROP POLICY IF EXISTS "Administradores podem excluir conteúdos" ON public.relevant_contents;
DROP POLICY IF EXISTS "Todos podem ver conteúdos publicados" ON public.relevant_contents;

-- Garantir que RLS está habilitado
ALTER TABLE public.relevant_contents ENABLE ROW LEVEL SECURITY;

-- Criar política para INSERT mais permissiva (temporária para testes)
CREATE POLICY "Admins inserir conteúdos" ON public.relevant_contents
    FOR INSERT 
    WITH CHECK (
        -- Verificar se o usuário está autenticado
        auth.uid() IS NOT NULL AND
        -- E se tem role 'admin' em profiles
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Política para atualização
CREATE POLICY "Admins atualizar conteúdos" ON public.relevant_contents
    FOR UPDATE
    USING (
        auth.uid() IS NOT NULL AND
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Política para exclusão
CREATE POLICY "Admins excluir conteúdos" ON public.relevant_contents
    FOR DELETE
    USING (
        auth.uid() IS NOT NULL AND
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Política para leitura
CREATE POLICY "Visualizar conteúdos" ON public.relevant_contents
    FOR SELECT
    USING (
        status = 'published' OR 
        (
            auth.uid() IS NOT NULL AND
            EXISTS (
                SELECT 1 FROM public.profiles 
                WHERE id = auth.uid() AND role = 'admin'
            )
        )
    );

-- Para facilitar o debug, vamos criar uma função para verificar se o usuário tem permissão para inserir
CREATE OR REPLACE FUNCTION public.check_relevant_content_permission()
RETURNS TABLE (
    is_authenticated BOOLEAN,
    user_id UUID,
    has_admin_role BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        auth.uid() IS NOT NULL as is_authenticated,
        auth.uid() as user_id,
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        ) as has_admin_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 