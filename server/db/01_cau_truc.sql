-- Danh mục chuyên khoa
CREATE TABLE chuyen_khoa (
    ma_ck INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    ten_ck VARCHAR(100) NOT NULL UNIQUE,
    mo_ta TEXT
);

-- Tài khoản và quyền truy cập
CREATE TABLE tai_khoan (
    ma_tk INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    ten_dang_nhap VARCHAR(50) NOT NULL UNIQUE,
    ho_ten VARCHAR(100) NOT NULL,
    mat_khau_hash VARCHAR(255) NOT NULL,
    vai_tro VARCHAR(20) NOT NULL,
    trang_thai VARCHAR(20) NOT NULL DEFAULT 'Chờ duyệt',
    ngay_tao TIMESTAMP(0) NOT NULL DEFAULT LOCALTIMESTAMP(0),

    CONSTRAINT ck_tk_vai_tro CHECK (
        vai_tro IN (
            'QUAN_TRI',
            'LE_TAN',
            'BAC_SI',
            'DUOC_SI',
            'BENH_NHAN'
        )
    ),

    CONSTRAINT ck_tk_trang_thai CHECK (
        trang_thai IN (
            'Chờ duyệt',
            'Hoạt động',
            'Từ chối',
            'Khóa'
        )
    )
);

-- Thông tin bệnh nhân
CREATE TABLE benh_nhan (
    ma_bn INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    ma_tk INT UNIQUE,
    ho_ten VARCHAR(100) NOT NULL,
    ngay_sinh DATE,
    gioi_tinh VARCHAR(10),
    sdt VARCHAR(15),
    cccd VARCHAR(12) UNIQUE,
    dia_chi VARCHAR(255),
    email VARCHAR(100),

    CONSTRAINT fk_bn_tk
        FOREIGN KEY (ma_tk) REFERENCES tai_khoan(ma_tk),

    CONSTRAINT ck_bn_gioi_tinh
        CHECK (gioi_tinh IN ('Nam', 'Nữ', 'Khác'))
);

-- Thông tin bác sĩ
CREATE TABLE bac_si (
    ma_bs INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    ma_tk INT NOT NULL UNIQUE,
    ma_ck INT NOT NULL,
    ho_ten VARCHAR(100) NOT NULL,
    sdt VARCHAR(15),
    email VARCHAR(100),
    hoc_vi VARCHAR(50),
    so_nam_kinh_nghiem INT,

    CONSTRAINT fk_bs_tk
        FOREIGN KEY (ma_tk) REFERENCES tai_khoan(ma_tk),

    CONSTRAINT fk_bs_ck
        FOREIGN KEY (ma_ck) REFERENCES chuyen_khoa(ma_ck),

    CONSTRAINT ck_bs_kn
        CHECK (so_nam_kinh_nghiem >= 0)
);

-- Ca làm việc của bác sĩ
CREATE TABLE lich_lam_viec (
    ma_llv INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    ma_bs INT NOT NULL,
    ngay_lam DATE NOT NULL,
    gio_bat_dau TIME(0) NOT NULL,
    gio_ket_thuc TIME(0) NOT NULL,
    thoi_luong_slot INT NOT NULL DEFAULT 30,
    so_slot_toi_da INT NOT NULL,
    trang_thai VARCHAR(20) NOT NULL DEFAULT 'Mở',

    CONSTRAINT fk_llv_bs
        FOREIGN KEY (ma_bs) REFERENCES bac_si(ma_bs),

    CONSTRAINT uq_llv_ca
        UNIQUE (ma_bs, ngay_lam, gio_bat_dau),

    CONSTRAINT ck_llv_gio
        CHECK (gio_ket_thuc > gio_bat_dau),

    CONSTRAINT ck_llv_slot
        CHECK (thoi_luong_slot > 0 AND so_slot_toi_da > 0),

    CONSTRAINT ck_llv_tt
        CHECK (trang_thai IN ('Mở', 'Đóng'))
);

-- Lịch hẹn của bệnh nhân
CREATE TABLE lich_kham (
    ma_lk INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    ma_bn INT NOT NULL,
    ma_bs INT NOT NULL,
    ma_llv INT NOT NULL,
    ngay_gio_kham TIMESTAMP(0) NOT NULL,
    ly_do_kham VARCHAR(255),
    trang_thai VARCHAR(20) NOT NULL DEFAULT 'Chờ khám',
    ngay_dat TIMESTAMP(0) NOT NULL DEFAULT LOCALTIMESTAMP(0),

    CONSTRAINT fk_lk_bn
        FOREIGN KEY (ma_bn) REFERENCES benh_nhan(ma_bn),

    CONSTRAINT fk_lk_bs
        FOREIGN KEY (ma_bs) REFERENCES bac_si(ma_bs),

    CONSTRAINT fk_lk_llv
        FOREIGN KEY (ma_llv) REFERENCES lich_lam_viec(ma_llv),

    CONSTRAINT ck_lk_tt
        CHECK (trang_thai IN ('Chờ khám', 'Đã khám', 'Đã hủy'))
);

-- Hồ sơ của từng lần khám
CREATE TABLE benh_an (
    ma_ba INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    ma_lk INT NOT NULL UNIQUE,
    ma_bn INT NOT NULL,
    trieu_chung TEXT,
    chan_doan TEXT,
    ket_luan TEXT,
    ghi_chu TEXT,
    ngay_lap TIMESTAMP(0) NOT NULL DEFAULT LOCALTIMESTAMP(0),

    CONSTRAINT fk_ba_lk
        FOREIGN KEY (ma_lk) REFERENCES lich_kham(ma_lk),

    CONSTRAINT fk_ba_bn
        FOREIGN KEY (ma_bn) REFERENCES benh_nhan(ma_bn)
);

-- Đơn thuốc của bệnh án
CREATE TABLE don_thuoc (
    ma_dt INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    ma_ba INT NOT NULL,
    ngay_ke TIMESTAMP(0) NOT NULL DEFAULT LOCALTIMESTAMP(0),
    loi_dan TEXT,
    trang_thai VARCHAR(20) NOT NULL DEFAULT 'Chưa cấp phát',

    CONSTRAINT fk_dt_ba
        FOREIGN KEY (ma_ba) REFERENCES benh_an(ma_ba),

    CONSTRAINT ck_dt_tt
        CHECK (trang_thai IN ('Chưa cấp phát', 'Đã cấp phát', 'Đã hủy'))
);

-- Danh mục thuốc
CREATE TABLE thuoc (
    ma_thuoc INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    ten_thuoc VARCHAR(150) NOT NULL,
    hoat_chat VARCHAR(150),
    don_vi_tinh VARCHAR(20) NOT NULL,
    don_gia NUMERIC(12, 2) NOT NULL,
    so_luong_ton INT NOT NULL DEFAULT 0,
    huong_dan_su_dung TEXT,

    CONSTRAINT ck_thuoc_gia
        CHECK (don_gia >= 0),

    CONSTRAINT ck_thuoc_ton
        CHECK (so_luong_ton >= 0)
);

-- Thuốc và hướng dẫn dùng trong đơn
CREATE TABLE chi_tiet_don_thuoc (
    ma_dt INT NOT NULL,
    ma_thuoc INT NOT NULL,
    so_luong INT NOT NULL,
    lieu_dung VARCHAR(100),
    tan_suat VARCHAR(100),
    so_ngay_dung INT,
    cach_dung VARCHAR(255),

    CONSTRAINT pk_ctdt
        PRIMARY KEY (ma_dt, ma_thuoc),

    CONSTRAINT fk_ctdt_dt
        FOREIGN KEY (ma_dt)
        REFERENCES don_thuoc(ma_dt)
        ON DELETE CASCADE,

    CONSTRAINT fk_ctdt_thuoc
        FOREIGN KEY (ma_thuoc) REFERENCES thuoc(ma_thuoc),

    CONSTRAINT ck_ctdt_sl
        CHECK (so_luong > 0)
);

CREATE UNIQUE INDEX uq_lk_bs_slot
ON lich_kham(ma_bs, ngay_gio_kham)
WHERE trang_thai <> 'Đã hủy';

CREATE UNIQUE INDEX uq_thuoc_ten
ON thuoc(LOWER(ten_thuoc));

CREATE INDEX idx_lk_bn
ON lich_kham(ma_bn);

CREATE INDEX idx_lk_ngay
ON lich_kham(ngay_gio_kham);

CREATE INDEX idx_llv_ngay
ON lich_lam_viec(ngay_lam);

CREATE INDEX idx_ba_bn
ON benh_an(ma_bn);

CREATE INDEX idx_dt_ba
ON don_thuoc(ma_ba);