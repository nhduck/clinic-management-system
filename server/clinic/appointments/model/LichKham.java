package clinic.appointments.model;

import java.time.LocalDateTime;

public class LichKham {
    public static final String CHO_KHAM = "Chờ khám";
    public static final String DA_KHAM = "Đã khám";
    public static final String DA_HUY = "Đã hủy";

    private int maLk;
    private int maBn;
    private int maBs;
    private int maLlv;
    private LocalDateTime ngayGioKham;
    private String lyDoKham;
    private String trangThai;
    private LocalDateTime ngayDat;
    private String tenBenhNhan;
    private String tenBacSi;

    public int getMaLk() {
        return maLk;
    }

    public void setMaLk(int maLk) {
        this.maLk = maLk;
    }

    public int getMaBn() {
        return maBn;
    }

    public void setMaBn(int maBn) {
        this.maBn = maBn;
    }

    public int getMaBs() {
        return maBs;
    }

    public void setMaBs(int maBs) {
        this.maBs = maBs;
    }

    public int getMaLlv() {
        return maLlv;
    }

    public void setMaLlv(int maLlv) {
        this.maLlv = maLlv;
    }

    public LocalDateTime getNgayGioKham() {
        return ngayGioKham;
    }

    public void setNgayGioKham(LocalDateTime ngayGioKham) {
        this.ngayGioKham = ngayGioKham;
    }

    public String getLyDoKham() {
        return lyDoKham;
    }

    public void setLyDoKham(String lyDoKham) {
        this.lyDoKham = lyDoKham;
    }

    public String getTrangThai() {
        return trangThai;
    }

    public void setTrangThai(String trangThai) {
        this.trangThai = trangThai;
    }

    public LocalDateTime getNgayDat() {
        return ngayDat;
    }

    public void setNgayDat(LocalDateTime ngayDat) {
        this.ngayDat = ngayDat;
    }

    public String getTenBenhNhan() {
        return tenBenhNhan;
    }

    public void setTenBenhNhan(String tenBenhNhan) {
        this.tenBenhNhan = tenBenhNhan;
    }

    public String getTenBacSi() {
        return tenBacSi;
    }

    public void setTenBacSi(String tenBacSi) {
        this.tenBacSi = tenBacSi;
    }
}
