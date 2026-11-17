function renderHome() {
    const role = S.me.r;
    const stats =
        role === "Lễ tân"
            ? [
                  ["Bệnh nhân", allPatients().length],
                  ["Lịch khám", S.appointments.length],
                  ["Lịch đang đặt", S.appointments.filter((x) => x.status === "Chờ khám").length],
              ]
            : role === "Quản trị"
              ? [
                    ["Bác sĩ demo", S.doctors.length],
                    ["Chuyên khoa demo", S.specialties.length],
                    ["Tài khoản demo", S.users.length],
                ]
              : [
                    ["Bệnh án", S.recs.length],
                    ["Đơn thuốc", S.rx.length],
                    ["Bệnh nhân", S.pts.length],
                    ["Danh mục thuốc", S.drugs.length],
                ];
    setText(
        "home-title",
        role === "Lễ tân"
            ? "Tổng quan lễ tân"
            : role === "Quản trị"
              ? "Tổng quan quản trị"
              : "Tổng quan phòng khám",
    );
    const dest = $("home-stats");
    dest.replaceChildren();
    stats.forEach(([name, count], index) => {
        const card = document.createElement("div");
        card.className = "card";
        const n = document.createElement("div");
        n.className = "n";
        n.textContent = count;
        const top = document.createElement("div");
        top.className = "stat-top";
        const label = document.createElement("span");
        label.textContent = name;
        const well = document.createElement("span");
        well.className = "icon-well";
        well.append(uiIcon(["rec", "rxl", "patients", "drugs"][index]));
        top.append(label, well);
        const detail = document.createElement("span");
        detail.className = "stat-caption";
        detail.textContent = "Tổng số hiện có";
        card.append(top, n, detail);
        dest.append(card);
    });
    const links =
        role === "Lễ tân"
            ? [
                  ["Quản lý bệnh nhân", "patients"],
                  ["Đặt lịch khám", "appointments"],
              ]
            : role === "Quản trị"
              ? [
                    ["Quản lý bác sĩ", "doctors"],
                    ["Quản lý tài khoản", "accounts"],
                ]
              : [
                    ["Lập bệnh án mới", "new"],
                    ["Kê đơn thuốc", "rxn"],
                    ["Tra cứu lịch sử khám", "rec"],
                ];
    $("home-actions").replaceChildren(
        ...links.map(([label, page]) => {
            const button = navButton(label, page);
            button.className = "quick-action";
            button.prepend(uiIcon(page));
            const arrow = document.createElement("span");
            arrow.className = "action-arrow";
            arrow.textContent = "↗";
            button.append(arrow);
            return button;
        }),
    );
    setText(
        "today-label",
        new Intl.DateTimeFormat("vi-VN", {
            weekday: "long",
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        }).format(new Date()),
    );
    setText("welcome-name", "Chào " + S.me.n + "!");
    $("welcome-action").textContent = links[0][0];
    $("welcome-action").onclick = () => go(links[0][1]);
    const activity = $("home-activity");
    activity.replaceChildren();
    setText(
        "activity-title",
        role === "Bác sĩ"
            ? "Bệnh án gần đây"
            : role === "Lễ tân"
              ? "Lịch khám gần đây"
              : "Đội ngũ bác sĩ demo",
    );
    const entries =
        role === "Bác sĩ"
            ? [...S.recs]
                  .sort(
                      (a, b) =>
                          String(b.date).localeCompare(String(a.date)) ||
                          String(b.id).localeCompare(String(a.id), undefined, { numeric: true }),
                  )
                  .slice(0, 3)
                  .map((x) => [
                      pt(x.pid)?.n || x.pid,
                      x.dx || "Chưa có chẩn đoán",
                      x.id,
                      () => go("det", x.id),
                  ])
            : role === "Lễ tân"
              ? [...S.appointments]
                    .sort((a, b) => String(b.date).localeCompare(String(a.date)))
                    .slice(0, 3)
                    .map((x) => [
                        allPatients().find((p) => p.id === x.pid)?.n || x.pid || x.id,
                        x.status || "Lịch khám",
                        x.date ? fd(x.date) : "",
                        () => go("appointments"),
                    ])
              : S.doctors
                    .slice(0, 3)
                    .map((x) => [x.n, "Bác sĩ demo", x.bs || "", () => go("doctors")]);
    if (!entries.length) {
        const empty = document.createElement("p");
        empty.className = "empty-state";
        empty.textContent = "Chưa có dữ liệu. Bạn có thể bắt đầu từ các thao tác nhanh.";
        activity.append(empty);
    }
    entries.forEach(([title, subtitle, code, action]) => {
        const row = document.createElement("button");
        row.className = "activity-row";
        row.type = "button";
        const icon = document.createElement("span");
        icon.className = "icon-well";
        icon.append(uiIcon(role === "Lễ tân" ? "appointments" : "rec"));
        const text = document.createElement("span");
        text.className = "activity-text";
        const heading = document.createElement("b");
        heading.textContent = title;
        const sub = document.createElement("small");
        sub.textContent = subtitle;
        text.append(heading, sub);
        const tag = document.createElement("span");
        tag.className = "activity-code";
        tag.textContent = code;
        row.append(icon, text, tag);
        row.onclick = action;
        activity.append(row);
    });
}
