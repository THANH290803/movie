import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { CatalogDetailScreen } from '@/features/movies/components/catalog-detail-screen'
import { mockCatalog } from '@/features/movies/data/mock-catalog'

type Props = { params: Promise<{ id: string }> }

function findMovie(id: string) {
  return mockCatalog.find((movie) => String(movie.id) === id)
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const movie = findMovie(id)
  return { title: movie ? `${movie.name} | Cineflow` : 'Không tìm thấy phim | Cineflow' }
}

export default async function MoviePage({ params }: Props) {
  const { id } = await params
  const movie = findMovie(id)
  if (!movie) notFound()
  const relatedMovies = mockCatalog.filter((item) => item.id !== movie.id).slice(0, 3)
  return <CatalogDetailScreen movie={movie} relatedMovies={relatedMovies} />
}
