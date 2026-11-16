// dashboard: logic tương tác và hiển thị dữ liệu động.

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
    role === "Lễ tân" ? "Tổng quan Lễ tân" : role === "Quản trị" ? "Tổng quan Quản trị" : "Trang chủ",
  );
  const dest = $("home-stats");
  dest.replaceChildren();
  stats.forEach(([name, count]) => {
    const card = document.createElement("div");
    card.className = "card";
    const n = document.createElement("div");
    n.className = "n";
    n.textContent = count;
    card.append(n, document.createTextNode(name));
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
  $("home-actions").replaceChildren(...links.map(([label, page]) => navButton(label, page)));
}
