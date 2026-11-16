function today() {
  var d = new Date();
  return (
    d.getFullYear() +
    '-' +
    String(d.getMonth() + 1).padStart(2, '0') +
    '-' +
    String(d.getDate()).padStart(2, '0')
  );
}

var $ = function (i) {
    return document.getElementById(i);
  },
  V = function (i) {
    var x = $(i);
    return x ? x.value.trim() : '';
  };

function e(s) {
  return String(s).replace(/[&<>"]/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
  });
}

function fd(s) {
  if (!s) return '—';
  var a = s.split('-');
  return a.length === 3 ? a[2] + '/' + a[1] + '/' + a[0] : s;
}

function pt(id) {
  return S.pts.filter(function (x) {
    return x.id == id;
  })[0];
}

function rc(id) {
  return S.recs.filter(function (x) {
    return x.id == id;
  })[0];
}

function rxOf(rid) {
  return S.rx.filter(function (x) {
    return x.rid == rid;
  })[0];
}

function pad(n, k) {
  return k + String(n + 1).padStart(3, '0');
}

function nextDemoId(prefix, items) {
  var n = 1;
  while (items.some((x) => x.id === prefix + String(n).padStart(3, '0'))) n++;
  return prefix + String(n).padStart(3, '0');
}

function formValue(id) {
  return V(id);
}
