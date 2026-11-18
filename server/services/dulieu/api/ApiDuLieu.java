package clinic.services.dulieu.api;

import clinic.services.dulieu.xuly.XuLyDuLieu;
import clinic.shared.servlet.ApiChung;
import jakarta.servlet.http.*;
import java.io.IOException;

// Gửi dữ liệu ban đầu cho giao diện
public class ApiDuLieu extends ApiChung {
    private final XuLyDuLieu xuLy = new XuLyDuLieu();

    @Override
    protected void doGet(HttpServletRequest yeuCau, HttpServletResponse phanHoi) throws IOException {
        execute(yeuCau, phanHoi, () -> send(phanHoi, 200, xuLy.load()));
    }
}
