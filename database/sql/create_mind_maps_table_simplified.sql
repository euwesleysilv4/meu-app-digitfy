-- Criar tabela para armazenar os mapas mentais
CREATE TABLE IF NOT EXISTS mind_maps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT,
  file_url TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('published', 'draft', 'scheduled')),
  instagram TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0
);

-- Comentários na tabela
COMMENT ON TABLE mind_maps IS 'Armazena os mapas mentais que podem ser publicados no site';
COMMENT ON COLUMN mind_maps.id IS 'ID único do mapa mental';
COMMENT ON COLUMN mind_maps.title IS 'Título do mapa mental';
COMMENT ON COLUMN mind_maps.description IS 'Descrição do mapa mental';
COMMENT ON COLUMN mind_maps.image_url IS 'URL da imagem de capa do mapa mental';
COMMENT ON COLUMN mind_maps.file_url IS 'URL para download do arquivo do mapa mental';
COMMENT ON COLUMN mind_maps.status IS 'Status de publicação: published, draft ou scheduled';
COMMENT ON COLUMN mind_maps.instagram IS 'Conta do Instagram do criador (opcional)';
COMMENT ON COLUMN mind_maps.created_at IS 'Data de criação do registro';
COMMENT ON COLUMN mind_maps.updated_at IS 'Data da última atualização do registro';
COMMENT ON COLUMN mind_maps.created_by IS 'ID do usuário que criou o mapa mental';
COMMENT ON COLUMN mind_maps.view_count IS 'Contador de visualizações';
COMMENT ON COLUMN mind_maps.like_count IS 'Contador de curtidas';

-- Políticas RLS (Row Level Security)
ALTER TABLE mind_maps ENABLE ROW LEVEL SECURITY;

-- Políticas para leitura
CREATE POLICY "Qualquer pessoa pode visualizar mapas mentais publicados" 
ON mind_maps FOR SELECT 
USING (status = 'published');

-- Política para permitir que o criador do mapa mental edite seu próprio conteúdo
CREATE POLICY "Usuários podem editar seus próprios mapas mentais" 
ON mind_maps
FOR UPDATE 
USING (auth.uid() = created_by);

-- Política para permitir que o criador do mapa mental exclua seu próprio conteúdo
CREATE POLICY "Usuários podem excluir seus próprios mapas mentais" 
ON mind_maps
FOR DELETE 
USING (auth.uid() = created_by);

-- Política para permitir que qualquer usuário autenticado insira novos mapas mentais
CREATE POLICY "Usuários autenticados podem inserir mapas mentais" 
ON mind_maps
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

-- Índices para melhor performance
CREATE INDEX idx_mind_maps_status ON mind_maps(status);
CREATE INDEX idx_mind_maps_created_at ON mind_maps(created_at);
CREATE INDEX idx_mind_maps_created_by ON mind_maps(created_by);

-- Trigger para atualizar o updated_at automaticamente
CREATE OR REPLACE FUNCTION update_mind_maps_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_mind_maps_updated_at
BEFORE UPDATE ON mind_maps
FOR EACH ROW
EXECUTE FUNCTION update_mind_maps_updated_at(); 