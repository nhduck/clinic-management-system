// accounts: logic tương tác và hiển thị dữ liệu động.


function renderAccounts() { fillRows('accounts-body', S.users, x => [x.u, x.n, x.r, 'Demo']); }
