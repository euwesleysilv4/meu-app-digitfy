-- Script SQL para criar tabela de banners promocionais
-- Esta tabela permite o gerenciamento de banners no Dashboard
-- com suporte a versões separadas para dispositivos móveis e desktop

-- Verifica se a tabela já existe antes de criar
CREATE TABLE IF NOT EXISTS "public"."banners" (
    "id" SERIAL PRIMARY KEY,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT,
    "imagem_desktop" TEXT NOT NULL,  -- URL da imagem para desktop
    "imagem_mobile" TEXT NOT NULL,   -- URL da imagem para mobile
    "url_destino" TEXT NOT NULL,     -- URL para redirecionamento ao clicar no banner
    "ativo" BOOLEAN DEFAULT TRUE,    -- Indica se o banner está ativo
    "data_inicio" DATE NOT NULL,     -- Data de início da exibição
    "data_fim" DATE,                 -- Data de término da exibição (opcional)
    "ordem" INTEGER DEFAULT 0,       -- Ordem de exibição (caso haja múltiplos banners ativos)
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Função para atualizar o timestamp de atualização
CREATE OR REPLACE FUNCTION update_banners_timestamp()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar o timestamp automaticamente
CREATE TRIGGER update_banners_timestamp
BEFORE UPDATE ON "public"."banners"
FOR EACH ROW
EXECUTE FUNCTION update_banners_timestamp();

-- Índices para melhorar performance de consultas
CREATE INDEX IF NOT EXISTS idx_banners_ativo ON "public"."banners" (ativo);
CREATE INDEX IF NOT EXISTS idx_banners_datas ON "public"."banners" (data_inicio, data_fim);

-- Comentários para documentação
COMMENT ON TABLE "public"."banners" IS 'Tabela para gerenciamento de banners promocionais na plataforma';
COMMENT ON COLUMN "public"."banners"."imagem_desktop" IS 'URL da imagem do banner otimizada para visualização em desktop';
COMMENT ON COLUMN "public"."banners"."imagem_mobile" IS 'URL da imagem do banner otimizada para visualização em dispositivos móveis';
COMMENT ON COLUMN "public"."banners"."url_destino" IS 'URL para onde o usuário será redirecionado ao clicar no banner';
COMMENT ON COLUMN "public"."banners"."ativo" IS 'Indica se o banner deve ser exibido (TRUE) ou não (FALSE)';
COMMENT ON COLUMN "public"."banners"."data_inicio" IS 'Data a partir da qual o banner deve começar a ser exibido';
COMMENT ON COLUMN "public"."banners"."data_fim" IS 'Data limite para exibição do banner (NULL para sem data de término)';
COMMENT ON COLUMN "public"."banners"."ordem" IS 'Ordem de prioridade para exibição do banner (menor = maior prioridade)';

-- Inserir um banner de exemplo para teste
INSERT INTO "public"."banners" (
    "titulo", 
    "descricao", 
    "imagem_desktop", 
    "imagem_mobile", 
    "url_destino", 
    "ativo", 
    "data_inicio", 
    "data_fim", 
    "ordem"
) VALUES (
    'Black Friday DigitFy', 
    'Promoção especial: 50% de desconto em todos os planos premium!', 
    'https://dummyimage.com/1200x250/10b981/ffffff.png&text=Banner+Desktop+DigitFy', 
    'https://dummyimage.com/640x250/10b981/ffffff.png&text=Banner+Mobile', 
    'https://digitfy.com.br/promo',
    true, 
    CURRENT_DATE, 
    CURRENT_DATE + INTERVAL '30 days', 
    0
);

-- Permissões de segurança (opcional, dependendo da sua configuração)
-- ALTER TABLE "public"."banners" ENABLE ROW LEVEL SECURITY;

-- Política para permitir apenas leitura para usuários anônimos
-- CREATE POLICY "Allow anonymous read-only access" ON "public"."banners"
--   FOR SELECT
--   TO anon
--   USING (true);

-- Política para permitir todas as operações para usuários autenticados
-- CREATE POLICY "Allow authenticated full access" ON "public"."banners"
--   FOR ALL
--   TO authenticated
--   USING (true);
