package clinic.services.lichkham.api;

import clinic.services.lichkham.xuly.XuLyLich;
import clinic.shared.servlet.ApiChung;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;

// Trả về các giờ còn trống trong ca
public class ApiGioTrong extends ApiChung {
    @Override
    protected void doGet(HttpServletRequest yeuCau, HttpServletResponse phanHoi) throws IOException {
        execute(
                yeuCau,
                phanHoi,
                () -> send(phanHoi, 200, XuLyLich.gioTrong(yeuCau.getParameter("shift"))));
    }
}
