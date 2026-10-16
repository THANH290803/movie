# Cineflow API

Backend dùng Express và TypeScript. Hiện có khung máy chủ và route kiểm tra hoạt động; các API nghiệp vụ chưa được triển khai.

## Cấu trúc hiện tại

```text
backend/
├── .env.example                # Mẫu biến môi trường
├── src/
│   ├── app.ts                    # Tạo ứng dụng, gắn route và middleware
│   ├── server.ts                 # Khởi động HTTP server
│   ├── config/
│   │   └── env.ts                # Đọc và kiểm tra cấu hình môi trường
│   ├── modules/
│   │   └── health/
│   │       └── health.routes.ts  # Route kiểm tra API
│   └── shared/
│       └── http/
│           └── not-found.ts     # Phản hồi cho đường dẫn không tồn tại
├── knexfile.cjs                # Cấu hình migration MySQL
├── migrations/                 # Các thay đổi schema
├── package.json
├── package-lock.json
└── tsconfig.json
```

`src/` là mã nguồn cần chỉnh sửa. `dist/` chỉ xuất hiện sau `npm run build`, được tạo lại từ `src/` và không cần giữ trong thư mục làm việc khi phát triển.

Mỗi nghiệp vụ mới sẽ nằm trong một thư mục riêng dưới `src/modules/`. Dự kiến có `metadata` (thể loại, hồ sơ đạo diễn/diễn viên), `movies` (phim dài), `series` (phim bộ, phần, tập), `users` và `auth`. Khi một module cần nhiều lớp, đặt route, xử lý nghiệp vụ và truy cập dữ liệu cạnh nhau trong module đó. Chỉ chuyển mã thật sự dùng chung sang `src/shared/`; cấu hình dùng chung đặt trong `src/config/`.

## Chạy backend

Từ thư mục `backend/`:

```powershell
npm ci
if (-not (Test-Path .env)) { Copy-Item .env.example .env }
npm run dev
```

Mặc định máy chủ chạy tại http://localhost:4000. Mở http://localhost:4000/health để nhận `{"status":"ok"}`. Chỉnh `PORT` trong `backend/.env` nếu muốn đổi cổng. File `.env` chỉ dùng trên máy cá nhân và được Git bỏ qua; `.env.example` là mẫu để chia sẻ.

Kiểm tra kiểu và build:

```powershell
npm run typecheck
npm run build
npm run start
```

`npm run start` cần chạy sau `npm run build`. Frontend hiện vẫn dùng dữ liệu demo và chưa gọi API này.

## Migration MySQL

Đặt `DATABASE_URL` theo dạng `mysql://user:password@host:3306/database` trong môi trường hoặc `backend/.env`, rồi chạy:

```powershell
npm run migrate
npm run migrate:status
```

Tạo file migration mới bằng `npm run migrate:create -- ten_thay_doi`. Hiện chưa có migration nghiệp vụ; cơ chế và cách cấu hình CI/CD được mô tả trong [migrations/README.md](migrations/README.md) và [docs/CI-CD.md](../docs/CI-CD.md).
