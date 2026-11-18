package clinic.services.lichkham.kho;

import clinic.services.lichkham.mohinh.LichKham;
import clinic.shared.config.KetNoi;

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

// Tra cứu và lưu lịch khám
public class KhoLichKham {

    public static boolean laTrungKhoa(SQLException loi) {
        return "23505".equals(loi.getSQLState());
    }

    public static boolean laViPhamRangBuoc(SQLException loi) {
        return "23503".equals(loi.getSQLState()) || "23514".equals(loi.getSQLState());
    }

    private static final String SELECT =
            """
                    SELECT lk.ma_lk, lk.ma_bn, lk.ma_bs, lk.ma_llv, lk.ngay_gio_kham, lk.ly_do_kham, lk.trang_thai, lk.ngay_dat, bn.ho_ten AS ten_bn, bs.ho_ten AS ten_bs
                    FROM lich_kham lk
                    JOIN benh_nhan bn ON bn.ma_bn = lk.ma_bn
                    JOIN bac_si bs ON bs.ma_bs = lk.ma_bs
                    """;

    public List<LichKham> search(LocalDate ngay, Integer maBs, String trangThai)
            throws SQLException {
        StringBuilder cauSql = new StringBuilder(SELECT).append("WHERE 1 = 1 ");
        List<Object> thamSo = new ArrayList<>();
        if (ngay != null) {
            cauSql.append("AND CAST(lk.ngay_gio_kham AS DATE) = ? ");
            thamSo.add(Date.valueOf(ngay));
        }
        if (maBs != null) {
            cauSql.append("AND lk.ma_bs = ? ");
            thamSo.add(maBs);
        }
        if (trangThai != null) {
            cauSql.append("AND lk.trang_thai = ? ");
            thamSo.add(trangThai);
        }
        cauSql.append("ORDER BY lk.ngay_gio_kham, lk.ma_lk");

        List<LichKham> ds = new ArrayList<>();
        try (Connection ketNoi = KetNoi.getConnection();
                PreparedStatement lenh = ketNoi.prepareStatement(cauSql.toString())) {
            for (int i = 0; i < thamSo.size(); i++) {
                lenh.setObject(i + 1, thamSo.get(i));
            }
            try (ResultSet bangKetQua = lenh.executeQuery()) {
                while (bangKetQua.next()) {
                    ds.add(map(bangKetQua));
                }
            }
        }
        return ds;
    }

    public LichKham timTheoMa(int maLk) throws SQLException {
        try (Connection ketNoi = KetNoi.getConnection();
                PreparedStatement lenh = ketNoi.prepareStatement(SELECT + "WHERE lk.ma_lk = ?")) {
            lenh.setInt(1, maLk);
            try (ResultSet bangKetQua = lenh.executeQuery()) {
                if (bangKetQua.next()) {
                    return map(bangKetQua);
                }
                return null;
            }
        }
    }

    public List<LocalTime> findGioDaDat(int maBs, LocalDate ngay) throws SQLException {
        String cauSql =
                """
                    SELECT ngay_gio_kham
                    FROM lich_kham
                    WHERE ma_bs = ?
                    AND CAST(ngay_gio_kham AS DATE) = ?
                    AND trang_thai <> ?
                    """;
        List<LocalTime> ds = new ArrayList<>();
        try (Connection ketNoi = KetNoi.getConnection();
                PreparedStatement lenh = ketNoi.prepareStatement(cauSql)) {
            lenh.setInt(1, maBs);
            lenh.setDate(2, Date.valueOf(ngay));
            lenh.setString(3, LichKham.DA_HUY);
            try (ResultSet bangKetQua = lenh.executeQuery()) {
                while (bangKetQua.next()) {
                    ds.add(bangKetQua.getTimestamp(1).toLocalDateTime().toLocalTime());
                }
            }
        }
        return ds;
    }

    public boolean benhNhanDaCoLich(int maBn, LocalDateTime thoiDiem, int boQuaMaLk)
            throws SQLException {
        String cauSql =
                """
                    SELECT COUNT(*)
                    FROM lich_kham
                    WHERE ma_bn = ?
                    AND ngay_gio_kham = ?
                    AND trang_thai <> ?
                    AND ma_lk <> ?
                    """;
        try (Connection ketNoi = KetNoi.getConnection();
                PreparedStatement lenh = ketNoi.prepareStatement(cauSql)) {
            lenh.setInt(1, maBn);
            lenh.setTimestamp(2, Timestamp.valueOf(thoiDiem));
            lenh.setString(3, LichKham.DA_HUY);
            lenh.setInt(4, boQuaMaLk);
            try (ResultSet bangKetQua = lenh.executeQuery()) {
                bangKetQua.next();
                return bangKetQua.getInt(1) > 0;
            }
        }
    }

    public int insert(LichKham lichKham) throws SQLException {
        String cauSql =
                """
                    INSERT INTO lich_kham (ma_bn, ma_bs, ma_llv, ngay_gio_kham, ly_do_kham, trang_thai)
                    VALUES (?, ?, ?, ?, ?, ?)
                    """;
        try (Connection ketNoi = KetNoi.getConnection();
                PreparedStatement lenh = ketNoi.prepareStatement(cauSql, new String[] {"ma_lk"})) {
            lenh.setInt(1, lichKham.getMaBn());
            lenh.setInt(2, lichKham.getMaBs());
            lenh.setInt(3, lichKham.getMaLlv());
            lenh.setTimestamp(4, Timestamp.valueOf(lichKham.getNgayGioKham()));
            lenh.setString(5, lichKham.getLyDoKham());
            lenh.setString(6, lichKham.getTrangThai());
            lenh.executeUpdate();
            try (ResultSet khoaMoi = lenh.getGeneratedKeys()) {
                khoaMoi.next();
                return khoaMoi.getInt(1);
            }
        }
    }

    public boolean update(int maLk, int maLlv, int maBs, LocalDateTime thoiDiem, String lyDo)
            throws SQLException {
        String cauSql =
                """
                    UPDATE lich_kham
                    SET ma_llv = ?, ma_bs = ?, ngay_gio_kham = ?, ly_do_kham = ?
                    WHERE ma_lk = ?
                    AND trang_thai = ?
                    """;
        try (Connection ketNoi = KetNoi.getConnection();
                PreparedStatement lenh = ketNoi.prepareStatement(cauSql)) {
            lenh.setInt(1, maLlv);
            lenh.setInt(2, maBs);
            lenh.setTimestamp(3, Timestamp.valueOf(thoiDiem));
            lenh.setString(4, lyDo);
            lenh.setInt(5, maLk);
            lenh.setString(6, LichKham.CHO_KHAM);
            return lenh.executeUpdate() > 0;
        }
    }

    public boolean doiTrangThai(int maLk, String tu, String sang) throws SQLException {
        String cauSql = "UPDATE lich_kham SET trang_thai = ? WHERE ma_lk = ? AND trang_thai = ?";
        try (Connection ketNoi = KetNoi.getConnection();
                PreparedStatement lenh = ketNoi.prepareStatement(cauSql)) {
            lenh.setString(1, sang);
            lenh.setInt(2, maLk);
            lenh.setString(3, tu);
            return lenh.executeUpdate() > 0;
        }
    }

    private LichKham map(ResultSet bangKetQua) throws SQLException {
        LichKham lichKham = new LichKham();
        lichKham.setMaLk(bangKetQua.getInt("ma_lk"));
        lichKham.setMaBn(bangKetQua.getInt("ma_bn"));
        lichKham.setMaBs(bangKetQua.getInt("ma_bs"));
        lichKham.setMaLlv(bangKetQua.getInt("ma_llv"));
        lichKham.setNgayGioKham(bangKetQua.getTimestamp("ngay_gio_kham").toLocalDateTime());
        lichKham.setLyDoKham(bangKetQua.getString("ly_do_kham"));
        lichKham.setTrangThai(bangKetQua.getString("trang_thai"));
        lichKham.setNgayDat(bangKetQua.getTimestamp("ngay_dat").toLocalDateTime());
        lichKham.setTenBenhNhan(bangKetQua.getString("ten_bn"));
        lichKham.setTenBacSi(bangKetQua.getString("ten_bs"));
        return lichKham;
    }
}
