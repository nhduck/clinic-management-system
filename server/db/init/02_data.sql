-- Dữ liệu mẫu. Mật khẩu mọi tài khoản = 123456 (SHA-256). Chỉ dùng để demo.

INSERT INTO chuyen_khoa (ten_ck, mo_ta)
VALUES ('Nội tổng quát', 'Khám và điều trị các bệnh nội khoa thường gặp'),
       ('Nhi khoa', 'Khám và điều trị cho trẻ em'),
       ('Tai Mũi Họng', 'Các bệnh lý tai, mũi, họng'),
       ('Da liễu', 'Các bệnh lý về da');


INSERT INTO tai_khoan (ten_dang_nhap, mat_khau_hash, vai_tro)
VALUES ('admin', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 'QUAN_TRI'),
       -- 1
 ('letan01', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 'LE_TAN'),
 -- 2
 ('duocsi01', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 'DUOC_SI'),
 -- 3
 ('bs.minh', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 'BAC_SI'),
 -- 4
 ('bs.lan', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 'BAC_SI'),
 -- 5
 ('bs.hung', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 'BAC_SI'),
 -- 6
 ('bs.thao', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 'BAC_SI'),
 -- 7
 ('bn.an', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 'BENH_NHAN'),
 -- 8
 ('bn.binh', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 'BENH_NHAN'); -- 9


INSERT INTO bac_si (ma_tk, ma_ck, ho_ten, sdt, email, hoc_vi, so_nam_kinh_nghiem)
VALUES (4, 1, 'Nguyễn Văn Minh', '0901000001', 'minh@phongkham.vn', 'Thạc sĩ', 12),
       (5, 2, 'Trần Thị Lan', '0901000002', 'lan@phongkham.vn', 'Bác sĩ CKI', 8),
       (6, 3, 'Lê Quốc Hùng', '0901000003', 'hung@phongkham.vn', 'Tiến sĩ', 15),
       (7, 4, 'Phạm Thu Thảo', '0901000004', 'thao@phongkham.vn', 'Thạc sĩ', 6);


INSERT INTO benh_nhan (ma_tk, ho_ten, ngay_sinh, gioi_tinh, sdt, cccd, dia_chi, email)
VALUES (8, 'Nguyễn Văn An', '1990-05-12', 'Nam', '0912000001', '079090000001', 'Q.1, TP.HCM', 'an@mail.com'),
       (9, 'Trần Thị Bình', '1985-09-20', 'Nữ', '0912000002', '079085000002', 'Q.3, TP.HCM', 'binh@mail.com'),
       (NULL, 'Lê Văn Cường', '1978-01-03', 'Nam', '0912000003', '079078000003', 'Q.7, TP.HCM', NULL),
       (NULL, 'Phạm Thị Dung', '2015-07-15', 'Nữ', '0912000004', '079015000004', 'Q.10, TP.HCM', NULL),
       (NULL, 'Hoàng Văn Em', '1969-11-30', 'Nam', '0912000005', '079069000005', 'Bình Thạnh, TP.HCM', NULL),
       (NULL, 'Võ Thị Phương', '1995-03-08', 'Nữ', '0912000006', '079095000006', 'Thủ Đức, TP.HCM', NULL),
       (NULL, 'Đặng Văn Giang', '2001-12-25', 'Nam', '0912000007', '079001000007', 'Gò Vấp, TP.HCM', NULL),
       (NULL, 'Bùi Thị Hoa', '1988-06-18', 'Nữ', '0912000008', '079088000008', 'Tân Bình, TP.HCM', NULL);

-- Mỗi bác sĩ làm sáng 08:00-11:30 (7 slot x 30 phút), ngày 13/11 và 16/11/2026

INSERT INTO lich_lam_viec (ma_bs, ngay_lam, gio_bat_dau, gio_ket_thuc, thoi_luong_slot, so_slot_toi_da)
VALUES (1, '2026-11-13', '08:00', '11:30', 30, 7),
       -- 1
 (2, '2026-11-13', '08:00', '11:30', 30, 7),
 -- 2
 (1, '2026-11-16', '08:00', '11:30', 30, 7),
 -- 3
 (2, '2026-11-16', '08:00', '11:30', 30, 7),
 -- 4
 (3, '2026-11-16', '08:00', '11:30', 30, 7),
 -- 5
 (4, '2026-11-16', '13:00', '16:30', 30, 7); -- 6


INSERT INTO lich_kham (ma_bn, ma_bs, ma_llv, ngay_gio_kham, ly_do_kham, trang_thai)
VALUES (1, 1, 1, '2026-11-13 08:00:00', 'Đau đầu, mệt mỏi', 'Đã khám'),
       -- 1
 (4, 2, 2, '2026-11-13 08:30:00', 'Sốt, ho 3 ngày', 'Đã khám'),
 -- 2
 (2, 1, 3, '2026-11-16 08:00:00', 'Khám tổng quát', 'Chờ khám'),
 -- 3
 (3, 3, 5, '2026-11-16 09:00:00', 'Đau họng kéo dài', 'Chờ khám'),
 -- 4
 (5, 1, 3, '2026-11-16 08:30:00', 'Đau dạ dày', 'Đã hủy'),
 -- 5 (slot 08:30 vẫn đặt lại được)
 (6, 4, 6, '2026-11-16 13:00:00', 'Nổi mẩn ngứa', 'Chờ khám'); -- 6


INSERT INTO thuoc (ten_thuoc, hoat_chat, don_vi_tinh, don_gia, so_luong_ton, huong_dan_su_dung)
VALUES ('Paracetamol 500mg', 'Paracetamol', 'Viên', 1000, 500, 'Giảm đau, hạ sốt. Cách nhau tối thiểu 4-6 giờ.'),
       ('Amoxicillin 500mg', 'Amoxicillin', 'Viên', 2500, 300, 'Kháng sinh. Uống sau ăn, đủ liệu trình.'),
       ('Loratadin 10mg', 'Loratadin', 'Viên', 1500, 200, 'Chống dị ứng. Uống 1 viên/ngày.'),
       ('Omeprazol 20mg', 'Omeprazol', 'Viên', 3000, 250, 'Giảm tiết acid dạ dày. Uống trước ăn sáng.'),
       ('Siro ho Prospan', 'Cao lá thường xuân', 'Chai', 85000, 60, 'Giảm ho, long đờm.'),
       ('Vitamin C 500mg', 'Acid ascorbic', 'Viên', 800, 400, 'Bổ sung vitamin C.');


INSERT INTO benh_an (ma_lk, ma_bn, trieu_chung, chan_doan, ket_luan, ghi_chu)
VALUES (1, 1, 'Đau đầu, mệt mỏi 2 ngày', 'Căng thẳng, thiếu ngủ', 'Nghỉ ngơi, theo dõi', 'Tái khám nếu không đỡ'),
       (2, 4, 'Sốt 38.5, ho khan', 'Viêm họng cấp', 'Điều trị ngoại trú', 'Uống nhiều nước');


INSERT INTO don_thuoc (ma_ba, loi_dan, trang_thai)
VALUES (1, 'Nghỉ ngơi, ngủ đủ giấc', 'Đã cấp phát'),
       (2, 'Uống nhiều nước ấm', 'Chưa cấp phát');


INSERT INTO chi_tiet_don_thuoc (ma_dt, ma_thuoc, so_luong, lieu_dung, tan_suat, so_ngay_dung, cach_dung)
VALUES (1, 1, 10, '1 viên', '2 lần/ngày', 5, 'Uống sau ăn'),
       (1, 6, 10, '1 viên', '1 lần/ngày', 10, 'Uống buổi sáng'),
       (2, 1, 10, '1 viên', '3 lần/ngày', 3, 'Uống khi sốt'),
       (2, 5, 1, '10 ml', '3 lần/ngày', 5, 'Uống sau ăn');
