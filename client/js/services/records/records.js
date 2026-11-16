async function saveRec() {
  var o = { pid: V('f1'), date: V('f2'), sym: V('f3'), dx: V('f4'), note: V('f5') };
  if (!o.pid || !o.date || !o.sym || !o.dx) {
    notify('e', 'Cần chọn bệnh nhân, ngày khám, triệu chứng và chẩn đoán.');
    return R();
  }
  try {
    var saved = await api('/api/records', { method: 'POST', body: JSON.stringify(o) });
    await loadData();
    go('det', saved.id);
    notify('k', 'Đã lưu bệnh án ' + saved.id + ' vào PostgreSQL.');
    R();
  } catch (err) {
    notify('e', err.message);
    R();
  }
}

