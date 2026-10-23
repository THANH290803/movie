import { Router } from 'express'
import { z } from 'zod'
import { db } from '../../config/database'
import { HttpError, assertFound } from '../../shared/http/errors'
import { requireAssetKind } from '../../shared/lib/assets'
import { pageQuerySchema, slugSchema, uniqueSlug } from '../../shared/lib/validation'
import { paged } from '../../shared/lib/pagination'
import { requireRole } from '../auth/auth'
import { titleCreateSchema, titleKind, titleStatus, titleUpdateSchema } from './title.schemas'
import { hasPlayableSource, publicationChanges, titleBySlug, titleDetail, titleSummary } from './title.service'
import type { Knex } from 'knex'

export const adminTitlesRouter = Router()
adminTitlesRouter.use(requireRole('editor', 'admin'))

async function syncGenres(trx: Knex.Transaction, titleId: string | number, genreIds: string[]) {
  await trx('title_genres').where({ title_id: titleId }).delete()
  if (genreIds.length) await trx('title_genres').insert(genreIds.map((genreId) => ({ title_id: titleId, genre_id: genreId })))
}

async function syncCredits(trx: Knex.Transaction, titleId: string | number, credits: { personId: string; role: string; creditOrder?: number | null; characterName?: string | null }[]) {
  await trx('title_people').where({ title_id: titleId }).delete()
  if (credits.length) await trx('title_people').insert(credits.map((credit) => ({
    title_id: titleId, person_id: credit.personId, role: credit.role,
    credit_order: credit.creditOrder ?? null, character_name: credit.characterName ?? null,
  })))
}

adminTitlesRouter.get('/', async (request, response) => {
  const queryInput = pageQuerySchema.extend({
    kind: titleKind.optional(), status: titleStatus.optional(),
    includeDeleted: z.enum(['true', 'false']).default('false'),
  }).parse(request.query)
  const { page, pageSize, search, kind, status, includeDeleted } = queryInput
  const query = db('titles')
    .leftJoin('media_assets as poster', 'titles.poster_asset_id', 'poster.id')
    .leftJoin('media_assets as backdrop', 'titles.backdrop_asset_id', 'backdrop.id')
    .select('titles.*', 'poster.storage_key as poster_storage_key', 'backdrop.storage_key as backdrop_storage_key')
    .modify((builder) => {
      if (includeDeleted !== 'true') builder.whereNull('titles.deleted_at')
      if (kind) builder.where('titles.kind', kind)
      if (status) builder.where('titles.status', status)
      if (search) builder.whereLike('titles.name', `%${search}%`)
    }).orderBy('titles.created_at', 'desc')
  const result = await paged<Record<string, unknown>>(query, page, pageSize)
  response.json({ ...result, data: result.data.map(titleSummary) })
})

adminTitlesRouter.get('/:slug', async (request, response) => {
  const slug = slugSchema.parse(request.params.slug)
  const title = assertFound(await db('titles').where({ slug }).first())
  response.json({ title: await titleDetail(title) })
})

adminTitlesRouter.post('/', async (request, response) => {
  const input = titleCreateSchema.parse(request.body)
  if (input.status === 'published') throw new HttpError(400, 'PUBLISH_AFTER_SOURCES', 'Create video sources before publishing a title')
  const titleId = await db.transaction(async (trx) => {
    await requireAssetKind(trx, input.posterAssetId, 'poster')
    await requireAssetKind(trx, input.backdropAssetId, 'backdrop')
    const slug = input.slug ?? await uniqueSlug(trx, 'titles', input.name)
    const [id] = await trx('titles').insert({
      kind: input.kind, name: input.name, original_name: input.originalName ?? null,
      slug, release_year: input.releaseYear ?? null, synopsis: input.synopsis ?? null,
      editorial_rating: input.editorialRating ?? null,
      ...publicationChanges(input),
      poster_asset_id: input.posterAssetId ?? null, backdrop_asset_id: input.backdropAssetId ?? null,
      created_by_user_id: response.locals.user.id, updated_by_user_id: response.locals.user.id,
    })
    if (input.genreIds) await syncGenres(trx, id, input.genreIds)
    if (input.credits) await syncCredits(trx, id, input.credits)
    const [seasonId] = await trx('seasons').insert({
      title_id: id, season_number: input.kind === 'movie' ? 0 : 1,
      name: input.kind === 'movie' ? 'Phim lẻ' : 'Phần 1', is_implicit: true,
    })
    if (input.kind === 'movie') {
      const episodeSlug = await uniqueSlug(trx, 'episodes', `${slug}-full`)
      await trx('episodes').insert({ season_id: seasonId, episode_number: 1, slug: episodeSlug, name: input.name, status: 'draft' })
    }
    return id
  })
  response.status(201).json({ title: await titleDetail(assertFound(await db('titles').where({ id: titleId }).first())) })
})

adminTitlesRouter.patch('/:slug', async (request, response) => {
  const slug = slugSchema.parse(request.params.slug)
  const input = titleUpdateSchema.parse(request.body)
  const title = await titleBySlug(slug)
  await db.transaction(async (trx) => {
    await requireAssetKind(trx, input.posterAssetId, 'poster')
    await requireAssetKind(trx, input.backdropAssetId, 'backdrop')
    if (input.status === 'published') {
      const episodes = await trx('episodes').join('seasons', 'episodes.season_id', 'seasons.id')
        .where('seasons.title_id', title.id).where('episodes.status', 'published')
        .where('episodes.published_at', '<=', new Date()).select('episodes.id').forUpdate()
      if (!episodes.length) throw new HttpError(400, 'NO_PLAYABLE_EPISODE', 'Publish at least one playable episode first')
      for (const episode of episodes) {
        if (!await hasPlayableSource(String(episode.id), undefined, trx)) {
          throw new HttpError(400, 'NO_PLAYABLE_EPISODE', 'Every published episode needs an active playable source')
        }
      }
    }
    const changes: Record<string, unknown> = { updated_at: new Date(), updated_by_user_id: response.locals.user.id, ...publicationChanges(input, title) }
    if (input.name !== undefined) changes.name = input.name
    if (input.originalName !== undefined) changes.original_name = input.originalName
    if (input.releaseYear !== undefined) changes.release_year = input.releaseYear
    if (input.synopsis !== undefined) changes.synopsis = input.synopsis
    if (input.editorialRating !== undefined) changes.editorial_rating = input.editorialRating
    if (input.posterAssetId !== undefined) changes.poster_asset_id = input.posterAssetId
    if (input.backdropAssetId !== undefined) changes.backdrop_asset_id = input.backdropAssetId
    await trx('titles').where({ id: title.id }).update(changes)
    if (input.genreIds) await syncGenres(trx, title.id, input.genreIds)
    if (input.credits) await syncCredits(trx, title.id, input.credits)
  })
  response.json({ title: await titleDetail(await titleBySlug(slug)) })
})

adminTitlesRouter.delete('/:slug', async (request, response) => {
  const slug = slugSchema.parse(request.params.slug)
  const title = await titleBySlug(slug)
  await db('titles').where({ id: title.id }).update({ status: 'archived', deleted_at: new Date(), updated_at: new Date(), updated_by_user_id: response.locals.user.id })
  response.status(204).send()
})

adminTitlesRouter.post('/:slug/restore', async (request, response) => {
  const slug = slugSchema.parse(request.params.slug)
  const title = assertFound(await db('titles').where({ slug }).whereNotNull('deleted_at').first())
  await db('titles').where({ id: title.id }).update({ status: 'draft', deleted_at: null, updated_at: new Date(), updated_by_user_id: response.locals.user.id })
  response.json({ title: await titleDetail(await titleBySlug(slug)) })
})
