# Cấu trúc cơ sở dữ liệu Cineflow

> **Trạng thái:** Thiết kế đã được duyệt và [migration cho 13 bảng lõi](../backend/migrations/20261018000100_create_cineflow_core.js) đã được tạo. [Migration `auth_sessions`](../backend/migrations/20261018000200_create_auth_sessions.js) bổ sung phiên đăng nhập sau bản thiết kế DOCX v1. Trạng thái áp dụng migration phụ thuộc từng môi trường MySQL. Tài liệu này tóm tắt các bảng; kiểu dữ liệu, khả năng `NULL` và ràng buộc chi tiết của 13 bảng lõi nằm trong [bản thiết kế DOCX](Cineflow-Database-Design-v1.docx).

## Tổng quan

| Nhóm | Bảng | Chức năng |
| --- | --- | --- |
| Tài khoản | `users`, `auth_sessions`, `saved_titles` | Quản lý người dùng, phiên đăng nhập và danh sách phim đã lưu. |
| Danh mục phim | `titles`, `seasons`, `episodes` | Lưu phim lẻ, phim bộ, phần và tập. |
| Thể loại, nhân sự | `genres`, `people`, `person_roles`, `title_genres`, `title_people` | Quản lý thể loại, đạo diễn, diễn viên và liên kết với phim. |
| Tệp và phát phim | `media_assets`, `episode_sources`, `episode_subtitles` | Lưu thông tin tệp, nguồn video và phụ đề. |

**Quan hệ chính:** `titles` → `seasons` → `episodes` → `episode_sources` / `episode_subtitles`. `title_genres` nối phim với thể loại; `title_people` nối phim với người và vai trò; `saved_titles` nối người dùng với phim đã lưu.

**Quy ước:** `id` là khóa chính (PK); cột kết thúc bằng `_id` thường là khóa ngoại (FK). Bảng liên kết có thể dùng nhiều cột làm khóa chính. `created_at` và `updated_at` lần lượt là thời điểm tạo và sửa. Cấu trúc nằm trong file migration; kiểm tra riêng trạng thái ở từng database.

## 1. Tài khoản và danh sách đã lưu

### `users` — tài khoản người dùng

| Thuộc tính | Ý nghĩa |
| --- | --- |
| `id` | Khóa chính. |
| `full_name`, `email` | Tên hiển thị và email đăng nhập; `email` không trùng. |
| `slug` | Định danh công khai, duy nhất, dùng cho URL hồ sơ như `/users/nguyen-minh-anh`. |
| `password_hash` | Mật khẩu đã băm; có thể để trống khi tài khoản mới được mời. |
| `role`, `plan_code`, `status` | Quyền (`viewer` / `editor` / `admin`), nhãn gói (`free` / `premium`) và trạng thái (`invited` / `active` / `suspended`). |
| `created_at`, `updated_at`, `last_login_at`, `deleted_at` | Thời điểm tạo, sửa, đăng nhập gần nhất và xóa mềm. |

### `auth_sessions` — phiên đăng nhập và refresh token

| Thuộc tính | Ý nghĩa |
| --- | --- |
| `id` | UUID của phiên; access token mang mã phiên này để kiểm tra trạng thái. |
| `user_id` | Khóa ngoại đến `users`; xóa người dùng sẽ xóa các phiên. |
| `refresh_token_hash` | SHA-256 của refresh token hiện tại; token gốc chỉ gửi cho client. |
| `expires_at`, `revoked_at` | Hạn sử dụng và thời điểm thu hồi phiên. |
| `created_at`, `last_used_at` | Thời điểm tạo và làm mới gần nhất. |

Mỗi lần gọi refresh thành công sẽ thay hash token hiện tại, nên token cũ hết hiệu lực. Logout hoặc đổi mật khẩu thu hồi phiên; bảng này là phần mở rộng của schema v1.

### `saved_titles` — phim người dùng đã lưu

| Thuộc tính | Ý nghĩa |
| --- | --- |
| `user_id`, `title_id` | Khóa ngoại đến `users` và `titles`; cặp này là khóa chính để tránh lưu trùng. |
| `created_at` | Thời điểm lưu phim. |

## 2. Phim, phần và tập

### `titles` — thông tin chung của phim

Một bản ghi đại diện cho một phim lẻ hoặc một phim bộ.

| Thuộc tính | Ý nghĩa |
| --- | --- |
| `id` | Khóa chính. |
| `kind` | Loại phim: `movie` hoặc `series`. |
| `name`, `original_name`, `slug` | Tên hiển thị, tên gốc và định danh duy nhất dùng trong URL. |
| `release_year`, `synopsis`, `editorial_rating` | Năm phát hành, mô tả và điểm do biên tập viên nhập (0–10). |
| `status`, `scheduled_at`, `published_at` | Trạng thái (`draft` / `scheduled` / `published` / `archived`), lịch và thời điểm xuất bản. |
| `poster_asset_id`, `backdrop_asset_id` | Khóa ngoại đến ảnh poster và ảnh nền trong `media_assets`. |
| `created_by_user_id`, `updated_by_user_id` | Khóa ngoại đến người tạo và người sửa trong `users`. |
| `created_at`, `updated_at`, `deleted_at` | Thời điểm tạo, sửa và xóa mềm. |

### `seasons` — phần phim

| Thuộc tính | Ý nghĩa |
| --- | --- |
| `id`, `title_id` | Khóa chính và khóa ngoại đến `titles`. |
| `season_number`, `name` | Số thứ tự và tên phần; số phần không trùng trong cùng một phim. |
| `is_implicit` | Đánh dấu phần nội bộ cần ẩn trên giao diện. |
| `created_at`, `updated_at` | Thời điểm tạo và sửa. |

### `episodes` — tập phim

| Thuộc tính | Ý nghĩa |
| --- | --- |
| `id`, `season_id` | Khóa chính và khóa ngoại đến `seasons`. |
| `episode_number`, `name`, `synopsis` | Số tập, tên và tóm tắt; số tập không trùng trong cùng một phần. |
| `slug` | Định danh tập duy nhất dùng cho đường dẫn sửa tập, ví dụ `khi-ta-lac-loi`. |
| `duration_seconds` | Thời lượng tính bằng giây. |
| `status`, `scheduled_at`, `published_at` | Trạng thái, lịch và thời điểm xuất bản của tập. |
| `thumbnail_asset_id` | Khóa ngoại đến ảnh đại diện tập trong `media_assets`. |
| `created_at`, `updated_at` | Thời điểm tạo và sửa. |

**Quy tắc hiển thị:** Phim lẻ có một phần nội bộ ẩn (`season_number = 0`) và một tập. Phim bộ có thể có một hoặc nhiều phần; mỗi phần có nhiều tập. Phim bộ chỉ có một phần có thể ẩn lựa chọn phần trên giao diện. Nhóm tập 1–12, 13–24… chỉ là cách hiển thị, không cần bảng riêng.

**Quy tắc URL:** Trang chi tiết dùng slug thay cho ID: `/movies/dune-part-two`, `/admin/series/the-last-of-us`, `/users/nguyen-minh-anh`; đường dẫn sửa tập dùng `/admin/series/the-last-of-us/episodes/khi-ta-lac-loi/edit`. `slug` cần duy nhất và ổn định sau khi tạo; khi trùng tên, thêm hậu tố phân biệt không dựa vào ID. ID vẫn là khóa chính/khóa ngoại nội bộ và không xuất hiện ở đoạn động của URL. Trang `/users/[slug]` là quy ước cho khi có trang hồ sơ; hiện frontend chưa có trang này.

## 3. Thể loại và người tham gia

### `genres` — thể loại

| Thuộc tính | Ý nghĩa |
| --- | --- |
| `id` | Khóa chính. |
| `name`, `normalized_name` | Tên hiển thị và tên chuẩn hóa để kiểm tra trùng. |
| `description`, `is_active` | Mô tả và trạng thái còn được chọn khi biên tập. |
| `created_at`, `updated_at` | Thời điểm tạo và sửa. |

### `people` — hồ sơ đạo diễn/diễn viên

Một người dùng chung một hồ sơ, dù đảm nhận cả hai vai trò.

| Thuộc tính | Ý nghĩa |
| --- | --- |
| `id` | Khóa chính. |
| `name`, `normalized_name` | Họ tên và tên chuẩn hóa để kiểm tra trùng. |
| `country`, `biography` | Quốc gia và giới thiệu. |
| `is_active` | Trạng thái còn được chọn khi biên tập. |
| `created_at`, `updated_at` | Thời điểm tạo và sửa. |

### `person_roles` — vai trò của một người

| Thuộc tính | Ý nghĩa |
| --- | --- |
| `person_id`, `role` | Khóa chính ghép; `person_id` tham chiếu `people`, `role` là `director` hoặc `actor`. Một người có thể có cả hai vai trò. |

### `title_genres` — gắn thể loại vào phim

| Thuộc tính | Ý nghĩa |
| --- | --- |
| `title_id`, `genre_id` | Khóa chính ghép và hai khóa ngoại đến `titles`, `genres`; một phim có nhiều thể loại. |

### `title_people` — gắn đạo diễn/diễn viên vào phim

| Thuộc tính | Ý nghĩa |
| --- | --- |
| `title_id`, `person_id`, `role` | Khóa chính ghép; phim, người và vai trò. Cặp (`person_id`, `role`) phải tồn tại trong `person_roles`. |
| `credit_order`, `character_name` | Thứ tự hiển thị và tên nhân vật nếu là diễn viên. |

## 4. Tệp, video và phụ đề

### `media_assets` — thông tin tệp đã tải lên

Bảng này lưu thông tin và khóa truy cập tệp, không lưu nội dung video trực tiếp trong MySQL.

| Thuộc tính | Ý nghĩa |
| --- | --- |
| `id` | Khóa chính. |
| `asset_kind`, `storage_key` | Loại tệp (`poster` / `backdrop` / `thumbnail` / `video` / `subtitle`) và khóa lưu trữ duy nhất. |
| `mime_type`, `size_bytes`, `processing_status` | Định dạng MIME, kích thước và trạng thái xử lý (`uploaded` / `ready` / `failed`). |
| `created_by_user_id`, `created_at` | Người tải lên (tham chiếu `users`) và thời điểm tạo. |

### `episode_sources` — nguồn phát video của tập

| Thuộc tính | Ý nghĩa |
| --- | --- |
| `id`, `episode_id` | Khóa chính và khóa ngoại đến `episodes`. |
| `source_kind`, `media_asset_id`, `playback_url` | Nguồn tải lên hoặc URL ngoài; mỗi nguồn chỉ dùng **một** trong `media_asset_id` và `playback_url`. |
| `format`, `priority`, `is_active` | Định dạng (`mp4` / `webm` / `hls` / `dash`), thứ tự ưu tiên và trạng thái sử dụng. |
| `created_at` | Thời điểm tạo. |

### `episode_subtitles` — phụ đề của tập

| Thuộc tính | Ý nghĩa |
| --- | --- |
| `id`, `episode_id` | Khóa chính và khóa ngoại đến `episodes`. |
| `language_code`, `label`, `format` | Mã ngôn ngữ, tên hiển thị và định dạng (`vtt` / `srt`). |
| `media_asset_id`, `subtitle_url` | Tệp phụ đề tải lên hoặc URL phụ đề ngoài. |
| `is_default`, `created_at` | Phụ đề mặc định và thời điểm tạo. |

## Chưa đưa vào 13 bảng lõi

| Bảng dự kiến | Khi nào cần |
| --- | --- |
| `watch_progress` | Lưu tiến độ xem, lịch sử xem và đồng bộ nhiều thiết bị. |
| `site_settings` | Lưu cài đặt trang từ giao diện quản trị. |
| `admin_audit_logs` | Ghi nhật ký thao tác quản trị. |
| `plans`, `user_subscriptions` | Quản lý gói dịch vụ và thời hạn đăng ký thực tế. |

Các bảng này chỉ được bổ sung khi có luồng nghiệp vụ tương ứng, bằng migration riêng.
