-- Criar enum para os tipos de comunidade
CREATE TYPE community_type AS ENUM ('whatsapp', 'discord', 'telegram');

-- Criar enum para o status da comunidade
CREATE TYPE community_status AS ENUM ('pending', 'approved', 'rejected');

-- Criar tabela para armazenar as comunidades enviadas
CREATE TABLE IF NOT EXISTS submitted_communities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    community_name TEXT NOT NULL,
    description TEXT,
    link TEXT NOT NULL,
    type community_type NOT NULL,
    members_count INTEGER,
    category TEXT,
    image_url TEXT,
    contact_email TEXT,
    submitter_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status community_status DEFAULT 'pending'::community_status,
    admin_notes TEXT
);

-- Criar índices para melhorar a performance das consultas
CREATE INDEX idx_communities_type ON submitted_communities(type);
CREATE INDEX idx_communities_status ON submitted_communities(status);
CREATE INDEX idx_communities_submitter ON submitted_communities(submitter_id);

-- Habilitar Row Level Security
ALTER TABLE submitted_communities ENABLE ROW LEVEL SECURITY;

-- Criar políticas de segurança para controle de acesso
-- Política que permite que os administradores vejam todas as comunidades
CREATE POLICY admin_all_access ON submitted_communities
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

-- Política que permite que usuários vejam apenas suas próprias comunidades pendentes ou aprovadas
CREATE POLICY user_own_submissions ON submitted_communities
    FOR SELECT
    TO authenticated
    USING (
        submitter_id = auth.uid() OR status = 'approved'
    );

-- Política que permite que todos os usuários vejam comunidades aprovadas
CREATE POLICY public_approved_communities ON submitted_communities
    FOR SELECT
    USING (
        status = 'approved'
    );

-- Política que permite aos usuários criar novas comunidades
CREATE POLICY user_insert_communities ON submitted_communities
    FOR INSERT
    TO authenticated
    WITH CHECK (
        submitter_id = auth.uid()
    );

-- Função para submeter uma nova comunidade
CREATE OR REPLACE FUNCTION submit_community(
    p_community_name TEXT,
    p_description TEXT,
    p_link TEXT,
    p_type community_type,
    p_members_count INTEGER,
    p_category TEXT,
    p_image_url TEXT,
    p_contact_email TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id UUID;
    v_result JSONB;
BEGIN
    -- Obter o ID do usuário atual
    v_user_id := auth.uid();
    
    -- Verificar se o usuário está autenticado
    IF v_user_id IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'User not authenticated'
        );
    END IF;
    
    -- Inserir a nova comunidade
    INSERT INTO submitted_communities (
        community_name,
        description,
        link,
        type,
        members_count,
        category,
        image_url,
        contact_email,
        submitter_id
    ) VALUES (
        p_community_name,
        p_description,
        p_link,
        p_type,
        p_members_count,
        p_category,
        p_image_url,
        p_contact_email,
        v_user_id
    )
    RETURNING jsonb_build_object(
        'id', id,
        'community_name', community_name,
        'type', type,
        'status', status,
        'created_at', created_at
    ) INTO v_result;
    
    -- Retornar o resultado
    RETURN jsonb_build_object(
        'success', true,
        'data', v_result
    );
END;
$$;

-- Função para aprovar uma comunidade
CREATE OR REPLACE FUNCTION approve_community(
    p_community_id UUID,
    p_admin_notes TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id UUID;
    v_is_admin BOOLEAN;
    v_result JSONB;
BEGIN
    -- Obter o ID do usuário atual
    v_user_id := auth.uid();
    
    -- Verificar se o usuário está autenticado
    IF v_user_id IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'User not authenticated'
        );
    END IF;
    
    -- Verificar se o usuário é administrador
    SELECT EXISTS (
        SELECT 1 FROM profiles
        WHERE id = v_user_id AND role = 'admin'
    ) INTO v_is_admin;
    
    IF NOT v_is_admin THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'User is not an administrator'
        );
    END IF;
    
    -- Atualizar o status da comunidade para 'approved'
    UPDATE submitted_communities
    SET 
        status = 'approved',
        admin_notes = p_admin_notes,
        updated_at = NOW()
    WHERE id = p_community_id
    RETURNING jsonb_build_object(
        'id', id,
        'community_name', community_name,
        'type', type,
        'status', status,
        'updated_at', updated_at
    ) INTO v_result;
    
    -- Verificar se a comunidade foi encontrada
    IF v_result IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Community not found'
        );
    END IF;
    
    -- Retornar o resultado
    RETURN jsonb_build_object(
        'success', true,
        'data', v_result
    );
END;
$$;

-- Função para rejeitar uma comunidade
CREATE OR REPLACE FUNCTION reject_community(
    p_community_id UUID,
    p_admin_notes TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id UUID;
    v_is_admin BOOLEAN;
    v_result JSONB;
BEGIN
    -- Obter o ID do usuário atual
    v_user_id := auth.uid();
    
    -- Verificar se o usuário está autenticado
    IF v_user_id IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'User not authenticated'
        );
    END IF;
    
    -- Verificar se o usuário é administrador
    SELECT EXISTS (
        SELECT 1 FROM profiles
        WHERE id = v_user_id AND role = 'admin'
    ) INTO v_is_admin;
    
    IF NOT v_is_admin THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'User is not an administrator'
        );
    END IF;
    
    -- Atualizar o status da comunidade para 'rejected'
    UPDATE submitted_communities
    SET 
        status = 'rejected',
        admin_notes = p_admin_notes,
        updated_at = NOW()
    WHERE id = p_community_id
    RETURNING jsonb_build_object(
        'id', id,
        'community_name', community_name,
        'type', type,
        'status', status,
        'updated_at', updated_at
    ) INTO v_result;
    
    -- Verificar se a comunidade foi encontrada
    IF v_result IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Community not found'
        );
    END IF;
    
    -- Retornar o resultado
    RETURN jsonb_build_object(
        'success', true,
        'data', v_result
    );
END;
$$;

-- Função para remover uma comunidade
CREATE OR REPLACE FUNCTION remove_community(
    p_community_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id UUID;
    v_is_admin BOOLEAN;
    v_result JSONB;
BEGIN
    -- Obter o ID do usuário atual
    v_user_id := auth.uid();
    
    -- Verificar se o usuário está autenticado
    IF v_user_id IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'User not authenticated'
        );
    END IF;
    
    -- Verificar se o usuário é administrador
    SELECT EXISTS (
        SELECT 1 FROM profiles
        WHERE id = v_user_id AND role = 'admin'
    ) INTO v_is_admin;
    
    IF NOT v_is_admin THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'User is not an administrator'
        );
    END IF;
    
    -- Remover a comunidade
    DELETE FROM submitted_communities
    WHERE id = p_community_id
    RETURNING jsonb_build_object(
        'id', id,
        'community_name', community_name,
        'type', type
    ) INTO v_result;
    
    -- Verificar se a comunidade foi encontrada e removida
    IF v_result IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Community not found'
        );
    END IF;
    
    -- Retornar o resultado
    RETURN jsonb_build_object(
        'success', true,
        'data', v_result
    );
END;
$$; 