# Hệ thống quản lý phòng khám

Dự án môn học xây dựng ứng dụng web hỗ trợ đặt lịch khám, quản lý hồ sơ bệnh án và kê đơn thuốc.

Giao diện sử dụng HTML, CSS và JavaScript. Máy chủ sử dụng Java Servlet, JDBC và PostgreSQL.

## 1. Công nghệ sử dụng

| Thành phần | Công nghệ |
|---|---|
| Giao diện | HTML, CSS, JavaScript |
| Máy chủ | Java 17, Jakarta Servlet |
| Web server Java | Apache Tomcat Embedded |
| Truy cập cơ sở dữ liệu | JDBC |
| Cơ sở dữ liệu | PostgreSQL 16 |
| Quản lý thư viện Java | Maven |
| Phục vụ giao diện và chuyển tiếp API | Nginx |
| Môi trường chạy | Docker Compose |

## 2. Chức năng theo vai trò

### Quản trị viên

- Xem trang tổng quan.
- Quản lý danh sách bác sĩ trên giao diện demo.
- Quản lý chuyên khoa trên giao diện demo.
- Xem, thêm, sửa và xóa thuốc trong danh mục.
- Xem danh sách tài khoản.
- Duyệt hoặc từ chối tài khoản đăng ký.

### Lễ tân

- Xem trang tổng quan.
- Xem danh sách bệnh nhân.
- Thêm, sửa và xóa bệnh nhân demo.
- Xem giờ trống theo ca làm việc của bác sĩ.
- Đặt lịch, đổi lịch và hủy lịch khám.

### Bác sĩ

- Xem lịch khám của mình.
- Lập bệnh án từ lịch khám.
- Ghi nhận triệu chứng, chẩn đoán và kết luận.
- Tra cứu bệnh án.
- Chọn thuốc có sẵn để kê đơn.
- Nhập liều dùng, số lượng và cách dùng.
- Xem lại đơn thuốc đã lưu.

**Quản lý danh mục thuốc thuộc quyền quản trị viên. Bác sĩ sử dụng danh mục thuốc để kê đơn và không được thêm, sửa hoặc xóa thuốc trong danh mục.**

API thêm, sửa và xóa thuốc kiểm tra vai trò quản trị viên trước khi thực hiện.

## 3. Phạm vi lưu dữ liệu

| Dữ liệu hoặc chức năng | Cách lưu |
|---|---|
| Tài khoản và trạng thái duyệt | PostgreSQL |
| Lịch khám | PostgreSQL |
| Bệnh án | PostgreSQL |
| Đơn thuốc và chi tiết đơn thuốc | PostgreSQL |
| Danh mục thuốc | PostgreSQL |
| Thao tác quản lý bệnh nhân demo | Phiên trình duyệt |
| Thao tác quản lý bác sĩ demo | Phiên trình duyệt |
| Thao tác quản lý chuyên khoa demo | Phiên trình duyệt |

Các thay đổi trên danh sách demo chưa được ghi vào PostgreSQL và không đồng bộ giữa các tài khoản hoặc trình duyệt.

Khi thử chức năng đặt lịch và lập bệnh án, sử dụng bệnh nhân và bác sĩ đã có trong cơ sở dữ liệu mẫu.

Phần quản lý thuốc hiện hỗ trợ quản lý tên thuốc. Chưa có giao diện quản lý nhập kho, xuất kho hoặc thanh toán thuốc.

## 4. Cấu trúc dự án

- `client/`: mã nguồn giao diện.
  - `css/`: định dạng giao diện.
  - `js/`: xử lý các chức năng.
  - `js/shared/`: gọi API, điều hướng, phiên đăng nhập và các hàm dùng chung.
  - `pages/`: các trang HTML.
  - `nginx/`: cấu hình Nginx.
- `server/`: mã nguồn Java.
  - `MayChu.java`: khởi động máy chủ và đăng ký API.
  - `services/`: xử lý tài khoản, lịch khám, bệnh án, đơn thuốc và thuốc.
  - `shared/`: kết nối cơ sở dữ liệu và các thành phần dùng chung.
  - `db/`: cấu trúc cơ sở dữ liệu và dữ liệu mẫu.
  - `pom.xml`: cấu hình Maven.
- `docker-compose.yml`: cấu hình các dịch vụ Docker.
- `.env.example`: cấu hình môi trường mẫu.
- `CHAY_WINDOWS.bat`: chạy dự án trên Windows.
- `reset-db.bat`: xóa dữ liệu hiện tại và nạp lại dữ liệu mẫu.

## 5. Yêu cầu chạy dự án

- Docker Desktop đã được cài đặt và khởi động.
- Docker Compose có sẵn.
- Có kết nối Internet trong lần build đầu để tải image và thư viện.

Khi chạy bằng Docker, không cần cài riêng Java, Maven hoặc PostgreSQL trên máy.

## 6. Chạy trên Windows

1. Tải mã nguồn và giải nén.
2. Mở Docker Desktop, chờ Docker khởi động xong.
3. Nhấp đúp vào `CHAY_WINDOWS.bat`.
4. Chờ quá trình build và khởi động hoàn tất.
5. Trình duyệt sẽ tự mở ứng dụng.

Địa chỉ mặc định:

```text
http://localhost:8080
```

Nếu thay đổi cổng trong `.env`, sử dụng địa chỉ tương ứng.

### Chạy bằng PowerShell

Mở PowerShell tại thư mục chứa `docker-compose.yml`.

Trong lần chạy đầu, tạo file cấu hình nếu chưa có:

```powershell
Copy-Item .env.example .env
```

Khởi động:

```powershell
docker compose up -d --build
```

Kiểm tra trạng thái:

```powershell
docker compose ps
```

Xem log:

```powershell
docker compose logs --tail=100 client server
```

Dừng hệ thống:

```powershell
docker compose down
```

Lệnh dừng trên giữ lại dữ liệu trong volume PostgreSQL.

## 7. Tài khoản demo

Các tài khoản mẫu dùng chung mật khẩu `123456`.

| Vai trò | Tên đăng nhập |
|---|---|
| Quản trị viên | `admin` |
| Lễ tân | `letan01` |
| Bác sĩ | `bs.minh` |

Dữ liệu mẫu còn có tài khoản `duocsi01` và `bn.an`. Phiên bản hiện tại tập trung vào giao diện và nghiệp vụ của ba vai trò trong bảng trên.

## 8. Kịch bản demo

### Quản lý thuốc

1. Đăng nhập bằng tài khoản `admin`.
2. Chọn **Quản lý thuốc**.
3. Thêm một thuốc mới.
4. Sửa tên thuốc vừa thêm.
5. Thử xóa thuốc chưa được sử dụng trong đơn.

Thuốc đã được kê trong đơn không thể xóa do có dữ liệu liên quan.

### Đặt lịch khám

1. Đăng nhập bằng tài khoản `letan01`.
2. Mở phần **Lịch khám**.
3. Chọn bệnh nhân Nguyễn Văn An.
4. Chọn bác sĩ và ca làm việc còn giờ trống.
5. Chọn giờ khám và lưu lịch.

### Lập bệnh án và kê đơn

1. Đăng nhập bằng tài khoản `bs.minh`.
2. Mở **Lịch khám của tôi**.
3. Chọn lịch đang ở trạng thái **Chờ khám**.
4. Lập bệnh án, nhập triệu chứng, chẩn đoán và kết luận.
5. Chuyển sang kê đơn cho bệnh án.
6. Chọn thuốc từ danh mục, nhập liều dùng, số lượng và cách dùng.
7. Lưu đơn và mở lại để kiểm tra.

### Kiểm tra quyền quản lý thuốc

1. Đăng nhập admin và kiểm tra có menu **Quản lý thuốc**.
2. Đăng nhập bác sĩ và kiểm tra không có menu này.
3. Khi đang đăng nhập bác sĩ, truy cập trực tiếp `/drugs`.
4. Hệ thống chuyển về trang chủ và thông báo không có quyền.
5. Kiểm tra bác sĩ vẫn chọn được thuốc trong phần kê đơn.

## 9. Cập nhật sau khi sửa mã nguồn

Giao diện được sao chép vào Docker image lúc build. Sau khi sửa code, cần build lại dịch vụ tương ứng.

Nếu sửa cả giao diện và Java:

```powershell
docker compose up -d --build server client
```

Sau đó nhấn `Ctrl + Shift + R` trên trình duyệt để tải lại giao diện.

Nếu giao diện vẫn hiển thị bản cũ, kiểm tra đã lưu file và đang chạy lệnh trong đúng thư mục dự án, rồi thực hiện:

```powershell
docker compose build --no-cache client server
docker compose up -d --force-recreate client server
```

## 10. Nạp lại dữ liệu mẫu

Ca làm việc mẫu được tạo theo ngày khởi tạo dữ liệu, gồm ca tối hôm đó và ca sáng ngày hôm sau.

Nếu các ca mẫu đã hết hạn và cần tạo lại dữ liệu để demo, có thể chạy:

```text
reset-db.bat
```

**Lưu ý: script này xóa dữ liệu PostgreSQL hiện tại và nạp lại dữ liệu mẫu. Chỉ chạy khi chấp nhận mất các dữ liệu đã nhập.**