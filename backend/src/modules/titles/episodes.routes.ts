import { Router } from 'express'
import { z } from 'zod'
import { db } from '../../config/database'
import { HttpError, assertFound } from '../../shared/http/errors'
import { requireAssetKind } from '../../shared/lib/assets'
import { slugSchema, uniqueSlug } from '../../shared/lib/validation'
import { requireRole } from '../auth/auth'
import { episodeCreateSchema, episodeUpdateSchema } from './title.schemas'
import { episodeBySlug, episodeDto, hasPlayableSource, publicationChanges, seasonByNumber, titleBySlug } from './title.service'

export const adminEpisodesRouter = Router({ mergeParams: true })
adminEpisodesRouter.use(requireRole('editor', 'admin'))
const seasonNumberSchema = z.coerce.number().int().min(0).max(65535)

async function context(params: Record<string, string | string[]>) {
  const title = await titleBySlug(slugSchema.parse(params.titleSlug))
  const season = await seasonByNumber(String(title.id), seasonNumberSchema.parse(params.seasonNumber))
  return { title, season }
}

adminEpisodesRouter.get('/', async (request, response) => {
  const { season } = await context(request.params)
  const episodes = await db('episodes').where({ season_id: season.id }).orderBy('episode_number')
  response.json({ data: episodes.map(episodeDto) })
})

adminEpisodesRouter.post('/', async (request, response) => {
  const { title, season } = await context(request.params)
  if (title.kind === 'movie') throw new HttpError(400, 'MOVIE_EPISODE_FIXED', 'A movie already has its one episode')
  const input = episodeCreateSchema.parse(request.body)
  if (input.status === 'published') throw new HttpError(400, 'PUBLISH_AFTER_SOURCES', 'Create a video source before publishing an episode')
  const id = await db.transaction(async (trx) => {
    await requireAssetKind(trx, input.thumbnailAssetId, 'thumbnail')
    const slug = input.slug ?? await uniqueSlug(trx, 'episodes', input.name)
    const [episodeId] = await trx('episodes').insert({
      season_id: season.id, episode_number: input.episodeNumber, slug, name: input.name,
      synopsis: input.synopsis ?? null, duration_seconds: input.durationSeconds ?? null,
      thumbnail_asset_id: input.thumbnailAssetId ?? null, ...publicationChanges(input),
    })
    return episodeId
  })
  response.status(201).json({ episode: episodeDto(assertFound(await db('episodes').where({ id }).first())) })
})

adminEpisodesRouter.get('/:episodeSlug', async (request, response) => {
  const { season } = await context(request.params)
  const episode = await episodeBySlug(String(season.title_id), slugSchema.parse(request.params.episodeSlug))
  if (String(episode.season_id) !== String(season.id)) throw new HttpError(404, 'NOT_FOUND', 'Episode not found in this season')
  response.json({ episode: episodeDto(episode) })
})

adminEpisodesRouter.patch('/:episodeSlug', async (request, response) => {
  const { season } = await context(request.params)
  const episode = await episodeBySlug(String(season.title_id), slugSchema.parse(request.params.episodeSlug))
  if (String(episode.season_id) !== String(season.id)) throw new HttpError(404, 'NOT_FOUND', 'Episode not found in this season')
  const input = episodeUpdateSchema.parse(request.body)
  await requireAssetKind(db, input.thumbnailAssetId, 'thumbnail')
  await db.transaction(async (trx) => {
    const lockedEpisode = assertFound(await trx('episodes').where({ id: episode.id }).forUpdate().first())
    if (input.status === 'published' && !await hasPlayableSource(String(episode.id), undefined, trx)) {
      throw new HttpError(400, 'NO_VIDEO_SOURCE', 'Add an active playable video source before publishing')
    }
    const changes: Record<string, unknown> = { updated_at: new Date(), ...publicationChanges(input, lockedEpisode) }
    if (input.name !== undefined) changes.name = input.name
    if (input.synopsis !== undefined) changes.synopsis = input.synopsis
    if (input.durationSeconds !== undefined) changes.duration_seconds = input.durationSeconds
    if (input.thumbnailAssetId !== undefined) changes.thumbnail_asset_id = input.thumbnailAssetId
    await trx('episodes').where({ id: episode.id }).update(changes)
  })
  response.json({ episode: episodeDto(assertFound(await db('episodes').where({ id: episode.id }).first())) })
})

adminEpisodesRouter.delete('/:episodeSlug', async (request, response) => {
  const { title, season } = await context(request.params)
  if (title.kind === 'movie') throw new HttpError(400, 'MOVIE_EPISODE_FIXED', 'Movie episode cannot be deleted')
  const episode = await episodeBySlug(String(title.id), slugSchema.parse(request.params.episodeSlug))
  if (String(episode.season_id) !== String(season.id)) throw new HttpError(404, 'NOT_FOUND', 'Episode not found in this season')
  await db('episodes').where({ id: episode.id }).delete()
  response.status(204).send()
})
