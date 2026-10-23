import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { CatalogDetailScreen } from '@/features/movies/components/catalog-detail-screen'
import { getPublicTitle, getPublicTitles } from '@/features/movies/lib/catalog-api'
import { ApiServerError } from '@/lib/api/server'

export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const movie = await getPublicTitle((await params).slug)
    return { title: `${movie.name} | Cineflow` }
  } catch (error) {
    if (error instanceof ApiServerError && error.status === 404) return { title: 'Không tìm thấy phim | Cineflow' }
    throw error
  }
}

export default async function MoviePage({ params }: Props) {
  const { slug } = await params
  let movie
  try { movie = await getPublicTitle(slug) } catch (error) {
    if (error instanceof ApiServerError && error.status === 404) notFound()
    throw error
  }
  const relatedMovies = (await getPublicTitles()).filter((item) => item.slug !== slug).slice(0, 3)
  return <CatalogDetailScreen movie={movie} relatedMovies={relatedMovies} />
}
