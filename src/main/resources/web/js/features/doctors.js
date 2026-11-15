function doctorV() {
  var d = S.doctors.find((x) => x.id === S.editDoctor) || {};
  return (
    '<h2>Quản lý bác sĩ</h2><div class="panel"><h3>' +
    (S.editDoctor ? 'Sửa bác sĩ demo' : 'Thêm bác sĩ demo') +
    '</h3><div class="row"><div><label>Họ tên</label><input id="doc-name" value="' +
    e(d.n || '') +
    '" placeholder="BS. Nguyễn Văn A"></div><div><label>Chuyên khoa</label><select id="doc-specialty"><option value="" disabled hidden' +
    (!d.specialty ? ' selected' : '') +
    '>Chọn chuyên khoa</option>' +
    S.specialties
      .map((x) => '<option' + (d.specialty === x ? ' selected' : '') + '>' + e(x) + '</option>')
      .join('') +
    '</select></div><div><label>Điện thoại</label><input id="doc-phone" value="' +
    e(d.phone || '') +
    '" placeholder="09xxxxxxxx"></div></div><div class="bar"><button class="btn" onclick="saveDemoDoctor()">' +
    (S.editDoctor ? 'Lưu sửa' : 'Thêm bác sĩ') +
    '</button>' +
    (S.editDoctor ? '<button class="btn o" onclick="S.editDoctor=null;R()">Hủy sửa</button>' : '') +
    '</div></div><h3>Danh sách bác sĩ</h3><div class="tw"><table><tr><th>Mã</th><th>Họ tên</th><th>Chuyên khoa</th><th>Điện thoại</th><th>Thao tác</th></tr>' +
    S.doctors
      .map(
        (x) =>
          '<tr><td>' +
          e(x.id) +
          '</td><td>' +
          e(x.n) +
          '</td><td>' +
          e(x.specialty) +
          '</td><td>' +
          e(x.phone) +
          '</td><td><button class="btn o s" onclick="S.editDoctor=\'' +
          x.id +
          '\';R()">Sửa</button> <button class="btn o s" onclick="removeDemoDoctor(\'' +
          x.id +
          '\')">Xóa</button></td></tr>'
      )
      .join('') +
    '</table></div>'
  );
}

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
