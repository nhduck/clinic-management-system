// -----------------------------------------------------------
// UI DEMO cho Le tan / Admin - du lieu thay doi khong ghi DB.
// Cac module benh an va ke don van su dung PostgreSQL nhu truoc.
function allPatients() {
  return S.pts.concat(S.uiPatients);
}

function patientV() {
  var list = allPatients().filter((x) =>
    (x.id + ' ' + x.n).toLowerCase().includes(S.q.toLowerCase())
  );
  var p = S.uiPatients.find((x) => x.id === S.editPatient) || {};
  return (
    '<h2>Quản lý bệnh nhân</h2><div class="panel"><h3>' +
    (S.editPatient ? 'Sửa thông tin bệnh nhân demo' : 'Thêm bệnh nhân demo') +
    '</h3><div class="row"><div><label>Họ tên</label><input id="pat-name" value="' +
    e(p.n || '') +
    '" placeholder="Nguyễn Văn A"></div><div><label>Ngày sinh</label><input id="pat-dob" type="date" value="' +
    e(p.dob || '') +
    '"></div><div><label>Giới tính</label><select id="pat-gender"><option value="" disabled hidden' +
    (!p.g ? ' selected' : '') +
    '>Chọn giới tính</option>' +
    ['Nam', 'Nữ', 'Khác']
      .map((g) => '<option' + (p.g === g ? ' selected' : '') + '>' + g + '</option>')
      .join('') +
    '</select></div><div><label>Số điện thoại (demo)</label><input id="pat-phone" value="' +
    e(p.phone || '') +
    '" placeholder="09xxxxxxxx"></div></div><div class="bar"><button class="btn" onclick="saveDemoPatient()">' +
    (S.editPatient ? 'Lưu sửa' : 'Thêm bệnh nhân') +
    '</button>' +
    (S.editPatient ? '<button class="btn o" onclick="S.editPatient=null;R()">Hủy</button>' : '') +
    '</div></div><h3>Danh sách bệnh nhân (' +
    list.length +
    ')</h3><div class="top"><input placeholder="Tìm mã hoặc tên bệnh nhân..." value="' +
    e(S.q) +
    '" oninput="S.q=this.value;R()"></div><div class="tw"><table><tr><th>Mã</th><th>Họ tên</th><th>Ngày sinh</th><th>Giới tính</th><th>Thao tác</th></tr>' +
    list
      .map(
        (x) =>
          '<tr><td>' +
          e(x.id) +
          '</td><td>' +
          e(x.n) +
          '</td><td>' +
          fd(x.dob) +
          '</td><td>' +
          e(x.g || '—') +
          '</td><td>' +
          (S.uiPatients.some((t) => t.id === x.id)
            ? '<button class="btn o s" onclick="S.editPatient=\'' +
              x.id +
              '\';R()">Sửa</button> <button class="btn o s" onclick="deleteDemoPatient(\'' +
              x.id +
              '\')">Xóa</button>'
            : '<span class="tag">Đọc từ PostgreSQL</span>') +
          '</td></tr>'
      )
      .join('') +
    '</table></div>'
  );
}

function saveDemoPatient() {
  var n = V('pat-name'),
    dob = V('pat-dob'),
    g = V('pat-gender'),
    phone = V('pat-phone');
  if (!n || !dob || !g) {
    notify('e', 'Nhập họ tên, ngày sinh và giới tính.');
    R();
    return;
  }
  if (S.editPatient) {
    var x = S.uiPatients.find((x) => x.id === S.editPatient);
    Object.assign(x, { n, dob, g, phone });
  } else S.uiPatients.push({ id: nextDemoId('DEMO', allPatients()), n, dob, g, phone });
  S.editPatient = null;
  notify('k', 'Đã lưu bệnh nhân demo (chưa ghi PostgreSQL).');
  R();
}

function deleteDemoPatient(id) {
  if (S.appointments.some((x) => x.pid === id)) {
    notify('e', 'Bệnh nhân đang có lịch demo; hãy hủy lịch trước.');
    R();
    return;
  }
  if (!confirm('Xóa bệnh nhân demo?')) return;
  S.uiPatients = S.uiPatients.filter((x) => x.id !== id);
  S.editPatient = null;
  notify('k', 'Đã xóa bệnh nhân demo.');
  R();
}
