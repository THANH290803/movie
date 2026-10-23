import { Router, type Request, type Response } from 'express'
import { z } from 'zod'
import { db } from '../../config/database'
import { HttpError, assertFound } from '../../shared/http/errors'
import { idSchema, normalizedName, pageQuerySchema } from '../../shared/lib/validation'
import { paged } from '../../shared/lib/pagination'
import { requireRole } from '../auth/auth'

export const publicMetadataRouter = Router()
export const adminGenresRouter = Router()
export const adminPeopleRouter = Router()
adminGenresRouter.use(requireRole('editor', 'admin'))
adminPeopleRouter.use(requireRole('editor', 'admin'))

const genreInput = z.object({
  name: z.string().trim().min(1).max(100),
  description: z.string().max(10000).nullable().optional(),
  isActive: z.boolean().default(true),
}).strict()
const personRole = z.enum(['director', 'actor'])
const personInput = z.object({
  name: z.string().trim().min(1).max(100),
  country: z.string().trim().max(100).nullable().optional(),
  biography: z.string().max(30000).nullable().optional(),
  roles: z.array(personRole).min(1).max(2).refine((roles) => new Set(roles).size === roles.length, 'Roles must be unique'),
  isActive: z.boolean().default(true),
}).strict()
export const genreUpdateSchema = genreInput.partial().extend({ isActive: z.boolean().optional() }).strict()
export const personUpdateSchema = personInput.partial().extend({ isActive: z.boolean().optional() }).strict()

function genreDto(row: Record<string, unknown>) {
  return { id: String(row.id), name: row.name, description: row.description, isActive: Boolean(row.is_active), createdAt: row.created_at, updatedAt: row.updated_at }
}

async function personDto(row: Record<string, unknown>) {
  const roles = await db('person_roles').where({ person_id: row.id }).orderBy('role').pluck('role')
  return { id: String(row.id), name: row.name, country: row.country, biography: row.biography, roles, isActive: Boolean(row.is_active), createdAt: row.created_at, updatedAt: row.updated_at }
}

async function listGenres(request: Request, response: Response, activeOnly: boolean) {
  const { page, pageSize, search } = pageQuerySchema.parse(request.query)
  const query = db('genres').modify((builder) => {
    if (activeOnly) builder.where({ is_active: true })
    if (search) builder.whereLike('name', `%${search}%`)
  }).orderBy('name').select('*')
  const result = await paged<Record<string, unknown>>(query, page, pageSize)
  response.json({ ...result, data: result.data.map(genreDto) })
}

async function listPeople(request: Request, response: Response, activeOnly: boolean) {
  const { page, pageSize, search } = pageQuerySchema.parse(request.query)
  const query = db('people').modify((builder) => {
    if (activeOnly) builder.where({ is_active: true })
    if (search) builder.whereLike('name', `%${search}%`)
  }).orderBy('name').select('*')
  const result = await paged<Record<string, unknown>>(query, page, pageSize)
  response.json({ ...result, data: await Promise.all(result.data.map(personDto)) })
}

publicMetadataRouter.get('/genres', (request, response) => listGenres(request, response, true))
publicMetadataRouter.get('/people', (request, response) => listPeople(request, response, true))

adminGenresRouter.get('/', (request, response) => listGenres(request, response, false))
adminGenresRouter.get('/:id', async (request, response) => {
  const id = idSchema.parse(request.params.id)
  response.json({ genre: genreDto(assertFound(await db('genres').where({ id }).first())) })
})
adminGenresRouter.post('/', async (request, response) => {
  const input = genreInput.parse(request.body)
  const [id] = await db('genres').insert({ name: input.name, normalized_name: normalizedName(input.name).slice(0, 100), description: input.description ?? null, is_active: input.isActive })
  response.status(201).json({ genre: genreDto(assertFound(await db('genres').where({ id }).first())) })
})
adminGenresRouter.patch('/:id', async (request, response) => {
  const id = idSchema.parse(request.params.id)
  assertFound(await db('genres').where({ id }).first())
  const input = genreUpdateSchema.parse(request.body)
  const changes: Record<string, unknown> = { updated_at: new Date() }
  if (input.name !== undefined) { changes.name = input.name; changes.normalized_name = normalizedName(input.name).slice(0, 100) }
  if (input.description !== undefined) changes.description = input.description
  if (input.isActive !== undefined) changes.is_active = input.isActive
  await db('genres').where({ id }).update(changes)
  response.json({ genre: genreDto(assertFound(await db('genres').where({ id }).first())) })
})
adminGenresRouter.delete('/:id', async (request, response) => {
  const id = idSchema.parse(request.params.id)
  if (!await db('genres').where({ id }).delete()) throw new HttpError(404, 'NOT_FOUND', 'Genre not found')
  response.status(204).send()
})

adminPeopleRouter.get('/', (request, response) => listPeople(request, response, false))
adminPeopleRouter.get('/:id', async (request, response) => {
  const id = idSchema.parse(request.params.id)
  response.json({ person: await personDto(assertFound(await db('people').where({ id }).first())) })
})
adminPeopleRouter.post('/', async (request, response) => {
  const input = personInput.parse(request.body)
  const id = await db.transaction(async (trx) => {
    const [personId] = await trx('people').insert({ name: input.name, normalized_name: normalizedName(input.name).slice(0, 100), country: input.country ?? null, biography: input.biography ?? null, is_active: input.isActive })
    await trx('person_roles').insert(input.roles.map((role) => ({ person_id: personId, role })))
    return personId
  })
  response.status(201).json({ person: await personDto(assertFound(await db('people').where({ id }).first())) })
})
adminPeopleRouter.patch('/:id', async (request, response) => {
  const id = idSchema.parse(request.params.id)
  assertFound(await db('people').where({ id }).first())
  const input = personUpdateSchema.parse(request.body)
  await db.transaction(async (trx) => {
    const changes: Record<string, unknown> = { updated_at: new Date() }
    if (input.name !== undefined) { changes.name = input.name; changes.normalized_name = normalizedName(input.name).slice(0, 100) }
    if (input.country !== undefined) changes.country = input.country
    if (input.biography !== undefined) changes.biography = input.biography
    if (input.isActive !== undefined) changes.is_active = input.isActive
    await trx('people').where({ id }).update(changes)
    if (input.roles) {
      const current: string[] = await trx('person_roles').where({ person_id: id }).pluck('role')
      for (const oldRole of current.filter((role) => !input.roles?.includes(role as 'director' | 'actor'))) {
        await trx('person_roles').where({ person_id: id, role: oldRole }).delete()
      }
      const added = input.roles.filter((role) => !current.includes(role))
      if (added.length) await trx('person_roles').insert(added.map((role) => ({ person_id: id, role })))
    }
  })
  response.json({ person: await personDto(assertFound(await db('people').where({ id }).first())) })
})
adminPeopleRouter.delete('/:id', async (request, response) => {
  const id = idSchema.parse(request.params.id)
  assertFound(await db('people').where({ id }).first())
  await db('people').where({ id }).delete()
  response.status(204).send()
})
