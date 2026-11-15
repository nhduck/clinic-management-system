function go(v, s) {
  if (S.me && !allowedPages().includes(v)) {
    notify('e', 'Màn hình không thuộc vai trò demo hiện tại.');
    R();
    return;
  }
  if (v === 'appointments' && S.v !== 'appointments') resetAppointmentForm();
  S.v = v;
  S.sel = s || null;
  clearNotice();
  S.d = [];
  S.rr = '';
  S.q = '';
  R();
}

var NAV_DOCTOR = [
  ['home', 'Trang chủ'],
  ['rec', 'Danh sách bệnh án'],
  ['new', 'Lập bệnh án'],
  ['rxn', 'Kê đơn thuốc'],
  ['rxl', 'Đơn thuốc'],
  ['drugs', 'Quản lý thuốc']
];

var NAV_RECEPTION = [
  ['home', 'Trang chủ'],
  ['patients', 'Quản lý bệnh nhân'],
  ['appointments', 'Lịch khám']
];

var NAV_ADMIN = [
  ['home', 'Trang chủ'],
  ['doctors', 'Quản lý bác sĩ'],
  ['specialties', 'Chuyên khoa'],
  ['accounts', 'Tài khoản (demo)']
];

function currentNav() {
  return S.me.r === 'Quản trị' ? NAV_ADMIN : S.me.r === 'Lễ tân' ? NAV_RECEPTION : NAV_DOCTOR;
}

function allowedPages() {
  return currentNav()
    .map((x) => x[0])
    .concat(S.me.r === 'Bác sĩ' ? ['det', 'rxv'] : []);
}

function demoWarning() {
  return '<div class="demo-note"><b>Giao diện demo:</b> Các thao tác của Lễ tân / Admin chỉ lưu trong bộ nhớ trình duyệt đang mở. Chưa kết nối API, chưa có phân quyền backend. Không nhập dữ liệu thật.</div>';
}

function shell(c) {
  var cur = S.v === 'det' ? 'rec' : S.v === 'rxv' ? 'rxl' : S.v;
  return (
    '<div class="shell"><aside><div class="brand">PHÒNG KHÁM<small>Menu chính · ' +
    e(S.me.r) +
    '</small></div>' +
    currentNav()
      .map(function (n) {
        return (
          '<a class="' +
          (cur === n[0] ? 'on' : '') +
          '" onclick="go(\'' +
          n[0] +
          '\')">' +
          n[1] +
          '</a>'
        );
      })
      .join('') +
    '</aside><main><header><span>Xin chào, <b>' +
    e(S.me.n) +
    '</b> · ' +
    e(S.me.r) +
    '</span><button class="btn o s" onclick="logout()">Đăng xuất</button></header><div class="pg">' +
    M() +
    (S.me.r === 'Bác sĩ' ? '' : demoWarning()) +
    c +
    '</div></main></div>'
  );
}
