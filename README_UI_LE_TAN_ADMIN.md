# UI bổ sung cho Lễ tân và Quản trị (bản demo ghép nhóm)

## Đã thêm
- **Lễ tân:** trang tổng quan, danh sách/tìm kiếm bệnh nhân, thêm/sửa/xóa bệnh nhân demo; màn hình đặt/xem/cập nhật/hủy lịch khám, kiểm tra bác sĩ không trùng ngày và giờ.
- **Admin:** trang tổng quan, danh sách và thêm/sửa/xóa bác sĩ demo, danh sách và thêm/xóa chuyên khoa demo, danh sách tài khoản demo (chỉ xem).
- Menu chính chuyển theo vai trò, giữ tông màu xanh, góc vuông, thông báo 7 giây và các chức năng bệnh án/kê đơn/thuốc của bác sĩ.

## Phân biệt chức năng thật và demo
- **Bác sĩ** (`bacsi/123456`): bệnh án, kê đơn, danh mục thuốc — sử dụng Java Servlet + PostgreSQL.
- **Lễ tân** (`letan/123456`): bệnh nhân gốc được đọc từ PostgreSQL. Thêm/sửa/xóa bệnh nhân còn lưu trong **mảng JavaScript** và mất khi tải lại trang. Đặt/xem/cập nhật/hủy lịch khám đã gọi API Java và lưu PostgreSQL.
- **Admin** (`admin/123456`): bác sĩ, chuyên khoa, tài khoản chỉ là **UI demo**, chưa có API lưu hoặc kiểm tra quyền thật.
- Đăng nhập và chọn vai trò chỉ là demo phía trình duyệt, không phải cơ chế phân quyền backend. **Không dùng dữ liệu thật, không triển khai lên Internet.**
- Đây là phần giao diện bổ sung để Đức (bệnh nhân/admin) và Đạt (lịch khám) tích hợp API sau này; không tự nhận đã hoàn thiện module nghiệp vụ của hai bạn.

## Chạy trên Windows/VS Code
1. Mở thư mục dự án có `pom.xml` và `docker-compose.yml`.
2. Bật Docker Desktop, chạy `docker compose up -d --wait`, sau đó mở PowerShell:
   ```powershell
   $env:Path = "C:\Tools\apache-maven-3.10.0\bin;$env:Path"
   mvn clean compile exec:java
   ```
3. Truy cập http://localhost:8080. Cấu hình PostgreSQL xem trong `README.md`.

## Test UI Lễ tân
1. Đăng nhập `letan/123456`, xác nhận chỉ thấy menu Lễ tân.
2. Vào **Quản lý bệnh nhân**, tìm `BN001` từ dữ liệu PostgreSQL. Tạo bệnh nhân demo mới, sửa tên, xóa.
3. Vào **Lịch khám**, chọn bệnh nhân và bác sĩ, nhập ngày/giờ, tạo lịch.
4. Tạo thêm lịch cùng bác sĩ và thời điểm -> báo trùng. Sửa hoặc hủy lịch.
5. Nhấn F5 -> bệnh nhân demo mới thêm sẽ mất; lịch khám lưu bằng API vẫn được tải lại từ PostgreSQL. Khi thử đặt lịch, chọn bệnh nhân có trong cơ sở dữ liệu.

## Test UI Admin
1. Đăng nhập `admin/123456`, xác nhận thấy menu Admin.
2. Thêm chuyên khoa mới, thêm bác sĩ, sửa thông tin bác sĩ.
3. Thử xóa chuyên khoa đang có bác sĩ -> bị chặn.
4. Vào **Tài khoản** xem danh sách 3 tài khoản demo.
5. Đăng xuất, đăng nhập `bacsi/123456` -> vẫn thấy chức năng bệnh án/thuốc; kiểm tra tạo, xem lại bệnh án/đơn thuốc.

## Việc cần ghép nhóm
- Đức: API CRUD bệnh nhân và xác thực/phân quyền tài khoản; tài khoản không tự được chọn quyền quản trị.
- Đạt: tiếp tục kiểm thử API lịch khám và kiểm tra trùng lịch ở backend đã tích hợp.
- Sau khi tích hợp, thay mảng JavaScript demo bằng các API thật và cập nhật đặc tả ERD.
