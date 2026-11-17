function renderPrescriptions() {
    fillRows("prescriptions-body", S.rx, (x) => [
        x.id,
        x.rid,
        pt(rc(x.rid)?.pid)?.n || "—",
        fd(x.date),
        x.lines.length,
        actionButton("Xem", (id) => go("rxv", id), x.id),
    ]);
}

function selectedDose() {
    var choice = V("d2select");
    return choice === "custom" ? V("d2manual") : choice;
}

function toggleCustomDose() {
    var box = $("dose-custom");
    if (box) box.hidden = V("d2select") !== "custom";
    if (!box.hidden) $("d2manual").focus();
}

function addLine() {
    var l = { d: V("d1"), dose: selectedDose(), qty: parseInt(V("d3")), use: V("d4") };
    S.rr = V("rr");
    if (!S.rr) return (notify("e", "Hãy chọn bệnh án trước khi thêm thuốc."), R());
    if (!l.d || !l.dose || !(l.qty > 0))
        return (notify("e", "Nhập đủ thuốc, liều dùng và số lượng (> 0)."), R());
    S.d.push(l);
    clearNotice();
    R();
}

function delLine(i) {
    S.rr = V("rr");
    S.d.splice(i, 1);
    R();
}

async function saveRx() {
    S.rr = V("rr");
    if (!S.rr) return (notify("e", "Hãy chọn bệnh án."), R());
    if (!S.d.length) return (notify("e", "Đơn thuốc cần ít nhất một loại thuốc."), R());
    try {
        var saved = await api("/api/prescriptions", {
            method: "POST",
            body: JSON.stringify({ rid: S.rr, lines: S.d }),
        });
        await loadData();
        go("rxv", saved.id);
        notify("k", "Đã lưu đơn thuốc " + saved.id + " vào PostgreSQL.");
        R();
    } catch (err) {
        notify("e", err.message);
        R();
    }
}

function renderNewPrescription() {
    setOptions(
        "rr",
        S.recs
            .filter((r) => !rxOf(r.id))
            .map((r) => [r.id, `${r.id} – ${pt(r.pid)?.n || "—"} – ${r.dx}`]),
        S.rr,
        "Chọn bệnh án",
    );
    const record = S.rr && rc(S.rr);
    setText("rx-diagnosis", record ? "Chẩn đoán: " + record.dx + " · " + fd(record.date) : "");
    setOptions(
        "d1",
        S.drugs.map((d) => [d, d]),
        "",
        "Chọn thuốc",
    );
    setText("rx-count", "Các thuốc trong đơn (" + S.d.length + ")");
    renderLines("rx-lines", S.d, true);
    $("dose-custom").hidden = true;
}

bind("rr", "change", (ev) => {
    S.rr = ev.target.value;
    renderNewPrescription();
});
bind("d2select", "change", toggleCustomDose);
bind("rx-add", "click", addLine);
bind("rx-save", "click", saveRx);

function renderPrescriptionDetail() {
    const x = S.rx.find((y) => y.id === S.sel);
    if (!x) {
        go("rxl");
        return;
    }
    const r = rc(x.rid);
    setText("rx-detail-heading", "Đơn thuốc " + x.id);
    setText("rx-detail-patient", pt(r?.pid)?.n || "—");
    setText("rx-detail-record", (r?.id || "—") + " – " + (r?.dx || "—"));
    setText("rx-detail-date", fd(x.date));
    renderLines("rx-detail-lines", x.lines);
}
