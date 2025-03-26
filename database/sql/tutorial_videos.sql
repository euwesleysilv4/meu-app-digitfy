-- Arquivo: tutorial_videos.sql
-- Este arquivo cria uma tabela para gerenciar os vídeos tutoriais exibidos na página inicial

-- Criar um tipo de enumeração para as categorias de vídeos
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tutorial_video_category') THEN
        CREATE TYPE tutorial_video_category AS ENUM (
            'introducao',        -- Introdução à DigitFy
            'planos_premium',    -- Benefícios dos Planos Premium
            'ferramentas'        -- Ferramentas Avançadas
        );
    END IF;
END $$;

-- Criar a tabela tutorial_videos se ela não existir
CREATE TABLE IF NOT EXISTS tutorial_videos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    titulo VARCHAR(100) NOT NULL,
    descricao VARCHAR(255) NOT NULL,
    youtube_id VARCHAR(20) NOT NULL,
    categoria tutorial_video_category NOT NULL,
    ordem INT NOT NULL,
    ativo BOOLEAN NOT NULL DEFAULT true,
    data_criacao TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    data_modificacao TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    criado_por UUID REFERENCES auth.users(id),
    modificado_por UUID REFERENCES auth.users(id)
);

-- Índices para otimizar consultas
CREATE INDEX IF NOT EXISTS tutorial_videos_categoria_idx ON tutorial_videos(categoria);
CREATE INDEX IF NOT EXISTS tutorial_videos_ordem_idx ON tutorial_videos(ordem);
CREATE INDEX IF NOT EXISTS tutorial_videos_ativo_idx ON tutorial_videos(ativo);

-- Comentários nas colunas para documentação
COMMENT ON TABLE tutorial_videos IS 'Tabela que armazena informações sobre os vídeos tutoriais exibidos na página inicial';
COMMENT ON COLUMN tutorial_videos.id IS 'Identificador único do vídeo';
COMMENT ON COLUMN tutorial_videos.titulo IS 'Título do vídeo';
COMMENT ON COLUMN tutorial_videos.descricao IS 'Breve descrição do conteúdo do vídeo';
COMMENT ON COLUMN tutorial_videos.youtube_id IS 'ID do vídeo no YouTube (a parte final da URL)';
COMMENT ON COLUMN tutorial_videos.categoria IS 'Categoria do vídeo (introducao, planos_premium, ferramentas)';
COMMENT ON COLUMN tutorial_videos.ordem IS 'Ordem de exibição dentro da categoria';
COMMENT ON COLUMN tutorial_videos.ativo IS 'Indica se o vídeo está ativo e deve ser exibido';
COMMENT ON COLUMN tutorial_videos.data_criacao IS 'Data e hora de criação do registro';
COMMENT ON COLUMN tutorial_videos.data_modificacao IS 'Data e hora da última modificação do registro';
COMMENT ON COLUMN tutorial_videos.criado_por IS 'ID do usuário que criou o registro';
COMMENT ON COLUMN tutorial_videos.modificado_por IS 'ID do usuário que modificou o registro pela última vez';

-- Função para atualizar automaticamente o campo data_modificacao
CREATE OR REPLACE FUNCTION update_tutorial_videos_modificacao()
RETURNS TRIGGER AS $$
BEGIN
    NEW.data_modificacao = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar o campo data_modificacao
DROP TRIGGER IF EXISTS update_tutorial_videos_modificacao_trigger ON tutorial_videos;
CREATE TRIGGER update_tutorial_videos_modificacao_trigger
BEFORE UPDATE ON tutorial_videos
FOR EACH ROW
EXECUTE FUNCTION update_tutorial_videos_modificacao();

-- Políticas de segurança (RLS - Row Level Security)
ALTER TABLE tutorial_videos ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso
DROP POLICY IF EXISTS "Qualquer usuário pode visualizar vídeos ativos" ON tutorial_videos;
CREATE POLICY "Qualquer usuário pode visualizar vídeos ativos"
ON tutorial_videos FOR SELECT
USING (ativo = true);

-- Apenas administradores podem gerenciar os vídeos tutoriais
DROP POLICY IF EXISTS "Administradores podem gerenciar vídeos" ON tutorial_videos;
CREATE POLICY "Administradores podem gerenciar vídeos"
ON tutorial_videos
USING (
    (SELECT is_specific_admin())
);

-- Criar função para obter vídeos por categoria
CREATE OR REPLACE FUNCTION get_tutorial_videos_by_category(categoria_param tutorial_video_category)
RETURNS SETOF tutorial_videos
LANGUAGE sql
SECURITY DEFINER
AS $$
    SELECT * FROM tutorial_videos
    WHERE categoria = categoria_param AND ativo = true
    ORDER BY ordem ASC;
$$;

-- Criar função para obter todos os vídeos tutoriais ativos
CREATE OR REPLACE FUNCTION get_all_tutorial_videos()
RETURNS SETOF tutorial_videos
LANGUAGE sql
SECURITY DEFINER
AS $$
    SELECT * FROM tutorial_videos
    WHERE ativo = true
    ORDER BY categoria, ordem ASC;
$$;

-- Função para administradores adicionarem um novo vídeo tutorial
CREATE OR REPLACE FUNCTION add_tutorial_video(
    titulo_param VARCHAR(100),
    descricao_param VARCHAR(255),
    youtube_id_param VARCHAR(20),
    categoria_param tutorial_video_category,
    ordem_param INT DEFAULT 0
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
        RAISE EXCEPTION 'Permissão negada: Apenas administradores podem adicionar vídeos tutoriais';
        RETURN NULL;
    END IF;
    
    -- Inserir o novo vídeo
    INSERT INTO tutorial_videos(
        titulo,
        descricao,
        youtube_id,
        categoria,
        ordem,
        criado_por,
        modificado_por
    )
    VALUES (
        titulo_param,
        descricao_param,
        youtube_id_param,
        categoria_param,
        ordem_param,
        auth.uid(),
        auth.uid()
    )
    RETURNING id INTO novo_id;
    
    RETURN novo_id;
END;
$$;

-- Função para administradores atualizarem um vídeo tutorial existente
CREATE OR REPLACE FUNCTION update_tutorial_video(
    video_id UUID,
    titulo_param VARCHAR(100),
    descricao_param VARCHAR(255),
    youtube_id_param VARCHAR(20),
    categoria_param tutorial_video_category,
    ordem_param INT,
    ativo_param BOOLEAN
)
RETURNS BOOLEAN
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
BEGIN
    -- Verificar se o usuário é administrador
    IF NOT (SELECT is_specific_admin()) THEN
        RAISE EXCEPTION 'Permissão negada: Apenas administradores podem atualizar vídeos tutoriais';
        RETURN FALSE;
    END IF;
    
    -- Atualizar o vídeo
    UPDATE tutorial_videos
    SET 
        titulo = titulo_param,
        descricao = descricao_param,
        youtube_id = youtube_id_param,
        categoria = categoria_param,
        ordem = ordem_param,
        ativo = ativo_param,
        modificado_por = auth.uid()
    WHERE id = video_id;
    
    RETURN FOUND;
END;
$$;

-- Função para administradores removerem um vídeo tutorial
CREATE OR REPLACE FUNCTION delete_tutorial_video(
    video_id UUID
)
RETURNS BOOLEAN
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
BEGIN
    -- Verificar se o usuário é administrador
    IF NOT (SELECT is_specific_admin()) THEN
        RAISE EXCEPTION 'Permissão negada: Apenas administradores podem remover vídeos tutoriais';
        RETURN FALSE;
    END IF;
    
    -- Remover o vídeo
    DELETE FROM tutorial_videos
    WHERE id = video_id;
    
    RETURN FOUND;
END;
$$;

-- Inserir dados iniciais (exemplos de vídeos tutoriais)
INSERT INTO tutorial_videos (
    titulo,
    descricao,
    youtube_id,
    categoria,
    ordem,
    criado_por,
    modificado_por
)
VALUES
    -- Categoria: Introdução à DigitFy
    (
        'Introdução à Plataforma DigitFy',
        'Aprenda o básico sobre nossa plataforma e como começar a utilizar todos os recursos',
        'dQw4w9WgXcQ',
        'introducao',
        1,
        (SELECT id FROM profiles WHERE email = 'wexxxleycomercial@gmail.com' LIMIT 1),
        (SELECT id FROM profiles WHERE email = 'wexxxleycomercial@gmail.com' LIMIT 1)
    ),
    (
        'Como criar sua primeira campanha',
        'Um guia passo a passo para criar e configurar sua primeira campanha de sucesso',
        'dQw4w9WgXcQ',
        'introducao',
        2,
        (SELECT id FROM profiles WHERE email = 'wexxxleycomercial@gmail.com' LIMIT 1),
        (SELECT id FROM profiles WHERE email = 'wexxxleycomercial@gmail.com' LIMIT 1)
    ),
    
    -- Categoria: Benefícios dos Planos Premium
    (
        'Conheça os Planos Premium',
        'Conheça as vantagens exclusivas de cada nível de assinatura',
        'dQw4w9WgXcQ',
        'planos_premium',
        1,
        (SELECT id FROM profiles WHERE email = 'wexxxleycomercial@gmail.com' LIMIT 1),
        (SELECT id FROM profiles WHERE email = 'wexxxleycomercial@gmail.com' LIMIT 1)
    ),
    (
        'Maximizando o Plano Elite',
        'Como aproveitar todos os recursos do plano Elite para alavancar seus resultados',
        'dQw4w9WgXcQ',
        'planos_premium',
        2,
        (SELECT id FROM profiles WHERE email = 'wexxxleycomercial@gmail.com' LIMIT 1),
        (SELECT id FROM profiles WHERE email = 'wexxxleycomercial@gmail.com' LIMIT 1)
    ),
    
    -- Categoria: Ferramentas Avançadas
    (
        'Ferramentas Avançadas de Marketing',
        'Domine as funcionalidades premium da plataforma para otimizar seus resultados',
        'dQw4w9WgXcQ',
        'ferramentas',
        1,
        (SELECT id FROM profiles WHERE email = 'wexxxleycomercial@gmail.com' LIMIT 1),
        (SELECT id FROM profiles WHERE email = 'wexxxleycomercial@gmail.com' LIMIT 1)
    ),
    (
        'Análise de Dados e Métricas',
        'Aprenda a interpretar os dados e métricas para tomar decisões mais estratégicas',
        'dQw4w9WgXcQ',
        'ferramentas',
        2,
        (SELECT id FROM profiles WHERE email = 'wexxxleycomercial@gmail.com' LIMIT 1),
        (SELECT id FROM profiles WHERE email = 'wexxxleycomercial@gmail.com' LIMIT 1)
    )
ON CONFLICT (id) DO NOTHING; 