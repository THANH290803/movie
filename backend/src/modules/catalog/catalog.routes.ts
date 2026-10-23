import { Router } from 'express'
import { z } from 'zod'
import { db } from '../../config/database'
import { HttpError, assertFound } from '../../shared/http/errors'
import { normalizedName, pageQuerySchema, slugSchema } from '../../shared/lib/validation'
import { paged } from '../../shared/lib/pagination'
import { assetUrl } from '../media/media.routes'
import { episodeBySlug, episodeDto, titleBySlug, titleDetail, titleSummary } from '../titles/title.service'

export const catalogRouter = Router()

catalogRouter.get('/titles', async (request, response) => {
  const { page, pageSize, search, kind, genre } = pageQuerySchema.extend({
    kind: z.enum(['movie', 'series']).optional(),
    genre: z.string().trim().min(1).max(100).optional(),
  }).parse(request.query)
  const query = db('titles').leftJoin('media_assets as poster', 'titles.poster_asset_id', 'poster.id')
    .leftJoin('media_assets as backdrop', 'titles.backdrop_asset_id', 'backdrop.id')
    .where('titles.status', 'published').whereNotNull('titles.published_at').where('titles.published_at', '<=', new Date())
    .whereNull('titles.deleted_at')
    .modify((builder) => {
      if (kind) builder.where('titles.kind', kind)
      if (search) builder.whereLike('titles.name', `%${search}%`)
      if (genre) builder.whereExists(db('title_genres').join('genres', 'title_genres.genre_id', 'genres.id')
        .whereRaw('title_genres.title_id = titles.id').where('genres.normalized_name', normalizedName(genre)).select(db.raw('1')))
    })
    .select('titles.*', 'poster.storage_key as poster_storage_key', 'backdrop.storage_key as backdrop_storage_key').orderBy('titles.published_at', 'desc')
  const result = await paged<Record<string, unknown>>(query, page, pageSize)
  response.json({ ...result, data: result.data.map((row) => {
    const { status, scheduledAt, posterAssetId, backdropAssetId, createdAt, updatedAt, deletedAt, ...publicTitle } = titleSummary(row)
    return publicTitle
  }) })
})

catalogRouter.get('/titles/:slug', async (request, response) => {
  const title = await titleBySlug(slugSchema.parse(request.params.slug), true)
  response.json({ title: await titleDetail(title, true) })
})

async function playback(titleSlug: string, episodeSlug?: string) {
  const title = await titleBySlug(titleSlug, true)
  let episode: Record<string, unknown>
  if (episodeSlug) episode = await episodeBySlug(String(title.id), episodeSlug, true)
  else {
    episode = assertFound(await db('episodes').join('seasons', 'episodes.season_id', 'seasons.id')
      .where('seasons.title_id', title.id).where('episodes.status', 'published')
      .whereNotNull('episodes.published_at').where('episodes.published_at', '<=', new Date())
      .orderBy('seasons.season_number').orderBy('episodes.episode_number').select('episodes.*').first())
  }
  const sources = await db('episode_sources').leftJoin('media_assets', 'episode_sources.media_asset_id', 'media_assets.id')
    .where('episode_sources.episode_id', String(episode.id)).where('episode_sources.is_active', true)
    .orderBy('episode_sources.priority').select('episode_sources.*', 'media_assets.storage_key', 'media_assets.processing_status')
  const source = sources.map((row) => ({
    id: String(row.id), format: row.format, sourceKind: row.source_kind,
    url: row.source_kind === 'external' ? row.playback_url
      : row.processing_status === 'ready' && row.storage_key ? assetUrl(row.storage_key) : null,
  })).find((item) => item.url)
  if (!source) throw new HttpError(503, 'VIDEO_UNAVAILABLE', 'No playable video source is available')
  const subtitleRows = await db('episode_subtitles').leftJoin('media_assets', 'episode_subtitles.media_asset_id', 'media_assets.id')
    .where('episode_subtitles.episode_id', String(episode.id))
    .select('episode_subtitles.*', 'media_assets.storage_key', 'media_assets.processing_status')
  const subtitles = subtitleRows.map((row) => ({
    languageCode: row.language_code, label: row.label, format: row.format,
    isDefault: Boolean(row.is_default), url: row.subtitle_url ?? (row.processing_status === 'ready' && row.storage_key ? assetUrl(row.storage_key) : null),
  })).filter((row) => row.url)
  const { status, scheduledAt, thumbnailAssetId, createdAt, updatedAt, ...publicEpisode } = episodeDto(episode)
  return { titleSlug: title.slug, episode: publicEpisode, source, subtitles }
}

catalogRouter.get('/titles/:slug/playback', async (request, response) => {
  response.json(await playback(slugSchema.parse(request.params.slug)))
})
catalogRouter.get('/titles/:slug/episodes/:episodeSlug/playback', async (request, response) => {
  response.json(await playback(slugSchema.parse(request.params.slug), slugSchema.parse(request.params.episodeSlug)))
})

catalogRouter.get('/users/:slug', async (request, response) => {
  const slug = slugSchema.parse(request.params.slug)
  const user = assertFound(await db('users').where({ slug, status: 'active' }).whereNull('deleted_at').first('slug', 'full_name'))
  response.json({ user: { slug: user.slug, fullName: user.full_name } })
})
