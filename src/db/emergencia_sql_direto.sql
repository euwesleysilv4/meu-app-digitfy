-- SCRIPT DE EMERGÊNCIA EXTREMA - ATUALIZAÇÃO DIRETA DO PLANO
-- SUBSTITUIR OS VALORES ENTRE COLCHETES PELOS VALORES REAIS
-- ATENÇÃO: Esse script modifica diretamente as tabelas, use com cautela

-- Modelo para atualizar plano
-- Substitua [ID_DO_USUARIO] pelo UUID do usuário (ex: '12345678-1234-1234-1234-123456789012')
-- Substitua [PLANO_DESEJADO] pelo plano desejado (ex: 'free', 'pro', 'business')

-- Etapa 1: Atualizar o plano diretamente na tabela profiles
UPDATE public.profiles 
SET plano = '[PLANO_DESEJADO]'::user_plan, 
    data_modificacao = NOW() 
WHERE id = '[ID_DO_USUARIO]';

-- Etapa 2: Atualizar os metadados do usuário para sincronizar
UPDATE auth.users
SET raw_user_meta_data = 
    COALESCE(raw_user_meta_data, '{}'::jsonb) || 
    jsonb_build_object(
        'plano', '[PLANO_DESEJADO]',
        'plano_updated_at', now()::text
    )
WHERE id = '[ID_DO_USUARIO]';

-- Etapa 3: Verificar se a atualização funcionou
SELECT 
    p.id, 
    p.plano,
    u.raw_user_meta_data->>'plano' as metadados_plano
FROM 
    public.profiles p
JOIN 
    auth.users u ON p.id = u.id
WHERE 
    p.id = '[ID_DO_USUARIO]'; 