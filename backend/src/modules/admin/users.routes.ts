import { Router } from 'express'
import { z } from 'zod'
import { db } from '../../config/database'
import { HttpError, assertFound } from '../../shared/http/errors'
import { pageQuerySchema, slugSchema, uniqueSlug } from '../../shared/lib/validation'
import { paged } from '../../shared/lib/pagination'
import { emailSchema, hashPassword, passwordSchema, publicUser, requireRole } from '../auth/auth'

export const adminUsersRouter = Router()
adminUsersRouter.use(requireRole('admin'))

const role = z.enum(['viewer', 'editor', 'admin'])
const status = z.enum(['invited', 'active', 'suspended'])
const plan = z.enum(['free', 'premium'])
const createInput = z.object({
  fullName: z.string().trim().min(2).max(100),
  email: emailSchema,
  password: passwordSchema.optional(),
  role: role.default('viewer'),
  planCode: plan.default('free'),
  status: status.default('invited'),
}).strict()
export const userUpdateSchema = createInput.partial().extend({
  role: role.optional(), planCode: plan.optional(), status: status.optional(),
}).strict()

async function ensureCanDisableAdmin(user: { id: string; role: string; status: string }, actorId: string) {
  if (user.role !== 'admin' || user.status !== 'active') return
  if (String(user.id) === String(actorId)) throw new HttpError(400, 'SELF_LOCKOUT', 'Cannot disable your own admin account')
  const row = await db('users').where({ role: 'admin', status: 'active' }).whereNull('deleted_at').count<{ total: string | number }>({ total: '*' }).first()
  if (Number(row?.total ?? 0) <= 1) throw new HttpError(400, 'LAST_ADMIN', 'At least one active admin is required')
}

adminUsersRouter.get('/', async (request, response) => {
  const { page, pageSize, search } = pageQuerySchema.parse(request.query)
  const query = db('users').whereNull('deleted_at')
    .modify((builder) => { if (search) builder.where((nested) => nested.whereLike('full_name', `%${search}%`).orWhereLike('email', `%${search}%`)) })
    .orderBy('created_at', 'desc').select('*')
  const result = await paged<Record<string, unknown>>(query, page, pageSize)
  response.json({ ...result, data: result.data.map(publicUser) })
})

adminUsersRouter.get('/:slug', async (request, response) => {
  const slug = slugSchema.parse(request.params.slug)
  const user = assertFound(await db('users').where({ slug }).whereNull('deleted_at').first())
  response.json({ user: publicUser(user) })
})

adminUsersRouter.post('/', async (request, response) => {
  const input = createInput.parse(request.body)
  if (input.status === 'active' && !input.password) throw new HttpError(400, 'PASSWORD_REQUIRED', 'Active account needs a password')
  const slug = await uniqueSlug(db, 'users', input.fullName, 100)
  const [id] = await db('users').insert({
    slug, full_name: input.fullName, email: input.email,
    password_hash: input.password ? await hashPassword(input.password) : null,
    role: input.role, plan_code: input.planCode, status: input.status,
  })
  response.status(201).json({ user: publicUser(assertFound(await db('users').where({ id }).first())) })
})

adminUsersRouter.patch('/:slug', async (request, response) => {
  const slug = slugSchema.parse(request.params.slug)
  const input = userUpdateSchema.parse(request.body)
  const user = assertFound(await db('users').where({ slug }).whereNull('deleted_at').first())
  const nextRole = input.role ?? user.role
  const nextStatus = input.status ?? user.status
  if ((nextRole !== 'admin' || nextStatus !== 'active') && user.role === 'admin' && user.status === 'active') {
    await ensureCanDisableAdmin(user, response.locals.user.id)
  }
  if (nextStatus === 'active' && !input.password && !user.password_hash) throw new HttpError(400, 'PASSWORD_REQUIRED', 'Active account needs a password')
  const changes: Record<string, unknown> = { updated_at: new Date() }
  if (input.fullName !== undefined) changes.full_name = input.fullName
  if (input.email !== undefined) changes.email = input.email
  if (input.password !== undefined) changes.password_hash = await hashPassword(input.password)
  if (input.role !== undefined) changes.role = input.role
  if (input.planCode !== undefined) changes.plan_code = input.planCode
  if (input.status !== undefined) changes.status = input.status
  await db.transaction(async (trx) => {
    await trx('users').where({ id: user.id }).update(changes)
    if (input.password !== undefined) {
      await trx('auth_sessions').where({ user_id: user.id }).whereNull('revoked_at').update({ revoked_at: new Date() })
    }
  })
  response.json({ user: publicUser(assertFound(await db('users').where({ id: user.id }).first())) })
})

adminUsersRouter.delete('/:slug', async (request, response) => {
  const slug = slugSchema.parse(request.params.slug)
  const user = assertFound(await db('users').where({ slug }).whereNull('deleted_at').first())
  await ensureCanDisableAdmin(user, response.locals.user.id)
  await db('users').where({ id: user.id }).update({ status: 'suspended', deleted_at: new Date(), updated_at: new Date() })
  response.status(204).send()
})
