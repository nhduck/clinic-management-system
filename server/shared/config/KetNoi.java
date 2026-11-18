package clinic.shared.config;

import java.io.FileInputStream;
import java.io.IOException;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.util.Properties;

// Kết nối PostgreSQL theo cấu hình của dự án
public final class KetNoi {

    private static final String URL_MAC_DINH =
            "jdbc:postgresql://"
                    + System.getenv().getOrDefault("DB_HOST", "localhost")
                    + ":"
                    + System.getenv().getOrDefault("DB_INTERNAL_PORT", "5432")
                    + "/"
                    + System.getenv().getOrDefault("DB_NAME", "phong_kham");
    private static final String TEN_MAC_DINH = "pk_user";
    private static final String MK_MAC_DINH = "pk_password";

    private static final Properties TEP_CAU_HINH = docCauHinh();

    private KetNoi() {}

    private static Properties docCauHinh() {
        Properties thuocTinh = new Properties();
        try (FileInputStream luongDoc = new FileInputStream("db.properties")) {
            thuocTinh.load(luongDoc);
        } catch (IOException boQua) {
            // không có dbproperties thì dùng biến môi trường / mặc định
        }
        return thuocTinh;
    }

    private static String get(String bienMoiTruong, String khoa, String macDinh) {
        String giaTri = System.getenv(bienMoiTruong);
        if (giaTri != null && !giaTri.isBlank()) {
            return giaTri;
        }
        return TEP_CAU_HINH.getProperty(khoa, macDinh);
    }

    public static Connection getConnection() throws SQLException {
        return DriverManager.getConnection(
                get("DB_URL", "db.url", URL_MAC_DINH),
                get("DB_USER", "db.user", TEN_MAC_DINH),
                get("DB_PASSWORD", "db.password", MK_MAC_DINH));
    }
}
