function addDemoSpecialty() {
  var n = V('specialty-name');
  if (!n || S.specialties.some((x) => x.toLowerCase() === n.toLowerCase())) {
    notify('e', 'Tên chuyên khoa trống hoặc bị trùng.');
    R();
    return;
  }
  S.specialties.push(n);
  notify('k', 'Đã thêm chuyên khoa demo.');
  R();
}

function removeDemoSpecialty(i) {
  var name = S.specialties[i];
  if (S.doctors.some((x) => x.specialty === name)) {
    notify('e', 'Chuyên khoa đang có bác sĩ.');
    R();
    return;
  }
  if (!confirm('Xóa chuyên khoa?')) return;
  S.specialties.splice(i, 1);
  notify('k', 'Đã xóa chuyên khoa demo.');
  R();
}
