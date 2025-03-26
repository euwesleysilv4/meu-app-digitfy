-- Função para incrementar o contador de visualizações de um item do trend rush
CREATE OR REPLACE FUNCTION increment_trend_rush_view_count(trend_rush_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Atualiza a contagem de visualizações do item especificado
  UPDATE trend_rush
  SET view_count = view_count + 1
  WHERE id = trend_rush_id;
END;
$$; 