// Tiện ích DOM dùng chung cho các màn hình
function ganChu(ma, giaTriPhu) {
    layThe(ma).textContent = giaTriPhu == null ? "" : String(giaTriPhu);
}
function ganLuaChon(ma, danhSach, giaTriPhu, goiY) {
    const oChon = layThe(ma);
    oChon.replaceChildren(new Option(goiY, ""));
    for (const [giaTri, nhan] of danhSach) {
        oChon.add(new Option(nhan, giaTri));
    }
    oChon.value = giaTriPhu == null ? "" : String(giaTriPhu);
}
function taoNut(nhan, thaoTac, thamSo, vienNut = false) {
    const nut = document.createElement("button");
    nut.type = "button";
    nut.className = vienNut ? "btn o s" : "btn s";
    nut.textContent = nhan;
    nut.addEventListener("click", () => thaoTac(thamSo));
    return nut;
}
// Tạo các hàng và ô cho bảng dữ liệu
function veBang(ma, cacHang, taoO, baoRong = "Chưa có dữ liệu.") {
    const noiDung = layThe(ma);
    noiDung.replaceChildren();
    if (!cacHang.length) {
        const hang = noiDung.insertRow();
        const o = hang.insertCell();
        o.colSpan = noiDung.closest("table").querySelectorAll("thead th").length;
        o.textContent = baoRong;
        return;
    }
    cacHang.forEach((mucPhu, viTri) => {
        const hang = noiDung.insertRow();
        for (const oPhu of taoO(mucPhu, viTri)) {
            const o = hang.insertCell();
            if (oPhu instanceof Node) {
                o.append(oPhu);
            }
            else {
                o.textContent = oPhu == null ? "" : String(oPhu);
            }
        }
    });
}
function nhomNut(...cacNut) {
    const khung = document.createElement("div");
    khung.className = "bar action-bar";
    for (const muc of cacNut) {
        khung.append(muc);
    }
    return khung;
}
function nutChuyenTrang(nhan, trang) {
    const nutPhu = taoNut(nhan, () => chuyenTrang(trang));
    nutPhu.className = "btn";
    return nutPhu;
}

function ganSuKien(ma, suKien, xuLy) {
    layThe(ma)?.addEventListener(suKien, xuLy);
}
