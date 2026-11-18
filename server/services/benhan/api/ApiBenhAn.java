package clinic.services.benhan.api;

import clinic.services.benhan.xuly.XuLyBenhAn;
import clinic.shared.servlet.ApiChung;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;

// Tiếp nhận yêu cầu lập bệnh án
public class ApiBenhAn extends ApiChung {
    private final XuLyBenhAn benhAn = new XuLyBenhAn();

    @Override
    protected void doPost(HttpServletRequest yeuCau, HttpServletResponse phanHoi) throws IOException {
        execute(yeuCau, phanHoi, () -> send(phanHoi, 201, benhAn.create(docNoiDung(yeuCau))));
    }
}
