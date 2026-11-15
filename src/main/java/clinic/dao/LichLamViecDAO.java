package clinic.dao;

import clinic.config.DBConnection;
import clinic.model.LichLamViec;

import java.sql.Connection;
import java.sql.Date;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

/** Truy vấn bảng lich_lam_viec */
public class LichLamViecDAO {

    private static final String SELECT =
            "SELECT llv.ma_llv, llv.ma_bs, bs.ho_ten, llv.ngay_lam, llv.gio_bat_dau, "
                    + "llv.gio_ket_thuc, llv.thoi_luong_slot, llv.trang_thai "
                    + "FROM lich_lam_viec llv JOIN bac_si bs ON bs.ma_bs = llv.ma_bs ";

    /** Các ca làm từ ngày {@code tuNgay} trở đi; maBs = null nghĩa là mọi bác sĩ. */
    public List<LichLamViec> findFrom(java.time.LocalDate tuNgay, Integer maBs)
            throws SQLException {
        StringBuilder sql = new StringBuilder(SELECT).append("WHERE llv.ngay_lam >= ? ");
        if (maBs != null) {
            sql.append("AND llv.ma_bs = ? ");
        }
        sql.append("ORDER BY llv.ngay_lam, llv.gio_bat_dau, llv.ma_bs");

        List<LichLamViec> ds = new ArrayList<>();
        try (Connection conn = DBConnection.getConnection();
                PreparedStatement ps = conn.prepareStatement(sql.toString())) {
            ps.setDate(1, Date.valueOf(tuNgay));
            if (maBs != null) {
                ps.setInt(2, maBs);
            }
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    ds.add(map(rs));
                }
            }
        }
        return ds;
    }

    public LichLamViec findById(int maLlv) throws SQLException {
        try (Connection conn = DBConnection.getConnection();
                PreparedStatement ps = conn.prepareStatement(SELECT + "WHERE llv.ma_llv = ?")) {
            ps.setInt(1, maLlv);
            try (ResultSet rs = ps.executeQuery()) {
                return rs.next() ? map(rs) : null;
            }
        }
    }

    private LichLamViec map(ResultSet rs) throws SQLException {
        LichLamViec c = new LichLamViec();
        c.setMaLlv(rs.getInt("ma_llv"));
        c.setMaBs(rs.getInt("ma_bs"));
        c.setTenBacSi(rs.getString("ho_ten"));
        c.setNgayLam(rs.getDate("ngay_lam").toLocalDate());
        c.setGioBatDau(rs.getTime("gio_bat_dau").toLocalTime());
        c.setGioKetThuc(rs.getTime("gio_ket_thuc").toLocalTime());
        c.setThoiLuongSlot(rs.getInt("thoi_luong_slot"));
        c.setTrangThai(rs.getString("trang_thai"));
        return c;
    }
}
