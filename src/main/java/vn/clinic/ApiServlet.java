package vn.clinic;

import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

public class ApiServlet extends HttpServlet {
    private static final Gson JSON = new Gson();
    private static class InputError extends RuntimeException {
        InputError(String message) { super(message); }
    }

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        try {
            switch (req.getPathInfo() == null ? "" : req.getPathInfo()) {
                case "/data" -> send(resp, 200, loadData());
                case "/health" -> {
                    try (Connection c = Database.connect()) {
                        send(resp, 200, Map.of("status", "ok", "database", c.isValid(3) ? "connected" : "unavailable"));
                    }
                }
                default -> send(resp, 404, Map.of("error", "API không tồn tại"));
            }
        } catch (SQLException ex) {
            ex.printStackTrace();
            send(resp, 500, Map.of("error", "Không đọc được SQLite. Xem log Java và kiểm tra quyền ghi thư mục data."));
        }
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        try {
            if (req.getContentLengthLong() > 1024 * 1024) throw new InputError("Dữ liệu quá lớn");
            JsonObject body = JsonParser.parseReader(req.getReader()).getAsJsonObject();
            switch (req.getPathInfo() == null ? "" : req.getPathInfo()) {
                case "/records" -> send(resp, 201, addRecord(body));
                case "/prescriptions" -> send(resp, 201, addPrescription(body));
                case "/drugs" -> send(resp, 201, createDrug(body));
                default -> send(resp, 404, Map.of("error", "API không tồn tại"));
            }
        } catch (InputError | IllegalStateException | UnsupportedOperationException | DateTimeParseException | NumberFormatException ex) {
            send(resp, 400, Map.of("error", ex.getMessage() == null ? "Dữ liệu không hợp lệ" : ex.getMessage()));
        } catch (SQLException ex) {
            if ("/drugs".equals(req.getPathInfo())) { databaseError(resp, ex); return; }
            ex.printStackTrace();
            String state = ex.getSQLState();
            if ((state != null && state.startsWith("23")) || ex.getMessage().toUpperCase().contains("CONSTRAINT")) {
                send(resp, 409, Map.of("error", "Bệnh nhân/bệnh án không tồn tại hoặc bệnh án đã có đơn thuốc."));
            } else {
                send(resp, 500, Map.of("error", "Lỗi SQLite khi lưu dữ liệu. Xem terminal backend."));
            }
        } catch (RuntimeException ex) {
            send(resp, 400, Map.of("error", "JSON không hợp lệ"));
        }
    }

    @Override
    protected void doPut(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        try {
            int id = drugIdFromPath(req.getPathInfo());
            JsonObject body = JsonParser.parseReader(req.getReader()).getAsJsonObject();
            send(resp, 200, updateDrug(id, body));
        } catch (InputError | IllegalStateException | UnsupportedOperationException | NumberFormatException ex) {
            send(resp, 400, Map.of("error", ex.getMessage() == null ? "Dữ liệu không hợp lệ" : ex.getMessage()));
        } catch (SQLException ex) {
            databaseError(resp, ex);
        } catch (RuntimeException ex) {
            send(resp, 400, Map.of("error", "JSON không hợp lệ"));
        }
    }

    @Override
    protected void doDelete(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        try {
            int id = drugIdFromPath(req.getPathInfo());
            deleteDrug(id);
            send(resp, 200, Map.of("deleted", true));
        } catch (InputError ex) {
            send(resp, 404, Map.of("error", ex.getMessage()));
        } catch (SQLException ex) {
            databaseError(resp, ex);
        }
    }

    private static int drugIdFromPath(String path) {
        if (path == null || !path.matches("/drugs/[1-9][0-9]*"))
            throw new InputError("Đường dẫn mã thuốc không hợp lệ");
        return Integer.parseInt(path.substring("/drugs/".length()));
    }

    private static void databaseError(HttpServletResponse resp, SQLException ex) throws IOException {
        ex.printStackTrace();
        if (ex.getMessage() != null && ex.getMessage().toUpperCase().contains("UNIQUE")) {
            send(resp, 409, Map.of("error", "Tên thuốc đã có trong danh mục."));
        } else {
            send(resp, 500, Map.of("error", "Lỗi SQLite khi quản lý thuốc. Xem terminal."));
        }
    }

    private static List<Map<String, Object>> readDrugs(Connection c) throws SQLException {
        List<Map<String, Object>> drugs = new ArrayList<>();
        try (PreparedStatement p = c.prepareStatement("SELECT id,ten_thuoc FROM thuoc ORDER BY ten_thuoc COLLATE NOCASE");
             ResultSet r = p.executeQuery()) {
            while (r.next()) drugs.add(Map.of("id", r.getInt(1), "name", r.getString(2)));
        }
        return drugs;
    }

    private Map<String, Object> createDrug(JsonObject body) throws SQLException {
        String name = required(body, "name", 100);
        try (Connection c = Database.connect();
             PreparedStatement p = c.prepareStatement("INSERT INTO thuoc(ten_thuoc) VALUES (?)")) {
            p.setString(1, name);
            p.executeUpdate();
            try (Statement s = c.createStatement(); ResultSet ids = s.executeQuery("SELECT last_insert_rowid()")) {
                ids.next();
                return Map.of("id", ids.getInt(1), "name", name);
            }
        }
    }

    private Map<String, Object> updateDrug(int id, JsonObject body) throws SQLException {
        String name = required(body, "name", 100);
        try (Connection c = Database.connect();
             PreparedStatement p = c.prepareStatement("UPDATE thuoc SET ten_thuoc=? WHERE id=?")) {
            p.setString(1, name);
            p.setInt(2, id);
            if (p.executeUpdate() == 0) throw new InputError("Không tìm thấy thuốc cần sửa.");
        }
        return Map.of("id", id, "name", name);
    }

    private void deleteDrug(int id) throws SQLException {
        try (Connection c = Database.connect();
             PreparedStatement p = c.prepareStatement("DELETE FROM thuoc WHERE id=?")) {
            p.setInt(1, id);
            if (p.executeUpdate() == 0) throw new InputError("Không tìm thấy thuốc cần xóa.");
        }
    }

    private Map<String, Object> loadData() throws SQLException {
        List<Map<String, Object>> patients = new ArrayList<>();
        List<Map<String, Object>> records = new ArrayList<>();
        List<Map<String, Object>> prescriptions = new ArrayList<>();
        Map<Integer, List<Map<String, Object>>> linesByRx = new LinkedHashMap<>();
        List<Map<String, Object>> drugItems;
        try (Connection c = Database.connect()) {
            drugItems = readDrugs(c);
            try (PreparedStatement p = c.prepareStatement("SELECT id, ho_ten FROM benh_nhan ORDER BY id");
                 ResultSet r = p.executeQuery()) {
                while (r.next()) {
                    patients.add(Map.of("id", r.getString(1), "n", r.getString(2), "dob", "", "g", "—"));
                }
            }
            try (PreparedStatement p = c.prepareStatement(
                    "SELECT id,benh_nhan_id,ngay_kham,trieu_chung,chan_doan,ghi_chu FROM benh_an ORDER BY id DESC");
                 ResultSet r = p.executeQuery()) {
                while (r.next()) {
                    Map<String, Object> item = new LinkedHashMap<>();
                    item.put("id", recordCode(r.getInt(1)));
                    item.put("pid", r.getString(2));
                    item.put("date", r.getString(3));
                    item.put("sym", r.getString(4));
                    item.put("dx", r.getString(5));
                    item.put("note", r.getString(6) == null ? "" : r.getString(6));
                    records.add(item);
                }
            }
            try (PreparedStatement p = c.prepareStatement(
                    "SELECT id,don_thuoc_id,ten_thuoc,lieu_dung,so_luong,cach_dung FROM chi_tiet_don ORDER BY id");
                 ResultSet r = p.executeQuery()) {
                while (r.next()) {
                    linesByRx.computeIfAbsent(r.getInt(2), k -> new ArrayList<>()).add(Map.of(
                        "d", r.getString(3), "dose", r.getString(4), "qty", r.getInt(5), "use", r.getString(6)));
                }
            }
            try (PreparedStatement p = c.prepareStatement(
                    "SELECT id,benh_an_id,ngay_ke FROM don_thuoc ORDER BY id DESC");
                 ResultSet r = p.executeQuery()) {
                while (r.next()) {
                    Map<String, Object> item = new LinkedHashMap<>();
                    int id = r.getInt(1);
                    item.put("id", prescriptionCode(id));
                    item.put("rid", recordCode(r.getInt(2)));
                    item.put("date", r.getString(3));
                    item.put("lines", linesByRx.getOrDefault(id, List.of()));
                    prescriptions.add(item);
                }
            }
        }
        List<String> drugNames = drugItems.stream().map(x -> (String) x.get("name")).toList();
        return Map.of("pts", patients, "drugs", drugNames, "drugItems", drugItems,
                      "recs", records, "rx", prescriptions);
    }

    private Map<String, String> addRecord(JsonObject body) throws SQLException {
        String pid = required(body, "pid", 20);
        LocalDate date = date(required(body, "date", 10));
        String symptoms = required(body, "sym", 5000);
        String diagnosis = required(body, "dx", 5000);
        String note = optional(body, "note", 5000);
        String sql = "INSERT INTO benh_an(benh_nhan_id,ngay_kham,trieu_chung,chan_doan,ghi_chu) VALUES (?,?,?,?,?)";
        try (Connection c = Database.connect();
             PreparedStatement p = c.prepareStatement(sql, Statement.NO_GENERATED_KEYS)) {
            p.setString(1, pid);
            p.setString(2, date.toString());
            p.setString(3, symptoms);
            p.setString(4, diagnosis);
            p.setString(5, note);
            p.executeUpdate();
            try (Statement ids = c.createStatement(); ResultSet keys = ids.executeQuery("SELECT last_insert_rowid()")) {
                if (!keys.next()) throw new SQLException("Không tạo được mã bệnh án");
                return Map.of("id", recordCode(keys.getInt(1)));
            }
        }
    }

    private Map<String, String> addPrescription(JsonObject body) throws SQLException {
        int recordId = parseCode(required(body, "rid", 20), "BA");
        if (!body.has("lines") || !body.get("lines").isJsonArray()) throw new InputError("Thiếu danh sách thuốc");
        JsonArray lines = body.getAsJsonArray("lines");
        if (lines.size() < 1 || lines.size() > 20) throw new InputError("Đơn thuốc phải có từ 1 đến 20 thuốc");
        // Validate all lines before touching the database.
        List<Map<String, Object>> items = new ArrayList<>();
        for (int i = 0; i < lines.size(); i++) {
            JsonObject x = lines.get(i).getAsJsonObject();
            String drug = required(x, "d", 100);
            // Validate against persisted medicine catalogue, not a hard-coded list.
            // Checked again inside the transaction before inserting the prescription.
            String dose = required(x, "dose", 150);
            String usage = required(x, "use", 150);
            if (!x.has("qty") || !x.get("qty").isJsonPrimitive()) throw new InputError("Thiếu số lượng thuốc");
            int quantity = x.get("qty").getAsInt();
            if (quantity <= 0 || quantity > 10000) throw new InputError("Số lượng thuốc phải từ 1 đến 10000");
            items.add(Map.of("d", drug, "dose", dose, "qty", quantity, "use", usage));
        }
        try (Connection c = Database.connect()) {
            c.setAutoCommit(false);
            try {
                List<Map<String, Object>> available = readDrugs(c);
                for (Map<String, Object> item : items) {
                    if (available.stream().noneMatch(x -> x.get("name").equals(item.get("d"))))
                        throw new InputError("Thuốc không còn trong danh mục: " + item.get("d"));
                }
                int rxId;
                try (PreparedStatement p = c.prepareStatement(
                        "INSERT INTO don_thuoc(benh_an_id,ngay_ke) VALUES (?,?)", Statement.NO_GENERATED_KEYS)) {
                    p.setInt(1, recordId);
                    p.setString(2, LocalDate.now().toString());
                    p.executeUpdate();
                    try (Statement ids = c.createStatement(); ResultSet keys = ids.executeQuery("SELECT last_insert_rowid()")) {
                        if (!keys.next()) throw new SQLException("Không tạo được mã đơn thuốc");
                        rxId = keys.getInt(1);
                    }
                }
                try (PreparedStatement p = c.prepareStatement(
                        "INSERT INTO chi_tiet_don(don_thuoc_id,ten_thuoc,lieu_dung,so_luong,cach_dung) VALUES (?,?,?,?,?)")) {
                    for (Map<String, Object> item : items) {
                        p.setInt(1, rxId);
                        p.setString(2, (String) item.get("d"));
                        p.setString(3, (String) item.get("dose"));
                        p.setInt(4, (Integer) item.get("qty"));
                        p.setString(5, (String) item.get("use"));
                        p.addBatch();
                    }
                    p.executeBatch();
                }
                c.commit();
                return Map.of("id", prescriptionCode(rxId));
            } catch (SQLException | RuntimeException ex) {
                c.rollback();
                throw ex;
            }
        }
    }

    private static String recordCode(int id) { return String.format("BA%03d", id); }
    private static String prescriptionCode(int id) { return String.format("DT%03d", id); }
    private static int parseCode(String code, String prefix) {
        if (!code.matches(prefix + "[0-9]+")) throw new InputError("Mã bệnh án không hợp lệ");
        return Integer.parseInt(code.substring(prefix.length()));
    }
    private static LocalDate date(String raw) {
        try { return LocalDate.parse(raw); }
        catch (DateTimeParseException ex) { throw new InputError("Ngày khám không hợp lệ (YYYY-MM-DD)"); }
    }
    private static String required(JsonObject x, String key, int maxLength) {
        String value = optional(x, key, maxLength);
        if (value.isBlank()) throw new InputError("Thiếu trường bắt buộc: " + key);
        return value;
    }
    private static String optional(JsonObject x, String key, int maxLength) {
        String value = !x.has(key) || x.get(key).isJsonNull() ? "" : x.get(key).getAsString().trim();
        if (value.length() > maxLength) throw new InputError("Trường " + key + " quá dài");
        return value;
    }
    private static void send(HttpServletResponse resp, int status, Object data) throws IOException {
        resp.setStatus(status);
        resp.setCharacterEncoding("UTF-8");
        resp.setContentType("application/json; charset=UTF-8");
        resp.setHeader("Cache-Control", "no-store");
        resp.getWriter().write(JSON.toJson(data));
    }
}
