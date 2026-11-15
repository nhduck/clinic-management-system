# Hướng dẫn Docker online và kiểm thử bản refactor

Tài liệu bổ sung cho dự án **Hệ thống quản lý phòng khám** (Java 17 + Servlet/Tomcat nhúng + JDBC + PostgreSQL 16). Giữ nguyên `README.md`, `README_UI_LE_TAN_ADMIN.md` và tài liệu Use Case hiện có.

## Mục đích
- Chạy **cả ứng dụng Java và PostgreSQL** bằng `docker compose`, không cần cài JDK, Maven hoặc Docker trên máy cá nhân.
- Kiểm tra phần tách giao diện HTML/CSS/JS, API và các luồng nghiệp vụ.
- Ghi nhận lỗi và chỉ đưa thay đổi lên nhánh `refactor/frontend-backend-docker`; **chưa merge `main`** khi nhóm chưa review.

## Cấu trúc cần biết
| Đường dẫn | Vai trò |
|---|---|
| `src/main/resources/web/index.html` | Khung giao diện, form, bảng, các màn hình tĩnh |
| `src/main/resources/web/style.css` | Giao diện, màu sắc, liên kết menu và responsive |
| `src/main/resources/web/app.js` | Hiển thị dữ liệu động, khởi tạo giao diện |
| `src/main/resources/web/js/core/` | State, API, navigation, notifications, utils |
| `src/main/resources/web/js/features/` | Sự kiện và logic từng tính năng |
| `src/main/java/clinic/servlet/` | Nhận HTTP request, trả JSON |
| `src/main/java/clinic/service/` | Xử lý nghiệp vụ |
| `src/main/java/clinic/dao/` | SQL/JDBC |
| `src/main/java/clinic/WebServer.java` | Khởi chạy Embedded Tomcat |
| `db/init/` | Schema và dữ liệu mẫu, chạy khi tạo volume DB mới |
| `Dockerfile` | Multi-stage Maven build và Java runtime |
| `docker-compose.yml` | Khởi động `db` và `app`, khai báo healthcheck/volume |
| `.env.example` | Mẫu biến môi trường; không commit `.env` |

## Chạy trên GitHub Codespaces

1. Vào repository `nhduck/clinic-management-system` trên GitHub, chọn nhánh `refactor/frontend-backend-docker`, chọn **Code → Codespaces → Create codespace**.
2. Mở Terminal trong Codespaces và kiểm tra Docker:

   ```bash
   docker --version
   docker compose version
   docker info
   ```

   Nếu `docker info` không kết nối được daemon, cần cấu hình Docker-in-Docker cho devcontainer rồi rebuild Codespace. Không tiếp tục chạy Compose khi daemon chưa hoạt động.

3. Tại thư mục có `Dockerfile`, `docker-compose.yml`, `pom.xml`:

   ```bash
   cp -n .env.example .env
   # Mở .env bằng VS Code và thay POSTGRES_PASSWORD trước lần tạo DB đầu tiên.
   docker compose config --quiet
   docker compose up -d --build
   docker compose ps
   ```

4. Kiểm tra API tại Terminal Codespaces:

   ```bash
   curl -i http://localhost:8080/api/health
   curl -sS http://localhost:8080/api/health; echo
   ```

   Mong đợi `HTTP 200` và JSON có `"status":"ok"`, `"database":"connected"`.

5. Trong tab **Ports**, mở port `8080` bằng **Open in Browser**. Giữ port ở chế độ **Private** vì đăng nhập hiện chỉ là demo frontend.

> Lưu ý: `localhost:8080` ở đây là localhost của Codespace. Trình duyệt máy cá nhân nên sử dụng địa chỉ forwarded port do Codespaces cung cấp. Dữ liệu trong volume không nên được coi là bản sao lưu lâu dài.

## Checklist kiểm thử

### Docker và API
- [ ] `docker compose up -d --build` hoàn thành không có lỗi build.
- [ ] `docker compose ps` hiển thị `db` **healthy** và `app` **healthy**, không `Restarting`.
- [ ] `docker compose logs --tail=50 app` không có exception khi khởi động.
- [ ] `GET /api/health` trả HTTP 200, xác nhận kết nối PostgreSQL.
- [ ] Trang web mở được từ port 8080 trong Codespaces.

### Giao diện và đăng nhập demo
- [ ] Giao diện đăng nhập hiển thị đủ form và nút.
- [ ] Menu trái không còn gạch chân liên kết bất thường.
- [ ] Nhập sai mật khẩu: chỉ hiện thông báo lỗi tương ứng.
- [ ] Nhập đúng sau khi sai: thông báo lỗi cũ biến mất.
- [ ] Đăng xuất: các thông báo đỏ/xanh cũ không còn lưu trên form.
- [ ] Đăng nhập `bacsi/123456`, `letan/123456`, `admin/123456` đúng menu từng vai trò.
- [ ] Nhấn F5 khi đã đăng nhập: phiên **demo** vẫn còn trong cùng tab nếu bản sửa `sessionStorage` đã được cập nhật.
- [ ] Đăng xuất rồi F5: không tự đăng nhập trở lại.
- [ ] DevTools → Console không có lỗi JavaScript khi điều hướng các màn hình.

### Chức năng nghiệp vụ
- [ ] Bác sĩ: xem danh sách bệnh án, mở chi tiết bệnh án.
- [ ] Bác sĩ: lập bệnh án từ lịch khám hợp lệ và kê đơn theo dữ liệu mẫu.
- [ ] Bác sĩ: xem danh mục thuốc, xem lại đơn thuốc.
- [ ] Lễ tân: xem/tìm bệnh nhân; thao tác thêm/sửa/xóa bệnh nhân **demo**.
- [ ] Lễ tân: tạo, sửa và hủy lịch khám qua API; kiểm tra phát hiện trùng lịch.
- [ ] Admin: xem danh sách và thao tác bác sĩ/chuyên khoa/tài khoản **demo**.
- [ ] Refresh trang và xác minh dữ liệu **thực sự lưu PostgreSQL** vẫn còn (bệnh án, đơn thuốc, lịch khám); không nhầm với dữ liệu demo frontend.
- [ ] Kiểm tra lại trên viewport hẹp và rộng.

**Tài khoản demo:** `bacsi`, `letan`, `admin`; mật khẩu mẫu `123456`. Đây không phải xác thực backend; không dùng với dữ liệu bệnh nhân thật hoặc mở public port.

## Lệnh kiểm tra và khắc phục lỗi

| Việc | Lệnh |
|---|---|
| Trạng thái container | `docker compose ps` |
| Log Java | `docker compose logs --tail=100 app` |
| Log PostgreSQL | `docker compose logs --tail=100 db` |
| Build lại Java sau khi sửa source | `docker compose up -d --build app` |
| Kiểm tra health API | `curl -i http://localhost:8080/api/health` |
| Tắt container, **giữ dữ liệu** | `docker compose down` |

- `app` báo `Restarting (1)`: đọc log `app`; không kết luận lỗi ở DB nếu chưa xem stack trace.
- Tomcat báo `Unable to create the directory [/app/tomcat.8080]`: cấu hình `tomcat.setBaseDir("/tmp/clinic-tomcat")` trong `WebServer.java` ngay sau khi tạo đối tượng `Tomcat` (trước `getConnector()`), rồi build lại. Container phải có quyền ghi thư mục runtime.
- Dockerfile báo `unable to find user clinic`: kiểm tra có `USER clinic` nhưng image chưa tạo user tương ứng. Bản chạy thành công trên Codespaces dùng `USER 10001` và file JAR đã được copy ở giai đoạn runtime.
- `curl: (7) Failed to connect`: kiểm tra `docker compose ps`, log Java và mapping port `8080:8080`.
- Nếu sửa `db/init/*.sql` sau khi DB đã có dữ liệu, script init **không tự chạy lại**. Không dùng `docker compose down -v` nếu chưa sao lưu vì lệnh này xóa dữ liệu volume.

## Đồng bộ Git an toàn (máy Arch Linux và Codespaces)

Làm việc trên **nhánh riêng** `refactor/frontend-backend-docker`, không dùng `git push --force` và không ghi đè `main`.

### Trên máy Arch Linux (thư mục `clinic-review`)

```bash
cd ~/Downloads/clinic-review
git switch refactor/frontend-backend-docker
git status --short
```

Nếu còn **thay đổi chưa commit**: commit đúng các file đã sửa trước khi pull. Để bảo vệ các tài liệu/ảnh đang bị `??` do lỗi mã hóa, **không dùng `git add .` hoặc `git clean -fd`**.

Ví dụ chỉ stage 5 file sửa UI:

```bash
git add src/main/resources/web/app.js \
  src/main/resources/web/index.html \
  src/main/resources/web/js/core/notifications.js \
  src/main/resources/web/js/features/auth.js \
  src/main/resources/web/style.css

git diff --cached --name-only
git diff --cached --check
git commit -m "fix: clean login notices and persist demo session"
```

Đưa file tài liệu **bổ sung** này vào `docs/` rồi stage riêng (không sửa file `.md` cũ):

```bash
git add docs/HUONG_DAN_DOCKER_ONLINE_VA_KIEM_THU.md
git diff --cached --name-only
git commit -m "docs: add Docker online and testing guide"
```

Sau đó cập nhật nhánh remote và push:

```bash
git fetch origin
git rebase origin/refactor/frontend-backend-docker
git push -u origin refactor/frontend-backend-docker
```

Nếu `rebase` báo conflict: chạy `git status`, xử lý xung đột theo từng file; **không force push**. Các ảnh `??` ở `docs/diagrams/` không cần stage và không được xóa nếu chưa xác định đúng nguồn.

### Trong Codespaces sau khi push

```bash
git status
# Nếu còn Dockerfile/WebServer.java đã sửa nhưng chưa commit, commit riêng trước khi pull.
git pull --ff-only origin refactor/frontend-backend-docker
docker compose up -d --build app
docker compose ps
curl -i http://localhost:8080/api/health
```

Mở tab **Ports → 8080 → Open in Browser**, sau đó bấm `Ctrl + Shift + R` để tải lại giao diện mới. Chạy lại checklist ở trên và ghi nhận mục chưa đạt. Chỉ merge vào `main` sau khi nhóm review Pull Request.

## Giới hạn hiện tại

- Việc chạy Docker, PostgreSQL, Java/Tomcat và health API đã **được quan sát chạy thành công** trên Codespaces ở phiên kiểm thử ngày 16/11/2026.
- Các mục UI, phiên demo qua F5 và nghiệp vụ cần **test lại sau khi cập nhật 5 file UI**; chưa được xác nhận PASS trên bản mới.
- `README.md` và `README_UI_LE_TAN_ADMIN.md` gốc mô tả một số thao tác cũ (ví dụ chạy Maven local, demo data mất khi F5). Tài liệu này chỉ bổ sung cách chạy bản refactor, **không tự ý viết lại tài liệu gốc**.
