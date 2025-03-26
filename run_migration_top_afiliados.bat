@echo off
REM Script para executar migração do top afiliados

echo Executando migração da tabela top_afiliados...

REM Verificar se o diretório de migrations existe
if not exist "migrations" mkdir migrations

REM Verificar se o arquivo JavaScript de migração existe, se não, criá-lo
if not exist "migrations\migrate_top_afiliados.js" (
  echo Criando arquivo de migração...
  (
    echo const fs = require('fs');
    echo const path = require('path');
    echo const { spawn } = require('child_process');
    echo.
    echo // Função para executar comandos SQL no Supabase via psql
    echo async function runMigration() {
    echo   try {
    echo     console.log('Iniciando migração da tabela top_afiliados...');
    echo     
    echo     // Ler o arquivo SQL
    echo     const sqlFilePath = path.join(__dirname, '../database/sql/create_top_afiliados_table.sql');
    echo     const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
    echo     
    echo     console.log('Arquivo SQL carregado com sucesso');
    echo     
    echo     // Criar arquivo temporário para a migração
    echo     const tempFileName = 'temp_migration.sql';
    echo     fs.writeFileSync(tempFileName, sqlContent);
    echo     
    echo     console.log('Executando SQL diretamente no banco...');
    echo     
    echo     // Você precisará substituir isto com os comandos específicos para seu ambiente:
    echo     // - Para Supabase local: use supabase CLI
    echo     // - Para Supabase em produção: use REST API ou cliente Postgres
    echo     console.log('---------------------------------------------');
    echo     console.log('IMPORTANTE: Execute manualmente o SQL no painel do Supabase:');
    echo     console.log(' 1. Acesse o painel do Supabase');
    echo     console.log(' 2. Vá para "SQL Editor"');
    echo     console.log(' 3. Cole o conteúdo de database/sql/create_top_afiliados_table.sql');
    echo     console.log(' 4. Execute o script');
    echo     console.log('---------------------------------------------');
    echo     
    echo     // Limpar o arquivo temporário
    echo     if (fs.existsSync(tempFileName)) {
    echo       fs.unlinkSync(tempFileName);
    echo     }
    echo     
    echo     console.log('Instrução de migração concluída!');
    echo   } catch (err) {
    echo     console.error('Erro durante o processo de migração:', err);
    echo   }
    echo }
    echo.
    echo runMigration();
  ) > migrations\migrate_top_afiliados.js
)

echo Executando o script de migração...
node migrations\migrate_top_afiliados.js

echo.
echo Pressione qualquer tecla para sair...
pause > nul 