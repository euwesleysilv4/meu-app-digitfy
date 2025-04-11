-- Solução para o erro "JSON object requested, multiple (or no) rows returned"

-- Primeiro, vamos verificar se temos a tabela correta
DO $$
BEGIN
  RAISE NOTICE 'Verificando tabela funnel_share_tokens...';
END
$$;

-- Vamos criar uma função mais simples que retorna diretamente o token como TEXT
CREATE OR REPLACE FUNCTION generate_funnel_share_token_simple(p_funnel_id UUID, p_days_valid INT DEFAULT 30)
RETURNS TEXT AS $$
DECLARE
  v_token TEXT;
  v_funnel_data JSONB;
  v_user_id UUID;
BEGIN
  -- Obter o ID do usuário atual
  v_user_id := auth.uid();
  
  -- Log para debug
  RAISE NOTICE 'Usuário autenticado: %', v_user_id;
  RAISE NOTICE 'Funil ID: %', p_funnel_id;
  
  -- Gerar token único (16 caracteres)
  v_token := substr(md5(p_funnel_id::text || now()::text || random()::text), 1, 16);
  RAISE NOTICE 'Token gerado: %', v_token;
  
  -- Buscar dados do funil com tratamento de erro (sem JOIN)
  BEGIN
    SELECT jsonb_build_object(
      'id', id,
      'title', title,
      'description', description,
      'type', type,
      'icon', icon,
      'steps', steps
    ) INTO v_funnel_data
    FROM public.user_funnels
    WHERE id = p_funnel_id 
    AND user_id = v_user_id;
    
    IF v_funnel_data IS NULL THEN
      RAISE EXCEPTION 'Funil não encontrado ou não pertence ao usuário';
    END IF;
    
    RAISE NOTICE 'Dados do funil obtidos com sucesso';
  EXCEPTION
    WHEN OTHERS THEN
      RAISE NOTICE 'Erro ao buscar dados do funil: %', SQLERRM;
      RETURN NULL;
  END;
  
  -- Inserir na tabela com tratamento de erro
  BEGIN
    INSERT INTO public.funnel_share_tokens(
      token, 
      funnel_id, 
      created_by, 
      expires_at, 
      funnel_data,
      is_active
    ) 
    VALUES (
      v_token,
      p_funnel_id,
      v_user_id,
      CASE WHEN p_days_valid IS NULL THEN NULL ELSE (now() + (p_days_valid || ' days')::INTERVAL) END,
      v_funnel_data,
      true
    );
    
    RAISE NOTICE 'Token inserido na tabela com sucesso';
  EXCEPTION
    WHEN OTHERS THEN
      RAISE NOTICE 'Erro ao inserir token: %', SQLERRM;
      RETURN NULL;
  END;
  
  -- Retornar o token como texto
  RETURN v_token;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Erro geral: %', SQLERRM;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Alterar o comportamento do frontend para usar esta nova função
COMMENT ON FUNCTION generate_funnel_share_token_simple IS 'Versão simplificada da função de geração de token que retorna apenas TEXT';

-- Renomear a função antiga (manter para compatibilidade)
ALTER FUNCTION generate_funnel_share_token(UUID, INT) RENAME TO generate_funnel_share_token_old;

-- Criar uma nova versão da função original que chama a simplificada
CREATE OR REPLACE FUNCTION generate_funnel_share_token(p_funnel_id UUID, p_days_valid INT DEFAULT 30)
RETURNS TEXT AS $$
DECLARE
  v_token TEXT;
BEGIN
  -- Chamar a função simplificada
  v_token := generate_funnel_share_token_simple(p_funnel_id, p_days_valid);
  
  -- Retornar o token como texto simples
  RETURN v_token;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 