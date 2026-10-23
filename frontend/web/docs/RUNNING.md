# Chạy Cineflow Web

Web nằm trong `frontend/web` và cần Cineflow API cùng MySQL để hiển thị dữ liệu. Yêu cầu Node.js 20.9 trở lên và npm.

## 1. Chuẩn bị backend

Tại thư mục gốc dự án, tạo database MySQL và cấu hình `backend/.env` theo `backend/.env.example`: `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `JWT_SECRET` và `CORS_ORIGINS`. Giá trị mặc định cho web local là `http://localhost:3000`.

```powershell
cd backend
npm ci
npm run migrate
npm run dev
```

`npm run migrate` là bước **thực hiện riêng do bạn chủ động chạy** sau khi kiểm tra migration. Web không tự chạy migration. Database cần migration lõi và migration `auth_sessions` để đăng nhập/refresh token hoạt động. Kiểm tra API tại `http://localhost:3001/health/ready` và Swagger tại `http://localhost:3001/api-docs`. Nếu chưa có admin, xem [hướng dẫn tạo admin](../../../backend/README.md).

## 2. Cấu hình và chạy web

Mở terminal PowerShell khác tại `frontend/web`:

```powershell
cd frontend/web
Copy-Item .env.example .env.local
npm ci
npm run dev
```

Trong `.env.local`, `API_BASE_URL` là URL backend mà Next.js server gọi; `NEXT_PUBLIC_API_BASE_URL` là URL backend trình duyệt gọi. Mặc định cả hai là `http://localhost:3001`. Nếu API ở máy khác, đổi cả hai cho phù hợp và thêm origin của web vào `CORS_ORIGINS` trên backend. Khởi động lại Next.js sau khi sửa biến môi trường.

Mở `http://localhost:3000`. Trang `/admin/login` dùng tài khoản admin/editor thật trong database; `/login` và `/register` dành cho người xem. Phim chỉ hiện ở khu vực công khai khi phim và tập đã xuất bản, có nguồn phát hợp lệ.

## 3. Kiểm tra bản build

Tại `frontend/web`:

```powershell
npm run typecheck
npm run lint
npm run build
npm run start
```

Build không yêu cầu API đang chạy; các trang phim công khai lấy dữ liệu khi người dùng truy cập. Khi API chưa sẵn sàng, web hiển thị lỗi kết nối và nút thử lại.

## Lỗi thường gặp

| Triệu chứng | Kiểm tra |
| --- | --- |
| Không tải được phim/danh sách | Backend đang chạy; `API_BASE_URL` và `NEXT_PUBLIC_API_BASE_URL` đúng; MySQL sẵn sàng. |
| Đăng nhập thất bại hoặc `/health/ready` trả 503 | Kiểm tra migration `auth_sessions`, tài khoản và cấu hình database. |
| Trình duyệt báo CORS | Thêm đúng URL web (scheme, host, port) vào `CORS_ORIGINS`, rồi khởi động lại backend. |
| Không xuất bản được phim | Thêm nguồn phát hoạt động, xuất bản tập, sau đó xuất bản phim. |
| Không thấy phim mới ở trang chủ | Phim còn bản nháp, chưa đến thời điểm xuất bản hoặc chưa có tập đã xuất bản. |

Chi tiết endpoint, dữ liệu đầu vào và quyền xem tại [Swagger](../../../backend/docs/API.md).
