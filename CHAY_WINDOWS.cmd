@echo off
cd /d "%~dp0"
set "DB_USER="
set "DB_PASSWORD="
set "DB_URL="
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
echo Khoi dong project SQLite. Khong can MySQL hay mat khau!
call mvn clean compile exec:java
pause
