package clinic.config;

import java.sql.Connection;
import java.sql.SQLException;

/**
 * Cổng kết nối cho phần web; dùng chung DBConnection với phần console (PostgreSQL trong Docker).
 */
public class Database {

    public static Connection connect() throws SQLException {
        return DBConnection.getConnection();
    }

    /**
     * Schema và dữ liệu mẫu do Docker tạo (db/init/*.sql). Ở đây chỉ kiểm tra kết nối và schema.
     */
    public static void initialize() throws SQLException {
        try (Connection c = connect();
                var st = c.createStatement();
                var rs =
                        st.executeQuery(
                                "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema"
                                    + " = 'public' AND table_name IN "
                                    + "('benh_nhan','lich_kham','benh_an','don_thuoc','chi_tiet_don_thuoc','thuoc')")) {
            rs.next();
            if (rs.getInt(1) < 6) {
                throw new SQLException(
                        "Chưa có schema. Chạy 'docker compose up -d' (lần đầu) hoặc xem README.");
            }
        }
        System.out.println("[OK] Đã kết nối PostgreSQL.");
    }
}
