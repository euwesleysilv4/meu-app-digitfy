-- Script 1: Verificar e criar tabela se necessário
DO $$
BEGIN
  -- Verifica se a tabela tools existe
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'tools') THEN
    -- Verifica se a coluna is_free já existe
    IF NOT EXISTS (
      SELECT FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'tools' 
      AND column_name = 'is_free'
    ) THEN
      -- Adiciona a coluna is_free se ela não existir
      ALTER TABLE tools ADD COLUMN is_free BOOLEAN DEFAULT true;
      RAISE NOTICE 'Coluna is_free adicionada à tabela tools';
    ELSE
      RAISE NOTICE 'Coluna is_free já existe na tabela tools';
    END IF;
    
    -- Verifica se a coluna is_online já existe
    IF NOT EXISTS (
      SELECT FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'tools' 
      AND column_name = 'is_online'
    ) THEN
      -- Adiciona a coluna is_online se ela não existir
      ALTER TABLE tools ADD COLUMN is_online BOOLEAN DEFAULT true;
      RAISE NOTICE 'Coluna is_online adicionada à tabela tools';
    ELSE
      RAISE NOTICE 'Coluna is_online já existe na tabela tools';
    END IF;
  ELSE
    -- Criar tabela para armazenar as ferramentas disponíveis na plataforma
    CREATE TABLE IF NOT EXISTS tools (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      icon TEXT NOT NULL, -- Nome do ícone usado no Lucide React
      path TEXT NOT NULL, -- Caminho da URL para acessar a ferramenta
      color TEXT NOT NULL, -- Cor associada à ferramenta (ex: emerald, blue, purple)
      image_url TEXT, -- URL da imagem de capa para a ferramenta
      status TEXT NOT NULL CHECK (status IN ('published', 'draft', 'scheduled')),
      is_free BOOLEAN DEFAULT true,
      is_online BOOLEAN DEFAULT true,
      last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      created_by UUID REFERENCES auth.users(id),
      view_count INTEGER DEFAULT 0,
      priority INTEGER DEFAULT 0 -- Ordem de exibição na página
    );

    -- Comentários na tabela
    COMMENT ON TABLE tools IS 'Armazena informações sobre as ferramentas disponíveis na plataforma';
    COMMENT ON COLUMN tools.id IS 'ID único da ferramenta';
    COMMENT ON COLUMN tools.title IS 'Título da ferramenta';
    COMMENT ON COLUMN tools.description IS 'Descrição breve da ferramenta';
    COMMENT ON COLUMN tools.icon IS 'Nome do ícone usado do Lucide React';
    COMMENT ON COLUMN tools.path IS 'Caminho da URL para acessar a ferramenta';
    COMMENT ON COLUMN tools.color IS 'Cor associada à ferramenta (ex: emerald, blue, purple)';
    COMMENT ON COLUMN tools.image_url IS 'URL da imagem de capa para a ferramenta';
    COMMENT ON COLUMN tools.status IS 'Status de publicação: published, draft ou scheduled';
    COMMENT ON COLUMN tools.is_free IS 'Indica se a ferramenta é gratuita';
    COMMENT ON COLUMN tools.is_online IS 'Indica se a ferramenta está disponível online';
    COMMENT ON COLUMN tools.last_updated IS 'Data da última atualização da ferramenta';
    COMMENT ON COLUMN tools.created_at IS 'Data de criação do registro';
    COMMENT ON COLUMN tools.updated_at IS 'Data da última atualização do registro';
    COMMENT ON COLUMN tools.created_by IS 'ID do usuário que criou o registro da ferramenta';
    COMMENT ON COLUMN tools.view_count IS 'Contador de visualizações';
    COMMENT ON COLUMN tools.priority IS 'Ordem de exibição na página (quanto menor, mais alta a prioridade)';

    RAISE NOTICE 'Tabela tools criada com sucesso';
  END IF;
END $$;

-- Script 2: Adicionar políticas e índices
DO $$
BEGIN
  -- Políticas RLS (Row Level Security)
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'tools' 
    AND policyname = 'Qualquer pessoa pode visualizar ferramentas publicadas'
  ) THEN
    -- Verifica se RLS está habilitado
    IF NOT EXISTS (
      SELECT 1 FROM pg_tables 
      WHERE tablename = 'tools' 
      AND rowsecurity = true
    ) THEN
      ALTER TABLE tools ENABLE ROW LEVEL SECURITY;
    END IF;

    -- Políticas para leitura
    CREATE POLICY "Qualquer pessoa pode visualizar ferramentas publicadas" 
    ON tools FOR SELECT 
    USING (status = 'published');

    -- Políticas para administradores (usando a tabela de perfis)
    CREATE POLICY "Administradores podem fazer qualquer operação nas ferramentas" 
    ON tools 
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
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_tools_status') THEN
    CREATE INDEX idx_tools_status ON tools(status);
    CREATE INDEX idx_tools_path ON tools(path);
    CREATE INDEX idx_tools_is_free ON tools(is_free);
    CREATE INDEX idx_tools_priority ON tools(priority);
    CREATE INDEX idx_tools_created_at ON tools(created_at);
    CREATE INDEX idx_tools_created_by ON tools(created_by);
    
    RAISE NOTICE 'Índices adicionados com sucesso';
  ELSE
    RAISE NOTICE 'Índices já existem';
  END IF;
END $$;

-- Criar a função update_tools_updated_at fora do bloco DO
CREATE OR REPLACE FUNCTION update_tools_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar a função increment_tool_view_count fora do bloco DO
CREATE OR REPLACE FUNCTION increment_tool_view_count(tool_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE tools
  SET view_count = view_count + 1
  WHERE id = tool_id;
END;
$$ LANGUAGE plpgsql;

-- Script 3: Adicionar trigger usando função já criada
DO $$
BEGIN
  -- Verificar se o trigger já existe
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'trigger_update_tools_updated_at'
  ) THEN
    CREATE TRIGGER trigger_update_tools_updated_at
    BEFORE UPDATE ON tools
    FOR EACH ROW
    EXECUTE FUNCTION update_tools_updated_at();
    
    RAISE NOTICE 'Trigger adicionado com sucesso';
  ELSE
    RAISE NOTICE 'Trigger já existe';
  END IF;
  
  RAISE NOTICE 'Funções e triggers configurados com sucesso';
END $$;

-- Script 4: Inserir dados de exemplo
DO $$
DECLARE
  tool_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO tool_count FROM tools;
  
  IF tool_count = 0 THEN
    -- Inserir dados das ferramentas pré-existentes
    INSERT INTO tools (id, title, description, icon, path, color, image_url, status, is_free, is_online, last_updated, priority)
    VALUES
      -- Ferramenta 1: Trend Rush
      (
        'ca8c3428-69b7-4e16-9c39-40f8bfcb63a8', 
        'Trend Rush', 
        'Descubra as tendências do momento', 
        'Music', 
        '/tools/trend-rush', 
        'violet', 
        'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=300', 
        'published', 
        true, 
        true, 
        NOW(), 
        1
      ),
      
      -- Ferramenta 2: Comparador de Plataformas
      (
        '3b9a3e68-dec1-4e9c-b196-19f945e25078', 
        'Comparador de Plataformas', 
        'Compare comissões e recursos entre plataformas', 
        'Scale', 
        '/tools/commission-calculator', 
        'emerald', 
        'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=300', 
        'published', 
        true, 
        true, 
        NOW(), 
        2
      ),
      
      -- Ferramenta 3: Jogos Digitais
      (
        'f72e3c57-08a3-4ef2-b175-3e2c9d744428', 
        'Jogos Digitais', 
        'Jogos educativos para impulsionar seu marketing', 
        'Gamepad', 
        '/tools/digital-games', 
        'blue', 
        'https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?auto=format&fit=crop&q=80&w=300', 
        'published', 
        false, 
        true, 
        NOW(), 
        3
      ),
      
      -- Ferramenta 4: Gerador de Storytelling
      (
        'ed5dcd06-7a38-49b5-a096-a12b4dce3baf', 
        'Gerador de Storytelling', 
        'Crie histórias envolventes para suas campanhas', 
        'BookOpen', 
        '/tools/storytelling-generator', 
        'teal', 
        'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&q=80&w=300', 
        'published', 
        false, 
        true, 
        NOW(), 
        4
      ),
      
      -- Ferramenta 5: Simulador de Notificações
      (
        '7d827851-a527-4e6e-a042-cb50b1c63a8f', 
        'Simulador de Notificações', 
        'Simule e teste diferentes estilos de notificações', 
        'Bell', 
        '/tools/notification-simulator', 
        'indigo', 
        'https://images.unsplash.com/photo-1481349518771-20055b2a7b24?auto=format&fit=crop&q=80&w=300', 
        'published', 
        true, 
        true, 
        NOW(), 
        5
      ),
      
      -- Ferramenta 6: Sites Úteis
      (
        'a9ad5bd1-63c3-45ef-9a8d-f9b13287436d', 
        'Sites Úteis', 
        'Coleção de sites e ferramentas para marketing digital', 
        'Globe', 
        '/tools/useful-sites', 
        'cyan', 
        'https://images.unsplash.com/photo-1520085601670-ee14aa5fa3e8?auto=format&fit=crop&q=80&w=300', 
        'published', 
        true, 
        true, 
        NOW(), 
        6
      ),
      
      -- Ferramenta 7: Gerador de Order Bump
      (
        'b1b40c4d-f9f3-4e9b-8515-e4ea587b917c', 
        'Gerador de Order Bump', 
        'Crie ofertas irresistíveis para aumentar o valor médio de pedido', 
        'ShoppingCart', 
        '/tools/order-bump-generator', 
        'purple', 
        'https://images.unsplash.com/photo-1607083206968-13611e3d76db?auto=format&fit=crop&q=80&w=300', 
        'published', 
        false, 
        true, 
        NOW(), 
        7
      ),
      
      -- Ferramenta 8: Criativos Personalizados
      (
        'c4d2f9ae-6dcb-42fa-8c4e-abe459ce7c5f', 
        'Criativos Personalizados', 
        'Crie layouts e designs para suas campanhas', 
        'PenTool', 
        '/tools/custom-creatives', 
        'fuchsia', 
        'https://images.unsplash.com/photo-1475669698648-2f144fcaaeb1?auto=format&fit=crop&q=80&w=300', 
        'published', 
        false, 
        true, 
        NOW(), 
        8
      ),
      
      -- Ferramenta 9: Funil LTV
      (
        'd3e4f569-c7c8-49e2-9d8b-1ab4c82ffa85', 
        'Funil LTV', 
        'Calcule e otimize o valor vitalício do cliente', 
        'User', 
        '/tools/ltv-funnel', 
        'rose', 
        'https://images.unsplash.com/photo-1553729459-efe14ef6055d?auto=format&fit=crop&q=80&w=300', 
        'published', 
        false, 
        true, 
        NOW(), 
        9
      );
    
    RAISE NOTICE 'Dados das ferramentas inseridos com sucesso.';
  ELSE
    RAISE NOTICE 'A tabela tools já contém % registros. Nenhum dado inserido.', tool_count;
  END IF;
  
  RAISE NOTICE 'Total de ferramentas disponíveis: %', (SELECT COUNT(*) FROM tools);
END $$; 