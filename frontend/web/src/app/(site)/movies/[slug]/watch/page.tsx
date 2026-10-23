import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { WatchScreen } from '@/features/movies/components/watch-screen'
import { getPlayback, getPublicTitle } from '@/features/movies/lib/catalog-api'
import { ApiServerError } from '@/lib/api/server'

export const dynamic = 'force-dynamic'

type Props = {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ episode?: string | string[] }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const movie = await getPublicTitle((await params).slug)
    return { title: `Xem ${movie.name} | Cineflow` }
  } catch (error) {
    if (error instanceof ApiServerError && error.status === 404) return { title: 'Không tìm thấy phim | Cineflow' }
    throw error
  }
}

export default async function WatchPage({ params, searchParams }: Props) {
  const [{ slug }, query] = await Promise.all([params, searchParams])
  const selectedEpisodeSlug = typeof query.episode === 'string' ? query.episode : undefined
  let movie
  try { movie = await getPublicTitle(slug) } catch (error) {
    if (error instanceof ApiServerError && error.status === 404) notFound()
    throw error
  }
  let videoUrl: string | undefined
  let playableEpisodeSlug: string | undefined
  let subtitles: { languageCode: string; label: string; url: string; isDefault: boolean }[] = []
  try {
    const playback = await getPlayback(slug, selectedEpisodeSlug)
    videoUrl = playback.source.url
    playableEpisodeSlug = playback.episode.slug
    subtitles = playback.subtitles
  } catch (error) {
    if (error instanceof ApiServerError && error.status === 404) notFound()
    if (!(error instanceof ApiServerError && error.status === 503)) throw error
  }
  if (movie.type === 'Phim lẻ') return <WatchScreen movie={{ ...movie, videoUrl }} subtitles={subtitles} />
  const activeSlug = selectedEpisodeSlug ?? playableEpisodeSlug ?? movie.parts.flatMap((part) => part.episodes)[0]?.slug
  return <WatchScreen movie={{ ...movie, parts: movie.parts.map((part) => ({
    ...part,
    episodes: part.episodes.map((episode) => episode.slug === activeSlug ? { ...episode, videoUrl } : episode),
  })) }} selectedEpisodeSlug={activeSlug} subtitles={subtitles} />
}
