package clinic.dao;

import clinic.config.DBConnection;
import clinic.model.LichKham;

import java.sql.Connection;
import java.sql.Date;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

public class LichKhamDAO {

    /** PostgreSQL: SQLState 23505 = unique_violation (UNIQUE constraint hoặc unique index). */
    public static boolean laTrungKhoa(SQLException e) {
        return "23505".equals(e.getSQLState());
    }

    /** PostgreSQL: 23503 = foreign_key_violation, 23514 = check_violation. */
    public static boolean laViPhamRangBuoc(SQLException e) {
        return "23503".equals(e.getSQLState()) || "23514".equals(e.getSQLState());
    }

    private static final String SELECT =
            "SELECT lk.ma_lk, lk.ma_bn, lk.ma_bs, lk.ma_llv, lk.ngay_gio_kham, lk.ly_do_kham, "
                    + "lk.trang_thai, lk.ngay_dat, bn.ho_ten AS ten_bn, bs.ho_ten AS ten_bs "
                    + "FROM lich_kham lk "
                    + "JOIN benh_nhan bn ON bn.ma_bn = lk.ma_bn "
                    + "JOIN bac_si bs ON bs.ma_bs = lk.ma_bs ";

    /** Tìm theo ngày / bác sĩ / trạng thái; tham số null nghĩa là không lọc. */
    public List<LichKham> search(LocalDate ngay, Integer maBs, String trangThai)
            throws SQLException {
        StringBuilder sql = new StringBuilder(SELECT).append("WHERE 1 = 1 ");
        List<Object> params = new ArrayList<>();
        if (ngay != null) {
            sql.append("AND CAST(lk.ngay_gio_kham AS DATE) = ? ");
            params.add(Date.valueOf(ngay));
        }
        if (maBs != null) {
            sql.append("AND lk.ma_bs = ? ");
            params.add(maBs);
        }
        if (trangThai != null) {
            sql.append("AND lk.trang_thai = ? ");
            params.add(trangThai);
        }
        sql.append("ORDER BY lk.ngay_gio_kham, lk.ma_lk");

        List<LichKham> ds = new ArrayList<>();
        try (Connection conn = DBConnection.getConnection();
                PreparedStatement ps = conn.prepareStatement(sql.toString())) {
            for (int i = 0; i < params.size(); i++) {
                ps.setObject(i + 1, params.get(i));
            }
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    ds.add(map(rs));
                }
            }
        }
        return ds;
    }

    public LichKham findById(int maLk) throws SQLException {
        try (Connection conn = DBConnection.getConnection();
                PreparedStatement ps = conn.prepareStatement(SELECT + "WHERE lk.ma_lk = ?")) {
            ps.setInt(1, maLk);
            try (ResultSet rs = ps.executeQuery()) {
                return rs.next() ? map(rs) : null;
            }
        }
    }

    /** Các giờ đã có lịch còn hiệu lực (không tính lịch đã hủy) của bác sĩ trong ngày. */
    public List<LocalTime> findGioDaDat(int maBs, LocalDate ngay) throws SQLException {
        String sql =
                "SELECT ngay_gio_kham FROM lich_kham "
                        + "WHERE ma_bs = ? AND CAST(ngay_gio_kham AS DATE) = ? AND trang_thai <> ?";
        List<LocalTime> ds = new ArrayList<>();
        try (Connection conn = DBConnection.getConnection();
                PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, maBs);
            ps.setDate(2, Date.valueOf(ngay));
            ps.setString(3, LichKham.DA_HUY);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    ds.add(rs.getTimestamp(1).toLocalDateTime().toLocalTime());
                }
            }
        }
        return ds;
    }

    /**
     * Bệnh nhân đã có lịch khác (còn hiệu lực) đúng giờ này chưa? bỏQua = mã lịch loại trừ (0 nếu
     * không).
     */
    public boolean benhNhanDaCoLich(int maBn, LocalDateTime thoiDiem, int boQuaMaLk)
            throws SQLException {
        String sql =
                "SELECT COUNT(*) FROM lich_kham WHERE ma_bn = ? AND ngay_gio_kham = ? AND"
                    + " trang_thai <> ? AND ma_lk <> ?";
        try (Connection conn = DBConnection.getConnection();
                PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, maBn);
            ps.setTimestamp(2, Timestamp.valueOf(thoiDiem));
            ps.setString(3, LichKham.DA_HUY);
            ps.setInt(4, boQuaMaLk);
            try (ResultSet rs = ps.executeQuery()) {
                rs.next();
                return rs.getInt(1) > 0;
            }
        }
    }

    /**
     * Thêm lịch khám, trả về mã lịch vừa tạo. Ném SQLException nếu trùng slot (xem laTrungKhoa).
     */
    public int insert(LichKham lk) throws SQLException {
        String sql =
                "INSERT INTO lich_kham (ma_bn, ma_bs, ma_llv, ngay_gio_kham, ly_do_kham,"
                    + " trang_thai) VALUES (?, ?, ?, ?, ?, ?)";
        try (Connection conn = DBConnection.getConnection();
                PreparedStatement ps = conn.prepareStatement(sql, new String[] {"ma_lk"})) {
            ps.setInt(1, lk.getMaBn());
            ps.setInt(2, lk.getMaBs());
            ps.setInt(3, lk.getMaLlv());
            ps.setTimestamp(4, Timestamp.valueOf(lk.getNgayGioKham()));
            ps.setString(5, lk.getLyDoKham());
            ps.setString(6, lk.getTrangThai());
            ps.executeUpdate();
            try (ResultSet keys = ps.getGeneratedKeys()) {
                keys.next();
                return keys.getInt(1);
            }
        }
    }

    /**
     * Đổi ca/giờ/lý do của lịch đang Chờ khám. Trả về false nếu không có dòng nào được cập nhật.
     */
    public boolean update(int maLk, int maLlv, int maBs, LocalDateTime thoiDiem, String lyDo)
            throws SQLException {
        String sql =
                "UPDATE lich_kham SET ma_llv = ?, ma_bs = ?, ngay_gio_kham = ?, ly_do_kham = ? "
                        + "WHERE ma_lk = ? AND trang_thai = ?";
        try (Connection conn = DBConnection.getConnection();
                PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, maLlv);
            ps.setInt(2, maBs);
            ps.setTimestamp(3, Timestamp.valueOf(thoiDiem));
            ps.setString(4, lyDo);
            ps.setInt(5, maLk);
            ps.setString(6, LichKham.CHO_KHAM);
            return ps.executeUpdate() > 0;
        }
    }

    /** Đổi trạng thái nếu lịch đang ở trạng thái {@code tu}. Dùng cho hủy lịch. */
    public boolean doiTrangThai(int maLk, String tu, String sang) throws SQLException {
        String sql = "UPDATE lich_kham SET trang_thai = ? WHERE ma_lk = ? AND trang_thai = ?";
        try (Connection conn = DBConnection.getConnection();
                PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, sang);
            ps.setInt(2, maLk);
            ps.setString(3, tu);
            return ps.executeUpdate() > 0;
        }
    }

    private LichKham map(ResultSet rs) throws SQLException {
        LichKham lk = new LichKham();
        lk.setMaLk(rs.getInt("ma_lk"));
        lk.setMaBn(rs.getInt("ma_bn"));
        lk.setMaBs(rs.getInt("ma_bs"));
        lk.setMaLlv(rs.getInt("ma_llv"));
        lk.setNgayGioKham(rs.getTimestamp("ngay_gio_kham").toLocalDateTime());
        lk.setLyDoKham(rs.getString("ly_do_kham"));
        lk.setTrangThai(rs.getString("trang_thai"));
        lk.setNgayDat(rs.getTimestamp("ngay_dat").toLocalDateTime());
        lk.setTenBenhNhan(rs.getString("ten_bn"));
        lk.setTenBacSi(rs.getString("ten_bs"));
        return lk;
    }
}
