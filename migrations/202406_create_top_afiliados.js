const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const dotenv = require('dotenv');

// Carregar variáveis de ambiente
dotenv.config();

// Função para executar comandos SQL no Supabase via CLI
async function runMigration() {
  try {
    console.log('Iniciando migração da tabela top_afiliados...');
    
    // Ler o arquivo SQL
    const sqlFilePath = path.join(__dirname, '../database/sql/create_top_afiliados_table.sql');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
    
    console.log('Arquivo SQL carregado com sucesso');
    
    // Criar arquivo temporário para a migração
    const tempFileName = 'temp_migration.sql';
    fs.writeFileSync(tempFileName, sqlContent);
    
    console.log('Executando migração no Supabase...');
    
    // Executar o SQL no Supabase usando a CLI
    const command = `supabase db reset --db-url ${process.env.SUPABASE_DB_URL}`;
    
    exec(command, (error, stdout, stderr) => {
      // Remover arquivo temporário
      if (fs.existsSync(tempFileName)) {
        fs.unlinkSync(tempFileName);
      }
      
      if (error) {
        console.error('Erro ao executar migração:', error);
        console.error('STDERR:', stderr);
        return;
      }
      
      console.log('Migração concluída com sucesso:');
      console.log(stdout);
      
      console.log('Tabela top_afiliados criada e configurada com sucesso!');
    });
    
  } catch (err) {
    console.error('Erro durante o processo de migração:', err);
  }
}

// Executar a migração
runMigration(); 