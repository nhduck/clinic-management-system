package clinic.services.benhnhan.kho;

import static clinic.shared.util.DinhDangMa.*;

import clinic.shared.config.CoSoDuLieu;

import java.sql.*;
import java.util.*;

// Đọc danh sách bệnh nhân
public class KhoBenhNhan {
    public List<Map<String, Object>> layTatCa() throws SQLException {
        List<Map<String, Object>> benhNhan = new ArrayList<>();
        String sql = "SELECT ma_bn, ho_ten, ngay_sinh, gioi_tinh FROM benh_nhan ORDER BY ma_bn";
        try (Connection ketNoi = CoSoDuLieu.connect();
             PreparedStatement lenh = ketNoi.prepareStatement(sql);
             ResultSet dong = lenh.executeQuery()) {
            while (dong.next()) {
                java.sql.Date ngaySinh = dong.getDate("ngay_sinh");
                String gioiTinh = dong.getString("gioi_tinh");
                if (gioiTinh == null) {
                    gioiTinh = "—";
                }

                Map<String, Object> muc = new LinkedHashMap<>();
                muc.put("id", maBenhNhan(dong.getInt("ma_bn")));
                muc.put("n", dong.getString("ho_ten"));
                muc.put("dob", ngaySinh == null ? "" : ngaySinh.toString());
                muc.put("g", gioiTinh);
                benhNhan.add(muc);
            }
        }
        return benhNhan;
    }
}
