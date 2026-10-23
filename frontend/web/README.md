# Cineflow Web

Cineflow Web có hai khu vực dùng chung dữ liệu từ Cineflow API:

| Khu vực | Chức năng chính |
| --- | --- |
| Người xem (`/`) | Khám phá phim đã xuất bản, xem chi tiết, phát phim, đăng ký/đăng nhập và lưu phim yêu thích. |
| Quản trị (`/admin`) | Quản lý phim lẻ, phim bộ, phần, tập, nguồn phát, thể loại, nhân sự và người dùng theo quyền. |

Biên tập viên tạo phim ở trạng thái bản nháp, thêm tập và nguồn phát, xuất bản tập rồi xuất bản phim. Khi đó phim xuất hiện ở khu vực người xem. Phim lẻ có một tập mặc định; phim bộ có một hoặc nhiều phần, mỗi phần có nhiều tập. Người xem có thể chọn tập khác ngay tại trang xem.

API hiện xử lý xác thực, phân quyền và lưu dữ liệu trong MySQL. Màn cài đặt hỗ trợ cập nhật hồ sơ và đổi mật khẩu; cài đặt thương hiệu/thông báo chưa có API. Media hiện dùng metadata và URL nguồn phát, chưa có tải tệp trực tiếp từ web.

- [Hướng dẫn chạy web và API](docs/RUNNING.md)
- [Kiến trúc frontend](docs/ARCHITECTURE.md)
- [Tài liệu API](../../backend/docs/API.md)
