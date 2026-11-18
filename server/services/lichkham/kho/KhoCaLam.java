package clinic.services.lichkham.kho;

import clinic.services.lichkham.mohinh.LichLamViec;
import clinic.shared.config.KetNoi;

import java.sql.Connection;
import java.sql.Date;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

// Tra cứu ca làm việc của bác sĩ
public class KhoCaLam {

    private static final String SELECT =
            """
                    SELECT llv.ma_llv, llv.ma_bs, bs.ho_ten, llv.ngay_lam, llv.gio_bat_dau, llv.gio_ket_thuc, llv.thoi_luong_slot, llv.trang_thai
                    FROM lich_lam_viec llv
                    JOIN bac_si bs ON bs.ma_bs = llv.ma_bs
                    """;

    public List<LichLamViec> findFrom(java.time.LocalDate tuNgay, Integer maBs)
            throws SQLException {
        StringBuilder cauSql = new StringBuilder(SELECT).append("WHERE llv.ngay_lam >= ? ");
        if (maBs != null) {
            cauSql.append("AND llv.ma_bs = ? ");
        }
        cauSql.append("ORDER BY llv.ngay_lam, llv.gio_bat_dau, llv.ma_bs");

        List<LichLamViec> ds = new ArrayList<>();
        try (Connection ketNoi = KetNoi.getConnection();
                PreparedStatement lenh = ketNoi.prepareStatement(cauSql.toString())) {
            lenh.setDate(1, Date.valueOf(tuNgay));
            if (maBs != null) {
                lenh.setInt(2, maBs);
            }
            try (ResultSet bangKetQua = lenh.executeQuery()) {
                while (bangKetQua.next()) {
                    ds.add(map(bangKetQua));
                }
            }
        }
        return ds;
    }

    public LichLamViec timTheoMa(int maLlv) throws SQLException {
        try (Connection ketNoi = KetNoi.getConnection();
                PreparedStatement lenh = ketNoi.prepareStatement(SELECT + "WHERE llv.ma_llv = ?")) {
            lenh.setInt(1, maLlv);
            try (ResultSet bangKetQua = lenh.executeQuery()) {
                if (bangKetQua.next()) {
                    return map(bangKetQua);
                }
                return null;
            }
        }
    }

    private LichLamViec map(ResultSet bangKetQua) throws SQLException {
        LichLamViec ketNoi = new LichLamViec();
        ketNoi.setMaLlv(bangKetQua.getInt("ma_llv"));
        ketNoi.setMaBs(bangKetQua.getInt("ma_bs"));
        ketNoi.setTenBacSi(bangKetQua.getString("ho_ten"));
        ketNoi.setNgayLam(bangKetQua.getDate("ngay_lam").toLocalDate());
        ketNoi.setGioBatDau(bangKetQua.getTime("gio_bat_dau").toLocalTime());
        ketNoi.setGioKetThuc(bangKetQua.getTime("gio_ket_thuc").toLocalTime());
        ketNoi.setThoiLuongSlot(bangKetQua.getInt("thoi_luong_slot"));
        ketNoi.setTrangThai(bangKetQua.getString("trang_thai"));
        return ketNoi;
    }
}
