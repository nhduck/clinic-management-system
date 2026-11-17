function readSessionValue(key) {
    try {
        return JSON.parse(sessionStorage.getItem(key));
    } catch {
        return null;
    }
}

function saveDemoData() {
    if (!S.me) return;
    sessionStorage.setItem(
        "clinicDemoData:" + S.me.u,
        JSON.stringify({
            uiPatients: S.uiPatients,
            doctors: S.doctors,
            specialties: S.specialties,
            uiAccounts: S.uiAccounts,
        }),
    );
}

function restoreDemoData() {
    const data = readSessionValue("clinicDemoData:" + S.me.u);
    if (!data) return;
    for (const key of ["uiPatients", "doctors", "specialties", "uiAccounts"]) {
        if (Array.isArray(data[key])) S[key] = data[key];
    }
}

function logout() {
    saveDemoData();
    sessionStorage.removeItem("clinicDemoUser");
    sessionStorage.removeItem("clinicDemoProfile");
    sessionStorage.removeItem("clinicPendingRoute");
    sessionStorage.removeItem("clinicPageContext");
    pendingRoute = null;
    S.me = null;
    if ($("p")) $("p").value = "";
    openAuthPage("in", true);
}

async function restoreDemoSession() {
    const username = sessionStorage.getItem("clinicDemoUser");
    if (!username) return;
    const profile = readSessionValue("clinicDemoProfile");
    const user =
        S.users.find((x) => x.u === username) || (profile?.u === username ? profile : null);
    if (!user) {
        sessionStorage.removeItem("clinicDemoUser");
        return;
    }
    try {
        await loadData();
        S.me = user;
        restoreDemoData();
        S.v = "home";
        clearNotice();
    } catch (err) {
        sessionStorage.removeItem("clinicDemoUser");
        S.me = null;
        notify("e", "Không khôi phục được phiên demo: " + err.message);
    }
}
