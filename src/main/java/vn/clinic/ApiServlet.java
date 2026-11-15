package vn.clinic;

import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import com.phongkham.model.LichKham;
import com.phongkham.model.LichLamViec;
import com.phongkham.service.LichKhamService;
import com.phongkham.service.NghiepVuException;

import java.io.IOException;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

public class ApiServlet extends HttpServlet {
    private static final Gson JSON = new Gson();
    // Dùng chung LichKhamService với bản console: một bộ quy tắc nghiệp vụ duy nhất cho lịch khám
    private static final LichKhamService LICH_KHAM = new LichKhamService();
    private static class InputError extends RuntimeException {
        InputError(String message) { super(message); }
    }

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        try {
            switch (req.getPathInfo() == null ? "" : req.getPathInfo()) {
                case "/data" -> send(resp, 200, loadData());
                case "/slots" -> send(resp, 200, slots(req));
                case "/health" -> {
                    try (Connection c = Database.connect()) {
                        send(resp, 200, Map.of("status", "ok", "database", c.isValid(3) ? "connected" : "unavailable"));
                    }
                }
                default -> send(resp, 404, Map.of("error", "API không tồn tại"));
            }
        } catch (NghiepVuException ex) {
            businessError(resp, ex);
        } catch (SQLException ex) {
            ex.printStackTrace();
            send(resp, 500, Map.of("error", "Không đọc được PostgreSQL. Kiểm tra container (docker compose ps) và log Java."));
        }
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        req.setCharacterEncoding("UTF-8");   // fetch() không gửi charset; không đặt sẽ bị đọc sai tiếng Việt
        try {
            if (req.getContentLengthLong() > 1024 * 1024) throw new InputError("Dữ liệu quá lớn");
            JsonObject body = JsonParser.parseReader(req.getReader()).getAsJsonObject();
            switch (req.getPathInfo() == null ? "" : req.getPathInfo()) {
                case "/records" -> send(resp, 201, addRecord(body));
                case "/prescriptions" -> send(resp, 201, addPrescription(body));
                case "/drugs" -> send(resp, 201, createDrug(body));
                case "/appointments" -> send(resp, 201, createAppointment(body));
                default -> {
                    String path = req.getPathInfo() == null ? "" : req.getPathInfo();
                    if (path.matches("/appointments/LK[0-9]{1,9}/cancel")) {
                        send(resp, 200, cancelAppointment(path.split("/")[2]));
                    } else {
                        send(resp, 404, Map.of("error", "API không tồn tại"));
                    }
                }
            }
        } catch (NghiepVuException ex) {
            businessError(resp, ex);
        } catch (InputError | IllegalStateException | UnsupportedOperationException | DateTimeParseException | NumberFormatException ex) {
            send(resp, 400, Map.of("error", ex.getMessage() == null ? "Dữ liệu không hợp lệ" : ex.getMessage()));
        } catch (SQLException ex) {
            if ("/drugs".equals(req.getPathInfo())) { databaseError(resp, ex); return; }
            ex.printStackTrace();
            String state = ex.getSQLState();
            if (state != null && state.startsWith("23")) {
                send(resp, 409, Map.of("error", "Bệnh nhân/bệnh án không tồn tại hoặc bệnh án đã có đơn thuốc."));
            } else {
                send(resp, 500, Map.of("error", "Lỗi PostgreSQL khi lưu dữ liệu. Xem terminal backend."));
            }
        } catch (RuntimeException ex) {
            send(resp, 400, Map.of("error", "JSON không hợp lệ"));
        }
    }

    @Override
    protected void doPut(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        req.setCharacterEncoding("UTF-8");
        try {
            String path = req.getPathInfo() == null ? "" : req.getPathInfo();
            if (path.matches("/appointments/LK[0-9]{1,9}")) {
                JsonObject apptBody = JsonParser.parseReader(req.getReader()).getAsJsonObject();
                send(resp, 200, updateAppointment(path.substring("/appointments/".length()), apptBody));
                return;
            }
            int id = drugIdFromPath(path);
            JsonObject body = JsonParser.parseReader(req.getReader()).getAsJsonObject();
            send(resp, 200, updateDrug(id, body));
        } catch (NghiepVuException ex) {
            businessError(resp, ex);
        } catch (InputError | IllegalStateException | UnsupportedOperationException | DateTimeParseException | NumberFormatException ex) {
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
        if ("23505".equals(ex.getSQLState())) {            // unique_violation
            send(resp, 409, Map.of("error", "Tên thuốc đã có trong danh mục."));
        } else if ("23503".equals(ex.getSQLState())) {     // foreign_key_violation
            send(resp, 409, Map.of("error", "Thuốc đã được kê trong đơn thuốc nên không thể xóa."));
        } else {
            send(resp, 500, Map.of("error", "Lỗi PostgreSQL khi quản lý thuốc. Xem terminal."));
        }
    }

    private static String nz(String v) { return v == null ? "" : v; }

    private static List<Map<String, Object>> readDrugs(Connection c) throws SQLException {
        List<Map<String, Object>> drugs = new ArrayList<>();
        try (PreparedStatement p = c.prepareStatement("SELECT ma_thuoc, ten_thuoc FROM thuoc ORDER BY lower(ten_thuoc)");
             ResultSet r = p.executeQuery()) {
            while (r.next()) drugs.add(Map.of("id", r.getInt(1), "name", r.getString(2)));
        }
        return drugs;
    }

    private Map<String, Object> createDrug(JsonObject body) throws SQLException {
        String name = required(body, "name", 100);
        // Bảng thuoc (thiết kế nhóm) còn đơn vị tính / đơn giá / tồn kho: dùng giá trị mặc định, cập nhật sau.
        try (Connection c = Database.connect();
             PreparedStatement p = c.prepareStatement(
                 "INSERT INTO thuoc(ten_thuoc, don_vi_tinh, don_gia, so_luong_ton) VALUES (?, 'Viên', 0, 0) RETURNING ma_thuoc")) {
            p.setString(1, name);
            try (ResultSet ids = p.executeQuery()) {
                ids.next();
                return Map.of("id", ids.getInt(1), "name", name);
            }
        }
    }

    private Map<String, Object> updateDrug(int id, JsonObject body) throws SQLException {
        String name = required(body, "name", 100);
        try (Connection c = Database.connect();
             PreparedStatement p = c.prepareStatement("UPDATE thuoc SET ten_thuoc=? WHERE ma_thuoc=?")) {
            p.setString(1, name);
            p.setInt(2, id);
            if (p.executeUpdate() == 0) throw new InputError("Không tìm thấy thuốc cần sửa.");
        }
        return Map.of("id", id, "name", name);
    }

    private void deleteDrug(int id) throws SQLException {
        try (Connection c = Database.connect();
             PreparedStatement p = c.prepareStatement("DELETE FROM thuoc WHERE ma_thuoc=?")) {
            p.setInt(1, id);
            if (p.executeUpdate() == 0) throw new InputError("Không tìm thấy thuốc cần xóa.");
        }
    }

    private Map<String, Object> loadData() throws SQLException, NghiepVuException {
        List<Map<String, Object>> patients = new ArrayList<>();
        List<Map<String, Object>> records = new ArrayList<>();
        List<Map<String, Object>> prescriptions = new ArrayList<>();
        Map<Integer, List<Map<String, Object>>> linesByRx = new LinkedHashMap<>();
        List<Map<String, Object>> drugItems;
        try (Connection c = Database.connect()) {
            drugItems = readDrugs(c);
            try (PreparedStatement p = c.prepareStatement("SELECT ma_bn, ho_ten, ngay_sinh, gioi_tinh FROM benh_nhan ORDER BY ma_bn");
                 ResultSet r = p.executeQuery()) {
                while (r.next()) {
                    java.sql.Date dob = r.getDate(3);
                    patients.add(Map.of("id", patientCode(r.getInt(1)), "n", r.getString(2),
                            "dob", dob == null ? "" : dob.toString(),
                            "g", r.getString(4) == null ? "—" : r.getString(4)));
                }
            }
            try (PreparedStatement p = c.prepareStatement(
                    "SELECT ba.ma_ba, ba.ma_bn, lk.ngay_gio_kham::date, ba.trieu_chung, ba.chan_doan, ba.ghi_chu "
                    + "FROM benh_an ba JOIN lich_kham lk ON lk.ma_lk = ba.ma_lk ORDER BY ba.ma_ba DESC");
                 ResultSet r = p.executeQuery()) {
                while (r.next()) {
                    Map<String, Object> item = new LinkedHashMap<>();
                    item.put("id", recordCode(r.getInt(1)));
                    item.put("pid", patientCode(r.getInt(2)));
                    item.put("date", r.getDate(3).toString());
                    item.put("sym", nz(r.getString(4)));
                    item.put("dx", nz(r.getString(5)));
                    item.put("note", nz(r.getString(6)));
                    records.add(item);
                }
            }
            try (PreparedStatement p = c.prepareStatement(
                    "SELECT ct.ma_dt, t.ten_thuoc, ct.lieu_dung, ct.tan_suat, ct.so_luong, ct.cach_dung "
                    + "FROM chi_tiet_don_thuoc ct JOIN thuoc t ON t.ma_thuoc = ct.ma_thuoc ORDER BY ct.ma_dt, ct.ma_thuoc");
                 ResultSet r = p.executeQuery()) {
                while (r.next()) {
                    String dose = nz(r.getString(3));
                    String freq = nz(r.getString(4));
                    if (!freq.isEmpty()) dose = dose.isEmpty() ? freq : dose + ", " + freq;
                    linesByRx.computeIfAbsent(r.getInt(1), k -> new ArrayList<>()).add(Map.of(
                        "d", r.getString(2), "dose", dose, "qty", r.getInt(5), "use", nz(r.getString(6))));
                }
            }
            try (PreparedStatement p = c.prepareStatement(
                    "SELECT ma_dt, ma_ba, ngay_ke::date FROM don_thuoc ORDER BY ma_dt DESC");
                 ResultSet r = p.executeQuery()) {
                while (r.next()) {
                    Map<String, Object> item = new LinkedHashMap<>();
                    int id = r.getInt(1);
                    item.put("id", prescriptionCode(id));
                    item.put("rid", recordCode(r.getInt(2)));
                    item.put("date", r.getDate(3).toString());
                    item.put("lines", linesByRx.getOrDefault(id, List.of()));
                    prescriptions.add(item);
                }
            }
        }
        List<String> drugNames = drugItems.stream().map(x -> (String) x.get("name")).toList();
        return Map.of("pts", patients, "drugs", drugNames, "drugItems", drugItems,
                      "recs", records, "rx", prescriptions,
                      "shifts", shiftList(), "appts", appointmentList());
    }

    /**
     * Lập bệnh án = gắn với MỘT lịch khám (benh_an.ma_lk NOT NULL UNIQUE trong thiết kế nhóm):
     * lấy lịch khám chưa hủy, chưa có bệnh án của bệnh nhân đúng ngày chọn, rồi đánh dấu lịch 'Đã khám'.
     */
    private Map<String, String> addRecord(JsonObject body) throws SQLException {
        int patientId = parseCode(required(body, "pid", 20), "BN", "Mã bệnh nhân không hợp lệ");
        LocalDate date = date(required(body, "date", 10));
        String symptoms = required(body, "sym", 5000);
        String diagnosis = required(body, "dx", 5000);
        String note = optional(body, "note", 5000);
        try (Connection c = Database.connect()) {
            c.setAutoCommit(false);
            try {
                int lk = -1;
                try (PreparedStatement p = c.prepareStatement(
                        "SELECT lk.ma_lk FROM lich_kham lk WHERE lk.ma_bn = ? AND lk.ngay_gio_kham::date = ? "
                        + "AND lk.trang_thai <> 'Đã hủy' "
                        + "AND NOT EXISTS (SELECT 1 FROM benh_an b WHERE b.ma_lk = lk.ma_lk) "
                        + "ORDER BY lk.ngay_gio_kham LIMIT 1 FOR UPDATE")) {
                    p.setInt(1, patientId);
                    p.setDate(2, java.sql.Date.valueOf(date));
                    try (ResultSet r = p.executeQuery()) { if (r.next()) lk = r.getInt(1); }
                }
                if (lk < 0) throw new InputError("Bệnh nhân chưa có lịch khám (còn trống bệnh án) vào ngày "
                        + date + ". Hãy đặt lịch khám trước hoặc chọn đúng ngày của lịch.");
                int id;
                try (PreparedStatement p = c.prepareStatement(
                        "INSERT INTO benh_an(ma_lk, ma_bn, trieu_chung, chan_doan, ghi_chu) VALUES (?,?,?,?,?) RETURNING ma_ba")) {
                    p.setInt(1, lk);
                    p.setInt(2, patientId);
                    p.setString(3, symptoms);
                    p.setString(4, diagnosis);
                    p.setString(5, note.isEmpty() ? null : note);
                    try (ResultSet keys = p.executeQuery()) {
                        if (!keys.next()) throw new SQLException("Không tạo được mã bệnh án");
                        id = keys.getInt(1);
                    }
                }
                try (PreparedStatement p = c.prepareStatement("UPDATE lich_kham SET trang_thai = 'Đã khám' WHERE ma_lk = ?")) {
                    p.setInt(1, lk);
                    p.executeUpdate();
                }
                c.commit();
                return Map.of("id", recordCode(id));
            } catch (SQLException | RuntimeException ex) {
                c.rollback();
                throw ex;
            }
        }
    }

    private Map<String, String> addPrescription(JsonObject body) throws SQLException {
        int recordId = parseCode(required(body, "rid", 20), "BA", "Mã bệnh án không hợp lệ");
        if (!body.has("lines") || !body.get("lines").isJsonArray()) throw new InputError("Thiếu danh sách thuốc");
        JsonArray lines = body.getAsJsonArray("lines");
        if (lines.size() < 1 || lines.size() > 20) throw new InputError("Đơn thuốc phải có từ 1 đến 20 thuốc");
        // Kiểm tra toàn bộ dòng thuốc trước khi chạm vào database.
        List<Map<String, Object>> items = new ArrayList<>();
        for (int i = 0; i < lines.size(); i++) {
            JsonObject x = lines.get(i).getAsJsonObject();
            String drug = required(x, "d", 100);
            String dose = required(x, "dose", 100);
            String usage = required(x, "use", 150);
            if (!x.has("qty") || !x.get("qty").isJsonPrimitive()) throw new InputError("Thiếu số lượng thuốc");
            int quantity = x.get("qty").getAsInt();
            if (quantity <= 0 || quantity > 10000) throw new InputError("Số lượng thuốc phải từ 1 đến 10000");
            items.add(Map.of("d", drug, "dose", dose, "qty", quantity, "use", usage));
        }
        try (Connection c = Database.connect()) {
            c.setAutoCommit(false);
            try {
                // Khóa dòng bệnh án để hai người không cùng kê đơn cho một bệnh án.
                try (PreparedStatement p = c.prepareStatement("SELECT 1 FROM benh_an WHERE ma_ba = ? FOR UPDATE")) {
                    p.setInt(1, recordId);
                    try (ResultSet r = p.executeQuery()) {
                        if (!r.next()) throw new InputError("Bệnh án không tồn tại.");
                    }
                }
                try (PreparedStatement p = c.prepareStatement("SELECT 1 FROM don_thuoc WHERE ma_ba = ?")) {
                    p.setInt(1, recordId);
                    try (ResultSet r = p.executeQuery()) {
                        if (r.next()) throw new InputError("Bệnh án này đã có đơn thuốc.");
                    }
                }
                // Tên thuốc -> mã thuốc (chi_tiet_don_thuoc lưu khóa ngoại tới danh mục thuốc).
                List<Integer> drugIds = new ArrayList<>();
                for (Map<String, Object> item : items) {
                    try (PreparedStatement p = c.prepareStatement("SELECT ma_thuoc FROM thuoc WHERE ten_thuoc = ?")) {
                        p.setString(1, (String) item.get("d"));
                        try (ResultSet r = p.executeQuery()) {
                            if (!r.next()) throw new InputError("Thuốc không còn trong danh mục: " + item.get("d"));
                            int id = r.getInt(1);
                            if (drugIds.contains(id)) throw new InputError("Thuốc bị trùng trong đơn: " + item.get("d"));
                            drugIds.add(id);
                        }
                    }
                }
                int rxId;
                try (PreparedStatement p = c.prepareStatement(
                        "INSERT INTO don_thuoc(ma_ba) VALUES (?) RETURNING ma_dt")) {
                    p.setInt(1, recordId);
                    try (ResultSet keys = p.executeQuery()) {
                        if (!keys.next()) throw new SQLException("Không tạo được mã đơn thuốc");
                        rxId = keys.getInt(1);
                    }
                }
                try (PreparedStatement p = c.prepareStatement(
                        "INSERT INTO chi_tiet_don_thuoc(ma_dt, ma_thuoc, so_luong, lieu_dung, cach_dung) VALUES (?,?,?,?,?)")) {
                    for (int i = 0; i < items.size(); i++) {
                        Map<String, Object> item = items.get(i);
                        p.setInt(1, rxId);
                        p.setInt(2, drugIds.get(i));
                        p.setInt(3, (Integer) item.get("qty"));
                        p.setString(4, (String) item.get("dose"));
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

    // ------------------------------------------------------------------
    // Lịch khám: đặt / xem / cập nhật / hủy / giờ trống (gọi LichKhamService)
    // ------------------------------------------------------------------
    private static String appointmentCode(int id) { return String.format("LK%03d", id); }
    private static String doctorCode(int id) { return String.format("BS%03d", id); }

    private static Map<String, Object> appointmentJson(LichKham lk) {
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

    private static List<Map<String, Object>> appointmentList() throws NghiepVuException {
        List<Map<String, Object>> list = new ArrayList<>();
        for (LichKham lk : LICH_KHAM.timKiem(null, null, null)) list.add(appointmentJson(lk));
        return list;
    }

    /** Các ca làm việc còn Mở từ hôm nay trở đi (để chọn khi đặt lịch). */
    private static List<Map<String, Object>> shiftList() throws NghiepVuException {
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

    /** GET /api/slots?shift=ID: các giờ còn trống của một ca làm việc. */
    private static List<String> slots(HttpServletRequest req) throws NghiepVuException {
        int shift;
        try {
            shift = Integer.parseInt(String.valueOf(req.getParameter("shift")));
        } catch (NumberFormatException ex) {
            throw new NghiepVuException("Mã ca làm việc không hợp lệ.");
        }
        return LICH_KHAM.layGioTrong(shift).stream().map(LocalTime::toString).toList();
    }

    private Map<String, Object> createAppointment(JsonObject body) throws NghiepVuException {
        int maBn = parseCode(required(body, "pid", 20), "BN", "Mã bệnh nhân không hợp lệ");
        int shift = intField(body, "shift");
        LocalTime time = timeField(body, "time");
        String reason = optional(body, "reason", 255);
        return appointmentJson(LICH_KHAM.datLich(maBn, shift, time, reason.isEmpty() ? null : reason));
    }

    private Map<String, Object> updateAppointment(String code, JsonObject body) throws NghiepVuException {
        int maLk = parseCode(code, "LK", "Mã lịch khám không hợp lệ");
        int shift = intField(body, "shift");
        LocalTime time = timeField(body, "time");
        String reason = optional(body, "reason", 255);
        return appointmentJson(LICH_KHAM.doiLich(maLk, shift, time, reason.isEmpty() ? null : reason));
    }

    private Map<String, Object> cancelAppointment(String code) throws NghiepVuException {
        int maLk = parseCode(code, "LK", "Mã lịch khám không hợp lệ");
        LICH_KHAM.huyLich(maLk);
        return Map.of("id", code, "status", LichKham.DA_HUY);
    }

    private static int intField(JsonObject x, String key) {
        try {
            return Integer.parseInt(required(x, key, 12));
        } catch (NumberFormatException ex) {
            throw new InputError("Trường " + key + " phải là số");
        }
    }

    private static LocalTime timeField(JsonObject x, String key) {
        try {
            return LocalTime.parse(required(x, key, 5));
        } catch (DateTimeParseException ex) {
            throw new InputError("Giờ khám không hợp lệ (định dạng HH:mm)");
        }
    }

    /** Lỗi nghiệp vụ: 404 nếu không tìm thấy, 500 nếu là lỗi database, còn lại 400. */
    private static void businessError(HttpServletResponse resp, NghiepVuException ex) throws IOException {
        String msg = ex.getMessage() == null ? "Lỗi nghiệp vụ" : ex.getMessage();
        int status = 400;
        if (msg.startsWith("Không tìm thấy")) status = 404;
        if (msg.startsWith("Lỗi cơ sở dữ liệu")) { status = 500; ex.printStackTrace(); }
        send(resp, status, Map.of("error", msg));
    }

    private static String patientCode(int id) { return String.format("BN%03d", id); }
    private static String recordCode(int id) { return String.format("BA%03d", id); }
    private static String prescriptionCode(int id) { return String.format("DT%03d", id); }
    private static int parseCode(String code, String prefix, String message) {
        if (!code.matches(prefix + "[0-9]{1,9}")) throw new InputError(message);
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
