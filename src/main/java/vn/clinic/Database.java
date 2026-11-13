package vn.clinic;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.sql.Statement;

public class Database {
    // SQLite: just a local file. No account, password, or MySQL server needed.
    private static final Path FILE = Paths.get(System.getProperty("user.dir"), "data", "clinic.db");

    public static Connection connect() throws SQLException {
        try { Files.createDirectories(FILE.getParent()); }
        catch (Exception e) { throw new SQLException("Khong tao duoc thu muc data: " + e.getMessage(), e); }
        Connection c = new org.sqlite.JDBC().connect("jdbc:sqlite:" + FILE.toAbsolutePath(), new java.util.Properties());
        if (c == null) throw new SQLException("Khong mo duoc SQLite database");
        try (Statement s = c.createStatement()) {
            s.execute("PRAGMA foreign_keys = ON");
            s.execute("PRAGMA busy_timeout = 5000");
        }
        return c;
    }

    // Creates schema and demo patients only on first run. Does not erase existing data.
    public static void initialize() throws SQLException {
        try (Connection c = connect(); Statement s = c.createStatement()) {
            s.executeUpdate("""
                CREATE TABLE IF NOT EXISTS benh_nhan (
                    id TEXT PRIMARY KEY,
                    ho_ten TEXT NOT NULL
                )
                """);
            s.executeUpdate("""
                CREATE TABLE IF NOT EXISTS benh_an (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    benh_nhan_id TEXT NOT NULL REFERENCES benh_nhan(id),
                    ngay_kham TEXT NOT NULL,
                    trieu_chung TEXT NOT NULL,
                    chan_doan TEXT NOT NULL,
                    ghi_chu TEXT
                )
                """);
            s.executeUpdate("""
                CREATE TABLE IF NOT EXISTS don_thuoc (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    benh_an_id INTEGER NOT NULL UNIQUE REFERENCES benh_an(id),
                    ngay_ke TEXT NOT NULL
                )
                """);
            s.executeUpdate("""
                CREATE TABLE IF NOT EXISTS chi_tiet_don (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    don_thuoc_id INTEGER NOT NULL REFERENCES don_thuoc(id),
                    ten_thuoc TEXT NOT NULL,
                    lieu_dung TEXT NOT NULL,
                    so_luong INTEGER NOT NULL CHECK (so_luong > 0),
                    cach_dung TEXT NOT NULL
                )
                """);
            s.executeUpdate("""
                CREATE TABLE IF NOT EXISTS thuoc (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    ten_thuoc TEXT NOT NULL UNIQUE COLLATE NOCASE
                )
                """);
            // Seed the medicine catalogue only once. Existing databases are preserved.
            s.executeUpdate("CREATE TABLE IF NOT EXISTS app_meta (key TEXT PRIMARY KEY, value TEXT NOT NULL)");
            try (PreparedStatement marker = c.prepareStatement("SELECT value FROM app_meta WHERE key='thuoc_seeded'");
                 java.sql.ResultSet seeded = marker.executeQuery()) {
                if (!seeded.next()) {
                    try (Statement countStatement = c.createStatement();
                         java.sql.ResultSet count = countStatement.executeQuery("SELECT COUNT(*) FROM thuoc")) {
                        if (count.next() && count.getInt(1) == 0) {
                            try (PreparedStatement meds = c.prepareStatement("INSERT OR IGNORE INTO thuoc(ten_thuoc) VALUES (?)")) {
                                for (String name : new String[]{"Paracetamol 500mg", "Amoxicillin 500mg", "Ibuprofen 400mg", "Cetirizine 10mg", "Omeprazole 20mg", "Vitamin C 500mg"}) {
                                    meds.setString(1, name); meds.addBatch();
                                }
                                meds.executeBatch();
                            }
                        }
                    }
                    s.executeUpdate("INSERT INTO app_meta(key,value) VALUES ('thuoc_seeded','1')");
                }
            }
            try (PreparedStatement ps = c.prepareStatement(
                    "INSERT OR IGNORE INTO benh_nhan(id,ho_ten) VALUES (?,?)")) {
                String[][] demo = {
                    {"BN001", "Trần Thị Mai"}, {"BN002", "Lê Quốc Hùng"},
                    {"BN003", "Phạm Minh Châu"}, {"BN004", "Võ Thanh Tùng"}
                };
                for (String[] row : demo) {
                    ps.setString(1, row[0]); ps.setString(2, row[1]); ps.addBatch();
                }
                ps.executeBatch();
            }
        }
        System.out.println("[OK] SQLite san sang: " + FILE.toAbsolutePath());
    }
}
