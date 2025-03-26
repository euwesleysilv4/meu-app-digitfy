-- Create a table for storing Trend Rush audio links
CREATE TABLE IF NOT EXISTS trend_rush (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  audio_url TEXT NOT NULL,
  image_url TEXT,
  status TEXT NOT NULL CHECK (status IN ('published', 'draft', 'archived')) DEFAULT 'draft',
  platform TEXT NOT NULL CHECK (platform IN ('tiktok', 'instagram', 'both')) DEFAULT 'both',
  artist TEXT,
  tags TEXT[],
  is_featured BOOLEAN DEFAULT false,
  view_count INTEGER DEFAULT 0,
  priority INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Add indexes for better performance
DO $$
BEGIN
  -- Políticas RLS (Row Level Security)
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'trend_rush' 
    AND policyname = 'Qualquer pessoa pode visualizar trend_rush publicados'
  ) THEN
    -- Verifica se RLS está habilitado
    IF NOT EXISTS (
      SELECT 1 FROM pg_tables 
      WHERE tablename = 'trend_rush' 
      AND rowsecurity = true
    ) THEN
      ALTER TABLE trend_rush ENABLE ROW LEVEL SECURITY;
    END IF;

    -- Políticas para leitura
    CREATE POLICY "Qualquer pessoa pode visualizar trend_rush publicados" 
    ON trend_rush FOR SELECT 
    USING (status = 'published');

    -- Políticas para administradores (usando a tabela de perfis)
    CREATE POLICY "Administradores podem fazer qualquer operação no trend_rush" 
    ON trend_rush 
    FOR ALL 
    USING (
      EXISTS (
        SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
      )
    );
    
    RAISE NOTICE 'Políticas RLS adicionadas com sucesso';
  ELSE
    RAISE NOTICE 'Políticas RLS já existem';
  END IF;

  -- Índices para melhor performance
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_trend_rush_status') THEN
    CREATE INDEX idx_trend_rush_status ON trend_rush(status);
    CREATE INDEX idx_trend_rush_platform ON trend_rush(platform);
    CREATE INDEX idx_trend_rush_is_featured ON trend_rush(is_featured);
    CREATE INDEX idx_trend_rush_priority ON trend_rush(priority);
    CREATE INDEX idx_trend_rush_created_at ON trend_rush(created_at);
    CREATE INDEX idx_trend_rush_created_by ON trend_rush(created_by);
    
    RAISE NOTICE 'Índices adicionados com sucesso';
  ELSE
    RAISE NOTICE 'Índices já existem';
  END IF;
END $$;

-- Create trigger to automatically update updated_at
CREATE OR REPLACE FUNCTION update_trend_rush_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at on record modification
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'trigger_update_trend_rush_timestamp'
  ) THEN
    CREATE TRIGGER trigger_update_trend_rush_timestamp
    BEFORE UPDATE ON trend_rush
    FOR EACH ROW
    EXECUTE FUNCTION update_trend_rush_updated_at();
    
    RAISE NOTICE 'Trigger de atualização de timestamp criado com sucesso';
  ELSE
    RAISE NOTICE 'Trigger de atualização de timestamp já existe';
  END IF;
END $$;

-- Create function to increment view count
CREATE OR REPLACE FUNCTION increment_trend_rush_view_count(trend_rush_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE trend_rush
  SET view_count = view_count + 1
  WHERE id = trend_rush_id;
END;
$$ LANGUAGE plpgsql;

-- Comments for better documentation
COMMENT ON TABLE trend_rush IS 'Armazena os links de áudio para a lista do Trend Rush';
COMMENT ON COLUMN trend_rush.id IS 'Identificador único do áudio';
COMMENT ON COLUMN trend_rush.title IS 'Título do áudio';
COMMENT ON COLUMN trend_rush.description IS 'Descrição opcional do áudio';
COMMENT ON COLUMN trend_rush.audio_url IS 'URL para o arquivo de áudio';
COMMENT ON COLUMN trend_rush.image_url IS 'URL opcional para uma imagem de capa';
COMMENT ON COLUMN trend_rush.status IS 'Status do áudio: publicado, rascunho ou arquivado';
COMMENT ON COLUMN trend_rush.platform IS 'Plataforma para qual o áudio é destinado';
COMMENT ON COLUMN trend_rush.artist IS 'Nome do artista ou criador do áudio';
COMMENT ON COLUMN trend_rush.tags IS 'Tags para categorizar o áudio';
COMMENT ON COLUMN trend_rush.is_featured IS 'Indica se o áudio deve ser destacado';
COMMENT ON COLUMN trend_rush.view_count IS 'Contador de visualizações';
COMMENT ON COLUMN trend_rush.priority IS 'Prioridade para ordenação na lista';
COMMENT ON COLUMN trend_rush.created_at IS 'Data e hora de criação';
COMMENT ON COLUMN trend_rush.updated_at IS 'Data e hora da última atualização';
COMMENT ON COLUMN trend_rush.created_by IS 'Usuário que criou o registro'; 