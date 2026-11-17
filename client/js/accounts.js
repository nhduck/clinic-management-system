function renderAccounts() {
    fillRows("accounts-body", S.users, (x) => [x.u, x.n, x.r, "Demo"]);
}
