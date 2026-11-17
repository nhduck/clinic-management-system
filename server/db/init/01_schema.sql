-- =====================================================================
-- HỆ THỐNG QUẢN LÝ PHÒNG KHÁM: đặt lịch khám, hồ sơ bệnh án, kê đơn
-- PostgreSQL 16. Tự động chạy lần đầu khi container khởi tạo volume mới
-- (thư mục /docker-entrypoint-initdb.d). 10 bảng, chuyển từ bản SQL Server.
-- =====================================================================

-- 1. CHUYÊN KHOA
CREATE TABLE chuyen_khoa (
    ma_ck   INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    ten_ck  VARCHAR(100) NOT NULL UNIQUE,
    mo_ta   TEXT NULL
);

-- 2. TÀI KHOẢN
CREATE TABLE tai_khoan (
    ma_tk          INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    ten_dang_nhap  VARCHAR(50)  NOT NULL UNIQUE,
    mat_khau_hash  VARCHAR(255) NOT NULL,
    vai_tro        VARCHAR(20)  NOT NULL,
    trang_thai     VARCHAR(20)  NOT NULL DEFAULT 'Hoạt động',
    ngay_tao       TIMESTAMP(0) NOT NULL DEFAULT LOCALTIMESTAMP(0),
    CONSTRAINT ck_tk_vai_tro    CHECK (vai_tro IN ('QUAN_TRI', 'LE_TAN', 'BAC_SI', 'DUOC_SI', 'BENH_NHAN')),
    CONSTRAINT ck_tk_trang_thai CHECK (trang_thai IN ('Hoạt động', 'Khóa'))
);

-- 3. BỆNH NHÂN (ma_tk, cccd có thể NULL; PostgreSQL cho nhiều NULL trong UNIQUE nên không cần filtered index)
CREATE TABLE benh_nhan (
    ma_bn      INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    ma_tk      INT NULL UNIQUE,
    ho_ten     VARCHAR(100) NOT NULL,
    ngay_sinh  DATE NULL,
    gioi_tinh  VARCHAR(10) NULL,
    sdt        VARCHAR(15) NULL,
    cccd       VARCHAR(12) NULL UNIQUE,
    dia_chi    VARCHAR(255) NULL,
    email      VARCHAR(100) NULL,
    CONSTRAINT fk_bn_tk FOREIGN KEY (ma_tk) REFERENCES tai_khoan(ma_tk),
    CONSTRAINT ck_bn_gioi_tinh CHECK (gioi_tinh IN ('Nam', 'Nữ', 'Khác'))
);

-- 4. BÁC SĨ
CREATE TABLE bac_si (
    ma_bs               INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    ma_tk               INT NOT NULL UNIQUE,
    ma_ck               INT NOT NULL,
    ho_ten              VARCHAR(100) NOT NULL,
    sdt                 VARCHAR(15) NULL,
    email               VARCHAR(100) NULL,
    hoc_vi              VARCHAR(50) NULL,
    so_nam_kinh_nghiem  INT NULL,
    CONSTRAINT fk_bs_tk FOREIGN KEY (ma_tk) REFERENCES tai_khoan(ma_tk),
    CONSTRAINT fk_bs_ck FOREIGN KEY (ma_ck) REFERENCES chuyen_khoa(ma_ck),
    CONSTRAINT ck_bs_kn CHECK (so_nam_kinh_nghiem IS NULL OR so_nam_kinh_nghiem >= 0)
);

-- 5. LỊCH LÀM VIỆC CỦA BÁC SĨ (một ca làm, chia thành nhiều slot)
CREATE TABLE lich_lam_viec (
    ma_llv           INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    ma_bs            INT  NOT NULL,
    ngay_lam         DATE NOT NULL,
    gio_bat_dau      TIME(0) NOT NULL,
    gio_ket_thuc     TIME(0) NOT NULL,
    thoi_luong_slot  INT  NOT NULL DEFAULT 30,   -- phút / lượt khám
    so_slot_toi_da   INT  NOT NULL,
    trang_thai       VARCHAR(20) NOT NULL DEFAULT 'Mở',
    CONSTRAINT fk_llv_bs FOREIGN KEY (ma_bs) REFERENCES bac_si(ma_bs),
    CONSTRAINT uq_llv_ca UNIQUE (ma_bs, ngay_lam, gio_bat_dau),
    CONSTRAINT ck_llv_gio  CHECK (gio_ket_thuc > gio_bat_dau),
    CONSTRAINT ck_llv_slot CHECK (thoi_luong_slot > 0 AND so_slot_toi_da > 0),
    CONSTRAINT ck_llv_tt   CHECK (trang_thai IN ('Mở', 'Đóng'))
);

-- 6. LỊCH KHÁM
CREATE TABLE lich_kham (
    ma_lk          INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    ma_bn          INT          NOT NULL,
    ma_bs          INT          NOT NULL,
    ma_llv         INT          NOT NULL,
    ngay_gio_kham  TIMESTAMP(0) NOT NULL,
    ly_do_kham     VARCHAR(255) NULL,
    trang_thai     VARCHAR(20)  NOT NULL DEFAULT 'Chờ khám',
    ngay_dat       TIMESTAMP(0) NOT NULL DEFAULT LOCALTIMESTAMP(0),
    CONSTRAINT fk_lk_bn  FOREIGN KEY (ma_bn)  REFERENCES benh_nhan(ma_bn),
    CONSTRAINT fk_lk_bs  FOREIGN KEY (ma_bs)  REFERENCES bac_si(ma_bs),
    CONSTRAINT fk_lk_llv FOREIGN KEY (ma_llv) REFERENCES lich_lam_viec(ma_llv),
    CONSTRAINT ck_lk_tt  CHECK (trang_thai IN ('Chờ khám', 'Đã khám', 'Đã hủy'))
);
-- Chống trùng lịch: partial unique index bỏ qua lịch đã hủy (slot đã hủy được đặt lại).
-- Vi phạm -> SQLState 23505.
CREATE UNIQUE INDEX uq_lk_bs_slot
    ON lich_kham(ma_bs, ngay_gio_kham)
    WHERE trang_thai <> 'Đã hủy';

-- 7. BỆNH ÁN (mỗi lượt khám tối đa 1 bệnh án)
CREATE TABLE benh_an (
    ma_ba       INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    ma_lk       INT NOT NULL UNIQUE,
    ma_bn       INT NOT NULL,
    trieu_chung TEXT NULL,
    chan_doan   TEXT NULL,
    ket_luan    TEXT NULL,
    ghi_chu     TEXT NULL,
    ngay_lap    TIMESTAMP(0) NOT NULL DEFAULT LOCALTIMESTAMP(0),
    CONSTRAINT fk_ba_lk FOREIGN KEY (ma_lk) REFERENCES lich_kham(ma_lk),
    CONSTRAINT fk_ba_bn FOREIGN KEY (ma_bn) REFERENCES benh_nhan(ma_bn)
);

-- 8. ĐƠN THUỐC
CREATE TABLE don_thuoc (
    ma_dt       INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    ma_ba       INT NOT NULL,
    ngay_ke     TIMESTAMP(0) NOT NULL DEFAULT LOCALTIMESTAMP(0),
    loi_dan     TEXT NULL,
    trang_thai  VARCHAR(20) NOT NULL DEFAULT 'Chưa cấp phát',
    CONSTRAINT fk_dt_ba FOREIGN KEY (ma_ba) REFERENCES benh_an(ma_ba),
    CONSTRAINT ck_dt_tt CHECK (trang_thai IN ('Chưa cấp phát', 'Đã cấp phát', 'Đã hủy'))
);

-- 9. THUỐC (danh mục)
CREATE TABLE thuoc (
    ma_thuoc            INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    ten_thuoc           VARCHAR(150) NOT NULL,
    hoat_chat           VARCHAR(150) NULL,
    don_vi_tinh         VARCHAR(20)  NOT NULL,
    don_gia             NUMERIC(12,2) NOT NULL,
    so_luong_ton        INT NOT NULL DEFAULT 0,
    huong_dan_su_dung   TEXT NULL,
    CONSTRAINT ck_thuoc_gia CHECK (don_gia >= 0),
    CONSTRAINT ck_thuoc_ton CHECK (so_luong_ton >= 0)
);
-- Không cho trùng tên thuốc (không phân biệt hoa/thường), phục vụ CRUD thuốc ở giao diện web.
CREATE UNIQUE INDEX uq_thuoc_ten ON thuoc (lower(ten_thuoc));

-- 10. CHI TIẾT ĐƠN THUỐC (PK kép: một thuốc chỉ xuất hiện 1 lần / đơn)
CREATE TABLE chi_tiet_don_thuoc (
    ma_dt         INT NOT NULL,
    ma_thuoc      INT NOT NULL,
    so_luong      INT NOT NULL,
    lieu_dung     VARCHAR(100) NULL,
    tan_suat      VARCHAR(100) NULL,
    so_ngay_dung  INT NULL,
    cach_dung     VARCHAR(255) NULL,
    CONSTRAINT pk_ctdt PRIMARY KEY (ma_dt, ma_thuoc),
    CONSTRAINT fk_ctdt_dt    FOREIGN KEY (ma_dt)    REFERENCES don_thuoc(ma_dt) ON DELETE CASCADE,
    CONSTRAINT fk_ctdt_thuoc FOREIGN KEY (ma_thuoc) REFERENCES thuoc(ma_thuoc),
    CONSTRAINT ck_ctdt_sl CHECK (so_luong > 0)
);

-- Chỉ mục phục vụ truy vấn thường dùng
CREATE INDEX idx_lk_bn    ON lich_kham(ma_bn);
CREATE INDEX idx_lk_ngay  ON lich_kham(ngay_gio_kham);
CREATE INDEX idx_llv_ngay ON lich_lam_viec(ngay_lam);
CREATE INDEX idx_ba_bn    ON benh_an(ma_bn);
CREATE INDEX idx_dt_ba    ON don_thuoc(ma_ba);
