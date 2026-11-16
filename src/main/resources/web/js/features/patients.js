// -----------------------------------------------------------
// UI DEMO cho Le tan / Admin - du lieu thay doi khong ghi DB.
// Cac module benh an va ke don van su dung PostgreSQL nhu truoc.
function allPatients() {
  return S.pts.concat(S.uiPatients);
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
