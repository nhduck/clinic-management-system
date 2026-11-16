package clinic.services.prescriptions.dao;

import static clinic.shared.util.CodeFormatter.*;
import static clinic.shared.util.JsonInput.*;

import clinic.shared.config.Database;
import clinic.shared.exception.InputError;

import java.sql.*;
import java.util.*;

public class PrescriptionDAO {
    public List<Map<String, Object>> findAll() throws SQLException {
        List<Map<String, Object>> prescriptions = new ArrayList<>();
        Map<Integer, List<Map<String, Object>>> linesByRx = new LinkedHashMap<>();
        try (Connection c = Database.connect()) {
            try (PreparedStatement p =
                            c.prepareStatement(
                                    "SELECT ct.ma_dt, t.ten_thuoc, ct.lieu_dung, ct.tan_suat,"
                                        + " ct.so_luong, ct.cach_dung FROM chi_tiet_don_thuoc ct"
                                        + " JOIN thuoc t ON t.ma_thuoc = ct.ma_thuoc ORDER BY"
                                        + " ct.ma_dt, ct.ma_thuoc");
                    ResultSet r = p.executeQuery()) {
                while (r.next()) {
                    String dose = nz(r.getString(3));
                    String freq = nz(r.getString(4));
                    if (!freq.isEmpty()) dose = dose.isEmpty() ? freq : dose + ", " + freq;
                    linesByRx
                            .computeIfAbsent(r.getInt(1), k -> new ArrayList<>())
                            .add(
                                    Map.of(
                                            "d",
                                            r.getString(2),
                                            "dose",
                                            dose,
                                            "qty",
                                            r.getInt(5),
                                            "use",
                                            nz(r.getString(6))));
                }
            }
            try (PreparedStatement p =
                            c.prepareStatement(
                                    "SELECT ma_dt, ma_ba, ngay_ke::date FROM don_thuoc ORDER BY"
                                            + " ma_dt DESC");
                    ResultSet r = p.executeQuery()) {
                while (r.next()) {
                    Map<String, Object> item = new LinkedHashMap<>();
                    int id = r.getInt(1);
                    item.put("id", prescriptionCode(id));
                    item.put("rid", recordCode(r.getInt(2)));
                    item.put("date", r.getDate(3).toString());
                    item.put("lines", linesByRx.getOrDefault(id, List.of()));
                    prescriptions.add(item);
                }
            }
        }
        return prescriptions;
    }

    public Map<String, String> create(int recordId, List<Map<String, Object>> items)
            throws SQLException {
        try (Connection c = Database.connect()) {
            c.setAutoCommit(false);
            try {
                // Khóa dòng bệnh án để hai người không cùng kê đơn cho một bệnh án.
                try (PreparedStatement p =
                        c.prepareStatement("SELECT 1 FROM benh_an WHERE ma_ba = ? FOR UPDATE")) {
                    p.setInt(1, recordId);
                    try (ResultSet r = p.executeQuery()) {
                        if (!r.next()) throw new InputError("Bệnh án không tồn tại.");
                    }
                }
                try (PreparedStatement p =
                        c.prepareStatement("SELECT 1 FROM don_thuoc WHERE ma_ba = ?")) {
                    p.setInt(1, recordId);
                    try (ResultSet r = p.executeQuery()) {
                        if (r.next()) throw new InputError("Bệnh án này đã có đơn thuốc.");
                    }
                }
                // Tên thuốc -> mã thuốc (chi_tiet_don_thuoc lưu khóa ngoại tới danh mục thuốc).
                List<Integer> drugIds = new ArrayList<>();
                for (Map<String, Object> item : items) {
                    try (PreparedStatement p =
                            c.prepareStatement("SELECT ma_thuoc FROM thuoc WHERE ten_thuoc = ?")) {
                        p.setString(1, (String) item.get("d"));
                        try (ResultSet r = p.executeQuery()) {
                            if (!r.next())
                                throw new InputError(
                                        "Thuốc không còn trong danh mục: " + item.get("d"));
                            int id = r.getInt(1);
                            if (drugIds.contains(id))
                                throw new InputError("Thuốc bị trùng trong đơn: " + item.get("d"));
                            drugIds.add(id);
                        }
                    }
                }
                int rxId;
                try (PreparedStatement p =
                        c.prepareStatement(
                                "INSERT INTO don_thuoc(ma_ba) VALUES (?) RETURNING ma_dt")) {
                    p.setInt(1, recordId);
                    try (ResultSet keys = p.executeQuery()) {
                        if (!keys.next()) throw new SQLException("Không tạo được mã đơn thuốc");
                        rxId = keys.getInt(1);
                    }
                }
                try (PreparedStatement p =
                        c.prepareStatement(
                                "INSERT INTO chi_tiet_don_thuoc(ma_dt, ma_thuoc, so_luong,"
                                        + " lieu_dung, cach_dung) VALUES (?,?,?,?,?)")) {
                    for (int i = 0; i < items.size(); i++) {
                        Map<String, Object> item = items.get(i);
                        p.setInt(1, rxId);
                        p.setInt(2, drugIds.get(i));
                        p.setInt(3, (Integer) item.get("qty"));
                        p.setString(4, (String) item.get("dose"));
                        p.setString(5, (String) item.get("use"));
                        p.addBatch();
                    }
                    p.executeBatch();
                }
                c.commit();
                return Map.of("id", prescriptionCode(rxId));
            } catch (SQLException | RuntimeException ex) {
                c.rollback();
                throw ex;
            }
        }
    }
}
