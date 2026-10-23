import { db } from '../../config/database'
import { env } from '../../config/env'
import type { Knex } from 'knex'
import { HttpError, assertFound } from '../../shared/http/errors'
import { assetUrl } from '../media/media.routes'

export function published(query: ReturnType<typeof db>) {
  return query.where('status', 'published').whereNotNull('published_at').where('published_at', '<=', new Date())
}

export async function titleBySlug(slug: string, publicOnly = false) {
  let query = db('titles').where({ slug }).whereNull('deleted_at')
  if (publicOnly) query = published(query)
  return assertFound(await query.first())
}

export async function seasonByNumber(titleId: string, number: number) {
  return assertFound(await db('seasons').where({ title_id: titleId, season_number: number }).first())
}

export async function episodeBySlug(titleId: string, slug: string, publicOnly = false) {
  let query = db('episodes').join('seasons', 'episodes.season_id', 'seasons.id')
    .where({ 'seasons.title_id': titleId, 'episodes.slug': slug }).select('episodes.*')
  if (publicOnly) query = query.where('episodes.status', 'published').whereNotNull('episodes.published_at').where('episodes.published_at', '<=', new Date())
  return assertFound(await query.first())
}

export function titleSummary(row: Record<string, unknown>) {
  return {
    id: String(row.id), slug: row.slug, kind: row.kind, name: row.name,
    originalName: row.original_name, releaseYear: row.release_year,
    synopsis: row.synopsis, editorialRating: row.editorial_rating == null ? null : Number(row.editorial_rating),
    status: row.status, scheduledAt: row.scheduled_at, publishedAt: row.published_at,
    posterAssetId: row.poster_asset_id == null ? null : String(row.poster_asset_id),
    backdropAssetId: row.backdrop_asset_id == null ? null : String(row.backdrop_asset_id),
    posterUrl: row.poster_storage_key ? assetUrl(String(row.poster_storage_key)) : null,
    backdropUrl: row.backdrop_storage_key ? assetUrl(String(row.backdrop_storage_key)) : null,
    createdAt: row.created_at, updatedAt: row.updated_at, deletedAt: row.deleted_at ?? null,
  }
}

export function episodeDto(row: Record<string, unknown>) {
  return {
    id: String(row.id), seasonId: String(row.season_id), episodeNumber: row.episode_number,
    slug: row.slug, name: row.name, synopsis: row.synopsis,
    durationSeconds: row.duration_seconds, status: row.status,
    scheduledAt: row.scheduled_at, publishedAt: row.published_at,
    thumbnailAssetId: row.thumbnail_asset_id == null ? null : String(row.thumbnail_asset_id),
    createdAt: row.created_at, updatedAt: row.updated_at,
  }
}

export async function titleDetail(title: Record<string, unknown>, publicOnly = false) {
  const [genres, credits, seasons, poster, backdrop] = await Promise.all([
    db('title_genres').join('genres', 'title_genres.genre_id', 'genres.id')
      .where({ 'title_genres.title_id': title.id }).select('genres.id', 'genres.name'),
    db('title_people').join('people', 'title_people.person_id', 'people.id')
      .where({ 'title_people.title_id': title.id })
      .select('people.id', 'people.name', 'title_people.role', 'title_people.credit_order', 'title_people.character_name')
      .orderBy('title_people.credit_order'),
    db('seasons').where({ title_id: title.id }).orderBy('season_number').select('*'),
    title.poster_asset_id ? db('media_assets').where({ id: title.poster_asset_id }).first('storage_key') : null,
    title.backdrop_asset_id ? db('media_assets').where({ id: title.backdrop_asset_id }).first('storage_key') : null,
  ])
  const seasonIds = seasons.map(({ id }) => id)
  const episodes: Record<string, unknown>[] = seasonIds.length ? await db('episodes').whereIn('season_id', seasonIds)
    .modify((builder) => {
      if (publicOnly) builder.where('status', 'published').whereNotNull('published_at').where('published_at', '<=', new Date())
    }).orderBy('episode_number').select('*') : []
  const base = titleSummary({ ...title, poster_storage_key: poster?.storage_key, backdrop_storage_key: backdrop?.storage_key })
  const content = {
    ...base,
    genres: genres.map(({ id, name }) => ({ id: String(id), name })),
    credits: credits.map((row) => ({ personId: String(row.id), name: row.name, role: row.role, creditOrder: row.credit_order, characterName: row.character_name })),
    seasons: seasons.map((season) => ({
      id: String(season.id), seasonNumber: season.season_number, name: season.name,
      isImplicit: Boolean(season.is_implicit), episodes: episodes.filter((episode) => String(episode.season_id) === String(season.id)).map(episodeDto),
    })),
  }
  if (!publicOnly) return content
  const { status, scheduledAt, posterAssetId, backdropAssetId, createdAt, updatedAt, deletedAt, ...publicContent } = content
  return {
    ...publicContent,
    seasons: content.seasons.map((season) => ({
      ...season,
      episodes: season.episodes.map(({ status: _status, scheduledAt: _scheduledAt, thumbnailAssetId: _thumbnailAssetId, createdAt: _createdAt, updatedAt: _updatedAt, ...episode }) => episode),
    })),
  }
}

export function publicationChanges(input: { status?: string; scheduledAt?: string | null; publishedAt?: string | null }, existing?: Record<string, unknown>) {
  const status = input.status ?? existing?.status
  const scheduledAt = input.scheduledAt === undefined ? existing?.scheduled_at : input.scheduledAt
  if (status === 'scheduled' && !scheduledAt) throw new HttpError(400, 'SCHEDULE_REQUIRED', 'scheduledAt is required for scheduled content')
  const changes: Record<string, unknown> = {}
  if (input.status !== undefined) changes.status = input.status
  if (input.scheduledAt !== undefined) changes.scheduled_at = input.scheduledAt ? new Date(input.scheduledAt) : null
  if (input.publishedAt !== undefined) changes.published_at = input.publishedAt ? new Date(input.publishedAt) : null
  else if (input.status === 'published' && !existing?.published_at) changes.published_at = new Date()
  return changes
}

export async function hasPlayableSource(episodeId: string, excludedSourceId?: string, database: Knex | Knex.Transaction = db) {
  const sources = await database('episode_sources').leftJoin('media_assets', 'episode_sources.media_asset_id', 'media_assets.id')
    .where('episode_sources.episode_id', episodeId).where('episode_sources.is_active', true)
    .modify((builder) => { if (excludedSourceId) builder.whereNot('episode_sources.id', excludedSourceId) })
    .select('episode_sources.source_kind', 'episode_sources.playback_url', 'media_assets.processing_status')
  return sources.some((source: Record<string, unknown>) => source.source_kind === 'external' && source.playback_url
    || source.source_kind === 'uploaded' && source.processing_status === 'ready' && env.mediaPublicBaseUrl)
}
