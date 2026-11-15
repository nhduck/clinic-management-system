function accountsV() {
  return (
    '<h2>Tài khoản người dùng (demo)</h2><p class="drug-note">Đây là danh sách tài khoản hardcode phía frontend, KHÔNG phải phân quyền hay xác thực an toàn.</p><div class="tw"><table><tr><th>Tài khoản</th><th>Tên hiển thị</th><th>Vai trò</th><th>Trạng thái</th></tr>' +
    S.users
      .map(
        (u) =>
          '<tr><td>' +
          e(u.u) +
          '</td><td>' +
          e(u.n) +
          '</td><td>' +
          e(u.r) +
          '</td><td><span class="tag">Demo</span></td></tr>'
      )
      .join('') +
    '</table></div><div class="panel"><h3>Hướng tích hợp</h3><p>Đức phụ trách đăng nhập / tài khoản thực tế. Sau khi nhận backend xác thực, thay danh sách demo và kiểm tra quyền ở Java Servlet.</p></div>'
  );
}
