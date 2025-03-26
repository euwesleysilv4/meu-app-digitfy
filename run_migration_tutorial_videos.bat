@echo off
echo =======================================
echo Executando migracao tutorial_videos.sql
echo =======================================

set PGPASSWORD=supabase
set PGUSER=postgres
set PGHOST=db.ghufctqxevwaszzpfkym.supabase.co
set PGDATABASE=postgres
set PGPORT=5432

echo Executando script tutorial_videos.sql...
psql -h %PGHOST% -d %PGDATABASE% -U %PGUSER% -p %PGPORT% -f database/sql/tutorial_videos.sql

echo.
echo Migracao concluida!
echo =====================
echo.

pause 