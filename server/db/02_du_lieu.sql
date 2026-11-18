-- Chuyên khoa
INSERT INTO chuyen_khoa (ten_ck, mo_ta)
VALUES ('Nội tổng quát', 'Khám tổng quát');


-- Tài khoản mẫu dùng chung mật khẩu 123456
INSERT INTO tai_khoan (ten_dang_nhap, ho_ten, mat_khau_hash, vai_tro, trang_thai)
SELECT ten, ho_ten,
       '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92',
       vai_tro, 'Hoạt động'
FROM (
    VALUES
        ('admin',    'Quản trị viên',    'QUAN_TRI'),
        ('letan01',  'Lễ tân',           'LE_TAN'),
        ('duocsi01', 'Dược sĩ',          'DUOC_SI'),
        ('bs.minh',  'Nguyễn Văn Minh',  'BAC_SI'),
        ('bn.an',    'Nguyễn Văn An',    'BENH_NHAN')
) AS mau(ten, ho_ten, vai_tro);


-- Bác sĩ
INSERT INTO bac_si (ma_tk, ma_ck, ho_ten, sdt, email, hoc_vi, so_nam_kinh_nghiem)
VALUES (
    (SELECT ma_tk FROM tai_khoan WHERE ten_dang_nhap = 'bs.minh'),
    1, 'Nguyễn Văn Minh', '0901000001', 'minh@example.com', 'Thạc sĩ', 12
);


-- Bệnh nhân
INSERT INTO benh_nhan (ma_tk, ho_ten, ngay_sinh, gioi_tinh, sdt, cccd, dia_chi, email)
VALUES
    (
        (SELECT ma_tk FROM tai_khoan WHERE ten_dang_nhap = 'bn.an'),
        'Nguyễn Văn An', '1990-05-12', 'Nam',
        '0912000001', '079090000001', 'Quận 1', 'an@example.com'
    ),
    (
        NULL, 'Trần Thị Bình', '1985-09-20', 'Nữ',
        '0912000002', '079085000002', 'Quận 3', NULL
    );


-- Ca hôm qua cho bệnh án mẫu và hai ca để demo đặt lịch
INSERT INTO lich_lam_viec (
    ma_bs, ngay_lam, gio_bat_dau, gio_ket_thuc, thoi_luong_slot, so_slot_toi_da
)
VALUES
    (1, CURRENT_DATE - 1, '08:00', '10:00', 30, 4),
    (1, CURRENT_DATE,     '18:00', '21:30', 30, 7),
    (1, CURRENT_DATE + 1, '08:00', '11:30', 30, 7);


-- Lịch đã khám của An và lịch chờ khám của Bình
INSERT INTO lich_kham (ma_bn, ma_bs, ma_llv, ngay_gio_kham, ly_do_kham, trang_thai)
VALUES
    (1, 1, 1, (CURRENT_DATE - 1) + TIME '08:00', 'Khám tổng quát', 'Đã khám'),
    (2, 1, 2, CURRENT_DATE + TIME '18:00', 'Tái khám', 'Chờ khám');


-- Danh mục thuốc
INSERT INTO thuoc (ten_thuoc, hoat_chat, don_vi_tinh, don_gia, so_luong_ton, huong_dan_su_dung)
VALUES
    ('Paracetamol 500mg', 'Paracetamol',   'Viên', 1000, 100, 'Theo đơn'),
    ('Vitamin C 500mg',   'Acid ascorbic', 'Viên',  800, 100, 'Theo đơn');


-- Bệnh án của An gắn với lịch đã khám
INSERT INTO benh_an (ma_lk, ma_bn, trieu_chung, chan_doan, ket_luan, ghi_chu)
VALUES (1, 1, 'Mệt mỏi', 'Mệt mỏi chưa rõ nguyên nhân', 'Theo dõi', 'Hồ sơ mẫu');


-- Đơn thuốc của bệnh án mẫu
INSERT INTO don_thuoc (ma_ba, loi_dan, trang_thai)
VALUES (1, 'Đơn mẫu để demo', 'Chưa cấp phát');


-- Chi tiết thuốc trong đơn mẫu
INSERT INTO chi_tiet_don_thuoc (
    ma_dt, ma_thuoc, so_luong, lieu_dung, tan_suat, so_ngay_dung, cach_dung
)
VALUES (1, 2, 1, '1 viên', '1 lần', 1, 'Uống');