package clinic.shared.config;

import java.sql.Connection;
import java.sql.SQLException;

// Kiểm tra các bảng cần thiết khi khởi động
public class CoSoDuLieu {

    public static Connection connect() throws SQLException {
        return KetNoi.getConnection();
    }

    public static void initialize() throws SQLException {
        try (Connection ketNoi = connect();
                var lenh = ketNoi.createStatement();
                var bangKetQua =
                        lenh.executeQuery(
                                """
                    SELECT COUNT(*)
                    FROM information_schema.tables
                    WHERE table_schema = 'public'
                    AND table_name IN ('benh_nhan','lich_kham','benh_an','don_thuoc','chi_tiet_don_thuoc','thuoc')
                    """)) {
            bangKetQua.next();
            if (bangKetQua.getInt(1) < 6) {
                throw new SQLException(
                        "Chưa có schema. Chạy 'docker compose up -d' (lần đầu) hoặc xem README.");
            }
        }
        System.out.println("[OK] Đã kết nối PostgreSQL.");
    }
}
