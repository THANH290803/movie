'use client'

import Link from 'next/link'
import { Heart } from 'lucide-react'
import { routes } from '@/config/routes'
import { MovieCard } from '@/features/movies/components/movie-card'
import { useSavedMovies } from '@/features/movies/hooks/use-saved-movies'
import type { CatalogMovie } from '@/features/movies/types/catalog-movie'

export function SavedScreen({ movies }: { movies: CatalogMovie[] }) {
  const { savedIds } = useSavedMovies()
  const savedMovies = movies.filter((movie) => savedIds.includes(movie.id))

  return (
    <section className="cine-discover">
      <div className="cine-page-heading"><div><p className="cine-kicker orange">THƯ VIỆN CÁ NHÂN</p><h1>Danh sách của tôi</h1><p>Những bộ phim bạn muốn xem sau.</p></div></div>
      {savedMovies.length > 0 ? <div className="cine-card-grid cine-discover-grid">{savedMovies.map((movie) => <MovieCard key={movie.id} movie={movie} />)}</div> : (
        <div className="cine-empty"><Heart size={32} /><h2>Danh sách đang trống</h2><p>Nhấn biểu tượng trái tim trên phim để lưu lại tại đây.</p><Link className="cine-primary-button" href={routes.site.movies}>Khám phá phim</Link></div>
      )}
    </section>
  )
}
