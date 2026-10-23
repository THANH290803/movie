'use client'

import { useState } from 'react'
import { Search } from 'lucide-react'
import { MovieCard } from '@/features/movies/components/movie-card'
import type { CatalogMovie } from '@/features/movies/types/catalog-movie'

type MovieType = 'Tất cả' | CatalogMovie['type']
const types: MovieType[] = ['Tất cả', 'Phim lẻ', 'Phim bộ']

export function CatalogScreen({ movies, query = '', genre = '' }: { movies: CatalogMovie[]; query?: string; genre?: string }) {
  const [type, setType] = useState<MovieType>('Tất cả')
  const normalizedQuery = query.trim().toLocaleLowerCase('vi')
  const results = movies.filter((movie) =>
    (type === 'Tất cả' || movie.type === type) &&
    (!normalizedQuery || `${movie.name} ${movie.cast} ${movie.genre}`.toLocaleLowerCase('vi').includes(normalizedQuery)),
  )

  return (
    <section className="cine-discover">
      <div className="cine-page-heading">
        <div>
          <p className="cine-kicker orange">BỘ SƯU TẬP CINEFLOW</p>
          <h1>Khám phá phim</h1>
          <p>{query ? `Kết quả tìm kiếm cho “${query}”` : genre ? `Thể loại: ${genre}` : 'Tìm kiếm câu chuyện tiếp theo dành riêng cho bạn.'}</p>
        </div>
        <div className="cine-filter-row" aria-label="Lọc loại phim">
          {types.map((item) => <button key={item} type="button" className={type === item ? 'is-active' : ''} onClick={() => setType(item)} aria-pressed={type === item}>{item}</button>)}
        </div>
      </div>
      {results.length > 0 ? <div className="cine-card-grid cine-discover-grid">{results.map((movie) => <MovieCard key={movie.id} movie={movie} />)}</div> : (
        <div className="cine-empty"><Search size={32} /><h2>Không tìm thấy phim</h2><p>Thử từ khóa hoặc bộ lọc khác.</p></div>
      )}
    </section>
  )
}
