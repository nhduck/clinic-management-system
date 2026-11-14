@echo off
cd /d "%~dp0"
where docker >nul 2>nul
if errorlevel 1 (
  echo Chua co Docker Desktop. Xem README.md
  pause
  exit /b 1
)
where mvn >nul 2>nul
if errorlevel 1 (
  if exist "C:\Tools\apache-maven-3.10.0\bin\mvn.cmd" (
    set "PATH=C:\Tools\apache-maven-3.10.0\bin;%PATH%"
  ) else (
    echo Maven chua co PATH. Xem README.md
    pause
    exit /b 1
  )
)
echo Khoi dong PostgreSQL (Docker)...
docker compose up -d --wait
if errorlevel 1 (
  echo Khong khoi dong duoc database. Hay mo Docker Desktop truoc.
  pause
  exit /b 1
)
echo Khoi dong web: http://localhost:8080
call mvn clean compile exec:java
pause
