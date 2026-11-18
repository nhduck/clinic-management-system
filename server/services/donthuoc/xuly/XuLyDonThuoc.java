package clinic.services.donthuoc.xuly;

import static clinic.shared.util.DocJson.*;

import clinic.services.donthuoc.kho.KhoDonThuoc;
import clinic.shared.exception.LoiDuLieu;

import com.google.gson.*;

import java.sql.SQLException;
import java.util.*;

// Kiểm tra từng dòng thuốc trước khi lưu đơn
public class XuLyDonThuoc {
    private final KhoDonThuoc donThuoc = new KhoDonThuoc();

    public Map<String, String> create(JsonObject noiDung) throws SQLException {
        String maNhap = batBuoc(noiDung, "rid", 20);
        int maBenhAn = docMa(maNhap, "BA", "Mã bệnh án không hợp lệ");

        // Đọc các thuốc thuộc bệnh án đã chọn
        if (!noiDung.has("lines")) {
            throw new LoiDuLieu("Thiếu danh sách thuốc");
        }

        if (!noiDung.get("lines").isJsonArray()) {
            throw new LoiDuLieu("Danh sách thuốc không hợp lệ");
        }

        JsonArray cacThuoc = noiDung.getAsJsonArray("lines");
        int soThuoc = cacThuoc.size();

        if (soThuoc < 1 || soThuoc > 20) {
            throw new LoiDuLieu("Đơn thuốc phải có từ 1 đến 20 thuốc");
        }

        List<Map<String, Object>> dsThuoc = new ArrayList<>();

        // Kiểm tra tên liều dùng cách dùng và số lượng
        for (JsonElement muc : cacThuoc) {
            if (!muc.isJsonObject()) {
                throw new LoiDuLieu("Thông tin thuốc không hợp lệ");
            }

            JsonObject thuoc = muc.getAsJsonObject();

            String tenThuoc = batBuoc(thuoc, "d", 100);
            String lieuDung = batBuoc(thuoc, "dose", 100);
            String cachDung = batBuoc(thuoc, "use", 150);

            if (!thuoc.has("qty")) {
                throw new LoiDuLieu("Thiếu số lượng thuốc");
            }

            if (!thuoc.get("qty").isJsonPrimitive()) {
                throw new LoiDuLieu("Số lượng thuốc không hợp lệ");
            }

            int soLuong;

            try {
                String soNhap = thuoc.get("qty").getAsString();
                soLuong = Integer.parseInt(soNhap);
            } catch (NumberFormatException loi) {
                throw new LoiDuLieu("Số lượng thuốc phải là số nguyên");
            }

            if (soLuong < 1 || soLuong > 10000) {
                throw new LoiDuLieu("Số lượng thuốc phải từ 1 đến 10000");
            }

            Map<String, Object> dongThuoc = new LinkedHashMap<>();
            dongThuoc.put("d", tenThuoc);
            dongThuoc.put("dose", lieuDung);
            dongThuoc.put("qty", soLuong);
            dongThuoc.put("use", cachDung);

            dsThuoc.add(dongThuoc);
        }

        return donThuoc.create(maBenhAn, dsThuoc);
    }
}
