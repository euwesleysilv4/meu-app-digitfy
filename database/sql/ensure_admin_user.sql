-- Este script garante que o usuário administrador específico exista
-- e tenha todas as permissões necessárias

-- Verificar se o usuário existe
DO $$
DECLARE
    admin_user_exists BOOLEAN;
    admin_user_id UUID;
    admin_auth_id UUID;
BEGIN
    -- Verificar se o usuário existe na tabela profiles
    SELECT EXISTS (
        SELECT 1 FROM profiles WHERE email = 'wexxxleycomercial@gmail.com'
    ) INTO admin_user_exists;

    IF admin_user_exists THEN
        RAISE NOTICE 'Usuário administrador encontrado no sistema.';
        
        -- Verificar se é administrador e promover se necessário
        SELECT id, (role = 'admin') INTO admin_user_id, admin_user_exists FROM profiles 
        WHERE email = 'wexxxleycomercial@gmail.com';
        
        IF NOT admin_user_exists THEN
            -- Promover a administrador
            UPDATE profiles
            SET 
                role = 'admin',
                data_modificacao = NOW()
            WHERE id = admin_user_id;
            
            RAISE NOTICE 'Usuário wexxxleycomercial@gmail.com promovido a administrador.';
        ELSE
            RAISE NOTICE 'Usuário wexxxleycomercial@gmail.com já é administrador.';
        END IF;
    ELSE
        RAISE NOTICE 'Usuário administrador não encontrado, verificando na tabela auth.users...';
        
        -- Verificar se o usuário existe na tabela auth.users
        SELECT id INTO admin_auth_id FROM auth.users WHERE email = 'wexxxleycomercial@gmail.com' LIMIT 1;
        
        IF admin_auth_id IS NOT NULL THEN
            RAISE NOTICE 'Usuário encontrado em auth.users. Criando perfil de administrador...';
            
            -- Criar perfil com papel de administrador
            INSERT INTO profiles (
                id, 
                nome, 
                email, 
                data_criacao, 
                data_modificacao,
                status, 
                plano, 
                verificado, 
                role, 
                tentativas_login, 
                banido, 
                notificacoes_ativas
            )
            VALUES (
                admin_auth_id, 
                'Administrador Principal', 
                'wexxxleycomercial@gmail.com', 
                NOW(), 
                NOW(),
                'online', 
                'elite', 
                TRUE, 
                'admin', 
                0, 
                FALSE, 
                TRUE
            );
            
            RAISE NOTICE 'Perfil de administrador criado com sucesso.';
        ELSE
            RAISE NOTICE 'Usuário não encontrado em auth.users. É necessário criar a conta primeiro no Supabase Authentication.';
            
            -- Nota: Não podemos criar usuários diretamente na tabela auth.users através de SQL
            -- É necessário usar a interface administrativa do Supabase ou a API de autenticação
        END IF;
    END IF;
END $$;

-- Verificar se as políticas de acesso estão corretas
DO $$
DECLARE
    policy_exists BOOLEAN;
BEGIN
    -- Verificar se a política específica existe
    SELECT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'profiles' AND policyname = 'Administrador específico pode ver todos os perfis'
    ) INTO policy_exists;
    
    IF NOT policy_exists THEN
        RAISE NOTICE 'Políticas de administrador específico não encontradas. Por favor, execute o script admin_access_control.sql.';
    ELSE
        RAISE NOTICE 'Políticas de controle de acesso configuradas corretamente.';
    END IF;
    
    -- Verificar se a função de administrador específico existe
    SELECT EXISTS (
        SELECT 1 FROM pg_proc 
        WHERE proname = 'is_specific_admin'
    ) INTO policy_exists;
    
    IF NOT policy_exists THEN
        RAISE NOTICE 'Função is_specific_admin não encontrada. Por favor, execute o script admin_access_control.sql.';
    ELSE
        RAISE NOTICE 'Função de verificação de administrador configurada corretamente.';
    END IF;
END $$;

-- Verificar se a tabela de log existe
DO $$
DECLARE
    table_exists BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'profile_changes'
    ) INTO table_exists;
    
    IF NOT table_exists THEN
        RAISE NOTICE 'Tabela de log profile_changes não encontrada. Por favor, execute o script admin_access_control.sql.';
    ELSE
        RAISE NOTICE 'Sistema de log configurado corretamente.';
    END IF;
END $$; 