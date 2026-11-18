package clinic.services.thuoc.kho;

import static clinic.shared.util.DinhDangMa.*;
import static clinic.shared.util.DocJson.*;

import clinic.shared.config.CoSoDuLieu;
import clinic.shared.exception.LoiDuLieu;

import java.sql.*;
import java.util.*;

// Tra cứu và cập nhật danh mục thuốc
public class KhoThuoc {
    public List<Map<String, Object>> docThuoc(Connection ketNoi) throws SQLException {
        List<Map<String, Object>> thuoc = new ArrayList<>();
        try (PreparedStatement lenh =
                        ketNoi.prepareStatement(
                                "SELECT ma_thuoc, ten_thuoc FROM thuoc ORDER BY lower(ten_thuoc)");
                ResultSet dong = lenh.executeQuery()) {
            while (dong.next()) thuoc.add(Map.of("id", dong.getInt(1), "name", dong.getString(2)));
        }
        return thuoc;
    }

    public List<Map<String, Object>> layTatCa() throws SQLException {
        try (Connection ketNoi = CoSoDuLieu.connect()) {
            return docThuoc(ketNoi);
        }
    }

    public Map<String, Object> create(String ten) throws SQLException {
        try (Connection ketNoi = CoSoDuLieu.connect();
                PreparedStatement lenh =
                        ketNoi.prepareStatement(
                                """
                    INSERT INTO thuoc(ten_thuoc, don_vi_tinh, don_gia, so_luong_ton)
                    VALUES (?, 'Viên', 0, 0)
                    RETURNING ma_thuoc
                    """)) {
            lenh.setString(1, ten);
            try (ResultSet cacMa = lenh.executeQuery()) {
                cacMa.next();
                return Map.of("id", cacMa.getInt(1), "name", ten);
            }
        }
    }

    public Map<String, Object> update(int ma, String ten) throws SQLException {
        try (Connection ketNoi = CoSoDuLieu.connect();
                PreparedStatement lenh =
                        ketNoi.prepareStatement("UPDATE thuoc SET ten_thuoc=? WHERE ma_thuoc=?")) {
            lenh.setString(1, ten);
            lenh.setInt(2, ma);
            if (lenh.executeUpdate() == 0) {
                throw new LoiDuLieu("Không tìm thấy thuốc cần sửa.");
            }
        }
        return Map.of("id", ma, "name", ten);
    }

    public void delete(int ma) throws SQLException {
        try (Connection ketNoi = CoSoDuLieu.connect();
                PreparedStatement lenh = ketNoi.prepareStatement("DELETE FROM thuoc WHERE ma_thuoc=?")) {
            lenh.setInt(1, ma);
            if (lenh.executeUpdate() == 0) {
                throw new LoiDuLieu("Không tìm thấy thuốc cần xóa.");
            }
        }
    }
}
