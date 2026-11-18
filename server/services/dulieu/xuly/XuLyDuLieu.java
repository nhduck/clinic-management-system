package clinic.services.dulieu.xuly;

import clinic.services.lichkham.xuly.XuLyLich;
import clinic.services.thuoc.kho.KhoThuoc;
import clinic.services.benhnhan.kho.KhoBenhNhan;
import clinic.services.donthuoc.kho.KhoDonThuoc;
import clinic.services.benhan.kho.KhoBenhAn;
import clinic.shared.exception.LoiNghiepVu;

import java.sql.SQLException;
import java.util.*;

// Tập hợp dữ liệu cho các màn hình
public class XuLyDuLieu {
    private final KhoBenhNhan benhNhan = new KhoBenhNhan();
    private final KhoBenhAn benhAn = new KhoBenhAn();
    private final KhoDonThuoc donThuoc = new KhoDonThuoc();
    private final KhoThuoc thuoc = new KhoThuoc();

    public Map<String, Object> load() throws SQLException, LoiNghiepVu {
        List<Map<String, Object>> dsThuoc = thuoc.layTatCa();
        List<String> tenThuoc = new ArrayList<>();
        for (Map<String, Object> muc : dsThuoc) {
            tenThuoc.add((String) muc.get("name"));
        }
        return Map.of(
                "pts",
                benhNhan.layTatCa(),
                "drugs",
                tenThuoc,
                "drugItems",
                dsThuoc,
                "recs",
                benhAn.layTatCa(),
                "rx",
                donThuoc.layTatCa(),
                "shifts",
                XuLyLich.dsCa(),
                "appts",
                XuLyLich.dsLich());
    }
}
