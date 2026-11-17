var NAV_DOCTOR = [
    ["home", "Trang chủ"],
    ["myappts", "Lịch khám của tôi"],
    ["rec", "Bệnh án"],
    ["rxl", "Đơn thuốc"],
    ["drugs", "Quản lý thuốc"],
];
var NAV_RECEPTION = [
    ["home", "Trang chủ"],
    ["patients", "Quản lý bệnh nhân"],
    ["appointments", "Lịch khám"],
];
var NAV_ADMIN = [
    ["home", "Trang chủ"],
    ["doctors", "Quản lý bác sĩ"],
    ["specialties", "Chuyên khoa"],
    ["accounts", "Tài khoản (demo)"],
];
var PAGE_ROUTES = [
    { path: "/login", view: "auth", tab: "in" },
    { path: "/register", view: "auth", tab: "up" },
    { path: "/dashboard", view: "home" },
    { path: "/patients", view: "patients" },
    { path: "/appointments", view: "appointments" },
    { path: "/my-appointments", view: "myappts" },
    { path: "/medical-records", view: "rec" },
    { path: "/medical-records/new", view: "new" },
    { path: "/medical-records/:id", view: "det" },
    { path: "/prescriptions", view: "rxl" },
    { path: "/prescriptions/new", view: "rxn" },
    { path: "/prescriptions/:id", view: "rxv" },
    { path: "/drugs", view: "drugs" },
    { path: "/doctors", view: "doctors" },
    { path: "/specialties", view: "specialties" },
    { path: "/accounts", view: "accounts" },
];
var pendingRoute = null;

function currentNav() {
    return S.me.r === "Quản trị" ? NAV_ADMIN : S.me.r === "Lễ tân" ? NAV_RECEPTION : NAV_DOCTOR;
}

function allowedPages() {
    return currentNav()
        .map((item) => item[0])
        .concat(S.me.r === "Bác sĩ" ? ["new", "det", "rxn", "rxv"] : []);
}

function routeUrl(view, id) {
    const route = PAGE_ROUTES.find((item) => item.view === view);
    if (!route) return "/dashboard";
    if (!route.path.includes(":id")) return route.path;
    if (!id) return view === "det" ? "/medical-records" : "/prescriptions";
    return route.path.replace(":id", encodeURIComponent(id));
}

function readLocationRoute() {
    const pathname = location.pathname.replace(/\/+$/, "") || "/";
    if (pathname === "/" || pathname === "/index.html") {
        const legacyView = location.hash.slice(1);
        return { view: PAGE_ROUTES.some((item) => item.view === legacyView) ? legacyView : "home" };
    }
    for (const route of PAGE_ROUTES) {
        const pattern = "^" + route.path.replace(":id", "([^/]+)") + "$";
        const match = pathname.match(new RegExp(pattern));
        if (!match) continue;
        try {
            return { ...route, id: match[1] ? decodeURIComponent(match[1]) : null };
        } catch {
            return null;
        }
    }
    return null;
}

function pageGroup(view) {
    const groups = {
        auth: "auth",
        home: "dashboard",
        patients: "patients",
        appointments: "appointments",
        myappts: "appointments",
        rec: "medical-records",
        new: "medical-records",
        det: "medical-records",
        rxl: "prescriptions",
        rxn: "prescriptions",
        rxv: "prescriptions",
        drugs: "drugs",
        doctors: "doctors",
        specialties: "specialties",
        accounts: "accounts",
    };
    return groups[view];
}

function openDocument(url, replace) {
    saveDemoData();
    if (S.msg) sessionStorage.setItem("clinicFlash", JSON.stringify(S.msg));
    location[replace ? "replace" : "assign"](url);
}

function writeRouteUrl(url, replace = false) {
    const route = PAGE_ROUTES.find((item) =>
        new RegExp("^" + item.path.replace(":id", "[^/]+") + "$").test(url),
    );
    if (route && pageGroup(route.view) !== document.body.dataset.page) {
        openDocument(url, replace);
        return false;
    }
    if (location.pathname + location.search + location.hash !== url) {
        history[replace ? "replaceState" : "pushState"]({}, "", url);
    }
    return true;
}

function applyPageContext() {
    const context = readSessionValue("clinicPageContext");
    if (context?.view === S.v) {
        sessionStorage.removeItem("clinicPageContext");
        if (S.v === "new") {
            $("f1").value = context.data.pid || "";
            $("f2").value = context.data.date || today();
        }
        if (S.v === "rxn") {
            S.rr = context.data.recordId || "";
            renderNewPrescription();
        }
    }
    const flash = readSessionValue("clinicFlash");
    sessionStorage.removeItem("clinicFlash");
    if (Array.isArray(flash)) {
        notify(flash[0], flash[1]);
        R();
    }
}

function setCurrentView(view, id) {
    if (view === "appointments" && S.v !== view) resetAppointmentForm();
    S.v = view;
    S.sel = id || null;
    clearNotice();
    S.d = [];
    S.rr = "";
    S.q = "";
}

function showRoute(route, replace = false) {
    if (!S.me) {
        if (route.view !== "auth") {
            pendingRoute = route;
            sessionStorage.setItem("clinicPendingRoute", JSON.stringify(route));
        }
        S.tab = route.view === "auth" ? route.tab || "in" : "in";
        S.v = "home";
        S.sel = null;
        if (!writeRouteUrl(S.tab === "up" ? "/register" : "/login", replace)) return;
        R();
        return;
    }

    if (route.view === "auth") route = { view: "home" };
    if (!allowedPages().includes(route.view)) {
        setCurrentView("home");
        notify("e", "Màn hình không thuộc vai trò demo hiện tại.");
        if (!writeRouteUrl("/dashboard", true)) return;
        R();
        return;
    }

    let message = "";
    if (route.view === "det" && !S.recs.some((item) => item.id === route.id)) {
        route = { view: "rec" };
        message = "Không tìm thấy bệnh án.";
        replace = true;
    }
    if (route.view === "rxv" && !S.rx.some((item) => item.id === route.id)) {
        route = { view: "rxl" };
        message = "Không tìm thấy đơn thuốc.";
        replace = true;
    }

    setCurrentView(route.view, route.id);
    if (message) notify("e", message);
    if (!writeRouteUrl(routeUrl(route.view, route.id), replace)) return;
    R();
}

function go(view, id, context) {
    if (S.me && !allowedPages().includes(view)) {
        notify("e", "Màn hình không thuộc vai trò demo hiện tại.");
        R();
        return;
    }
    if (context)
        sessionStorage.setItem("clinicPageContext", JSON.stringify({ view, data: context }));
    showRoute({ view, id });
}

function openAuthPage(tab, replace = false) {
    clearNotice();
    showRoute({ view: "auth", tab }, replace);
}

function completeLogin() {
    const route = pendingRoute || readSessionValue("clinicPendingRoute") || { view: "home" };
    pendingRoute = null;
    sessionStorage.removeItem("clinicPendingRoute");
    showRoute(route, true);
}

function syncLocationRoute() {
    const route = readLocationRoute();
    if (route) {
        showRoute(route, true);
        return;
    }
    showRoute({ view: S.me ? "home" : "auth", tab: "in" }, true);
    notify("e", "Đường dẫn không tồn tại.");
    R();
}

function initRouter() {
    window.addEventListener("popstate", () => {
        closeMenu();
        syncLocationRoute();
    });
    window.addEventListener("hashchange", syncLocationRoute);
    syncLocationRoute();
}
