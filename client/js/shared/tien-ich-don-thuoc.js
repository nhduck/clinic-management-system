// Hiển thị từng dòng thuốc trong đơn
function veThuocKe(ma, cacThuoc, choSua = false) {
    veBang(ma, cacThuoc, function (thuoc, viTri) {
        const cacO = [
            viTri + 1,
            thuoc.d,
            thuoc.dose,
            thuoc.qty,
            thuoc.use
        ];

        if (choSua) {
            const nutXoa = taoNut("Xóa", boThuoc, viTri, true);
            cacO.push(nutXoa);
        }

        return cacO;
    });
}