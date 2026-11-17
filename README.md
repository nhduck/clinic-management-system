# Hệ thống quản lý phòng khám

## Chạy trên Windows

1. Cài và mở Docker Desktop, dùng Linux containers.
2. Giải nén dự án vào một thư mục cố định.
3. Chạy `CHAY_WINDOWS.bat`. File `CHAY_WINDOWS.cmd` cũ cũng gọi cùng trình khởi động.
4. Trình khởi động tự tạo `.env` từ `.env.example` nếu chưa có, dựng ảnh Docker, chờ các dịch vụ sẵn sàng rồi mở trình duyệt.

Máy cá nhân chỉ cần Docker Desktop và PowerShell có sẵn trên Windows. Maven và Java được chạy trong quá trình dựng container server.

## Các container

| Dịch vụ | Vai trò | Cổng mặc định trên máy |
| --- | --- | --- |
| client | Nginx phục vụ HTML, CSS, JavaScript và chuyển `/api/` đến server | 8080 |
| server | Java 17, Tomcat, API và JDBC | 8081, chỉ truy cập từ máy chủ |
| db | PostgreSQL 16 | 5432, chỉ truy cập từ máy chủ |

Truy cập giao diện: `http://localhost:8080`. Kiểm tra API trực tiếp: `http://localhost:8081/api/health`.

## Cấu hình `.env`

| Biến | Ý nghĩa |
| --- | --- |
| CLIENT_PORT | Cổng mở giao diện trên máy |
| SERVER_PORT | Cổng truy cập API trực tiếp trên máy |
| DB_PORT | Cổng kết nối PostgreSQL từ công cụ trên máy |
| CLIENT_INTERNAL_PORT | Cổng Nginx trong container |
| SERVER_INTERNAL_PORT | Cổng Java trong container, Nginx tự dùng cùng giá trị |
| DB_INTERNAL_PORT | Cổng PostgreSQL trong container, Java tự dùng cùng giá trị |
| DB_HOST | Tên máy PostgreSQL trong mạng Docker, mặc định `db` |
| DB_NAME, DB_USER, DB_PASSWORD | Tên cơ sở dữ liệu, tài khoản và mật khẩu |
| TZ | Múi giờ của các container |

Đổi cổng ngoài bằng cách sửa `.env`, rồi chạy lại file BAT. Ví dụ: `CLIENT_PORT=3000`, `SERVER_PORT=8082`, `DB_PORT=5433`.

Không đưa `.env` lên Git. File `.env` cũ dùng `APP_PORT` và `POSTGRES_PASSWORD` vẫn được hỗ trợ khi chưa khai báo các biến mới tương ứng. Nếu đã có dữ liệu PostgreSQL, giữ đúng tài khoản, mật khẩu và tên cơ sở dữ liệu trước đó: biến khởi tạo không tự thay đổi tài khoản trong volume đã tồn tại.

## Lệnh thường dùng

```powershell
docker compose ps
docker compose logs --tail=100
docker compose down
docker compose up -d --build --wait --remove-orphans
```

`docker compose down` giữ dữ liệu trong volume `clinic_pgdata`. SQL trong `server/db/init` chỉ chạy khi volume dữ liệu mới được khởi tạo.

## Các thay đổi

- Tách giao diện và API thành hai container, PostgreSQL ở container thứ ba.
- Chuyển cổng, cấu hình PostgreSQL và múi giờ sang biến môi trường.
- Thêm Nginx chuyển tiếp API để giao diện dùng đường dẫn tương đối hiện có.
- Sửa đường dẫn Java, Maven và thư mục SQL theo cấu trúc hiện tại.
- Bổ sung lại DataService và DataServlet bị thiếu để API `/api/data` biên dịch được.
- Tách tài nguyên giao diện khỏi JAR, bỏ Dockerfile gộp và StaticServlet không còn dùng.
- Sửa health check theo cổng cấu hình; thêm thư viện Jakarta Annotation cho Tomcat.
- Thêm BAT khởi động, kiểm tra Docker, giữ `.env` hiện có và thử lại tối đa ba lần.
