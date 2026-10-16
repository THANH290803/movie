import type { MetadataState } from '@/features/metadata/types/metadata'

export const initialMetadata: MetadataState = {
  version: 1,
  genres: [
    { id: 'sci-fi', name: 'Khoa học viễn tưởng', description: 'Thế giới tương lai, khoa học và những điều vượt khỏi thực tại.', active: true },
    { id: 'drama', name: 'Chính kịch', description: 'Câu chuyện tập trung vào nhân vật và cảm xúc.', active: true },
    { id: 'action', name: 'Hành động', description: 'Nhịp phim nhanh với những pha hành động.', active: true },
    { id: 'crime', name: 'Tội phạm', description: 'Điều tra, bí ẩn và thế giới tội phạm.', active: true },
    { id: 'biography', name: 'Tiểu sử', description: 'Câu chuyện về những nhân vật có thật.', active: true },
    { id: 'animation', name: 'Hoạt hình', description: 'Những câu chuyện được kể qua hình ảnh hoạt họa.', active: true },
    { id: 'adventure', name: 'Phiêu lưu', description: 'Hành trình khám phá và những thử thách mới.', active: true },
    { id: 'post-apocalyptic', name: 'Hậu tận thế', description: 'Cuộc sống sau những biến cố thay đổi thế giới.', active: true },
  ],
  people: [
    { id: 'denis', name: 'Denis Villeneuve', country: 'Canada', biography: 'Đạo diễn Dune và Arrival.', roles: ['director'], active: true },
    { id: 'nolan', name: 'Christopher Nolan', country: 'Anh', biography: 'Đạo diễn Oppenheimer và Interstellar.', roles: ['director'], active: true },
    { id: 'reeves', name: 'Matt Reeves', country: 'Mỹ', biography: 'Đạo diễn The Batman.', roles: ['director'], active: true },
    { id: 'mazin', name: 'Craig Mazin', country: 'Mỹ', biography: 'Đồng sáng tạo The Last of Us.', roles: ['director'], active: true },
    { id: 'timothee', name: 'Timothée Chalamet', country: 'Mỹ', biography: 'Vai Paul Atreides trong Dune.', roles: ['actor'], active: true },
    { id: 'zendaya', name: 'Zendaya', country: 'Mỹ', biography: 'Vai Chani trong Dune.', roles: ['actor'], active: true },
    { id: 'cillian', name: 'Cillian Murphy', country: 'Ireland', biography: 'Vai J. Robert Oppenheimer.', roles: ['actor'], active: true },
    { id: 'emily', name: 'Emily Blunt', country: 'Anh', biography: 'Vai Kitty Oppenheimer.', roles: ['actor'], active: true },
    { id: 'robert', name: 'Robert Pattinson', country: 'Anh', biography: 'Vai Bruce Wayne trong The Batman.', roles: ['actor'], active: true },
    { id: 'zoe', name: 'Zoë Kravitz', country: 'Mỹ', biography: 'Vai Selina Kyle trong The Batman.', roles: ['actor'], active: true },
    { id: 'pedro', name: 'Pedro Pascal', country: 'Chile', biography: 'Vai Joel trong The Last of Us.', roles: ['actor'], active: true },
    { id: 'bella', name: 'Bella Ramsey', country: 'Anh', biography: 'Vai Ellie trong The Last of Us.', roles: ['actor'], active: true },
    { id: 'hailee', name: 'Hailee Steinfeld', country: 'Mỹ', biography: 'Lồng tiếng Vi trong Arcane.', roles: ['actor'], active: true },
    { id: 'ella', name: 'Ella Purnell', country: 'Anh', biography: 'Lồng tiếng Jinx trong Arcane.', roles: ['actor'], active: true },
  ],
  assignments: {
    'movie:1': { title: 'Dune: Part Two', genreIds: ['sci-fi', 'drama'], directorIds: ['denis'], actorIds: ['timothee', 'zendaya'] },
    'movie:2': { title: 'Oppenheimer', genreIds: ['biography', 'drama'], directorIds: ['nolan'], actorIds: ['cillian', 'emily'] },
    'movie:3': { title: 'The Batman', genreIds: ['action', 'crime'], directorIds: ['reeves'], actorIds: ['robert', 'zoe'] },
    'series:1': { title: 'The Last of Us', genreIds: ['drama', 'post-apocalyptic'], directorIds: ['mazin'], actorIds: ['pedro', 'bella'] },
    'series:2': { title: 'Arcane', genreIds: ['animation', 'adventure'], directorIds: [], actorIds: ['hailee', 'ella'] },
  },
}
