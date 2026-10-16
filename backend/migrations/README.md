# Database migrations

Thư mục này dành cho các migration MySQL. Hiện chưa có bảng nghiệp vụ và chưa có file migration nào.

Tạo migration mới từ thư mục `backend/` bằng `npm run migrate:create -- ten_thay_doi`. Điền thao tác tạo hoặc sửa schema trong hàm `up`, và thao tác hoàn tác trong hàm `down` của file vừa tạo. Sau khi rà soát file, chạy `npm run migrate` để áp dụng hoặc `npm run migrate:status` để xem trạng thái.

Knex lưu lịch sử áp dụng trong bảng `schema_migrations` và dùng bảng khóa `schema_migrations_lock`. Không sửa file migration đã áp dụng ở môi trường khác; hãy tạo file mới cho lần thay đổi tiếp theo.
