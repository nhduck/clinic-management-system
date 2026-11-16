function saveDemoDoctor() {
  var n = V('doc-name'),
    specialty = V('doc-specialty'),
    phone = V('doc-phone');
  if (!n || !specialty) {
    notify('e', 'Nhập tên bác sĩ và chuyên khoa.');
    R();
    return;
  }
  if (S.editDoctor)
    Object.assign(
      S.doctors.find((x) => x.id === S.editDoctor),
      { n, specialty, phone }
    );
  else S.doctors.push({ id: nextDemoId('BS', S.doctors), n, specialty, phone });
  S.editDoctor = null;
  notify('k', 'Đã lưu bác sĩ demo.');
  R();
}

function removeDemoDoctor(id) {
  if (S.appointments.some((x) => x.doctor === id && x.status === 'Đã đặt')) {
    notify('e', 'Bác sĩ còn lịch đang đặt.');
    R();
    return;
  }
  if (!confirm('Xóa bác sĩ demo?')) return;
  S.doctors = S.doctors.filter((x) => x.id !== id);
  notify('k', 'Đã xóa bác sĩ demo.');
  R();
}
