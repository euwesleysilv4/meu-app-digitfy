@echo off
echo ======================================================
echo Atualização da Função de Geração de Token
echo ======================================================
echo.

echo Configurando variáveis de ambiente...
set SUPABASE_URL=https://ykqnzoxbzzfuvzltoklz.supabase.co
set SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlrcW56b3hienpmdXZ6bHRva2x6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY4MTIyNjY3NiwiZXhwIjoxOTk2ODAyNjc2fQ.h39e8YIW3Lzs0XXcwgcR31tZ23W7M5nfeW8p-CHCUwg

echo Executando atualização da função...
echo.

curl -X POST "%SUPABASE_URL%/rest/v1/rpc/pg_dump" ^
-H "apikey: %SUPABASE_KEY%" ^
-H "Authorization: Bearer %SUPABASE_KEY%" ^
-H "Content-Type: application/json" ^
-d @atualizar_funcao_token.sql

echo.
echo Testando função atualizada...
echo.

curl -X POST "%SUPABASE_URL%/rest/v1/rpc/generate_funnel_share_token" ^
-H "apikey: %SUPABASE_KEY%" ^
-H "Authorization: Bearer %SUPABASE_KEY%" ^
-H "Content-Type: application/json" ^
-d "{\"p_funnel_id\": \"00000000-0000-0000-0000-000000000000\", \"p_days_valid\": 30}"

echo.
echo ======================================================
echo Atualização concluída!
echo.
echo Execute este script quando a aplicação estiver apresentando problemas
echo com a geração de tokens para compartilhamento de funis.
echo ======================================================

pause 