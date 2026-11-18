package clinic.services.taikhoan;
import clinic.shared.servlet.ApiChung;
import com.google.gson.JsonObject;
import jakarta.servlet.http.*;
import java.io.IOException;
import java.sql.SQLException;
import java.util.Map;
import java.util.Set;

// Đăng nhập đăng ký và kết thúc phiên
public class ApiDangNhap extends ApiChung {
    private final KhoTaiKhoan khoTaiKhoan = new KhoTaiKhoan();

    @Override
    protected void doGet(
            HttpServletRequest yeuCau,
            HttpServletResponse phanHoi
    ) throws IOException {

        if (!"/me".equals(yeuCau.getPathInfo())) {
            khongTimThay(phanHoi);
            return;
        }

        TaiKhoan taiKhoan = (TaiKhoan) yeuCau.getAttribute("account");

        send(phanHoi, 200, KhoTaiKhoan.duLieuCongKhai(taiKhoan));
    }

    @Override
    protected void doPost(
            HttpServletRequest yeuCau,
            HttpServletResponse phanHoi
    ) throws IOException {

        execute(yeuCau, phanHoi, () -> {
            String duongDan = yeuCau.getPathInfo();

            if ("/logout".equals(duongDan)) {
                yeuCau.getSession(false).invalidate();

                send(phanHoi, 200, Map.of(
                        "message", "Đã đăng xuất"
                ));
                return;
            }

            if (!"/login".equals(duongDan)
                    && !"/register".equals(duongDan)) {
                khongTimThay(phanHoi);
                return;
            }

            JsonObject noiDung = docNoiDung(yeuCau);

            String tenNhap = text(noiDung, "u").trim();
            String matKhau = text(noiDung, "p");

            if ("/register".equals(duongDan)) {
                String ten = text(noiDung, "n").trim();
                String vaiTro = text(noiDung, "r");

                if (!tenNhap.matches("[A-Za-z0-9._-]{4,50}")
                        || ten.isBlank()
                        || ten.length() > 100
                        || matKhau.length() < 6
                        || matKhau.length() > 128
                        || !Set.of("BAC_SI", "LE_TAN").contains(vaiTro)) {

                    send(phanHoi, 400, Map.of(
                            "error", "Thông tin đăng ký không hợp lệ"
                    ));
                    return;
                }

                try {
                    khoTaiKhoan.register(
                            tenNhap,
                            ten,
                            matKhau,
                            vaiTro
                    );

                    send(phanHoi, 201, Map.of(
                            "message",
                            "Đăng ký thành công. Vui lòng chờ quản trị viên duyệt."
                    ));
                } catch (SQLException loi) {
                    if (!"23505".equals(loi.getSQLState())) {
                        throw loi;
                    }

                    send(phanHoi, 409, Map.of(
                            "error", "Tên đăng nhập đã tồn tại"
                    ));
                }

                return;
            }

            TaiKhoan taiKhoan = khoTaiKhoan.timTheoTen(tenNhap);

            if (taiKhoan == null
                    || !MatKhau.khop(
                            matKhau,
                            taiKhoan.maBam()
                    )) {

                send(phanHoi, 401, Map.of(
                        "error", "Sai tên đăng nhập hoặc mật khẩu"
                ));
                return;
            }

            if (!"Hoạt động".equals(taiKhoan.trangThai())) {
                String thongBao = switch (taiKhoan.trangThai()) {
                    case "Chờ duyệt" ->
                            "Tài khoản đang chờ quản trị viên duyệt";
                    case "Từ chối" ->
                            "Yêu cầu đăng ký đã bị từ chối";
                    default ->
                            "Tài khoản đã bị khóa";
                };

                send(phanHoi, 403, Map.of("error", thongBao));
                return;
            }

            if (!Set.of(
                    "QUAN_TRI",
                    "BAC_SI",
                    "LE_TAN"
            ).contains(taiKhoan.vaiTro())) {

                send(phanHoi, 403, Map.of(
                        "error", "Vai trò này chưa có giao diện"
                ));
                return;
            }

            HttpSession phienCu = yeuCau.getSession(false);

            if (phienCu != null) {
                phienCu.invalidate();
            }

            HttpSession phien = yeuCau.getSession(true);

            phien.setAttribute("accountId", taiKhoan.ma());
            phien.setMaxInactiveInterval(1800);

            send(phanHoi, 200, KhoTaiKhoan.duLieuCongKhai(taiKhoan));
        });
    }

    private String text(JsonObject noiDung, String khoa) {
        if (!noiDung.has(khoa) || noiDung.get(khoa).isJsonNull()) {
            return "";
        }

        return noiDung.get(khoa).getAsString();
    }
}
