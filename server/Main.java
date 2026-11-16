package clinic;

import clinic.shared.config.DBConnection;

import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;

/** Điểm khởi chạy. Hiện tại chỉ kiểm tra kết nối database. */
public class Main {

    public static void main(String[] args) {
        try (Connection conn = DBConnection.getConnection();
                Statement st = conn.createStatement();
                ResultSet rs = st.executeQuery("SELECT ma_bs, ho_ten FROM bac_si ORDER BY ma_bs")) {

            System.out.println("Kết nối database thành công. Danh sách bác sĩ:");
            while (rs.next()) {
                System.out.println("  " + rs.getInt("ma_bs") + " - " + rs.getString("ho_ten"));
            }
        } catch (SQLException e) {
            System.err.println("Kết nối thất bại: " + e.getMessage());
        }
    }
}
