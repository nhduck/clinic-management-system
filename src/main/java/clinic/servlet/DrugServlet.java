package clinic.servlet;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import clinic.exception.InputError;
import clinic.service.DrugService;

import java.io.IOException;
import java.sql.SQLException;
import java.util.Map;

public class DrugServlet extends BaseApiServlet {
    private final DrugService drugs = new DrugService();

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        execute(
                req,
                resp,
                () -> {
                    if (req.getPathInfo() != null) {
                        notFound(resp);
                        return;
                    }
                    send(resp, 201, drugs.create(readBody(req)));
                });
    }

    @Override
    protected void doPut(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        execute(
                req,
                resp,
                () ->
                        send(
                                resp,
                                200,
                                drugs.update(drugIdFromPath(req.getPathInfo()), readBody(req))));
    }

    @Override
    protected void doDelete(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        execute(
                req,
                resp,
                () -> {
                    String path = req.getPathInfo();
                    if (path == null || !path.matches("/[1-9][0-9]*")) {
                        send(resp, 404, Map.of("error", "Đường dẫn mã thuốc không hợp lệ"));
                        return;
                    }
                    drugs.delete(drugIdFromPath(path));
                    send(resp, 200, Map.of("deleted", true));
                });
    }

    @Override
    protected void databaseError(HttpServletRequest req, HttpServletResponse resp, SQLException ex)
            throws IOException {
        ex.printStackTrace();
        if ("23505".equals(ex.getSQLState())) { // unique_violation
            send(resp, 409, Map.of("error", "Tên thuốc đã có trong danh mục."));
        } else if ("23503".equals(ex.getSQLState())) { // foreign_key_violation
            send(resp, 409, Map.of("error", "Thuốc đã được kê trong đơn thuốc nên không thể xóa."));
        } else {
            send(resp, 500, Map.of("error", "Lỗi PostgreSQL khi quản lý thuốc. Xem terminal."));
        }
    }

    private static int drugIdFromPath(String path) {
        if (path == null || !path.matches("/[1-9][0-9]*"))
            throw new InputError("Đường dẫn mã thuốc không hợp lệ");
        return Integer.parseInt(path.substring(1));
    }
}
