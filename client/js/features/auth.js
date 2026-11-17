// auth: logic tương tác và hiển thị dữ liệu động.
function T(t) {
  S.tab = t;
  clearNotice();
  R();
}

async function login() {
  var u = V("u"),
    p = $("p").value,
    f = S.users.filter(function (x) {
      return x.u == u && x.p == p;
    })[0];
  if (!u || !p) {
    notify("e", "Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu.");
    return R();
  }
  if (!f) {
    notify("e", "Sai tên đăng nhập hoặc mật khẩu.");
    return R();
  }
  S.me = f;
  S.v = "home";
  clearNotice();
  try {
    await loadData();
    sessionStorage.setItem("clinicDemoUser", f.u);
    R();
  } catch (err) {
    S.me = null;
    sessionStorage.removeItem("clinicDemoUser");
    notify("e", "Không kết nối được PostgreSQL/API: " + err.message);
    R();
  }
}

function reg() {
  var n = V("n"),
    r = V("r"),
    u = V("u"),
    p = $("p").value,
    p2 = $("p2").value;
  if (!n || !u || !p || !p2) return (notify("e", "Vui lòng điền đầy đủ thông tin."), R());
  if (u.length < 4) return (notify("e", "Tên đăng nhập tối thiểu 4 ký tự."), R());
  if (p.length < 6) return (notify("e", "Mật khẩu tối thiểu 6 ký tự."), R());
  if (p != p2) return (notify("e", "Mật khẩu nhập lại không khớp."), R());
  if (
    S.users.some(function (x) {
      return x.u == u;
    })
  )
    return (notify("e", "Tên đăng nhập đã tồn tại."), R());
  S.users.push({ u: u, p: p, n: n, r: r });
  S.tab = "in";
  notify("k", "Đăng ký thành công! Hãy đăng nhập.");
  R();
}

function logout() {
  sessionStorage.removeItem("clinicDemoUser");
  S.me = null;
  S.tab = "in";
  S.v = "home";
  $("p").value = "";
  clearNotice();
  R();
}

// Khôi phục phiên DEMO khi F5 trong cùng tab. Không lưu mật khẩu.
async function restoreDemoSession() {
  const username = sessionStorage.getItem("clinicDemoUser");
  if (!username) return;
  const user = S.users.find((x) => x.u === username);
  if (!user) {
    sessionStorage.removeItem("clinicDemoUser");
    return;
  }
  try {
    await loadData();
    S.me = user;
    S.v = "home";
    clearNotice();
  } catch (err) {
    sessionStorage.removeItem("clinicDemoUser");
    S.me = null;
    notify("e", "Không khôi phục được phiên demo: " + err.message);
  }
  R();
}

function renderAuth() {
  const signup = S.tab === "up";
  setText("auth-title", signup ? "Tạo tài khoản mới" : "Chào mừng trở lại");
  setText("auth-subtitle", signup ? "Điền thông tin để tạo tài khoản demo." : "Đăng nhập để bắt đầu phiên làm việc.");
  $("auth-screen").hidden = !!S.me;
  $("app").hidden = !S.me;
  $("auth-extra").hidden = !signup;
  $("auth-password-confirm").hidden = !signup;
  $("auth-demo").hidden = signup;
  $("auth-in").classList.toggle("on", !signup);
  $("auth-up").classList.toggle("on", signup);
  setText("auth-submit", signup ? "Tạo tài khoản" : "Đăng nhập");
  const note = $("auth-notice");
  note.hidden = !!S.me || !S.msg;
  note.className = S.msg ? "msg " + S.msg[0] : "";
  note.textContent = S.msg ? S.msg[1] : "";
}
