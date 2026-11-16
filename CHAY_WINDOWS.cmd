@echo off
cd /d "%~dp0"
where docker >nul 2>nul
if errorlevel 1 (
  echo Chua co Docker Desktop.
  pause
  exit /b 1
)
echo Khoi dong ung dung va PostgreSQL...
docker compose up -d --build --wait
if errorlevel 1 (
  echo Khoi dong that bai. Kiem tra Docker Desktop va docker compose logs.
  pause
  exit /b 1
)
echo Mo trinh duyet tai http://localhost:8080
pause
