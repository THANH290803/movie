# CI/CD cho Cineflow

Tài liệu này dành cho cấu hình kỹ thuật. `README.md` ở thư mục gốc chỉ mô tả nghiệp vụ của dự án.

## Luồng chạy

Khi mở pull request, GitHub Actions kiểm tra riêng `frontend/web` và `backend`. Web được cài từ lockfile, kiểm tra kiểu, lint và build. API được cài từ lockfile, kiểm tra kiểu, build, chạy kiểm thử đơn vị không ghi database, sau đó chạy migration hai lần trên MySQL 8.4 tạm thời để kiểm tra có thể chạy lại an toàn. Sau migration, kiểm thử tích hợp tạo rồi xóa một tài khoản thử để kiểm tra đăng nhập, xoay refresh token, đăng xuất và đổi mật khẩu.

Khi có commit trên `main`, các kiểm tra chạy lại. Các job triển khai chỉ bắt đầu khi cả web và API đều đạt. Nếu bật triển khai, web được đưa lên Vercel; API chạy migration trên MySQL production rồi mới gọi deploy hook của Render. Chỉ bật từng phần sau khi đã cấu hình đầy đủ bí mật tương ứng.

Workflow nằm ở `.github/workflows/ci-cd.yml`. Repo cần được đưa lên GitHub và có nhánh `main` để Actions chạy.

## Chuẩn bị MySQL và migration

Tạo một database MySQL và tài khoản có quyền thay đổi schema. Sau khi bản thiết kế CSDL được duyệt, trong PowerShell từ thư mục `backend/`:

```powershell
npm ci
$env:DB_HOST = '127.0.0.1'
$env:DB_PORT = '3306'
$env:DB_USER = 'cineflow_user'
$env:DB_PASSWORD = 'change_me'
$env:DB_NAME = 'cineflow'
npm run migrate
npm run migrate:status
```

Thay tài khoản, mật khẩu, host và database bằng thông tin thật. Có thể sao chép `backend/.env.example` thành `backend/.env` rồi điền năm biến `DB_*` khi chạy trên máy cá nhân; file `.env` được `.gitignore` bỏ qua và không được commit. Nếu MySQL ở xa, cần cho phép máy chạy lệnh kết nối tới database.

Thư mục `backend/migrations/` đã có migration tạo 13 bảng lõi và migration bổ sung `auth_sessions` cho refresh token. Lần chạy đầu trên mỗi môi trường, Knex tạo các bảng quản lý `schema_migrations`, `schema_migrations_lock` và áp dụng schema nghiệp vụ; môi trường đã có 13 bảng lõi chỉ cần áp dụng migration mới. Khi cần thay đổi schema, tạo file mới:

```powershell
npm run migrate:create -- create_movies
```

Điền `up` và `down` vào file mới, kiểm tra nội dung trước khi chạy `npm run migrate`. Có lệnh `npm run migrate:rollback` để lùi một batch, nhưng chỉ dùng sau khi kiểm tra tác động lên dữ liệu.

## Cấu hình Vercel cho web

1. Tạo project Vercel từ repo này, chọn **Root Directory** là `frontend/web`. Đặt `API_BASE_URL` và `NEXT_PUBLIC_API_BASE_URL` bằng URL HTTPS của API trên Render cho cả môi trường build và production. Trên Render, thêm origin HTTPS của web Vercel vào `CORS_ORIGINS`. Nếu để Vercel tự deploy qua Git, nó sẽ triển khai độc lập với workflow này; để chỉ deploy sau CI, tắt cơ chế tự triển khai qua Git cho project.
2. Lấy token và hai mã định danh project/team của Vercel. Có thể chạy `vercel link` trong `frontend/web` bằng tài khoản có quyền rồi xem `orgId`, `projectId` trong `.vercel/project.json` trên máy cá nhân. Không commit `.vercel/`.
3. Trong GitHub **Settings → Secrets and variables → Actions**, tạo repository secrets `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`.
4. Tạo repository variable `ENABLE_WEB_DEPLOY` với giá trị `true` khi sẵn sàng. Nếu chưa bật, CI vẫn chạy nhưng job triển khai web bị bỏ qua.

Workflow dùng `vercel pull`, `vercel build --prod` và `vercel deploy --prebuilt --prod` từ `frontend/web`. Kiểm tra URL triển khai và trang web trong Vercel sau khi job hoàn tất.

## Cấu hình Render cho API

1. Kết nối repo với Render và tạo Blueprint từ `render.yaml`, hoặc tạo Web Service với Root Directory `backend`, build command `npm ci && npm run build`, start command `npm run start`, health check `/health/ready`. Blueprint chọn gói `free` và tắt auto deploy để chỉ triển khai qua workflow; có thể đổi gói trong Render khi cần.
2. Tạo MySQL production ở nhà cung cấp phù hợp. Render Blueprint trong repo **không** tạo MySQL. Tạo năm repository secrets: `PRODUCTION_DB_HOST`, `PRODUCTION_DB_PORT`, `PRODUCTION_DB_USER`, `PRODUCTION_DB_PASSWORD`, `PRODUCTION_DB_NAME`. Database cần cho phép kết nối từ GitHub-hosted runner để job chạy migration. Nếu dịch vụ MySQL chỉ có mạng riêng, cần runner hoặc quy trình migration trong cùng mạng đó trước khi bật CD.
3. Lấy deploy hook URL trong **Settings** của Render service rồi lưu thành repository secret `RENDER_DEPLOY_HOOK_URL`. Giữ nguyên URL đầy đủ, gồm tham số `key`.
4. Tạo repository variable `ENABLE_API_DEPLOY` với giá trị `true` sau khi đã cấu hình đủ các secret ở trên và xác nhận đường kết nối MySQL. Nếu chưa bật, CI vẫn kiểm tra migration bằng MySQL tạm thời.

Trước khi triển khai, cấu hình cùng năm biến `DB_*` và `CORS_ORIGINS` trong môi trường Render; Blueprint mới sẽ yêu cầu nhập, còn Blueprint đang tồn tại cần thêm trực tiếp trong Dashboard. Blueprint tạo `JWT_SECRET` ngẫu nhiên nếu chưa có; giữ cùng một giá trị qua các lần deploy để token không bị vô hiệu giữa các lần khởi động. Nếu dùng tệp upload, thêm `MEDIA_PUBLIC_BASE_URL`. API kiểm tra kết nối MySQL ngay khi khởi động và `/health/ready` chỉ trả thành công khi có bảng lõi.

Sau khi migration thành công, workflow gọi hook với `ref` là SHA commit vừa kiểm tra. Render trả về khi **bắt đầu** triển khai, vì vậy kết quả job thành công chưa xác nhận API đã chạy thành công. Xem trạng thái deploy trên Render, thử `/health/ready` và mở `/api-docs` sau khi dịch vụ lên.

Migration production chạy trước khi phiên bản API mới lên Render, vì vậy các thay đổi schema sau này cần tương thích với cả phiên bản API đang chạy và phiên bản sắp triển khai. Không sửa migration đã được áp dụng; tạo migration mới cho mỗi thay đổi.
