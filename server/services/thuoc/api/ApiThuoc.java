package clinic.services.thuoc.api;

import clinic.services.thuoc.xuly.XuLyThuoc;
import clinic.shared.exception.LoiDuLieu;
import clinic.shared.servlet.ApiChung;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.sql.SQLException;
import java.util.Map;

// Tiếp nhận yêu cầu quản lý thuốc
public class ApiThuoc extends ApiChung {
    private final XuLyThuoc thuoc = new XuLyThuoc();

    @Override
    protected void doPost(HttpServletRequest yeuCau, HttpServletResponse phanHoi) throws IOException {
        execute(
                yeuCau,
                phanHoi,
                () -> {
                    if (yeuCau.getPathInfo() != null) {
                        khongTimThay(phanHoi);
                        return;
                    }
                    send(phanHoi, 201, thuoc.create(docNoiDung(yeuCau)));
                });
    }

    @Override
    protected void doPut(HttpServletRequest yeuCau, HttpServletResponse phanHoi) throws IOException {
        execute(
                yeuCau,
                phanHoi,
                () ->
                        send(
                                phanHoi,
                                200,
                                thuoc.update(drugIdFromPath(yeuCau.getPathInfo()), docNoiDung(yeuCau))));
    }

    @Override
    protected void doDelete(HttpServletRequest yeuCau, HttpServletResponse phanHoi) throws IOException {
        execute(
                yeuCau,
                phanHoi,
                () -> {
                    String duongDan = yeuCau.getPathInfo();
                    if (duongDan == null || !duongDan.matches("/[1-9][0-9]*")) {
                        send(phanHoi, 404, Map.of("error", "Đường dẫn mã thuốc không hợp lệ"));
                        return;
                    }
                    thuoc.delete(drugIdFromPath(duongDan));
                    send(phanHoi, 200, Map.of("deleted", true));
                });
    }

    @Override
    protected void loiDuLieu(HttpServletRequest yeuCau, HttpServletResponse phanHoi, SQLException loi)
            throws IOException {
        loi.printStackTrace();
        if ("23505".equals(loi.getSQLState())) { // unique_violation
            send(phanHoi, 409, Map.of("error", "Tên thuốc đã có trong danh mục."));
        } else if ("23503".equals(loi.getSQLState())) { // foreign_key_violation
            send(phanHoi, 409, Map.of("error", "Thuốc đã được kê trong đơn thuốc nên không thể xóa."));
        } else {
            send(phanHoi, 500, Map.of("error", "Lỗi PostgreSQL khi quản lý thuốc. Xem terminal."));
        }
    }

    private static int drugIdFromPath(String duongDan) {
        if (duongDan == null || !duongDan.matches("/[1-9][0-9]*"))
            throw new LoiDuLieu("Đường dẫn mã thuốc không hợp lệ");
        return Integer.parseInt(duongDan.substring(1));
    }
}
