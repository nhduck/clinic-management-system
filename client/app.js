// JavaScript chỉ xử lý trạng thái, sự kiện, dữ liệu động; bố cục nằm trong index.html.
function setText(id, value) { $(id).textContent = value == null ? '' : String(value); }
function setOptions(id, items, value, placeholder) {
  const select = $(id);
  select.replaceChildren(new Option(placeholder, ''));
  items.forEach(([v, label]) => select.add(new Option(label, v)));
  select.value = value == null ? '' : String(value);
}
function actionButton(label, action, arg, outlined = false) {
  const button = document.createElement('button');
  button.type = 'button'; button.className = outlined ? 'btn o s' : 'btn s';
  button.textContent = label;
  button.addEventListener('click', () => action(arg));
  return button;
}
function fillRows(id, rows, makeCells, emptyMessage = 'Chưa có dữ liệu.') {
  const body = $(id); body.replaceChildren();
  if (!rows.length) {
    const tr = body.insertRow(); const td = tr.insertCell();
    td.colSpan = body.closest('table').querySelectorAll('thead th').length;
    td.textContent = emptyMessage; return;
  }
  rows.forEach((item, index) => {
    const tr = body.insertRow();
    makeCells(item, index).forEach(cell => {
      const td = tr.insertCell();
      if (cell instanceof Node) td.append(cell);
      else td.textContent = cell == null ? '' : String(cell);
    });
  });
}
function actions(...buttons) { const div = document.createElement('div'); div.className = 'bar action-bar'; buttons.forEach(x => div.append(x)); return div; }
function navButton(label, view) { const b = actionButton(label, () => go(view)); b.className = 'btn'; return b; }
function renderHome() {
  const role = S.me.r;
  const stats = role === 'Lễ tân' ? [['Bệnh nhân', allPatients().length], ['Lịch khám', S.appointments.length], ['Lịch đang đặt', S.appointments.filter(x => x.status === 'Chờ khám').length]]
    : role === 'Quản trị' ? [['Bác sĩ demo', S.doctors.length], ['Chuyên khoa demo', S.specialties.length], ['Tài khoản demo', S.users.length]]
      : [['Bệnh án', S.recs.length], ['Đơn thuốc', S.rx.length], ['Bệnh nhân', S.pts.length], ['Danh mục thuốc', S.drugs.length]];
  setText('home-title', role === 'Lễ tân' ? 'Tổng quan Lễ tân' : role === 'Quản trị' ? 'Tổng quan Quản trị' : 'Trang chủ');
  const dest = $('home-stats'); dest.replaceChildren();
  stats.forEach(([name, count]) => { const card = document.createElement('div'); card.className = 'card'; const n = document.createElement('div'); n.className = 'n'; n.textContent = count; card.append(n, document.createTextNode(name)); dest.append(card); });
  const links = role === 'Lễ tân' ? [['Quản lý bệnh nhân', 'patients'], ['Đặt lịch khám', 'appointments']] : role === 'Quản trị' ? [['Quản lý bác sĩ', 'doctors'], ['Quản lý tài khoản', 'accounts']] : [['Lập bệnh án mới', 'new'], ['Kê đơn thuốc', 'rxn'], ['Tra cứu lịch sử khám', 'rec']];
  $('home-actions').replaceChildren(...links.map(([label, page]) => navButton(label, page)));
}
function renderPatients() {
  const p = S.uiPatients.find(x => x.id === S.editPatient) || {};
  setText('pat-heading', S.editPatient ? 'Sửa thông tin bệnh nhân demo' : 'Thêm bệnh nhân demo');
  $('pat-name').value = p.n || ''; $('pat-dob').value = p.dob || ''; $('pat-gender').value = p.g || ''; $('pat-phone').value = p.phone || '';
  setText('pat-save', S.editPatient ? 'Lưu sửa' : 'Thêm bệnh nhân'); $('pat-cancel').hidden = !S.editPatient;
  const rows = allPatients().filter(x => (x.id + ' ' + x.n).toLowerCase().includes(S.q.toLowerCase()));
  setText('pat-count', `Danh sách bệnh nhân (${rows.length})`);
  fillRows('patients-body', rows, x => [x.id, x.n, fd(x.dob), x.g || '—', S.uiPatients.some(t => t.id === x.id) ? actions(actionButton('Sửa', id => { S.editPatient = id; R(); }, x.id, true), actionButton('Xóa', deleteDemoPatient, x.id, true)) : 'Đọc từ PostgreSQL']);
}
function renderAppointments() {
  const f = S.af, edit = S.editAppointment;
  setText('appointment-heading', edit ? 'Cập nhật lịch khám ' + edit : 'Đặt lịch khám');
  setText('appointment-save', edit ? 'Lưu thay đổi' : 'Đặt lịch'); $('appointment-cancel-edit').hidden = !edit;
  setOptions('app-patient', S.pts.map(p => [p.id, p.id + ' – ' + p.n]), f.pid, 'Chọn bệnh nhân'); $('app-patient').disabled = !!edit;
  setOptions('app-shift', S.shifts.map(s => [s.id, shiftLabel(s)]), f.shift, 'Chọn ca làm việc');
  setOptions('app-time', S.slots.map(t => [t, t]), f.time, !f.shift ? 'Chọn ca làm việc trước' : S.slots.length ? 'Chọn giờ' : 'Hết chỗ trong ca này');
  $('app-reason').value = f.reason || '';
  const list = filteredAppointments(), flt = S.afilt;
  setOptions('flt-bs', appointmentDoctors(), flt.bs, 'Tất cả bác sĩ'); $('flt-date').value = flt.date;
  setText('appointments-count', 'Danh sách lịch (' + list.length + (flt.date || flt.bs ? ' / ' + S.appointments.length : '') + ')');
  fillRows('appointments-body', list, a => [a.id, a.pn, a.dn, fd(a.date) + ' · ' + a.time, a.status, a.reason || '', a.status === 'Chờ khám' ? actions(actionButton('Sửa', editAppointment, a.id, true), actionButton('Hủy lịch', cancelAppointment, a.id, true)) : ''], 'Không có lịch khám phù hợp.');
}

function renderMyAppointments() {
  const f = S.myfilt, list = myAppointments();
  $('my-date').value = f.date; $('my-status').value = f.status;
  setText('my-count', 'Lịch khám của ' + S.me.n + ' (' + list.length + ')');
  fillRows('my-body', list, a => [a.id, a.pn, fd(a.date) + ' · ' + a.time, a.status, a.reason || '', a.status === 'Chờ khám' ? actionButton('Lập bệnh án', startRecordFromAppointment, a.id) : ''], S.me.bs ? 'Không có lịch khám phù hợp.' : 'Tài khoản này chưa gắn với bác sĩ trong CSDL.');
}

function filteredRecords() {
  return S.recs.filter(r => { const p = pt(r.pid); return !S.q || (r.id + ' ' + (p?.n || '') + ' ' + r.dx).toLowerCase().includes(S.q.toLowerCase()); });
}
function renderRecords() { $('rec-search').value = S.q; fillRows('tb', filteredRecords(), r => [r.id, pt(r.pid)?.n || '—', fd(r.date), r.dx, rxOf(r.id) ? 'Đã kê đơn' : 'Chưa có', actionButton('Xem', id => go('det', id), r.id)], 'Không tìm thấy bệnh án.'); }
function renderNewRecord() { setOptions('f1', S.pts.map(p => [p.id, p.id + ' – ' + p.n]), '', 'Chọn bệnh nhân'); $('f2').value = today(); }
function renderLines(id, lines, editable = false) { fillRows(id, lines, (x, i) => [i + 1, x.d, x.dose, x.qty, x.use, ...(editable ? [actionButton('Xóa', delLine, i, true)] : [])]); }
function renderRecordDetail() {
  const r = rc(S.sel); if (!r) { go('rec'); return; }
  const p = pt(r.pid), x = rxOf(r.id), history = S.recs.filter(y => y.pid === r.pid && y.id !== r.id);
  setText('detail-heading', 'Chi tiết bệnh án ' + r.id); setText('detail-patient', `${p?.n || '—'} (${p?.id || '—'}, ${p?.g || '—'}, ${fd(p?.dob)})`);
  setText('detail-date', fd(r.date)); setText('detail-sym', r.sym); setText('detail-dx', r.dx); setText('detail-note', r.note || '—');
  const container = $('detail-prescription'); container.replaceChildren();
  if (x) { const note = document.createElement('p'); note.textContent = 'Mã ' + x.id + ' · ' + fd(x.date); container.append(note); const list = document.createElement('ul'); x.lines.forEach(line => { const li = document.createElement('li'); li.textContent = `${line.d} – ${line.dose} – SL ${line.qty} – ${line.use}`; list.append(li); }); container.append(list); } else container.textContent = 'Chưa kê đơn cho bệnh án này.';
  $('detail-prescribe').hidden = !!x;
  fillRows('detail-history', history, y => [y.id, fd(y.date), y.dx, actionButton('Xem', id => go('det', id), y.id)], 'Chưa có lần khám trước.');
}
function renderNewPrescription() {
  setOptions('rr', S.recs.filter(r => !rxOf(r.id)).map(r => [r.id, `${r.id} – ${pt(r.pid)?.n || '—'} – ${r.dx}`]), S.rr, 'Chọn bệnh án');
  const record = S.rr && rc(S.rr);
  setText('rx-diagnosis', record ? 'Chẩn đoán: ' + record.dx + ' · ' + fd(record.date) : '');
  setOptions('d1', S.drugs.map(d => [d, d]), '', 'Chọn thuốc');
  setText('rx-count', 'Các thuốc trong đơn (' + S.d.length + ')');
  renderLines('rx-lines', S.d, true);
  $('dose-custom').hidden = true;
}
function renderPrescriptions() { fillRows('prescriptions-body', S.rx, x => [x.id, x.rid, pt(rc(x.rid)?.pid)?.n || '—', fd(x.date), x.lines.length, actionButton('Xem', id => go('rxv', id), x.id)]); }
function renderPrescriptionDetail() {
  const x = S.rx.find(y => y.id === S.sel); if (!x) { go('rxl'); return; } const r = rc(x.rid);
  setText('rx-detail-heading', 'Đơn thuốc ' + x.id); setText('rx-detail-patient', pt(r?.pid)?.n || '—'); setText('rx-detail-record', (r?.id || '—') + ' – ' + (r?.dx || '—')); setText('rx-detail-date', fd(x.date)); renderLines('rx-detail-lines', x.lines);
}
function renderDrugs() {
  setText('drug-count', 'Danh sách thuốc (' + S.drugItems.length + ')');
  fillRows('drugs-body', S.drugItems, x => ['T' + String(x.id).padStart(3, '0'), x.name, actions(actionButton('Sửa', editDrug, x.id, true), actionButton('Xóa', removeDrug, x.id, true))], 'Chưa có thuốc nào.');
}
function renderDoctors() {
  const d = S.doctors.find(x => x.id === S.editDoctor) || {};
  setText('doctor-heading', S.editDoctor ? 'Sửa bác sĩ demo' : 'Thêm bác sĩ demo');
  $('doc-name').value = d.n || ''; $('doc-phone').value = d.phone || '';
  setOptions('doc-specialty', S.specialties.map(x => [x, x]), d.specialty || '', 'Chọn chuyên khoa');
  setText('doc-save', S.editDoctor ? 'Lưu sửa' : 'Thêm bác sĩ'); $('doc-cancel').hidden = !S.editDoctor;
  fillRows('doctors-body', S.doctors, x => [x.id, x.n, x.specialty, x.phone, actions(actionButton('Sửa', id => { S.editDoctor = id; R(); }, x.id, true), actionButton('Xóa', removeDemoDoctor, x.id, true))]);
}
function renderSpecialties() { fillRows('specialties-body', S.specialties, (x, i) => [x, actionButton('Xóa', removeDemoSpecialty, i, true)]); }
function renderAccounts() { fillRows('accounts-body', S.users, x => [x.u, x.n, x.r, 'Demo']); }
function renderAuth() {
  const signup = S.tab === 'up';
  $('auth-screen').hidden = !!S.me; $('app').hidden = !S.me;
  $('auth-extra').hidden = !signup; $('auth-password-confirm').hidden = !signup; $('auth-demo').hidden = signup;
  $('auth-in').classList.toggle('on', !signup); $('auth-up').classList.toggle('on', signup);
  setText('auth-submit', signup ? 'Tạo tài khoản' : 'Đăng nhập');
  const note = $('auth-notice');
  note.hidden = !!S.me || !S.msg;
  note.className = S.msg ? 'msg ' + S.msg[0] : '';
  note.textContent = S.msg ? S.msg[1] : '';
}
function R() {
  renderAuth(); if (!S.me) return;
  setText('role-label', 'Menu chính · ' + S.me.r); setText('user-name', S.me.n); setText('user-role', S.me.r);
  $('demo-warning').hidden = S.me.r === 'Bác sĩ';
  const active = S.v === 'det' ? 'rec' : S.v === 'rxv' ? 'rxl' : S.v;
  const nav = $('main-nav'); nav.replaceChildren();
  currentNav().forEach(([v, label]) => { const a = document.createElement('a'); a.textContent = label; a.href = '#' + v; a.classList.toggle('on', v === active); a.addEventListener('click', ev => { ev.preventDefault(); go(v); }); nav.append(a); });
  document.querySelectorAll('[data-view]').forEach(el => el.hidden = el.dataset.view !== S.v);
  const note = $('notice'); note.hidden = !S.msg; note.className = S.msg ? 'msg ' + S.msg[0] : ''; note.textContent = S.msg ? S.msg[1] : '';
  ({ home: renderHome, patients: renderPatients, appointments: renderAppointments, myappts: renderMyAppointments, rec: renderRecords, new: renderNewRecord, det: renderRecordDetail, rxn: renderNewPrescription, rxl: renderPrescriptions, rxv: renderPrescriptionDetail, drugs: renderDrugs, doctors: renderDoctors, specialties: renderSpecialties, accounts: renderAccounts }[S.v] || renderHome)();
}
function bind(id, event, handler) { $(id).addEventListener(event, handler); }
bind('auth-in', 'click', () => T('in')); bind('auth-up', 'click', () => T('up')); bind('auth-submit', 'click', () => S.tab === 'in' ? login() : reg()); bind('logout-btn', 'click', logout);
bind('pat-save', 'click', saveDemoPatient); bind('pat-cancel', 'click', () => { S.editPatient = null; R(); });
bind('pat-search', 'input', ev => { S.q = ev.target.value; renderPatientsRowsOnly(); });
function renderPatientsRowsOnly() { const q = S.q.toLowerCase(), rows = allPatients().filter(x => (x.id + ' ' + x.n).toLowerCase().includes(q)); setText('pat-count', `Danh sách bệnh nhân (${rows.length})`); fillRows('patients-body', rows, x => [x.id, x.n, fd(x.dob), x.g || '—', S.uiPatients.some(t => t.id === x.id) ? actions(actionButton('Sửa', id => { S.editPatient = id; R(); }, x.id, true), actionButton('Xóa', deleteDemoPatient, x.id, true)) : 'Đọc từ PostgreSQL']); }
bind('flt-date', 'change', setAppointmentFilter); bind('flt-bs', 'change', setAppointmentFilter); bind('flt-clear', 'click', clearAppointmentFilter);
bind('my-date', 'change', setMyFilter); bind('my-status', 'change', setMyFilter); bind('my-today', 'click', myToday); bind('my-clear', 'click', clearMyFilter);
bind('app-shift', 'change', pickShift); bind('appointment-save', 'click', saveAppointment); bind('appointment-cancel-edit', 'click', cancelEdit);
bind('rec-search', 'input', ev => { S.q = ev.target.value; fillRows('tb', filteredRecords(), r => [r.id, pt(r.pid)?.n || '—', fd(r.date), r.dx, rxOf(r.id) ? 'Đã kê đơn' : 'Chưa có', actionButton('Xem', id => go('det', id), r.id)], 'Không tìm thấy bệnh án.'); });
bind('rec-save', 'click', saveRec); bind('detail-prescribe', 'click', () => { const id = S.sel; go('rxn'); S.rr = id; R(); });
bind('rr', 'change', ev => { S.rr = ev.target.value; renderNewPrescription(); }); bind('d2select', 'change', toggleCustomDose);
bind('rx-add', 'click', addLine); bind('rx-save', 'click', saveRx);
bind('drug-submit', 'click', saveDrug); bind('drug-cancel', 'click', cancelDrug);
bind('doc-save', 'click', saveDemoDoctor); bind('doc-cancel', 'click', () => { S.editDoctor = null; R(); });
bind('specialty-save', 'click', addDemoSpecialty);
document.querySelectorAll('[data-go]').forEach(el => el.addEventListener('click', () => go(el.dataset.go)));
R();
restoreDemoSession().finally(() => {
  document.documentElement.classList.remove(
    'restoring-session'
  );
});
