// Moi thong bao tu dong an sau 7 giay, thong bao moi se dat lai dong ho
var henThongBao = null;

// Hiển thị thông báo cho người dùng
function baoTin(loai, tin) {
    if (henThongBao !== null) {
        clearTimeout(henThongBao);
    }
    trangThai.thongBao = [loai, tin];
    henThongBao = setTimeout(function () {
        trangThai.thongBao = null;
        henThongBao = null;
        var the = document.getElementById("notice");
        if (the) {
            the.hidden = true;
            the.textContent = "";
        }
        var theDangNhap = document.getElementById("auth-notice");
        if (theDangNhap) {
            theDangNhap.hidden = true;
            theDangNhap.textContent = "";
        }
    }, 7000);
}

function xoaThongBao() {
    if (henThongBao !== null) {
        clearTimeout(henThongBao);
    }
    henThongBao = null;
    trangThai.thongBao = null;
    for (const ma of ["notice", "auth-notice"]) {
        const the = document.getElementById(ma);
        if (the) {
            the.hidden = true;
            the.textContent = "";
        }
    }
}
