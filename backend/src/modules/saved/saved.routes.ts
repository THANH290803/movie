import { Router } from 'express'
import { z } from 'zod'
import { db } from '../../config/database'
import { pageQuerySchema, slugSchema } from '../../shared/lib/validation'
import { paged } from '../../shared/lib/pagination'
import { requireRole } from '../auth/auth'
import { titleBySlug, titleSummary } from '../titles/title.service'

export const savedRouter = Router()
savedRouter.use(requireRole('viewer', 'editor', 'admin'))

savedRouter.get('/', async (request, response) => {
  const { page, pageSize } = pageQuerySchema.parse(request.query)
  const query = db('saved_titles').join('titles', 'saved_titles.title_id', 'titles.id')
    .leftJoin('media_assets as poster', 'titles.poster_asset_id', 'poster.id')
    .leftJoin('media_assets as backdrop', 'titles.backdrop_asset_id', 'backdrop.id')
    .where('saved_titles.user_id', response.locals.user.id)
    .where('titles.status', 'published').whereNotNull('titles.published_at')
    .where('titles.published_at', '<=', new Date()).whereNull('titles.deleted_at')
    .select('titles.*', 'poster.storage_key as poster_storage_key', 'backdrop.storage_key as backdrop_storage_key')
    .orderBy('saved_titles.created_at', 'desc')
  const result = await paged<Record<string, unknown>>(query, page, pageSize)
  response.json({ ...result, data: result.data.map((row) => {
    const { status, scheduledAt, posterAssetId, backdropAssetId, createdAt, updatedAt, deletedAt, ...publicTitle } = titleSummary(row)
    return publicTitle
  }) })
})

savedRouter.post('/', async (request, response) => {
  const { slug } = z.object({ slug: slugSchema }).strict().parse(request.body)
  const title = await titleBySlug(slug, true)
  await db('saved_titles').insert({ user_id: response.locals.user.id, title_id: title.id })
  response.status(201).json({ slug })
})

savedRouter.delete('/:slug', async (request, response) => {
  const slug = slugSchema.parse(request.params.slug)
  const title = await db('titles').where({ slug }).first('id')
  if (title) await db('saved_titles').where({ user_id: response.locals.user.id, title_id: title.id }).delete()
  response.status(204).send()
})
