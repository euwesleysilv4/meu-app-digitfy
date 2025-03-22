-- Função para obter a contagem total de usuários
-- Esta função é segura e pode ser executada por qualquer usuário
CREATE OR REPLACE FUNCTION public.get_total_user_count()
RETURNS INTEGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
    -- Retorna apenas a contagem total sem expor dados
    RETURN (SELECT COUNT(*) FROM profiles);
END;
$$;

-- Conceder permissão para anônimos e autenticados
GRANT EXECUTE ON FUNCTION public.get_total_user_count TO anon, authenticated;
COMMENT ON FUNCTION public.get_total_user_count IS 'Retorna a contagem total de usuários cadastrados na plataforma';

-- Função para obter perfis públicos (apenas dados não sensíveis)
-- Esta função é segura e pode ser executada por qualquer usuário
CREATE OR REPLACE FUNCTION public.get_public_profiles(limit_count INTEGER DEFAULT 20)
RETURNS TABLE (
    id UUID,
    nome TEXT,
    avatar_url TEXT,
    data_criacao TIMESTAMP WITH TIME ZONE,
    plano user_plan,
    role user_role
)
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
    -- Retorna apenas campos seguros para perfis públicos
    RETURN QUERY
    SELECT 
        p.id,
        p.nome,
        p.avatar_url,
        p.data_criacao,
        p.plano,
        p.role
    FROM 
        profiles p
    WHERE
        p.banido = false
    ORDER BY 
        p.ultimo_login DESC NULLS LAST
    LIMIT limit_count;
END;
$$;

-- Conceder permissão para anônimos e autenticados
GRANT EXECUTE ON FUNCTION public.get_public_profiles TO anon, authenticated;
COMMENT ON FUNCTION public.get_public_profiles IS 'Retorna perfis públicos para exibição na página de comunidade'; 