// doctors: logic tương tác và hiển thị dữ liệu động.
function saveDemoDoctor() {
  var n = V("doc-name"),
    specialty = V("doc-specialty"),
    phone = V("doc-phone");
  if (!n || !specialty) {
    notify("e", "Nhập tên bác sĩ và chuyên khoa.");
    R();
    return;
  }
  if (S.editDoctor)
    Object.assign(
      S.doctors.find((x) => x.id === S.editDoctor),
      { n, specialty, phone },
    );
  else S.doctors.push({ id: nextDemoId("BS", S.doctors), n, specialty, phone });
  S.editDoctor = null;
  notify("k", "Đã lưu bác sĩ demo.");
  R();
}

function removeDemoDoctor(id) {
  if (S.appointments.some((x) => x.doctor === id && x.status === "Đã đặt")) {
    notify("e", "Bác sĩ còn lịch đang đặt.");
    R();
    return;
  }
  if (!confirm("Xóa bác sĩ demo?")) return;
  S.doctors = S.doctors.filter((x) => x.id !== id);
  notify("k", "Đã xóa bác sĩ demo.");
  R();
}

function renderDoctors() {
  const d = S.doctors.find((x) => x.id === S.editDoctor) || {};
  setText("doctor-heading", S.editDoctor ? "Sửa bác sĩ demo" : "Thêm bác sĩ demo");
  $("doc-name").value = d.n || "";
  $("doc-phone").value = d.phone || "";
  setOptions(
    "doc-specialty",
    S.specialties.map((x) => [x, x]),
    d.specialty || "",
    "Chọn chuyên khoa",
  );
  setText("doc-save", S.editDoctor ? "Lưu sửa" : "Thêm bác sĩ");
  $("doc-cancel").hidden = !S.editDoctor;
  fillRows("doctors-body", S.doctors, (x) => [
    x.id,
    x.n,
    x.specialty,
    x.phone,
    actions(
      actionButton(
        "Sửa",
        (id) => {
          S.editDoctor = id;
          R();
        },
        x.id,
        true,
      ),
      actionButton("Xóa", removeDemoDoctor, x.id, true),
    ),
  ]);
}
