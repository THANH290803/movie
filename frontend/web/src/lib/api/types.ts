export type ApiUser = {
  id: string
  slug: string
  fullName: string
  email: string
  role: 'viewer' | 'editor' | 'admin'
  planCode: 'free' | 'premium'
  status: 'invited' | 'active' | 'suspended'
  createdAt: string
}

export type ApiTitle = {
  id: string
  slug: string
  kind: 'movie' | 'series'
  name: string
  originalName: string | null
  releaseYear: number | null
  synopsis: string | null
  editorialRating: number | null
  status?: 'draft' | 'scheduled' | 'published' | 'archived'
  posterUrl: string | null
  backdropUrl: string | null
  posterAssetId?: string | null
  backdropAssetId?: string | null
  publishedAt: string | null
}

export type ApiEpisode = {
  id: string
  seasonId: string
  episodeNumber: number
  slug: string
  name: string
  synopsis: string | null
  durationSeconds: number | null
  status?: 'draft' | 'scheduled' | 'published' | 'archived'
  publishedAt: string | null
  thumbnailAssetId?: string | null
}

export type ApiSeason = { id: string; seasonNumber: number; name: string; isImplicit: boolean; episodes: ApiEpisode[] }
export type ApiCredit = { personId: string; name: string; role: 'director' | 'actor'; creditOrder: number | null; characterName: string | null }
export type ApiTitleDetail = ApiTitle & {
  genres: { id: string; name: string }[]
  credits: ApiCredit[]
  seasons: ApiSeason[]
}

export type ApiGenre = { id: string; name: string; description: string | null; isActive: boolean }
export type ApiPerson = { id: string; name: string; country: string | null; biography: string | null; roles: ('director' | 'actor')[]; isActive: boolean }
export type ApiSource = { id: string; sourceKind: 'external' | 'uploaded'; playbackUrl: string | null; mediaAssetId: string | null; format: 'mp4' | 'webm' | 'hls' | 'dash'; priority: number; isActive: boolean }
export type ApiSubtitle = { id: string; languageCode: string; label: string; subtitleUrl: string | null; mediaAssetId: string | null; format: 'vtt' | 'srt'; isDefault: boolean }
export type ApiMediaAsset = { id: string; assetKind: 'poster' | 'backdrop' | 'thumbnail' | 'video' | 'subtitle'; storageKey: string; url: string | null; mimeType: string; processingStatus: 'uploaded' | 'ready' | 'failed' }
export type ApiPage<T> = { data: T[]; pagination: { page: number; pageSize: number; total: number; totalPages: number } }
export type AuthResult = { user: ApiUser; accessToken: string; refreshToken: string }
