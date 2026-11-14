// Frontend từ prototype, đã nối API Java Servlet.
var S={tab:'in',msg:null,me:null,v:'home',q:'',sel:null,rr:'',d:[],
users:[{u:'bacsi',p:'123456',n:'BS. Nguyễn Văn An',r:'Bác sĩ'},{u:'letan',p:'123456',n:'Lễ tân demo',r:'Lễ tân'},{u:'admin',p:'123456',n:'Quản trị demo',r:'Quản trị'}],
pts:[],drugs:[],drugItems:[],recs:[],rx:[],
uiPatients:[],appointments:[],doctors:[{id:'BS001',n:'BS. Nguyễn Văn An',specialty:'Nội tổng quát',phone:'0900000000'}],specialties:['Nội tổng quát','Nhi khoa','Da liễu'],uiAccounts:[],editPatient:null,editAppointment:null,editDoctor:null,editAccount:null};
// Bệnh án/đơn thuốc/bệnh nhân được lấy từ PostgreSQL.
// Đăng nhập ở đây là tài khoản DEMO phía frontend, không bảo mật.
async function api(url, options){
  var res=await fetch(url, Object.assign({headers:{'Content-Type':'application/json'}}, options||{}));
  var data=await res.json();
  if(!res.ok) throw new Error(data.error||'Lỗi máy chủ '+res.status);
  return data;
}
async function loadData(){
  var data=await api('/api/data');
  S.pts=data.pts;S.drugs=data.drugs;S.drugItems=data.drugItems||[];S.recs=data.recs;S.rx=data.rx;
}
function today(){var d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')}
var $=function(i){return document.getElementById(i)},V=function(i){var x=$(i);return x?x.value.trim():''};
function e(s){return String(s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function fd(s){if(!s)return '—';var a=s.split('-');return a.length===3?a[2]+'/'+a[1]+'/'+a[0]:s}
function pt(id){return S.pts.filter(function(x){return x.id==id})[0]}
function rc(id){return S.recs.filter(function(x){return x.id==id})[0]}
function rxOf(rid){return S.rx.filter(function(x){return x.rid==rid})[0]}
function pad(n,k){return k+String(n+1).padStart(3,'0')}
// Moi thong bao tu dong an sau 7 giay, thong bao moi se dat lai dong ho.
var messageTimeout=null;
function notify(type, message){
  if(messageTimeout!==null) clearTimeout(messageTimeout);
  S.msg=[type,message];
  messageTimeout=setTimeout(function(){
    S.msg=null;
    messageTimeout=null;
    var el=document.getElementById('notice');
    if(el) el.remove();
  },7000);
}
function clearNotice(){
  if(messageTimeout!==null) clearTimeout(messageTimeout);
  messageTimeout=null;
  S.msg=null;
}
function M(){return S.msg?'<div id="notice" role="alert" aria-live="polite" class="msg '+S.msg[0]+'">'+e(S.msg[1])+'</div>':''}
function go(v,s){if(S.me && !allowedPages().includes(v)){notify('e','Màn hình không thuộc vai trò demo hiện tại.');R();return;}S.v=v;S.sel=s||null;clearNotice();S.d=[];S.rr='';S.q='';R()}
function T(t){S.tab=t;clearNotice();R()}
async function login(){var u=V('u'),p=$('p').value,f=S.users.filter(function(x){return x.u==u&&x.p==p})[0];
if(!u||!p){notify('e','Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu.');return R()}
if(!f){notify('e','Sai tên đăng nhập hoặc mật khẩu.');return R()}
S.me=f;S.v='home';clearNotice();try{await loadData();R()}catch(err){S.me=null;notify('e','Không kết nối được PostgreSQL/API: '+err.message);R()}}
function reg(){var n=V('n'),r=V('r'),u=V('u'),p=$('p').value,p2=$('p2').value;
if(!n||!u||!p||!p2)return notify('e','Vui lòng điền đầy đủ thông tin.'),R();
if(u.length<4)return notify('e','Tên đăng nhập tối thiểu 4 ký tự.'),R();
if(p.length<6)return notify('e','Mật khẩu tối thiểu 6 ký tự.'),R();
if(p!=p2)return notify('e','Mật khẩu nhập lại không khớp.'),R();
if(S.users.some(function(x){return x.u==u}))return notify('e','Tên đăng nhập đã tồn tại.'),R();
S.users.push({u:u,p:p,n:n,r:r});S.tab='in';notify('k','Đăng ký thành công! Hãy đăng nhập.');R()}
function logout(){S.me=null;S.tab='in';clearNotice();R()}
async function saveRec(){
  var o={pid:V('f1'),date:V('f2'),sym:V('f3'),dx:V('f4'),note:V('f5')};
  if(!o.pid||!o.date||!o.sym||!o.dx){notify('e','Cần chọn bệnh nhân, ngày khám, triệu chứng và chẩn đoán.');return R()}
  try{
    var saved=await api('/api/records',{method:'POST',body:JSON.stringify(o)});
    await loadData();go('det',saved.id);notify('k','Đã lưu bệnh án '+saved.id+' vào PostgreSQL.');R();
  }catch(err){notify('e',err.message);R()}
}
function selectedDose(){
  var choice=V('d2select');
  return choice==='custom'?V('d2manual'):choice;
}
function toggleCustomDose(){
  var box=$('dose-custom');
  if(box) box.hidden=V('d2select')!=='custom';
  if(!box.hidden) $('d2manual').focus();
}
function addLine(){var l={d:V('d1'),dose:selectedDose(),qty:parseInt(V('d3')),use:V('d4')};
S.rr=V('rr');
if(!S.rr)return notify('e','Hãy chọn bệnh án trước khi thêm thuốc.'),R();
if(!l.d||!l.dose||!(l.qty>0))return notify('e','Nhập đủ thuốc, liều dùng và số lượng (> 0).'),R();
S.d.push(l);clearNotice();R()}
function delLine(i){S.rr=V('rr');S.d.splice(i,1);R()}
async function saveRx(){
  S.rr=V('rr');
  if(!S.rr)return notify('e','Hãy chọn bệnh án.'),R();
  if(!S.d.length)return notify('e','Đơn thuốc cần ít nhất một loại thuốc.'),R();
  try{
    var saved=await api('/api/prescriptions',{method:'POST',body:JSON.stringify({rid:S.rr,lines:S.d})});
    await loadData();go('rxv',saved.id);notify('k','Đã lưu đơn thuốc '+saved.id+' vào PostgreSQL.');R();
  }catch(err){notify('e',err.message);R()}
}
async function saveDrug(){
  var id=V('drug-id'), name=V('drug-name');
  if(!name){notify('e','Vui lòng nhập tên thuốc.');return R()}
  try{
    await api(id?'/api/drugs/'+id:'/api/drugs', {method:id?'PUT':'POST',body:JSON.stringify({name:name})});
    await loadData();go('drugs');notify('k',id?'Đã cập nhật thuốc.':'Đã thêm thuốc.');R();
  }catch(err){notify('e',err.message);R()}
}
function editDrug(id){
  var item=S.drugItems.find(x=>x.id===id);
  if(!item)return;
  $('drug-id').value=item.id;
  $('drug-name').value=item.name;
  $('drug-submit').textContent='Lưu thay đổi';
  $('drug-cancel').hidden=false;
  $('drug-name').focus();
}
function cancelDrug(){
  $('drug-id').value='';$('drug-name').value='';
  $('drug-submit').textContent='Thêm thuốc';$('drug-cancel').hidden=true;
}
async function removeDrug(id){
  var item=S.drugItems.find(x=>x.id===id);
  if(!item||!confirm('Xóa thuốc "'+item.name+'" khỏi danh mục? Đơn thuốc đã lưu vẫn giữ nguyên tên cũ.'))return;
  try{
    await api('/api/drugs/'+id,{method:'DELETE'});
    await loadData();go('drugs');notify('k','Đã xóa thuốc khỏi danh mục.');R();
  }catch(err){notify('e',err.message);R()}
}
function drugV(){
  return '<h2>Quản lý danh mục thuốc</h2>'+
  '<div class="panel"><h3>Thêm / sửa thuốc</h3><input type="hidden" id="drug-id">'+
  '<label for="drug-name">Tên thuốc</label><input id="drug-name" maxlength="100" placeholder="Ví dụ: Paracetamol 500mg">'+
  '<div class="bar"><button id="drug-submit" class="btn" onclick="saveDrug()">Thêm thuốc</button>'+
  '<button id="drug-cancel" hidden class="btn o" onclick="cancelDrug()">Hủy sửa</button></div></div>'+
  '<h3>Danh sách thuốc ('+S.drugItems.length+')</h3>'+
  '<p class="drug-note">Xóa / đổi tên trong danh mục không làm thay đổi đơn thuốc cũ đã lưu.</p>'+
  '<div class="tw"><table><tr><th>Mã</th><th>Tên thuốc</th><th>Thao tác</th></tr>'+
  (S.drugItems.length?S.drugItems.map(function(x){return '<tr><td>T'+String(x.id).padStart(3,'0')+'</td><td>'+e(x.name)+'</td><td><div class="bar action-bar"><button class="btn o s" onclick="editDrug('+x.id+')">Sửa</button><button class="btn o s" onclick="removeDrug('+x.id+')">Xóa</button></div></td></tr>'}).join(''):'<tr><td colspan="3">Chưa có thuốc nào.</td></tr>')+
  '</table></div>';
}
function Q(v){S.q=v;$('tb').innerHTML=recRows()}
function authV(){var i=S.tab=='in';
return '<div class="auth"><div class="box"><div class="brand">PHÒNG KHÁM<small>Hệ thống quản lý bệnh án và kê đơn</small></div>'+
'<div class="tabs"><button class="'+(i?'on':'')+'" onclick="T(\'in\')">Đăng nhập</button><button class="'+(i?'':'on')+'" onclick="T(\'up\')">Đăng ký</button></div>'+
(i?'':'<label>Họ và tên</label><input id="n" placeholder="Nguyễn Văn A"><label>Vai trò</label><select id="r"><option>Bác sĩ</option><option>Lễ tân</option><option>Quản trị</option></select>')+
'<label>Tên đăng nhập</label><input id="u" placeholder="bacsi" autocomplete="username"><label>Mật khẩu</label><input id="p" type="password" placeholder="Tối thiểu 6 ký tự">'+
(i?'':'<label>Nhập lại mật khẩu</label><input id="p2" type="password">')+M()+
'<div class="bar"><button class="btn" style="flex:1" onclick="'+(i?'login()':'reg()')+'">'+(i?'Đăng nhập':'Tạo tài khoản')+'</button></div>'+
(i?'<p style="font-size:12px;color:var(--mu)">Tài khoản demo (chưa có xác thực backend): <b>bacsi</b>, <b>letan</b>, <b>admin</b> / <b>123456</b></p>':'')+'</div></div>'}
var NAV_DOCTOR=[['home','Trang chủ'],['rec','Danh sách bệnh án'],['new','Lập bệnh án'],['rxn','Kê đơn thuốc'],['rxl','Đơn thuốc'],['drugs','Quản lý thuốc']];
var NAV_RECEPTION=[['home','Trang chủ'],['patients','Quản lý bệnh nhân'],['appointments','Lịch khám']];
var NAV_ADMIN=[['home','Trang chủ'],['doctors','Quản lý bác sĩ'],['specialties','Chuyên khoa'],['accounts','Tài khoản (demo)']];
function currentNav(){return S.me.r==='Quản trị'?NAV_ADMIN:S.me.r==='Lễ tân'?NAV_RECEPTION:NAV_DOCTOR}
function allowedPages(){return currentNav().map(x=>x[0]).concat(S.me.r==='Bác sĩ'?['det','rxv']:[])}
function demoWarning(){return '<div class="demo-note"><b>Giao diện demo:</b> Các thao tác của Lễ tân / Admin chỉ lưu trong bộ nhớ trình duyệt đang mở. Chưa kết nối API, chưa có phân quyền backend. Không nhập dữ liệu thật.</div>'}
function shell(c){var cur=S.v==='det'?'rec':S.v==='rxv'?'rxl':S.v;
return '<div class="shell"><aside><div class="brand">PHÒNG KHÁM<small>Menu chính · '+e(S.me.r)+'</small></div>'+currentNav().map(function(n){return '<a class="'+(cur===n[0]?'on':'')+'" onclick="go(\''+n[0]+'\')">'+n[1]+'</a>'}).join('')+'</aside><main><header><span>Xin chào, <b>'+e(S.me.n)+'</b> · '+e(S.me.r)+'</span><button class="btn o s" onclick="logout()">Đăng xuất</button></header><div class="pg">'+M()+(S.me.r==='Bác sĩ'?'':demoWarning())+c+'</div></main></div>'}
function homeV(){if(S.me.r==='Lễ tân')return receptionHome();if(S.me.r==='Quản trị')return adminHome();return '<h2>Trang chủ</h2><div class="grid"><div class="card"><div class="n">'+S.recs.length+'</div>Bệnh án</div><div class="card"><div class="n">'+S.rx.length+'</div>Đơn thuốc</div><div class="card"><div class="n">'+S.pts.length+'</div>Bệnh nhân</div><div class="card"><div class="n">'+S.drugs.length+'</div>Danh mục thuốc</div></div><div class="panel"><b>Thao tác nhanh</b><div class="bar"><button class="btn" onclick="go(\'new\')">Lập bệnh án mới</button><button class="btn" onclick="go(\'rxn\')">Kê đơn thuốc</button><button class="btn o" onclick="go(\'rec\')">Tra cứu lịch sử khám</button></div></div>'}
function recRows(){var q=S.q.toLowerCase();var a=S.recs.filter(function(r){var p=pt(r.pid);return !q||(r.id+p.n+r.dx).toLowerCase().indexOf(q)>=0});
return a.length?a.map(function(r){return '<tr><td>'+r.id+'</td><td>'+e(pt(r.pid).n)+'</td><td>'+fd(r.date)+'</td><td>'+e(r.dx)+'</td><td>'+(rxOf(r.id)?'<span class="tag">Đã kê đơn</span>':'Chưa có')+'</td><td><button class="btn s" onclick="go(\'det\',\''+r.id+'\')">Xem</button></td></tr>'}).join(''):'<tr><td colspan="6">Không tìm thấy bệnh án.</td></tr>'}
function recV(){return '<h2>Danh sách bệnh án</h2><div class="top"><input placeholder="Tìm theo mã, tên bệnh nhân, chẩn đoán..." oninput="Q(this.value)"><button class="btn" onclick="go(\'new\')">+ Lập bệnh án</button></div><div class="tw"><table><tr><th>Mã</th><th>Bệnh nhân</th><th>Ngày khám</th><th>Chẩn đoán</th><th>Đơn thuốc</th><th></th></tr><tbody id="tb">'+recRows()+'</tbody></table></div>'}
function linesT(l){return '<div class="tw"><table><tr><th>#</th><th>Thuốc</th><th>Liều dùng</th><th>SL</th><th>Cách dùng</th></tr>'+l.map(function(x,i){return '<tr><td>'+(i+1)+'</td><td>'+e(x.d)+'</td><td>'+e(x.dose)+'</td><td>'+x.qty+'</td><td>'+e(x.use)+'</td></tr>'}).join('')+'</table></div>'}
function detV(){var r=rc(S.sel),p=pt(r.pid),x=rxOf(r.id),h=S.recs.filter(function(y){return y.pid==r.pid&&y.id!=r.id});
return '<h2>Chi tiết bệnh án '+r.id+'</h2><div class="panel"><div class="kv"><span>Bệnh nhân</span><span>'+e(p.n)+' ('+p.id+', '+p.g+', '+fd(p.dob)+')</span><span>Ngày khám</span><span>'+fd(r.date)+'</span><span>Triệu chứng</span><span>'+e(r.sym)+'</span><span>Chẩn đoán</span><span><b>'+e(r.dx)+'</b></span><span>Ghi chú</span><span>'+e(r.note||'—')+'</span></div></div><h3>Đơn thuốc</h3>'+(x?'<p>Mã '+x.id+' · '+fd(x.date)+'</p>'+linesT(x.lines):'<p>Chưa kê đơn cho bệnh án này.</p>')+'<h3>Lịch sử khám của bệnh nhân</h3>'+(h.length?'<div class="tw"><table><tr><th>Mã</th><th>Ngày</th><th>Chẩn đoán</th><th></th></tr>'+h.map(function(y){return '<tr><td>'+y.id+'</td><td>'+fd(y.date)+'</td><td>'+e(y.dx)+'</td><td><button class="btn s" onclick="go(\'det\',\''+y.id+'\')">Xem</button></td></tr>'}).join('')+'</table></div>':'<p>Chưa có lần khám trước.</p>')+'<div class="bar">'+(x?'':'<button class="btn" onclick="go(\'rxn\');S.rr=\''+r.id+'\';R()">Kê đơn</button>')+'<button class="btn o" onclick="go(\'rec\')">Quay lại</button></div>'}
function newV(){return '<h2>Lập bệnh án</h2><div class="panel"><div class="row"><div><label>Bệnh nhân</label><select id="f1" required><option value="" disabled hidden selected>Chọn bệnh nhân</option>'+S.pts.map(function(p){return '<option value="'+p.id+'">'+p.id+' – '+e(p.n)+'</option>'}).join('')+'</select></div><div><label>Ngày khám</label><input id="f2" type="date" value="'+today()+'"></div></div><label>Triệu chứng</label><textarea id="f3" rows="3"></textarea><label>Chẩn đoán</label><input id="f4"><label>Ghi chú / lời dặn</label><textarea id="f5" rows="2"></textarea><div class="bar"><button class="btn" onclick="saveRec()">Lưu bệnh án</button><button class="btn o" onclick="go(\'rec\')">Hủy</button></div></div>'}
function rxnV(){var a=S.recs.filter(function(r){return !rxOf(r.id)}),c=S.rr&&rc(S.rr);
return '<h2>Kê đơn thuốc</h2><div class="panel"><label>Bệnh án (chưa có đơn)</label><select id="rr" required onchange="S.rr=this.value;R()"><option value="" disabled hidden' + (!S.rr?' selected':'') + '>Chọn bệnh án</option>'+a.map(function(r){return '<option value="'+r.id+'"'+(S.rr==r.id?' selected':'')+'>'+r.id+' – '+e(pt(r.pid).n)+' – '+e(r.dx)+'</option>'}).join('')+'</select>'+(c?'<p style="margin:8px 0 0;color:var(--mu)">Chẩn đoán: <b>'+e(c.dx)+'</b> · '+fd(c.date)+'</p>':'')+
'<h3>Thêm thuốc</h3><div class="row"><div><label>Thuốc</label><select id="d1" required><option value="" disabled hidden selected>Chọn thuốc</option>'+S.drugs.map(function(d){return '<option>'+d+'</option>'}).join('')+'</select></div><div><label>Cách dùng</label><select id="d4" required><option value="" disabled hidden selected>Chọn cách dùng</option><option>Sau ăn</option><option>Trước ăn</option><option>Trong bữa ăn</option><option>Trước khi ngủ</option></select></div><div><label>Liều dùng</label><select id="d2select" required onchange="toggleCustomDose()"><option value="" disabled hidden selected>Chọn liều dùng</option><option value="1 viên/ngày">1 viên/ngày</option><option value="2 viên/ngày">2 viên/ngày</option><option value="3 viên/ngày">3 viên/ngày</option><option value="1 viên/lần, 2 lần/ngày">1 viên/lần, 2 lần/ngày</option><option value="1 viên/lần, 3 lần/ngày">1 viên/lần, 3 lần/ngày</option><option value="custom">Tự nhập...</option></select><div id="dose-custom" hidden><label for="d2manual">Nhập liều dùng khác</label><input id="d2manual" placeholder="Ví dụ: 1/2 viên/lần, 2 lần/ngày"></div></div><div><label>Số lượng</label><input id="d3" type="number" min="1" value="10"></div></div><div class="bar"><button class="btn o" onclick="addLine()">+ Thêm vào đơn</button></div></div>'+
'<h3>Các thuốc trong đơn ('+S.d.length+')</h3>'+(S.d.length?'<div class="tw"><table><tr><th>#</th><th>Thuốc</th><th>Liều dùng</th><th>SL</th><th>Cách dùng</th><th></th></tr>'+S.d.map(function(x,i){return '<tr><td>'+(i+1)+'</td><td>'+e(x.d)+'</td><td>'+e(x.dose)+'</td><td>'+x.qty+'</td><td>'+e(x.use)+'</td><td><button class="btn o s" onclick="delLine('+i+')">Xóa</button></td></tr>'}).join('')+'</table></div>':'<p>Chưa có thuốc nào.</p>')+'<div class="bar"><button class="btn" onclick="saveRx()">Lưu đơn thuốc</button><button class="btn o" onclick="go(\'home\')">Hủy</button></div>'}
function rxlV(){return '<h2>Đơn thuốc</h2><div class="tw"><table><tr><th>Mã đơn</th><th>Bệnh án</th><th>Bệnh nhân</th><th>Ngày</th><th>Số thuốc</th><th></th></tr>'+S.rx.map(function(x){return '<tr><td>'+x.id+'</td><td>'+x.rid+'</td><td>'+e(pt(rc(x.rid).pid).n)+'</td><td>'+fd(x.date)+'</td><td>'+x.lines.length+'</td><td><button class="btn s" onclick="go(\'rxv\',\''+x.id+'\')">Xem</button></td></tr>'}).join('')+'</table></div>'}
function rxvV(){var x=S.rx.filter(function(y){return y.id==S.sel})[0],r=rc(x.rid);
return '<h2>Đơn thuốc '+x.id+'</h2><div class="panel"><div class="kv"><span>Bệnh nhân</span><span>'+e(pt(r.pid).n)+'</span><span>Bệnh án</span><span>'+r.id+' – '+e(r.dx)+'</span><span>Ngày kê</span><span>'+fd(x.date)+'</span></div></div><h3>Danh sách thuốc</h3>'+linesT(x.lines)+'<div class="bar"><button class="btn o" onclick="go(\'rxl\')">Quay lại</button></div>'}
// -----------------------------------------------------------
// UI DEMO cho Le tan / Admin - du lieu thay doi khong ghi DB.
// Cac module benh an va ke don van su dung PostgreSQL nhu truoc.
function allPatients(){return S.pts.concat(S.uiPatients)}
function nextDemoId(prefix,items){var n=1;while(items.some(x=>x.id===prefix+String(n).padStart(3,'0')))n++;return prefix+String(n).padStart(3,'0')}
function formValue(id){return V(id)}
function receptionHome(){return '<h2>Tổng quan Lễ tân</h2><div class="grid"><div class="card"><div class="n">'+allPatients().length+'</div>Bệnh nhân</div><div class="card"><div class="n">'+S.appointments.length+'</div>Lịch khám demo</div><div class="card"><div class="n">'+S.appointments.filter(x=>x.status==='Đã đặt').length+'</div>Lịch đang đặt</div></div><div class="panel"><b>Thao tác nhanh</b><div class="bar"><button class="btn" onclick="go(\'patients\')">Quản lý bệnh nhân</button><button class="btn o" onclick="go(\'appointments\')">Đặt lịch khám</button></div></div>'}
function adminHome(){return '<h2>Tổng quan Quản trị</h2><div class="grid"><div class="card"><div class="n">'+S.doctors.length+'</div>Bác sĩ demo</div><div class="card"><div class="n">'+S.specialties.length+'</div>Chuyên khoa demo</div><div class="card"><div class="n">'+S.users.length+'</div>Tài khoản demo</div></div><div class="panel"><b>Thao tác nhanh</b><div class="bar"><button class="btn" onclick="go(\'doctors\')">Quản lý bác sĩ</button><button class="btn o" onclick="go(\'accounts\')">Quản lý tài khoản</button></div></div>'}
function patientV(){var list=allPatients().filter(x=>(x.id+' '+x.n).toLowerCase().includes(S.q.toLowerCase()));var p=S.uiPatients.find(x=>x.id===S.editPatient)||{};
return '<h2>Quản lý bệnh nhân</h2><div class="panel"><h3>'+(S.editPatient?'Sửa thông tin bệnh nhân demo':'Thêm bệnh nhân demo')+'</h3><div class="row"><div><label>Họ tên</label><input id="pat-name" value="'+e(p.n||'')+'" placeholder="Nguyễn Văn A"></div><div><label>Ngày sinh</label><input id="pat-dob" type="date" value="'+e(p.dob||'')+'"></div><div><label>Giới tính</label><select id="pat-gender"><option value="" disabled hidden'+(!p.g?' selected':'')+'>Chọn giới tính</option>'+['Nam','Nữ','Khác'].map(g=>'<option'+(p.g===g?' selected':'')+'>'+g+'</option>').join('')+'</select></div><div><label>Số điện thoại (demo)</label><input id="pat-phone" value="'+e(p.phone||'')+'" placeholder="09xxxxxxxx"></div></div><div class="bar"><button class="btn" onclick="saveDemoPatient()">'+(S.editPatient?'Lưu sửa':'Thêm bệnh nhân')+'</button>'+(S.editPatient?'<button class="btn o" onclick="S.editPatient=null;R()">Hủy</button>':'')+'</div></div><h3>Danh sách bệnh nhân ('+list.length+')</h3><div class="top"><input placeholder="Tìm mã hoặc tên bệnh nhân..." value="'+e(S.q)+'" oninput="S.q=this.value;R()"></div><div class="tw"><table><tr><th>Mã</th><th>Họ tên</th><th>Ngày sinh</th><th>Giới tính</th><th>Thao tác</th></tr>'+list.map(x=>'<tr><td>'+e(x.id)+'</td><td>'+e(x.n)+'</td><td>'+fd(x.dob)+'</td><td>'+e(x.g||'—')+'</td><td>'+(S.uiPatients.some(t=>t.id===x.id)?'<button class="btn o s" onclick="S.editPatient=\''+x.id+'\';R()">Sửa</button> <button class="btn o s" onclick="deleteDemoPatient(\''+x.id+'\')">Xóa</button>':'<span class="tag">Đọc từ PostgreSQL</span>')+'</td></tr>').join('')+'</table></div>'}
function saveDemoPatient(){var n=V('pat-name'),dob=V('pat-dob'),g=V('pat-gender'),phone=V('pat-phone');if(!n||!dob||!g){notify('e','Nhập họ tên, ngày sinh và giới tính.');R();return}if(S.editPatient){var x=S.uiPatients.find(x=>x.id===S.editPatient);Object.assign(x,{n,dob,g,phone})}else S.uiPatients.push({id:nextDemoId('DEMO',allPatients()),n,dob,g,phone});S.editPatient=null;notify('k','Đã lưu bệnh nhân demo (chưa ghi PostgreSQL).');R()}
function deleteDemoPatient(id){if(S.appointments.some(x=>x.pid===id)){notify('e','Bệnh nhân đang có lịch demo; hãy hủy lịch trước.');R();return}if(!confirm('Xóa bệnh nhân demo?'))return;S.uiPatients=S.uiPatients.filter(x=>x.id!==id);S.editPatient=null;notify('k','Đã xóa bệnh nhân demo.');R()}
function appointmentV(){var x=S.appointments.find(a=>a.id===S.editAppointment)||{};return '<h2>Quản lý lịch khám</h2><div class="panel"><h3>'+(S.editAppointment?'Cập nhật lịch khám demo':'Đặt lịch khám demo')+'</h3><div class="row"><div><label>Bệnh nhân</label><select id="app-patient" required><option value="" disabled hidden'+(!x.pid?' selected':'')+'>Chọn bệnh nhân</option>'+allPatients().map(p=>'<option value="'+e(p.id)+'"'+(x.pid===p.id?' selected':'')+'>'+e(p.id+' – '+p.n)+'</option>').join('')+'</select></div><div><label>Bác sĩ</label><select id="app-doctor" required><option value="" disabled hidden'+(!x.doctor?' selected':'')+'>Chọn bác sĩ</option>'+S.doctors.map(d=>'<option value="'+e(d.id)+'"'+(x.doctor===d.id?' selected':'')+'>'+e(d.n)+'</option>').join('')+'</select></div><div><label>Ngày khám</label><input type="date" id="app-date" value="'+e(x.date||today())+'"></div><div><label>Giờ khám</label><input type="time" id="app-time" value="'+e(x.time||'08:00')+'"></div></div><div class="bar"><button class="btn" onclick="saveDemoAppointment()">'+(S.editAppointment?'Lưu thay đổi':'Đặt lịch')+'</button>'+(S.editAppointment?'<button class="btn o" onclick="S.editAppointment=null;R()">Hủy sửa</button>':'')+'</div></div><h3>Danh sách lịch ('+S.appointments.length+')</h3><div class="tw"><table><tr><th>Mã</th><th>Bệnh nhân</th><th>Bác sĩ</th><th>Ngày · Giờ</th><th>Trạng thái</th><th>Thao tác</th></tr>'+S.appointments.map(a=>'<tr><td>'+e(a.id)+'</td><td>'+e((allPatients().find(p=>p.id===a.pid)||{}).n||a.pid)+'</td><td>'+e((S.doctors.find(d=>d.id===a.doctor)||{}).n||a.doctor)+'</td><td>'+fd(a.date)+' · '+e(a.time)+'</td><td>'+e(a.status)+'</td><td><button class="btn o s" onclick="S.editAppointment=\''+a.id+'\';R()">Sửa</button> <button class="btn o s" onclick="cancelDemoAppointment(\''+a.id+'\')">Hủy lịch</button></td></tr>').join('')+'</table></div>'}
function saveDemoAppointment(){var pid=V('app-patient'),doctor=V('app-doctor'),date=V('app-date'),time=V('app-time');if(!pid||!doctor||!date||!time){notify('e','Chọn bệnh nhân, bác sĩ, ngày và giờ khám.');R();return}if(S.appointments.some(x=>x.id!==S.editAppointment&&x.doctor===doctor&&x.date===date&&x.time===time&&x.status==='Đã đặt')){notify('e','Bác sĩ đã có lịch tại thời điểm này.');R();return}if(S.editAppointment)Object.assign(S.appointments.find(x=>x.id===S.editAppointment),{pid,doctor,date,time});else S.appointments.push({id:nextDemoId('LK',S.appointments),pid,doctor,date,time,status:'Đã đặt'});S.editAppointment=null;notify('k','Đã lưu lịch khám demo.');R()}
function cancelDemoAppointment(id){if(!confirm('Hủy lịch khám demo này?'))return;var x=S.appointments.find(x=>x.id===id);if(x)x.status='Đã hủy';notify('k','Đã hủy lịch khám demo.');R()}
function doctorV(){var d=S.doctors.find(x=>x.id===S.editDoctor)||{};return '<h2>Quản lý bác sĩ</h2><div class="panel"><h3>'+(S.editDoctor?'Sửa bác sĩ demo':'Thêm bác sĩ demo')+'</h3><div class="row"><div><label>Họ tên</label><input id="doc-name" value="'+e(d.n||'')+'" placeholder="BS. Nguyễn Văn A"></div><div><label>Chuyên khoa</label><select id="doc-specialty"><option value="" disabled hidden'+(!d.specialty?' selected':'')+'>Chọn chuyên khoa</option>'+S.specialties.map(x=>'<option'+(d.specialty===x?' selected':'')+'>'+e(x)+'</option>').join('')+'</select></div><div><label>Điện thoại</label><input id="doc-phone" value="'+e(d.phone||'')+'" placeholder="09xxxxxxxx"></div></div><div class="bar"><button class="btn" onclick="saveDemoDoctor()">'+(S.editDoctor?'Lưu sửa':'Thêm bác sĩ')+'</button>'+(S.editDoctor?'<button class="btn o" onclick="S.editDoctor=null;R()">Hủy sửa</button>':'')+'</div></div><h3>Danh sách bác sĩ</h3><div class="tw"><table><tr><th>Mã</th><th>Họ tên</th><th>Chuyên khoa</th><th>Điện thoại</th><th>Thao tác</th></tr>'+S.doctors.map(x=>'<tr><td>'+e(x.id)+'</td><td>'+e(x.n)+'</td><td>'+e(x.specialty)+'</td><td>'+e(x.phone)+'</td><td><button class="btn o s" onclick="S.editDoctor=\''+x.id+'\';R()">Sửa</button> <button class="btn o s" onclick="removeDemoDoctor(\''+x.id+'\')">Xóa</button></td></tr>').join('')+'</table></div>'}
function saveDemoDoctor(){var n=V('doc-name'),specialty=V('doc-specialty'),phone=V('doc-phone');if(!n||!specialty){notify('e','Nhập tên bác sĩ và chuyên khoa.');R();return}if(S.editDoctor)Object.assign(S.doctors.find(x=>x.id===S.editDoctor),{n,specialty,phone});else S.doctors.push({id:nextDemoId('BS',S.doctors),n,specialty,phone});S.editDoctor=null;notify('k','Đã lưu bác sĩ demo.');R()}
function removeDemoDoctor(id){if(S.appointments.some(x=>x.doctor===id&&x.status==='Đã đặt')){notify('e','Bác sĩ còn lịch đang đặt.');R();return}if(!confirm('Xóa bác sĩ demo?'))return;S.doctors=S.doctors.filter(x=>x.id!==id);notify('k','Đã xóa bác sĩ demo.');R()}
function specialtyV(){return '<h2>Quản lý chuyên khoa</h2><div class="panel"><label>Tên chuyên khoa mới</label><input id="specialty-name" placeholder="Ví dụ: Tim mạch"><div class="bar"><button class="btn" onclick="addDemoSpecialty()">Thêm chuyên khoa</button></div></div><h3>Danh sách chuyên khoa</h3><div class="tw"><table><tr><th>Tên chuyên khoa</th><th>Thao tác</th></tr>'+S.specialties.map((x,i)=>'<tr><td>'+e(x)+'</td><td><button class="btn o s" onclick="removeDemoSpecialty('+i+')">Xóa</button></td></tr>').join('')+'</table></div>'}
function addDemoSpecialty(){var n=V('specialty-name');if(!n||S.specialties.some(x=>x.toLowerCase()===n.toLowerCase())){notify('e','Tên chuyên khoa trống hoặc bị trùng.');R();return}S.specialties.push(n);notify('k','Đã thêm chuyên khoa demo.');R()}
function removeDemoSpecialty(i){var name=S.specialties[i];if(S.doctors.some(x=>x.specialty===name)){notify('e','Chuyên khoa đang có bác sĩ.');R();return}if(!confirm('Xóa chuyên khoa?'))return;S.specialties.splice(i,1);notify('k','Đã xóa chuyên khoa demo.');R()}
function accountsV(){return '<h2>Tài khoản người dùng (demo)</h2><p class="drug-note">Đây là danh sách tài khoản hardcode phía frontend, KHÔNG phải phân quyền hay xác thực an toàn.</p><div class="tw"><table><tr><th>Tài khoản</th><th>Tên hiển thị</th><th>Vai trò</th><th>Trạng thái</th></tr>'+S.users.map(u=>'<tr><td>'+e(u.u)+'</td><td>'+e(u.n)+'</td><td>'+e(u.r)+'</td><td><span class="tag">Demo</span></td></tr>').join('')+'</table></div><div class="panel"><h3>Hướng tích hợp</h3><p>Đức phụ trách đăng nhập / tài khoản thực tế. Sau khi nhận backend xác thực, thay danh sách demo và kiểm tra quyền ở Java Servlet.</p></div>'}
function R(){var V2={home:homeV,rec:recV,det:detV,'new':newV,rxn:rxnV,rxl:rxlV,rxv:rxvV,drugs:drugV,patients:patientV,appointments:appointmentV,doctors:doctorV,specialties:specialtyV,accounts:accountsV};
$('app').innerHTML=S.me?shell(V2[S.v]()):authV()}
R();
