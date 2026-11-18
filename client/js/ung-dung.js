// Cập nhật nội dung giao diện
function veTrang() {
    // Hiển thị giao diện theo trạng thái đăng nhập
    if (window.veDangNhap) {
        veDangNhap();
    }

    const ungDung = layThe("app");

    if (ungDung) {
        ungDung.hidden = !trangThai.nguoiDung;
    }

    if (!trangThai.nguoiDung) {
        return;
    }

    // Hiển thị thông tin người dùng
    const nguoiDung = trangThai.nguoiDung;

    ganChu("role-label", "Menu chính · " + nguoiDung.r);
    ganChu("user-name", nguoiDung.n);
    ganChu("user-role", nguoiDung.r);

    const tenVietTat = nguoiDung.n
        .split(" ")
        .slice(-2)
        .map((tu) => tu[0])
        .join("");

    ganChu("user-avatar", tenVietTat);

    // Xác định mục menu đang được chọn
    let mucChon = trangThai.trang;

    if (mucChon === "new" || mucChon === "det") {
        mucChon = "rec";
    } else if (mucChon === "rxn" || mucChon === "rxv") {
        mucChon = "rxl";
    }

    const cacMuc = menuHienTai();
    let tenTrang = "Tổng quan";

    for (const [maMuc, tenMuc] of cacMuc) {
        if (maMuc === mucChon) {
            tenTrang = tenMuc;
            break;
        }
    }

    ganChu("current-page", tenTrang);

    // Tạo các mục trong menu
    const menu = layThe("main-nav");
    menu.replaceChildren();

    for (const [maMuc, tenMuc] of cacMuc) {
        const lienKet = document.createElement("a");
        const nhan = document.createElement("span");

        nhan.textContent = tenMuc;

        lienKet.href = duongDanTrang(maMuc);
        lienKet.append(bieuTuong(maMuc));
        lienKet.append(nhan);

        const dangChon = maMuc === mucChon;

        lienKet.classList.toggle("on", dangChon);

        if (dangChon) {
            lienKet.setAttribute("aria-current", "page");
        }

        lienKet.addEventListener("click", (suKien) => {
            // Giữ thao tác mở liên kết bằng phím bổ trợ
            if (
                suKien.button !== 0 ||
                suKien.ctrlKey ||
                suKien.metaKey ||
                suKien.shiftKey ||
                suKien.altKey
            ) {
                return;
            }

            suKien.preventDefault();

            dongMenu();
            chuyenTrang(maMuc);
        });

        menu.append(lienKet);
    }

    // Hiển thị phần nội dung của trang hiện tại
    const cacKhung = document.querySelectorAll("[data-view]");

    for (const khung of cacKhung) {
        khung.hidden = khung.dataset.view !== trangThai.trang;
    }

    // Hiển thị thông báo
    const oThongBao = layThe("notice");
    const thongBao = trangThai.thongBao;

    oThongBao.hidden = !thongBao;

    if (thongBao) {
        oThongBao.className = "msg " + thongBao[0];
        oThongBao.textContent = thongBao[1];
    } else {
        oThongBao.className = "";
        oThongBao.textContent = "";
    }

    // Gọi hàm hiển thị tương ứng với từng trang
    const hamTheoTrang = {
        home: "veTongQuan",
        patients: "veBenhNhan",
        appointments: "veLich",
        myappts: "veLichCuaToi",
        rec: "veBenhAn",
        new: "veLapBenhAn",
        det: "veChiTietBenhAn",
        rxn: "veKeDon",
        rxl: "veDonThuoc",
        rxv: "veChiTietDon",
        drugs: "veThuoc",
        doctors: "veBacSi",
        specialties: "veChuyenKhoa",
        accounts: "veTaiKhoan"
    };

    const tenHam = hamTheoTrang[trangThai.trang];
    const hamVe = window[tenHam];

    if (hamVe) {
        hamVe();
    }

    ganNhan();
}

// Gắn sự kiện đăng xuất
ganSuKien("logout-btn", "click", dangXuat);

// Gắn sự kiện cho các nút chuyển trang
const cacNutChuyen = document.querySelectorAll("[data-go]");

for (const nut of cacNutChuyen) {
    nut.addEventListener("click", () => {
        chuyenTrang(nut.dataset.go);
    });
}

// Khởi động ứng dụng
async function khoiDong() {
    taoGiaoDien();

    await napPhien();

    taoDieuHuong();

    let trangCanMo = "auth";

    if (trangThai.nguoiDung) {
        trangCanMo = trangThai.trang;
    }

    const nhomCanMo = nhomTrang(trangCanMo);
    const nhomHienTai = document.body.dataset.page;

    if (nhomCanMo !== nhomHienTai) {
        return;
    }

    napNguCanh();
}

window.clinicReady = khoiDong();
