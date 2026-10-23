import type { Episode, Series } from "@/features/series/types/series";
import { slugify } from "@/lib/slug";

const episode = (id: number, number: number, title: string): Episode => ({
  id,
  slug: slugify(title),
  number,
  title,
  duration: "48 phút",
  status: "Đã xuất bản",
  synopsis: "Một chương mới trong câu chuyện đầy kịch tính.",
});
export const mockSeries: Series[] = [
  {
    id: 1,
    slug: "the-last-of-us",
    name: "The Last of Us",
    year: "2023",
    genre: "Chính kịch · Hậu tận thế",
    rating: "8.8",
    cast: "Pedro Pascal, Bella Ramsey",
    synopsis:
      "Hai mươi năm sau khi nền văn minh hiện đại bị hủy diệt, Joel được thuê đưa Ellie ra khỏi vùng cách ly.",
    parts: [
      {
        id: 11,
        name: "Phần 1",
        episodes: Array.from({ length: 9 }, (_, i) =>
          episode(
            110 + i,
            i + 1,
            [
              "Khi ta lạc lối",
              "Nhiễm bệnh",
              "Đường dài",
              "Xin lỗi",
              "Sống sót",
              "Họa vô đơn chí",
              "Bỏ lại",
              "Khi cần",
              "Tìm kiếm ánh sáng",
            ][i],
          ),
        ),
      },
      {
        id: 12,
        name: "Phần 2",
        episodes: [
          episode(121, 1, "Ngày mới"),
          episode(122, 2, "Qua mùa đông"),
        ],
      },
    ],
  },
  {
    id: 2,
    slug: "arcane",
    name: "Arcane",
    year: "2021",
    genre: "Hoạt hình · Phiêu lưu",
    rating: "9.0",
    cast: "Hailee Steinfeld, Ella Purnell",
    synopsis:
      "Hai chị em bị chia cắt bởi chiến tranh giữa hai thành phố Piltover và Zaun.",
    parts: [],
  },
];
