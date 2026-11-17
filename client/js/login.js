function T(t) {
    openAuthPage(t);
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
        sessionStorage.setItem(
            "clinicDemoProfile",
            JSON.stringify({ u: f.u, n: f.n, r: f.r, bs: f.bs }),
        );
        completeLogin();
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
    openAuthPage("in", true);
    notify("k", "Đăng ký thành công! Hãy đăng nhập.");
    R();
}

function renderAuth() {
    const signup = S.tab === "up";
    setText("auth-title", signup ? "Tạo tài khoản mới" : "Chào mừng trở lại");
    setText(
        "auth-subtitle",
        signup ? "Điền thông tin để tạo tài khoản demo." : "Đăng nhập để bắt đầu phiên làm việc.",
    );
    $("auth-screen").hidden = !!S.me;
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

bind("auth-in", "click", () => T("in"));
bind("auth-up", "click", () => T("up"));
bind("auth-submit", "click", () => (S.tab === "in" ? login() : reg()));
