function T(t) {
  S.tab = t;
  clearNotice();
  R();
}

async function login() {
  var u = V('u'),
    p = $('p').value,
    f = S.users.filter(function (x) {
      return x.u == u && x.p == p;
    })[0];
  if (!u || !p) {
    notify('e', 'Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu.');
    return R();
  }
  if (!f) {
    notify('e', 'Sai tên đăng nhập hoặc mật khẩu.');
    return R();
  }
  S.me = f;
  S.v = 'home';
  clearNotice();
  try {
    await loadData();
    R();
  } catch (err) {
    S.me = null;
    notify('e', 'Không kết nối được PostgreSQL/API: ' + err.message);
    R();
  }
}

function reg() {
  var n = V('n'),
    r = V('r'),
    u = V('u'),
    p = $('p').value,
    p2 = $('p2').value;
  if (!n || !u || !p || !p2) return (notify('e', 'Vui lòng điền đầy đủ thông tin.'), R());
  if (u.length < 4) return (notify('e', 'Tên đăng nhập tối thiểu 4 ký tự.'), R());
  if (p.length < 6) return (notify('e', 'Mật khẩu tối thiểu 6 ký tự.'), R());
  if (p != p2) return (notify('e', 'Mật khẩu nhập lại không khớp.'), R());
  if (
    S.users.some(function (x) {
      return x.u == u;
    })
  )
    return (notify('e', 'Tên đăng nhập đã tồn tại.'), R());
  S.users.push({ u: u, p: p, n: n, r: r });
  S.tab = 'in';
  notify('k', 'Đăng ký thành công! Hãy đăng nhập.');
  R();
}

function logout() {
  S.me = null;
  S.tab = 'in';
  clearNotice();
  R();
}

function authV() {
  var i = S.tab == 'in';
  return (
    '<div class="auth"><div class="box"><div class="brand">PHÒNG KHÁM<small>Hệ thống quản lý bệnh án và kê đơn</small></div>' +
    '<div class="tabs"><button class="' +
    (i ? 'on' : '') +
    '" onclick="T(\'in\')">Đăng nhập</button><button class="' +
    (i ? '' : 'on') +
    '" onclick="T(\'up\')">Đăng ký</button></div>' +
    (i
      ? ''
      : '<label>Họ và tên</label><input id="n" placeholder="Nguyễn Văn A"><label>Vai trò</label><select id="r"><option>Bác sĩ</option><option>Lễ tân</option><option>Quản trị</option></select>') +
    '<label>Tên đăng nhập</label><input id="u" placeholder="bacsi" autocomplete="username"><label>Mật khẩu</label><input id="p" type="password" placeholder="Tối thiểu 6 ký tự">' +
    (i ? '' : '<label>Nhập lại mật khẩu</label><input id="p2" type="password">') +
    M() +
    '<div class="bar"><button class="btn" style="flex:1" onclick="' +
    (i ? 'login()' : 'reg()') +
    '">' +
    (i ? 'Đăng nhập' : 'Tạo tài khoản') +
    '</button></div>' +
    (i
      ? '<p style="font-size:12px;color:var(--mu)">Tài khoản demo (chưa có xác thực backend): <b>bacsi</b>, <b>letan</b>, <b>admin</b> / <b>123456</b></p>'
      : '') +
    '</div></div>'
  );
}
