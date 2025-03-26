-- Função para obter informações sobre a estrutura de uma tabela
CREATE OR REPLACE FUNCTION get_table_info(input_table_name TEXT)
RETURNS JSON AS $$
DECLARE
    result JSON;
    columns_json JSON;
    row_count INTEGER;
    sample_record JSON;
    query TEXT;
BEGIN
    -- Verificar se a tabela existe
    IF NOT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = input_table_name
    ) THEN
        RETURN json_build_object(
            'exists', false,
            'error', 'Tabela não encontrada',
            'table', input_table_name
        );
    END IF;
    
    -- Informações sobre as colunas
    SELECT json_agg(col_info)
    INTO columns_json
    FROM (
        SELECT 
            column_name,
            data_type,
            character_maximum_length,
            is_nullable,
            column_default
        FROM 
            information_schema.columns
        WHERE 
            table_schema = 'public' 
            AND table_name = input_table_name
        ORDER BY 
            ordinal_position
    ) col_info;
    
    -- Contagem de registros (usando dinâmico)
    query := 'SELECT COUNT(*) FROM public."' || input_table_name || '" LIMIT 1000';
    EXECUTE query INTO row_count;
    
    -- Amostra de dados (primeiro registro)
    query := 'SELECT row_to_json(t) FROM (SELECT * FROM public."' || input_table_name || '" LIMIT 1) t';
    EXECUTE query INTO sample_record;
    
    -- Construir o JSON de resultado
    result := json_build_object(
        'exists', true,
        'table', input_table_name,
        'columns', columns_json,
        'approximate_count', row_count,
        'sample_data', sample_record
    );
    
    RETURN result;
EXCEPTION WHEN OTHERS THEN
    RETURN json_build_object(
        'exists', false,
        'error', SQLERRM,
        'table', input_table_name
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 