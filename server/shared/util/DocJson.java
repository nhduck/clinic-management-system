package clinic.shared.util;

import clinic.shared.exception.LoiDuLieu;

import com.google.gson.JsonObject;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeParseException;

// Đọc và kiểm tra các trường dữ liệu JSON
public class DocJson {
    public static String batBuoc(JsonObject doiTuong, String khoa, int doDaiToiDa) {
        String giaTri = tuyChon(doiTuong, khoa, doDaiToiDa);
        if (giaTri.isBlank()) {
            throw new LoiDuLieu("Thiếu trường bắt buộc: " + khoa);
        }
        return giaTri;
    }

    public static String tuyChon(JsonObject doiTuong, String khoa, int doDaiToiDa) {
        String giaTri = "";
        if (doiTuong.has(khoa) && !doiTuong.get(khoa).isJsonNull()) {
            giaTri = doiTuong.get(khoa).getAsString().trim();
        }
        if (giaTri.length() > doDaiToiDa) {
            throw new LoiDuLieu("Trường " + khoa + " quá dài");
        }
        return giaTri;
    }

    public static int docSo(JsonObject doiTuong, String khoa) {
        try {
            return Integer.parseInt(batBuoc(doiTuong, khoa, 12));
        } catch (NumberFormatException loi) {
            throw new LoiDuLieu("Trường " + khoa + " phải là số");
        }
    }

    public static LocalTime docGio(JsonObject doiTuong, String khoa) {
        try {
            return LocalTime.parse(batBuoc(doiTuong, khoa, 5));
        } catch (DateTimeParseException loi) {
            throw new LoiDuLieu("Giờ khám không hợp lệ (định dạng HH:mm)");
        }
    }

    public static LocalDate ngay(String chuoiGoc) {
        try {
            return LocalDate.parse(chuoiGoc);
        } catch (DateTimeParseException loi) {
            throw new LoiDuLieu("Ngày khám không hợp lệ (YYYY-MM-DD)");
        }
    }

    public static int docMa(String maChu, String tienTo, String thongBao) {
        if (!maChu.matches(tienTo + "[0-9]{1,9}")) {
            throw new LoiDuLieu(thongBao);
        }
        return Integer.parseInt(maChu.substring(tienTo.length()));
    }

    public static String chuoiRong(String giaTri) {
        return giaTri == null ? "" : giaTri;
    }
}
