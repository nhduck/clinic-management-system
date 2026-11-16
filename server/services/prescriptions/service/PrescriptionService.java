package clinic.services.prescriptions.service;

import static clinic.shared.util.JsonInput.*;

import clinic.services.prescriptions.dao.PrescriptionDAO;
import clinic.shared.exception.InputError;

import com.google.gson.*;

import java.sql.SQLException;
import java.util.*;

public class PrescriptionService {
    private final PrescriptionDAO prescriptions = new PrescriptionDAO();

    public Map<String, String> create(JsonObject body) throws SQLException {

        int recordId = parseCode(required(body, "rid", 20), "BA", "Mã bệnh án không hợp lệ");
        if (!body.has("lines") || !body.get("lines").isJsonArray())
            throw new InputError("Thiếu danh sách thuốc");
        JsonArray lines = body.getAsJsonArray("lines");
        if (lines.size() < 1 || lines.size() > 20)
            throw new InputError("Đơn thuốc phải có từ 1 đến 20 thuốc");
        // Kiểm tra toàn bộ dòng thuốc trước khi chạm vào database.
        List<Map<String, Object>> items = new ArrayList<>();
        for (int i = 0; i < lines.size(); i++) {
            JsonObject x = lines.get(i).getAsJsonObject();
            String drug = required(x, "d", 100);
            String dose = required(x, "dose", 100);
            String usage = required(x, "use", 150);
            if (!x.has("qty") || !x.get("qty").isJsonPrimitive())
                throw new InputError("Thiếu số lượng thuốc");
            int quantity = x.get("qty").getAsInt();
            if (quantity <= 0 || quantity > 10000)
                throw new InputError("Số lượng thuốc phải từ 1 đến 10000");
            items.add(Map.of("d", drug, "dose", dose, "qty", quantity, "use", usage));
        }

        return prescriptions.create(recordId, items);
    }
}
