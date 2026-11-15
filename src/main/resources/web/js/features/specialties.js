function specialtyV() {
  return (
    '<h2>Quản lý chuyên khoa</h2><div class="panel"><label>Tên chuyên khoa mới</label><input id="specialty-name" placeholder="Ví dụ: Tim mạch"><div class="bar"><button class="btn" onclick="addDemoSpecialty()">Thêm chuyên khoa</button></div></div><h3>Danh sách chuyên khoa</h3><div class="tw"><table><tr><th>Tên chuyên khoa</th><th>Thao tác</th></tr>' +
    S.specialties
      .map(
        (x, i) =>
          '<tr><td>' +
          e(x) +
          '</td><td><button class="btn o s" onclick="removeDemoSpecialty(' +
          i +
          ')">Xóa</button></td></tr>'
      )
      .join('') +
    '</table></div>'
  );
}

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
