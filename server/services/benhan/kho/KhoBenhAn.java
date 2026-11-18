package clinic.services.benhan.kho;

import static clinic.shared.util.DinhDangMa.*;
import static clinic.shared.util.DocJson.*;

import clinic.shared.config.CoSoDuLieu;
import clinic.shared.exception.LoiDuLieu;

import java.sql.*;
import java.time.LocalDate;
import java.util.*;

// Lưu bệnh án và cập nhật lịch khám
public class KhoBenhAn {
    public List<Map<String, Object>> layTatCa() throws SQLException {
        List<Map<String, Object>> benhAn = new ArrayList<>();
        try (Connection ketNoi = CoSoDuLieu.connect()) {
            String sqlBenhAn = """
                    SELECT ba.ma_ba, ba.ma_bn, lk.ngay_gio_kham::date, ba.trieu_chung, ba.chan_doan, ba.ghi_chu
                    FROM benh_an ba
                    JOIN lich_kham lk ON lk.ma_lk = ba.ma_lk
                    ORDER BY ba.ma_ba DESC
                    """;
            try (PreparedStatement lenh = ketNoi.prepareStatement(sqlBenhAn);
                    ResultSet dong = lenh.executeQuery()) {
                while (dong.next()) {
                    Map<String, Object> muc = new LinkedHashMap<>();
                    muc.put("id", maBenhAn(dong.getInt(1)));
                    muc.put("pid", maBenhNhan(dong.getInt(2)));
                    muc.put("date", dong.getDate(3).toString());
                    muc.put("sym", chuoiRong(dong.getString(4)));
                    muc.put("dx", chuoiRong(dong.getString(5)));
                    muc.put("note", chuoiRong(dong.getString(6)));
                    benhAn.add(muc);
                }
            }
        }
        return benhAn;
    }

    public Map<String, String> create(
            int maBenhNhan, LocalDate ngay, String trieuChung, String chanDoan, String ghiChu)
            throws SQLException {
        try (Connection ketNoi = CoSoDuLieu.connect()) {
            ketNoi.setAutoCommit(false);
            try {
                // Tìm lần khám chưa có bệnh án của bệnh nhân
                int lichKham = -1;
                String sqlLich = """
                        SELECT lk.ma_lk
                        FROM lich_kham lk
                        WHERE lk.ma_bn = ?
                        AND lk.ngay_gio_kham::date = ?
                        AND lk.trang_thai <> 'Đã hủy'
                        AND NOT EXISTS (SELECT 1
                        FROM benh_an b
                        WHERE b.ma_lk = lk.ma_lk)
                        ORDER BY lk.ngay_gio_kham LIMIT 1 FOR UPDATE
                        """;
                try (PreparedStatement lenh = ketNoi.prepareStatement(sqlLich)) {
                    lenh.setInt(1, maBenhNhan);
                    lenh.setDate(2, java.sql.Date.valueOf(ngay));
                    try (ResultSet dong = lenh.executeQuery()) {
                        if (dong.next()) lichKham = dong.getInt(1);
                    }
                }
                if (lichKham < 0)
                    throw new LoiDuLieu(
                            "Bệnh nhân chưa có lịch khám (còn trống bệnh án) vào ngày "
                                    + ngay
                                    + ". Hãy đặt lịch khám trước hoặc chọn đúng ngày của lịch.");
                int ma;
                String sqlLuuBenhAn = """
                        INSERT INTO benh_an(ma_lk, ma_bn, trieu_chung, chan_doan, ghi_chu)
                        VALUES (?,?,?,?,?)
                        RETURNING ma_ba
                        """;
                try (PreparedStatement lenh = ketNoi.prepareStatement(sqlLuuBenhAn)) {
                    lenh.setInt(1, lichKham);
                    lenh.setInt(2, maBenhNhan);
                    lenh.setString(3, trieuChung);
                    lenh.setString(4, chanDoan);
                    lenh.setString(5, ghiChu.isEmpty() ? null : ghiChu);
                    try (ResultSet khoaMoi = lenh.executeQuery()) {
                        if (!khoaMoi.next()) {
                            throw new SQLException("Không tạo được mã bệnh án");
                        }
                        ma = khoaMoi.getInt(1);
                    }
                }
                try (PreparedStatement lenh =
                        ketNoi.prepareStatement(
                                "UPDATE lich_kham SET trang_thai = 'Đã khám' WHERE ma_lk = ?")) {
                    lenh.setInt(1, lichKham);
                    lenh.executeUpdate();
                }
                // Xác nhận cả bệnh án và trạng thái lịch khám
                ketNoi.commit();
                return Map.of("id", maBenhAn(ma));
            } catch (SQLException | RuntimeException loi) {
                ketNoi.rollback();
                throw loi;
            }
        }
    }
}
