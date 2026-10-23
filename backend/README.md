# Cineflow API

Backend dùng Express, TypeScript, MySQL và Knex. API gồm xác thực, danh mục phim công khai, quản trị nội dung và tài liệu Swagger. Xem [hướng dẫn API](docs/API.md) để biết đầy đủ endpoint, quyền truy cập và quy trình tạo admin đầu tiên.

## Cấu trúc hiện tại

```text
backend/
├── .env.example                # Mẫu biến môi trường
├── src/
│   ├── app.ts                    # Tạo ứng dụng, gắn route và middleware
│   ├── server.ts                 # Khởi động HTTP server
│   ├── config/
│   │   ├── env.ts                # Cấu hình môi trường
│   │   └── database.ts           # Kết nối MySQL
│   ├── modules/
│   │   ├── auth/                 # Đăng ký, đăng nhập, refresh token và tài khoản hiện tại
│   │   ├── admin/                # Người dùng và dashboard quản trị
│   │   ├── catalog/              # Danh mục và phát phim công khai
│   │   ├── health/               # Kiểm tra hoạt động/readiness
│   │   ├── media/                # Metadata tệp
│   │   ├── metadata/             # Thể loại, đạo diễn, diễn viên
│   │   ├── saved/                # Danh sách phim đã lưu
│   │   └── titles/               # Phim, phần, tập, nguồn phát, phụ đề
│   ├── docs/openapi.ts           # Tài liệu Swagger/OpenAPI
│   ├── scripts/create-admin.ts   # Tạo admin đầu tiên
│   └── shared/
│       ├── http/                 # Xử lý lỗi HTTP
│       └── lib/                  # Slug, phân trang, xác thực đầu vào
├── docs/API.md                  # Hướng dẫn sử dụng API
├── tests/                       # Kiểm thử đơn vị và tích hợp
├── knexfile.cjs                # Cấu hình migration MySQL
├── migrations/                 # Các thay đổi schema
├── package.json
├── package-lock.json
└── tsconfig.json
```

`src/` là mã nguồn cần chỉnh sửa. `dist/` chỉ xuất hiện sau `npm run build`, được tạo lại từ `src/` và không cần giữ trong thư mục làm việc khi phát triển.

Các nghiệp vụ nằm trong `src/modules/`; mã dùng chung nằm trong `src/shared/`. Swagger được định nghĩa ở `src/docs/openapi.ts`.

## Chạy backend

Từ thư mục `backend/`:

```powershell
npm ci
if (-not (Test-Path .env)) { Copy-Item .env.example .env }
npm run dev
```

Trước khi chạy, thay `JWT_SECRET` mẫu trong `.env` bằng chuỗi ngẫu nhiên dài ít nhất 32 byte và điền cấu hình MySQL. Hướng dẫn chi tiết nằm trong [docs/API.md](docs/API.md).

Mặc định máy chủ chạy tại http://localhost:3001. Mở http://localhost:3001/health để nhận `{"status":"ok"}`. Chỉnh `PORT` trong `backend/.env` nếu muốn đổi cổng. File `.env` chỉ dùng trên máy cá nhân và được Git bỏ qua; `.env.example` là mẫu để chia sẻ.

Kiểm tra kiểu và build:

```powershell
npm run typecheck
npm run build
npm run test
npm run start
```

`npm run start` cần chạy sau `npm run build`. Khi kết nối MySQL thành công, terminal in URL Swagger `http://localhost:3001/api-docs`. Frontend hiện vẫn dùng dữ liệu demo và chưa gọi API này.

## Migration MySQL

Đặt các biến MySQL trong `backend/.env` theo mẫu sau (thay thông tin đăng nhập bằng tài khoản của bạn):

```dotenv
PORT=3001
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=cineflow_user
DB_PASSWORD=change_me
DB_NAME=cineflow
```

Database `cineflow` cần được tạo trước. `DB_PASSWORD` được đọc trực tiếp, không cần URL-encode; nếu có `#` hoặc khoảng trắng, đặt giá trị trong dấu nháy kép trong `.env`. `DB_PORT` mặc định là `3306` nếu bỏ trống; `DB_HOST`, `DB_USER` và `DB_NAME` là bắt buộc. Chỉ backend dùng các biến này; không đặt mật khẩu MySQL trong `frontend/web/.env`.

Migration 13 bảng lõi và migration `auth_sessions` đã được tạo. Khi muốn áp dụng schema trên một môi trường và đã kiểm tra thông tin kết nối, chạy:

```powershell
npm run migrate
npm run migrate:status
```

Tạo file migration mới bằng `npm run migrate:create -- ten_thay_doi`. Cấu trúc và lưu ý áp dụng được mô tả trong [migrations/README.md](migrations/README.md) và [docs/CI-CD.md](../docs/CI-CD.md).

`npm run test:integration` kiểm tra luồng đăng nhập và refresh token trên database đã áp dụng đầy đủ migration; kiểm thử tự xóa tài khoản thử sau khi chạy. CI chạy lệnh này trên MySQL tạm thời sau bước migration.
