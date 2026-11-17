function uiIcon(name) {
  const paths = {
    home: 'M3 10 12 3l9 7M5 9v11h5v-6h4v6h5V9',
    patients: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M17 4a4 4 0 0 1 0 7M22 21v-2a4 4 0 0 0-3-3.9',
    appointments: 'M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14H3V6a2 2 0 0 1 2-2M8 14h2M14 14h2M8 18h2',
    rec: 'M14 2H5v20h14V7zM14 2v6h5M8 12h8M8 16h8',
    new: 'M14 2H5v20h14V7zM14 2v6h5M12 12v6M9 15h6',
    rxn: 'M5 3h14v18H5zM9 8h6M12 5v6M8 15h8M8 18h5',
    rxl: 'M5 3h14v18H5zM8 8h8M8 12h8M8 16h5',
    drugs: 'm9 15 6-6M6 18a5 5 0 0 1 0-7l5-5a5 5 0 0 1 7 7l-5 5a5 5 0 0 1-7 0z',
    doctors: 'M6 3v5a6 6 0 0 0 12 0V3M4 3h4M16 3h4M12 14v2a5 5 0 0 0 10 0v-3M20 11h4',
    specialties: 'M9 3h6v6h6v6h-6v6H9v-6H3V9h6z',
    accounts: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8M4 21v-2a6 6 0 0 1 6-5h4a6 6 0 0 1 6 5v2',
  };
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  Object.entries({ viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '1.7', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'aria-hidden': 'true' }).forEach(([key, value]) => svg.setAttribute(key, value));
  const path = document.createElementNS(svg.namespaceURI, 'path');
  path.setAttribute('d', paths[name === 'myappts' ? 'appointments' : name] || paths.home);
  svg.append(path);
  return svg;
}
function closeMenu() {
  document.body.classList.remove('menu-open');
  $('menu-toggle').setAttribute('aria-expanded', 'false');
  $('menu-toggle').setAttribute('aria-label', 'Mở menu');
  $('menu-backdrop').hidden = true;
}
function labelControls() {
  document.querySelectorAll('label:not([for])').forEach((label) => {
    const next = label.nextElementSibling;
    if (next?.matches('input, select, textarea') && next.id) label.htmlFor = next.id;
  });
}
function initUI() {
  labelControls();
  $('menu-toggle').addEventListener('click', () => {
    const open = !document.body.classList.contains('menu-open');
    document.body.classList.toggle('menu-open', open);
    $('menu-toggle').setAttribute('aria-expanded', String(open));
    $('menu-toggle').setAttribute('aria-label', open ? 'Đóng menu' : 'Mở menu');
    $('menu-backdrop').hidden = !open;
    if (open) $('main-nav').querySelector('a')?.focus();
  });
  $('menu-backdrop').addEventListener('click', closeMenu);
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && document.body.classList.contains('menu-open')) {
      closeMenu();
      $('menu-toggle').focus();
    }
  });
  matchMedia('(min-width: 768px)').addEventListener('change', closeMenu);
  $('logout-btn').addEventListener('click', closeMenu);
  ['u', 'p', 'p2'].forEach((id) => $(id).addEventListener('keydown', (event) => {
    if (event.key === 'Enter') $('auth-submit').click();
  }));
}
