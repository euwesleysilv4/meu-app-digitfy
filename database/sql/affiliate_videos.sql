-- Arquivo: affiliate_videos.sql
-- Este arquivo cria uma tabela para gerenciar os vídeos tutoriais relacionados a afiliados

-- Criar a tabela affiliate_videos se ela não existir
CREATE TABLE IF NOT EXISTS affiliate_videos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    titulo VARCHAR(100) NOT NULL,
    descricao VARCHAR(255) NOT NULL,
    youtube_id VARCHAR(20) NOT NULL,
    ativo BOOLEAN NOT NULL DEFAULT true,
    data_criacao TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    data_modificacao TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    criado_por UUID REFERENCES auth.users(id),
    modificado_por UUID REFERENCES auth.users(id)
);

-- Índices para otimizar consultas
CREATE INDEX IF NOT EXISTS affiliate_videos_ativo_idx ON affiliate_videos(ativo);

-- Comentários nas colunas para documentação
COMMENT ON TABLE affiliate_videos IS 'Tabela que armazena informações sobre os vídeos tutoriais de afiliados';
COMMENT ON COLUMN affiliate_videos.id IS 'Identificador único do vídeo';
COMMENT ON COLUMN affiliate_videos.titulo IS 'Título do vídeo';
COMMENT ON COLUMN affiliate_videos.descricao IS 'Breve descrição do conteúdo do vídeo';
COMMENT ON COLUMN affiliate_videos.youtube_id IS 'ID do vídeo no YouTube (a parte final da URL)';
COMMENT ON COLUMN affiliate_videos.ativo IS 'Indica se o vídeo está ativo e deve ser exibido';
COMMENT ON COLUMN affiliate_videos.data_criacao IS 'Data e hora de criação do registro';
COMMENT ON COLUMN affiliate_videos.data_modificacao IS 'Data e hora da última modificação do registro';
COMMENT ON COLUMN affiliate_videos.criado_por IS 'ID do usuário que criou o registro';
COMMENT ON COLUMN affiliate_videos.modificado_por IS 'ID do usuário que modificou o registro pela última vez';

-- Função para atualizar automaticamente o campo data_modificacao
CREATE OR REPLACE FUNCTION update_affiliate_videos_modificacao()
RETURNS TRIGGER AS $$
BEGIN
    NEW.data_modificacao = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar o campo data_modificacao
DROP TRIGGER IF EXISTS update_affiliate_videos_modificacao_trigger ON affiliate_videos;
CREATE TRIGGER update_affiliate_videos_modificacao_trigger
BEFORE UPDATE ON affiliate_videos
FOR EACH ROW
EXECUTE FUNCTION update_affiliate_videos_modificacao();

-- Políticas de segurança (RLS - Row Level Security)
ALTER TABLE affiliate_videos ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso
DROP POLICY IF EXISTS "Qualquer usuário pode visualizar vídeos de afiliados ativos" ON affiliate_videos;
CREATE POLICY "Qualquer usuário pode visualizar vídeos de afiliados ativos"
ON affiliate_videos FOR SELECT
USING (ativo = true);

-- Apenas administradores podem gerenciar os vídeos de afiliados
DROP POLICY IF EXISTS "Administradores podem gerenciar vídeos de afiliados" ON affiliate_videos;
CREATE POLICY "Administradores podem gerenciar vídeos de afiliados"
ON affiliate_videos
USING (
    (SELECT is_specific_admin())
);

-- Criar função para obter todos os vídeos de afiliados ativos
CREATE OR REPLACE FUNCTION get_active_affiliate_video()
RETURNS SETOF affiliate_videos
LANGUAGE sql
SECURITY DEFINER
AS $$
    SELECT * FROM affiliate_videos
    WHERE ativo = true
    ORDER BY data_modificacao DESC
    LIMIT 1;
$$;

-- Função para administradores adicionarem um novo vídeo de afiliado
CREATE OR REPLACE FUNCTION add_affiliate_video(
    titulo_param VARCHAR(100),
    descricao_param VARCHAR(255),
    youtube_id_param VARCHAR(20)
)
RETURNS UUID
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
DECLARE
    novo_id UUID;
BEGIN
    -- Verificar se o usuário é administrador
    IF NOT (SELECT is_specific_admin()) THEN
        RAISE EXCEPTION 'Permissão negada: Apenas administradores podem adicionar vídeos de afiliados';
        RETURN NULL;
    END IF;
    
    -- Inserir o novo vídeo
    INSERT INTO affiliate_videos(
        titulo,
        descricao,
        youtube_id,
        criado_por,
        modificado_por
    )
    VALUES (
        titulo_param,
        descricao_param,
        youtube_id_param,
        auth.uid(),
        auth.uid()
    )
    RETURNING id INTO novo_id;
    
    RETURN novo_id;
END;
$$;

-- Função para administradores atualizarem um vídeo de afiliado existente
CREATE OR REPLACE FUNCTION update_affiliate_video(
    video_id UUID,
    titulo_param VARCHAR(100),
    descricao_param VARCHAR(255),
    youtube_id_param VARCHAR(20),
    ativo_param BOOLEAN
)
RETURNS BOOLEAN
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
BEGIN
    -- Verificar se o usuário é administrador
    IF NOT (SELECT is_specific_admin()) THEN
        RAISE EXCEPTION 'Permissão negada: Apenas administradores podem atualizar vídeos de afiliados';
        RETURN FALSE;
    END IF;
    
    -- Atualizar o vídeo
    UPDATE affiliate_videos
    SET 
        titulo = titulo_param,
        descricao = descricao_param,
        youtube_id = youtube_id_param,
        ativo = ativo_param,
        modificado_por = auth.uid()
    WHERE id = video_id;
    
    RETURN FOUND;
END;
$$;

-- Função para administradores removerem um vídeo de afiliado
CREATE OR REPLACE FUNCTION delete_affiliate_video(
    video_id UUID
)
RETURNS BOOLEAN
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
BEGIN
    -- Verificar se o usuário é administrador
    IF NOT (SELECT is_specific_admin()) THEN
        RAISE EXCEPTION 'Permissão negada: Apenas administradores podem remover vídeos de afiliados';
        RETURN FALSE;
    END IF;
    
    -- Remover o vídeo
    DELETE FROM affiliate_videos
    WHERE id = video_id;
    
    RETURN FOUND;
END;
$$;

-- Inserir um vídeo inicial de exemplo para afiliados
INSERT INTO affiliate_videos (
    titulo,
    descricao,
    youtube_id,
    criado_por,
    modificado_por
)
VALUES
(
    'Como divulgar seu link de afiliado',
    'Tutorial completo sobre como promover seu link de afiliado e maximizar seus ganhos',
    'SEU-VIDEO-ID',
    (SELECT id FROM profiles WHERE email = 'wexxxleycomercial@gmail.com' LIMIT 1),
    (SELECT id FROM profiles WHERE email = 'wexxxleycomercial@gmail.com' LIMIT 1)
)
ON CONFLICT DO NOTHING; 