package clinic.dao;

import static clinic.util.CodeFormatter.*;
import static clinic.util.JsonInput.*;

import clinic.config.Database;
import clinic.exception.InputError;

import java.sql.*;
import java.time.LocalDate;
import java.util.*;

public class MedicalRecordDAO {
    public List<Map<String, Object>> findAll() throws SQLException {
        List<Map<String, Object>> records = new ArrayList<>();
        try (Connection c = Database.connect()) {
            try (PreparedStatement p =
                            c.prepareStatement(
                                    "SELECT ba.ma_ba, ba.ma_bn, lk.ngay_gio_kham::date,"
                                        + " ba.trieu_chung, ba.chan_doan, ba.ghi_chu FROM benh_an"
                                        + " ba JOIN lich_kham lk ON lk.ma_lk = ba.ma_lk ORDER BY"
                                        + " ba.ma_ba DESC");
                    ResultSet r = p.executeQuery()) {
                while (r.next()) {
                    Map<String, Object> item = new LinkedHashMap<>();
                    item.put("id", recordCode(r.getInt(1)));
                    item.put("pid", patientCode(r.getInt(2)));
                    item.put("date", r.getDate(3).toString());
                    item.put("sym", nz(r.getString(4)));
                    item.put("dx", nz(r.getString(5)));
                    item.put("note", nz(r.getString(6)));
                    records.add(item);
                }
            }
        }
        return records;
    }

    public Map<String, String> create(
            int patientId, LocalDate date, String symptoms, String diagnosis, String note)
            throws SQLException {
        try (Connection c = Database.connect()) {
            c.setAutoCommit(false);
            try {
                int lk = -1;
                try (PreparedStatement p =
                        c.prepareStatement(
                                "SELECT lk.ma_lk FROM lich_kham lk WHERE lk.ma_bn = ? AND"
                                    + " lk.ngay_gio_kham::date = ? AND lk.trang_thai <> 'Đã hủy'"
                                    + " AND NOT EXISTS (SELECT 1 FROM benh_an b WHERE b.ma_lk ="
                                    + " lk.ma_lk) ORDER BY lk.ngay_gio_kham LIMIT 1 FOR UPDATE")) {
                    p.setInt(1, patientId);
                    p.setDate(2, java.sql.Date.valueOf(date));
                    try (ResultSet r = p.executeQuery()) {
                        if (r.next()) lk = r.getInt(1);
                    }
                }
                if (lk < 0)
                    throw new InputError(
                            "Bệnh nhân chưa có lịch khám (còn trống bệnh án) vào ngày "
                                    + date
                                    + ". Hãy đặt lịch khám trước hoặc chọn đúng ngày của lịch.");
                int id;
                try (PreparedStatement p =
                        c.prepareStatement(
                                "INSERT INTO benh_an(ma_lk, ma_bn, trieu_chung, chan_doan, ghi_chu)"
                                    + " VALUES (?,?,?,?,?) RETURNING ma_ba")) {
                    p.setInt(1, lk);
                    p.setInt(2, patientId);
                    p.setString(3, symptoms);
                    p.setString(4, diagnosis);
                    p.setString(5, note.isEmpty() ? null : note);
                    try (ResultSet keys = p.executeQuery()) {
                        if (!keys.next()) throw new SQLException("Không tạo được mã bệnh án");
                        id = keys.getInt(1);
                    }
                }
                try (PreparedStatement p =
                        c.prepareStatement(
                                "UPDATE lich_kham SET trang_thai = 'Đã khám' WHERE ma_lk = ?")) {
                    p.setInt(1, lk);
                    p.executeUpdate();
                }
                c.commit();
                return Map.of("id", recordCode(id));
            } catch (SQLException | RuntimeException ex) {
                c.rollback();
                throw ex;
            }
        }
    }
}
