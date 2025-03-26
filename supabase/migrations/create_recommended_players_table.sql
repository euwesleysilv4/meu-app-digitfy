-- Script para criação da tabela de players recomendados no Supabase
-- Esta tabela armazenará os influenciadores que recomendam a plataforma

-- Tabela principal para players recomendados
CREATE TABLE IF NOT EXISTS public.recommended_players (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  username TEXT NOT NULL, -- @ do instagram ou outra rede social
  image_url TEXT NOT NULL, -- URL da imagem do player
  category TEXT NOT NULL, -- Categoria ou especialidade do player
  description TEXT, -- Descrição opcional do player
  order_index INTEGER DEFAULT 0, -- Ordem de exibição no carrossel
  active BOOLEAN DEFAULT TRUE, -- Se o player está ativo para exibição
  featured BOOLEAN DEFAULT FALSE, -- Se o player deve ser destacado
  social_url TEXT, -- URL do perfil nas redes sociais
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar Row Level Security
ALTER TABLE public.recommended_players ENABLE ROW LEVEL SECURITY;

-- Política para permitir leitura pública
CREATE POLICY "Players recomendados visíveis para todos"
ON public.recommended_players
FOR SELECT
USING (active = TRUE);

-- Política para permitir que apenas administradores gerenciem os players
CREATE POLICY "Apenas administradores podem gerenciar players recomendados"
ON public.recommended_players
FOR ALL
USING (
  auth.uid() IN (
    SELECT id FROM profiles WHERE role = 'admin'
  )
);

-- Trigger para atualizar o campo updated_at automaticamente
CREATE OR REPLACE FUNCTION update_recommended_players_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_timestamp_recommended_players
BEFORE UPDATE ON public.recommended_players
FOR EACH ROW
EXECUTE FUNCTION update_recommended_players_timestamp();

-- Inserir alguns players iniciais como exemplo
INSERT INTO public.recommended_players (name, username, image_url, category, description, order_index, featured)
VALUES 
('Thomas Macedo', '@thomasmacedo', 'https://i.pravatar.cc/800?img=2', 'Marketing Digital', 'Especialista em Marketing Digital', 1, true),
('Carlos Mendes', '@carlosmendes', 'https://i.pravatar.cc/800?img=3', 'Marketing de Conteúdo', 'Especialista em Marketing de Conteúdo', 2, false),
('Ana Silva', '@ana_digital', 'https://i.pravatar.cc/800?img=4', 'Mídia Social', 'Especialista em Mídia Social', 3, false),
('Ricardo Alves', '@ricardoalves', 'https://i.pravatar.cc/800?img=5', 'SEO', 'Especialista em Otimização para Motores de Busca', 4, false),
('Juliana Costa', '@juliana_costa', 'https://i.pravatar.cc/800?img=6', 'Tráfego Pago', 'Especialista em Tráfego Pago', 5, true),
('Marcos Oliveira', '@marcos_digital', 'https://i.pravatar.cc/800?img=7', 'Performance', 'Especialista em Marketing de Performance', 6, false),
('Beatriz Lima', '@bea_digital', 'https://i.pravatar.cc/800?img=9', 'Digital Strategist', 'Especialista em Estratégia Digital', 7, true),
('Pedro Almeida', '@pedro_analytics', 'https://i.pravatar.cc/800?img=10', 'Data Analytics', 'Especialista em Análise de Dados', 8, false),
('Camila Ferreira', '@camila_digital', 'https://i.pravatar.cc/800?img=11', 'Estrategista Digital', 'Especialista em Estratégia Digital', 9, false); 