@echo off
setlocal
cd /d "%~dp0"

where docker >nul 2>nul
if errorlevel 1 (
  echo Chua tim thay Docker. Hay cai Docker Desktop.
  pause
  exit /b 1
)

docker info >nul 2>nul
if errorlevel 1 (
  echo Docker chua san sang.
  echo Hay mo Docker Desktop, doi khoi dong xong roi chay lai.
  pause
  exit /b 1
)

docker image inspect postgres:16 >nul 2>nul
if not errorlevel 1 goto start_app

set "PULL_ATTEMPT=0"

:pull_database
set /a PULL_ATTEMPT+=1 >nul
echo.
echo Dang tai PostgreSQL - lan %PULL_ATTEMPT%/3...
docker compose pull db

if not errorlevel 1 goto start_app
if %PULL_ATTEMPT% GEQ 3 goto pull_failed

echo.
echo Tai that bai. Tu dong thu lai sau 5 giay...
timeout /t 5 /nobreak >nul
goto pull_database

:start_app
echo.
echo Khoi dong ung dung va PostgreSQL...
docker compose up -d --build --wait

if errorlevel 1 (
  echo.
  echo Khoi dong that bai.
  echo Kiem tra thong bao loi ben tren.
  echo Xem log bang lenh: docker compose logs --tail=100
  pause
  exit /b 1
)

echo.
echo Khoi dong thanh cong!
echo Mo trinh duyet tai http://localhost:8080
pause
exit /b 0

:pull_failed
echo.
echo Khong tai duoc PostgreSQL sau 3 lan thu.
echo Hay kiem tra ket noi Internet hoac thu doi mang.
echo Sau do chay lai file nay.
pause
exit /b 1