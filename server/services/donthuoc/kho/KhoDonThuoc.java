package clinic.services.donthuoc.kho;

import static clinic.shared.util.DinhDangMa.*;
import static clinic.shared.util.DocJson.*;

import clinic.shared.config.CoSoDuLieu;
import clinic.shared.exception.LoiDuLieu;

import java.sql.*;
import java.util.*;

// Tra cứu và lưu đơn thuốc theo bệnh án
public class KhoDonThuoc {
    public List<Map<String, Object>> layTatCa() throws SQLException {
        List<Map<String, Object>> donThuoc = new ArrayList<>();
        Map<Integer, List<Map<String, Object>>> thuocTheoDon = new LinkedHashMap<>();
        try (Connection ketNoi = CoSoDuLieu.connect()) {
            String sqlChiTiet = """
                    SELECT ct.ma_dt, t.ten_thuoc, ct.lieu_dung, ct.tan_suat, ct.so_luong, ct.cach_dung
                    FROM chi_tiet_don_thuoc ct
                    JOIN thuoc t ON t.ma_thuoc = ct.ma_thuoc
                    ORDER BY ct.ma_dt, ct.ma_thuoc
                    """;
            try (PreparedStatement lenh = ketNoi.prepareStatement(sqlChiTiet);
                    ResultSet dong = lenh.executeQuery()) {
                while (dong.next()) {
                    String lieuDung = chuoiRong(dong.getString(3));
                    String tanSuat = chuoiRong(dong.getString(4));
                    if (lieuDung.isEmpty()) {
                        lieuDung = tanSuat;
                    } else if (!tanSuat.isEmpty()) {
                        lieuDung += ", " + tanSuat;
                    }
                    int maDon = dong.getInt(1);
                    if (!thuocTheoDon.containsKey(maDon)) {
                        thuocTheoDon.put(maDon, new ArrayList<>());
                    }
                    Map<String, Object> thuoc = new LinkedHashMap<>();
                    thuoc.put("d", dong.getString(2));
                    thuoc.put("dose", lieuDung);
                    thuoc.put("qty", dong.getInt(5));
                    thuoc.put("use", chuoiRong(dong.getString(6)));
                    thuocTheoDon.get(maDon).add(thuoc);
                }
            }
            String sqlDon = """
                    SELECT ma_dt, ma_ba, ngay_ke::date
                    FROM don_thuoc
                    ORDER BY ma_dt DESC
                    """;
            try (PreparedStatement lenh = ketNoi.prepareStatement(sqlDon);
                    ResultSet dong = lenh.executeQuery()) {
                while (dong.next()) {
                    Map<String, Object> muc = new LinkedHashMap<>();
                    int ma = dong.getInt(1);
                    muc.put("id", maDonThuoc(ma));
                    muc.put("rid", maBenhAn(dong.getInt(2)));
                    muc.put("date", dong.getDate(3).toString());
                    muc.put("lines", thuocTheoDon.getOrDefault(ma, List.of()));
                    donThuoc.add(muc);
                }
            }
        }
        return donThuoc;
    }

    public Map<String, String> create(int maBenhAn, List<Map<String, Object>> cacMuc)
            throws SQLException {
        try (Connection ketNoi = CoSoDuLieu.connect()) {
            // Lưu đơn và các dòng thuốc trong cùng giao dịch
            ketNoi.setAutoCommit(false);
            try {
                kiemTraBenhAn(ketNoi, maBenhAn);
                List<Integer> cacMaThuoc = timMaThuoc(ketNoi, cacMuc);
                int maDon = taoDon(ketNoi, maBenhAn);
                luuChiTiet(ketNoi, maDon, cacMaThuoc, cacMuc);
                ketNoi.commit();
                return Map.of("id", maDonThuoc(maDon));
            } catch (SQLException | RuntimeException loi) {
                ketNoi.rollback();
                throw loi;
            }
        }
    }

    private void kiemTraBenhAn(Connection ketNoi, int maBenhAn) throws SQLException {
        // Khóa dòng bệnh án để hai người không cùng kê đơn cho một bệnh án
        try (PreparedStatement lenh =
                ketNoi.prepareStatement("SELECT 1 FROM benh_an WHERE ma_ba = ? FOR UPDATE")) {
            lenh.setInt(1, maBenhAn);
            try (ResultSet dong = lenh.executeQuery()) {
                if (!dong.next()) {
                    throw new LoiDuLieu("Bệnh án không tồn tại.");
                }
            }
        }
        try (PreparedStatement lenh =
                ketNoi.prepareStatement("SELECT 1 FROM don_thuoc WHERE ma_ba = ?")) {
            lenh.setInt(1, maBenhAn);
            try (ResultSet dong = lenh.executeQuery()) {
                if (dong.next()) {
                    throw new LoiDuLieu("Bệnh án này đã có đơn thuốc.");
                }
            }
        }
    }

    private List<Integer> timMaThuoc(Connection ketNoi, List<Map<String, Object>> cacMuc) throws SQLException {
        // Tra mã thuốc và phát hiện thuốc trùng
        List<Integer> cacMaThuoc = new ArrayList<>();
        for (Map<String, Object> muc : cacMuc) {
            try (PreparedStatement lenh =
                    ketNoi.prepareStatement("SELECT ma_thuoc FROM thuoc WHERE ten_thuoc = ?")) {
                lenh.setString(1, (String) muc.get("d"));
                try (ResultSet dong = lenh.executeQuery()) {
                    if (!dong.next())
                        throw new LoiDuLieu(
                                "Thuốc không còn trong danh mục: " + muc.get("d"));
                    int ma = dong.getInt(1);
                    if (cacMaThuoc.contains(ma))
                        throw new LoiDuLieu("Thuốc bị trùng trong đơn: " + muc.get("d"));
                    cacMaThuoc.add(ma);
                }
            }
        }
        return cacMaThuoc;
    }

    private int taoDon(Connection ketNoi, int maBenhAn) throws SQLException {
        int maDon;
        try (PreparedStatement lenh =
                ketNoi.prepareStatement(
                        "INSERT INTO don_thuoc(ma_ba) VALUES (?) RETURNING ma_dt")) {
            lenh.setInt(1, maBenhAn);
            try (ResultSet khoaMoi = lenh.executeQuery()) {
                if (!khoaMoi.next()) {
                    throw new SQLException("Không tạo được mã đơn thuốc");
                }
                maDon = khoaMoi.getInt(1);
            }
        }
        return maDon;
    }

    private void luuChiTiet(Connection ketNoi, int maDon, List<Integer> cacMaThuoc,
            List<Map<String, Object>> cacMuc) throws SQLException {
        String sqlChiTiet = """
                INSERT INTO chi_tiet_don_thuoc(ma_dt, ma_thuoc, so_luong, lieu_dung, cach_dung)
                VALUES (?,?,?,?,?)
                """;
        try (PreparedStatement lenh = ketNoi.prepareStatement(sqlChiTiet)) {
            for (int i = 0; i < cacMuc.size(); i++) {
                Map<String, Object> muc = cacMuc.get(i);
                lenh.setInt(1, maDon);
                lenh.setInt(2, cacMaThuoc.get(i));
                lenh.setInt(3, (Integer) muc.get("qty"));
                lenh.setString(4, (String) muc.get("dose"));
                lenh.setString(5, (String) muc.get("use"));
                lenh.addBatch();
            }
            lenh.executeBatch();
        }
    }
}
