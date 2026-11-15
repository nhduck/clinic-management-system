// Moi thong bao tu dong an sau 7 giay, thong bao moi se dat lai dong ho.
var messageTimeout = null;

function notify(type, message) {
  if (messageTimeout !== null) clearTimeout(messageTimeout);
  S.msg = [type, message];
  messageTimeout = setTimeout(function () {
    S.msg = null;
    messageTimeout = null;
    var el = document.getElementById('notice');
    if (el) el.remove();
  }, 7000);
}

function clearNotice() {
  if (messageTimeout !== null) clearTimeout(messageTimeout);
  messageTimeout = null;
  S.msg = null;
}

function M() {
  return S.msg
    ? '<div id="notice" role="alert" aria-live="polite" class="msg ' +
        S.msg[0] +
        '">' +
        e(S.msg[1]) +
        '</div>'
    : '';
}
