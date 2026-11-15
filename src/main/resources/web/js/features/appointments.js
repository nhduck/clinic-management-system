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

function appointmentV() {
  var f = S.af,
    edit = S.editAppointment;
  var pOpts = S.pts
    .map(
      (p) =>
        `<option value="${e(p.id)}"${f.pid === p.id ? ' selected' : ''}>${e(p.id + ' – ' + p.n)}</option>`
    )
    .join('');
  var sOpts = S.shifts
    .map(
      (s) =>
        `<option value="${s.id}"${String(f.shift) === String(s.id) ? ' selected' : ''}>${e(shiftLabel(s))}</option>`
    )
    .join('');
  var tOpts = S.slots
    .map((t) => `<option${f.time === t ? ' selected' : ''}>${t}</option>`)
    .join('');
  var tHint = !f.shift
    ? 'Chọn ca làm việc trước'
    : S.slots.length
      ? 'Chọn giờ'
      : 'Hết chỗ trong ca này';
  var rows = sortedAppointments()
    .map(
      (a) =>
        `<tr><td>${e(a.id)}</td><td>${e(a.pn)}</td><td>${e(a.dn)}</td><td>${fd(a.date)} · ${e(a.time)}</td><td>${e(a.status)}</td><td>${e(a.reason || '')}</td><td>${a.status === 'Chờ khám' ? `<button class="btn o s" onclick="editAppointment('${a.id}')">Sửa</button> <button class="btn o s" onclick="cancelAppointment('${a.id}')">Hủy lịch</button>` : ''}</td></tr>`
    )
    .join('');
  return (
    `<h2>Quản lý lịch khám</h2><div class="panel"><h3>${edit ? 'Cập nhật lịch khám ' + e(edit) : 'Đặt lịch khám'}</h3><div class="row">` +
    `<div><label>Bệnh nhân</label><select id="app-patient"${edit ? ' disabled' : ''}><option value="" disabled hidden${f.pid ? '' : ' selected'}>Chọn bệnh nhân</option>${pOpts}</select></div>` +
    `<div><label>Ca làm việc (ngày · bác sĩ)</label><select id="app-shift" onchange="pickShift()"><option value="" disabled hidden${f.shift ? '' : ' selected'}>Chọn ca làm việc</option>${sOpts}</select></div>` +
    `<div><label>Giờ khám (còn trống)</label><select id="app-time"><option value="" disabled hidden${f.time ? '' : ' selected'}>${tHint}</option>${tOpts}</select></div>` +
    `<div><label>Lý do khám</label><input id="app-reason" value="${e(f.reason || '')}" placeholder="Ví dụ: ho, sốt 3 ngày"></div></div>` +
    `<div class="bar"><button class="btn" onclick="saveAppointment()">${edit ? 'Lưu thay đổi' : 'Đặt lịch'}</button>${edit ? '<button class="btn o" onclick="cancelEdit()">Hủy sửa</button>' : ''}</div></div>` +
    `<h3>Danh sách lịch (${S.appointments.length})</h3><div class="tw"><table><tr><th>Mã</th><th>Bệnh nhân</th><th>Bác sĩ</th><th>Ngày · Giờ</th><th>Trạng thái</th><th>Lý do</th><th>Thao tác</th></tr>${rows}</table></div>`
  );
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
