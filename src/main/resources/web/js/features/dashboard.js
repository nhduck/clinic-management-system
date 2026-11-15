function homeV() {
  if (S.me.r === 'Lễ tân') return receptionHome();
  if (S.me.r === 'Quản trị') return adminHome();
  return (
    '<h2>Trang chủ</h2><div class="grid"><div class="card"><div class="n">' +
    S.recs.length +
    '</div>Bệnh án</div><div class="card"><div class="n">' +
    S.rx.length +
    '</div>Đơn thuốc</div><div class="card"><div class="n">' +
    S.pts.length +
    '</div>Bệnh nhân</div><div class="card"><div class="n">' +
    S.drugs.length +
    '</div>Danh mục thuốc</div></div><div class="panel"><b>Thao tác nhanh</b><div class="bar"><button class="btn" onclick="go(\'new\')">Lập bệnh án mới</button><button class="btn" onclick="go(\'rxn\')">Kê đơn thuốc</button><button class="btn o" onclick="go(\'rec\')">Tra cứu lịch sử khám</button></div></div>'
  );
}

function receptionHome() {
  return (
    '<h2>Tổng quan Lễ tân</h2><div class="grid"><div class="card"><div class="n">' +
    allPatients().length +
    '</div>Bệnh nhân</div><div class="card"><div class="n">' +
    S.appointments.length +
    '</div>Lịch khám</div><div class="card"><div class="n">' +
    S.appointments.filter((x) => x.status === 'Chờ khám').length +
    '</div>Lịch đang đặt</div></div><div class="panel"><b>Thao tác nhanh</b><div class="bar"><button class="btn" onclick="go(\'patients\')">Quản lý bệnh nhân</button><button class="btn o" onclick="go(\'appointments\')">Đặt lịch khám</button></div></div>'
  );
}

function adminHome() {
  return (
    '<h2>Tổng quan Quản trị</h2><div class="grid"><div class="card"><div class="n">' +
    S.doctors.length +
    '</div>Bác sĩ demo</div><div class="card"><div class="n">' +
    S.specialties.length +
    '</div>Chuyên khoa demo</div><div class="card"><div class="n">' +
    S.users.length +
    '</div>Tài khoản demo</div></div><div class="panel"><b>Thao tác nhanh</b><div class="bar"><button class="btn" onclick="go(\'doctors\')">Quản lý bác sĩ</button><button class="btn o" onclick="go(\'accounts\')">Quản lý tài khoản</button></div></div>'
  );
}
