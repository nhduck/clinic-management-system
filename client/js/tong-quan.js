// Hiển thị số liệu và thao tác theo vai trò
function veTongQuan() {
    const vaiTro = trangThai.nguoiDung.r;
    let thongKe;
    let lienKet;
    let tieuDeTrang;
    if (vaiTro === "Lễ tân") {
        tieuDeTrang = "Tổng quan lễ tân";
        lienKet = [
            ["Quản lý bệnh nhân", "patients"],
            ["Đặt lịch khám", "appointments"],
        ];
        thongKe = [
            ["Bệnh nhân", tatCaBenhNhan().length],
            ["Lịch khám", trangThai.lichKham.length],
            ["Lịch đang đặt", trangThai.lichKham.filter((muc) => muc.status === "Chờ khám").length],
        ];
    } else if (vaiTro === "Quản trị") {
        tieuDeTrang = "Tổng quan quản trị";
        lienKet = [
            ["Quản lý bác sĩ", "doctors"],
            ["Quản lý tài khoản", "accounts"],
        ];
        thongKe = [
            ["Bác sĩ demo", trangThai.bacSiDemo.length],
            ["Chuyên khoa demo", trangThai.chuyenKhoa.length],
            ["Tài khoản", trangThai.taiKhoan.length],
        ];
    } else {
        tieuDeTrang = "Tổng quan phòng khám";
        lienKet = [
            ["Lập bệnh án mới", "new"],
            ["Kê đơn thuốc", "rxn"],
            ["Tra cứu lịch sử khám", "rec"],
        ];
        thongKe = [
            ["Bệnh án", trangThai.benhAn.length],
            ["Đơn thuốc", trangThai.donThuoc.length],
            ["Bệnh nhân", trangThai.benhNhan.length],
            ["Danh mục thuốc", trangThai.tenThuoc.length],
        ];
    }
    ganChu("home-title", tieuDeTrang);
    const dich = layThe("home-stats");
    dich.replaceChildren();
    thongKe.forEach(([ten, soLuong], viTri) => {
        const theMuc = document.createElement("div");
        theMuc.className = "card";
        const oSoLuong = document.createElement("div");
        oSoLuong.className = "n";
        oSoLuong.textContent = soLuong;
        const dau = document.createElement("div");
        dau.className = "stat-top";
        const nhan = document.createElement("span");
        nhan.textContent = ten;
        const khoi = document.createElement("span");
        khoi.className = "icon-well";
        khoi.append(bieuTuong(["rec", "rxl", "patients", "drugs"][viTri]));
        dau.append(nhan, khoi);
        const chiTiet = document.createElement("span");
        chiTiet.className = "stat-caption";
        chiTiet.textContent = "Tổng số hiện có";
        theMuc.append(dau, oSoLuong, chiTiet);
        dich.append(theMuc);
    });
    const cacNut = layThe("home-actions");
    cacNut.replaceChildren();
    for (const [nhan, trang] of lienKet) {
        const nut = nutChuyenTrang(nhan, trang);
        nut.className = "quick-action";
        nut.prepend(bieuTuong(trang));
        const muiTen = document.createElement("span");
        muiTen.className = "action-arrow";
        muiTen.textContent = "↗";
        nut.append(muiTen);
        cacNut.append(nut);
    }
    ganChu(
        "today-label",
        new Intl.DateTimeFormat("vi-VN", {
            weekday: "long",
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        }).format(new Date()),
    );
    ganChu("welcome-name", "Chào " + trangThai.nguoiDung.n + "!");
    layThe("welcome-action").textContent = lienKet[0][0];
    layThe("welcome-action").onclick = () => chuyenTrang(lienKet[0][1]);
    const hoatDong = layThe("home-activity");
    hoatDong.replaceChildren();
    let tieuDeHoatDong;
    if (vaiTro === "Bác sĩ") {
        tieuDeHoatDong = "Bệnh án gần đây";
    } else if (vaiTro === "Lễ tân") {
        tieuDeHoatDong = "Lịch khám gần đây";
    } else {
        tieuDeHoatDong = "Đội ngũ bác sĩ demo";
    }
    ganChu("activity-title", tieuDeHoatDong);
    let cacMuc;
    if (vaiTro === "Bác sĩ") {
        cacMuc = [...trangThai.benhAn]
        .sort(
            (mucTruoc, mucSau) =>
                String(mucSau.date).localeCompare(String(mucTruoc.date)) ||
                String(mucSau.id).localeCompare(String(mucTruoc.id), undefined, { numeric: true }),
        )
        .slice(0, 3)
        .map((muc) => [
            timBenhNhan(muc.pid)?.n || muc.pid,
            muc.dx || "Chưa có chẩn đoán",
            muc.id,
            () => chuyenTrang("det", muc.id),
        ]);
    } else if (vaiTro === "Lễ tân") {
        cacMuc = [...trangThai.lichKham]
        .sort((mucTruoc, mucSau) => String(mucSau.date).localeCompare(String(mucTruoc.date)))
        .slice(0, 3)
        .map((muc) => [
            tatCaBenhNhan().find((benhNhan) => benhNhan.id === muc.pid)?.n || muc.pid || muc.id,
            muc.status || "Lịch khám",
            muc.date ? hienNgay(muc.date) : "",
            () => chuyenTrang("appointments"),
        ]);
    } else {
        cacMuc = trangThai.bacSiDemo
        .slice(0, 3)
        .map((muc) => [muc.n, "Bác sĩ demo", muc.bs || "", () => chuyenTrang("doctors")]);
    }
    if (!cacMuc.length) {
        const rong = document.createElement("p");
        rong.className = "empty-state";
        rong.textContent = "Chưa có dữ liệu. Bạn có thể bắt đầu từ các thao tác nhanh.";
        hoatDong.append(rong);
    }
    for (const [tieuDe, moTa, maHienThi, thaoTac] of cacMuc) {
        const hang = document.createElement("button");
        hang.className = "activity-row";
        hang.type = "button";
        const hinh = document.createElement("span");
        hinh.className = "icon-well";
        hinh.append(bieuTuong(vaiTro === "Lễ tân" ? "appointments" : "rec"));
        const chu = document.createElement("span");
        chu.className = "activity-text";
        const theTieuDe = document.createElement("b");
        theTieuDe.textContent = tieuDe;
        const theMoTa = document.createElement("small");
        theMoTa.textContent = moTa;
        chu.append(theTieuDe, theMoTa);
        const theMa = document.createElement("span");
        theMa.className = "activity-code";
        theMa.textContent = maHienThi;
        hang.append(hinh, chu, theMa);
        hang.onclick = thaoTac;
        hoatDong.append(hang);
    }
}
