// Tiện ích DOM dùng chung cho các màn hình.
function setText(id, value) {
    $(id).textContent = value == null ? "" : String(value);
}
function setOptions(id, items, value, placeholder) {
    const select = $(id);
    select.replaceChildren(new Option(placeholder, ""));
    items.forEach(([v, label]) => select.add(new Option(label, v)));
    select.value = value == null ? "" : String(value);
}
function actionButton(label, action, arg, outlined = false) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = outlined ? "btn o s" : "btn s";
    button.textContent = label;
    button.addEventListener("click", () => action(arg));
    return button;
}
function fillRows(id, rows, makeCells, emptyMessage = "Chưa có dữ liệu.") {
    const body = $(id);
    body.replaceChildren();
    if (!rows.length) {
        const tr = body.insertRow();
        const td = tr.insertCell();
        td.colSpan = body.closest("table").querySelectorAll("thead th").length;
        td.textContent = emptyMessage;
        return;
    }
    rows.forEach((item, index) => {
        const tr = body.insertRow();
        makeCells(item, index).forEach((cell) => {
            const td = tr.insertCell();
            if (cell instanceof Node) td.append(cell);
            else td.textContent = cell == null ? "" : String(cell);
        });
    });
}
function actions(...buttons) {
    const div = document.createElement("div");
    div.className = "bar action-bar";
    buttons.forEach((x) => div.append(x));
    return div;
}
function navButton(label, view) {
    const b = actionButton(label, () => go(view));
    b.className = "btn";
    return b;
}

function bind(id, event, handler) {
    $(id)?.addEventListener(event, handler);
}
