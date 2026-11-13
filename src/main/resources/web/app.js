// Frontend từ prototype, đã nối API Java Servlet.
var S={tab:'in',msg:null,me:null,v:'home',q:'',sel:null,rr:'',d:[],
users:[{u:'bacsi',p:'123456',n:'BS. Nguyễn Văn An',r:'Bác sĩ'}],
pts:[],drugs:[],drugItems:[],recs:[],rx:[]};
// Bệnh án/đơn thuốc/bệnh nhân được lấy từ SQLite.
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
function go(v,s){S.v=v;S.sel=s||null;clearNotice();S.d=[];S.rr='';S.q='';R()}
function T(t){S.tab=t;clearNotice();R()}
async function login(){var u=V('u'),p=$('p').value,f=S.users.filter(function(x){return x.u==u&&x.p==p})[0];
if(!u||!p){notify('e','Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu.');return R()}
if(!f){notify('e','Sai tên đăng nhập hoặc mật khẩu.');return R()}
S.me=f;S.v='home';clearNotice();try{await loadData();R()}catch(err){S.me=null;notify('e','Không kết nối được SQLite/API: '+err.message);R()}}
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
    await loadData();go('det',saved.id);notify('k','Đã lưu bệnh án '+saved.id+' vào SQLite.');R();
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
    await loadData();go('rxv',saved.id);notify('k','Đã lưu đơn thuốc '+saved.id+' vào SQLite.');R();
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
(i?'<p style="font-size:12px;color:var(--mu)">Tài khoản demo (chưa có xác thực backend): <b>bacsi</b> / <b>123456</b></p>':'')+'</div></div>'}
var NAV=[['home','Trang chủ'],['rec','Danh sách bệnh án'],['new','Lập bệnh án'],['rxn','Kê đơn thuốc'],['rxl','Đơn thuốc'],['drugs','Quản lý thuốc']];
function shell(c){var cur=S.v=='det'?'rec':S.v=='rxv'?'rxl':S.v;
return '<div class="shell"><aside><div class="brand">PHÒNG KHÁM<small>Menu chính</small></div>'+NAV.map(function(n){return '<a class="'+(cur==n[0]?'on':'')+'" onclick="go(\''+n[0]+'\')">'+n[1]+'</a>'}).join('')+'</aside><main><header><span>Xin chào, <b>'+e(S.me.n)+'</b> · '+e(S.me.r)+'</span><button class="btn o s" onclick="logout()">Đăng xuất</button></header><div class="pg">'+M()+c+'</div></main></div>'}
function homeV(){return '<h2>Trang chủ</h2><div class="grid"><div class="card"><div class="n">'+S.recs.length+'</div>Bệnh án</div><div class="card"><div class="n">'+S.rx.length+'</div>Đơn thuốc</div><div class="card"><div class="n">'+S.pts.length+'</div>Bệnh nhân</div><div class="card"><div class="n">'+S.drugs.length+'</div>Danh mục thuốc</div></div><div class="panel"><b>Thao tác nhanh</b><div class="bar"><button class="btn" onclick="go(\'new\')">Lập bệnh án mới</button><button class="btn" onclick="go(\'rxn\')">Kê đơn thuốc</button><button class="btn o" onclick="go(\'rec\')">Tra cứu lịch sử khám</button></div></div>'}
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
function R(){var V2={home:homeV,rec:recV,det:detV,'new':newV,rxn:rxnV,rxl:rxlV,rxv:rxvV,drugs:drugV};
$('app').innerHTML=S.me?shell(V2[S.v]()):authV()}
R();
