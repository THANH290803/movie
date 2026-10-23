import { createHash, randomBytes, randomUUID, timingSafeEqual } from 'node:crypto'
import type { Knex } from 'knex'
import { z } from 'zod'
import { db } from '../../config/database'
import { HttpError } from '../../shared/http/errors'

export const REFRESH_TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000
export const sessionIdSchema = z.uuidv4()
export const refreshTokenSchema = z.string().regex(
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.[A-Za-z0-9_-]{43}$/,
  'Invalid refresh token format',
)

function hashRefreshToken(token: string) {
  return createHash('sha256').update(token).digest('hex')
}

function newRefreshToken(sessionId: string) {
  return `${sessionId}.${randomBytes(32).toString('base64url')}`
}

function matchesHash(expected: string, received: string) {
  const expectedBytes = Buffer.from(expected, 'hex')
  const receivedBytes = Buffer.from(received, 'hex')
  return expectedBytes.length === 32 && receivedBytes.length === 32 && timingSafeEqual(expectedBytes, receivedBytes)
}

function tokenIdentity(token: string) {
  const validToken = refreshTokenSchema.parse(token)
  return { sessionId: validToken.slice(0, 36), hash: hashRefreshToken(validToken) }
}

export async function createSession(userId: string | number, connection: Knex | Knex.Transaction = db) {
  const sessionId = randomUUID()
  const refreshToken = newRefreshToken(sessionId)
  await connection('auth_sessions').insert({
    id: sessionId,
    user_id: userId,
    refresh_token_hash: hashRefreshToken(refreshToken),
    expires_at: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
  })
  return { sessionId, refreshToken }
}

export async function rotateSession(token: string) {
  const { sessionId, hash } = tokenIdentity(token)
  return db.transaction(async (trx) => {
    const session = await trx('auth_sessions').where({ id: sessionId }).forUpdate().first()
    const now = new Date()
    if (!session || session.revoked_at || new Date(session.expires_at) <= now || !matchesHash(session.refresh_token_hash, hash)) {
      throw new HttpError(401, 'INVALID_REFRESH_TOKEN', 'Invalid or expired refresh token')
    }
    const user = await trx('users').where({ id: session.user_id, status: 'active' }).whereNull('deleted_at').first()
    if (!user) throw new HttpError(401, 'INVALID_REFRESH_TOKEN', 'Invalid or expired refresh token')
    const refreshToken = newRefreshToken(sessionId)
    await trx('auth_sessions').where({ id: sessionId }).update({
      refresh_token_hash: hashRefreshToken(refreshToken),
      expires_at: new Date(now.getTime() + REFRESH_TOKEN_TTL_MS),
      last_used_at: now,
    })
    return { sessionId, refreshToken, user }
  })
}

export async function revokeSession(token: string) {
  const { sessionId, hash } = tokenIdentity(token)
  await db.transaction(async (trx) => {
    const session = await trx('auth_sessions').where({ id: sessionId }).forUpdate().first()
    if (session && !session.revoked_at && matchesHash(session.refresh_token_hash, hash)) {
      await trx('auth_sessions').where({ id: sessionId }).update({ revoked_at: new Date() })
    }
  })
}
