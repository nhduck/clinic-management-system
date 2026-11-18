package clinic.shared.util;

// Định dạng mã để hiển thị trên giao diện
public class DinhDangMa {
    public static String maBenhNhan(int ma) {
        return String.format("BN%03d", ma);
    }

    public static String maBenhAn(int ma) {
        return String.format("BA%03d", ma);
    }

    public static String maDonThuoc(int ma) {
        return String.format("DT%03d", ma);
    }

    public static String maBacSi(int ma) {
        return String.format("BS%03d", ma);
    }

    public static String maLichKham(int ma) {
        return String.format("LK%03d", ma);
    }
}
