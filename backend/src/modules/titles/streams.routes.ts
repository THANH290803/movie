import { Router } from 'express'
import { db } from '../../config/database'
import { env } from '../../config/env'
import { HttpError, assertFound } from '../../shared/http/errors'
import { requireAssetKind } from '../../shared/lib/assets'
import { idSchema, slugSchema } from '../../shared/lib/validation'
import { requireRole } from '../auth/auth'
import { sourceSchema, subtitleSchema } from './title.schemas'
import { hasPlayableSource } from './title.service'
import type { Knex } from 'knex'

export const adminSourcesRouter = Router({ mergeParams: true })
export const adminSubtitlesRouter = Router({ mergeParams: true })
adminSourcesRouter.use(requireRole('editor', 'admin'))
adminSubtitlesRouter.use(requireRole('editor', 'admin'))

async function episodeContext(slugValue: unknown) {
  const slug = slugSchema.parse(slugValue)
  return assertFound(await db('episodes').join('seasons', 'episodes.season_id', 'seasons.id')
    .join('titles', 'seasons.title_id', 'titles.id').where('episodes.slug', slug)
    .whereNull('titles.deleted_at').select('episodes.*').first())
}

function sourceDto(row: Record<string, unknown>) {
  return { id: String(row.id), episodeId: String(row.episode_id), sourceKind: row.source_kind,
    mediaAssetId: row.media_asset_id == null ? null : String(row.media_asset_id), playbackUrl: row.playback_url,
    format: row.format, priority: row.priority, isActive: Boolean(row.is_active), createdAt: row.created_at }
}

function subtitleDto(row: Record<string, unknown>) {
  return { id: String(row.id), episodeId: String(row.episode_id), languageCode: row.language_code,
    label: row.label, format: row.format, mediaAssetId: row.media_asset_id == null ? null : String(row.media_asset_id),
    subtitleUrl: row.subtitle_url, isDefault: Boolean(row.is_default), createdAt: row.created_at }
}

async function ensureSourceAsset(input: { sourceKind: string; mediaAssetId?: string | null; isActive: boolean }) {
  if (input.sourceKind !== 'uploaded') return
  await requireAssetKind(db, input.mediaAssetId, 'video')
  if (input.isActive) {
    const asset = await db('media_assets').where({ id: input.mediaAssetId }).first('processing_status')
    if (asset?.processing_status !== 'ready') throw new HttpError(400, 'ASSET_NOT_READY', 'Active video asset must be ready')
  }
}

async function requireAnotherActiveSource(episode: Record<string, unknown>, excludedId: string, trx: Knex.Transaction) {
  if (episode.status !== 'published') return
  const other = await hasPlayableSource(String(episode.id), excludedId, trx)
  if (!other) throw new HttpError(400, 'LAST_VIDEO_SOURCE', 'Published episode needs an active video source')
}

adminSourcesRouter.get('/', async (request, response) => {
  const episode = await episodeContext((request.params as Record<string, string>).episodeSlug)
  const sources = await db('episode_sources').where({ episode_id: episode.id }).orderBy('priority')
  response.json({ data: sources.map(sourceDto) })
})
adminSourcesRouter.get('/:id', async (request, response) => {
  const episode = await episodeContext((request.params as Record<string, string>).episodeSlug)
  const id = idSchema.parse(request.params.id)
  response.json({ source: sourceDto(assertFound(await db('episode_sources').where({ episode_id: episode.id, id }).first())) })
})
adminSourcesRouter.post('/', async (request, response) => {
  const episode = await episodeContext((request.params as Record<string, string>).episodeSlug)
  const input = sourceSchema.parse(request.body)
  await ensureSourceAsset(input)
  const [id] = await db('episode_sources').insert({
    episode_id: episode.id, source_kind: input.sourceKind, media_asset_id: input.mediaAssetId ?? null,
    playback_url: input.playbackUrl ?? null, format: input.format, priority: input.priority, is_active: input.isActive,
  })
  response.status(201).json({ source: sourceDto(assertFound(await db('episode_sources').where({ id }).first())) })
})
adminSourcesRouter.put('/:id', async (request, response) => {
  const episode = await episodeContext((request.params as Record<string, string>).episodeSlug)
  const id = idSchema.parse(request.params.id)
  const input = sourceSchema.parse(request.body)
  await ensureSourceAsset(input)
  await db.transaction(async (trx) => {
    const lockedEpisode = assertFound(await trx('episodes').where({ id: episode.id }).forUpdate().first())
    const source = assertFound(await trx('episode_sources').where({ episode_id: episode.id, id }).first())
    if (source.is_active && (!input.isActive || input.sourceKind === 'uploaded' && !env.mediaPublicBaseUrl)) {
      await requireAnotherActiveSource(lockedEpisode, id, trx)
    }
    await trx('episode_sources').where({ id }).update({ source_kind: input.sourceKind,
      media_asset_id: input.mediaAssetId ?? null, playback_url: input.playbackUrl ?? null,
      format: input.format, priority: input.priority, is_active: input.isActive })
  })
  response.json({ source: sourceDto(assertFound(await db('episode_sources').where({ id }).first())) })
})
adminSourcesRouter.delete('/:id', async (request, response) => {
  const episode = await episodeContext((request.params as Record<string, string>).episodeSlug)
  const id = idSchema.parse(request.params.id)
  await db.transaction(async (trx) => {
    const lockedEpisode = assertFound(await trx('episodes').where({ id: episode.id }).forUpdate().first())
    const source = assertFound(await trx('episode_sources').where({ episode_id: episode.id, id }).first())
    if (source.is_active) await requireAnotherActiveSource(lockedEpisode, id, trx)
    await trx('episode_sources').where({ id }).delete()
  })
  response.status(204).send()
})

adminSubtitlesRouter.get('/', async (request, response) => {
  const episode = await episodeContext((request.params as Record<string, string>).episodeSlug)
  const subtitles = await db('episode_subtitles').where({ episode_id: episode.id }).orderBy('language_code').orderBy('label')
  response.json({ data: subtitles.map(subtitleDto) })
})
adminSubtitlesRouter.get('/:id', async (request, response) => {
  const episode = await episodeContext((request.params as Record<string, string>).episodeSlug)
  const id = idSchema.parse(request.params.id)
  response.json({ subtitle: subtitleDto(assertFound(await db('episode_subtitles').where({ episode_id: episode.id, id }).first())) })
})
adminSubtitlesRouter.post('/', async (request, response) => {
  const episode = await episodeContext((request.params as Record<string, string>).episodeSlug)
  const input = subtitleSchema.parse(request.body)
  await requireAssetKind(db, input.mediaAssetId, 'subtitle')
  const id = await db.transaction(async (trx) => {
    await trx('episodes').where({ id: episode.id }).forUpdate().first('id')
    if (input.isDefault) await trx('episode_subtitles').where({ episode_id: episode.id }).update({ is_default: false })
    const [subtitleId] = await trx('episode_subtitles').insert({ episode_id: episode.id,
      language_code: input.languageCode, label: input.label, format: input.format,
      media_asset_id: input.mediaAssetId ?? null, subtitle_url: input.subtitleUrl ?? null, is_default: input.isDefault })
    return subtitleId
  })
  response.status(201).json({ subtitle: subtitleDto(assertFound(await db('episode_subtitles').where({ id }).first())) })
})
adminSubtitlesRouter.put('/:id', async (request, response) => {
  const episode = await episodeContext((request.params as Record<string, string>).episodeSlug)
  const id = idSchema.parse(request.params.id)
  assertFound(await db('episode_subtitles').where({ episode_id: episode.id, id }).first())
  const input = subtitleSchema.parse(request.body)
  await requireAssetKind(db, input.mediaAssetId, 'subtitle')
  await db.transaction(async (trx) => {
    await trx('episodes').where({ id: episode.id }).forUpdate().first('id')
    if (input.isDefault) await trx('episode_subtitles').where({ episode_id: episode.id }).whereNot({ id }).update({ is_default: false })
    await trx('episode_subtitles').where({ id }).update({ language_code: input.languageCode, label: input.label,
      format: input.format, media_asset_id: input.mediaAssetId ?? null, subtitle_url: input.subtitleUrl ?? null, is_default: input.isDefault })
  })
  response.json({ subtitle: subtitleDto(assertFound(await db('episode_subtitles').where({ id }).first())) })
})
adminSubtitlesRouter.delete('/:id', async (request, response) => {
  const episode = await episodeContext((request.params as Record<string, string>).episodeSlug)
  const id = idSchema.parse(request.params.id)
  if (!await db('episode_subtitles').where({ episode_id: episode.id, id }).delete()) throw new HttpError(404, 'NOT_FOUND', 'Subtitle not found')
  response.status(204).send()
})
