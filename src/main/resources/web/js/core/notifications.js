// Moi thong bao tu dong an sau 7 giay, thong bao moi se dat lai dong ho.
var messageTimeout = null;

function notify(type, message) {
  if (messageTimeout !== null) clearTimeout(messageTimeout);
  S.msg = [type, message];
  messageTimeout = setTimeout(function () {
    S.msg = null;
    messageTimeout = null;
    var el = document.getElementById('notice');
    if (el) { el.hidden = true; el.textContent = ''; }
    var authEl = document.getElementById('auth-notice');
    if (authEl) { authEl.hidden = true; authEl.textContent = ''; }
  }, 7000);
}

function clearNotice() {
  if (messageTimeout !== null) clearTimeout(messageTimeout);
  messageTimeout = null;
  S.msg = null;
  for (const id of ['notice', 'auth-notice']) {
    const el = document.getElementById(id);
    if (el) { el.hidden = true; el.textContent = ''; }
  }
}

