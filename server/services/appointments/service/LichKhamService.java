package clinic.services.appointments.service;

import clinic.services.appointments.dao.LichKhamDAO;
import clinic.services.appointments.dao.LichLamViecDAO;
import clinic.services.appointments.model.LichKham;
import clinic.services.appointments.model.LichLamViec;
import clinic.shared.exception.NghiepVuException;

import java.sql.SQLException;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Nghiệp vụ lịch khám: đặt, xem, đổi, hủy. Quy tắc: giờ khám phải nằm trong ca còn Mở và khớp khung
 * slot; không đặt vào quá khứ; một bác sĩ không có 2 lịch cùng giờ (CSDL chặn bằng unique index);
 * bệnh nhân không có 2 lịch cùng giờ; chỉ đổi/hủy được lịch đang Chờ khám; hủy là đổi trạng thái,
 * không xóa dữ liệu.
 */
public class LichKhamService {

    private final LichKhamDAO lichKhamDao = new LichKhamDAO();
    private final LichLamViecDAO lichLamViecDao = new LichLamViecDAO();

    // ---------------- Xem ----------------

    public List<LichKham> timKiem(LocalDate ngay, Integer maBs, String trangThai)
            throws NghiepVuException {
        try {
            return lichKhamDao.search(ngay, maBs, trangThai);
        } catch (SQLException e) {
            throw loiDatabase(e);
        }
    }

    public List<LichLamViec> layCaLamViec(LocalDate tuNgay, Integer maBs) throws NghiepVuException {
        try {
            return lichLamViecDao.findFrom(tuNgay, maBs);
        } catch (SQLException e) {
            throw loiDatabase(e);
        }
    }

    /**
     * Các giờ còn trống của một ca: mọi slot trong ca trừ những slot đã có lịch (và đã qua nếu là
     * hôm nay).
     */
    public List<LocalTime> layGioTrong(int maLlv) throws NghiepVuException {
        try {
            LichLamViec ca = layCa(maLlv);
            List<LocalTime> daDat = lichKhamDao.findGioDaDat(ca.getMaBs(), ca.getNgayLam());
            List<LocalTime> trong = new ArrayList<>();
            for (LocalTime t = ca.getGioBatDau();
                    !t.plusMinutes(ca.getThoiLuongSlot()).isAfter(ca.getGioKetThuc());
                    t = t.plusMinutes(ca.getThoiLuongSlot())) {
                boolean daQua = LocalDateTime.of(ca.getNgayLam(), t).isBefore(LocalDateTime.now());
                if (!daDat.contains(t) && !daQua) {
                    trong.add(t);
                }
            }
            return trong;
        } catch (SQLException e) {
            throw loiDatabase(e);
        }
    }

    // ---------------- Đặt lịch ----------------

    public LichKham datLich(int maBn, int maLlv, LocalTime gio, String lyDo)
            throws NghiepVuException {
        try {
            LichLamViec ca = kiemTraCaVaGio(maLlv, gio);
            LocalDateTime thoiDiem = LocalDateTime.of(ca.getNgayLam(), gio);
            kiemTraKhongQuaKhu(thoiDiem);
            if (lichKhamDao.benhNhanDaCoLich(maBn, thoiDiem, 0)) {
                throw new NghiepVuException("Bệnh nhân đã có một lịch khám khác vào đúng giờ này.");
            }

            LichKham lk = new LichKham();
            lk.setMaBn(maBn);
            lk.setMaBs(ca.getMaBs()); // luôn lấy bác sĩ từ ca, tránh lệch dữ liệu
            lk.setMaLlv(maLlv);
            lk.setNgayGioKham(thoiDiem);
            lk.setLyDoKham(lyDo);
            lk.setTrangThai(LichKham.CHO_KHAM);
            return lichKhamDao.findById(lichKhamDao.insert(lk));
        } catch (SQLException e) {
            throw loiDatabase(e);
        }
    }

    // ---------------- Đổi / cập nhật ----------------

    public LichKham doiLich(int maLk, int maLlvMoi, LocalTime gioMoi, String lyDo)
            throws NghiepVuException {
        try {
            LichKham hienTai = lichKhamDao.findById(maLk);
            if (hienTai == null) {
                throw new NghiepVuException("Không tìm thấy lịch khám mã " + maLk + ".");
            }
            if (!LichKham.CHO_KHAM.equals(hienTai.getTrangThai())) {
                throw new NghiepVuException(
                        "Chỉ đổi được lịch đang ở trạng thái 'Chờ khám' (hiện tại: "
                                + hienTai.getTrangThai()
                                + ").");
            }
            LichLamViec ca = kiemTraCaVaGio(maLlvMoi, gioMoi);
            LocalDateTime thoiDiem = LocalDateTime.of(ca.getNgayLam(), gioMoi);
            kiemTraKhongQuaKhu(thoiDiem);
            if (lichKhamDao.benhNhanDaCoLich(hienTai.getMaBn(), thoiDiem, maLk)) {
                throw new NghiepVuException("Bệnh nhân đã có một lịch khám khác vào đúng giờ này.");
            }
            if (!lichKhamDao.update(maLk, maLlvMoi, ca.getMaBs(), thoiDiem, lyDo)) {
                throw new NghiepVuException(
                        "Cập nhật không thành công (lịch đã thay đổi trạng thái).");
            }
            return lichKhamDao.findById(maLk);
        } catch (SQLException e) {
            throw loiDatabase(e);
        }
    }

    // ---------------- Hủy ----------------

    public void huyLich(int maLk) throws NghiepVuException {
        try {
            if (lichKhamDao.doiTrangThai(maLk, LichKham.CHO_KHAM, LichKham.DA_HUY)) {
                return;
            }
            LichKham lk = lichKhamDao.findById(maLk);
            if (lk == null) {
                throw new NghiepVuException("Không tìm thấy lịch khám mã " + maLk + ".");
            }
            throw new NghiepVuException(
                    "Chỉ hủy được lịch 'Chờ khám' (hiện tại: " + lk.getTrangThai() + ").");
        } catch (SQLException e) {
            throw loiDatabase(e);
        }
    }

    // ---------------- Hàm hỗ trợ ----------------

    private LichLamViec layCa(int maLlv) throws SQLException, NghiepVuException {
        LichLamViec ca = lichLamViecDao.findById(maLlv);
        if (ca == null) {
            throw new NghiepVuException("Không tìm thấy ca làm việc mã " + maLlv + ".");
        }
        return ca;
    }

    /** Ca phải Mở, giờ nằm trong ca và khớp khung slot (ví dụ 08:00, 08:30, ...). */
    private LichLamViec kiemTraCaVaGio(int maLlv, LocalTime gio)
            throws SQLException, NghiepVuException {
        LichLamViec ca = layCa(maLlv);
        if (!LichLamViec.MO.equals(ca.getTrangThai())) {
            throw new NghiepVuException("Ca làm việc này đã đóng, không nhận lịch.");
        }
        if (gio.isBefore(ca.getGioBatDau())
                || gio.plusMinutes(ca.getThoiLuongSlot()).isAfter(ca.getGioKetThuc())) {
            throw new NghiepVuException(
                    "Giờ khám nằm ngoài ca làm việc ("
                            + ca.getGioBatDau()
                            + " - "
                            + ca.getGioKetThuc()
                            + ").");
        }
        long phut = Duration.between(ca.getGioBatDau(), gio).toMinutes();
        if (phut % ca.getThoiLuongSlot() != 0) {
            throw new NghiepVuException(
                    "Giờ khám phải khớp khung "
                            + ca.getThoiLuongSlot()
                            + " phút kể từ "
                            + ca.getGioBatDau()
                            + ".");
        }
        return ca;
    }

    private void kiemTraKhongQuaKhu(LocalDateTime thoiDiem) throws NghiepVuException {
        if (thoiDiem.isBefore(LocalDateTime.now())) {
            throw new NghiepVuException("Không thể đặt lịch vào thời điểm đã qua.");
        }
    }

    /** Dịch lỗi PostgreSQL thành thông báo dễ hiểu. */
    private NghiepVuException loiDatabase(SQLException e) {
        if (LichKhamDAO.laTrungKhoa(e)) {
            return new NghiepVuException(
                    "Khung giờ này của bác sĩ đã có người đặt. Vui lòng chọn giờ khác.", e);
        }
        if (LichKhamDAO.laViPhamRangBuoc(e)) {
            return new NghiepVuException(
                    "Dữ liệu không hợp lệ (ví dụ mã bệnh nhân không tồn tại).", e);
        }
        return new NghiepVuException("Lỗi cơ sở dữ liệu: " + e.getMessage(), e);
    }
}
