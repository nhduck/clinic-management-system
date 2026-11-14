# ĐẶC TẢ USE CASE – PHẦN ĐỨC ANH

**Đề tài:** Hệ thống quản lý phòng khám/bệnh viện (đặt lịch khám – hồ sơ bệnh án – kê đơn)  
**Môn học:** Requirements Analysis and Design  
**Phạm vi:** Phần nghiệp vụ bệnh án, kê đơn và danh mục thuốc của Đức Anh.

> Đây là đặc tả cho **bản demo độc lập** Java Servlet + SQLite, dựa trên prototype của nhóm. Trong bản demo, đăng nhập hiện chỉ mô phỏng ở frontend, chưa phải phân quyền bảo mật thực. Chức năng đặt lịch và liên kết lịch khám sẽ được tích hợp khi ghép phần Đạt. Các lựa chọn liều dùng chỉ là tiện ích nhập liệu, không phải chỉ định y khoa.

## UC-01 – LẬP BỆNH ÁN

| Thuộc tính | Nội dung |
|---|---|
| Mã Use Case | UC-01 |
| Tên | Lập bệnh án |
| Mục tiêu | Ghi nhận kết quả khám cho bệnh nhân và lưu bệnh án để tra cứu. |
| Tác nhân chính | Bác sĩ |
| Tác nhân liên quan | Bệnh nhân (cung cấp thông tin), lễ tân (quản lý bệnh nhân – ngoài phạm vi chức năng này). |
| Kích hoạt | Bác sĩ chọn **Lập bệnh án** trên menu hoặc **+ Lập bệnh án**. |
| Tiền điều kiện | Ứng dụng đang hoạt động; đã có bệnh nhân trong hệ thống; người dùng đã vào màn hình nghiệp vụ của demo. Khi tích hợp chính thức, bác sĩ phải được xác thực và được phân quyền. |
| Hậu điều kiện thành công | Một bản ghi mới được thêm vào `benh_an`; có mã bệnh án dạng `BAxxx`; có thể xem chi tiết, tìm kiếm và xem trong lịch sử khám. |
| Hậu điều kiện thất bại | Không ghi dữ liệu bệnh án mới; hiển thị thông báo lỗi. |
| Độ ưu tiên | Must have (nghiệp vụ chính). |

### Luồng chính

1. Bác sĩ mở **Lập bệnh án**.
2. Hệ thống hiển thị danh sách bệnh nhân để lựa chọn.
3. Bác sĩ chọn bệnh nhân và ngày khám.
4. Bác sĩ nhập triệu chứng, chẩn đoán; có thể nhập ghi chú/lời dặn.
5. Bác sĩ nhấn **Lưu bệnh án**.
6. Giao diện kiểm tra các trường bắt buộc: bệnh nhân, ngày khám, triệu chứng, chẩn đoán.
7. Backend kiểm tra dữ liệu, thực hiện `INSERT` vào bảng `benh_an` bằng JDBC.
8. Hệ thống tạo mã bệnh án, chuyển đến trang chi tiết và hiển thị thông báo lưu thành công (tự ẩn sau 7 giây).

### Luồng thay thế và ngoại lệ

- **A1 – Bỏ trống trường bắt buộc:** Tại bước 6, hiển thị thông báo thiếu thông tin và không gửi/lưu bệnh án.
- **A2 – Ngày không hợp lệ:** Tại bước 7, backend từ chối ngày sai định dạng và không lưu.
- **A3 – Bệnh nhân không tồn tại:** Tại bước 7, khóa ngoại không hợp lệ; hệ thống từ chối lưu và báo lỗi.
- **A4 – Người dùng hủy:** Trước bước 5, chọn **Hủy** để quay về danh sách, không tạo bản ghi.
- **A5 – Lỗi database:** Tại bước 7, báo lỗi và giữ nguyên dữ liệu đã có; không thông báo thành công.

### Dữ liệu vào và ra

- **Vào:** mã bệnh nhân, ngày khám, triệu chứng, chẩn đoán, ghi chú.
- **Ra:** mã bệnh án, thông tin bệnh án đã lưu, thông báo kết quả.
- **Bảng sử dụng:** `benh_nhan`, `benh_an`.

## UC-02 – KÊ ĐƠN THUỐC

| Thuộc tính | Nội dung |
|---|---|
| Mã Use Case | UC-02 |
| Tên | Kê đơn thuốc |
| Mục tiêu | Lập đơn thuốc từ bệnh án đã có, gồm một hoặc nhiều thuốc. |
| Tác nhân chính | Bác sĩ |
| Kích hoạt | Bác sĩ chọn **Kê đơn thuốc** trên menu hoặc từ chi tiết bệnh án chưa có đơn. |
| Tiền điều kiện | Có ít nhất một bệnh án chưa có đơn; danh mục thuốc có thuốc để lựa chọn. Demo chỉ hỗ trợ **mỗi bệnh án tối đa một đơn thuốc**. |
| Hậu điều kiện thành công | Có một bản ghi `don_thuoc` gắn với bệnh án và một hoặc nhiều dòng `chi_tiet_don`; xem được tại danh sách/chi tiết đơn. |
| Hậu điều kiện thất bại | Không lưu đơn thuốc dở dang; hiển thị lỗi. |
| Độ ưu tiên | Must have (nghiệp vụ chính). |

### Luồng chính

1. Bác sĩ mở màn hình **Kê đơn thuốc**.
2. Hệ thống liệt kê các bệnh án chưa có đơn.
3. Bác sĩ chọn bệnh án; hệ thống hiển thị chẩn đoán liên quan.
4. Bác sĩ chọn thuốc từ danh mục.
5. Bác sĩ chọn liều dùng có sẵn hoặc **Tự nhập**, nhập số lượng và cách dùng.
6. Bác sĩ nhấn **Thêm vào đơn**; hệ thống đưa thuốc vào danh sách tạm.
7. Lặp lại bước 4–6 nếu cần thêm thuốc; bác sĩ có thể xóa một dòng thuốc trước khi lưu.
8. Bác sĩ nhấn **Lưu đơn thuốc**.
9. Hệ thống kiểm tra đã chọn bệnh án, đơn có ít nhất một thuốc, từng thuốc có tên/liều dùng/cách dùng và số lượng hợp lệ.
10. Backend xác minh thuốc còn trong danh mục, tạo `don_thuoc` và các dòng `chi_tiet_don` trong một giao dịch SQLite.
11. Nếu thành công, hệ thống hiển thị chi tiết đơn và thông báo lưu thành công (tự ẩn sau 7 giây).

### Luồng thay thế và ngoại lệ

- **B1 – Chưa chọn bệnh án:** Tại bước 8–9, không lưu và hiển thị yêu cầu chọn bệnh án.
- **B2 – Chưa có thuốc:** Tại bước 8–9, không lưu và yêu cầu thêm ít nhất một thuốc.
- **B3 – Liều dùng trống / số lượng ≤ 0:** Tại bước 6 hoặc 9, yêu cầu nhập lại; không thêm/lưu dữ liệu sai.
- **B4 – Thuốc đã bị xóa khỏi danh mục:** Tại bước 10, backend từ chối lưu và yêu cầu chọn thuốc khác.
- **B5 – Bệnh án đã có đơn:** Tại bước 10, ràng buộc duy nhất ngăn tạo đơn thứ hai.
- **B6 – Lỗi khi lưu chi tiết đơn:** Tại bước 10, toàn bộ giao dịch được rollback để tránh đơn rỗng hoặc thiếu thuốc.
- **B7 – Hủy thao tác:** Bác sĩ chọn **Hủy** trước khi lưu, danh sách thuốc tạm không ghi vào database.

### Dữ liệu vào và ra

- **Vào:** mã bệnh án; danh sách thuốc, liều dùng, số lượng, cách dùng.
- **Ra:** mã đơn thuốc dạng `DTxxx`, ngày kê, danh sách thuốc và thông báo kết quả.
- **Bảng sử dụng:** `benh_an`, `thuoc`, `don_thuoc`, `chi_tiet_don`.

## UC-03 – QUẢN LÝ DANH MỤC THUỐC (BỔ SUNG)

Đây là **Use Case mở rộng** ngoài hai đặc tả UC-01, UC-02 mà bảng phân công giao riêng cho Đức Anh. Prototype ban đầu có danh mục thuốc mẫu, còn bản này bổ sung CRUD thực tế.

| Thuộc tính | Nội dung |
|---|---|
| Mã | UC-03 |
| Tên | Quản lý danh mục thuốc |
| Tác nhân | Người quản lý danh mục thuốc (ở demo chưa có phân quyền backend; mọi tài khoản giao diện demo có thể truy cập). |
| Tiền điều kiện | Ứng dụng chạy được và database SQLite đã khởi tạo. |
| Hậu điều kiện | Danh mục thuốc cập nhật và xuất hiện trong màn hình kê đơn mới. |
| Ràng buộc | Tên thuốc không rỗng, tối đa 100 ký tự, không trùng tên (không phân biệt chữ hoa/thường). |

### Luồng chính

1. Người dùng mở **Quản lý thuốc** trên menu.
2. Hệ thống tải danh sách thuốc từ bảng `thuoc` (Read).
3. Người dùng nhập tên và nhấn **Thêm thuốc** (Create); hệ thống lưu và làm mới danh sách.
4. Người dùng nhấn **Sửa** ở một dòng, chỉnh tên rồi nhấn **Lưu thay đổi** (Update).
5. Người dùng nhấn **Xóa**; hệ thống yêu cầu xác nhận và xóa khỏi danh mục (Delete).
6. Thuốc thêm/sửa sẽ xuất hiện trong danh sách lựa chọn ở màn hình kê đơn tiếp theo.

### Ngoại lệ

- Tên thuốc trống hoặc quá dài: từ chối và hiển thị thông báo.
- Tên thuốc trùng: từ chối và báo lỗi trùng danh mục.
- Thuốc không còn tồn tại tại thời điểm sửa/xóa: hiển thị lỗi.
- Hủy xác nhận xóa: không thay đổi dữ liệu.

### Quy tắc về lịch sử đơn thuốc

`chi_tiet_don` lưu **tên thuốc tại thời điểm kê đơn**. Khi đổi tên/xóa thuốc trong danh mục `thuoc`, đơn thuốc cũ **không bị sửa/xóa**. Đây là quy tắc demo để giữ lịch sử khám và đơn đã kê. Với hệ thống thực tế, cần thiết kế bảng thuốc, phiên bản hoạt chất/hàm lượng và chính sách lưu lịch sử chặt chẽ hơn.

## Ghi chú khi ghép nhóm

- **Đức:** thay dữ liệu bệnh nhân mẫu và đăng nhập demo bằng chức năng quản lý bệnh nhân, xác thực/phân quyền chính thức.
- **Đạt:** thống nhất database chung, khóa liên kết `lich_kham_id` cho `benh_an`, quan hệ và ràng buộc.
- **Đức Anh:** giữ UI, các API bệnh án/đơn thuốc/thuốc, kiểm thử và viết Chương 6–7.
