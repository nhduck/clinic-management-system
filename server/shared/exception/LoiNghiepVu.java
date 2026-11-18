package clinic.shared.exception;

// Báo lỗi khi thao tác vi phạm quy tắc phòng khám
public class LoiNghiepVu extends Exception {
    public LoiNghiepVu(String thongBao) {
        super(thongBao);
    }

    public LoiNghiepVu(String thongBao, Throwable nguyenNhan) {
        super(thongBao, nguyenNhan);
    }
}
