package clinic.services.lichkham.xuly;

import static clinic.shared.util.DinhDangMa.*;
import static clinic.shared.util.DocJson.*;

import clinic.services.lichkham.mohinh.LichKham;
import clinic.services.lichkham.mohinh.LichLamViec;
import clinic.shared.exception.LoiNghiepVu;

import com.google.gson.JsonObject;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.*;

// Đọc dữ liệu lịch từ giao diện và chuẩn bị kết quả
public class XuLyLich {
    private static final NghiepVuLich LICH_KHAM = new NghiepVuLich();

    public static Map<String, Object> duLieuLich(LichKham lichKham) {
        Map<String, Object> ketQua = new LinkedHashMap<>();
        ketQua.put("id", maLichKham(lichKham.getMaLk()));
        ketQua.put("pid", maBenhNhan(lichKham.getMaBn()));
        ketQua.put("pn", lichKham.getTenBenhNhan());
        ketQua.put("bs", maBacSi(lichKham.getMaBs()));
        ketQua.put("dn", "BS. " + lichKham.getTenBacSi());
        ketQua.put("shift", lichKham.getMaLlv());
        ketQua.put("date", lichKham.getNgayGioKham().toLocalDate().toString());
        ketQua.put("time", lichKham.getNgayGioKham().toLocalTime().toString());
        ketQua.put("reason", chuoiRong(lichKham.getLyDoKham()));
        ketQua.put("status", lichKham.getTrangThai());
        return ketQua;
    }

    public static List<Map<String, Object>> dsLich() throws LoiNghiepVu {
        List<LichKham> danhSachLichKham = LICH_KHAM.timKiem(null, null, null);
        List<Map<String, Object>> ketQua = new ArrayList<>();

        for (LichKham lichKham : danhSachLichKham) {
            ketQua.add(duLieuLich(lichKham));
        }

        return ketQua;
    }

    public static List<Map<String, Object>> dsCa() throws LoiNghiepVu {
        List<Map<String, Object>> danhSach = new ArrayList<>();
        for (LichLamViec caLam : LICH_KHAM.layCaLamViec(LocalDate.now(), null)) {
            if (!LichLamViec.MO.equals(caLam.getTrangThai())) {
                continue;
            }
            Map<String, Object> ketQua = new LinkedHashMap<>();
            ketQua.put("id", caLam.getMaLlv());
            ketQua.put("bs", maBacSi(caLam.getMaBs()));
            ketQua.put("dn", "BS. " + caLam.getTenBacSi());
            ketQua.put("date", caLam.getNgayLam().toString());
            ketQua.put("from", caLam.getGioBatDau().toString());
            ketQua.put("to", caLam.getGioKetThuc().toString());
            ketQua.put("slot", caLam.getThoiLuongSlot());
            danhSach.add(ketQua);
        }
        return danhSach;
    }

    public static List<String> gioTrong(String thamSoCa) throws LoiNghiepVu {
        int maCa;
        try {
            maCa = Integer.parseInt(thamSoCa);
        } catch (NumberFormatException loi) {
            throw new LoiNghiepVu("Mã ca làm việc không hợp lệ.");
        }
        List<String> cacGio = new ArrayList<>();
        for (LocalTime gio : LICH_KHAM.layGioTrong(maCa)) {
            cacGio.add(gio.toString());
        }
        return cacGio;
    }

    private String docLyDo(JsonObject noiDung) {
        String lyDo = tuyChon(noiDung, "reason", 255);

        if (lyDo.isEmpty()) {
            return null;
        }

        return lyDo;
    }

    public Map<String, Object> datLich(JsonObject noiDung) throws LoiNghiepVu {
        int maBn = docMa(batBuoc(noiDung, "pid", 20), "BN", "Mã bệnh nhân không hợp lệ");
        int maCa = docSo(noiDung, "shift");
        LocalTime gio = docGio(noiDung, "time");
        String lyDo = docLyDo(noiDung);
        LichKham lich = LICH_KHAM.datLich(maBn, maCa, gio, lyDo);
        return duLieuLich(lich);
    }

    public Map<String, Object> doiLich(String maChu, JsonObject noiDung)
            throws LoiNghiepVu {
        int maLk = docMa(maChu, "LK", "Mã lịch khám không hợp lệ");
        int maCa = docSo(noiDung, "shift");
        LocalTime gio = docGio(noiDung, "time");
        String lyDo = docLyDo(noiDung);
        LichKham lich = LICH_KHAM.doiLich(maLk, maCa, gio, lyDo);
        return duLieuLich(lich);
    }

    public Map<String, Object> huyLich(String maChu) throws LoiNghiepVu {
        int maLk = docMa(maChu, "LK", "Mã lịch khám không hợp lệ");
        LICH_KHAM.huyLich(maLk);
        return Map.of("id", maChu, "status", LichKham.DA_HUY);
    }
}
