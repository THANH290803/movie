import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { WatchScreen } from '@/features/movies/components/watch-screen'
import { mockCatalog } from '@/features/movies/data/mock-catalog'

type Props = {
  params: Promise<{ id: string }>
  searchParams: Promise<{ episode?: string | string[] }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const movie = mockCatalog.find((item) => String(item.id) === id)
  return { title: movie ? `Xem ${movie.name} | Cineflow` : 'Không tìm thấy phim | Cineflow' }
}

export default async function WatchPage({ params, searchParams }: Props) {
  const [{ id }, query] = await Promise.all([params, searchParams])
  const movie = mockCatalog.find((item) => String(item.id) === id)
  if (!movie) notFound()

  return <WatchScreen movie={movie} selectedEpisodeId={typeof query.episode === 'string' ? query.episode : undefined} />
}
