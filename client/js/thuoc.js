// Thêm hoặc cập nhật thuốc trong danh mục
async function luuThuoc() {
    var ma = layGiaTri("drug-id");
    var ten = layGiaTri("drug-name");
    if (!ten) {
        baoTin("e", "Vui lòng nhập tên thuốc.");
        veTrang();
        return;
    }
    try {
        await goiApi(ma ? "/api/drugs/" + ma : "/api/drugs", {
            method: ma ? "PUT" : "POST",
            body: JSON.stringify({ name: ten }),
        });
        await taiDuLieu();
        chuyenTrang("drugs");
        baoTin("k", ma ? "Đã cập nhật thuốc." : "Đã thêm thuốc.");
        veTrang();
    } catch (loi) {
        baoTin("e", loi.message);
        veTrang();
    }
}

function suaThuoc(ma) {
    var mucPhu = trangThai.dsThuoc.find((muc) => muc.id === ma);
    if (!mucPhu) {
        return;
    }
    layThe("drug-id").value = mucPhu.id;
    layThe("drug-name").value = mucPhu.name;
    layThe("drug-submit").textContent = "Lưu thay đổi";
    layThe("drug-cancel").hidden = false;
    layThe("drug-name").focus();
}

function thoiSuaThuoc() {
    layThe("drug-id").value = "";
    layThe("drug-name").value = "";
    layThe("drug-submit").textContent = "Thêm thuốc";
    layThe("drug-cancel").hidden = true;
}

// Xác nhận trước khi xóa thuốc
async function xoaThuoc(ma) {
    var mucPhu = trangThai.dsThuoc.find((muc) => muc.id === ma);
    if (
        !mucPhu ||
        !confirm(
            'Xóa thuốc "' + mucPhu.name + '" khỏi danh mục? Đơn thuốc đã lưu vẫn giữ nguyên tên cũ.',
        )
    ) {
        return;
    }
    try {
        await goiApi("/api/drugs/" + ma, { method: "DELETE" });
        await taiDuLieu();
        chuyenTrang("drugs");
        baoTin("k", "Đã xóa thuốc khỏi danh mục.");
        veTrang();
    } catch (loi) {
        baoTin("e", loi.message);
        veTrang();
    }
}

function veThuoc() {
    ganChu("drug-count", "Danh sách thuốc (" + trangThai.dsThuoc.length + ")");
    veBang(
        "drugs-body",
        trangThai.dsThuoc,
        (muc) => [
            "T" + String(muc.id).padStart(3, "0"),
            muc.name,
            nhomNut(
                taoNut("Sửa", suaThuoc, muc.id, true),
                taoNut("Xóa", xoaThuoc, muc.id, true),
            ),
        ],
        "Chưa có thuốc nào.",
    );
}

ganSuKien("drug-submit", "click", luuThuoc);
ganSuKien("drug-cancel", "click", thoiSuaThuoc);
