// Importar arquivo SQL com as funções
const fs = require('fs');
const path = require('path');

// Caminho para o arquivo SQL
const sqlFilePath = path.join(__dirname, '../../database/sql/community_functions.sql');

// Ler o conteúdo do arquivo SQL
exports.up = async (client) => {
  try {
    // Ler o arquivo SQL
    const sql = fs.readFileSync(sqlFilePath, 'utf8');
    
    // Executar o SQL no Supabase
    await client.query(sql);
    
    console.log('Funções de comunidade criadas com sucesso!');
  } catch (error) {
    console.error('Erro ao criar funções de comunidade:', error);
    throw error;
  }
};

// Remover funções ao fazer rollback
exports.down = async (client) => {
  try {
    await client.query(`
      DROP FUNCTION IF EXISTS public.get_total_user_count();
      DROP FUNCTION IF EXISTS public.get_public_profiles(INTEGER);
    `);
    
    console.log('Funções de comunidade removidas com sucesso!');
  } catch (error) {
    console.error('Erro ao remover funções de comunidade:', error);
    throw error;
  }
}; 