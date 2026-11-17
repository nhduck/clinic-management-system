@echo off
setlocal
cd /d "%~dp0"

where docker >nul 2>nul
if errorlevel 1 (
    echo Chua cai Docker Desktop.
    goto failed
)

docker info >nul 2>nul
if errorlevel 1 (
    echo Docker Desktop chua san sang.
    echo Hay mo Docker Desktop va cho khoi dong xong.
    goto failed
)

docker compose version >nul 2>nul
if errorlevel 1 (
    echo Khong tim thay Docker Compose.
    echo Hay cap nhat Docker Desktop.
    goto failed
)

if not exist ".env" (
    if not exist ".env.example" (
        echo Khong tim thay file .env.example.
        goto failed
    )

    copy /y ".env.example" ".env" >nul
    if errorlevel 1 (
        echo Khong tao duoc file .env.
        goto failed
    )

    echo Da tao file .env tu .env.example.
)

docker compose config --quiet
if errorlevel 1 (
    echo Cau hinh Docker Compose hoac .env khong hop le.
    goto failed
)

set "ATTEMPT=0"

:start
set /a ATTEMPT+=1
echo.
echo Khoi dong client, server va PostgreSQL...
echo Lan thu %ATTEMPT%/3
echo.

docker compose up -d --build --wait --wait-timeout 180 --remove-orphans
if not errorlevel 1 goto success

if %ATTEMPT% GEQ 3 goto startup_failed

echo.
echo Chua khoi dong thanh cong. Thu lai sau 5 giay...
timeout /t 5 /nobreak >nul
goto start

:success
echo.
docker compose ps
echo.

powershell.exe -NoProfile -Command "$ErrorActionPreference = 'Stop'; try { $json = docker compose config --format json; if ($LASTEXITCODE -ne 0) { exit 1 }; $config = ($json -join [Environment]::NewLine) | ConvertFrom-Json; $port = $config.services.client.ports[0].published; $url = 'http://localhost:' + $port; Write-Host ('Ung dung da san sang: ' + $url); Start-Process $url } catch { Write-Host 'Hay mo trinh duyet bang cong CLIENT_PORT trong file .env.' }"

echo.
pause
exit /b 0

:startup_failed
echo.
echo Khoi dong that bai sau 3 lan thu.
echo.
docker compose ps -a
docker compose logs --tail=80
echo.
echo Kiem tra loi o tren, ket noi mang va cac cong trong .env.

:failed
echo.
pause
exit /b 1