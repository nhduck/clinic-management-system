// Hiển thị danh sách đơn đã lưu
function veDonThuoc() {
    veBang("prescriptions-body", trangThai.donThuoc, (donThuoc) => [
        donThuoc.id,
        donThuoc.rid,
        timBenhNhan(timBenhAn(donThuoc.rid)?.pid)?.n || "—",
        hienNgay(donThuoc.date),
        donThuoc.lines.length,
        taoNut("Xem", (ma) => chuyenTrang("rxv", ma), donThuoc.id),
    ]);
}

function lieuDaChon() {
    var luaChon = layGiaTri("d2select");
    if (luaChon === "custom") {
        return layGiaTri("d2manual");
    } else {
        return luaChon;
    }
}

function batLieuKhac() {
    var oNhap = layThe("dose-custom");
    if (!oNhap) {
        return;
    }
    oNhap.hidden = layGiaTri("d2select") !== "custom";
    if (!oNhap.hidden) {
        layThe("d2manual").focus();
    }
}

// Thêm một dòng thuốc vào đơn đang lập
function themThuoc() {
    const thuoc = {
        d: layGiaTri("d1"),
        dose: lieuDaChon(),
        qty: Number(layGiaTri("d3")),
        use: layGiaTri("d4")
    };
    trangThai.maBenhAn = layGiaTri("rr");
    if (!trangThai.maBenhAn) {
        baoTin("e", "Hãy chọn bệnh án trước khi thêm thuốc.");
        veTrang();
        return;
    }
    if (!thuoc.d || !thuoc.dose || !Number.isInteger(thuoc.qty) || thuoc.qty < 1 || thuoc.qty > 10000) {
        baoTin("e", "Nhập tên thuốc, liều dùng và số lượng nguyên từ 1 đến 10000");
        veTrang();
        return;
    }
    trangThai.thuocKe.push(thuoc);
    xoaThongBao();
    veTrang();
}

function boThuoc(viTri) {
    trangThai.maBenhAn = layGiaTri("rr");
    trangThai.thuocKe.splice(viTri, 1);
    veTrang();
}

// Gửi toàn bộ đơn thuốc về máy chủ
async function luuDonThuoc() {
    trangThai.maBenhAn = layGiaTri("rr");
    if (!trangThai.maBenhAn) {
        baoTin("e", "Hãy chọn bệnh án.");
        veTrang();
        return;
    }
    if (!trangThai.thuocKe.length) {
        baoTin("e", "Đơn thuốc cần ít nhất một loại thuốc.");
        veTrang();
        return;
    }
    try {
        var daLuu = await goiApi("/api/prescriptions", {
            method: "POST",
            body: JSON.stringify({ rid: trangThai.maBenhAn, lines: trangThai.thuocKe }),
        });
        await taiDuLieu();
        chuyenTrang("rxv", daLuu.id);
        baoTin("k", "Đã lưu đơn thuốc " + daLuu.id + " thành công.");
        veTrang();
    } catch (loi) {
        baoTin("e", loi.message);
        veTrang();
    }
}

// Hiển thị các bệnh án và thuốc có thể chọn
function veKeDon() {
    ganLuaChon(
        "rr",
        trangThai.benhAn
            .filter((benhAn) => !timDonThuoc(benhAn.id))
            .map((benhAn) => [benhAn.id, `${benhAn.id} – ${timBenhNhan(benhAn.pid)?.n || "—"} – ${benhAn.dx}`]),
        trangThai.maBenhAn,
        "Chọn bệnh án",
    );
    const benhAnPhu = trangThai.maBenhAn && timBenhAn(trangThai.maBenhAn);
    ganChu("rx-diagnosis", benhAnPhu ? "Chẩn đoán: " + benhAnPhu.dx + " · " + hienNgay(benhAnPhu.date) : "");
    ganLuaChon(
        "d1",
        trangThai.tenThuoc.map((tenThuoc) => [tenThuoc, tenThuoc]),
        "",
        "Chọn thuốc",
    );
    ganChu("rx-count", "Các thuốc trong đơn (" + trangThai.thuocKe.length + ")");
    veThuocKe("rx-lines", trangThai.thuocKe, true);
    layThe("dose-custom").hidden = true;
}

ganSuKien("rr", "change", (suKien) => {
    trangThai.maBenhAn = suKien.target.value;
    veKeDon();
});
ganSuKien("d2select", "change", batLieuKhac);
ganSuKien("rx-add", "click", themThuoc);
ganSuKien("rx-save", "click", luuDonThuoc);

// Hiển thị các thuốc của đơn được chọn
function veChiTietDon() {
    const donThuoc = trangThai.donThuoc.find((donKhac) => donKhac.id === trangThai.maDangXem);
    if (!donThuoc) {
        chuyenTrang("rxl");
        return;
    }
    const benhAn = timBenhAn(donThuoc.rid);
    ganChu("rx-detail-heading", "Đơn thuốc " + donThuoc.id);
    ganChu("rx-detail-patient", timBenhNhan(benhAn?.pid)?.n || "—");
    ganChu("rx-detail-record", (benhAn?.id || "—") + " – " + (benhAn?.dx || "—"));
    ganChu("rx-detail-date", hienNgay(donThuoc.date));
    veThuocKe("rx-detail-lines", donThuoc.lines);
}
