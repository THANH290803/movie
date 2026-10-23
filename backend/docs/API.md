# Cineflow API

Backend dùng Express, MySQL và Knex. Swagger UI chứa danh sách endpoint, tham số, body và response tại `http://localhost:3001/api-docs`; bản OpenAPI JSON ở `http://localhost:3001/openapi.json`.

## Khởi động

Từ `backend/`:

```powershell
npm ci
npm run dev
```

Tạo `backend/.env` từ `.env.example`, điền `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` và `JWT_SECRET`. `JWT_SECRET` phải là chuỗi ngẫu nhiên riêng cho từng môi trường, tối thiểu 32 byte. `CORS_ORIGINS` là danh sách origin của web, phân tách bằng dấu phẩy. `TRUST_PROXY=0` khi chạy trực tiếp trên máy và `1` khi chạy sau proxy Render. `MEDIA_PUBLIC_BASE_URL` là URL gốc của CDN/object storage khi dùng tệp đã tải lên.

Database phải có 13 bảng lõi trong [migration ban đầu](../migrations/20261018000100_create_cineflow_core.js) và bảng `auth_sessions` trong [migration refresh token](../migrations/20261018000200_create_auth_sessions.js). API **không tự chạy migration** khi khởi động. Trên database đã có 13 bảng lõi, áp dụng migration mới bằng `npm run migrate` từ `backend/` trước khi dùng đăng nhập và refresh token. Terminal in `MySQL connected`, URL API và URL Swagger sau khi kết nối thành công; nếu thiếu schema, terminal cảnh báo và `/health/ready` trả `503`. Nếu kết nối thất bại, tiến trình thoát với mã lỗi thay vì thông báo thành công giả.

## Admin đầu tiên

Lệnh dưới đây chỉ tạo tài khoản khi database chưa có admin đang hoạt động. Nó không chạy migration. Trong PowerShell:

```powershell
$env:ADMIN_BOOTSTRAP_EMAIL = 'admin@example.com'
$securePassword = Read-Host 'Mật khẩu admin (ít nhất 8 ký tự, có chữ thường, chữ hoa, số, ký tự đặc biệt)' -AsSecureString
$env:ADMIN_BOOTSTRAP_PASSWORD = [System.Net.NetworkCredential]::new('', $securePassword).Password
npm run admin:create
Remove-Item Env:ADMIN_BOOTSTRAP_EMAIL
Remove-Item Env:ADMIN_BOOTSTRAP_PASSWORD
```

Có thể đặt `ADMIN_BOOTSTRAP_NAME` tạm thời nếu muốn đổi tên hiển thị. Mật khẩu mới phải có ít nhất 8 ký tự, tối đa 72 byte UTF-8, gồm ít nhất một chữ thường, một chữ hoa, một chữ số và một ký tự đặc biệt (dấu cách không tính là ký tự đặc biệt). Quy tắc này áp dụng khi đăng ký, đổi mật khẩu, tạo tài khoản có mật khẩu qua API admin và tạo admin đầu tiên; đăng nhập vẫn chấp nhận mật khẩu cũ hợp lệ của tài khoản đã tồn tại. Không dùng lại mật khẩu demo ở frontend. Sau khi tạo, gọi `POST /api/v1/auth/login` để lấy `accessToken`, rồi nhập token vào nút **Authorize** trong Swagger. Access token hết hạn sau 2 giờ. API kiểm tra trạng thái tài khoản và phiên đăng nhập trong MySQL ở mỗi request được bảo vệ, nên tài khoản bị khóa hoặc phiên bị thu hồi sẽ mất quyền truy cập ngay.

## Refresh token và đăng xuất

`POST /api/v1/auth/register` và `POST /api/v1/auth/login` trả `{ user, accessToken, refreshToken }`. Gửi `accessToken` trong header `Authorization: Bearer <accessToken>` khi gọi API cần đăng nhập. Refresh token là chuỗi bí mật riêng cho một phiên, có hạn 30 ngày kể từ lần cấp hoặc làm mới gần nhất; database chỉ lưu SHA-256 của token, không lưu bản gốc.

Khi access token hết hạn, gọi `POST /api/v1/auth/refresh` với body `{ "refreshToken": "..." }`. Response trả access token và refresh token mới; **thay thế refresh token cũ ngay**, vì token cũ không còn dùng được. Gọi `POST /api/v1/auth/logout` với refresh token hiện tại để thu hồi phiên; access token thuộc phiên đó cũng mất hiệu lực. Logout trả `204` kể cả khi phiên đã bị thu hồi. Đổi mật khẩu hoặc admin đặt lại mật khẩu sẽ thu hồi toàn bộ phiên của tài khoản; người dùng cần đăng nhập lại. Nếu tài khoản bị khóa hoặc xóa mềm, refresh và các API cần đăng nhập đều từ chối.

Lưu refresh token trong nơi lưu trữ bí mật phù hợp với nền tảng; không ghi token vào log. Swagger chỉ dùng access token tại nút **Authorize**; refresh token được gửi trong body của endpoint refresh/logout. Việc thêm `auth_sessions` không thay đổi 13 bảng lõi đã có, nhưng access token được cấp trước phiên bản này cần đăng nhập lại sau khi cập nhật API.

## Nhóm API

| Nhóm | Endpoint chính | Quyền |
| --- | --- | --- |
| Sức khỏe | `GET /health`, `GET /health/ready` | Công khai |
| Xác thực | `POST /api/v1/auth/register`, `POST /login`, `POST /refresh`, `POST /logout`, `GET/PATCH /me`, `POST /change-password` | Đăng ký/đăng nhập/làm mới/đăng xuất dùng body; hồ sơ và đổi mật khẩu cần access token |
| Danh mục | `GET /api/v1/catalog/titles`, `GET /titles/{slug}`, `GET /titles/{slug}/playback`, `GET /titles/{slug}/episodes/{episodeSlug}/playback` | Công khai |
| Metadata công khai | `GET /api/v1/genres`, `GET /api/v1/people`, `GET /api/v1/catalog/users/{slug}` | Công khai |
| Phim đã lưu | `GET/POST /api/v1/me/saved-titles`, `DELETE /api/v1/me/saved-titles/{slug}` | Tài khoản đang hoạt động |
| Dashboard | `GET /api/v1/admin/dashboard` | Editor/Admin |
| Tài khoản | `GET/POST /api/v1/admin/users`, `GET/PATCH/DELETE /users/{slug}` | Admin |
| Thể loại, nhân sự | CRUD `/api/v1/admin/genres`, `/api/v1/admin/people` | Editor/Admin |
| Tệp media | CRUD metadata `/api/v1/admin/media-assets` | Editor/Admin |
| Phim | CRUD `/api/v1/admin/titles`; `POST /titles/{slug}/restore` | Editor/Admin |
| Phần, tập | CRUD `/api/v1/admin/titles/{titleSlug}/seasons/{seasonNumber}` và `/episodes/{episodeSlug}` | Editor/Admin |
| Nguồn phát, phụ đề | CRUD `/api/v1/admin/episodes/{episodeSlug}/sources` và `/subtitles` | Editor/Admin |

Tất cả request body dùng `camelCase` theo Swagger; khóa nội bộ kiểu `BIGINT` được trả dưới dạng chuỗi để tránh mất độ chính xác trong JavaScript. URL công khai của phim, người dùng và tập dùng slug ổn định. Danh sách hỗ trợ `page`, `pageSize` (`10`, `25`, `50`, `100`) và thường có `search`; response gồm `data` và `pagination`.

## Quy trình tạo nội dung

1. Admin tạo thể loại, nhân sự và vai trò, rồi tạo tài khoản editor nếu cần.
2. Editor tạo phim ở trạng thái `draft`, gắn thể loại và người tham gia bằng `genreIds` và `credits`. Phim lẻ tự tạo phần ẩn số `0` và tập số `1`; phim bộ tự tạo phần `1` và có thể thêm phần/tập.
3. Editor thêm nguồn video cho tập. Nguồn `external` dùng `playbackUrl` HTTPS/HTTP; nguồn `uploaded` trỏ đến media asset loại `video` ở trạng thái `ready`. Phụ đề dùng URL hoặc media asset loại `subtitle`.
4. Chuyển tập sang `published`, sau đó chuyển phim sang `published`. Phim công khai chỉ xuất hiện khi trạng thái đã xuất bản, `publishedAt` không ở tương lai và chưa bị xóa mềm. Tập xuất bản phải có nguồn phát hoạt động. Trang xem web dùng endpoint playback để chuyển tập và lấy nguồn phát tương ứng.

`DELETE /admin/titles/{slug}` xóa mềm phim; `POST /restore` đưa về `draft`. Xóa metadata, nguồn phát, phụ đề hoặc tập là xóa thật và có thể bị từ chối nếu còn khóa ngoại tham chiếu. API kiểm tra nguồn video chỉ chọn một trong `mediaAssetId` và `playbackUrl`; phụ đề chỉ chọn một trong `mediaAssetId` và `subtitleUrl`. Một tập có tối đa một phụ đề mặc định.

## Ví dụ đăng nhập

```powershell
$body = @{ email = 'admin@example.com'; password = 'mật-khẩu-của-bạn' } | ConvertTo-Json
$login = Invoke-RestMethod -Method Post -Uri 'http://localhost:3001/api/v1/auth/login' -ContentType 'application/json' -Body $body
$headers = @{ Authorization = "Bearer $($login.accessToken)" }
Invoke-RestMethod -Uri 'http://localhost:3001/api/v1/admin/dashboard' -Headers $headers

$refreshBody = @{ refreshToken = $login.refreshToken } | ConvertTo-Json
$renewed = Invoke-RestMethod -Method Post -Uri 'http://localhost:3001/api/v1/auth/refresh' -ContentType 'application/json' -Body $refreshBody
$login = $renewed # Lưu refreshToken mới, bỏ token cũ
$logoutBody = @{ refreshToken = $login.refreshToken } | ConvertTo-Json
Invoke-RestMethod -Method Post -Uri 'http://localhost:3001/api/v1/auth/logout' -ContentType 'application/json' -Body $logoutBody
```

API trả lỗi có mã ổn định, ví dụ `{ "error": "VALIDATION_ERROR", "details": [...] }`, cùng HTTP status phù hợp. Swagger cho phép thử các endpoint sau khi nhập token.

## Phạm vi hiện tại

`media_assets` quản lý metadata và URL CDN; API này chưa nhận file upload hoặc tạo signed URL. Web đã gọi API cho danh mục công khai, xác thực, yêu thích và các luồng quản trị chính. Các bảng `watch_progress`, `site_settings`, gói đăng ký và thanh toán chưa nằm trong schema nên chưa có API tương ứng. Khi thêm các luồng đó, tạo migration và endpoint riêng.
