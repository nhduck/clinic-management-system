// Điểm khởi tạo: điều hướng, sự kiện và khôi phục phiên demo.
function R() {
  renderAuth();
  if (!S.me) return;
  setText("role-label", "Menu chính · " + S.me.r);
  setText("user-name", S.me.n);
  setText("user-role", S.me.r);
  $("demo-warning").hidden = S.me.r === "Bác sĩ";
  const active = S.v === "det" ? "rec" : S.v === "rxv" ? "rxl" : S.v;
  const nav = $("main-nav");
  nav.replaceChildren();
  currentNav().forEach(([v, label]) => {
    const a = document.createElement("a");
    a.textContent = label;
    a.href = "#" + v;
    a.classList.toggle("on", v === active);
    a.addEventListener("click", (ev) => {
      ev.preventDefault();
      go(v);
    });
    nav.append(a);
  });
  document.querySelectorAll("[data-view]").forEach((el) => (el.hidden = el.dataset.view !== S.v));
  const note = $("notice");
  note.hidden = !S.msg;
  note.className = S.msg ? "msg " + S.msg[0] : "";
  note.textContent = S.msg ? S.msg[1] : "";
  (
    ({
      home: renderHome,
      patients: renderPatients,
      appointments: renderAppointments,
      myappts: renderMyAppointments,
      rec: renderRecords,
      new: renderNewRecord,
      det: renderRecordDetail,
      rxn: renderNewPrescription,
      rxl: renderPrescriptions,
      rxv: renderPrescriptionDetail,
      drugs: renderDrugs,
      doctors: renderDoctors,
      specialties: renderSpecialties,
      accounts: renderAccounts,
    })[S.v] || renderHome
  )();
}

function bind(id, event, handler) {
  $(id).addEventListener(event, handler);
}
bind("auth-in", "click", () => T("in"));
bind("auth-up", "click", () => T("up"));
bind("auth-submit", "click", () => (S.tab === "in" ? login() : reg()));
bind("logout-btn", "click", logout);
bind("pat-save", "click", saveDemoPatient);
bind("pat-cancel", "click", () => {
  S.editPatient = null;
  R();
});
bind("pat-search", "input", (ev) => {
  S.q = ev.target.value;
  renderPatientsRowsOnly();
});
bind("flt-date", "change", setAppointmentFilter);
bind("flt-bs", "change", setAppointmentFilter);
bind("flt-clear", "click", clearAppointmentFilter);
bind("my-date", "change", setMyFilter);
bind("my-status", "change", setMyFilter);
bind("my-today", "click", myToday);
bind("my-clear", "click", clearMyFilter);
bind("app-shift", "change", pickShift);
bind("appointment-save", "click", saveAppointment);
bind("appointment-cancel-edit", "click", cancelEdit);
bind("rec-search", "input", (ev) => {
  S.q = ev.target.value;
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
});
bind("rec-save", "click", saveRec);
bind("detail-prescribe", "click", () => {
  const id = S.sel;
  go("rxn");
  S.rr = id;
  R();
});
bind("rr", "change", (ev) => {
  S.rr = ev.target.value;
  renderNewPrescription();
});
bind("d2select", "change", toggleCustomDose);
bind("rx-add", "click", addLine);
bind("rx-save", "click", saveRx);
bind("drug-submit", "click", saveDrug);
bind("drug-cancel", "click", cancelDrug);
bind("doc-save", "click", saveDemoDoctor);
bind("doc-cancel", "click", () => {
  S.editDoctor = null;
  R();
});
bind("specialty-save", "click", addDemoSpecialty);
document.querySelectorAll("[data-go]").forEach((el) => el.addEventListener("click", () => go(el.dataset.go)));
R();
restoreDemoSession().finally(() => {
  document.documentElement.classList.remove("restoring-session");
});
