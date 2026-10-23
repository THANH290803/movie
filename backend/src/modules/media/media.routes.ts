import { Router } from 'express'
import { z } from 'zod'
import { db } from '../../config/database'
import { env } from '../../config/env'
import { HttpError, assertFound } from '../../shared/http/errors'
import { idSchema, pageQuerySchema } from '../../shared/lib/validation'
import { paged } from '../../shared/lib/pagination'
import { requireRole } from '../auth/auth'

export const adminMediaRouter = Router()
adminMediaRouter.use(requireRole('editor', 'admin'))

const kind = z.enum(['poster', 'backdrop', 'thumbnail', 'video', 'subtitle'])
const processingStatus = z.enum(['uploaded', 'ready', 'failed'])
const sizeBytes = z.union([z.string().regex(/^\d+$/), z.number().int().nonnegative().safe()]).transform(String)
const createInput = z.object({
  assetKind: kind,
  storageKey: z.string().trim().min(1).max(512)
    .refine((value) => !value.startsWith('/') && !value.split('/').some((segment) => !segment || segment === '.' || segment === '..'), 'Use a relative storage path without dot segments'),
  mimeType: z.string().trim().min(1).max(100),
  sizeBytes: sizeBytes.nullable().optional(),
  processingStatus: processingStatus.default('uploaded'),
}).strict()
const updateInput = z.object({
  mimeType: z.string().trim().min(1).max(100).optional(),
  sizeBytes: sizeBytes.nullable().optional(),
  processingStatus: processingStatus.optional(),
}).strict()

export function assetUrl(storageKey: string) {
  if (!env.mediaPublicBaseUrl) return null
  const base = env.mediaPublicBaseUrl.endsWith('/') ? env.mediaPublicBaseUrl : `${env.mediaPublicBaseUrl}/`
  return new URL(storageKey.split('/').map(encodeURIComponent).join('/'), base).toString()
}

export function publicAsset(row: Record<string, unknown> | null | undefined) {
  if (!row) return null
  return { id: String(row.id), assetKind: row.asset_kind, mimeType: row.mime_type, url: assetUrl(String(row.storage_key)) }
}

function adminAsset(row: Record<string, unknown>) {
  return { ...publicAsset(row), storageKey: row.storage_key, sizeBytes: row.size_bytes, processingStatus: row.processing_status, createdByUserId: row.created_by_user_id, createdAt: row.created_at }
}

adminMediaRouter.get('/', async (request, response) => {
  const { page, pageSize, search } = pageQuerySchema.parse(request.query)
  const query = db('media_assets').modify((builder) => { if (search) builder.whereLike('storage_key', `%${search}%`) })
    .orderBy('created_at', 'desc').select('*')
  const result = await paged<Record<string, unknown>>(query, page, pageSize)
  response.json({ ...result, data: result.data.map(adminAsset) })
})

adminMediaRouter.get('/:id', async (request, response) => {
  const id = idSchema.parse(request.params.id)
  response.json({ asset: adminAsset(assertFound(await db('media_assets').where({ id }).first())) })
})

adminMediaRouter.post('/', async (request, response) => {
  const input = createInput.parse(request.body)
  const [id] = await db('media_assets').insert({
    asset_kind: input.assetKind, storage_key: input.storageKey, mime_type: input.mimeType,
    size_bytes: input.sizeBytes ?? null, processing_status: input.processingStatus,
    created_by_user_id: response.locals.user.id,
  })
  response.status(201).json({ asset: adminAsset(assertFound(await db('media_assets').where({ id }).first())) })
})

adminMediaRouter.patch('/:id', async (request, response) => {
  const id = idSchema.parse(request.params.id)
  const current = assertFound(await db('media_assets').where({ id }).first())
  const input = updateInput.parse(request.body)
  if (current.asset_kind === 'video' && current.processing_status === 'ready' && input.processingStatus && input.processingStatus !== 'ready') {
    const inUse = await db('episode_sources').join('episodes', 'episode_sources.episode_id', 'episodes.id')
      .where('episode_sources.media_asset_id', id).where('episode_sources.is_active', true)
      .where('episodes.status', 'published').first('episode_sources.id')
    if (inUse) throw new HttpError(409, 'ASSET_IN_USE', 'Cannot mark a published video source as unavailable')
  }
  const changes: Record<string, unknown> = {}
  if (input.mimeType !== undefined) changes.mime_type = input.mimeType
  if (input.sizeBytes !== undefined) changes.size_bytes = input.sizeBytes
  if (input.processingStatus !== undefined) changes.processing_status = input.processingStatus
  if (Object.keys(changes).length) await db('media_assets').where({ id }).update(changes)
  response.json({ asset: adminAsset(assertFound(await db('media_assets').where({ id }).first())) })
})

adminMediaRouter.delete('/:id', async (request, response) => {
  const id = idSchema.parse(request.params.id)
  assertFound(await db('media_assets').where({ id }).first())
  await db('media_assets').where({ id }).delete()
  response.status(204).send()
})
