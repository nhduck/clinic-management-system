// Bệnh án/đơn thuốc/bệnh nhân được lấy từ PostgreSQL.
// Đăng nhập ở đây là tài khoản DEMO phía frontend, không bảo mật.
async function api(url, options) {
    var res = await fetch(
        url,
        Object.assign({ headers: { "Content-Type": "application/json" } }, options || {}),
    );
    var data = await res.json();
    if (!res.ok) throw new Error(data.error || "Lỗi máy chủ " + res.status);
    return data;
}

async function loadData() {
    var data = await api("/api/data");
    S.pts = data.pts;
    S.drugs = data.drugs;
    S.drugItems = data.drugItems || [];
    S.recs = data.recs;
    S.rx = data.rx;
    S.shifts = data.shifts || [];
    S.appointments = data.appts || [];
}
