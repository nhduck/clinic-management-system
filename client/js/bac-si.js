// Lưu thông tin bác sĩ vào danh sách demo
function luuBacSiDemo() {
    var ten = layGiaTri("doc-name");
    var chuyenKhoa = layGiaTri("doc-specialty");
    var dienThoai = layGiaTri("doc-phone");
    if (!ten || !chuyenKhoa) {
        baoTin("e", "Nhập tên bác sĩ và chuyên khoa.");
        veTrang();
        return;
    }
    if (trangThai.suaBacSi) {
        Object.assign(
            trangThai.bacSiDemo.find((bacSiKhac) => bacSiKhac.id === trangThai.suaBacSi),
            { n: ten, specialty: chuyenKhoa, phone: dienThoai },
        );
    }
    else {
        trangThai.bacSiDemo.push({ id: maDemoMoi("BS", trangThai.bacSiDemo), n: ten, specialty: chuyenKhoa, phone: dienThoai });
    }
    trangThai.suaBacSi = null;
    baoTin("k", "Đã lưu bác sĩ demo.");
    veTrang();
}

function xoaBacSiDemo(ma) {
    if (trangThai.lichKham.some((bacSiKhac) => bacSiKhac.doctor === ma && bacSiKhac.status === "Đã đặt")) {
        baoTin("e", "Bác sĩ còn lịch đang đặt.");
        veTrang();
        return;
    }
    if (!confirm("Xóa bác sĩ demo?")) {
        return;
    }
    trangThai.bacSiDemo = trangThai.bacSiDemo.filter((bacSiKhac) => bacSiKhac.id !== ma);
    baoTin("k", "Đã xóa bác sĩ demo.");
    veTrang();
}

// Hiển thị biểu mẫu và danh sách bác sĩ
function veBacSi() {
    const bacSi = trangThai.bacSiDemo.find((bacSiKhac) => bacSiKhac.id === trangThai.suaBacSi) || {};
    ganChu("doctor-heading", trangThai.suaBacSi ? "Sửa bác sĩ demo" : "Thêm bác sĩ demo");
    layThe("doc-name").value = bacSi.n || "";
    layThe("doc-phone").value = bacSi.phone || "";
    ganLuaChon(
        "doc-specialty",
        trangThai.chuyenKhoa.map((bacSiKhac) => [bacSiKhac, bacSiKhac]),
        bacSi.specialty || "",
        "Chọn chuyên khoa",
    );
    ganChu("doc-save", trangThai.suaBacSi ? "Lưu sửa" : "Thêm bác sĩ");
    layThe("doc-cancel").hidden = !trangThai.suaBacSi;
    veBang("doctors-body", trangThai.bacSiDemo, (bacSiKhac) => [
        bacSiKhac.id,
        bacSiKhac.n,
        bacSiKhac.specialty,
        bacSiKhac.phone,
        nhomNut(
            taoNut(
                "Sửa",
                (ma) => {
                    trangThai.suaBacSi = ma;
                    veTrang();
                },
                bacSiKhac.id,
                true,
            ),
            taoNut("Xóa", xoaBacSiDemo, bacSiKhac.id, true),
        ),
    ]);
}

ganSuKien("doc-save", "click", luuBacSiDemo);
ganSuKien("doc-cancel", "click", () => {
    trangThai.suaBacSi = null;
    veTrang();
});
