@echo off
echo ==================================================
echo Migração para Sistema de Compartilhamento de Funis
echo ==================================================
echo.

echo Configurando variáveis de ambiente...
set SUPABASE_URL=https://ykqnzoxbzzfuvzltoklz.supabase.co
set SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlrcW56b3hienpmdXZ6bHRva2x6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY4MTIyNjY3NiwiZXhwIjoxOTk2ODAyNjc2fQ.h39e8YIW3Lzs0XXcwgcR31tZ23W7M5nfeW8p-CHCUwg

echo Executando migração do sistema de compartilhamento de funis...
echo.

echo 1. Criando tabelas e funções necessárias...
curl -X POST "%SUPABASE_URL%/rest/v1/rpc/pg_dump" ^
-H "apikey: %SUPABASE_KEY%" ^
-H "Authorization: Bearer %SUPABASE_KEY%" ^
-H "Content-Type: application/json" ^
-d @supabase/migrations/create_funnel_sharing_tables.sql

echo.
echo 2. Verificando tabelas criadas...
curl -X GET "%SUPABASE_URL%/rest/v1/funnel_share_tokens?select=count" ^
-H "apikey: %SUPABASE_KEY%" ^
-H "Authorization: Bearer %SUPABASE_KEY%"

echo.
echo 3. Verificando tabelas de uso de tokens...
curl -X GET "%SUPABASE_URL%/rest/v1/funnel_share_token_usage?select=count" ^
-H "apikey: %SUPABASE_KEY%" ^
-H "Authorization: Bearer %SUPABASE_KEY%"

echo.
echo 4. Testando função de geração de token...
curl -X POST "%SUPABASE_URL%/rest/v1/rpc/generate_funnel_share_token" ^
-H "apikey: %SUPABASE_KEY%" ^
-H "Authorization: Bearer %SUPABASE_KEY%" ^
-H "Content-Type: application/json" ^
-d "{\"p_funnel_id\": \"00000000-0000-0000-0000-000000000000\", \"p_days_valid\": 30}"

echo.
echo 5. Migração concluída!
echo.
echo Para verificar se tudo está funcionando corretamente, acesse o painel do Supabase
echo e verifique as tabelas "funnel_share_tokens" e "funnel_share_token_usage".
echo.
echo ==================================================

pause 