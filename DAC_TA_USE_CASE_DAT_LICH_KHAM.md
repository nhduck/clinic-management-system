# ĐẶC TẢ USE CASE – PHẦN ĐẶT LỊCH KHÁM

**Đề tài:** Hệ thống quản lý phòng khám/bệnh viện (đặt lịch khám – hồ sơ bệnh án – kê đơn)
**Phạm vi:** UC-04 Đặt lịch khám và UC-05 Cập nhật / Hủy lịch khám.
---

# UC-04 – ĐẶT LỊCH KHÁM

| Thuộc tính | Nội dung |
|---|---|
| Mã / Tên | UC-04 – Đặt lịch khám |
| Mục tiêu | Ghi nhận một lượt hẹn khám của bệnh nhân vào một khung giờ còn trống của bác sĩ. |
| Tác nhân chính | **Lễ tân** (thao tác trên màn hình *Lịch khám*) |
| Tác nhân phụ | **Bệnh nhân** (cung cấp nhu cầu, lý do khám); **CSDL PostgreSQL** (kiểm tra ràng buộc, chống trùng giờ) |
| Kích hoạt | Lễ tân chọn menu **Lịch khám** và điền form **Đặt lịch**. |
| Tiền điều kiện | 1. Lễ tân đã vào hệ thống (demo: đăng nhập mô phỏng ở frontend).<br>2. Bệnh nhân đã có trong bảng `benh_nhan`.<br>3. Có ít nhất một ca làm việc (`lich_lam_viec`) trạng thái **Mở**, ngày từ hôm nay trở đi.<br>4. Kết nối PostgreSQL hoạt động. |
| Hậu điều kiện thành công | 1. Thêm một bản ghi `lich_kham` với `trang_thai = 'Chờ khám'`, mã hiển thị `LKxxx`.<br>2. `ma_bs` lấy từ ca làm việc đã chọn; `ngay_dat` được gán tự động.<br>3. Khung giờ đó không còn xuất hiện trong danh sách giờ trống của bác sĩ.<br>4. Lịch hiển thị trong danh sách lịch khám. |
| Hậu điều kiện thất bại | Không có bản ghi nào được tạo, dữ liệu cũ giữ nguyên, hệ thống hiển thị thông báo lỗi. |

### Luồng chính (Main flow)

1. Lễ tân mở màn hình **Lịch khám**.
2. Hệ thống tải danh sách bệnh nhân, các ca làm việc còn **Mở** từ hôm nay (hiển thị dạng *ngày · giờ bắt đầu–kết thúc · bác sĩ*) và danh sách lịch hiện có.
3. Lễ tân chọn **bệnh nhân**.
4. Lễ tân chọn **ca làm việc** (tức chọn ngày và bác sĩ).
5. Hệ thống tính **giờ còn trống** của ca: toàn bộ slot trong ca, trừ slot đã có lịch chưa hủy và trừ slot đã qua (nếu là hôm nay), rồi hiển thị trong ô chọn giờ.
6. Lễ tân chọn **giờ khám** và (không bắt buộc) nhập **lý do khám**, tối đa 255 ký tự.
7. Lễ tân nhấn **Đặt lịch**.
8. Giao diện kiểm tra đã chọn đủ bệnh nhân, ca, giờ, rồi gửi yêu cầu đặt lịch lên backend.
9. Backend kiểm tra nghiệp vụ theo thứ tự:
   - (a) Ca tồn tại và đang **Mở**.
   - (b) Giờ nằm trong ca và khớp khung slot (ví dụ ca bắt đầu 08:00, slot 30 phút thì chỉ nhận 08:00, 08:30, …).
   - (c) Thời điểm khám không nằm trong quá khứ.
   - (d) Bệnh nhân chưa có lịch chưa hủy nào khác vào đúng giờ này.
10. Backend tạo lịch khám với `ma_bs` lấy từ ca (không nhận từ client, tránh lệch dữ liệu) và trạng thái **Chờ khám**, rồi ghi vào CSDL. Unique index `uq_lk_bs_slot (ma_bs, ngay_gio_kham)` là chốt chặn cuối cùng chống trùng giờ.
11. Hệ thống trả về lịch vừa tạo (mã `LKxxx`), làm mới danh sách và hiển thị thông báo **"Đã đặt lịch LKxxx"**.

### Luồng thay thế (Alternative flows)

- **A1 – Thiếu thông tin bắt buộc:** Tại bước 7–8, nếu chưa chọn bệnh nhân, ca hoặc giờ, giao diện báo *"Chọn bệnh nhân, ca làm việc và giờ khám"* và không gửi yêu cầu.
- **A2 – Không nhập lý do khám:** Lý do để trống vẫn hợp lệ, hệ thống lưu `ly_do_kham = NULL`.
- **A3 – Đổi ca khi đang điền form:** Tại bước 4, nếu lễ tân chọn ca khác, hệ thống xóa giờ đã chọn và tải lại danh sách giờ trống của ca mới.
- **A4 – Chọn ca/bác sĩ khác sau khi gặp ca kín:** Xem E1. Lễ tân quay lại bước 4, chọn ca khác của cùng bác sĩ (ngày khác) hoặc ca của bác sĩ khác, rồi tiếp tục từ bước 5.

### Luồng ngoại lệ (Exception flows)

**E1 – Bác sĩ kín lịch trong ca đã chọn (không còn giờ trống)**

- *Tại bước 5:* mọi slot của ca đã có lịch chưa hủy (hoặc đã qua), danh sách giờ trống rỗng.
- Hệ thống hiển thị gợi ý **"Hết chỗ trong ca này"**, không cho chọn giờ, không thể bấm đặt thành công.
- Lễ tân chọn ca/bác sĩ/ngày khác (A4) hoặc kết thúc use case. Không có dữ liệu nào được ghi.

**E2 – Trùng giờ do hai người đặt cùng lúc (race condition)**

- *Tại bước 10:* khung giờ đã được người khác đặt trong lúc lễ tân đang thao tác (danh sách giờ trống lễ tân thấy đã cũ).
- CSDL từ chối vì vi phạm unique index (SQLState `23505`). Hệ thống không ghi gì và báo: **"Khung giờ này của bác sĩ đã có người đặt. Vui lòng chọn giờ khác."**
- Lễ tân quay lại bước 5 để xem giờ trống mới (nên tải lại danh sách giờ sau lỗi này) và chọn giờ khác.
- Lưu ý: lịch **Đã hủy** không chiếm slot (index chỉ áp dụng cho lịch khác `Đã hủy`), nên slot của lịch đã hủy được đặt lại bình thường.

**E3 – Bệnh nhân trùng giờ với lịch khác:** Tại bước 9d, bệnh nhân đã có lịch chưa hủy cùng giờ (kể cả với bác sĩ khác). Hệ thống báo *"Bệnh nhân đã có một lịch khám khác vào đúng giờ này."* và không lưu.

**E4 – Ca làm việc đã đóng:** Tại bước 9a, báo *"Ca làm việc này đã đóng, không nhận lịch."* Không lưu.

**E5 – Giờ ngoài ca hoặc lệch khung slot:** Tại bước 9b, báo giờ nằm ngoài ca (kèm giờ bắt đầu–kết thúc của ca) hoặc phải khớp khung *N* phút. Không lưu.

**E6 – Đặt vào thời điểm đã qua:** Tại bước 9c, báo *"Không thể đặt lịch vào thời điểm đã qua."* Không lưu.

**E7 – Bệnh nhân hoặc ca không tồn tại / dữ liệu không hợp lệ:** Tại bước 9–10, mã ca không tìm thấy hoặc khóa ngoại sai (`23503`, `23514`). Hệ thống báo *"Dữ liệu không hợp lệ"* hoặc *"Không tìm thấy ca làm việc"*. Không lưu.

**E8 – Lỗi cơ sở dữ liệu / mất kết nối:** Tại bước 2 hoặc 10, hệ thống báo lỗi CSDL, không thông báo thành công, dữ liệu giữ nguyên.

### Quy tắc nghiệp vụ

| Mã | Quy tắc |
|---|---|
| BR-01 | Một bác sĩ không có hai lịch chưa hủy trùng giờ (ràng buộc ở tầng CSDL). |
| BR-02 | Một bệnh nhân không có hai lịch chưa hủy trùng giờ. |
| BR-03 | Chỉ đặt vào ca **Mở**, đúng khung slot, không ở quá khứ. |
| BR-04 | Lịch mới luôn có trạng thái **Chờ khám**. |
| BR-05 | Bác sĩ của lịch được suy ra từ ca làm việc. |

**Dữ liệu vào:** mã bệnh nhân, mã ca, giờ khám, lý do khám.
**Dữ liệu ra:** mã `LKxxx`, bệnh nhân, bác sĩ, ngày–giờ, trạng thái.
**Bảng sử dụng:** `benh_nhan`, `bac_si`, `lich_lam_viec`, `lich_kham`.

---

# UC-05 – CẬP NHẬT / HỦY LỊCH KHÁM

| Thuộc tính | Nội dung |
|---|---|
| Mã / Tên | UC-05 – Cập nhật / Hủy lịch khám |
| Mục tiêu | Thay đổi khung giờ, bác sĩ, lý do khám của lịch đã đặt, hoặc hủy lịch hẹn. |
| Tác nhân chính | **Lễ tân** |
| Tác nhân phụ | **Bệnh nhân** (yêu cầu đổi/hủy); **CSDL PostgreSQL** |
| Kích hoạt | Lễ tân nhấn **Sửa** hoặc **Hủy lịch** trên một dòng trong danh sách lịch khám. |
| Tiền điều kiện | 1. Lễ tân đã vào hệ thống.<br>2. Lịch khám tồn tại và đang ở trạng thái **Chờ khám** (nút Sửa/Hủy chỉ hiển thị cho lịch này).<br>3. Với cập nhật: còn ca làm việc **Mở** phù hợp. |
| Hậu điều kiện thành công | **Cập nhật:** lịch giữ nguyên mã `LKxxx` và bệnh nhân, được gán ca/bác sĩ/giờ/lý do mới, trạng thái vẫn **Chờ khám**; slot cũ được giải phóng, slot mới bị chiếm.<br>**Hủy:** trạng thái chuyển thành **Đã hủy**; bản ghi **không bị xóa**; slot được giải phóng để đặt lại. |
| Hậu điều kiện thất bại | Lịch giữ nguyên như trước khi thao tác; hệ thống hiển thị lỗi. |

## Luồng chính A – Cập nhật lịch (đổi khung giờ / bác sĩ / lý do)

1. Lễ tân tìm lịch cần đổi trong danh sách và nhấn **Sửa**.
2. Hệ thống nạp thông tin hiện tại của lịch vào form (bệnh nhân, ca, giờ, lý do) và tải giờ trống của ca hiện tại. Giờ hiện tại của chính lịch này vẫn được giữ trong danh sách để có thể chọn lại.
3. Lễ tân thay đổi một hoặc nhiều mục: chọn **ca khác** (đổi ngày và/hoặc đổi bác sĩ), chọn **giờ khác**, sửa **lý do khám**. Bệnh nhân của lịch không đổi được.
4. Khi đổi ca, hệ thống xóa giờ cũ và tải giờ trống của ca mới; lễ tân chọn giờ mới.
5. Lễ tân nhấn **Lưu thay đổi**.
6. Giao diện kiểm tra đã chọn đủ ca và giờ, rồi gửi yêu cầu cập nhật.
7. Backend kiểm tra theo thứ tự:
   - (a) Lịch tồn tại.
   - (b) Lịch đang **Chờ khám**.
   - (c) Ca mới **Mở**, giờ mới nằm trong ca và khớp khung slot.
   - (d) Thời điểm mới không ở quá khứ.
   - (e) Bệnh nhân không có lịch khác trùng giờ mới (loại trừ chính lịch đang sửa).
8. Backend cập nhật `ma_llv`, `ma_bs` (lấy từ ca mới), `ngay_gio_kham`, `ly_do_kham`, với điều kiện lịch vẫn đang **Chờ khám** tại thời điểm ghi. Unique index tiếp tục chặn trùng giờ của bác sĩ.
9. Hệ thống làm mới danh sách và thông báo **"Đã cập nhật lịch LKxxx"**.

## Luồng chính B – Hủy lịch

1. Lễ tân nhấn **Hủy lịch** ở dòng lịch cần hủy.
2. Hệ thống hiển thị hộp xác nhận **"Hủy lịch khám LKxxx?"**.
3. Lễ tân xác nhận.
4. Backend chuyển trạng thái từ **Chờ khám** sang **Đã hủy** bằng một câu lệnh cập nhật có điều kiện trạng thái (thao tác nguyên tử).
5. Hệ thống làm mới danh sách, thông báo **"Đã hủy lịch LKxxx"**; nếu lịch đang mở trong form sửa thì form được đặt lại.

### Luồng thay thế (Alternative flows)

- **A1 – Chỉ sửa lý do khám:** Lễ tân giữ nguyên ca và giờ, chỉ đổi lý do. Hệ thống vẫn kiểm tra như bước 7 và cập nhật thành công (giờ cũ vẫn được coi là hợp lệ vì chính lịch này đang giữ slot đó).
- **A2 – Bỏ sửa:** Lễ tân nhấn **Hủy sửa** trước bước 5, form được đặt lại, không ghi dữ liệu.
- **A3 – Không xác nhận hủy:** Tại bước B2, lễ tân chọn Cancel trong hộp xác nhận, lịch giữ nguyên.
- **A4 – Thiếu thông tin khi cập nhật:** Tại bước A6, chưa chọn ca hoặc giờ, hệ thống báo *"Chọn bệnh nhân, ca làm việc và giờ khám"*, không gửi yêu cầu.
- **A5 – Đổi sang bác sĩ khác:** Lễ tân chọn ca của bác sĩ khác ở bước A3; lịch được chuyển sang bác sĩ đó, các bước kiểm tra giống nhau.

### Luồng ngoại lệ (Exception flows)

**E1 – Giờ/ca mới đã kín hoặc bị trùng giờ bác sĩ**

- *Tại bước A4:* ca mới không còn giờ trống, hiển thị **"Hết chỗ trong ca này"**; lễ tân chọn ca khác hoặc bỏ sửa. Lịch cũ không đổi.
- *Tại bước A8 (đặt cùng lúc):* giờ mới vừa bị người khác đặt, CSDL từ chối (`23505`) và hệ thống báo **"Khung giờ này của bác sĩ đã có người đặt. Vui lòng chọn giờ khác."** Lịch giữ nguyên giờ cũ, lễ tân chọn lại giờ.

**E2 – Lịch không còn ở trạng thái Chờ khám**

- *Tại bước A7b / A8 hoặc B4:* lịch đã **Đã khám** (đã lập bệnh án) hoặc **Đã hủy** (có thể do người khác thao tác trước).
- Hệ thống báo *"Chỉ đổi được lịch đang ở trạng thái 'Chờ khám' (hiện tại: …)"* hoặc *"Chỉ hủy được lịch 'Chờ khám' (hiện tại: …)"*; nếu trạng thái đổi giữa chừng thì báo *"Cập nhật không thành công (lịch đã thay đổi trạng thái)"*. Không thay đổi dữ liệu.

**E3 – Lịch không tồn tại:** Báo *"Không tìm thấy lịch khám mã …"* hoặc *"Mã lịch khám không hợp lệ"*.

**E4 – Ca mới đã đóng / giờ ngoài ca / lệch khung slot:** Báo lỗi tương ứng như UC-04 (E4, E5); lịch giữ nguyên.

**E5 – Đổi sang thời điểm đã qua:** Báo *"Không thể đặt lịch vào thời điểm đã qua."* Lịch giữ nguyên.

**E6 – Bệnh nhân trùng giờ với lịch khác:** Báo *"Bệnh nhân đã có một lịch khám khác vào đúng giờ này."* Lịch giữ nguyên.

**E7 – Lỗi cơ sở dữ liệu:** Báo lỗi CSDL, không thông báo thành công, dữ liệu giữ nguyên.

### Quy tắc nghiệp vụ

| Mã | Quy tắc |
|---|---|
| BR-06 | Chỉ sửa hoặc hủy được lịch **Chờ khám**. |
| BR-07 | **Hủy là đổi trạng thái**, không xóa bản ghi (giữ lịch sử, đối chiếu). |
| BR-08 | Lịch **Đã hủy** không chiếm slot; slot được đặt lại cho người khác. |
| BR-09 | Sửa lịch không tạo mã mới và không đổi bệnh nhân; `ngay_dat` giữ nguyên. |
| BR-10 | Lịch đã có bệnh án (**Đã khám**) bị khóa, không sửa/hủy được. |

**Dữ liệu vào:** mã lịch; (cập nhật) mã ca, giờ mới, lý do.
**Dữ liệu ra:** lịch sau cập nhật, hoặc mã lịch kèm trạng thái *Đã hủy*.
**Bảng sử dụng:** `lich_kham`, `lich_lam_viec`.
