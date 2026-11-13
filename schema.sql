-- Tham khảo cấu trúc SQLite. App tự tạo bảng và bệnh nhân mẫu lần đầu khởi động.
CREATE TABLE IF NOT EXISTS benh_nhan (id TEXT PRIMARY KEY, ho_ten TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS benh_an (id INTEGER PRIMARY KEY AUTOINCREMENT, benh_nhan_id TEXT NOT NULL REFERENCES benh_nhan(id), ngay_kham TEXT NOT NULL, trieu_chung TEXT NOT NULL, chan_doan TEXT NOT NULL, ghi_chu TEXT);
CREATE TABLE IF NOT EXISTS don_thuoc (id INTEGER PRIMARY KEY AUTOINCREMENT, benh_an_id INTEGER NOT NULL UNIQUE REFERENCES benh_an(id), ngay_ke TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS chi_tiet_don (id INTEGER PRIMARY KEY AUTOINCREMENT, don_thuoc_id INTEGER NOT NULL REFERENCES don_thuoc(id), ten_thuoc TEXT NOT NULL, lieu_dung TEXT NOT NULL, so_luong INTEGER NOT NULL CHECK(so_luong>0), cach_dung TEXT NOT NULL);

-- CRUD danh mục thuốc; app tự tạo bảng và dữ liệu mẫu nếu cần.
CREATE TABLE IF NOT EXISTS thuoc (id INTEGER PRIMARY KEY AUTOINCREMENT, ten_thuoc TEXT NOT NULL UNIQUE COLLATE NOCASE);
CREATE TABLE IF NOT EXISTS app_meta (key TEXT PRIMARY KEY, value TEXT NOT NULL);
