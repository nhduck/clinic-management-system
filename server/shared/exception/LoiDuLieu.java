package clinic.shared.exception;

// Báo lỗi khi dữ liệu gửi lên không hợp lệ
public class LoiDuLieu extends RuntimeException {
    public LoiDuLieu(String thongBao) {
        super(thongBao);
    }
}
