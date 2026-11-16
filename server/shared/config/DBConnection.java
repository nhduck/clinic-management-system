package clinic.shared.config;

import java.io.FileInputStream;
import java.io.IOException;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.util.Properties;

/**
 * Kết nối JDBC tới PostgreSQL (chạy trong Docker). Cả nhóm dùng chung lớp này: try (Connection conn
 * = DBConnection.getConnection()) { ... } Mỗi lần gọi trả về một kết nối mới; người gọi phải đóng
 * (try-with-resources).
 *
 * <p>Thứ tự ưu tiên cấu hình: biến môi trường DB_URL / DB_USER / DB_PASSWORD, rồi file
 * db.properties (tùy chọn, không đưa lên GitHub), rồi giá trị mặc định khớp docker-compose.yml.
 */
public final class DBConnection {

    private static final String DEFAULT_URL = "jdbc:postgresql://localhost:5432/phong_kham";
    private static final String DEFAULT_USER = "pk_user";
    private static final String DEFAULT_PASSWORD = "pk_password";

    private static final Properties FILE = loadFile();

    private DBConnection() {}

    private static Properties loadFile() {
        Properties props = new Properties();
        try (FileInputStream in = new FileInputStream("db.properties")) {
            props.load(in);
        } catch (IOException ignored) {
            // không có db.properties thì dùng biến môi trường / mặc định
        }
        return props;
    }

    private static String get(String env, String key, String fallback) {
        String v = System.getenv(env);
        if (v != null && !v.isBlank()) return v;
        return FILE.getProperty(key, fallback);
    }

    public static Connection getConnection() throws SQLException {
        return DriverManager.getConnection(
                get("DB_URL", "db.url", DEFAULT_URL),
                get("DB_USER", "db.user", DEFAULT_USER),
                get("DB_PASSWORD", "db.password", DEFAULT_PASSWORD));
    }
}
