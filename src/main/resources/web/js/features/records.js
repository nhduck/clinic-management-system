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

function Q(v) {
  S.q = v;
  $('tb').innerHTML = recRows();
}

function recRows() {
  var q = S.q.toLowerCase();
  var a = S.recs.filter(function (r) {
    var p = pt(r.pid);
    return !q || (r.id + p.n + r.dx).toLowerCase().indexOf(q) >= 0;
  });
  return a.length
    ? a
        .map(function (r) {
          return (
            '<tr><td>' +
            r.id +
            '</td><td>' +
            e(pt(r.pid).n) +
            '</td><td>' +
            fd(r.date) +
            '</td><td>' +
            e(r.dx) +
            '</td><td>' +
            (rxOf(r.id) ? '<span class="tag">Đã kê đơn</span>' : 'Chưa có') +
            '</td><td><button class="btn s" onclick="go(\'det\',\'' +
            r.id +
            '\')">Xem</button></td></tr>'
          );
        })
        .join('')
    : '<tr><td colspan="6">Không tìm thấy bệnh án.</td></tr>';
}

function recV() {
  return (
    '<h2>Danh sách bệnh án</h2><div class="top"><input placeholder="Tìm theo mã, tên bệnh nhân, chẩn đoán..." oninput="Q(this.value)"><button class="btn" onclick="go(\'new\')">+ Lập bệnh án</button></div><div class="tw"><table><tr><th>Mã</th><th>Bệnh nhân</th><th>Ngày khám</th><th>Chẩn đoán</th><th>Đơn thuốc</th><th></th></tr><tbody id="tb">' +
    recRows() +
    '</tbody></table></div>'
  );
}

function detV() {
  var r = rc(S.sel),
    p = pt(r.pid),
    x = rxOf(r.id),
    h = S.recs.filter(function (y) {
      return y.pid == r.pid && y.id != r.id;
    });
  return (
    '<h2>Chi tiết bệnh án ' +
    r.id +
    '</h2><div class="panel"><div class="kv"><span>Bệnh nhân</span><span>' +
    e(p.n) +
    ' (' +
    p.id +
    ', ' +
    p.g +
    ', ' +
    fd(p.dob) +
    ')</span><span>Ngày khám</span><span>' +
    fd(r.date) +
    '</span><span>Triệu chứng</span><span>' +
    e(r.sym) +
    '</span><span>Chẩn đoán</span><span><b>' +
    e(r.dx) +
    '</b></span><span>Ghi chú</span><span>' +
    e(r.note || '—') +
    '</span></div></div><h3>Đơn thuốc</h3>' +
    (x
      ? '<p>Mã ' + x.id + ' · ' + fd(x.date) + '</p>' + linesT(x.lines)
      : '<p>Chưa kê đơn cho bệnh án này.</p>') +
    '<h3>Lịch sử khám của bệnh nhân</h3>' +
    (h.length
      ? '<div class="tw"><table><tr><th>Mã</th><th>Ngày</th><th>Chẩn đoán</th><th></th></tr>' +
        h
          .map(function (y) {
            return (
              '<tr><td>' +
              y.id +
              '</td><td>' +
              fd(y.date) +
              '</td><td>' +
              e(y.dx) +
              '</td><td><button class="btn s" onclick="go(\'det\',\'' +
              y.id +
              '\')">Xem</button></td></tr>'
            );
          })
          .join('') +
        '</table></div>'
      : '<p>Chưa có lần khám trước.</p>') +
    '<div class="bar">' +
    (x
      ? ''
      : '<button class="btn" onclick="go(\'rxn\');S.rr=\'' + r.id + '\';R()">Kê đơn</button>') +
    '<button class="btn o" onclick="go(\'rec\')">Quay lại</button></div>'
  );
}

function newV() {
  return (
    '<h2>Lập bệnh án</h2><div class="panel"><div class="row"><div><label>Bệnh nhân</label><select id="f1" required><option value="" disabled hidden selected>Chọn bệnh nhân</option>' +
    S.pts
      .map(function (p) {
        return '<option value="' + p.id + '">' + p.id + ' – ' + e(p.n) + '</option>';
      })
      .join('') +
    '</select></div><div><label>Ngày khám</label><input id="f2" type="date" value="' +
    today() +
    '"></div></div><label>Triệu chứng</label><textarea id="f3" rows="3"></textarea><label>Chẩn đoán</label><input id="f4"><label>Ghi chú / lời dặn</label><textarea id="f5" rows="2"></textarea><div class="bar"><button class="btn" onclick="saveRec()">Lưu bệnh án</button><button class="btn o" onclick="go(\'rec\')">Hủy</button></div></div>'
  );
}
