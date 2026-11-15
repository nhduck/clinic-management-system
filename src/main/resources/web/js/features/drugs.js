async function saveDrug() {
  var id = V('drug-id'),
    name = V('drug-name');
  if (!name) {
    notify('e', 'Vui lòng nhập tên thuốc.');
    return R();
  }
  try {
    await api(id ? '/api/drugs/' + id : '/api/drugs', {
      method: id ? 'PUT' : 'POST',
      body: JSON.stringify({ name: name })
    });
    await loadData();
    go('drugs');
    notify('k', id ? 'Đã cập nhật thuốc.' : 'Đã thêm thuốc.');
    R();
  } catch (err) {
    notify('e', err.message);
    R();
  }
}

function editDrug(id) {
  var item = S.drugItems.find((x) => x.id === id);
  if (!item) return;
  $('drug-id').value = item.id;
  $('drug-name').value = item.name;
  $('drug-submit').textContent = 'Lưu thay đổi';
  $('drug-cancel').hidden = false;
  $('drug-name').focus();
}

function cancelDrug() {
  $('drug-id').value = '';
  $('drug-name').value = '';
  $('drug-submit').textContent = 'Thêm thuốc';
  $('drug-cancel').hidden = true;
}

async function removeDrug(id) {
  var item = S.drugItems.find((x) => x.id === id);
  if (
    !item ||
    !confirm('Xóa thuốc "' + item.name + '" khỏi danh mục? Đơn thuốc đã lưu vẫn giữ nguyên tên cũ.')
  )
    return;
  try {
    await api('/api/drugs/' + id, { method: 'DELETE' });
    await loadData();
    go('drugs');
    notify('k', 'Đã xóa thuốc khỏi danh mục.');
    R();
  } catch (err) {
    notify('e', err.message);
    R();
  }
}

function drugV() {
  return (
    '<h2>Quản lý danh mục thuốc</h2>' +
    '<div class="panel"><h3>Thêm / sửa thuốc</h3><input type="hidden" id="drug-id">' +
    '<label for="drug-name">Tên thuốc</label><input id="drug-name" maxlength="100" placeholder="Ví dụ: Paracetamol 500mg">' +
    '<div class="bar"><button id="drug-submit" class="btn" onclick="saveDrug()">Thêm thuốc</button>' +
    '<button id="drug-cancel" hidden class="btn o" onclick="cancelDrug()">Hủy sửa</button></div></div>' +
    '<h3>Danh sách thuốc (' +
    S.drugItems.length +
    ')</h3>' +
    '<p class="drug-note">Xóa / đổi tên trong danh mục không làm thay đổi đơn thuốc cũ đã lưu.</p>' +
    '<div class="tw"><table><tr><th>Mã</th><th>Tên thuốc</th><th>Thao tác</th></tr>' +
    (S.drugItems.length
      ? S.drugItems
          .map(function (x) {
            return (
              '<tr><td>T' +
              String(x.id).padStart(3, '0') +
              '</td><td>' +
              e(x.name) +
              '</td><td><div class="bar action-bar"><button class="btn o s" onclick="editDrug(' +
              x.id +
              ')">Sửa</button><button class="btn o s" onclick="removeDrug(' +
              x.id +
              ')">Xóa</button></div></td></tr>'
            );
          })
          .join('')
      : '<tr><td colspan="3">Chưa có thuốc nào.</td></tr>') +
    '</table></div>'
  );
}
