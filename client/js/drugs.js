async function saveDrug() {
    var id = V("drug-id"),
        name = V("drug-name");
    if (!name) {
        notify("e", "Vui lòng nhập tên thuốc.");
        return R();
    }
    try {
        await api(id ? "/api/drugs/" + id : "/api/drugs", {
            method: id ? "PUT" : "POST",
            body: JSON.stringify({ name: name }),
        });
        await loadData();
        go("drugs");
        notify("k", id ? "Đã cập nhật thuốc." : "Đã thêm thuốc.");
        R();
    } catch (err) {
        notify("e", err.message);
        R();
    }
}

function editDrug(id) {
    var item = S.drugItems.find((x) => x.id === id);
    if (!item) return;
    $("drug-id").value = item.id;
    $("drug-name").value = item.name;
    $("drug-submit").textContent = "Lưu thay đổi";
    $("drug-cancel").hidden = false;
    $("drug-name").focus();
}

function cancelDrug() {
    $("drug-id").value = "";
    $("drug-name").value = "";
    $("drug-submit").textContent = "Thêm thuốc";
    $("drug-cancel").hidden = true;
}

async function removeDrug(id) {
    var item = S.drugItems.find((x) => x.id === id);
    if (
        !item ||
        !confirm(
            'Xóa thuốc "' + item.name + '" khỏi danh mục? Đơn thuốc đã lưu vẫn giữ nguyên tên cũ.',
        )
    )
        return;
    try {
        await api("/api/drugs/" + id, { method: "DELETE" });
        await loadData();
        go("drugs");
        notify("k", "Đã xóa thuốc khỏi danh mục.");
        R();
    } catch (err) {
        notify("e", err.message);
        R();
    }
}

function renderDrugs() {
    setText("drug-count", "Danh sách thuốc (" + S.drugItems.length + ")");
    fillRows(
        "drugs-body",
        S.drugItems,
        (x) => [
            "T" + String(x.id).padStart(3, "0"),
            x.name,
            actions(
                actionButton("Sửa", editDrug, x.id, true),
                actionButton("Xóa", removeDrug, x.id, true),
            ),
        ],
        "Chưa có thuốc nào.",
    );
}

bind("drug-submit", "click", saveDrug);
bind("drug-cancel", "click", cancelDrug);
