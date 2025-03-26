-- Criar tabela para armazenar as estratégias de vendas
CREATE TABLE IF NOT EXISTS sales_strategies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  status TEXT NOT NULL CHECK (status IN ('published', 'draft', 'scheduled')),
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0
);

-- Comentários na tabela
COMMENT ON TABLE sales_strategies IS 'Armazena estratégias de vendas que podem ser publicadas no site';
COMMENT ON COLUMN sales_strategies.id IS 'ID único da estratégia de venda';
COMMENT ON COLUMN sales_strategies.title IS 'Título da estratégia de venda';
COMMENT ON COLUMN sales_strategies.description IS 'Descrição breve da estratégia de venda';
COMMENT ON COLUMN sales_strategies.content IS 'Conteúdo completo da estratégia de venda em formato HTML';
COMMENT ON COLUMN sales_strategies.image_url IS 'URL da imagem de capa para a estratégia de venda';
COMMENT ON COLUMN sales_strategies.status IS 'Status de publicação: published, draft ou scheduled';
COMMENT ON COLUMN sales_strategies.category IS 'Categoria da estratégia de venda (ex: consultiva, valor)';
COMMENT ON COLUMN sales_strategies.created_at IS 'Data de criação do registro';
COMMENT ON COLUMN sales_strategies.updated_at IS 'Data da última atualização do registro';
COMMENT ON COLUMN sales_strategies.created_by IS 'ID do usuário que criou a estratégia de venda';
COMMENT ON COLUMN sales_strategies.view_count IS 'Contador de visualizações';
COMMENT ON COLUMN sales_strategies.like_count IS 'Contador de curtidas';

-- Políticas RLS (Row Level Security)
ALTER TABLE sales_strategies ENABLE ROW LEVEL SECURITY;

-- Políticas para leitura
CREATE POLICY "Qualquer pessoa pode visualizar estratégias de vendas publicadas" 
ON sales_strategies FOR SELECT 
USING (status = 'published');

-- Políticas para administradores (usando a tabela de perfis)
CREATE POLICY "Administradores podem fazer qualquer operação nas estratégias de vendas" 
ON sales_strategies 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Índices para melhor performance
CREATE INDEX idx_sales_strategies_status ON sales_strategies(status);
CREATE INDEX idx_sales_strategies_category ON sales_strategies(category);
CREATE INDEX idx_sales_strategies_created_at ON sales_strategies(created_at);
CREATE INDEX idx_sales_strategies_created_by ON sales_strategies(created_by);

-- Trigger para atualizar o updated_at automaticamente
CREATE OR REPLACE FUNCTION update_sales_strategies_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_sales_strategies_updated_at
BEFORE UPDATE ON sales_strategies
FOR EACH ROW
EXECUTE FUNCTION update_sales_strategies_updated_at(); 