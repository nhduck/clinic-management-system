package clinic.services.benhan.xuly;

import static clinic.shared.util.DocJson.*;

import clinic.services.benhan.kho.KhoBenhAn;

import com.google.gson.*;

import java.sql.SQLException;
import java.time.LocalDate;
import java.util.*;

// Kiểm tra thông tin của lần khám
public class XuLyBenhAn {
    private final KhoBenhAn benhAn = new KhoBenhAn();

    public Map<String, String> create(JsonObject noiDung) throws SQLException {

        int maBenhNhan = docMa(batBuoc(noiDung, "pid", 20), "BN", "Mã bệnh nhân không hợp lệ");
        LocalDate ngay = ngay(batBuoc(noiDung, "date", 10));
        String trieuChung = batBuoc(noiDung, "sym", 5000);
        String chanDoan = batBuoc(noiDung, "dx", 5000);
        String ghiChu = tuyChon(noiDung, "note", 5000);

        return benhAn.create(maBenhNhan, ngay, trieuChung, chanDoan, ghiChu);
    }
}
