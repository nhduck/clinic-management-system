// Tải danh sách tài khoản để quản trị viên xét duyệt
async function veTaiKhoan() {
    try {
        trangThai.taiKhoan = await goiApi("/api/accounts");

        veBang("accounts-body", trangThai.taiKhoan, taiKhoan => [
            taiKhoan.u,
            taiKhoan.n,
            taiKhoan.r,
            taiKhoan.status,
            taiKhoan.status === "Chờ duyệt"
                ? nhomNut(
                    taoNut(
                        "Duyệt",
                        () => duyetTaiKhoan(taiKhoan.id, "approve")
                    ),
                    taoNut(
                        "Từ chối",
                        () => duyetTaiKhoan(taiKhoan.id, "reject"),
                        null,
                        true
                    )
                )
                : "—"
        ]);
    } catch (loi) {
        veBang(
            "accounts-body",
            [],
            () => [],
            loi.message
        );
    }
}

// Gửi kết quả xét duyệt về máy chủ
async function duyetTaiKhoan(ma, thaoTac) {
    try {
        await goiApi(
            "/api/accounts/" + ma + "/" + thaoTac,
            {
                method: "POST"
            }
        );

        baoTin(
            "k",
            thaoTac === "approve"
                ? "Đã duyệt tài khoản."
                : "Đã từ chối tài khoản."
        );
    } catch (loi) {
        baoTin("e", loi.message);
    }

    veTrang();
}
