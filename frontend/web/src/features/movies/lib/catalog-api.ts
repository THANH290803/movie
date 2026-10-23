import type { CatalogMovie, CatalogPart } from '@/features/movies/types/catalog-movie'
import type { ApiPage, ApiTitle, ApiTitleDetail } from '@/lib/api/types'
import { serverApi } from '@/lib/api/server'

const fallbackPoster = '/images/movies/neon-nights.jpg'

function duration(seconds: number | null) {
  if (!seconds) return 'Đang cập nhật'
  const minutes = Math.round(seconds / 60)
  return minutes >= 60 ? `${Math.floor(minutes / 60)}h ${String(minutes % 60).padStart(2, '0')}m` : `${minutes} phút`
}

export function catalogSummary(title: ApiTitle): CatalogMovie {
  const base = {
    id: title.id, slug: title.slug, name: title.name, year: String(title.releaseYear ?? '—'),
    genre: 'Đang cập nhật', cast: 'Đang cập nhật', synopsis: title.synopsis ?? '',
    rating: title.editorialRating?.toFixed(1) ?? '—',
    image: title.posterUrl ?? title.backdropUrl ?? fallbackPoster,
  }
  return title.kind === 'movie'
    ? { ...base, type: 'Phim lẻ', duration: 'Đang cập nhật' }
    : { ...base, type: 'Phim bộ', parts: [] }
}

export function catalogDetail(title: ApiTitleDetail): CatalogMovie {
  const base = catalogSummary(title)
  const common = {
    ...base,
    genre: title.genres.map((genre) => genre.name).join(' · ') || 'Đang cập nhật',
    cast: title.credits.filter((credit) => credit.role === 'actor').map((credit) => credit.name).join(', ') || 'Đang cập nhật',
  }
  if (title.kind === 'movie') {
    const episode = title.seasons[0]?.episodes[0]
    return { ...common, type: 'Phim lẻ', duration: duration(episode?.durationSeconds ?? null) }
  }
  const parts: CatalogPart[] = title.seasons.map((season) => ({
    id: season.id, name: season.name,
    episodes: season.episodes.map((episode) => ({
      id: episode.id, slug: episode.slug, number: episode.episodeNumber, title: episode.name,
      duration: duration(episode.durationSeconds), synopsis: episode.synopsis ?? '',
    })),
  }))
  return { ...common, type: 'Phim bộ', parts }
}

export async function getPublicTitles(search = '', genre = '') {
  const query = new URLSearchParams({ page: '1', pageSize: '100' })
  if (search) query.set('search', search)
  if (genre) query.set('genre', genre)
  const titles: ApiTitle[] = []
  for (let page = 1; ; page++) {
    query.set('page', String(page))
    const result = await serverApi<ApiPage<ApiTitle>>(`/catalog/titles?${query}`)
    titles.push(...result.data)
    if (page >= result.pagination.totalPages) return titles.map(catalogSummary)
  }
}

export type Playback = {
  titleSlug: string
  episode: { slug: string; name: string; episodeNumber: number }
  source: { id: string; format: 'mp4' | 'webm' | 'hls' | 'dash'; url: string }
  subtitles: { languageCode: string; label: string; url: string; isDefault: boolean }[]
}

export async function getPlayback(slug: string, episodeSlug?: string) {
  const path = episodeSlug
    ? `/catalog/titles/${encodeURIComponent(slug)}/episodes/${encodeURIComponent(episodeSlug)}/playback`
    : `/catalog/titles/${encodeURIComponent(slug)}/playback`
  return serverApi<Playback>(path)
}

export async function getPublicTitle(slug: string) {
  const result = await serverApi<{ title: ApiTitleDetail }>(`/catalog/titles/${encodeURIComponent(slug)}`)
  return catalogDetail(result.title)
}
