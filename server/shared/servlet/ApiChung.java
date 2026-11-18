package clinic.shared.servlet;

import clinic.shared.exception.LoiDuLieu;
import clinic.shared.exception.LoiNghiepVu;

import com.google.gson.*;

import jakarta.servlet.http.*;

import java.io.IOException;
import java.sql.SQLException;
import java.time.format.DateTimeParseException;
import java.util.Map;

// Đọc yêu cầu gửi kết quả và xử lý lỗi chung
public abstract class ApiChung extends HttpServlet {
    private static final Gson JSON = new Gson();

    // Gom việc trả lỗi về một nơi cho các API
    @FunctionalInterface
    protected interface ThaoTacApi {
        void run() throws IOException, SQLException, LoiNghiepVu;
    }

    protected void execute(HttpServletRequest yeuCau, HttpServletResponse phanHoi, ThaoTacApi thaoTac)
            throws IOException {
        try {
            thaoTac.run();
        } catch (LoiNghiepVu loi) {
            loiNghiepVu(phanHoi, loi);
        } catch (LoiDuLieu
                | IllegalStateException
                | UnsupportedOperationException
                | DateTimeParseException
                | NumberFormatException loi) {
            String thongBao = loi.getMessage();
            if (thongBao == null) {
                thongBao = "Dữ liệu không hợp lệ";
            }
            send(phanHoi, 400, Map.of("error", thongBao));
        } catch (SQLException loi) {
            loiDuLieu(yeuCau, phanHoi, loi);
        } catch (RuntimeException loi) {
            send(phanHoi, 400, Map.of("error", "JSON không hợp lệ"));
        }
    }

    protected JsonObject docNoiDung(HttpServletRequest yeuCau) throws IOException {
        yeuCau.setCharacterEncoding("UTF-8");
        if (yeuCau.getContentLengthLong() > 1024 * 1024) {
            throw new LoiDuLieu("Dữ liệu quá lớn");
        }
        return JsonParser.parseReader(yeuCau.getReader()).getAsJsonObject();
    }

    protected void loiDuLieu(HttpServletRequest yeuCau, HttpServletResponse phanHoi, SQLException loi)
            throws IOException {
        loi.printStackTrace();
        if ("GET".equals(yeuCau.getMethod())) {
            send(
                    phanHoi,
                    500,
                    Map.of(
                            "error",
                            "Không đọc được PostgreSQL. Kiểm tra container (docker compose ps) và"
                                    + " log Java."));
        } else if (loi.getSQLState() != null && loi.getSQLState().startsWith("23")) {
            send(
                    phanHoi,
                    409,
                    Map.of(
                            "error",
                            "Bệnh nhân/bệnh án không tồn tại hoặc bệnh án đã có đơn thuốc."));
        } else {
            send(
                    phanHoi,
                    500,
                    Map.of("error", "Lỗi PostgreSQL khi lưu dữ liệu. Xem terminal backend."));
        }
    }

    protected void khongTimThay(HttpServletResponse phanHoi) throws IOException {
        send(phanHoi, 404, Map.of("error", "API không tồn tại"));
    }

    protected static void loiNghiepVu(HttpServletResponse phanHoi, LoiNghiepVu loi)
            throws IOException {
        String thongBao = loi.getMessage() == null ? "Lỗi nghiệp vụ" : loi.getMessage();
        int trangThai = 400;
        if (thongBao.startsWith("Không tìm thấy")) trangThai = 404;
        if (thongBao.startsWith("Lỗi cơ sở dữ liệu")) {
            trangThai = 500;
            loi.printStackTrace();
        }
        send(phanHoi, trangThai, Map.of("error", thongBao));
    }

    protected static void send(HttpServletResponse phanHoi, int trangThai, Object duLieu)
            throws IOException {
        phanHoi.setStatus(trangThai);
        phanHoi.setCharacterEncoding("UTF-8");
        phanHoi.setContentType("application/json; charset=UTF-8");
        phanHoi.setHeader("Cache-Control", "no-store");
        phanHoi.getWriter().write(JSON.toJson(duLieu));
    }
}
