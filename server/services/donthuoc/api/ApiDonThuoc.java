package clinic.services.donthuoc.api;

import clinic.services.donthuoc.xuly.XuLyDonThuoc;
import clinic.shared.servlet.ApiChung;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;

// Tiếp nhận yêu cầu kê đơn
public class ApiDonThuoc extends ApiChung {
    private final XuLyDonThuoc donThuoc = new XuLyDonThuoc();

    @Override
    protected void doPost(HttpServletRequest yeuCau, HttpServletResponse phanHoi) throws IOException {
        execute(yeuCau, phanHoi, () -> send(phanHoi, 201, donThuoc.create(docNoiDung(yeuCau))));
    }
}
