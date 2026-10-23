import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { db } from '../../config/database'
import { HttpError, assertFound } from '../../shared/http/errors'
import { uniqueSlug } from '../../shared/lib/validation'
import { emailSchema, hashPassword, issueToken, passwordSchema, publicUser, requireRole } from './auth'
import { createSession, refreshTokenSchema, revokeSession, rotateSession } from './auth.sessions'

export const authRouter = Router()

const credentials = z.object({ email: emailSchema, password: z.string().min(1) }).strict()
const registerInput = credentials.extend({ fullName: z.string().trim().min(2).max(100), password: passwordSchema })
const refreshInput = z.object({ refreshToken: refreshTokenSchema }).strict()

authRouter.post('/register', async (request, response) => {
  const input = registerInput.parse(request.body)
  const slug = await uniqueSlug(db, 'users', input.fullName, 100)
  const passwordHash = await hashPassword(input.password)
  const { user, session } = await db.transaction(async (trx) => {
    const [id] = await trx('users').insert({
      full_name: input.fullName, email: input.email, slug,
      password_hash: passwordHash, role: 'viewer', plan_code: 'free', status: 'active',
    })
    return {
      user: assertFound(await trx('users').where({ id }).first()),
      session: await createSession(id, trx),
    }
  })
  response.status(201).json({ user: publicUser(user), accessToken: issueToken(String(user.id), session.sessionId), refreshToken: session.refreshToken })
})

authRouter.post('/login', async (request, response) => {
  const input = credentials.parse(request.body)
  const user = await db('users').where({ email: input.email, status: 'active' }).whereNull('deleted_at').first()
  const valid = user?.password_hash && await bcrypt.compare(input.password, user.password_hash)
  if (!valid) throw new HttpError(401, 'INVALID_CREDENTIALS', 'Invalid email or password')
  const session = await db.transaction(async (trx) => {
    await trx('users').where({ id: user.id }).update({ last_login_at: new Date() })
    return createSession(user.id, trx)
  })
  response.json({ user: publicUser(user), accessToken: issueToken(String(user.id), session.sessionId), refreshToken: session.refreshToken })
})

authRouter.post('/refresh', async (request, response) => {
  const { refreshToken } = refreshInput.parse(request.body)
  const session = await rotateSession(refreshToken)
  response.json({
    user: publicUser(session.user),
    accessToken: issueToken(String(session.user.id), session.sessionId),
    refreshToken: session.refreshToken,
  })
})

authRouter.post('/logout', async (request, response) => {
  const { refreshToken } = refreshInput.parse(request.body)
  await revokeSession(refreshToken)
  response.status(204).send()
})

authRouter.get('/me', requireRole('viewer', 'editor', 'admin'), async (_request, response) => {
  response.json({ user: publicUser(response.locals.user) })
})

authRouter.patch('/me', requireRole('viewer', 'editor', 'admin'), async (request, response) => {
  const input = z.object({ fullName: z.string().trim().min(2).max(100) }).strict().parse(request.body)
  const user = response.locals.user
  await db('users').where({ id: user.id }).update({ full_name: input.fullName, updated_at: new Date() })
  response.json({ user: publicUser(assertFound(await db('users').where({ id: user.id }).first())) })
})

authRouter.post('/change-password', requireRole('viewer', 'editor', 'admin'), async (request, response) => {
  const input = z.object({ currentPassword: z.string(), newPassword: passwordSchema }).strict().parse(request.body)
  await db.transaction(async (trx) => {
    const user = assertFound(await trx('users').where({ id: response.locals.user.id }).forUpdate().first())
    if (!user.password_hash || !await bcrypt.compare(input.currentPassword, user.password_hash)) {
      throw new HttpError(401, 'INVALID_CREDENTIALS', 'Current password is incorrect')
    }
    await trx('users').where({ id: user.id }).update({ password_hash: await hashPassword(input.newPassword), updated_at: new Date() })
    await trx('auth_sessions').where({ user_id: user.id }).whereNull('revoked_at').update({ revoked_at: new Date() })
  })
  response.status(204).send()
})
