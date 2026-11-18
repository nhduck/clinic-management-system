package clinic.services.thuoc.xuly;

import static clinic.shared.util.DocJson.*;

import clinic.services.thuoc.kho.KhoThuoc;

import com.google.gson.*;

import java.sql.SQLException;
import java.util.*;

// Kiểm tra dữ liệu thuốc trước khi lưu
public class XuLyThuoc {
    private final KhoThuoc thuoc = new KhoThuoc();

    public Map<String, Object> create(JsonObject noiDung) throws SQLException {
        return thuoc.create(batBuoc(noiDung, "name", 100));
    }

    public Map<String, Object> update(int ma, JsonObject noiDung) throws SQLException {
        return thuoc.update(ma, batBuoc(noiDung, "name", 100));
    }

    public void delete(int ma) throws SQLException {
        thuoc.delete(ma);
    }
}
