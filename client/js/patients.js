function saveDemoPatient() {
    var n = V("pat-name"),
        dob = V("pat-dob"),
        g = V("pat-gender"),
        phone = V("pat-phone");
    if (!n || !dob || !g) {
        notify("e", "Nhập họ tên, ngày sinh và giới tính.");
        R();
        return;
    }
    if (S.editPatient) {
        var x = S.uiPatients.find((x) => x.id === S.editPatient);
        Object.assign(x, { n, dob, g, phone });
    } else S.uiPatients.push({ id: nextDemoId("DEMO", allPatients()), n, dob, g, phone });
    S.editPatient = null;
    notify("k", "Đã lưu bệnh nhân demo (chưa ghi PostgreSQL).");
    R();
}

function deleteDemoPatient(id) {
    if (S.appointments.some((x) => x.pid === id)) {
        notify("e", "Bệnh nhân đang có lịch demo; hãy hủy lịch trước.");
        R();
        return;
    }
    if (!confirm("Xóa bệnh nhân demo?")) return;
    S.uiPatients = S.uiPatients.filter((x) => x.id !== id);
    S.editPatient = null;
    notify("k", "Đã xóa bệnh nhân demo.");
    R();
}

function renderPatients() {
    const p = S.uiPatients.find((x) => x.id === S.editPatient) || {};
    setText("pat-heading", S.editPatient ? "Sửa thông tin bệnh nhân demo" : "Thêm bệnh nhân demo");
    $("pat-name").value = p.n || "";
    $("pat-dob").value = p.dob || "";
    $("pat-gender").value = p.g || "";
    $("pat-phone").value = p.phone || "";
    setText("pat-save", S.editPatient ? "Lưu sửa" : "Thêm bệnh nhân");
    $("pat-cancel").hidden = !S.editPatient;
    const rows = allPatients().filter((x) =>
        (x.id + " " + x.n).toLowerCase().includes(S.q.toLowerCase()),
    );
    setText("pat-count", `Danh sách bệnh nhân (${rows.length})`);
    fillRows("patients-body", rows, (x) => [
        x.id,
        x.n,
        fd(x.dob),
        x.g || "—",
        S.uiPatients.some((t) => t.id === x.id)
            ? actions(
                  actionButton(
                      "Sửa",
                      (id) => {
                          S.editPatient = id;
                          R();
                      },
                      x.id,
                      true,
                  ),
                  actionButton("Xóa", deleteDemoPatient, x.id, true),
              )
            : "Đọc từ PostgreSQL",
    ]);
}

function renderPatientsRowsOnly() {
    const q = S.q.toLowerCase(),
        rows = allPatients().filter((x) => (x.id + " " + x.n).toLowerCase().includes(q));
    setText("pat-count", `Danh sách bệnh nhân (${rows.length})`);
    fillRows("patients-body", rows, (x) => [
        x.id,
        x.n,
        fd(x.dob),
        x.g || "—",
        S.uiPatients.some((t) => t.id === x.id)
            ? actions(
                  actionButton(
                      "Sửa",
                      (id) => {
                          S.editPatient = id;
                          R();
                      },
                      x.id,
                      true,
                  ),
                  actionButton("Xóa", deleteDemoPatient, x.id, true),
              )
            : "Đọc từ PostgreSQL",
    ]);
}

bind("pat-save", "click", saveDemoPatient);
bind("pat-cancel", "click", () => {
    S.editPatient = null;
    R();
});
bind("pat-search", "input", (ev) => {
    S.q = ev.target.value;
    renderPatientsRowsOnly();
});
