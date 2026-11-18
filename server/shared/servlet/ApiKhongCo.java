package clinic.shared.servlet;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;

// Trả thông báo khi đường dẫn API không tồn tại
public class ApiKhongCo extends ApiChung {
    @Override
    protected void service(HttpServletRequest yeuCau, HttpServletResponse phanHoi) throws IOException {
        khongTimThay(phanHoi);
    }
}
