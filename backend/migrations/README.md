# Database migrations

`20261018000100_create_cineflow_core.js` tạo 13 bảng lõi của Cineflow theo [thiết kế cơ sở dữ liệu](../../docs/DATABASE-TABLES.md): tài khoản, phim, phần, tập, thể loại, nhân sự, tệp media, nguồn phát, phụ đề và danh sách đã lưu. Kiểm tra trạng thái migration riêng trên từng môi trường MySQL.

`20261018000200_create_auth_sessions.js` bổ sung bảng `auth_sessions` để lưu hash refresh token, hạn sử dụng và trạng thái thu hồi của từng phiên đăng nhập. Migration này không sửa dữ liệu người dùng hiện có; sau khi cập nhật API, cần áp dụng migration trước khi đăng nhập. Rollback migration này xóa các phiên đăng nhập và buộc người dùng đăng nhập lại.

Migration dùng MySQL/InnoDB, `utf8mb4`, khóa ngoại, chỉ mục và ràng buộc duy nhất. MySQL tự commit các lệnh tạo bảng; nếu lần áp dụng đầu tiên lỗi giữa chừng, cần kiểm tra và xử lý các bảng đã được tạo trước khi chạy lại. Hàm `down` của migration ban đầu xóa toàn bộ 13 bảng theo thứ tự ngược; chạy rollback khi các bảng đã có dữ liệu sẽ làm mất dữ liệu đó.

Các quy tắc liên quan nhiều bản ghi cần được kiểm tra trong API khi triển khai: phim lẻ chỉ có một phần ẩn và một tập; một người có ít nhất một vai trò; mỗi tập có tối đa một phụ đề mặc định. API cũng phải kiểm tra `source_kind` khớp với đúng một trong `media_asset_id`/`playback_url`, và phụ đề có đúng một trong `media_asset_id`/`subtitle_url`. MySQL không cho dùng `CHECK` trên cột khóa ngoại có hành động tham chiếu, nên hai quy tắc nguồn tệp này không nằm trong schema.

Khi bạn quyết định áp dụng schema, chạy `npm run migrate` từ `backend/` với biến `DB_*` đã cấu hình. Knex ghi lịch sử trong `schema_migrations` và khóa trong `schema_migrations_lock`. Để tạo thay đổi sau này, dùng `npm run migrate:create -- ten_thay_doi`; không sửa migration đã áp dụng ở môi trường khác.
