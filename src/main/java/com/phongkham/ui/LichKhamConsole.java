package com.phongkham.ui;

import com.phongkham.model.LichKham;
import com.phongkham.model.LichLamViec;
import com.phongkham.service.LichKhamService;
import com.phongkham.service.NghiepVuException;
import com.phongkham.util.ConsoleUtil;

import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.Scanner;

/** Giao diện console cho nhóm chức năng lịch khám (chạy file này để demo). */
public class LichKhamConsole {

    private static final DateTimeFormatter NGAY = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    private static final DateTimeFormatter GIO = DateTimeFormatter.ofPattern("HH:mm");
    private static final DateTimeFormatter NGAY_GIO = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    private final LichKhamService service = new LichKhamService();
    private final Scanner in = new Scanner(System.in, StandardCharsets.UTF_8);

    public static void main(String[] args) {
        ConsoleUtil.setupUtf8();
        new LichKhamConsole().chay();
    }

    private void chay() {
        while (true) {
            System.out.println();
            System.out.println("===== QUẢN LÝ LỊCH KHÁM =====");
            System.out.println("1. Xem danh sách lịch khám");
            System.out.println("2. Xem ca làm việc và giờ trống");
            System.out.println("3. Đặt lịch khám");
            System.out.println("4. Đổi / cập nhật lịch khám");
            System.out.println("5. Hủy lịch khám");
            System.out.println("0. Thoát");
            int chon = docSo("Chọn: ");
            try {
                switch (chon) {
                    case 1 -> xemDanhSach();
                    case 2 -> xemCaLam();
                    case 3 -> datLich();
                    case 4 -> doiLich();
                    case 5 -> huyLich();
                    case 0 -> {
                        System.out.println("Tạm biệt.");
                        return;
                    }
                    default -> System.out.println("Lựa chọn không hợp lệ.");
                }
            } catch (NghiepVuException e) {
                System.out.println(">> LỖI: " + e.getMessage());
            }
        }
    }

    private void xemDanhSach() throws NghiepVuException {
        LocalDate ngay = docNgayTuyChon("Lọc theo ngày (dd/MM/yyyy, Enter = tất cả): ");
        Integer maBs = docSoTuyChon("Lọc theo mã bác sĩ (Enter = tất cả): ");
        inDanhSach(service.timKiem(ngay, maBs, null));
    }

    private void xemCaLam() throws NghiepVuException {
        List<LichLamViec> cas = service.layCaLamViec(LocalDate.now(), null);
        inCaLam(cas);
        Integer maLlv = docSoTuyChon("Nhập mã ca để xem giờ trống (Enter = bỏ qua): ");
        if (maLlv != null) {
            inGioTrong(maLlv);
        }
    }

    private void datLich() throws NghiepVuException {
        inCaLam(service.layCaLamViec(LocalDate.now(), null));
        int maBn = docSo("Mã bệnh nhân: ");
        int maLlv = docSo("Mã ca làm việc: ");
        inGioTrong(maLlv);
        LocalTime gio = docGio("Giờ khám (HH:mm): ");
        String lyDo = docChuoi("Lý do khám: ");
        LichKham lk = service.datLich(maBn, maLlv, gio, lyDo);
        System.out.println(">> Đặt lịch thành công. Mã lịch: " + lk.getMaLk() + " | "
                + lk.getTenBenhNhan() + " | BS " + lk.getTenBacSi() + " | "
                + lk.getNgayGioKham().format(NGAY_GIO));
    }

    private void doiLich() throws NghiepVuException {
        int maLk = docSo("Mã lịch khám cần đổi: ");
        inCaLam(service.layCaLamViec(LocalDate.now(), null));
        int maLlv = docSo("Mã ca mới (nhập lại ca cũ nếu chỉ đổi giờ/lý do): ");
        inGioTrong(maLlv);
        LocalTime gio = docGio("Giờ mới (HH:mm): ");
        String lyDo = docChuoi("Lý do khám: ");
        LichKham lk = service.doiLich(maLk, maLlv, gio, lyDo);
        System.out.println(">> Cập nhật thành công: " + lk.getNgayGioKham().format(NGAY_GIO)
                + " | BS " + lk.getTenBacSi());
    }

    private void huyLich() throws NghiepVuException {
        int maLk = docSo("Mã lịch khám cần hủy: ");
        System.out.print("Xác nhận hủy (y/n)? ");
        if (!in.nextLine().trim().equalsIgnoreCase("y")) {
            System.out.println("Đã bỏ qua.");
            return;
        }
        service.huyLich(maLk);
        System.out.println(">> Đã hủy lịch " + maLk + ".");
    }

    // ---------------- In ra màn hình ----------------

    private void inDanhSach(List<LichKham> ds) {
        if (ds.isEmpty()) {
            System.out.println("(Không có lịch khám nào)");
            return;
        }
        System.out.printf("%-5s %-17s %-22s %-22s %-10s %s%n", "Mã", "Giờ khám", "Bệnh nhân", "Bác sĩ", "Trạng thái", "Lý do");
        for (LichKham lk : ds) {
            System.out.printf("%-5d %-17s %-22s %-22s %-10s %s%n", lk.getMaLk(), lk.getNgayGioKham().format(NGAY_GIO),
                    lk.getTenBenhNhan(), lk.getTenBacSi(), lk.getTrangThai(),
                    lk.getLyDoKham() == null ? "" : lk.getLyDoKham());
        }
    }

    private void inCaLam(List<LichLamViec> cas) {
        System.out.printf("%-6s %-12s %-13s %-22s %s%n", "Mã ca", "Ngày", "Giờ", "Bác sĩ", "Trạng thái");
        for (LichLamViec c : cas) {
            System.out.printf("%-6d %-12s %-13s %-22s %s%n", c.getMaLlv(), c.getNgayLam().format(NGAY),
                    c.getGioBatDau().format(GIO) + "-" + c.getGioKetThuc().format(GIO), c.getTenBacSi(), c.getTrangThai());
        }
    }

    private void inGioTrong(int maLlv) throws NghiepVuException {
        List<LocalTime> trong = service.layGioTrong(maLlv);
        if (trong.isEmpty()) {
            System.out.println("Giờ trống: (hết chỗ)");
            return;
        }
        StringBuilder sb = new StringBuilder("Giờ trống:");
        for (LocalTime t : trong) {
            sb.append(' ').append(t.format(GIO));
        }
        System.out.println(sb);
    }

    // ---------------- Nhập liệu ----------------

    private int docSo(String loiNhac) {
        while (true) {
            System.out.print(loiNhac);
            try {
                return Integer.parseInt(in.nextLine().trim());
            } catch (NumberFormatException e) {
                System.out.println("Vui lòng nhập một số nguyên.");
            }
        }
    }

    private Integer docSoTuyChon(String loiNhac) {
        while (true) {
            System.out.print(loiNhac);
            String s = in.nextLine().trim();
            if (s.isEmpty()) {
                return null;
            }
            try {
                return Integer.parseInt(s);
            } catch (NumberFormatException e) {
                System.out.println("Vui lòng nhập một số nguyên hoặc để trống.");
            }
        }
    }

    private LocalDate docNgayTuyChon(String loiNhac) {
        while (true) {
            System.out.print(loiNhac);
            String s = in.nextLine().trim();
            if (s.isEmpty()) {
                return null;
            }
            try {
                return LocalDate.parse(s, NGAY);
            } catch (DateTimeParseException e) {
                System.out.println("Sai định dạng, ví dụ: 16/11/2026.");
            }
        }
    }

    private LocalTime docGio(String loiNhac) {
        while (true) {
            System.out.print(loiNhac);
            try {
                return LocalTime.parse(in.nextLine().trim(), GIO);
            } catch (DateTimeParseException e) {
                System.out.println("Sai định dạng, ví dụ: 08:30.");
            }
        }
    }

    private String docChuoi(String loiNhac) {
        System.out.print(loiNhac);
        return in.nextLine().trim();
    }
}
