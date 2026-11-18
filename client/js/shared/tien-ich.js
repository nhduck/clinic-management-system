// Lấy ngày hiện tại cho biểu mẫu
function homNay() {
    var ngay = new Date();
    return (
        ngay.getFullYear() +
        "-" +
        String(ngay.getMonth() + 1).padStart(2, "0") +
        "-" +
        String(ngay.getDate()).padStart(2, "0")
    );
}

function layThe(maThe) {
    return document.getElementById(maThe);
}

function layGiaTri(maThe) {
    const the = layThe(maThe);
    if (!the) {
        return "";
    }
    return the.value.trim();
}


function hienNgay(chuoi) {
    if (!chuoi) {
        return "—";
    }
    var phanNgay = chuoi.split("-");
    if (phanNgay.length === 3) {
        return phanNgay[2] + "/" + phanNgay[1] + "/" + phanNgay[0];
    } else {
        return chuoi;
    }
}

// Tra bệnh nhân theo mã
function timBenhNhan(ma) {
    return trangThai.benhNhan.find(muc => muc.id == ma);
}

function timBenhAn(ma) {
    return trangThai.benhAn.find(muc => muc.id == ma);
}

function timDonThuoc(maBenhAn) {
    return trangThai.donThuoc.find(muc => muc.rid == maBenhAn);
}

function maDemoMoi(tienTo, danhSach) {
    var soThuTu = 1;
    while (danhSach.some((muc) => muc.id === tienTo + String(soThuTu).padStart(3, "0"))) soThuTu++;
    return tienTo + String(soThuTu).padStart(3, "0");
}
