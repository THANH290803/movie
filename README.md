# Cineflow

Cineflow là dự án xây dựng không gian khám phá phim cho khán giả và không gian quản lý nội dung cho đội vận hành. Khán giả có thể xem danh mục, mở trang chi tiết và tìm hiểu nội dung phim. Đội vận hành có thể chuẩn bị thông tin phim dài, phim bộ, tập phim và các danh mục liên quan trước khi đưa nội dung đến khán giả.

## Đối tượng sử dụng

| Đối tượng | Nhu cầu chính |
| --- | --- |
| Khán giả | Khám phá phim và xem thông tin chi tiết như tên, năm phát hành, thể loại, mô tả và diễn viên. |
| Người quản trị nội dung | Quản lý phim dài, phim bộ, phần, tập, thể loại và hồ sơ đạo diễn/diễn viên. |
| Người vận hành | Theo dõi tổng quan, tài khoản người dùng và các tùy chọn vận hành. Các màn hình này hiện mang tính minh họa. |

## Luồng nội dung

1. **Chuẩn bị danh mục:** Tạo hoặc cập nhật thể loại và hồ sơ người tham gia sản xuất. Một người có thể vừa là đạo diễn vừa là diễn viên.
2. **Biên tập phim:** Tạo phim dài như nội dung có một tập duy nhất, hoặc tạo phim bộ gồm nhiều tập. Phim bộ có thể chia thành các phần hoặc thêm tập trực tiếp. Người biên tập gắn thể loại, đạo diễn và diễn viên cho nội dung.
3. **Rà soát và phát hành:** Giao diện quản trị cho phép xem trước và chọn trạng thái nội dung, chẳng hạn bản nháp hoặc đã xuất bản. Quy trình phát hành thực tế và việc đồng bộ sang danh mục công khai chưa được triển khai.
4. **Khám phá:** Khán giả duyệt danh mục công khai và mở trang chi tiết phim. Danh mục công khai hiện dùng nội dung mẫu riêng, nên thay đổi ở khu vực quản trị chưa tự xuất hiện tại đây.

## Quy tắc nghiệp vụ hiện có

- Tên thể loại và hồ sơ người phải có nội dung, không quá 100 ký tự và không được trùng với mục khác; việc so trùng bỏ qua chữ hoa, chữ thường và dấu tiếng Việt.
- Hồ sơ người phải có ít nhất một vai trò: đạo diễn hoặc diễn viên. Một hồ sơ có thể mang cả hai vai trò.
- Thể loại hoặc hồ sơ đang được phim sử dụng không thể bị xóa. Có thể ẩn mục đó để ngừng chọn cho nội dung mới mà vẫn giữ liên kết cũ.
- Không thể bỏ vai trò đạo diễn hoặc diễn viên khỏi một hồ sơ nếu phim đang sử dụng hồ sơ theo vai trò đó. Lựa chọn danh mục của phim cũng phải tham chiếu đến mục và vai trò còn tồn tại.

## Trạng thái dự án

Cineflow hiện là bản demo cho các luồng trên. Trang đăng nhập quản trị chưa xác thực tài khoản hoặc kiểm soát quyền truy cập. Một số thay đổi danh mục được giữ trên trình duyệt đang dùng; các màn hình phim, tập phim, người dùng và cài đặt còn chủ yếu sử dụng dữ liệu mẫu hoặc trạng thái tạm thời. Chưa có dữ liệu tập trung, quy trình xuất bản hoàn chỉnh hay đồng bộ nội dung giữa khu vực quản trị và khu vực khán giả.
