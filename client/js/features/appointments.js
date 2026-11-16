// appointments: logic tương tác và hiển thị dữ liệu động.
// ---- Lịch khám: gọi API thật (LichKhamService), lưu vào PostgreSQL ----
function shiftLabel(s) {
  return fd(s.date) + " · " + s.from + "–" + s.to + " · " + s.dn;
}

function sortedAppointments() {
  var w = S.appointments.filter((a) => a.status === "Chờ khám"),
    o = S.appointments.filter((a) => a.status !== "Chờ khám"),
    k = (a) => a.date + " " + a.time;
  return w.sort((x, y) => (k(x) < k(y) ? -1 : 1)).concat(o.sort((x, y) => (k(x) < k(y) ? 1 : -1)));
}

function syncAppointmentForm() {
  var p = $("app-patient"),
    s = $("app-shift"),
    t = $("app-time"),
    r = $("app-reason");
  if (p && !S.editAppointment) S.af.pid = p.value;
  if (s) S.af.shift = s.value;
  if (t) S.af.time = t.value;
  if (r) S.af.reason = r.value;
}

async function loadSlots() {
  S.slots = [];
  if (!S.af.shift) return;
  try {
    S.slots = await api("/api/slots?shift=" + encodeURIComponent(S.af.shift));
  } catch (err) {
    notify("e", err.message);
  }
  // đang sửa lịch: giờ hiện tại của chính lịch này vẫn được chọn lại
  var cur = S.editAppointment && S.appointments.find((x) => x.id === S.editAppointment);
  if (cur && String(cur.shift) === String(S.af.shift) && !S.slots.includes(cur.time))
    S.slots = S.slots.concat(cur.time).sort();
}

async function pickShift() {
  syncAppointmentForm();
  S.af.time = "";
  await loadSlots();
  R();
}

function resetAppointmentForm() {
  S.editAppointment = null;
  S.af = { pid: "", shift: "", time: "", reason: "" };
  S.slots = [];
}

async function saveAppointment() {
  syncAppointmentForm();
  var f = S.af;
  if (!f.pid || !f.shift || !f.time) {
    notify("e", "Chọn bệnh nhân, ca làm việc và giờ khám.");
    return R();
  }
  var edit = S.editAppointment,
    body = { pid: f.pid, shift: Number(f.shift), time: f.time, reason: f.reason };
  try {
    var saved = await api(edit ? "/api/appointments/" + edit : "/api/appointments", {
      method: edit ? "PUT" : "POST",
      body: JSON.stringify(body),
    });
    resetAppointmentForm();
    await loadData();
    notify("k", (edit ? "Đã cập nhật lịch " : "Đã đặt lịch ") + saved.id + " vào PostgreSQL.");
  } catch (err) {
    notify("e", err.message);
  }
  R();
}

async function editAppointment(id) {
  var a = S.appointments.find((x) => x.id === id);
  if (!a) return;
  S.editAppointment = id;
  S.af = { pid: a.pid, shift: String(a.shift), time: a.time, reason: a.reason || "" };
  await loadSlots();
  R();
}

function cancelEdit() {
  resetAppointmentForm();
  R();
}

async function cancelAppointment(id) {
  if (!confirm("Hủy lịch khám " + id + "?")) return;
  try {
    await api("/api/appointments/" + id + "/cancel", { method: "POST", body: "{}" });
    if (S.editAppointment === id) resetAppointmentForm();
    await loadData();
    notify("k", "Đã hủy lịch " + id + ".");
  } catch (err) {
    notify("e", err.message);
  }
  R();
}

//lọc lịch theo ngày/bác sĩ
function appointmentDoctors() {
  var m = {};
  S.appointments.concat(S.shifts).forEach((x) => {
    m[x.bs] = x.dn;
  });
  return Object.keys(m)
    .sort()
    .map((k) => [k, m[k]]);
}

function filteredAppointments() {
  var f = S.afilt;
  return sortedAppointments().filter((a) => (!f.date || a.date === f.date) && (!f.bs || a.bs === f.bs));
}

function setAppointmentFilter() {
  syncAppointmentForm();
  S.afilt = { date: $("flt-date").value, bs: $("flt-bs").value };
  R();
}

function clearAppointmentFilter() {
  syncAppointmentForm();
  S.afilt = { date: "", bs: "" };
  R();
}

//Bác sĩ xem lịch khám của mình
function myAppointments() {
  var f = S.myfilt;
  return S.appointments
    .filter((a) => a.bs === S.me.bs && (!f.date || a.date === f.date) && (!f.status || a.status === f.status))
    .sort((x, y) => (x.date + x.time < y.date + y.time ? -1 : 1));
}

function setMyFilter() {
  S.myfilt = { date: $("my-date").value, status: $("my-status").value };
  R();
}

function myToday() {
  S.myfilt = { date: today(), status: S.myfilt.status };
  R();
}

function clearMyFilter() {
  S.myfilt = { date: "", status: "" };
  R();
}

// Từ lịch "Chờ khám" mở sẵn form Lập bệnh án đúng bệnh nhân và ngày khám
function startRecordFromAppointment(id) {
  var a = S.appointments.find((x) => x.id === id);
  if (!a) return;
  go("new");
  $("f1").value = a.pid;
  $("f2").value = a.date;
}

function renderAppointments() {
  const f = S.af,
    edit = S.editAppointment;
  setText("appointment-heading", edit ? "Cập nhật lịch khám " + edit : "Đặt lịch khám");
  setText("appointment-save", edit ? "Lưu thay đổi" : "Đặt lịch");
  $("appointment-cancel-edit").hidden = !edit;
  setOptions(
    "app-patient",
    S.pts.map((p) => [p.id, p.id + " – " + p.n]),
    f.pid,
    "Chọn bệnh nhân",
  );
  $("app-patient").disabled = !!edit;
  setOptions(
    "app-shift",
    S.shifts.map((s) => [s.id, shiftLabel(s)]),
    f.shift,
    "Chọn ca làm việc",
  );
  setOptions(
    "app-time",
    S.slots.map((t) => [t, t]),
    f.time,
    !f.shift ? "Chọn ca làm việc trước" : S.slots.length ? "Chọn giờ" : "Hết chỗ trong ca này",
  );
  $("app-reason").value = f.reason || "";
  const list = filteredAppointments(),
    flt = S.afilt;
  setOptions("flt-bs", appointmentDoctors(), flt.bs, "Tất cả bác sĩ");
  $("flt-date").value = flt.date;
  setText(
    "appointments-count",
    "Danh sách lịch (" + list.length + (flt.date || flt.bs ? " / " + S.appointments.length : "") + ")",
  );
  fillRows(
    "appointments-body",
    list,
    (a) => [
      a.id,
      a.pn,
      a.dn,
      fd(a.date) + " · " + a.time,
      a.status,
      a.reason || "",
      a.status === "Chờ khám"
        ? actions(
            actionButton("Sửa", editAppointment, a.id, true),
            actionButton("Hủy lịch", cancelAppointment, a.id, true),
          )
        : "",
    ],
    "Không có lịch khám phù hợp.",
  );
}

function renderMyAppointments() {
  const f = S.myfilt,
    list = myAppointments();
  $("my-date").value = f.date;
  $("my-status").value = f.status;
  setText("my-count", "Lịch khám của " + S.me.n + " (" + list.length + ")");
  fillRows(
    "my-body",
    list,
    (a) => [
      a.id,
      a.pn,
      fd(a.date) + " · " + a.time,
      a.status,
      a.reason || "",
      a.status === "Chờ khám" ? actionButton("Lập bệnh án", startRecordFromAppointment, a.id) : "",
    ],
    S.me.bs ? "Không có lịch khám phù hợp." : "Tài khoản này chưa gắn với bác sĩ trong CSDL.",
  );
}
