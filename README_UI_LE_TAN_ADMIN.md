# UI bổ sung cho Lễ tân và Quản trị (bản demo ghép nhóm)

## Đã thêm
- **Lễ tân:** trang tổng quan, danh sách/tìm kiếm bệnh nhân, thêm/sửa/xóa bệnh nhân demo; màn hình đặt/xem/cập nhật/hủy lịch khám, kiểm tra bác sĩ không trùng ngày và giờ.
- **Admin:** trang tổng quan, danh sách và thêm/sửa/xóa bác sĩ demo, danh sách và thêm/xóa chuyên khoa demo, danh sách tài khoản demo (chỉ xem).
- Menu chính chuyển theo vai trò, giữ tông màu xanh, góc vuông, thông báo 7 giây và các chức năng bệnh án/kê đơn/thuốc của bác sĩ.

## Phân biệt chức năng thật và demo
- **Bác sĩ** (`bacsi/123456`): bệnh án, kê đơn, danh mục thuốc — sử dụng Java Servlet + SQLite như bản trước.
- **Lễ tân** (`letan/123456`): bệnh nhân gốc lấy đọc từ SQLite; mọi thao tác thêm/sửa/xóa bệnh nhân và lịch khám chỉ lưu trong **mảng JavaScript**, sẽ mất khi tải lại trang.
- **Admin** (`admin/123456`): bác sĩ, chuyên khoa, tài khoản chỉ là **UI demo**, chưa có API lưu hoặc kiểm tra quyền thật.
- Đăng nhập và chọn vai trò chỉ là demo phía trình duyệt, không phải cơ chế phân quyền backend. **Không dùng dữ liệu thật, không triển khai lên Internet.**
- Đây là phần giao diện bổ sung để Đức (bệnh nhân/admin) và Đạt (lịch khám) tích hợp API sau này; không tự nhận đã hoàn thiện module nghiệp vụ của hai bạn.

## Chạy trên Windows/VS Code
1. Mở thư mục `duc_anh_web_java` có `pom.xml`.
2. PowerShell:
   ```powershell
   $env:Path = "C:\Tools\apache-maven-3.10.0\bin;$env:Path"
   mvn clean compile exec:java
   ```
3. Truy cập http://localhost:8080. Không cần MySQL hay mật khẩu DB, SQLite khởi tạo `data/clinic.db`.
4. Nếu đã có dữ liệu từ bản trước, copy `data/clinic.db` cũ sang `data/` bản mới **khi server đang tắt**.

## Test UI Lễ tân
1. Đăng nhập `letan/123456`, xác nhận chỉ thấy menu Lễ tân.
2. Vào **Quản lý bệnh nhân**, tìm `BN001` từ dữ liệu SQLite. Tạo bệnh nhân demo mới, sửa tên, xóa.
3. Vào **Lịch khám**, chọn bệnh nhân và bác sĩ, nhập ngày/giờ, tạo lịch.
4. Tạo thêm lịch cùng bác sĩ và thời điểm -> báo trùng. Sửa hoặc hủy lịch.
5. Nhấn F5 -> dữ liệu demo mới thêm biến mất (đúng phạm vi UI, chưa có API).

## Test UI Admin
1. Đăng nhập `admin/123456`, xác nhận thấy menu Admin.
2. Thêm chuyên khoa mới, thêm bác sĩ, sửa thông tin bác sĩ.
3. Thử xóa chuyên khoa đang có bác sĩ -> bị chặn.
4. Vào **Tài khoản** xem danh sách 3 tài khoản demo.
5. Đăng xuất, đăng nhập `bacsi/123456` -> vẫn thấy chức năng bệnh án/thuốc; kiểm tra tạo, xem lại bệnh án/đơn thuốc.

## Việc cần ghép nhóm
- Đức: API CRUD bệnh nhân và xác thực/phân quyền tài khoản; tài khoản không tự được chọn quyền quản trị.
- Đạt: API CRUD lịch khám, bảng bác sĩ và chuyên khoa/quan hệ lịch; kiểm tra trùng lịch ở backend.
- Sau khi tích hợp, thay mảng JavaScript demo bằng các API thật và cập nhật đặc tả ERD.
