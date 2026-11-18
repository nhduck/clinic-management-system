package clinic.services.lichkham.mohinh;

import java.time.LocalDate;
import java.time.LocalTime;

// Thông tin ca làm việc của bác sĩ
public class LichLamViec {
    public static final String MO = "Mở";
    public static final String DONG = "Đóng";

    private int maLlv;
    private int maBs;
    private String tenBacSi; // lấy qua JOIN
    private LocalDate ngayLam;
    private LocalTime gioBatDau;
    private LocalTime gioKetThuc;
    private int thoiLuongSlot;
    private String trangThai;

    public int getMaLlv() {
        return maLlv;
    }

    public void setMaLlv(int maLlv) {
        this.maLlv = maLlv;
    }

    public int getMaBs() {
        return maBs;
    }

    public void setMaBs(int maBs) {
        this.maBs = maBs;
    }

    public String getTenBacSi() {
        return tenBacSi;
    }

    public void setTenBacSi(String tenBacSi) {
        this.tenBacSi = tenBacSi;
    }

    public LocalDate getNgayLam() {
        return ngayLam;
    }

    public void setNgayLam(LocalDate ngayLam) {
        this.ngayLam = ngayLam;
    }

    public LocalTime getGioBatDau() {
        return gioBatDau;
    }

    public void setGioBatDau(LocalTime gioBatDau) {
        this.gioBatDau = gioBatDau;
    }

    public LocalTime getGioKetThuc() {
        return gioKetThuc;
    }

    public void setGioKetThuc(LocalTime gioKetThuc) {
        this.gioKetThuc = gioKetThuc;
    }

    public int getThoiLuongSlot() {
        return thoiLuongSlot;
    }

    public void setThoiLuongSlot(int thoiLuongSlot) {
        this.thoiLuongSlot = thoiLuongSlot;
    }

    public String getTrangThai() {
        return trangThai;
    }

    public void setTrangThai(String trangThai) {
        this.trangThai = trangThai;
    }
}
