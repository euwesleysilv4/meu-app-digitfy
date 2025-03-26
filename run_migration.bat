@echo off
REM Script para executar migrações do banco de dados

echo Executando migrações do banco de dados...

REM Executar migrações em ordem
echo 1. Criando tabela de perfis...
node migrations/create_profiles_table.js

echo 2. Configurando funções de permissões administrativas...
node migrations/setup_admin_permissions.js

echo 3. Criando tabela de ferramentas...
node migrations/create_tools_table.js

echo 4. Criando tabela de mapas mentais...
node migrations/create_mind_maps_table.js

echo 5. Criando tabela de estratégias de vendas...
node migrations/create_sales_strategies_table.js

echo 6. Criando tabela de Trend Rush...
node migrations/create_trend_rush_table.js

echo 7. Criando tabela de Top Afiliados...
node migrations/202406_create_top_afiliados.js

echo Migrações concluídas com sucesso!
echo.
echo Pressione qualquer tecla para sair...
pause > nul 