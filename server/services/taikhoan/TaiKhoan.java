package clinic.services.taikhoan;

// Lưu thông tin của một tài khoản
public record TaiKhoan(
        int ma,
        String tenNhap,
        String ten,
        String vaiTro,
        String trangThai,
        String maBam,
        String maBacSi
) {}
