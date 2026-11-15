// Frontend từ prototype, đã nối API Java Servlet.
var S = {
  tab: 'in',
  msg: null,
  me: null,
  v: 'home',
  q: '',
  sel: null,
  rr: '',
  d: [],
  users: [
    { u: 'bacsi', p: '123456', n: 'BS. Nguyễn Văn An', r: 'Bác sĩ' },
    { u: 'letan', p: '123456', n: 'Lễ tân demo', r: 'Lễ tân' },
    { u: 'admin', p: '123456', n: 'Quản trị demo', r: 'Quản trị' }
  ],
  pts: [],
  drugs: [],
  drugItems: [],
  recs: [],
  rx: [],
  uiPatients: [],
  appointments: [],
  shifts: [],
  slots: [],
  af: { pid: '', shift: '', time: '', reason: '' },
  doctors: [
    { id: 'BS001', n: 'BS. Nguyễn Văn An', specialty: 'Nội tổng quát', phone: '0900000000' }
  ],
  specialties: ['Nội tổng quát', 'Nhi khoa', 'Da liễu'],
  uiAccounts: [],
  editPatient: null,
  editAppointment: null,
  editDoctor: null,
  editAccount: null
};
