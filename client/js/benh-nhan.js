// Lưu thông tin bệnh nhân trong phiên demo
function luuBenhNhanDemo() {
    var ten = layGiaTri("pat-name");
    var ngaySinh = layGiaTri("pat-dob");
    var gioiTinh = layGiaTri("pat-gender");
    var dienThoai = layGiaTri("pat-phone");
    if (!ten || !ngaySinh || !gioiTinh) {
        baoTin("e", "Nhập họ tên, ngày sinh và giới tính.");
        veTrang();
        return;
    }
    if (trangThai.suaBenhNhan) {
        var benhNhanKhac = trangThai.benhNhanDemo.find((benhNhanKhac) => benhNhanKhac.id === trangThai.suaBenhNhan);
        Object.assign(benhNhanKhac, { n: ten, dob: ngaySinh, g: gioiTinh, phone: dienThoai });
    } else {
        trangThai.benhNhanDemo.push({ id: maDemoMoi("DEMO", tatCaBenhNhan()), n: ten, dob: ngaySinh, g: gioiTinh, phone: dienThoai });
    }
    trangThai.suaBenhNhan = null;
    baoTin("k", "Đã lưu bệnh nhân demo (chưa ghi PostgreSQL).");
    veTrang();
}

function xoaBenhNhanDemo(ma) {
    if (trangThai.lichKham.some((benhNhanKhac) => benhNhanKhac.pid === ma)) {
        baoTin("e", "Bệnh nhân đang có lịch demo; hãy hủy lịch trước.");
        veTrang();
        return;
    }
    if (!confirm("Xóa bệnh nhân demo?")) {
        return;
    }
    trangThai.benhNhanDemo = trangThai.benhNhanDemo.filter((benhNhanKhac) => benhNhanKhac.id !== ma);
    trangThai.suaBenhNhan = null;
    baoTin("k", "Đã xóa bệnh nhân demo.");
    veTrang();
}

function veBenhNhan() {
    const benhNhan = trangThai.benhNhanDemo.find((benhNhanKhac) => benhNhanKhac.id === trangThai.suaBenhNhan) || {};
    ganChu("pat-heading", trangThai.suaBenhNhan ? "Sửa thông tin bệnh nhân demo" : "Thêm bệnh nhân demo");
    layThe("pat-name").value = benhNhan.n || "";
    layThe("pat-dob").value = benhNhan.dob || "";
    layThe("pat-gender").value = benhNhan.g || "";
    layThe("pat-phone").value = benhNhan.phone || "";
    ganChu("pat-save", trangThai.suaBenhNhan ? "Lưu sửa" : "Thêm bệnh nhân");
    layThe("pat-cancel").hidden = !trangThai.suaBenhNhan;
    veBangBenhNhan();
}

// Lọc danh sách bệnh nhân theo từ khóa
function veBangBenhNhan() {
    const tuKhoa = trangThai.tuKhoa.toLowerCase();
    const cacHang = tatCaBenhNhan().filter((benhNhanKhac) => (benhNhanKhac.id + " " + benhNhanKhac.n).toLowerCase().includes(tuKhoa));
    ganChu("pat-count", `Danh sách bệnh nhân (${cacHang.length})`);
    veBang("patients-body", cacHang, (benhNhanKhac) => [
        benhNhanKhac.id,
        benhNhanKhac.n,
        hienNgay(benhNhanKhac.dob),
        benhNhanKhac.g || "—",
        trangThai.benhNhanDemo.some((benhNhanDemo) => benhNhanDemo.id === benhNhanKhac.id)
            ? nhomNut(
                  taoNut(
                      "Sửa",
                      (ma) => {
                          trangThai.suaBenhNhan = ma;
                          veTrang();
                      },
                      benhNhanKhac.id,
                      true,
                  ),
                  taoNut("Xóa", xoaBenhNhanDemo, benhNhanKhac.id, true),
              )
            : "Đọc từ PostgreSQL",
    ]);
}

ganSuKien("pat-save", "click", luuBenhNhanDemo);
ganSuKien("pat-cancel", "click", () => {
    trangThai.suaBenhNhan = null;
    veTrang();
});
ganSuKien("pat-search", "input", (suKien) => {
    trangThai.tuKhoa = suKien.target.value;
    veBangBenhNhan();
});
