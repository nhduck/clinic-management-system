var MENU_BAC_SI = [
    ["home", "Trang chủ"],
    ["myappts", "Lịch khám của tôi"],
    ["rec", "Bệnh án"],
    ["rxl", "Đơn thuốc"],
    ["drugs", "Quản lý thuốc"]
];

var MENU_LE_TAN = [
    ["home", "Trang chủ"],
    ["patients", "Quản lý bệnh nhân"],
    ["appointments", "Lịch khám"]
];

var MENU_QUAN_TRI = [
    ["home", "Trang chủ"],
    ["doctors", "Quản lý bác sĩ"],
    ["specialties", "Chuyên khoa"],
    ["accounts", "Tài khoản"]
];

var DUONG_DAN = {
    auth: "/login",
    home: "/dashboard",
    patients: "/patients",
    appointments: "/appointments",
    myappts: "/my-appointments",
    rec: "/medical-records",
    new: "/medical-records/new",
    det: "/medical-records/:id",
    rxl: "/prescriptions",
    rxn: "/prescriptions/new",
    rxv: "/prescriptions/:id",
    drugs: "/drugs",
    doctors: "/doctors",
    specialties: "/specialties",
    accounts: "/accounts"
};

var trangCho = null;

// Chọn các mục trên menu theo vai trò
function menuHienTai() {
    if (trangThai.nguoiDung.r === "Quản trị") {
        return MENU_QUAN_TRI;
    }

    if (trangThai.nguoiDung.r === "Lễ tân") {
        return MENU_LE_TAN;
    }

    return MENU_BAC_SI;
}

function trangDuocXem() {
    const cacTrang = menuHienTai().map(muc => muc[0]);

    if (trangThai.nguoiDung.r === "Bác sĩ") {
        cacTrang.push("new", "det", "rxn", "rxv");
    }

    return cacTrang;
}

function duongDanTrang(trang, ma) {
    const diaChi = DUONG_DAN[trang] || "/dashboard";

    if (ma) {
        return diaChi.replace(":id", encodeURIComponent(ma));
    }

    return diaChi.replace("/:id", "");
}

function nhomTrang(trang) {
    if (trang === "auth") {
        return "auth";
    }

    if (trang === "myappts") {
        return "appointments";
    }

    return duongDanTrang(trang).split("/")[1];
}

// Xác định màn hình và mã hồ sơ từ địa chỉ trang
function docDiaChi() {
    const duongDan = location.pathname.replace(/\/+$/, "") || "/";

    if (duongDan === "/login" || duongDan === "/register") {
        return {
            view: "auth",
            tab: duongDan === "/register" ? "up" : "in"
        };
    }

    for (const trang in DUONG_DAN) {
        if (DUONG_DAN[trang] === duongDan) {
            return { view: trang };
        }
    }

    const khop = duongDan.match(
        /^\/(medical-records|prescriptions)\/([^/]+)$/
    );

    if (khop) {
        try {
            return {
                view: khop[1] === "medical-records" ? "det" : "rxv",
                id: decodeURIComponent(khop[2])
            };
        } catch { }
    }

    return {
        view: trangThai.nguoiDung ? "home" : "auth",
        tab: "in"
    };
}

// Kiểm tra quyền và mở màn hình được yêu cầu
function moTrang(loTrinh, thayThe = false) {
    let { view: trang, id: ma, tab } = loTrinh;
    let tin = "";

    if (!trangThai.nguoiDung) {
        if (trang !== "auth") {
            trangCho = loTrinh;

            sessionStorage.setItem(
                "clinicPendingRoute",
                JSON.stringify(loTrinh)
            );
        }

        trang = "auth";
        trangThai.tab = tab || "in";
    } else {
        if (trang === "auth") {
            trang = "home";
        }

        if (!trangDuocXem().includes(trang)) {
            trang = "home";
            thayThe = true;
            tin = "Bạn không có quyền truy cập trang này.";
        }

        if (trang === "det" && !trangThai.benhAn.some(muc => muc.id === ma)) {
            trang = "rec";
            thayThe = true;
            tin = "Không tìm thấy bệnh án.";
        }

        if (trang === "rxv" && !trangThai.donThuoc.some(muc => muc.id === ma)) {
            trang = "rxl";
            thayThe = true;
            tin = "Không tìm thấy đơn thuốc.";
        }
    }

    let diaChi;
    if (trang === "auth" && trangThai.tab === "up") {
        diaChi = "/register";
    } else {
        diaChi = duongDanTrang(trang, ma);
    }

    if (trang === "appointments" && trangThai.trang !== trang && document.body.dataset.page === "appointments") {
        xoaFormLich();
    }

    trangThai.trang = trang === "auth" ? "home" : trang;
    trangThai.maDangXem = ma || null;
    trangThai.thuocKe = [];
    trangThai.maBenhAn = "";
    trangThai.tuKhoa = "";

    xoaThongBao();

    if (tin) {
        baoTin("e", tin);
    }

    if (nhomTrang(trang) !== document.body.dataset.page) {
        luuDemo();

        if (trangThai.thongBao) {
            sessionStorage.setItem(
                "clinicFlash",
                JSON.stringify(trangThai.thongBao)
            );
        }

        if (thayThe) {
            location.replace(diaChi);
        } else {
            location.assign(diaChi);
        }

        return;
    }

    if (location.pathname + location.search + location.hash !== diaChi) {
        if (thayThe) {
            history.replaceState(null, "", diaChi);
        } else {
            history.pushState(null, "", diaChi);
        }
    }

    veTrang();
}

function chuyenTrang(trang, ma, nguCanh) {
    if (trangThai.nguoiDung && !trangDuocXem().includes(trang)) {
        baoTin("e", "Bạn không có quyền truy cập trang này.");
        veTrang();
        return;
    }

    if (nguCanh) {
        sessionStorage.setItem(
            "clinicPageContext",
            JSON.stringify({
                view: trang,
                data: nguCanh
            })
        );
    }

    moTrang({ view: trang, id: ma });
}

function moDangNhap(tab, thayThe = false) {
    moTrang(
        {
            view: "auth",
            tab
        },
        thayThe
    );
}

function sauDangNhap() {
    const loTrinh = trangCho
        || docPhien("clinicPendingRoute")
        || { view: "home" };

    trangCho = null;

    sessionStorage.removeItem("clinicPendingRoute");

    moTrang(loTrinh, true);
}

// Khôi phục thông tin khi chuyển sang màn hình mới
function napNguCanh() {
    const tinCho = docPhien("clinicFlash");

    sessionStorage.removeItem("clinicFlash");

    if (Array.isArray(tinCho)) {
        baoTin(tinCho[0], tinCho[1]);
        veTrang();
    }

    const nguCanh = docPhien("clinicPageContext");

    if (nguCanh?.view !== trangThai.trang) {
        return;
    }

    sessionStorage.removeItem("clinicPageContext");

    if (trangThai.trang === "new") {
        layThe("f1").value = nguCanh.data.pid || "";
        layThe("f2").value = nguCanh.data.date || homNay();
    }

    if (trangThai.trang === "rxn") {
        trangThai.maBenhAn = nguCanh.data.recordId || "";
        veKeDon();
    }
}

function taoDieuHuong() {
    window.addEventListener("popstate", () => {
        dongMenu();
        moTrang(docDiaChi(), true);
    });

    moTrang(docDiaChi(), true);
}
