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

function linesT(l) {
  return (
    '<div class="tw"><table><tr><th>#</th><th>Thuốc</th><th>Liều dùng</th><th>SL</th><th>Cách dùng</th></tr>' +
    l
      .map(function (x, i) {
        return (
          '<tr><td>' +
          (i + 1) +
          '</td><td>' +
          e(x.d) +
          '</td><td>' +
          e(x.dose) +
          '</td><td>' +
          x.qty +
          '</td><td>' +
          e(x.use) +
          '</td></tr>'
        );
      })
      .join('') +
    '</table></div>'
  );
}

function rxnV() {
  var a = S.recs.filter(function (r) {
      return !rxOf(r.id);
    }),
    c = S.rr && rc(S.rr);
  return (
    '<h2>Kê đơn thuốc</h2><div class="panel"><label>Bệnh án (chưa có đơn)</label><select id="rr" required onchange="S.rr=this.value;R()"><option value="" disabled hidden' +
    (!S.rr ? ' selected' : '') +
    '>Chọn bệnh án</option>' +
    a
      .map(function (r) {
        return (
          '<option value="' +
          r.id +
          '"' +
          (S.rr == r.id ? ' selected' : '') +
          '>' +
          r.id +
          ' – ' +
          e(pt(r.pid).n) +
          ' – ' +
          e(r.dx) +
          '</option>'
        );
      })
      .join('') +
    '</select>' +
    (c
      ? '<p style="margin:8px 0 0;color:var(--mu)">Chẩn đoán: <b>' +
        e(c.dx) +
        '</b> · ' +
        fd(c.date) +
        '</p>'
      : '') +
    '<h3>Thêm thuốc</h3><div class="row"><div><label>Thuốc</label><select id="d1" required><option value="" disabled hidden selected>Chọn thuốc</option>' +
    S.drugs
      .map(function (d) {
        return '<option>' + d + '</option>';
      })
      .join('') +
    '</select></div><div><label>Cách dùng</label><select id="d4" required><option value="" disabled hidden selected>Chọn cách dùng</option><option>Sau ăn</option><option>Trước ăn</option><option>Trong bữa ăn</option><option>Trước khi ngủ</option></select></div><div><label>Liều dùng</label><select id="d2select" required onchange="toggleCustomDose()"><option value="" disabled hidden selected>Chọn liều dùng</option><option value="1 viên/ngày">1 viên/ngày</option><option value="2 viên/ngày">2 viên/ngày</option><option value="3 viên/ngày">3 viên/ngày</option><option value="1 viên/lần, 2 lần/ngày">1 viên/lần, 2 lần/ngày</option><option value="1 viên/lần, 3 lần/ngày">1 viên/lần, 3 lần/ngày</option><option value="custom">Tự nhập...</option></select><div id="dose-custom" hidden><label for="d2manual">Nhập liều dùng khác</label><input id="d2manual" placeholder="Ví dụ: 1/2 viên/lần, 2 lần/ngày"></div></div><div><label>Số lượng</label><input id="d3" type="number" min="1" value="10"></div></div><div class="bar"><button class="btn o" onclick="addLine()">+ Thêm vào đơn</button></div></div>' +
    '<h3>Các thuốc trong đơn (' +
    S.d.length +
    ')</h3>' +
    (S.d.length
      ? '<div class="tw"><table><tr><th>#</th><th>Thuốc</th><th>Liều dùng</th><th>SL</th><th>Cách dùng</th><th></th></tr>' +
        S.d
          .map(function (x, i) {
            return (
              '<tr><td>' +
              (i + 1) +
              '</td><td>' +
              e(x.d) +
              '</td><td>' +
              e(x.dose) +
              '</td><td>' +
              x.qty +
              '</td><td>' +
              e(x.use) +
              '</td><td><button class="btn o s" onclick="delLine(' +
              i +
              ')">Xóa</button></td></tr>'
            );
          })
          .join('') +
        '</table></div>'
      : '<p>Chưa có thuốc nào.</p>') +
    '<div class="bar"><button class="btn" onclick="saveRx()">Lưu đơn thuốc</button><button class="btn o" onclick="go(\'home\')">Hủy</button></div>'
  );
}

function rxlV() {
  return (
    '<h2>Đơn thuốc</h2><div class="tw"><table><tr><th>Mã đơn</th><th>Bệnh án</th><th>Bệnh nhân</th><th>Ngày</th><th>Số thuốc</th><th></th></tr>' +
    S.rx
      .map(function (x) {
        return (
          '<tr><td>' +
          x.id +
          '</td><td>' +
          x.rid +
          '</td><td>' +
          e(pt(rc(x.rid).pid).n) +
          '</td><td>' +
          fd(x.date) +
          '</td><td>' +
          x.lines.length +
          '</td><td><button class="btn s" onclick="go(\'rxv\',\'' +
          x.id +
          '\')">Xem</button></td></tr>'
        );
      })
      .join('') +
    '</table></div>'
  );
}

function rxvV() {
  var x = S.rx.filter(function (y) {
      return y.id == S.sel;
    })[0],
    r = rc(x.rid);
  return (
    '<h2>Đơn thuốc ' +
    x.id +
    '</h2><div class="panel"><div class="kv"><span>Bệnh nhân</span><span>' +
    e(pt(r.pid).n) +
    '</span><span>Bệnh án</span><span>' +
    r.id +
    ' – ' +
    e(r.dx) +
    '</span><span>Ngày kê</span><span>' +
    fd(x.date) +
    '</span></div></div><h3>Danh sách thuốc</h3>' +
    linesT(x.lines) +
    '<div class="bar"><button class="btn o" onclick="go(\'rxl\')">Quay lại</button></div>'
  );
}
