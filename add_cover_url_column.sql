-- Script para adicionar a coluna cover_url à tabela profiles
-- Autor: Claude AI

-- Parte 1: Adicionar a coluna cover_url à tabela profiles
-- Verifica se a coluna já existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'profiles'
        AND column_name = 'cover_url'
    ) THEN
        -- Adiciona a coluna cover_url como TEXT (permite NULL)
        ALTER TABLE public.profiles
        ADD COLUMN cover_url TEXT;
        
        RAISE NOTICE 'Coluna cover_url adicionada com sucesso à tabela profiles.';
    ELSE
        RAISE NOTICE 'A coluna cover_url já existe na tabela profiles. Nenhuma alteração foi feita.';
    END IF;
END $$;

-- Parte 2: Atualizar a função handle_new_user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS
$$
BEGIN
  INSERT INTO public.profiles (
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
    notificacoes_ativas,
    avatar_url,
    cover_url
  )
  VALUES (
    NEW.id, 
    NEW.raw_user_meta_data->>'nome', 
    NEW.email, 
    NOW(), 
    NOW(),
    'offline', 
    'gratuito', 
    FALSE, 
    'user', 
    0, 
    FALSE, 
    TRUE,
    NULL,
    NULL
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Parte 3: Atualizar a função update_own_profile
-- Esta parte é opcional - execute apenas se a função já existir
-- Para executar, remova os comentários das linhas abaixo
/*
CREATE OR REPLACE FUNCTION public.update_own_profile(profile_updates JSONB)
RETURNS JSONB AS
$$
DECLARE
    user_id UUID;
    updated_profile JSONB;
BEGIN
    -- Obter o ID do usuário atual
    user_id := auth.uid();
    
    -- Verificar se o usuário está autenticado
    IF user_id IS NULL THEN
        RAISE EXCEPTION 'Usuário não autenticado';
    END IF;
    
    -- Atualizar o perfil
    UPDATE public.profiles
    SET 
        nome = COALESCE(profile_updates->>'nome', nome),
        avatar_url = COALESCE(profile_updates->>'avatar_url', avatar_url),
        cover_url = COALESCE(profile_updates->>'cover_url', cover_url),
        whatsapp = COALESCE(profile_updates->>'whatsapp', whatsapp),
        notificacoes_ativas = COALESCE((profile_updates->>'notificacoes_ativas')::boolean, notificacoes_ativas),
        data_modificacao = NOW()
    WHERE id = user_id
    RETURNING to_jsonb(profiles.*) INTO updated_profile;
    
    RETURN updated_profile;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
*/

-- Verificar se as políticas de RLS para cover_url são necessárias
-- As políticas existentes para os perfis já devem cobrir este novo campo

RAISE NOTICE 'Script de adição de coluna cover_url concluído com sucesso.';
