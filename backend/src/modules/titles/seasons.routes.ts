import { Router } from 'express'
import { z } from 'zod'
import { db } from '../../config/database'
import { HttpError, assertFound } from '../../shared/http/errors'
import { slugSchema } from '../../shared/lib/validation'
import { requireRole } from '../auth/auth'
import { episodeDto, seasonByNumber, titleBySlug } from './title.service'
import { seasonCreateSchema, seasonUpdateSchema } from './title.schemas'

export const adminSeasonsRouter = Router({ mergeParams: true })
adminSeasonsRouter.use(requireRole('editor', 'admin'))

const seasonNumberSchema = z.coerce.number().int().min(0).max(65535)

async function context(params: Record<string, string | string[]>) {
  const title = await titleBySlug(slugSchema.parse(params.titleSlug))
  return title
}

adminSeasonsRouter.get('/', async (request, response) => {
  const title = await context(request.params)
  const seasons = await db('seasons').where({ title_id: title.id }).orderBy('season_number')
  response.json({ data: seasons.map((row) => ({ id: String(row.id), seasonNumber: row.season_number, name: row.name, isImplicit: Boolean(row.is_implicit) })) })
})

adminSeasonsRouter.post('/', async (request, response) => {
  const title = await context(request.params)
  if (title.kind !== 'series') throw new HttpError(400, 'MOVIE_SEASON_FIXED', 'Movies have one implicit season')
  const input = seasonCreateSchema.parse(request.body)
  const id = await db.transaction(async (trx) => {
    await trx('seasons').where({ title_id: title.id }).update({ is_implicit: false, updated_at: new Date() })
    const [seasonId] = await trx('seasons').insert({ title_id: title.id, season_number: input.seasonNumber, name: input.name, is_implicit: false })
    return seasonId
  })
  const season = assertFound(await db('seasons').where({ id }).first())
  response.status(201).json({ season: { id: String(season.id), seasonNumber: season.season_number, name: season.name, isImplicit: Boolean(season.is_implicit) } })
})

adminSeasonsRouter.get('/:seasonNumber', async (request, response) => {
  const title = await context(request.params)
  const season = await seasonByNumber(String(title.id), seasonNumberSchema.parse(request.params.seasonNumber))
  const episodes = await db('episodes').where({ season_id: season.id }).orderBy('episode_number')
  response.json({ season: { id: String(season.id), seasonNumber: season.season_number, name: season.name, isImplicit: Boolean(season.is_implicit), episodes: episodes.map(episodeDto) } })
})

adminSeasonsRouter.patch('/:seasonNumber', async (request, response) => {
  const title = await context(request.params)
  if (title.kind !== 'series') throw new HttpError(400, 'MOVIE_SEASON_FIXED', 'Movie season cannot be edited')
  const season = await seasonByNumber(String(title.id), seasonNumberSchema.parse(request.params.seasonNumber))
  const input = seasonUpdateSchema.parse(request.body)
  await db('seasons').where({ id: season.id }).update({ name: input.name, updated_at: new Date() })
  response.json({ season: { id: String(season.id), seasonNumber: season.season_number, name: input.name, isImplicit: Boolean(season.is_implicit) } })
})

adminSeasonsRouter.delete('/:seasonNumber', async (request, response) => {
  const title = await context(request.params)
  if (title.kind !== 'series') throw new HttpError(400, 'MOVIE_SEASON_FIXED', 'Movie season cannot be deleted')
  const season = await seasonByNumber(String(title.id), seasonNumberSchema.parse(request.params.seasonNumber))
  const others = await db('seasons').where({ title_id: title.id }).whereNot({ id: season.id }).select('id')
  if (!others.length) throw new HttpError(400, 'LAST_SEASON', 'A series needs at least one season')
  await db.transaction(async (trx) => {
    await trx('seasons').where({ id: season.id }).delete()
    if (others.length === 1) await trx('seasons').where({ id: others[0].id }).update({ is_implicit: true, updated_at: new Date() })
  })
  response.status(204).send()
})
