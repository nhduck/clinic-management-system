// Điểm khởi tạo: điều hướng, sự kiện và khôi phục phiên demo.
function R() {
    if (window.renderAuth) renderAuth();
    if ($("app")) $("app").hidden = !S.me;
    if (!S.me) return;
    setText("role-label", "Menu chính · " + S.me.r);
    setText("user-name", S.me.n);
    setText("user-role", S.me.r);
    $("demo-warning").hidden = S.me.r === "Bác sĩ";
    const active = ["new", "det"].includes(S.v)
        ? "rec"
        : ["rxn", "rxv"].includes(S.v)
          ? "rxl"
          : S.v;
    setText("current-page", currentNav().find(([key]) => key === active)?.[1] || "Tổng quan");
    setText(
        "user-avatar",
        S.me.n
            .split(" ")
            .slice(-2)
            .map((x) => x[0])
            .join(""),
    );
    const nav = $("main-nav");
    nav.replaceChildren();
    currentNav().forEach(([v, label]) => {
        const a = document.createElement("a");
        a.append(uiIcon(v));
        const text = document.createElement("span");
        text.textContent = label;
        a.append(text);
        if (v === active) a.setAttribute("aria-current", "page");
        a.href = routeUrl(v);
        a.classList.toggle("on", v === active);
        a.addEventListener("click", (ev) => {
            if (ev.button !== 0 || ev.ctrlKey || ev.metaKey || ev.shiftKey || ev.altKey) return;
            ev.preventDefault();
            closeMenu();
            go(v);
        });
        nav.append(a);
    });
    document.querySelectorAll("[data-view]").forEach((el) => (el.hidden = el.dataset.view !== S.v));
    const note = $("notice");
    note.hidden = !S.msg;
    note.className = S.msg ? "msg " + S.msg[0] : "";
    note.textContent = S.msg ? S.msg[1] : "";
    const renderers = {
        home: "renderHome",
        patients: "renderPatients",
        appointments: "renderAppointments",
        myappts: "renderMyAppointments",
        rec: "renderRecords",
        new: "renderNewRecord",
        det: "renderRecordDetail",
        rxn: "renderNewPrescription",
        rxl: "renderPrescriptions",
        rxv: "renderPrescriptionDetail",
        drugs: "renderDrugs",
        doctors: "renderDoctors",
        specialties: "renderSpecialties",
        accounts: "renderAccounts",
    };
    const render = window[renderers[S.v]];
    if (render) render();
    labelControls();
}

bind("logout-btn", "click", logout);
document
    .querySelectorAll("[data-go]")
    .forEach((el) => el.addEventListener("click", () => go(el.dataset.go)));
async function startApplication() {
    initUI();
    await restoreDemoSession();
    initRouter();
    if (pageGroup(S.me ? S.v : "auth") !== document.body.dataset.page) return;
    applyPageContext();
    $("page-loading").hidden = true;
    document.documentElement.classList.remove("restoring-session");
}

window.clinicReady = startApplication();
