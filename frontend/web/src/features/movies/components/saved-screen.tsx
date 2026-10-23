'use client'

import Link from 'next/link'
import { Heart } from 'lucide-react'
import { routes } from '@/config/routes'
import { MovieCard } from '@/features/movies/components/movie-card'
import { useSavedMovies } from '@/features/movies/hooks/use-saved-movies'
import type { CatalogMovie } from '@/features/movies/types/catalog-movie'
import type { ApiTitle } from '@/lib/api/types'

function toCatalogMovie(title: ApiTitle): CatalogMovie {
  const base = {
    id: title.id, slug: title.slug, name: title.name, year: String(title.releaseYear ?? '—'),
    genre: 'Đang cập nhật', cast: 'Đang cập nhật', synopsis: title.synopsis ?? '',
    rating: title.editorialRating?.toFixed(1) ?? '—',
    image: title.posterUrl ?? title.backdropUrl ?? '/images/movies/neon-nights.jpg',
  }
  return title.kind === 'movie'
    ? { ...base, type: 'Phim lẻ', duration: 'Đang cập nhật' }
    : { ...base, type: 'Phim bộ', parts: [] }
}

export function SavedScreen() {
  const { movies, loading, error } = useSavedMovies()
  const savedMovies = movies.map(toCatalogMovie)

  return (
    <section className="cine-discover">
      <div className="cine-page-heading"><div><p className="cine-kicker orange">THƯ VIỆN CÁ NHÂN</p><h1>Danh sách của tôi</h1><p>Những bộ phim bạn muốn xem sau.</p></div></div>
      {error && <p role="alert" className="mb-4 text-red-500">{error}</p>}
      {loading ? <p>Đang tải danh sách đã lưu...</p> : savedMovies.length > 0 ? <div className="cine-card-grid cine-discover-grid">{savedMovies.map((movie) => <MovieCard key={movie.id} movie={movie} />)}</div> : (
        <div className="cine-empty"><Heart size={32} /><h2>Danh sách đang trống</h2><p>Nhấn biểu tượng trái tim trên phim để lưu lại tại đây.</p><Link className="cine-primary-button" href={routes.site.movies}>Khám phá phim</Link></div>
      )}
    </section>
  )
}
