# Kiến trúc frontend Cineflow

Dự án dùng một ứng dụng Next.js App Router cho hai khu vực: người xem và quản trị.
Phương án này phù hợp với quy mô hiện tại vì dùng chung UI, cấu hình và một quy trình
build. Đây là lựa chọn cho dự án này, không phải một chuẩn bắt buộc cho mọi công ty.

## Cấu trúc

```text
frontend/web/
├── public/                       # Ảnh, icon và tài nguyên công khai
├── docs/
│   └── ARCHITECTURE.md
├── src/
│   ├── app/                      # Route, layout, metadata; giữ page.tsx mỏng
│   │   ├── layout.tsx            # HTML, ngôn ngữ và CSS toàn cục
│   │   ├── globals.css
│   │   ├── (site)/               # Khu vực người xem
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx          # /
│   │   │   └── movies/
│   │   │       ├── page.tsx      # /movies
│   │   │       └── [id]/         # /movies/:id và giao diện 404
│   │   └── admin/
│   │       ├── (auth)/
│   │       │   ├── layout.tsx
│   │       │   └── login/        # /admin/login; không có sidebar
│   │       └── (dashboard)/
│   │           ├── layout.tsx    # Bọc AdminShell đúng một lần
│   │           ├── page.tsx      # /admin → /admin/dashboard
│   │           ├── dashboard/
│   │           ├── movies/      # Danh sách, chi tiết, thêm và sửa
│   │           ├── series/      # Phim bộ, phần và các route tập phim
│   │           ├── users/
│   │           └── settings/
│   ├── features/                 # Mã nghiệp vụ theo tính năng
│   │   ├── auth/components/
│   │   ├── dashboard/components/
│   │   ├── movies/
│   │   │   ├── components/       # admin-* và catalog-* tách biệt
│   │   │   ├── data/             # Dữ liệu mẫu admin và công khai riêng
│   │   │   └── types/            # Kiểu dữ liệu nghiệp vụ và DTO công khai
│   │   ├── metadata/             # Thể loại và hồ sơ đạo diễn/diễn viên dùng chung
│   │   │   ├── components/       # CRUD, editor và các trường chọn nhiều
│   │   │   ├── data/             # Danh mục mẫu và liên kết phim
│   │   │   ├── hooks/            # Draft lựa chọn của form phim/phim bộ
│   │   │   ├── lib/              # Kiểm tra dữ liệu và liên kết đang sử dụng
│   │   │   ├── stores/           # Lưu trình duyệt, đồng bộ route/tab
│   │   │   └── types/
│   │   ├── series/{components,data,types}/
│   │   ├── episodes/components/
│   │   ├── users/{components,data,types}/
│   │   └── settings/components/
│   ├── components/
│   │   ├── ui/                   # Component nền tảng shadcn/Base UI
│   │   ├── common/               # PageHeader, CrudDialog
│   │   └── layouts/
│   │       ├── site/             # Header/footer của người xem
│   │       └── admin/            # AdminShell và bộ sidebar shadcn
│   ├── hooks/                    # Hook dùng chung, không phụ thuộc nghiệp vụ
│   ├── config/                   # URL điều hướng trong routes.ts
│   └── lib/                      # Hàm tiện ích tổng quát như cn()
├── components.json               # shadcn ghi đúng vào src/components/ui
├── next.config.ts
├── package.json
└── package-lock.json              # Dùng npm nhất quán
```

Tên thư mục `(site)`, `(auth)` và `(dashboard)` là route group: chúng không xuất hiện
trong URL. Thư mục `admin` là URL segment thật, nên route quản trị có tiền tố `/admin`.

## Trách nhiệm và hướng phụ thuộc

```text
app (route/layout) → features (nghiệp vụ) → components/common, components/ui, hooks, lib
app (layout)      → components/layouts  → components/common, components/ui, hooks, lib
```

- `app`: nối route với screen, xử lý params/searchParams và metadata phía server.
- `features`: screen, form, dữ liệu và kiểu riêng của nghiệp vụ. Component quản trị
  đặt tên `admin-*`; component người xem đặt tên `catalog-*`.
- `components/ui`: không gọi API nghiệp vụ, không chứa logic phân quyền hay dữ liệu phim.
- `components/common`: component dùng được ở nhiều tính năng.
- `components/layouts`: điều hướng và khung trang; feature không import layout.
- `hooks`, `lib`, `config`: mã dùng chung; không import ngược route hoặc feature.

ESLint kiểm tra hai quy tắc phụ thuộc cuối. Đường dẫn import dùng alias `@/` trỏ vào
`src`. Import trực tiếp từng module để ranh giới client/server dễ nhìn, không tạo
file `index.ts` gom tất cả client component và server module.

Layout dùng thực tế của admin là `admin-shell.tsx`. Bộ component trong
`layouts/admin/sidebar` được giữ từ template shadcn, đã chuyển sang Base UI `render`,
để có thể dùng khi thay giao diện sidebar. Nó chưa được gắn vào AdminShell hiện tại.

## Thêm tính năng

Ví dụ khi triển khai yêu thích:

1. Thêm `features/favorites/components` cho màn hình và các component của tính năng.
2. Thêm `types`, `services`, `hooks` bên trong tính năng khi có mã thật cần đặt vào đó.
3. Thêm route người xem trong `app/(site)/favorites/page.tsx`; route chỉ import screen.
4. Đặt các lệnh gọi API yêu thích trong `features/favorites/services`, còn HTTP client
   dùng chung trong `lib` khi bắt đầu kết nối backend.
5. Module chứa token bí mật hoặc truy cập dữ liệu riêng chỉ được chạy phía server.

Không tạo sẵn `stores`, `providers`, `services` hoặc thêm Redux/React Query khi chưa có
nhu cầu. `useState` hiện đủ cho giao diện demo. Khi có nhiều màn hình dùng dữ liệu server,
có thể bổ sung thư viện quản lý cache và đặt provider ở layout phù hợp.

## URL và thay đổi so với trước

| URL | Chức năng |
| --- | --- |
| `/` | Trang chủ dành cho người xem |
| `/movies` | Danh mục phim công khai |
| `/movies/1` | Chi tiết phim công khai |
| `/admin/login` | Giao diện đăng nhập quản trị demo |
| `/admin` | Chuyển đến tổng quan quản trị |
| `/admin/dashboard` | Tổng quan |
| `/admin/movies` | Quản lý phim |
| `/admin/movies/new` | Thêm phim |
| `/admin/movies/1/edit` | Sửa phim |
| `/admin/series` | Quản lý phim bộ |
| `/admin/genres` | CRUD thể loại |
| `/admin/directors` | CRUD đạo diễn |
| `/admin/actors` | CRUD diễn viên |
| `/admin/series/1/episodes/new?partId=11` | Thêm tập phim vào phần |
| `/admin/users` | Quản lý người dùng |
| `/admin/settings` | Cài đặt |

`/dashboard`, `/users`, `/settings`, `/series/*`, `/movies/new` và `/movies/:id/edit`
được chuyển hướng tạm thời sang URL quản trị mới trong `next.config.ts`.
`/` và `/movies` nay thuộc người xem; màn hình quản trị tương ứng đã chuyển sang
`/admin/login` và `/admin/movies`. Trang công khai chỉ dùng fixture công khai;
không import danh sách admin chứa bản nháp.

## Xác thực và dữ liệu hiện tại

Backend mới có route kiểm tra hoạt động, chưa có API nghiệp vụ hoặc hệ thống
session/phân quyền. Các màn hình quản trị vẫn
là demo và chưa lưu vào cơ sở dữ liệu. Danh mục thể loại, hồ sơ người và ID được chọn
trong form phim/phim bộ được lưu vào localStorage với khóa `cineflow.admin.metadata.v1`.
Danh mục dùng chung giữa các route, giữ lại khi tải lại trang và nhận thay đổi từ tab khác.
Một hồ sơ người có thể có cả hai vai trò; xóa hồ sơ sẽ kiểm tra liên kết của cả hai.
Mục đang được sử dụng không được xóa; ẩn vẫn giữ liên kết cũ nhưng không đưa vào lựa
chọn mới. Các nội dung phim/người dùng khác vẫn dùng state hoặc dữ liệu mẫu.

`metadata` kiểm tra tên trùng, vai trò và ID tham chiếu trước khi lưu. Khi nối API,
chuyển thao tác lưu trữ sang backend và thực hiện lại các kiểm tra này ở server.
LocalStorage chỉ chứa dữ liệu demo trên thiết bị, không phải nguồn dữ liệu chung cho
mọi tài khoản. Thay đổi phân loại chưa được xuất bản sang khu vực xem phim công khai.

Khi nối backend, kiểm tra session và vai trò admin phía server trong layout quản trị,
đồng thời kiểm tra quyền ở từng API/Server Action. Layout, tiền tố `/admin`, robots và
việc ẩn menu không tự bảo vệ dữ liệu. API công khai phải tự lọc nội dung đã xuất bản;
không trả bản nháp hoặc thông tin người dùng rồi mới lọc ở trình duyệt.

Chỉ biến được phép công khai mới dùng tiền tố `NEXT_PUBLIC_`. Token, mật khẩu và key
bí mật giữ phía server. Không đưa mock người dùng vào bundle khu vực công khai.

## Khi nào tách thành hai ứng dụng

Repo đã đặt web tại `frontend/web` và chừa `frontend/mobile` cho ứng dụng di động. Khu vực
người xem và quản trị vẫn dùng chung một ứng dụng Next.js. Nếu sau này cần phát hành
admin độc lập hoặc dùng domain riêng, có thể tách thành `frontend/admin`. Chỉ thêm
`packages/ui` khi nhiều ứng dụng thực sự dùng chung UI; mobile có thể cần UI riêng.

Tham khảo: https://nextjs.org/docs/app/getting-started/project-structure
