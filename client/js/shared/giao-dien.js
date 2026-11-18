// Tạo biểu tượng cho menu
function bieuTuong(ten) {
    const cacNet = {
        home: "M3 10 12 3l9 7M5 9v11h5v-6h4v6h5V9",
        patients:
            "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M17 4a4 4 0 0 1 0 7M22 21v-2a4 4 0 0 0-3-3.9",
        appointments:
            "M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14H3V6a2 2 0 0 1 2-2M8 14h2M14 14h2M8 18h2",
        rec: "M14 2H5v20h14V7zM14 2v6h5M8 12h8M8 16h8",
        new: "M14 2H5v20h14V7zM14 2v6h5M12 12v6M9 15h6",
        rxn: "M5 3h14v18H5zM9 8h6M12 5v6M8 15h8M8 18h5",
        rxl: "M5 3h14v18H5zM8 8h8M8 12h8M8 16h5",
        drugs: "m9 15 6-6M6 18a5 5 0 0 1 0-7l5-5a5 5 0 0 1 7 7l-5 5a5 5 0 0 1-7 0z",
        doctors: "M6 3v5a6 6 0 0 0 12 0V3M4 3h4M16 3h4M12 14v2a5 5 0 0 0 10 0v-3M20 11h4",
        specialties: "M9 3h6v6h6v6h-6v6H9v-6H3V9h6z",
        accounts: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8M4 21v-2a6 6 0 0 1 6-5h4a6 6 0 0 1 6 5v2",
    };
    const hinh = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    for (const [khoa, giaTri] of Object.entries({
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        "stroke-width": "1.7",
        "stroke-linecap": "round",
        "stroke-linejoin": "round",
        "aria-hidden": "true",
    })) {
        hinh.setAttribute(khoa, giaTri);
    }
    const duongDan = document.createElementNS(hinh.namespaceURI, "path");
    duongDan.setAttribute("d", cacNet[ten === "myappts" ? "appointments" : ten] || cacNet.home);
    hinh.append(duongDan);
    return hinh;
}
function dongMenu() {
    if (!layThe("menu-toggle")) {
        return;
    }
    document.body.classList.remove("menu-open");
    layThe("menu-toggle").setAttribute("aria-expanded", "false");
    layThe("menu-toggle").setAttribute("aria-label", "Mở menu");
    layThe("menu-backdrop").hidden = true;
}
function ganNhan() {
    for (const nhan of document.querySelectorAll("label:not([for])")) {
        const theSau = nhan.nextElementSibling;
        if (theSau?.matches("input, select, textarea") && theSau.id) {
            nhan.htmlFor = theSau.id;
        }
    }
}
// Gắn sự kiện cho menu và các nút chung
function taoGiaoDien() {
    ganNhan();
    layThe("menu-toggle")?.addEventListener("click", () => {
        const dangMo = !document.body.classList.contains("menu-open");
        document.body.classList.toggle("menu-open", dangMo);
        layThe("menu-toggle").setAttribute("aria-expanded", String(dangMo));
        layThe("menu-toggle").setAttribute("aria-label", dangMo ? "Đóng menu" : "Mở menu");
        layThe("menu-backdrop").hidden = !dangMo;
        if (dangMo) {
            layThe("main-nav").querySelector("a")?.focus();
        }
    });
    layThe("menu-backdrop")?.addEventListener("click", dongMenu);
    document.addEventListener("keydown", (suKien) => {
        if (suKien.key === "Escape" && document.body.classList.contains("menu-open")) {
            dongMenu();
            layThe("menu-toggle").focus();
        }
    });
    matchMedia("(min-width: 768px)").addEventListener("change", dongMenu);
    layThe("logout-btn")?.addEventListener("click", dongMenu);
    for (const ma of ["u", "p", "p2"]) {
        layThe(ma)?.addEventListener("keydown", (suKien) => {
            if (suKien.key === "Enter") {
                layThe("auth-submit").click();
            }
        });
    }
}
