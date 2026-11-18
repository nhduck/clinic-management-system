// Kiểm tra tên trước khi thêm chuyên khoa
function themChuyenKhoa() {
    var tenPhu = layGiaTri("specialty-name");
    if (!tenPhu || trangThai.chuyenKhoa.some((muc) => muc.toLowerCase() === tenPhu.toLowerCase())) {
        baoTin("e", "Tên chuyên khoa trống hoặc bị trùng.");
        veTrang();
        return;
    }
    trangThai.chuyenKhoa.push(tenPhu);
    baoTin("k", "Đã thêm chuyên khoa demo.");
    veTrang();
}

function xoaChuyenKhoa(viTri) {
    var ten = trangThai.chuyenKhoa[viTri];
    if (trangThai.bacSiDemo.some((muc) => muc.specialty === ten)) {
        baoTin("e", "Chuyên khoa đang có bác sĩ.");
        veTrang();
        return;
    }
    if (!confirm("Xóa chuyên khoa?")) {
        return;
    }
    trangThai.chuyenKhoa.splice(viTri, 1);
    baoTin("k", "Đã xóa chuyên khoa demo.");
    veTrang();
}

// Hiển thị các chuyên khoa đang có
function veChuyenKhoa() {
    veBang("specialties-body", trangThai.chuyenKhoa, (muc, viTri) => [
        muc,
        taoNut("Xóa", xoaChuyenKhoa, viTri, true),
    ]);
}

ganSuKien("specialty-save", "click", themChuyenKhoa);
