// Tìm bệnh án theo mã tên bệnh nhân hoặc chẩn đoán
function locBenhAn() {
    return trangThai.benhAn.filter((benhAn) => {
        const benhNhan = timBenhNhan(benhAn.pid);
        return (
            !trangThai.tuKhoa ||
            (benhAn.id + " " + (benhNhan?.n || "") + " " + benhAn.dx).toLowerCase().includes(trangThai.tuKhoa.toLowerCase())
        );
    });
}

function veBenhAn() {
    layThe("rec-search").value = trangThai.tuKhoa;
    veBang(
        "tb",
        locBenhAn(),
        (benhAn) => [
            benhAn.id,
            timBenhNhan(benhAn.pid)?.n || "—",
            hienNgay(benhAn.date),
            benhAn.dx,
            timDonThuoc(benhAn.id) ? "Đã kê đơn" : "Chưa có",
            taoNut("Xem", (ma) => chuyenTrang("det", ma), benhAn.id),
        ],
        "Không tìm thấy bệnh án.",
    );
}

ganSuKien("rec-search", "input", (suKien) => {
    trangThai.tuKhoa = suKien.target.value;
    veBenhAn();
});

// Lưu bệnh án rồi mở trang chi tiết
async function luuBenhAn() {
    var noiDung = { pid: layGiaTri("f1"), date: layGiaTri("f2"), sym: layGiaTri("f3"), dx: layGiaTri("f4"), note: layGiaTri("f5") };
    if (!noiDung.pid || !noiDung.date || !noiDung.sym || !noiDung.dx) {
        baoTin("e", "Cần chọn bệnh nhân, ngày khám, triệu chứng và chẩn đoán.");
        veTrang();
        return;
    }
    try {
        var daLuu = await goiApi("/api/records", { method: "POST", body: JSON.stringify(noiDung) });
        await taiDuLieu();
        chuyenTrang("det", daLuu.id);
        baoTin("k", "Đã lưu bệnh án " + daLuu.id + " thành công.");
        veTrang();
    } catch (loi) {
        baoTin("e", loi.message);
        veTrang();
    }
}

function veLapBenhAn() {
    ganLuaChon(
        "f1",
        trangThai.benhNhan.map((benhNhan) => [benhNhan.id, benhNhan.id + " – " + benhNhan.n]),
        "",
        "Chọn bệnh nhân",
    );
    layThe("f2").value = homNay();
}

ganSuKien("rec-save", "click", luuBenhAn);

// Hiển thị lần khám đơn thuốc và lịch sử bệnh nhân
function veChiTietBenhAn() {
    const benhAn = timBenhAn(trangThai.maDangXem);
    if (!benhAn) {
        chuyenTrang("rec");
        return;
    }
    const benhNhan = timBenhNhan(benhAn.pid);
    const donDaKe = timDonThuoc(benhAn.id);
    const lichSu = trangThai.benhAn.filter((benhAnKhac) => benhAnKhac.pid === benhAn.pid && benhAnKhac.id !== benhAn.id);
    ganChu("detail-heading", "Chi tiết bệnh án " + benhAn.id);
    ganChu("detail-patient", `${benhNhan?.n || "—"} (${benhNhan?.id || "—"}, ${benhNhan?.g || "—"}, ${hienNgay(benhNhan?.dob)})`);
    ganChu("detail-date", hienNgay(benhAn.date));
    ganChu("detail-sym", benhAn.sym);
    ganChu("detail-dx", benhAn.dx);
    ganChu("detail-note", benhAn.note || "—");
    const khung = layThe("detail-prescription");
    khung.replaceChildren();
    if (donDaKe) {
        const ghiChu = document.createElement("p");
        ghiChu.textContent = "Mã " + donDaKe.id + " · " + hienNgay(donDaKe.date);
        khung.append(ghiChu);
        const danhSach = document.createElement("ul");
        for (const dong of donDaKe.lines) {
            const dongThuoc = document.createElement("li");
            dongThuoc.textContent = `${dong.d} – ${dong.dose} – SL ${dong.qty} – ${dong.use}`;
            danhSach.append(dongThuoc);
        }
        khung.append(danhSach);
    } else {
        khung.textContent = "Chưa kê đơn cho bệnh án này.";
    }
    layThe("detail-prescribe").hidden = !!donDaKe;
    veBang(
        "detail-history",
        lichSu,
        (benhAnKhac) => [benhAnKhac.id, hienNgay(benhAnKhac.date), benhAnKhac.dx, taoNut("Xem", (ma) => chuyenTrang("det", ma), benhAnKhac.id)],
        "Chưa có lần khám trước.",
    );
}

ganSuKien("detail-prescribe", "click", () => {
    const ma = trangThai.maDangXem;
    chuyenTrang("rxn", null, { recordId: ma });
});
