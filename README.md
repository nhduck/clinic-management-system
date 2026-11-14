# Hệ thống quản lý phòng khám (đặt lịch khám, hồ sơ bệnh án, kê đơn)

Java 17 + Servlet/Tomcat nhúng + JDBC, cơ sở dữ liệu **PostgreSQL 16 chạy trong Docker** (10 bảng theo thiết kế chung của nhóm).

## Yêu cầu
Docker Desktop, JDK 17+, Maven. Lần chạy Maven đầu tiên cần Internet.

## Chạy
1. Bật Docker Desktop, rồi tại thư mục có `docker-compose.yml`:
       docker compose up -d --wait
   Lần đầu Docker tự chạy `db/init/01_schema.sql` và `02_data.sql` (tạo 10 bảng + dữ liệu mẫu).
2. Chạy web:
       mvn clean compile exec:java
   Mở http://localhost:8080 (đăng nhập demo `bacsi` / `123456`).
3. Chạy bản console của phần lịch khám:
       mvn -q compile exec:java "-Dexec.mainClass=com.phongkham.ui.LichKhamConsole"
   (Windows nếu bị lỗi dấu tiếng Việt: `chcp 65001` trước khi chạy.)

Hoặc nhấp đúp `CHAY_WINDOWS.cmd` (bật DB + web).

## Cấu hình kết nối
Mặc định khớp `docker-compose.yml`: `jdbc:postgresql://localhost:5432/phong_kham`, user `pk_user`, mật khẩu `pk_password`.
Muốn đổi: đặt biến môi trường `DB_URL`, `DB_USER`, `DB_PASSWORD`, hoặc tạo file `db.properties` (`db.url=`, `db.user=`, `db.password=`; không commit file này).

## Lệnh Docker hay dùng
| Việc | Lệnh |
|---|---|
| Xem trạng thái | `docker compose ps` |
| Mở psql | `docker exec -it clinic-db psql -U pk_user -d phong_kham` |
| Tạo ca làm việc 15 ngày tới (trước buổi demo) | `docker exec -i clinic-db psql -U pk_user -d phong_kham < db/scripts/tao_lich_lam_viec_14_ngay.sql` |
| Xóa sạch và nạp lại dữ liệu mẫu | `docker compose down -v` rồi `docker compose up -d --wait` |
| Dừng (giữ dữ liệu) | `docker compose stop` |

Lưu ý: các file trong `db/init/` chỉ chạy khi volume còn trống. Sửa schema xong muốn áp dụng phải `docker compose down -v`.

## Cấu trúc
- `db/init/` schema + dữ liệu mẫu (nguồn sự thật duy nhất của DB); `db/scripts/` script phụ.
- `src/main/java/com/phongkham/` model / dao / service / ui(console) / util (phần lịch khám).
- `src/main/java/vn/clinic/` web: `WebServer`, `ApiServlet` (API bệnh án, đơn thuốc, danh mục thuốc), `Database`.
- `src/main/resources/web/` giao diện HTML/CSS/JS.
- Cả hai phần dùng chung `com.phongkham.util.DBConnection`.

## Điểm khác so với bản SQLite trước đây (phần bệnh án / kê đơn)
- Bệnh án gắn với **lịch khám** (`benh_an.ma_lk`): chỉ lập được cho bệnh nhân có lịch khám chưa hủy, chưa có bệnh án, đúng ngày chọn. Lập xong lịch chuyển sang "Đã khám". Với dữ liệu mẫu: BN003 / BN006 ngày 16/11/2026 (hoặc tự đặt lịch trước bằng console).
- Chi tiết đơn lưu khóa ngoại tới `thuoc`, nên **không xóa được thuốc đã từng được kê** (báo lỗi 409). Thuốc thêm từ giao diện web có đơn vị "Viên", đơn giá 0.
- Mỗi thuốc chỉ xuất hiện một lần trong một đơn (khóa chính kép).
- Mã hiển thị: BN001 = `benh_nhan.ma_bn`, BA001 = `benh_an.ma_ba`, DT001 = `don_thuoc.ma_dt`.
- Đã sửa lỗi đọc sai tiếng Việt trong body JSON (`setCharacterEncoding("UTF-8")`).

## Chưa làm
- Đăng nhập vẫn là demo phía trình duyệt, chưa dùng bảng `tai_khoan`.
- Trang quản lý bệnh nhân / lịch khám của giao diện web vẫn lưu trong bộ nhớ JavaScript; chưa gọi `LichKhamService`.
