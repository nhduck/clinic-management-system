package clinic.services.taikhoan;
import com.google.gson.Gson;
import jakarta.servlet.*;
import jakarta.servlet.http.*;
import java.io.IOException;
import java.sql.SQLException;
import java.util.Map;
import java.util.Set;

// Kiểm tra phiên và trạng thái tài khoản
public class LocDangNhap implements Filter {
    private final KhoTaiKhoan khoTaiKhoan = new KhoTaiKhoan();

    @Override
    public void doFilter(
            ServletRequest yeuCauGoc,
            ServletResponse phanHoiGoc,
            FilterChain chuoiLoc
    ) throws IOException, ServletException {

        HttpServletRequest yeuCau = (HttpServletRequest) yeuCauGoc;
        HttpServletResponse phanHoi = (HttpServletResponse) phanHoiGoc;

        String duongDan = yeuCau.getRequestURI();

        // Kiểm tra các yêu cầu thay đổi dữ liệu
        String phuongThuc = yeuCau.getMethod();
        boolean canKiemTra = Set.of("POST", "PUT", "DELETE", "PATCH").contains(phuongThuc);
        String kieuGui = yeuCau.getHeader("X-Requested-With");
        if (canKiemTra && !"XMLHttpRequest".equals(kieuGui)) {

            error(phanHoi, 403, "Yêu cầu không hợp lệ");
            return;
        }

        if ("/api/auth/login".equals(duongDan) || "/api/auth/register".equals(duongDan)) {

            chuoiLoc.doFilter(yeuCau, phanHoi);
            return;
        }

        HttpSession phien = yeuCau.getSession(false);

        Integer ma = phien == null
                ? null
                : (Integer) phien.getAttribute("accountId");

        if (ma == null) {
            error(phanHoi, 401, "Vui lòng đăng nhập");
            return;
        }

        try {
            TaiKhoan taiKhoan = khoTaiKhoan.timTheoMa(ma);

            if (taiKhoan == null
                    || !"Hoạt động".equals(taiKhoan.trangThai())) {

                phien.invalidate();

                error(
                        phanHoi,
                        401,
                        "Tài khoản không còn được phép đăng nhập"
                );
                return;
            }

            yeuCau.setAttribute("account", taiKhoan);

            chuoiLoc.doFilter(yeuCau, phanHoi);
        } catch (SQLException loi) {
            loi.printStackTrace();

            error(
                    phanHoi,
                    500,
                    "Không kết nối được cơ sở dữ liệu"
            );
        }
    }

    private void error(
            HttpServletResponse phanHoi,
            int trangThai,
            String thongBao
    ) throws IOException {

        phanHoi.setStatus(trangThai);
        phanHoi.setContentType("application/json; charset=UTF-8");
        phanHoi.setHeader("Cache-Control", "no-store");

        phanHoi.getWriter().write(
                new Gson().toJson(
                        Map.of("error", thongBao)
                )
        );
    }
}
