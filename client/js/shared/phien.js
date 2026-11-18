function docPhien(khoa) {
    try {
        return JSON.parse(sessionStorage.getItem(khoa));
    } catch {
        return null;
    }
}

// Lưu dữ liệu demo theo tài khoản trong phiên trình duyệt
function luuDemo() {
    if (!trangThai.nguoiDung) {
        return;
    }

    const duLieu = {
        uiPatients: trangThai.benhNhanDemo,
        doctors: trangThai.bacSiDemo,
        specialties: trangThai.chuyenKhoa
    };

    sessionStorage.setItem(
        "clinicDemoData:" + trangThai.nguoiDung.u,
        JSON.stringify(duLieu)
    );
}

function napDemo() {
    const duLieu = docPhien("clinicDemoData:" + trangThai.nguoiDung.u);

    if (!duLieu) {
        return;
    }

    if (Array.isArray(duLieu.uiPatients)) {
        trangThai.benhNhanDemo = duLieu.uiPatients;
    }
    if (Array.isArray(duLieu.doctors)) {
        trangThai.bacSiDemo = duLieu.doctors;
    }
    if (Array.isArray(duLieu.specialties)) {
        trangThai.chuyenKhoa = duLieu.specialties;
    }
}

async function dangXuat() {
    try {
        await goiApi("/api/auth/logout", {
            method: "POST"
        });
    } catch (loi) {
        if (loi.status !== 401) {
            baoTin("e", loi.message);
            veTrang();
            return;
        }
    }

    luuDemo();

    sessionStorage.removeItem("clinicDemoUser");
    sessionStorage.removeItem("clinicDemoProfile");
    sessionStorage.removeItem("clinicPendingRoute");
    sessionStorage.removeItem("clinicPageContext");

    trangCho = null;
    trangThai.nguoiDung = null;

    moDangNhap("in", true);
}

// Kiểm tra phiên đăng nhập khi mở trang
async function napPhien() {
    try {
        trangThai.nguoiDung = await goiApi("/api/auth/me");

        napDemo();
        await taiDuLieu();

        trangThai.trang = "home";
        xoaThongBao();
    } catch (loi) {
        trangThai.nguoiDung = null;

        if (loi.status !== 401) {
            baoTin("e", loi.message);
        }
    }
}
