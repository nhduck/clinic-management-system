function selectedDose() {
  var choice = V('d2select');
  return choice === 'custom' ? V('d2manual') : choice;
}

function toggleCustomDose() {
  var box = $('dose-custom');
  if (box) box.hidden = V('d2select') !== 'custom';
  if (!box.hidden) $('d2manual').focus();
}

function addLine() {
  var l = { d: V('d1'), dose: selectedDose(), qty: parseInt(V('d3')), use: V('d4') };
  S.rr = V('rr');
  if (!S.rr) return (notify('e', 'Hãy chọn bệnh án trước khi thêm thuốc.'), R());
  if (!l.d || !l.dose || !(l.qty > 0))
    return (notify('e', 'Nhập đủ thuốc, liều dùng và số lượng (> 0).'), R());
  S.d.push(l);
  clearNotice();
  R();
}

function delLine(i) {
  S.rr = V('rr');
  S.d.splice(i, 1);
  R();
}

async function saveRx() {
  S.rr = V('rr');
  if (!S.rr) return (notify('e', 'Hãy chọn bệnh án.'), R());
  if (!S.d.length) return (notify('e', 'Đơn thuốc cần ít nhất một loại thuốc.'), R());
  try {
    var saved = await api('/api/prescriptions', {
      method: 'POST',
      body: JSON.stringify({ rid: S.rr, lines: S.d })
    });
    await loadData();
    go('rxv', saved.id);
    notify('k', 'Đã lưu đơn thuốc ' + saved.id + ' vào PostgreSQL.');
    R();
  } catch (err) {
    notify('e', err.message);
    R();
  }
}

