#Quản lý bệnh án và kê đơn (Java thuần + SQLite)

## Công nghệ
- Giao diện prototype giữ nguyên: HTML, CSS, JavaScript (đã tách 3 file)
- Backend: Java 17+ (chạy tốt với Java 25), Servlet, Tomcat nhúng
- JDBC với SQLite qua thư viện `org.xerial:sqlite-jdbc`; không dùng MySQL, không có tài khoản/mật khẩu database
- Maven để tải phụ thuộc và chạy chương trình

## Chạy trên Windows (PowerShell trong VS Code)
1. Cài JDK 17+ và Maven, có kết nối Internet ở lần Maven tải phụ thuộc đầu tiên.
2. Mở đúng thư mục `duc_anh_web_java` chứa `pom.xml`.
3. Nếu Maven chưa được nhận trong terminal hiện tại:
   `$env:Path = "C:\Tools\apache-maven-3.10.0\bin;$env:Path"`
4. Chạy: `mvn clean compile exec:java`
5. Mở http://localhost:8080 và đăng nhập demo `bacsi` / `123456`.
6. Dừng server bằng Ctrl+C. Lần sau chạy cùng lệnh, dữ liệu vẫn tồn tại.

**Cách nhanh hơn:** nhấp đúp `CHAY_WINDOWS.cmd` nếu Maven có trong PATH hoặc ở `C:\Tools\apache-maven-3.10.0`.

**Lưu ý:** Không cần chạy `schema.sql`, không cần mở MySQL, không cần DB_USER/DB_PASSWORD/DB_URL. Ứng dụng sẽ tự tạo `data/clinic.db` và 4 bệnh nhân mẫu khi khởi động. Không xóa file `data/clinic.db` nếu muốn giữ dữ liệu. Đừng chạy nhiều server trên cổng 8080 cùng lúc. Nếu cổng bận: `$env:PORT="8081"; mvn clean compile exec:java`, rồi mở http://localhost:8081.

## Checklist test phần Đức Anh
1. Đăng nhập `bacsi` / `123456` => Trang chủ có 4 bệnh nhân.
2. Vào **Lập bệnh án**, chọn BN001, ngày hiện tại, triệu chứng `Sốt, đau họng`, chẩn đoán `Viêm họng cấp`, ghi chú tùy ý, nhấn Lưu => trang chi tiết bệnh án `BA001` (nếu DB mới).
3. Vào **Danh sách bệnh án**, tìm theo `BN001`/`Viêm họng`/mã bệnh án và mở **Xem** => thấy triệu chứng, chẩn đoán, ghi chú.
4. Lập thêm một bệnh án cho BN001, rồi mở chi tiết một bệnh án của BN001 => phần **Lịch sử khám** hiển thị bệnh án còn lại.
5. Vào **Kê đơn thuốc**, chọn một bệnh án chưa có đơn; chọn `Paracetamol 500mg`, liều `1 viên/lần, 2 lần/ngày`, số lượng `10`, cách dùng `Sau ăn`; nhấn **Thêm vào đơn**, rồi **Lưu đơn thuốc** => xuất hiện mã `DT001`.
6. Vào **Đơn thuốc**, nhấn **Xem** => thấy thuốc, liều, số lượng, cách dùng. Mở lại chi tiết bệnh án => thấy đơn đã liên kết.
7. Thử lưu bệnh án thiếu chẩn đoán => thấy thông báo lỗi. Thử thêm thuốc số lượng 0 => thấy thông báo lỗi. Không thể lập đơn rỗng.
8. Nhấn F5 hoặc tắt và mở lại server => dữ liệu bệnh án/đơn thuốc vẫn còn trong SQLite.
9. Kiểm tra API (PowerShell): `Invoke-RestMethod http://localhost:8080/api/health` => database connected; `Invoke-RestMethod http://localhost:8080/api/data` => dữ liệu JSON.

## Đã làm
- Backend API `GET /api/health`, `GET /api/data`, `POST /api/records`, `POST /api/prescriptions`.
- Đọc bệnh nhân mẫu, bệnh án, lịch sử khám, danh mục thuốc mẫu, đơn thuốc từ database.
- Lưu bệnh án và đơn thuốc bằng JDBC/PreparedStatement; transaction khi thêm các dòng thuốc; chặn kê đơn trùng cho cùng bệnh án.
- Tách `index.html`, `style.css`, `app.js`, giữ kiểu giao diện prototype; frontend gọi API.
- Khởi tạo database/tables/bệnh nhân mẫu tự động, không cần cấu hình môi trường hoặc mật khẩu.

## Chưa làm / lưu ý tích hợp nhóm
- Đăng nhập/đăng ký chỉ là demo phía trình duyệt (không có xác thực, phân quyền backend). Không dùng dữ liệu bệnh nhân thật và không đưa trực tiếp lên Internet.
- Chưa kết nối phần quản lý bệnh nhân của Đức, lịch khám của Đạt; bệnh nhân và danh mục thuốc hiện là mẫu.
- Chưa sửa/xóa bệnh án hay xuất/in đơn thuốc. Một bệnh án tối đa một đơn thuốc theo quy tắc demo.
- SQLite chạy độc lập để test phần Đức Anh; nếu nhóm dùng MySQL, cần tích hợp lại DAO/schema theo thiết kế thống nhất.

## File quan trọng
- `src/main/java/vn/clinic/Database.java`: SQLite, tạo bảng/dữ liệu mẫu.
- `src/main/java/vn/clinic/ApiServlet.java`: API/SQL nghiệp vụ.
- `src/main/java/vn/clinic/WebServer.java`: Tomcat nhúng, khởi động.
- `src/main/resources/web/`: HTML/CSS/JS frontend.
- `data/clinic.db`: SQLite tự tạo sau lần chạy đầu tiên (không đưa vào ZIP).

## Cập nhật giao diện (13/11/2026)
- Thông báo lỗi/thành công tự ẩn sau **7 giây**; thông báo mới đặt lại thời gian. Không thay đổi dữ liệu SQLite.
- Trường **Liều dùng** khi kê đơn có tùy chọn 1/2/3 viên/ngày, 1 viên/lần 2 hoặc 3 lần/ngày, và **Tự nhập...**.
- Đây là tùy chọn nhập liệu phục vụ demo, không phải khuyến nghị liều dùng y khoa. Bác sĩ phải quyết định liều thực tế.
- Test: thử đăng nhập sai và chờ 7 giây; lập bệnh án thành công và chờ 7 giây; kê đơn bằng lựa chọn có sẵn, sau đó thử với Tự nhập, lưu và xem lại liều dùng.

## Bổ sung: CRUD quản lý thuốc
- Menu **Quản lý thuốc**: thêm, xem, sửa tên, xóa thuốc.
- Thuốc nằm trong bảng SQLite `thuoc`, tự khởi tạo 6 thuốc mẫu một lần, không tự hồi sinh thuốc đã xóa.
- Backend có `POST /api/drugs`, `PUT /api/drugs/{id}`, `DELETE /api/drugs/{id}` và trường `drugItems` trong `GET /api/data`.
- Kiểm tra trùng tên (không phân biệt hoa thường), không nhận tên rỗng, dài hơn 100 ký tự.
- **Đơn thuốc cũ không bị thay đổi** khi sửa/xóa thuốc trong danh mục vì chi tiết đơn đã lưu bản chụp tên thuốc.
- Có file **DAC_TA_USE_CASE_DUC_ANH.md** với 2 đặc tả bắt buộc + UC quản lý thuốc mở rộng.

### Test CRUD thuốc
1. Vào **Quản lý thuốc**; kiểm tra 6 thuốc mẫu.
2. Nhập `Thuốc demo 10mg`, nhấn **Thêm thuốc**. Danh sách tăng 1.
3. Nhấn **Sửa**, đổi thành `Thuốc demo 20mg`, nhấn **Lưu thay đổi**.
4. Thử thêm tên trùng (kể cả khác chữ hoa/thường): phải báo lỗi.
5. Vào **Kê đơn thuốc**, kiểm tra `Thuốc demo 20mg` có trong dropdown.
6. Quay lại **Quản lý thuốc**, chọn **Xóa**, xác nhận. Kiểm tra thuốc biến mất khỏi danh mục.
7. Tải lại bằng F5, đăng nhập, xác nhận thay đổi còn lưu trong SQLite.

### Không dùng dữ liệu bệnh nhân thật
- Đăng nhập hiện vẫn là demo frontend, các API chưa được bảo vệ bằng xác thực/ủy quyền backend. Chỉ dùng cục bộ để trình bày bài tập.
- Chức năng CRUD danh mục thuốc chưa có quản lý hoạt chất, chống chỉ định hoặc phân quyền dược sĩ.

## Cập nhật placeholder dropdown (13/11/2026)
- Các ô chọn bệnh nhân, bệnh án, thuốc, liều dùng và cách dùng có dòng hướng dẫn màu nhạt khi chưa chọn.
- Dòng hướng dẫn dùng `<option value="" disabled hidden selected>` (riêng bệnh án có lựa chọn `selected` tùy trạng thái) nên không xuất hiện trong danh sách xổ xuống và không chọn làm giá trị thật được.
- Các danh sách lựa chọn thực sự vẫn giữ nguyên; lựa chọn "Tự nhập..." của liều dùng vẫn hoạt động.
- Đã kiểm tra cú pháp `app.js` bằng `node --check`, chưa xác nhận chạy tích hợp trên máy Windows.
