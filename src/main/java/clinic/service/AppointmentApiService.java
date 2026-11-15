package clinic.service;

import static clinic.util.CodeFormatter.*;
import static clinic.util.JsonInput.*;

import com.google.gson.JsonObject;

import jakarta.servlet.http.HttpServletRequest;

import clinic.exception.NghiepVuException;
import clinic.model.LichKham;
import clinic.model.LichLamViec;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.*;

public class AppointmentApiService {
    private static final LichKhamService LICH_KHAM = new LichKhamService();

    public static Map<String, Object> appointmentJson(LichKham lk) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", appointmentCode(lk.getMaLk()));
        m.put("pid", patientCode(lk.getMaBn()));
        m.put("pn", lk.getTenBenhNhan());
        m.put("bs", doctorCode(lk.getMaBs()));
        m.put("dn", "BS. " + lk.getTenBacSi());
        m.put("shift", lk.getMaLlv());
        m.put("date", lk.getNgayGioKham().toLocalDate().toString());
        m.put("time", lk.getNgayGioKham().toLocalTime().toString());
        m.put("reason", nz(lk.getLyDoKham()));
        m.put("status", lk.getTrangThai());
        return m;
    }

    public static List<Map<String, Object>> appointmentList() throws NghiepVuException {
        List<Map<String, Object>> list = new ArrayList<>();
        for (LichKham lk : LICH_KHAM.timKiem(null, null, null)) list.add(appointmentJson(lk));
        return list;
    }

    public static List<Map<String, Object>> shiftList() throws NghiepVuException {
        List<Map<String, Object>> list = new ArrayList<>();
        for (LichLamViec c : LICH_KHAM.layCaLamViec(LocalDate.now(), null)) {
            if (!LichLamViec.MO.equals(c.getTrangThai())) continue;
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", c.getMaLlv());
            m.put("bs", doctorCode(c.getMaBs()));
            m.put("dn", "BS. " + c.getTenBacSi());
            m.put("date", c.getNgayLam().toString());
            m.put("from", c.getGioBatDau().toString());
            m.put("to", c.getGioKetThuc().toString());
            m.put("slot", c.getThoiLuongSlot());
            list.add(m);
        }
        return list;
    }

    public static List<String> slots(HttpServletRequest req) throws NghiepVuException {
        int shift;
        try {
            shift = Integer.parseInt(String.valueOf(req.getParameter("shift")));
        } catch (NumberFormatException ex) {
            throw new NghiepVuException("Mã ca làm việc không hợp lệ.");
        }
        return LICH_KHAM.layGioTrong(shift).stream().map(LocalTime::toString).toList();
    }

    public Map<String, Object> createAppointment(JsonObject body) throws NghiepVuException {
        int maBn = parseCode(required(body, "pid", 20), "BN", "Mã bệnh nhân không hợp lệ");
        int shift = intField(body, "shift");
        LocalTime time = timeField(body, "time");
        String reason = optional(body, "reason", 255);
        return appointmentJson(
                LICH_KHAM.datLich(maBn, shift, time, reason.isEmpty() ? null : reason));
    }

    public Map<String, Object> updateAppointment(String code, JsonObject body)
            throws NghiepVuException {
        int maLk = parseCode(code, "LK", "Mã lịch khám không hợp lệ");
        int shift = intField(body, "shift");
        LocalTime time = timeField(body, "time");
        String reason = optional(body, "reason", 255);
        return appointmentJson(
                LICH_KHAM.doiLich(maLk, shift, time, reason.isEmpty() ? null : reason));
    }

    public Map<String, Object> cancelAppointment(String code) throws NghiepVuException {
        int maLk = parseCode(code, "LK", "Mã lịch khám không hợp lệ");
        LICH_KHAM.huyLich(maLk);
        return Map.of("id", code, "status", LichKham.DA_HUY);
    }
}
