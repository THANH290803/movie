# Hướng dẫn chạy frontend Cineflow

Frontend hiện tại là ứng dụng Next.js trong `frontend/web`. Thư mục `frontend/mobile` dành cho ứng dụng di động sau này. Backend đã có máy chủ và route kiểm tra hoạt động, nhưng chưa có API nghiệp vụ; bạn có thể chạy và xem giao diện web mà không cần chạy backend.

## 1. Chuẩn bị

- Cài Node.js **20.9 trở lên** và npm. Next.js trong dự án yêu cầu phiên bản Node.js này.
- Mở terminal PowerShell tại thư mục gốc `movie-web` (thư mục chứa `README.md`, `frontend/` và `backend/`).
- Kiểm tra công cụ đã cài:

```powershell
node --version
npm --version
```

Web có `package.json` và `package-lock.json` riêng trong `frontend/web`. Hiện tại không cần tạo `.env.local` hay cấu hình API URL để chạy giao diện demo.

## 2. Cài dependencies và chạy chế độ phát triển

**Cách A — từ thư mục gốc `movie-web`:**

```powershell
npm ci --prefix frontend/web
npm run dev:web
```

**Cách B — chuyển từ thư mục gốc vào `frontend/web`:**

```powershell
cd frontend/web
npm ci
npm run dev
```

Chỉ cần `npm ci` khi mới tải dự án về hoặc khi `package-lock.json` thay đổi. Lệnh này cài đúng các phiên bản đã khóa trong lockfile. Giữ terminal chạy trong lúc dùng web; khi Next.js báo đã sẵn sàng, mở http://localhost:3000. Nhấn `Ctrl+C` tại terminal đó để dừng server.

Nếu bạn đang ở thư mục gốc, dùng `npm run dev:web`. Nếu bạn đang ở `frontend/web`, dùng `npm run dev`.

### Các trang để kiểm tra

| URL | Nội dung |
| --- | --- |
| http://localhost:3000 | Trang chủ người xem |
| http://localhost:3000/movies | Kho phim công khai |
| http://localhost:3000/admin/login | Giao diện đăng nhập quản trị demo |
| http://localhost:3000/admin/dashboard | Tổng quan quản trị |
| http://localhost:3000/admin/movies | Quản lý phim |
| http://localhost:3000/admin/genres | Quản lý thể loại |

Trang đăng nhập đã điền sẵn email và mật khẩu mẫu. Nút đăng nhập chỉ chuyển tới trang quản trị; hiện chưa có xác thực hoặc session. Danh mục thể loại và hồ sơ đạo diễn/diễn viên lưu trong trình duyệt bằng `localStorage`; những màn hình khác chủ yếu dùng dữ liệu mẫu.

## 3. Các lệnh phát triển và kiểm tra

Chạy các lệnh sau **tại `frontend/web`**:

```powershell
npm run typecheck
npm run lint
npm run build
```

- `typecheck`: tạo kiểu cho route Next.js rồi kiểm tra TypeScript.
- `lint`: chạy ESLint.
- `build`: tạo bản build production và kiểm tra TypeScript trong quá trình build.

Từ thư mục gốc, dùng các lệnh tương ứng `npm run typecheck:web`, `npm run lint:web` và `npm run build:web`.

Để chạy bản build production trên máy sau khi `build` thành công:

```powershell
npm run start
```

Nếu đang ở thư mục gốc, dùng `npm run start:web` sau `npm run build:web`. Mặc định bản production cũng mở ở http://localhost:3000; dừng bằng `Ctrl+C`.

## 4. Đổi cổng khi 3000 đang được sử dụng

Tại `frontend/web`, chạy:

```powershell
npm run dev -- -p 3001
```

Sau đó mở http://localhost:3001. Để đổi cổng cho bản production, dùng `npm run start -- -p 3001` sau khi build.

## 5. Xử lý lỗi thường gặp

| Hiện tượng | Cách xử lý |
| --- | --- |
| `node` hoặc `npm` không được nhận diện | Cài Node.js 20.9 trở lên, mở lại terminal rồi kiểm tra `node --version` và `npm --version`. |
| `Missing script: dev:web` | Bạn đang ở `frontend/web`; chạy `npm run dev`. Lệnh `dev:web` chỉ có ở thư mục gốc. |
| `Missing script: dev` khi đứng ở thư mục gốc | Chạy `npm run dev:web`, hoặc chuyển vào `frontend/web` rồi chạy `npm run dev`. |
| Thiếu `next` hoặc module sau khi tải mã nguồn | Chạy `npm ci --prefix frontend/web` từ thư mục gốc, hoặc `npm ci` trong `frontend/web`. |
| Cổng 3000 đã được dùng | Dừng server cũ bằng `Ctrl+C`, hoặc chạy với cổng khác như mục 4. |
| `npm run start` báo thiếu bản build | Chạy `npm run build` trong `frontend/web` trước. |
| Thay đổi cấu trúc route nhưng trang chưa cập nhật | Dừng server phát triển và chạy lại `npm run dev`. |

Xem [kiến trúc frontend](ARCHITECTURE.md) để biết cách sắp xếp route, component và dữ liệu demo.
