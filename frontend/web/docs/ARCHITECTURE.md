# Kiến trúc frontend Cineflow

`frontend/web` là ứng dụng Next.js App Router. `frontend/mobile` dành cho ứng dụng di động sau này.

## Luồng dữ liệu

```text
MySQL ← Cineflow API (Express) ← Next.js server / trình duyệt
                                   ├─ (site): danh mục công khai, phát phim, yêu thích
                                   └─ admin: dashboard và quản lý nội dung
```

- Trang công khai dùng `src/features/movies/lib/catalog-api.ts` và `src/lib/api/server.ts` để gọi API từ Next.js server. Chúng được render theo request, nên build không phụ thuộc vào backend đang chạy.
- Màn quản trị và hành động người dùng dùng `src/lib/api/client.ts`. Client thêm access token, tự làm mới bằng refresh token khi access token hết hạn, và chuyển lỗi API về giao diện.
- `src/lib/api/admin.ts` gom endpoint quản trị. DTO dùng chung nằm trong `src/lib/api/types.ts`. API backend vẫn là nơi quyết định quyền và kiểm tra dữ liệu.
- `src/features/movies/hooks/saved-movies-provider.tsx` đọc danh sách yêu thích từ API, đồng bộ khi đăng nhập/đăng xuất; không dùng danh sách yêu thích mẫu.
- Form quản trị tạo nội dung bản nháp. Nguồn phát được thêm ở trang chi tiết phim/tập; tập phải xuất bản trước phim. Phim lẻ có phần ẩn số 0 và tập số 1 do backend tạo sẵn.

## Cấu trúc chính

```text
src/
├── app/
│   ├── (site)/                # Trang chủ, danh mục, phim, xem phim, đăng nhập
│   └── admin/                 # Đăng nhập và các route quản trị
├── features/
│   ├── admin/components/      # Màn quản trị dùng API
│   ├── auth/components/       # Đăng nhập người xem/quản trị
│   └── movies/                # Danh mục, trang chi tiết, phát phim, yêu thích
├── components/layouts/       # Khung trang người xem và quản trị
├── components/common/        # Header, modal, phân trang
└── lib/api/                   # HTTP client/server và kiểu dữ liệu API
```

Các component và store dữ liệu mẫu cũ còn trong repository để tham chiếu giao diện nhưng route đang hoạt động không dùng chúng cho nghiệp vụ chính. Cài đặt thương hiệu/thông báo và upload file chưa có API. Token hiện được lưu trong `sessionStorage` hoặc `localStorage` theo lựa chọn ghi nhớ đăng nhập; trước khi triển khai production, nên chuyển refresh token sang cookie `HttpOnly` do server quản lý để giảm rủi ro khi có XSS.
