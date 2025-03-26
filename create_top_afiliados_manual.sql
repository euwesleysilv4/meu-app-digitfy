-- Script SQL corrigido para criar a tabela top_afiliados
-- Execute este script no SQL Editor do painel do Supabase

-- Criar o tipo de enum para status de afiliado (se não existir)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'affiliate_status') THEN
    CREATE TYPE public.affiliate_status AS ENUM (
      'ativo',
      'inativo'
    );
  END IF;
END$$;

-- Tabela para os Top Afiliados
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

-- Adicionar comentários à tabela e colunas
COMMENT ON TABLE public.top_afiliados IS 'Tabela para armazenar informações dos top afiliados mostrados na página principal';
COMMENT ON COLUMN public.top_afiliados.id IS 'Identificador único do afiliado';
COMMENT ON COLUMN public.top_afiliados.nome IS 'Nome completo do afiliado';
COMMENT ON COLUMN public.top_afiliados.instagram IS 'Nome de usuário do Instagram (com @)';
COMMENT ON COLUMN public.top_afiliados.profile_image IS 'URL da imagem de perfil do afiliado';
COMMENT ON COLUMN public.top_afiliados.vendas IS 'Número total de vendas realizadas';
COMMENT ON COLUMN public.top_afiliados.comissao IS 'Valor da comissão em decimal';
COMMENT ON COLUMN public.top_afiliados.comissao_formatada IS 'Valor da comissão formatado (ex: R$ 125.000,00)';
COMMENT ON COLUMN public.top_afiliados.posicao IS 'Posição no ranking (1-N)';
COMMENT ON COLUMN public.top_afiliados.status IS 'Status do afiliado (ativo ou inativo)';
COMMENT ON COLUMN public.top_afiliados.is_top5 IS 'Indica se o afiliado está no top 5';
COMMENT ON COLUMN public.top_afiliados.data_criacao IS 'Data de criação do registro';
COMMENT ON COLUMN public.top_afiliados.data_modificacao IS 'Data da última modificação do registro';

-- Garantir que posição seja única para afiliados ativos
CREATE UNIQUE INDEX IF NOT EXISTS top_afiliados_posicao_idx ON public.top_afiliados (posicao) 
WHERE status = 'ativo';

-- Garantir que Instagram seja único
CREATE UNIQUE INDEX IF NOT EXISTS top_afiliados_instagram_idx ON public.top_afiliados (instagram);

-- Verificar se a função trigger_set_timestamp existe e criar se não existir
CREATE OR REPLACE FUNCTION public.trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.data_modificacao = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar o trigger se não existir
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'set_timestamp' 
    AND tgrelid = 'public.top_afiliados'::regclass
  ) THEN
    CREATE TRIGGER set_timestamp
    BEFORE UPDATE ON public.top_afiliados
    FOR EACH ROW
    EXECUTE FUNCTION public.trigger_set_timestamp();
  END IF;
END$$;

-- Configurar Row Level Security (RLS)
ALTER TABLE public.top_afiliados ENABLE ROW LEVEL SECURITY;

-- Política de acesso para leitura: todos podem ler
DROP POLICY IF EXISTS "Allow read access for all users" ON public.top_afiliados;
CREATE POLICY "Allow read access for all users" 
ON public.top_afiliados
FOR SELECT 
USING (true);

-- Política de acesso para administradores: controle total
DROP POLICY IF EXISTS "Allow full access for admins only" ON public.top_afiliados;
CREATE POLICY "Allow full access for admins only" 
ON public.top_afiliados
USING (
  auth.uid() IN (
    SELECT id FROM public.profiles WHERE role = 'admin'
  )
);

-- Função para obter todos os top afiliados (para uso no frontend)
CREATE OR REPLACE FUNCTION public.list_top_afiliados()
RETURNS SETOF public.top_afiliados
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT * FROM public.top_afiliados
  WHERE status = 'ativo'
  ORDER BY posicao ASC;
$$;

-- Função para adicionar um novo afiliado (apenas para administradores)
CREATE OR REPLACE FUNCTION public.add_top_afiliado(
  p_nome TEXT,
  p_instagram TEXT,
  p_profile_image TEXT,
  p_vendas INTEGER,
  p_comissao DECIMAL,
  p_posicao INTEGER,
  p_is_top5 BOOLEAN DEFAULT FALSE
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_id UUID;
  v_comissao_formatada TEXT;
BEGIN
  -- Verificar se o usuário é administrador
  IF NOT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Acesso negado: apenas administradores podem adicionar afiliados';
  END IF;
  
  -- Formatar a comissão para exibição
  v_comissao_formatada := 'R$ ' || to_char(p_comissao, 'FM999G999G999D00');
  
  -- Ajustar posições existentes se necessário
  IF EXISTS (SELECT 1 FROM public.top_afiliados WHERE posicao = p_posicao AND status = 'ativo') THEN
    UPDATE public.top_afiliados
    SET posicao = posicao + 1
    WHERE posicao >= p_posicao AND status = 'ativo';
  END IF;
  
  -- Inserir o novo afiliado
  INSERT INTO public.top_afiliados (
    nome, 
    instagram, 
    profile_image, 
    vendas, 
    comissao, 
    comissao_formatada, 
    posicao, 
    is_top5
  ) VALUES (
    p_nome, 
    p_instagram, 
    p_profile_image, 
    p_vendas, 
    p_comissao, 
    v_comissao_formatada, 
    p_posicao, 
    p_is_top5
  ) RETURNING id INTO v_id;
  
  -- Atualizar is_top5 baseado na posição
  UPDATE public.top_afiliados
  SET is_top5 = (posicao <= 5)
  WHERE status = 'ativo';
  
  RETURN v_id;
END;
$$;

-- Função para atualizar um afiliado existente (apenas para administradores)
CREATE OR REPLACE FUNCTION public.update_top_afiliado(
  p_id UUID,
  p_nome TEXT,
  p_instagram TEXT,
  p_profile_image TEXT,
  p_vendas INTEGER,
  p_comissao DECIMAL,
  p_posicao INTEGER,
  p_status affiliate_status DEFAULT 'ativo'
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_comissao_formatada TEXT;
  v_old_posicao INTEGER;
BEGIN
  -- Verificar se o usuário é administrador
  IF NOT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Acesso negado: apenas administradores podem atualizar afiliados';
  END IF;
  
  -- Obter a posição atual do afiliado
  SELECT posicao INTO v_old_posicao
  FROM public.top_afiliados
  WHERE id = p_id;
  
  -- Formatar a comissão para exibição
  v_comissao_formatada := 'R$ ' || to_char(p_comissao, 'FM999G999G999D00');
  
  -- Ajustar posições existentes se necessário
  IF p_posicao != v_old_posicao THEN
    -- Liberar a posição atual para evitar conflitos
    UPDATE public.top_afiliados
    SET posicao = -1
    WHERE id = p_id;
    
    -- Reajustar posições considerando a nova posição
    IF p_posicao < v_old_posicao THEN
      -- Se está movendo para cima, incrementar posições entre a nova e a antiga
      UPDATE public.top_afiliados
      SET posicao = posicao + 1
      WHERE posicao >= p_posicao AND posicao < v_old_posicao AND status = 'ativo' AND id != p_id;
    ELSE
      -- Se está movendo para baixo, decrementar posições entre a antiga e a nova
      UPDATE public.top_afiliados
      SET posicao = posicao - 1
      WHERE posicao > v_old_posicao AND posicao <= p_posicao AND status = 'ativo' AND id != p_id;
    END IF;
  END IF;
  
  -- Atualizar o afiliado
  UPDATE public.top_afiliados
  SET 
    nome = p_nome,
    instagram = p_instagram,
    profile_image = p_profile_image,
    vendas = p_vendas,
    comissao = p_comissao,
    comissao_formatada = v_comissao_formatada,
    posicao = p_posicao,
    status = p_status,
    is_top5 = (p_posicao <= 5 AND p_status = 'ativo')
  WHERE id = p_id;
  
  -- Atualizar is_top5 para todos os afiliados
  UPDATE public.top_afiliados
  SET is_top5 = (posicao <= 5)
  WHERE status = 'ativo';
  
  RETURN FOUND;
END;
$$;

-- Função para remover um afiliado (apenas para administradores)
CREATE OR REPLACE FUNCTION public.delete_top_afiliado(
  p_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_posicao INTEGER;
BEGIN
  -- Verificar se o usuário é administrador
  IF NOT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Acesso negado: apenas administradores podem remover afiliados';
  END IF;
  
  -- Obter a posição do afiliado
  SELECT posicao INTO v_posicao
  FROM public.top_afiliados
  WHERE id = p_id;
  
  -- Excluir o afiliado
  DELETE FROM public.top_afiliados
  WHERE id = p_id;
  
  -- Reajustar posições dos afiliados restantes
  UPDATE public.top_afiliados
  SET posicao = posicao - 1
  WHERE posicao > v_posicao AND status = 'ativo';
  
  -- Atualizar is_top5 para todos os afiliados
  UPDATE public.top_afiliados
  SET is_top5 = (posicao <= 5)
  WHERE status = 'ativo';
  
  RETURN FOUND;
END;
$$;

-- Função para reordenar um afiliado (apenas para administradores)
CREATE OR REPLACE FUNCTION public.reorder_top_afiliado(
  p_id UUID,
  p_nova_posicao INTEGER
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_posicao_atual INTEGER;
BEGIN
  -- Verificar se o usuário é administrador
  IF NOT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Acesso negado: apenas administradores podem reordenar afiliados';
  END IF;
  
  -- Obter a posição atual do afiliado
  SELECT posicao INTO v_posicao_atual
  FROM public.top_afiliados
  WHERE id = p_id;
  
  -- Se a posição não mudou, não fazer nada
  IF v_posicao_atual = p_nova_posicao THEN
    RETURN TRUE;
  END IF;
  
  -- Liberar a posição atual para evitar conflitos
  UPDATE public.top_afiliados
  SET posicao = -1
  WHERE id = p_id;
  
  -- Ajustar outras posições
  IF p_nova_posicao < v_posicao_atual THEN
    -- Se movendo para cima, incrementar posições entre a nova e a atual
    UPDATE public.top_afiliados
    SET posicao = posicao + 1
    WHERE posicao >= p_nova_posicao AND posicao < v_posicao_atual AND status = 'ativo';
  ELSE
    -- Se movendo para baixo, decrementar posições entre a atual e a nova
    UPDATE public.top_afiliados
    SET posicao = posicao - 1
    WHERE posicao > v_posicao_atual AND posicao <= p_nova_posicao AND status = 'ativo';
  END IF;
  
  -- Atualizar para a nova posição
  UPDATE public.top_afiliados
  SET posicao = p_nova_posicao
  WHERE id = p_id;
  
  -- Atualizar is_top5 para todos os afiliados
  UPDATE public.top_afiliados
  SET is_top5 = (posicao <= 5)
  WHERE status = 'ativo';
  
  RETURN TRUE;
END;
$$;

-- Inserir dados iniciais dos top afiliados existentes (somente se a tabela estiver vazia)
INSERT INTO public.top_afiliados (nome, instagram, profile_image, vendas, comissao, comissao_formatada, posicao, is_top5)
SELECT 'João Silva', '@joaosilva.digital', 'https://i.pravatar.cc/150?img=1', 1250, 125000.00, 'R$ 125.000,00', 1, true
WHERE NOT EXISTS (SELECT 1 FROM public.top_afiliados LIMIT 1);

INSERT INTO public.top_afiliados (nome, instagram, profile_image, vendas, comissao, comissao_formatada, posicao, is_top5)
SELECT 'Maria Santos', '@mariasantos.mkt', 'https://i.pravatar.cc/150?img=2', 1180, 118000.00, 'R$ 118.000,00', 2, true
WHERE EXISTS (SELECT 1 FROM public.top_afiliados WHERE posicao = 1) AND NOT EXISTS (SELECT 1 FROM public.top_afiliados WHERE posicao = 2);

INSERT INTO public.top_afiliados (nome, instagram, profile_image, vendas, comissao, comissao_formatada, posicao, is_top5)
SELECT 'Pedro Costa', '@pedrocosta.oficial', 'https://i.pravatar.cc/150?img=3', 1050, 105000.00, 'R$ 105.000,00', 3, true
WHERE EXISTS (SELECT 1 FROM public.top_afiliados WHERE posicao = 2) AND NOT EXISTS (SELECT 1 FROM public.top_afiliados WHERE posicao = 3);

INSERT INTO public.top_afiliados (nome, instagram, profile_image, vendas, comissao, comissao_formatada, posicao, is_top5)
SELECT 'Ana Oliveira', '@anaoliveira.digital', 'https://i.pravatar.cc/150?img=4', 980, 98000.00, 'R$ 98.000,00', 4, true
WHERE EXISTS (SELECT 1 FROM public.top_afiliados WHERE posicao = 3) AND NOT EXISTS (SELECT 1 FROM public.top_afiliados WHERE posicao = 4);

INSERT INTO public.top_afiliados (nome, instagram, profile_image, vendas, comissao, comissao_formatada, posicao, is_top5)
SELECT 'Lucas Mendes', '@lucasmendes.mkt', 'https://i.pravatar.cc/150?img=5', 920, 92000.00, 'R$ 92.000,00', 5, true
WHERE EXISTS (SELECT 1 FROM public.top_afiliados WHERE posicao = 4) AND NOT EXISTS (SELECT 1 FROM public.top_afiliados WHERE posicao = 5); 