package clinic.services.taikhoan;
import clinic.shared.servlet.ApiChung;
import jakarta.servlet.http.*;
import java.io.IOException;
import java.util.Map;

// Quản lý các yêu cầu duyệt tài khoản
public class ApiTaiKhoan extends ApiChung {
    private final KhoTaiKhoan khoTaiKhoan = new KhoTaiKhoan();

    private boolean laQuanTri(
            HttpServletRequest yeuCau,
            HttpServletResponse phanHoi
    ) throws IOException {

        TaiKhoan taiKhoan = (TaiKhoan) yeuCau.getAttribute("account");

        if (taiKhoan != null
                && "QUAN_TRI".equals(taiKhoan.vaiTro())) {
            return true;
        }

        send(phanHoi, 403, Map.of(
                "error", "Chỉ quản trị viên được quản lý tài khoản"
        ));

        return false;
    }

    @Override
    protected void doGet(
            HttpServletRequest yeuCau,
            HttpServletResponse phanHoi
    ) throws IOException {

        if (!laQuanTri(yeuCau, phanHoi)) {
            return;
        }

        execute(yeuCau, phanHoi, () -> {
            send(phanHoi, 200, khoTaiKhoan.layTatCa());
        });
    }

    @Override
    protected void doPost(
            HttpServletRequest yeuCau,
            HttpServletResponse phanHoi
    ) throws IOException {

        if (!laQuanTri(yeuCau, phanHoi)) {
            return;
        }

        execute(yeuCau, phanHoi, () -> {
            String duongDan = yeuCau.getPathInfo();

            if (duongDan == null
                    || !duongDan.matches("/[0-9]+/(approve|reject)")) {
                khongTimThay(phanHoi);
                return;
            }

            String[] cacPhan = duongDan.split("/");

            int ma = Integer.parseInt(cacPhan[1]);

            String trangThai = "approve".equals(cacPhan[2])
                    ? "Hoạt động"
                    : "Từ chối";

            if (!khoTaiKhoan.review(ma, trangThai)) {
                send(phanHoi, 409, Map.of(
                        "error",
                        "Tài khoản không còn ở trạng thái chờ duyệt"
                ));
                return;
            }

            send(phanHoi, 200, Map.of(
                    "message", "Đã cập nhật tài khoản"
            ));
        });
    }
}
