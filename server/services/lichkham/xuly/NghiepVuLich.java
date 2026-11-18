package clinic.services.lichkham.xuly;

import clinic.services.lichkham.kho.KhoLichKham;
import clinic.services.lichkham.kho.KhoCaLam;
import clinic.services.lichkham.mohinh.LichKham;
import clinic.services.lichkham.mohinh.LichLamViec;
import clinic.shared.exception.LoiNghiepVu;

import java.sql.SQLException;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

// Kiểm tra điều kiện đặt đổi và hủy lịch
public class NghiepVuLich {

    private final KhoLichKham lichKhamDao = new KhoLichKham();
    private final KhoCaLam lichLamViecDao = new KhoCaLam();

    // Xem

    public List<LichKham> timKiem(LocalDate ngay, Integer maBs, String trangThai)
            throws LoiNghiepVu {
        try {
            return lichKhamDao.search(ngay, maBs, trangThai);
        } catch (SQLException loi) {
            throw loiDatabase(loi);
        }
    }

    public List<LichLamViec> layCaLamViec(LocalDate tuNgay, Integer maBs) throws LoiNghiepVu {
        try {
            return lichLamViecDao.findFrom(tuNgay, maBs);
        } catch (SQLException loi) {
            throw loiDatabase(loi);
        }
    }

    public List<LocalTime> layGioTrong(int maLlv) throws LoiNghiepVu {
        try {
            LichLamViec ca = layCa(maLlv);

            List<LocalTime> danhSachGioDaDat =
                    lichKhamDao.findGioDaDat(ca.getMaBs(), ca.getNgayLam());

            List<LocalTime> danhSachGioTrong = new ArrayList<>();

            int thoiLuongKham = ca.getThoiLuongSlot();
            LocalTime gioBatDau = ca.getGioBatDau();
            LocalTime gioKetThucCa = ca.getGioKetThuc();

            while (true) {
                LocalTime gioKetThucKham = gioBatDau.plusMinutes(thoiLuongKham);

                if (gioKetThucKham.isAfter(gioKetThucCa)) {
                    break;
                }

                boolean daCoNguoiDat = danhSachGioDaDat.contains(gioBatDau);

                LocalDateTime thoiDiemKham =
                        LocalDateTime.of(ca.getNgayLam(), gioBatDau);

                boolean daQuaGio = thoiDiemKham.isBefore(LocalDateTime.now());

                if (!daCoNguoiDat && !daQuaGio) {
                    danhSachGioTrong.add(gioBatDau);
                }

                gioBatDau = gioKetThucKham;
            }

            return danhSachGioTrong;
        } catch (SQLException loi) {
            throw loiDatabase(loi);
        }
    }

    // Đặt lịch

    public LichKham datLich(int maBn, int maLlv, LocalTime gio, String lyDo)
            throws LoiNghiepVu {
        try {
            LichLamViec ca = kiemTraCaVaGio(maLlv, gio);
            LocalDateTime thoiDiem = LocalDateTime.of(ca.getNgayLam(), gio);
            kiemTraKhongQuaKhu(thoiDiem);
            if (lichKhamDao.benhNhanDaCoLich(maBn, thoiDiem, 0)) {
                throw new LoiNghiepVu("Bệnh nhân đã có một lịch khám khác vào đúng giờ này.");
            }

            LichKham lichKham = new LichKham();
            lichKham.setMaBn(maBn);
            lichKham.setMaBs(ca.getMaBs()); // luôn lấy bác sĩ từ ca, tránh lệch dữ liệu
            lichKham.setMaLlv(maLlv);
            lichKham.setNgayGioKham(thoiDiem);
            lichKham.setLyDoKham(lyDo);
            lichKham.setTrangThai(LichKham.CHO_KHAM);
            int maLich = lichKhamDao.insert(lichKham);
            return lichKhamDao.timTheoMa(maLich);
        } catch (SQLException loi) {
            throw loiDatabase(loi);
        }
    }

    // Đổi / cập nhật

    public LichKham doiLich(int maLk, int maLlvMoi, LocalTime gioMoi, String lyDo)
            throws LoiNghiepVu {
        try {
            LichKham hienTai = lichKhamDao.timTheoMa(maLk);
            if (hienTai == null) {
                throw new LoiNghiepVu("Không tìm thấy lịch khám mã " + maLk + ".");
            }
            if (!LichKham.CHO_KHAM.equals(hienTai.getTrangThai())) {
                throw new LoiNghiepVu(
                        "Chỉ đổi được lịch đang ở trạng thái 'Chờ khám' (hiện tại: "
                                + hienTai.getTrangThai()
                                + ").");
            }
            LichLamViec ca = kiemTraCaVaGio(maLlvMoi, gioMoi);
            LocalDateTime thoiDiem = LocalDateTime.of(ca.getNgayLam(), gioMoi);
            kiemTraKhongQuaKhu(thoiDiem);
            if (lichKhamDao.benhNhanDaCoLich(hienTai.getMaBn(), thoiDiem, maLk)) {
                throw new LoiNghiepVu("Bệnh nhân đã có một lịch khám khác vào đúng giờ này.");
            }
            if (!lichKhamDao.update(maLk, maLlvMoi, ca.getMaBs(), thoiDiem, lyDo)) {
                throw new LoiNghiepVu(
                        "Cập nhật không thành công (lịch đã thay đổi trạng thái).");
            }
            return lichKhamDao.timTheoMa(maLk);
        } catch (SQLException loi) {
            throw loiDatabase(loi);
        }
    }

    // Hủy

    public void huyLich(int maLk) throws LoiNghiepVu {
        try {
            if (lichKhamDao.doiTrangThai(maLk, LichKham.CHO_KHAM, LichKham.DA_HUY)) {
                return;
            }
            LichKham lichKham = lichKhamDao.timTheoMa(maLk);
            if (lichKham == null) {
                throw new LoiNghiepVu("Không tìm thấy lịch khám mã " + maLk + ".");
            }
            throw new LoiNghiepVu(
                    "Chỉ hủy được lịch 'Chờ khám' (hiện tại: " + lichKham.getTrangThai() + ").");
        } catch (SQLException loi) {
            throw loiDatabase(loi);
        }
    }

    // Hàm hỗ trợ

    private LichLamViec layCa(int maLlv) throws SQLException, LoiNghiepVu {
        LichLamViec ca = lichLamViecDao.timTheoMa(maLlv);
        if (ca == null) {
            throw new LoiNghiepVu("Không tìm thấy ca làm việc mã " + maLlv + ".");
        }
        return ca;
    }

    private LichLamViec kiemTraCaVaGio(int maLlv, LocalTime gio)
            throws SQLException, LoiNghiepVu {
        LichLamViec ca = layCa(maLlv);
        if (!LichLamViec.MO.equals(ca.getTrangThai())) {
            throw new LoiNghiepVu("Ca làm việc này đã đóng, không nhận lịch.");
        }
        if (gio.isBefore(ca.getGioBatDau())
                || gio.plusMinutes(ca.getThoiLuongSlot()).isAfter(ca.getGioKetThuc())) {
            throw new LoiNghiepVu(
                    "Giờ khám nằm ngoài ca làm việc ("
                            + ca.getGioBatDau()
                            + " - "
                            + ca.getGioKetThuc()
                            + ").");
        }
        long phut = Duration.between(ca.getGioBatDau(), gio).toMinutes();
        if (phut % ca.getThoiLuongSlot() != 0) {
            throw new LoiNghiepVu(
                    "Giờ khám phải khớp khung "
                            + ca.getThoiLuongSlot()
                            + " phút kể từ "
                            + ca.getGioBatDau()
                            + ".");
        }
        return ca;
    }

    private void kiemTraKhongQuaKhu(LocalDateTime thoiDiem) throws LoiNghiepVu {
        if (thoiDiem.isBefore(LocalDateTime.now())) {
            throw new LoiNghiepVu("Không thể đặt lịch vào thời điểm đã qua.");
        }
    }

    private LoiNghiepVu loiDatabase(SQLException loi) {
        if (KhoLichKham.laTrungKhoa(loi)) {
            return new LoiNghiepVu(
                    "Khung giờ này của bác sĩ đã có người đặt. Vui lòng chọn giờ khác.", loi);
        }
        if (KhoLichKham.laViPhamRangBuoc(loi)) {
            return new LoiNghiepVu(
                    "Dữ liệu không hợp lệ (ví dụ mã bệnh nhân không tồn tại).", loi);
        }
        return new LoiNghiepVu("Lỗi cơ sở dữ liệu: " + loi.getMessage(), loi);
    }
}
