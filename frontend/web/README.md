# Cineflow Web

Đây là ứng dụng web của Cineflow, gồm không gian khám phá phim cho khán giả và không gian quản trị nội dung cho đội vận hành. Web hiện giúp trình bày trải nghiệm người xem, thử các màn hình quản trị và kiểm tra luồng biên tập phim trước khi có dữ liệu chung cho toàn hệ thống.

## Hai khu vực của web

| Khu vực | Người dùng làm gì | Điểm bắt đầu |
| --- | --- | --- |
| Người xem | Xem trang chủ, duyệt danh mục phim công khai và mở trang chi tiết để đọc thông tin phim. | `/` |
| Quản trị | Xem tổng quan; quản lý phim dài, phim bộ và tập; quản lý thể loại, hồ sơ đạo diễn/diễn viên, người dùng và cài đặt. | `/admin/login` |

Luồng của người xem đi từ trang chủ đến kho phim rồi đến chi tiết một phim. Phần công khai hiện là danh mục phim mẫu để minh họa cách khán giả khám phá nội dung; chưa có tính năng phát phim.

Ở khu vực quản trị, người biên tập có thể chuẩn bị thể loại và hồ sơ người, gắn chúng vào phim dài hoặc phim bộ, rồi xem thông tin nội dung trong các màn hình quản lý. Phim bộ có thể được trình bày theo phần và tập. Màn hình đăng nhập hiện chỉ dẫn vào bản xem thử của khu vực quản trị.

## Phạm vi bản demo

- Danh mục công khai dùng dữ liệu mẫu riêng; nội dung chỉnh sửa trong quản trị chưa tự xuất hiện ở khu vực người xem.
- Thể loại, hồ sơ đạo diễn/diễn viên và lựa chọn danh mục của phim được lưu trong trình duyệt đang dùng. Các màn hình phim, tập, người dùng và cài đặt còn chủ yếu dùng dữ liệu mẫu hoặc trạng thái tạm thời.
- Chưa có đăng nhập thật, phân quyền, dữ liệu tập trung hoặc quy trình xuất bản hoàn chỉnh.

## Tài liệu

- [Giới thiệu dự án và quy tắc nghiệp vụ](../../README.md)
- [Hướng dẫn cài đặt, chạy và xử lý lỗi](docs/RUNNING.md)
- [Cấu trúc và quy ước của ứng dụng web](docs/ARCHITECTURE.md)
