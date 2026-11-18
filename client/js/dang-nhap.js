function chonTab(tab) {
    moDangNhap(tab);
}

// Đăng nhập và tải dữ liệu của tài khoản
async function dangNhap() {
    const tenNhap = layGiaTri("u");
    const matKhau = layThe("p").value;

    if (!tenNhap || !matKhau) {
        baoTin("e", "Vui lòng nhập tên đăng nhập và mật khẩu.");
        veTrang();
        return;
    }

    try {
        trangThai.nguoiDung = await goiApi("/api/auth/login", {
            method: "POST",
            body: JSON.stringify({
                u: tenNhap,
                p: matKhau
            })
        });

        napDemo();
        await taiDuLieu();
        sauDangNhap();
    } catch (loi) {
        trangThai.nguoiDung = null;
        baoTin("e", loi.message);
        veTrang();
    }
}

// Gửi thông tin đăng ký để chờ duyệt
async function dangKy() {
    const ten = layGiaTri("n");
    const vaiTro = layGiaTri("r");
    const tenNhap = layGiaTri("u");
    const matKhau = layThe("p").value;

    if (!ten || !tenNhap || !matKhau || !layThe("p2").value) {
        baoTin("e", "Vui lòng điền đầy đủ thông tin.");
        veTrang();
        return;
    }

    if (matKhau !== layThe("p2").value) {
        baoTin("e", "Mật khẩu nhập lại không khớp.");
        veTrang();
        return;
    }

    try {
        const ketQua = await goiApi("/api/auth/register", {
            method: "POST",
            body: JSON.stringify({
                n: ten,
                r: vaiTro,
                u: tenNhap,
                p: matKhau
            })
        });

        layThe("p").value = "";
        layThe("p2").value = "";

        moDangNhap("in", true);
        baoTin("k", ketQua.message);
        veTrang();
    } catch (loi) {
        baoTin("e", loi.message);
        veTrang();
    }
}

// Hiển thị biểu mẫu theo chế độ đăng nhập hoặc đăng ký
function veDangNhap() {
    const dangKyMoi = trangThai.tab === "up";

    ganChu(
        "auth-title",
        dangKyMoi ? "Tạo tài khoản mới" : "Chào mừng trở lại"
    );

    ganChu(
        "auth-subtitle",
        dangKyMoi
            ? "Tài khoản cần được quản trị viên duyệt trước khi sử dụng."
            : "Đăng nhập để bắt đầu phiên làm việc."
    );

    layThe("auth-screen").hidden = !!trangThai.nguoiDung;
    layThe("auth-extra").hidden = !dangKyMoi;
    layThe("auth-password-confirm").hidden = !dangKyMoi;
    layThe("auth-demo").hidden = dangKyMoi;

    layThe("auth-in").classList.toggle("on", !dangKyMoi);
    layThe("auth-up").classList.toggle("on", dangKyMoi);

    ganChu(
        "auth-submit",
        dangKyMoi ? "Gửi đăng ký" : "Đăng nhập"
    );

    const thongBao = layThe("auth-notice");

    thongBao.hidden = !!trangThai.nguoiDung || !trangThai.thongBao;
    thongBao.className = trangThai.thongBao ? "msg " + trangThai.thongBao[0] : "";
    thongBao.textContent = trangThai.thongBao ? trangThai.thongBao[1] : "";
}

ganSuKien("auth-in", "click", () => chonTab("in"));
ganSuKien("auth-up", "click", () => chonTab("up"));

ganSuKien("auth-submit", "click", () => {
    if (trangThai.tab === "in") {
        dangNhap();
    } else {
        dangKy();
    }
});
