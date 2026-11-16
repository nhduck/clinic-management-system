// Chuyển trang và kiểm tra vai trò demo (không thay thế phân quyền backend).
var NAV_DOCTOR = [['home','Trang chủ'],['rec','Danh sách bệnh án'],['new','Lập bệnh án'],['rxn','Kê đơn thuốc'],['rxl','Đơn thuốc'],['drugs','Quản lý thuốc']];
var NAV_RECEPTION = [['home','Trang chủ'],['patients','Quản lý bệnh nhân'],['appointments','Lịch khám']];
var NAV_ADMIN = [['home','Trang chủ'],['doctors','Quản lý bác sĩ'],['specialties','Chuyên khoa'],['accounts','Tài khoản (demo)']];
function currentNav() { return S.me.r === 'Quản trị' ? NAV_ADMIN : S.me.r === 'Lễ tân' ? NAV_RECEPTION : NAV_DOCTOR; }
function allowedPages() { return currentNav().map(x => x[0]).concat(S.me.r === 'Bác sĩ' ? ['det','rxv'] : []); }
function go(v, s) {
  if (S.me && !allowedPages().includes(v)) { notify('e','Màn hình không thuộc vai trò demo hiện tại.'); return R(); }
  if (v === 'appointments' && S.v !== 'appointments') resetAppointmentForm();
  S.v=v; S.sel=s || null; clearNotice(); S.d=[]; S.rr=''; S.q=''; R();
}
