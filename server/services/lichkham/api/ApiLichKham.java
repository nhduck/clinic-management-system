package clinic.services.lichkham.api;

import clinic.services.lichkham.xuly.XuLyLich;
import clinic.shared.servlet.ApiChung;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;

// Tiếp nhận yêu cầu đặt đổi và hủy lịch
public class ApiLichKham extends ApiChung {
    private final XuLyLich lichKham = new XuLyLich();

    @Override
    protected void doPost(HttpServletRequest yeuCau, HttpServletResponse phanHoi) throws IOException {
        execute(
                yeuCau,
                phanHoi,
                () -> {
                    String duongDan = yeuCau.getPathInfo();
                    if (duongDan == null) {
                        send(phanHoi, 201, lichKham.datLich(docNoiDung(yeuCau)));
                    } else if (duongDan.matches("/LK[0-9]{1,9}/cancel")) {
                        docNoiDung(yeuCau);
                        send(phanHoi, 200, lichKham.huyLich(duongDan.split("/")[1]));
                    } else {
                        khongTimThay(phanHoi);
                    }
                });
    }

    @Override
    protected void doPut(HttpServletRequest yeuCau, HttpServletResponse phanHoi) throws IOException {
        execute(
                yeuCau,
                phanHoi,
                () -> {
                    String duongDan = yeuCau.getPathInfo();
                    if (duongDan != null && duongDan.matches("/LK[0-9]{1,9}")) {
                        send(
                                phanHoi,
                                200,
                                lichKham.doiLich(duongDan.substring(1), docNoiDung(yeuCau)));
                    } else {
                        khongTimThay(phanHoi);
                    }
                });
    }
}
