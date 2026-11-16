package clinic.health.service;

import clinic.shared.config.Database;

import java.sql.Connection;
import java.sql.SQLException;
import java.util.Map;

/** Kiểm tra kết nối database; Servlet không cần biết JDBC. */
public class HealthService {
    public Map<String, String> status() throws SQLException {
        try (Connection connection = Database.connect()) {
            if (!connection.isValid(3)) throw new SQLException("Database không phản hồi");
            return Map.of("status", "ok", "database", "connected");
        }
    }
}
