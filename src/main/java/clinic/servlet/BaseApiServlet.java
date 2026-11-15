package clinic.servlet;

import com.google.gson.*;

import jakarta.servlet.http.*;

import clinic.exception.InputError;
import clinic.exception.NghiepVuException;

import java.io.IOException;
import java.sql.SQLException;
import java.time.format.DateTimeParseException;
import java.util.Map;

public abstract class BaseApiServlet extends HttpServlet {
    private static final Gson JSON = new Gson();

    @FunctionalInterface
    protected interface ApiAction {
        void run() throws IOException, SQLException, NghiepVuException;
    }

    protected void execute(HttpServletRequest req, HttpServletResponse resp, ApiAction action)
            throws IOException {
        try {
            action.run();
        } catch (NghiepVuException ex) {
            businessError(resp, ex);
        } catch (InputError
                | IllegalStateException
                | UnsupportedOperationException
                | DateTimeParseException
                | NumberFormatException ex) {
            send(
                    resp,
                    400,
                    Map.of(
                            "error",
                            ex.getMessage() == null ? "Dữ liệu không hợp lệ" : ex.getMessage()));
        } catch (SQLException ex) {
            databaseError(req, resp, ex);
        } catch (RuntimeException ex) {
            send(resp, 400, Map.of("error", "JSON không hợp lệ"));
        }
    }

    protected JsonObject readBody(HttpServletRequest req) throws IOException {
        req.setCharacterEncoding("UTF-8");
        if (req.getContentLengthLong() > 1024 * 1024) throw new InputError("Dữ liệu quá lớn");
        return JsonParser.parseReader(req.getReader()).getAsJsonObject();
    }

    protected void databaseError(HttpServletRequest req, HttpServletResponse resp, SQLException ex)
            throws IOException {
        ex.printStackTrace();
        if ("GET".equals(req.getMethod())) {
            send(
                    resp,
                    500,
                    Map.of(
                            "error",
                            "Không đọc được PostgreSQL. Kiểm tra container (docker compose ps) và"
                                + " log Java."));
        } else if (ex.getSQLState() != null && ex.getSQLState().startsWith("23")) {
            send(
                    resp,
                    409,
                    Map.of(
                            "error",
                            "Bệnh nhân/bệnh án không tồn tại hoặc bệnh án đã có đơn thuốc."));
        } else {
            send(
                    resp,
                    500,
                    Map.of("error", "Lỗi PostgreSQL khi lưu dữ liệu. Xem terminal backend."));
        }
    }

    protected void notFound(HttpServletResponse resp) throws IOException {
        send(resp, 404, Map.of("error", "API không tồn tại"));
    }

    protected static void businessError(HttpServletResponse resp, NghiepVuException ex)
            throws IOException {
        String msg = ex.getMessage() == null ? "Lỗi nghiệp vụ" : ex.getMessage();
        int status = 400;
        if (msg.startsWith("Không tìm thấy")) status = 404;
        if (msg.startsWith("Lỗi cơ sở dữ liệu")) {
            status = 500;
            ex.printStackTrace();
        }
        send(resp, status, Map.of("error", msg));
    }

    protected static void send(HttpServletResponse resp, int status, Object data)
            throws IOException {
        resp.setStatus(status);
        resp.setCharacterEncoding("UTF-8");
        resp.setContentType("application/json; charset=UTF-8");
        resp.setHeader("Cache-Control", "no-store");
        resp.getWriter().write(JSON.toJson(data));
    }
}
