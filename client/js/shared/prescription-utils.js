function renderLines(id, lines, editable = false) {
    fillRows(id, lines, (x, i) => [
        i + 1,
        x.d,
        x.dose,
        x.qty,
        x.use,
        ...(editable ? [actionButton("Xóa", delLine, i, true)] : []),
    ]);
}
