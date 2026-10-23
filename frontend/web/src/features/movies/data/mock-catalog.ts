import type { CatalogMovie } from '@/features/movies/types/catalog-movie'

// Dữ liệu mẫu cho giao diện công khai. Thay bằng API phim khi backend sẵn sàng.
export const mockCatalog: CatalogMovie[] = [
  { id: 1, slug: 'dune-part-two', name: 'Dune: Part Two', year: '2024', genre: 'Khoa học viễn tưởng · Phiêu lưu', cast: 'Timothée Chalamet, Zendaya', synopsis: 'Paul Atreides hợp nhất với Chani và người Fremen trong hành trình trả thù những kẻ đã hủy diệt gia đình anh.', type: 'Phim lẻ', duration: '2h 46m', rating: '8.8', image: '/images/movies/dune.jpg' },
  { id: 3, slug: 'the-batman', name: 'The Batman', year: '2022', genre: 'Hành động · Tội phạm', cast: 'Robert Pattinson, Zoë Kravitz', synopsis: 'Batman khám phá tham nhũng ẩn sâu trong thành phố Gotham khi một kẻ sát nhân để lại những manh mối bí ẩn.', type: 'Phim lẻ', duration: '2h 56m', rating: '7.8', image: '/images/movies/neon-nights.jpg' },
  {
    id: 4, slug: 'the-last-horizon', name: 'The Last Horizon', year: '2024', genre: 'Hành động · Kịch tính', cast: 'Đang cập nhật',
    synopsis: 'Một nhóm phi hành gia chiến đấu để đưa nhân loại tìm thấy nơi trú ẩn cuối cùng.',
    type: 'Phim bộ', rating: '8.4', image: '/images/movies/last-horizon.jpg',
    parts: [
      { id: 401, name: 'Phần 1', episodes: [
        { id: 40101, number: 1, title: 'Tín hiệu đầu tiên', duration: '48 phút', synopsis: 'Một tín hiệu lạ mở ra hy vọng về nơi trú ẩn mới.' },
        { id: 40102, number: 2, title: 'Rời khỏi Trái Đất', duration: '51 phút', synopsis: 'Phi hành đoàn bắt đầu chuyến đi không thể quay đầu.' },
        { id: 40103, number: 3, title: 'Vùng tối', duration: '47 phút', synopsis: 'Sự cố bất ngờ buộc mọi người phải đưa ra lựa chọn khó khăn.' },
      ] },
      { id: 402, name: 'Phần 2', episodes: [
        { id: 40201, number: 1, title: 'Chân trời mới', duration: '50 phút', synopsis: 'Những người sống sót tiến gần hơn đến hành tinh bí ẩn.' },
        { id: 40202, number: 2, title: 'Điểm đến cuối cùng', duration: '49 phút', synopsis: 'Bí mật đằng sau tín hiệu đầu tiên dần được hé lộ.' },
      ] },
    ],
  },
  { id: 5, slug: 'neon-nights', name: 'Neon Nights', year: '2023', genre: 'Tâm lý · Tội phạm', cast: 'Đang cập nhật', synopsis: 'Một đêm dài trong thành phố neon hé lộ những bí mật không ai muốn đối diện.', type: 'Phim lẻ', duration: '2h 08m', rating: '8.1', image: '/images/movies/neon-nights.jpg' },
  {
    id: 6, slug: 'into-the-wild', name: 'Into The Wild', year: '2024', genre: 'Phiêu lưu · Gia đình', cast: 'Đang cập nhật',
    synopsis: 'Hành trình trở về thiên nhiên của một gia đình giữa những ngọn núi hùng vĩ.',
    type: 'Phim bộ', rating: '7.9', image: '/images/movies/into-the-wild.jpg',
    parts: [{ id: 601, name: 'Phần 1', episodes: [
      { id: 60101, number: 1, title: 'Lên đường', duration: '42 phút', synopsis: 'Cả gia đình bỏ lại nhịp sống quen thuộc để bắt đầu chuyến đi.' },
      { id: 60102, number: 2, title: 'Con đường xuyên rừng', duration: '44 phút', synopsis: 'Họ học cách thích nghi với những thử thách đầu tiên.' },
      { id: 60103, number: 3, title: 'Qua dãy núi', duration: '46 phút', synopsis: 'Một cơn bão làm thay đổi kế hoạch của cả đoàn.' },
      { id: 60104, number: 4, title: 'Trở về', duration: '45 phút', synopsis: 'Hành trình khép lại bằng một góc nhìn mới về gia đình.' },
    ] }],
  },
  { id: 7, slug: 'after-the-rain', name: 'After the Rain', year: '2024', genre: 'Tình cảm · Chính kịch', cast: 'Đang cập nhật', synopsis: 'Một cuộc gặp lại sau nhiều năm thay đổi cách hai người nhìn về quá khứ.', type: 'Phim lẻ', duration: '1h 54m', rating: '8.2', image: '/images/movies/after-the-rain.jpg' },
  {
    id: 8, slug: 'the-bear-lake', name: 'The Bear Lake', year: '2024', genre: 'Kinh dị · Bí ẩn', cast: 'Đang cập nhật',
    synopsis: 'Những điều kỳ lạ xảy ra quanh hồ nước nơi không ai dám đặt chân tới.',
    type: 'Phim bộ', rating: '8.0', image: '/images/movies/bear-lake.jpg',
    parts: [{ id: 801, name: 'Phần 1', episodes: [
      { id: 80101, number: 1, title: 'Bờ hồ vắng', duration: '43 phút', synopsis: 'Một chuyến đi cuối tuần mở đầu chuỗi sự kiện khó lý giải.' },
      { id: 80102, number: 2, title: 'Dấu vết dưới nước', duration: '45 phút', synopsis: 'Những bí mật cũ trỗi dậy khi cả nhóm tìm thấy một manh mối.' },
      { id: 80103, number: 3, title: 'Điều không được kể', duration: '47 phút', synopsis: 'Sự thật về hồ nước cuối cùng cũng được phơi bày.' },
      // Các tập 4–50 là dữ liệu minh họa để xem thử giao diện phim dài tập.
      ...Array.from({ length: 47 }, (_, index) => {
        const number = index + 4
        return {
          id: 80100 + number,
          number,
          title: `Bí ẩn hồ nước ${number}`,
          duration: `${40 + (number % 10)} phút`,
          synopsis: `Nội dung minh họa cho tập ${number} để kiểm tra giao diện phim dài tập.`,
        }
      }),
    ] }],
  },
]
