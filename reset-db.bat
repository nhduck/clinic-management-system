@echo off
setlocal
cd /d "%~dp0"

if not exist "server\db\02_du_lieu.sql" (
    echo Khong tim thay file server\db\02_du_lieu.sql
    goto :loi
)

echo Thao tac nay se xoa du lieu hien tai va nap lai du lieu mau

echo Dang khoi dong PostgreSQL...
docker compose up -d --wait db
if errorlevel 1 goto :loi

echo Dang nap lai du lieu mau...
(
    echo TRUNCATE TABLE chi_tiet_don_thuoc, don_thuoc, benh_an, lich_kham, lich_lam_viec, thuoc, benh_nhan, bac_si, tai_khoan, chuyen_khoa RESTART IDENTITY;
    echo \i /docker-entrypoint-initdb.d/02_du_lieu.sql
) | docker compose exec -T db sh -c "exec psql -X -U $POSTGRES_USER -d $POSTGRES_DB -v ON_ERROR_STOP=1 --single-transaction -f -"

if errorlevel 1 goto :loi

echo Da reset thanh cong. Ban co the dang nhap lai de demo
pause
exit /b 0

:loi
echo Reset that bai. Xem thong bao loi phia tren
pause
exit /b 1