// Gửi yêu cầu kèm phiên đăng nhập và đọc kết quả JSON
async function goiApi(diaChi, tuyChon = {}) {
    const phanHoi = await fetch(diaChi, {
        ...tuyChon,
        credentials: "same-origin",
        headers: {
            "Content-Type": "application/json",
            "X-Requested-With": "XMLHttpRequest",
            ...tuyChon.headers
        }
    });

    const duLieu = await phanHoi.json();

    if (!phanHoi.ok) {
        const loi = new Error(duLieu.error || "Lỗi máy chủ");
        loi.status = phanHoi.status;
        throw loi;
    }

    return duLieu;
}

// Nạp dữ liệu từ máy chủ vào giao diện
async function taiDuLieu() {
    const duLieu = await goiApi("/api/data");

    trangThai.benhNhan = duLieu.pts;
    trangThai.tenThuoc = duLieu.drugs;
    trangThai.dsThuoc = duLieu.drugItems || [];
    trangThai.benhAn = duLieu.recs;
    trangThai.donThuoc = duLieu.rx;
    trangThai.caLam = duLieu.shifts || [];
    trangThai.lichKham = duLieu.appts || [];

    if (trangThai.nguoiDung?.r === "Quản trị") {
        trangThai.taiKhoan = await goiApi("/api/accounts");
    }
}
