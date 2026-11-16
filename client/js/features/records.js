// records: logic tương tác và hiển thị dữ liệu động.
async function saveRec() {
  var o = { pid: V("f1"), date: V("f2"), sym: V("f3"), dx: V("f4"), note: V("f5") };
  if (!o.pid || !o.date || !o.sym || !o.dx) {
    notify("e", "Cần chọn bệnh nhân, ngày khám, triệu chứng và chẩn đoán.");
    return R();
  }
  try {
    var saved = await api("/api/records", { method: "POST", body: JSON.stringify(o) });
    await loadData();
    go("det", saved.id);
    notify("k", "Đã lưu bệnh án " + saved.id + " vào PostgreSQL.");
    R();
  } catch (err) {
    notify("e", err.message);
    R();
  }
}

function filteredRecords() {
  return S.recs.filter((r) => {
    const p = pt(r.pid);
    return !S.q || (r.id + " " + (p?.n || "") + " " + r.dx).toLowerCase().includes(S.q.toLowerCase());
  });
}
function renderRecords() {
  $("rec-search").value = S.q;
  fillRows(
    "tb",
    filteredRecords(),
    (r) => [
      r.id,
      pt(r.pid)?.n || "—",
      fd(r.date),
      r.dx,
      rxOf(r.id) ? "Đã kê đơn" : "Chưa có",
      actionButton("Xem", (id) => go("det", id), r.id),
    ],
    "Không tìm thấy bệnh án.",
  );
}
function renderNewRecord() {
  setOptions(
    "f1",
    S.pts.map((p) => [p.id, p.id + " – " + p.n]),
    "",
    "Chọn bệnh nhân",
  );
  $("f2").value = today();
}
function renderRecordDetail() {
  const r = rc(S.sel);
  if (!r) {
    go("rec");
    return;
  }
  const p = pt(r.pid),
    x = rxOf(r.id),
    history = S.recs.filter((y) => y.pid === r.pid && y.id !== r.id);
  setText("detail-heading", "Chi tiết bệnh án " + r.id);
  setText("detail-patient", `${p?.n || "—"} (${p?.id || "—"}, ${p?.g || "—"}, ${fd(p?.dob)})`);
  setText("detail-date", fd(r.date));
  setText("detail-sym", r.sym);
  setText("detail-dx", r.dx);
  setText("detail-note", r.note || "—");
  const container = $("detail-prescription");
  container.replaceChildren();
  if (x) {
    const note = document.createElement("p");
    note.textContent = "Mã " + x.id + " · " + fd(x.date);
    container.append(note);
    const list = document.createElement("ul");
    x.lines.forEach((line) => {
      const li = document.createElement("li");
      li.textContent = `${line.d} – ${line.dose} – SL ${line.qty} – ${line.use}`;
      list.append(li);
    });
    container.append(list);
  } else container.textContent = "Chưa kê đơn cho bệnh án này.";
  $("detail-prescribe").hidden = !!x;
  fillRows(
    "detail-history",
    history,
    (y) => [y.id, fd(y.date), y.dx, actionButton("Xem", (id) => go("det", id), y.id)],
    "Chưa có lần khám trước.",
  );
}
