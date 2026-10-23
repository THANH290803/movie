'use client'

import { api } from './client'
import type { ApiEpisode, ApiGenre, ApiMediaAsset, ApiPage, ApiPerson, ApiSource, ApiSubtitle, ApiTitle, ApiTitleDetail, ApiUser } from './types'

const json = (body: unknown) => ({ headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
const query = (params: Record<string, string | number | undefined>) => new URLSearchParams(Object.entries(params).filter((entry): entry is [string, string | number] => entry[1] !== undefined).map(([key, value]) => [key, String(value)])).toString()

async function allPages<T>(fetchPage: (page: number) => Promise<ApiPage<T>>) {
  const rows: T[] = []
  for (let page = 1; ; page++) {
    const result = await fetchPage(page)
    rows.push(...result.data)
    if (page >= result.pagination.totalPages) return rows
  }
}

export const adminApi = {
  dashboard: () => api<{ users: number; movies: number; series: number; publishedTitles: number; episodes: number; genres: number; people: number }>('/admin/dashboard'),
  users: (page = 1, pageSize = 10, search = '') => api<ApiPage<ApiUser>>(`/admin/users?${query({ page, pageSize, search })}`),
  createUser: (body: unknown) => api<{ user: ApiUser }>('/admin/users', { method: 'POST', ...json(body) }),
  updateUser: (slug: string, body: unknown) => api<{ user: ApiUser }>(`/admin/users/${encodeURIComponent(slug)}`, { method: 'PATCH', ...json(body) }),
  deleteUser: (slug: string) => api<void>(`/admin/users/${encodeURIComponent(slug)}`, { method: 'DELETE' }),
  titles: (kind: 'movie' | 'series', page = 1, pageSize = 10, search = '') => api<ApiPage<ApiTitle>>(`/admin/titles?${query({ kind, page, pageSize, search })}`),
  title: (slug: string) => api<{ title: ApiTitleDetail }>(`/admin/titles/${encodeURIComponent(slug)}`),
  createTitle: (body: unknown) => api<{ title: ApiTitleDetail }>('/admin/titles', { method: 'POST', ...json(body) }),
  updateTitle: (slug: string, body: unknown) => api<{ title: ApiTitleDetail }>(`/admin/titles/${encodeURIComponent(slug)}`, { method: 'PATCH', ...json(body) }),
  deleteTitle: (slug: string) => api<void>(`/admin/titles/${encodeURIComponent(slug)}`, { method: 'DELETE' }),
  genres: (page = 1, pageSize = 100, search = '') => api<ApiPage<ApiGenre>>(`/admin/genres?${query({ page, pageSize, search })}`),
  people: (page = 1, pageSize = 100, search = '') => api<ApiPage<ApiPerson>>(`/admin/people?${query({ page, pageSize, search })}`),
  allGenres: () => allPages((page) => adminApi.genres(page, 100)),
  allPeople: () => allPages((page) => adminApi.people(page, 100)),
  mediaAssets: (page = 1) => api<ApiPage<ApiMediaAsset>>(`/admin/media-assets?${query({ page, pageSize: 100 })}`),
  allMediaAssets: () => allPages((page) => adminApi.mediaAssets(page)),
  createGenre: (body: unknown) => api<{ genre: ApiGenre }>('/admin/genres', { method: 'POST', ...json(body) }),
  updateGenre: (id: string, body: unknown) => api<{ genre: ApiGenre }>(`/admin/genres/${id}`, { method: 'PATCH', ...json(body) }),
  deleteGenre: (id: string) => api<void>(`/admin/genres/${id}`, { method: 'DELETE' }),
  createPerson: (body: unknown) => api<{ person: ApiPerson }>('/admin/people', { method: 'POST', ...json(body) }),
  updatePerson: (id: string, body: unknown) => api<{ person: ApiPerson }>(`/admin/people/${id}`, { method: 'PATCH', ...json(body) }),
  deletePerson: (id: string) => api<void>(`/admin/people/${id}`, { method: 'DELETE' }),
  createSeason: (slug: string, body: unknown) => api(`/admin/titles/${encodeURIComponent(slug)}/seasons`, { method: 'POST', ...json(body) }),
  updateSeason: (slug: string, seasonNumber: number, body: unknown) => api(`/admin/titles/${encodeURIComponent(slug)}/seasons/${seasonNumber}`, { method: 'PATCH', ...json(body) }),
  deleteSeason: (slug: string, seasonNumber: number) => api<void>(`/admin/titles/${encodeURIComponent(slug)}/seasons/${seasonNumber}`, { method: 'DELETE' }),
  createEpisode: (slug: string, season: number, body: unknown) => api<{ episode: ApiEpisode }>(`/admin/titles/${encodeURIComponent(slug)}/seasons/${season}/episodes`, { method: 'POST', ...json(body) }),
  updateEpisode: (slug: string, season: number, episodeSlug: string, body: unknown) => api<{ episode: ApiEpisode }>(`/admin/titles/${encodeURIComponent(slug)}/seasons/${season}/episodes/${encodeURIComponent(episodeSlug)}`, { method: 'PATCH', ...json(body) }),
  deleteEpisode: (slug: string, season: number, episodeSlug: string) => api<void>(`/admin/titles/${encodeURIComponent(slug)}/seasons/${season}/episodes/${encodeURIComponent(episodeSlug)}`, { method: 'DELETE' }),
  sources: (episodeSlug: string) => api<{ data: ApiSource[] }>(`/admin/episodes/${encodeURIComponent(episodeSlug)}/sources`),
  createSource: (episodeSlug: string, body: unknown) => api(`/admin/episodes/${encodeURIComponent(episodeSlug)}/sources`, { method: 'POST', ...json(body) }),
  deleteSource: (episodeSlug: string, id: string) => api<void>(`/admin/episodes/${encodeURIComponent(episodeSlug)}/sources/${id}`, { method: 'DELETE' }),
  subtitles: (episodeSlug: string) => api<{ data: ApiSubtitle[] }>(`/admin/episodes/${encodeURIComponent(episodeSlug)}/subtitles`),
  createSubtitle: (episodeSlug: string, body: unknown) => api(`/admin/episodes/${encodeURIComponent(episodeSlug)}/subtitles`, { method: 'POST', ...json(body) }),
  deleteSubtitle: (episodeSlug: string, id: string) => api<void>(`/admin/episodes/${encodeURIComponent(episodeSlug)}/subtitles/${id}`, { method: 'DELETE' }),
}
