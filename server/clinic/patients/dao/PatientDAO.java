package clinic.patients.dao;

import static clinic.shared.util.CodeFormatter.*;
import static clinic.shared.util.JsonInput.*;

import clinic.shared.config.Database;

import java.sql.*;
import java.util.*;

public class PatientDAO {
    public List<Map<String, Object>> findAll() throws SQLException {
        List<Map<String, Object>> patients = new ArrayList<>();
        try (Connection c = Database.connect()) {
            try (PreparedStatement p =
                            c.prepareStatement(
                                    "SELECT ma_bn, ho_ten, ngay_sinh, gioi_tinh FROM benh_nhan"
                                            + " ORDER BY ma_bn");
                    ResultSet r = p.executeQuery()) {
                while (r.next()) {
                    java.sql.Date dob = r.getDate(3);
                    patients.add(
                            Map.of(
                                    "id",
                                    patientCode(r.getInt(1)),
                                    "n",
                                    r.getString(2),
                                    "dob",
                                    dob == null ? "" : dob.toString(),
                                    "g",
                                    r.getString(4) == null ? "—" : r.getString(4)));
                }
            }
        }
        return patients;
    }
}
