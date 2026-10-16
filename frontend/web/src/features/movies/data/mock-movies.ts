import type { Movie } from "@/features/movies/types/movie";

export const mockMovies: Movie[] = [
  {
    id: 1,
    name: "Dune: Part Two",
    year: "2024",
    status: "Đang chiếu",
    genre: "Khoa học viễn tưởng",
    cast: "Timothée Chalamet, Zendaya",
    synopsis:
      "Paul Atreides hợp nhất với Chani và người Fremen trong hành trình trả thù những kẻ đã hủy diệt gia đình anh.",
  },
  {
    id: 2,
    name: "Oppenheimer",
    year: "2023",
    status: "Bản nháp",
    genre: "Tiểu sử · Chính kịch",
    cast: "Cillian Murphy, Emily Blunt",
    synopsis:
      "Câu chuyện về nhà vật lý J. Robert Oppenheimer và những lựa chọn làm thay đổi lịch sử thế giới.",
  },
  {
    id: 3,
    name: "The Batman",
    year: "2022",
    status: "Đang chiếu",
    genre: "Hành động · Tội phạm",
    cast: "Robert Pattinson, Zoë Kravitz",
    synopsis:
      "Batman khám phá tham nhũng ẩn sâu trong thành phố Gotham khi một kẻ sát nhân để lại những manh mối bí ẩn.",
  },
];
