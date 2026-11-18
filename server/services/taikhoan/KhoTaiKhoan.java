package clinic.services.taikhoan;
import clinic.shared.config.CoSoDuLieu;
import java.sql.*;
import java.util.*;

// Đọc và cập nhật tài khoản trong cơ sở dữ liệu
public class KhoTaiKhoan {
    private static final String SELECT = """
            SELECT t.ma_tk,
                   t.ten_dang_nhap,
                   COALESCE(
                       t.ho_ten,
                       b.ho_ten,
                       t.ten_dang_nhap
                   ) AS ten,
                   t.vai_tro,
                   t.trang_thai,
                   t.mat_khau_hash,
                   b.ma_bs
            FROM tai_khoan t
            LEFT JOIN bac_si b ON b.ma_tk = t.ma_tk
            """;

    public TaiKhoan timTheoTen(String tenNhap) throws SQLException {
        return find(" WHERE t.ten_dang_nhap = ?", tenNhap);
    }

    public TaiKhoan timTheoMa(int ma) throws SQLException {
        return find(" WHERE t.ma_tk = ?", ma);
    }

    private TaiKhoan find(String dieuKien, Object giaTri)
            throws SQLException {

        try (
                Connection ketNoi = CoSoDuLieu.connect();
                PreparedStatement lenh = ketNoi.prepareStatement(
                        SELECT + dieuKien
                )
        ) {
            lenh.setObject(1, giaTri);

            try (ResultSet bangKetQua = lenh.executeQuery()) {
                if (bangKetQua.next()) {
                    return read(bangKetQua);
                }
                return null;
            }
        }
    }

    private TaiKhoan read(ResultSet bangKetQua) throws SQLException {
        int bacSi = bangKetQua.getInt("ma_bs");

        String maBacSi = bangKetQua.wasNull()
                ? ""
                : "BS" + String.format("%03d", bacSi);

        return new TaiKhoan(
                bangKetQua.getInt("ma_tk"),
                bangKetQua.getString("ten_dang_nhap"),
                bangKetQua.getString("ten"),
                bangKetQua.getString("vai_tro"),
                bangKetQua.getString("trang_thai"),
                bangKetQua.getString("mat_khau_hash"),
                maBacSi
        );
    }

    public void register(
            String tenNhap,
            String ten,
            String matKhau,
            String vaiTro
    ) throws SQLException {

        String cauSql = """
                INSERT INTO tai_khoan (
                    ten_dang_nhap,
                    ho_ten,
                    mat_khau_hash,
                    vai_tro,
                    trang_thai
                )
                VALUES (?, ?, ?, ?, 'Chờ duyệt')
                """;

        String maBam = MatKhau.bam(matKhau);

        try (
                Connection ketNoi = CoSoDuLieu.connect();
                PreparedStatement lenh = ketNoi.prepareStatement(cauSql)
        ) {
            lenh.setString(1, tenNhap);
            lenh.setString(2, ten);
            lenh.setString(3, maBam);
            lenh.setString(4, vaiTro);

            lenh.executeUpdate();
        }
    }

    public List<Map<String, Object>> layTatCa() throws SQLException {
        List<Map<String, Object>> ketQua = new ArrayList<>();

        try (
                Connection ketNoi = CoSoDuLieu.connect();
                PreparedStatement lenh = ketNoi.prepareStatement(
                        SELECT + " ORDER BY t.ma_tk DESC"
                );
                ResultSet bangKetQua = lenh.executeQuery()
        ) {
            while (bangKetQua.next()) {
                ketQua.add(duLieuCongKhai(read(bangKetQua)));
            }
        }

        return ketQua;
    }

    public boolean review(int ma, String trangThai) throws SQLException {
        String cauSql = """
                UPDATE tai_khoan
                SET trang_thai = ?
                WHERE ma_tk = ?
                  AND trang_thai = 'Chờ duyệt'
                """;

        try (
                Connection ketNoi = CoSoDuLieu.connect();
                PreparedStatement lenh = ketNoi.prepareStatement(cauSql)
        ) {
            lenh.setString(1, trangThai);
            lenh.setInt(2, ma);

            return lenh.executeUpdate() == 1;
        }
    }

    public static Map<String, Object> duLieuCongKhai(TaiKhoan taiKhoan) {
        String vaiTro = switch (taiKhoan.vaiTro()) {
            case "QUAN_TRI" -> "Quản trị";
            case "BAC_SI" -> "Bác sĩ";
            case "LE_TAN" -> "Lễ tân";
            default -> taiKhoan.vaiTro();
        };

        return Map.of(
                "id", taiKhoan.ma(),
                "u", taiKhoan.tenNhap(),
                "n", taiKhoan.ten(),
                "r", vaiTro,
                "status", taiKhoan.trangThai(),
                "bs", taiKhoan.maBacSi()
        );
    }
}
