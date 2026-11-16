// ---- Lịch khám: gọi API thật (LichKhamService), lưu vào PostgreSQL ----
function shiftLabel(s) {
  return fd(s.date) + ' · ' + s.from + '–' + s.to + ' · ' + s.dn;
}

function sortedAppointments() {
  var w = S.appointments.filter((a) => a.status === 'Chờ khám'),
    o = S.appointments.filter((a) => a.status !== 'Chờ khám'),
    k = (a) => a.date + ' ' + a.time;
  return w.sort((x, y) => (k(x) < k(y) ? -1 : 1)).concat(o.sort((x, y) => (k(x) < k(y) ? 1 : -1)));
}

function syncAppointmentForm() {
  var p = $('app-patient'),
    s = $('app-shift'),
    t = $('app-time'),
    r = $('app-reason');
  if (p && !S.editAppointment) S.af.pid = p.value;
  if (s) S.af.shift = s.value;
  if (t) S.af.time = t.value;
  if (r) S.af.reason = r.value;
}

async function loadSlots() {
  S.slots = [];
  if (!S.af.shift) return;
  try {
    S.slots = await api('/api/slots?shift=' + encodeURIComponent(S.af.shift));
  } catch (err) {
    notify('e', err.message);
  }
  // đang sửa lịch: giờ hiện tại của chính lịch này vẫn được chọn lại
  var cur = S.editAppointment && S.appointments.find((x) => x.id === S.editAppointment);
  if (cur && String(cur.shift) === String(S.af.shift) && !S.slots.includes(cur.time))
    S.slots = S.slots.concat(cur.time).sort();
}

async function pickShift() {
  syncAppointmentForm();
  S.af.time = '';
  await loadSlots();
  R();
}

function resetAppointmentForm() {
  S.editAppointment = null;
  S.af = { pid: '', shift: '', time: '', reason: '' };
  S.slots = [];
}

async function saveAppointment() {
  syncAppointmentForm();
  var f = S.af;
  if (!f.pid || !f.shift || !f.time) {
    notify('e', 'Chọn bệnh nhân, ca làm việc và giờ khám.');
    return R();
  }
  var edit = S.editAppointment,
    body = { pid: f.pid, shift: Number(f.shift), time: f.time, reason: f.reason };
  try {
    var saved = await api(edit ? '/api/appointments/' + edit : '/api/appointments', {
      method: edit ? 'PUT' : 'POST',
      body: JSON.stringify(body)
    });
    resetAppointmentForm();
    await loadData();
    notify('k', (edit ? 'Đã cập nhật lịch ' : 'Đã đặt lịch ') + saved.id + ' vào PostgreSQL.');
  } catch (err) {
    notify('e', err.message);
  }
  R();
}

async function editAppointment(id) {
  var a = S.appointments.find((x) => x.id === id);
  if (!a) return;
  S.editAppointment = id;
  S.af = { pid: a.pid, shift: String(a.shift), time: a.time, reason: a.reason || '' };
  await loadSlots();
  R();
}

function cancelEdit() {
  resetAppointmentForm();
  R();
}

async function cancelAppointment(id) {
  if (!confirm('Hủy lịch khám ' + id + '?')) return;
  try {
    await api('/api/appointments/' + id + '/cancel', { method: 'POST', body: '{}' });
    if (S.editAppointment === id) resetAppointmentForm();
    await loadData();
    notify('k', 'Đã hủy lịch ' + id + '.');
  } catch (err) {
    notify('e', err.message);
  }
  R();
}
