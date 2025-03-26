-- Script para verificar e corrigir dados da tabela top_afiliados
-- Execute este script no SQL Editor do Supabase

-- Verificar se o tipo de enum existe
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'affiliate_status') THEN
    CREATE TYPE public.affiliate_status AS ENUM ('ativo', 'inativo');
  END IF;
END$$;

-- Verificar se a tabela existe e criar se não existir
CREATE TABLE IF NOT EXISTS public.top_afiliados (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  nome TEXT NOT NULL,
  instagram TEXT NOT NULL,
  profile_image TEXT NOT NULL,
  vendas INTEGER NOT NULL DEFAULT 0,
  comissao DECIMAL(15, 2) NOT NULL DEFAULT 0,
  comissao_formatada TEXT NOT NULL DEFAULT 'R$ 0,00',
  posicao INTEGER NOT NULL,
  status affiliate_status DEFAULT 'ativo',
  is_top5 BOOLEAN DEFAULT FALSE,
  data_criacao TIMESTAMP WITH TIME ZONE DEFAULT now(),
  data_modificacao TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Verificar se a tabela está vazia
DO $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_count FROM public.top_afiliados;
  
  -- Se a tabela estiver vazia, inserir dados de exemplo
  IF v_count = 0 THEN
    -- Inserir dados iniciais dos top afiliados
    INSERT INTO public.top_afiliados (nome, instagram, profile_image, vendas, comissao, comissao_formatada, posicao, is_top5)
    VALUES ('João Silva', '@joaosilva.digital', 'https://i.pravatar.cc/150?img=1', 1250, 125000.00, 'R$ 125.000,00', 1, true);

    INSERT INTO public.top_afiliados (nome, instagram, profile_image, vendas, comissao, comissao_formatada, posicao, is_top5)
    VALUES ('Maria Santos', '@mariasantos.mkt', 'https://i.pravatar.cc/150?img=2', 1180, 118000.00, 'R$ 118.000,00', 2, true);

    INSERT INTO public.top_afiliados (nome, instagram, profile_image, vendas, comissao, comissao_formatada, posicao, is_top5)
    VALUES ('Pedro Costa', '@pedrocosta.oficial', 'https://i.pravatar.cc/150?img=3', 1050, 105000.00, 'R$ 105.000,00', 3, true);

    INSERT INTO public.top_afiliados (nome, instagram, profile_image, vendas, comissao, comissao_formatada, posicao, is_top5)
    VALUES ('Ana Oliveira', '@anaoliveira.digital', 'https://i.pravatar.cc/150?img=4', 980, 98000.00, 'R$ 98.000,00', 4, true);

    INSERT INTO public.top_afiliados (nome, instagram, profile_image, vendas, comissao, comissao_formatada, posicao, is_top5)
    VALUES ('Lucas Mendes', '@lucasmendes.mkt', 'https://i.pravatar.cc/150?img=5', 920, 92000.00, 'R$ 92.000,00', 5, true);
    
    RAISE NOTICE 'Dados de exemplo inseridos com sucesso!';
  ELSE
    RAISE NOTICE 'A tabela já contém dados. Nenhum dado inserido.';
  END IF;
END$$;

-- Verificar se a função list_top_afiliados existe e criar se não existir
CREATE OR REPLACE FUNCTION public.list_top_afiliados()
RETURNS SETOF public.top_afiliados
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT * FROM public.top_afiliados
  WHERE status = 'ativo'
  ORDER BY posicao ASC;
$$;

-- Exibir os dados atuais
SELECT id, nome, instagram, posicao, is_top5, status
FROM public.top_afiliados
ORDER BY posicao ASC; 