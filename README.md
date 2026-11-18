# Hệ thống quản lý phòng khám

Ứng dụng web hỗ trợ lễ tân đặt lịch khám và bác sĩ lập bệnh án, kê đơn thuốc. Giao diện sử dụng HTML, CSS và JavaScript. Server sử dụng Java Servlet và JDBC để lưu dữ liệu vào PostgreSQL 16.

## Chức năng chính

- **Đặt lịch khám** — Xem giờ trống theo ca làm việc của bác sĩ, đặt lịch, đổi lịch và hủy lịch.
- **Hồ sơ bệnh án** — Lập bệnh án từ lịch khám, ghi nhận triệu chứng, chẩn đoán và kết luận.
- **Kê đơn thuốc** — Chọn thuốc từ danh mục, nhập liều dùng, số lượng và cách dùng cho từng bệnh án.

Ba nghiệp vụ trên lưu dữ liệu trong PostgreSQL. Các thao tác chỉnh sửa bệnh nhân, bác sĩ và chuyên khoa trên giao diện demo lưu theo phiên trình duyệt.

## Chạy trên Windows

1. Giải nén dự án và mở Docker Desktop.
2. Khi Docker đã sẵn sàng, nhấp đúp `CHAY_WINDOWS.bat`.
3. Trình duyệt sẽ tự mở khi ứng dụng khởi động xong. Địa chỉ mặc định là `http://localhost:8080`.

## Tài khoản demo

Tất cả tài khoản mẫu dùng mật khẩu `123456`.

| Vai trò | Tên đăng nhập |
|---|---|
| Lễ tân | `letan01` |
| Bác sĩ | `bs.minh` |
| Quản trị viên | `admin` |
| Dược sĩ | `duocsi01` |
| Bệnh nhân | `bn.an` |

## Kịch bản demo

1. Đăng nhập bằng `letan01`, chọn bệnh nhân Nguyễn Văn An và đặt một giờ trống trong ca sáng ngày mai.
2. Đăng nhập bằng `bs.minh`, mở lịch **Chờ khám** của Trần Thị Bình và lập bệnh án.
3. Chọn bệnh án vừa lập, thêm thuốc, lưu đơn rồi mở lại để xem chi tiết.

## Nạp lại dữ liệu mẫu

Ca làm việc mẫu được tạo theo ngày nạp dữ liệu. Nếu demo vào ngày khác và danh sách ca đã hết, chạy `reset-db.bat` để tạo lại ca tối hôm nay và ca sáng ngày mai.

**Lưu ý:** Chạy `reset-db.bat` sẽ xóa dữ liệu hiện tại trong PostgreSQL và nạp lại từ `server/db/02_du_lieu.sql`. Script chạy ngay khi mở.