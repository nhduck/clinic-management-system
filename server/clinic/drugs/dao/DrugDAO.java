package clinic.drugs.dao;

import static clinic.shared.util.CodeFormatter.*;
import static clinic.shared.util.JsonInput.*;

import clinic.shared.config.Database;
import clinic.shared.exception.InputError;

import java.sql.*;
import java.util.*;

public class DrugDAO {
    public List<Map<String, Object>> readDrugs(Connection c) throws SQLException {
        List<Map<String, Object>> drugs = new ArrayList<>();
        try (PreparedStatement p =
                        c.prepareStatement(
                                "SELECT ma_thuoc, ten_thuoc FROM thuoc ORDER BY lower(ten_thuoc)");
                ResultSet r = p.executeQuery()) {
            while (r.next()) drugs.add(Map.of("id", r.getInt(1), "name", r.getString(2)));
        }
        return drugs;
    }

    public List<Map<String, Object>> findAll() throws SQLException {
        try (Connection c = Database.connect()) {
            return readDrugs(c);
        }
    }

    public Map<String, Object> create(String name) throws SQLException {
        try (Connection c = Database.connect();
                PreparedStatement p =
                        c.prepareStatement(
                                "INSERT INTO thuoc(ten_thuoc, don_vi_tinh, don_gia, so_luong_ton)"
                                        + " VALUES (?, 'Viên', 0, 0) RETURNING ma_thuoc")) {
            p.setString(1, name);
            try (ResultSet ids = p.executeQuery()) {
                ids.next();
                return Map.of("id", ids.getInt(1), "name", name);
            }
        }
    }

    public Map<String, Object> update(int id, String name) throws SQLException {
        try (Connection c = Database.connect();
                PreparedStatement p =
                        c.prepareStatement("UPDATE thuoc SET ten_thuoc=? WHERE ma_thuoc=?")) {
            p.setString(1, name);
            p.setInt(2, id);
            if (p.executeUpdate() == 0) throw new InputError("Không tìm thấy thuốc cần sửa.");
        }
        return Map.of("id", id, "name", name);
    }

    public void delete(int id) throws SQLException {
        try (Connection c = Database.connect();
                PreparedStatement p = c.prepareStatement("DELETE FROM thuoc WHERE ma_thuoc=?")) {
            p.setInt(1, id);
            if (p.executeUpdate() == 0) throw new InputError("Không tìm thấy thuốc cần xóa.");
        }
    }
}
