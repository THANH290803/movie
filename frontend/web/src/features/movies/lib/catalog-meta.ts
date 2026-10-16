import type { CatalogMovie } from '@/features/movies/types/catalog-movie'

export function getCatalogMeta(movie: CatalogMovie) {
  if (movie.type === 'Phim lẻ') return movie.duration
  return `${movie.parts.length} phần`
}
