function nhanCa(ca) {
    return hienNgay(ca.date) + " · " + ca.from + "–" + ca.to + " · " + ca.dn;
}

// Sắp lịch chờ khám trước các lịch khác
function sapLich() {
    const dsLich = trangThai.lichKham.slice();
    dsLich.sort((lichA, lichB) => {
        const choA = lichA.status === "Chờ khám";
        const choB = lichB.status === "Chờ khám";
        if (choA && !choB) {
            return -1;
        }
        if (choB && !choA) {
            return 1;
        }

        const gioA = lichA.date + " " + lichA.time;
        const gioB = lichB.date + " " + lichB.time;
        if (choA) {
            return gioA.localeCompare(gioB);
        }
        return gioB.localeCompare(gioA);
    });
    return dsLich;
}

function docFormLich() {
    var oBenhNhan = layThe("app-patient");
    var ca = layThe("app-shift");
    var oGio = layThe("app-time");
    var oLyDo = layThe("app-reason");
    if (oBenhNhan && !trangThai.suaLich) {
        trangThai.formLich.pid = oBenhNhan.value;
    }
    if (ca) {
        trangThai.formLich.shift = ca.value;
    }
    if (oGio) {
        trangThai.formLich.time = oGio.value;
    }
    if (oLyDo) {
        trangThai.formLich.reason = oLyDo.value;
    }
}

// Tải giờ trống cho ca làm việc được chọn
async function taiGioTrong() {
    trangThai.gioTrong = [];
    if (!trangThai.formLich.shift) {
        return;
    }
    try {
        trangThai.gioTrong = await goiApi("/api/slots?shift=" + encodeURIComponent(trangThai.formLich.shift));
    } catch (loi) {
        baoTin("e", loi.message);
    }
    // Cho phép chọn lại giờ cũ khi sửa lịch trong cùng ca
    if (!trangThai.suaLich) {
        return;
    }

    const lichCu = trangThai.lichKham.find(function (lich) {
        return lich.id === trangThai.suaLich;
    });

    if (!lichCu) {
        return;
    }

    const caCu = String(lichCu.shift);
    const caDangChon = String(trangThai.formLich.shift);

    if (caCu !== caDangChon) {
        return;
    }

    if (!trangThai.gioTrong.includes(lichCu.time)) {
        trangThai.gioTrong.push(lichCu.time);
        trangThai.gioTrong.sort();
    }
}

async function chonCa() {
    docFormLich();
    trangThai.formLich.time = "";
    await taiGioTrong();
    veTrang();
}

function xoaFormLich() {
    trangThai.suaLich = null;
    trangThai.formLich = { pid: "", shift: "", time: "", reason: "" };
    trangThai.gioTrong = [];
}

// Gửi lịch mới hoặc cập nhật lịch đang sửa
async function luuLich() {
    docFormLich();
    var bieuMau = trangThai.formLich;
    if (!bieuMau.pid || !bieuMau.shift || !bieuMau.time) {
        baoTin("e", "Chọn bệnh nhân, ca làm việc và giờ khám.");
        veTrang();
        return;
    }
    var maSua = trangThai.suaLich;
    var noiDung = { pid: bieuMau.pid, shift: Number(bieuMau.shift), time: bieuMau.time, reason: bieuMau.reason };
    try {
        var daLuu = await goiApi(maSua ? "/api/appointments/" + maSua : "/api/appointments", {
            method: maSua ? "PUT" : "POST",
            body: JSON.stringify(noiDung),
        });
        xoaFormLich();
        await taiDuLieu();
        baoTin("k", (maSua ? "Đã cập nhật lịch " : "Đã đặt lịch ") + daLuu.id + " thành công.");
    } catch (loi) {
        baoTin("e", loi.message);
    }
    veTrang();
}

async function suaLich(ma) {
    var lich = trangThai.lichKham.find((lichKhac) => lichKhac.id === ma);
    if (!lich) {
        return;
    }
    trangThai.suaLich = ma;
    trangThai.formLich = { pid: lich.pid, shift: String(lich.shift), time: lich.time, reason: lich.reason || "" };
    await taiGioTrong();
    veTrang();
}

function thoiSuaLich() {
    xoaFormLich();
    veTrang();
}

async function huyLich(ma) {
    if (!confirm("Hủy lịch khám " + ma + "?")) {
        return;
    }
    try {
        await goiApi("/api/appointments/" + ma + "/cancel", { method: "POST", body: "{}" });
        if (trangThai.suaLich === ma) {
            xoaFormLich();
        }
        await taiDuLieu();
        baoTin("k", "Đã hủy lịch " + ma + ".");
    } catch (loi) {
        baoTin("e", loi.message);
    }
    veTrang();
}

// lọc lịch theo ngày/bác sĩ

function bacSiCoLich() {
    var bang = {};
    for (const lichKhac of trangThai.lichKham.concat(trangThai.caLam)) {
        bang[lichKhac.bs] = lichKhac.dn;
    }
    return Object.keys(bang)
        .sort()
        .map((khoaSapXep) => [khoaSapXep, bang[khoaSapXep]]);
}

function locLich() {
    var bieuMau = trangThai.locLich;
    return sapLich().filter(
        (lich) => (!bieuMau.date || lich.date === bieuMau.date) && (!bieuMau.bs || lich.bs === bieuMau.bs),
    );
}

function datLocLich() {
    docFormLich();
    trangThai.locLich = { date: layThe("flt-date").value, bs: layThe("flt-bs").value };
    veTrang();
}

function xoaLocLich() {
    docFormLich();
    trangThai.locLich = { date: "", bs: "" };
    veTrang();
}

// Hiển thị biểu mẫu và bảng lịch khám
function veLich() {
    const bieuMau = trangThai.formLich;
    const maSua = trangThai.suaLich;
    ganChu("appointment-heading", maSua ? "Cập nhật lịch khám " + maSua : "Đặt lịch khám");
    ganChu("appointment-save", maSua ? "Lưu thay đổi" : "Đặt lịch");
    layThe("appointment-cancel-edit").hidden = !maSua;
    ganLuaChon(
        "app-patient",
        trangThai.benhNhan.map((oBenhNhan) => [oBenhNhan.id, oBenhNhan.id + " – " + oBenhNhan.n]),
        bieuMau.pid,
        "Chọn bệnh nhân",
    );
    layThe("app-patient").disabled = !!maSua;
    ganLuaChon(
        "app-shift",
        trangThai.caLam.map((ca) => [ca.id, nhanCa(ca)]),
        bieuMau.shift,
        "Chọn ca làm việc",
    );
    let nhanGio = "Chọn giờ";
    if (!bieuMau.shift) {
        nhanGio = "Chọn ca làm việc trước";
    } else if (trangThai.gioTrong.length === 0) {
        nhanGio = "Hết chỗ trong ca này";
    }
    ganLuaChon(
        "app-time",
        trangThai.gioTrong.map((oGio) => [oGio, oGio]),
        bieuMau.time,
        nhanGio,
    );
    layThe("app-reason").value = bieuMau.reason || "";
    const danhSach = locLich();
    const boLoc = trangThai.locLich;
    ganLuaChon("flt-bs", bacSiCoLich(), boLoc.bs, "Tất cả bác sĩ");
    layThe("flt-date").value = boLoc.date;
    ganChu(
        "appointments-count",
        "Danh sách lịch (" +
        danhSach.length +
        (boLoc.date || boLoc.bs ? " / " + trangThai.lichKham.length : "") +
        ")",
    );
    veBang(
        "appointments-body",
        danhSach,
        (lich) => [
            lich.id,
            lich.pn,
            lich.dn,
            hienNgay(lich.date) + " · " + lich.time,
            lich.status,
            lich.reason || "",
            lich.status === "Chờ khám"
                ? nhomNut(
                    taoNut("Sửa", suaLich, lich.id, true),
                    taoNut("Hủy lịch", huyLich, lich.id, true),
                )
                : "",
        ],
        "Không có lịch khám phù hợp.",
    );
}

ganSuKien("flt-date", "change", datLocLich);
ganSuKien("flt-bs", "change", datLocLich);
ganSuKien("flt-clear", "click", xoaLocLich);
ganSuKien("app-shift", "change", chonCa);
ganSuKien("appointment-save", "click", luuLich);
ganSuKien("appointment-cancel-edit", "click", thoiSuaLich);

// Lọc lịch theo tài khoản bác sĩ
function lichCuaToi() {
    var bieuMau = trangThai.locLichToi;
    return trangThai.lichKham
        .filter(
            (lich) =>
                lich.bs === trangThai.nguoiDung.bs &&
                (!bieuMau.date || lich.date === bieuMau.date) &&
                (!bieuMau.status || lich.status === bieuMau.status),
        )
        .sort((lichKhac, lichSau) => (lichKhac.date + lichKhac.time < lichSau.date + lichSau.time ? -1 : 1));
}

function datLocCuaToi() {
    trangThai.locLichToi = { date: layThe("my-date").value, status: layThe("my-status").value };
    veTrang();
}

function locHomNay() {
    trangThai.locLichToi = { date: homNay(), status: trangThai.locLichToi.status };
    veTrang();
}

function xoaLocCuaToi() {
    trangThai.locLichToi = { date: "", status: "" };
    veTrang();
}

// Từ lịch "Chờ khám" mở sẵn form Lập bệnh án đúng bệnh nhân và ngày khám

function lapBenhAn(ma) {
    var lich = trangThai.lichKham.find((lichKhac) => lichKhac.id === ma);
    if (!lich) {
        return;
    }
    chuyenTrang("new", null, { pid: lich.pid, date: lich.date });
}

function veLichCuaToi() {
    const bieuMau = trangThai.locLichToi;
    const danhSach = lichCuaToi();
    layThe("my-date").value = bieuMau.date;
    layThe("my-status").value = bieuMau.status;
    ganChu("my-count", "Lịch khám của " + trangThai.nguoiDung.n + " (" + danhSach.length + ")");
    veBang(
        "my-body",
        danhSach,
        (lich) => [
            lich.id,
            lich.pn,
            hienNgay(lich.date) + " · " + lich.time,
            lich.status,
            lich.reason || "",
            lich.status === "Chờ khám"
                ? taoNut("Lập bệnh án", lapBenhAn, lich.id)
                : "",
        ],
        trangThai.nguoiDung.bs ? "Không có lịch khám phù hợp." : "Tài khoản này chưa gắn với bác sĩ trong CSDL.",
    );
}

ganSuKien("my-date", "change", datLocCuaToi);
ganSuKien("my-status", "change", datLocCuaToi);
ganSuKien("my-today", "click", locHomNay);
ganSuKien("my-clear", "click", xoaLocCuaToi);