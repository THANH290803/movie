import type { Request, RequestHandler } from 'express'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { db } from '../../config/database'
import { env } from '../../config/env'
import { HttpError } from '../../shared/http/errors'
import { sessionIdSchema } from './auth.sessions'

export type UserRole = 'viewer' | 'editor' | 'admin'
export type AuthUser = { id: string; slug: string; full_name: string; email: string; role: UserRole; plan_code: 'free' | 'premium'; status: string }

export const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .refine((value) => Buffer.byteLength(value, 'utf8') <= 72, 'Password must be at most 72 UTF-8 bytes')
  .refine((value) => /\p{Ll}/u.test(value), 'Password must contain a lowercase letter')
  .refine((value) => /\p{Lu}/u.test(value), 'Password must contain an uppercase letter')
  .refine((value) => /\p{Nd}/u.test(value), 'Password must contain a digit')
  .refine((value) => /[^\p{L}\p{N}\s]/u.test(value), 'Password must contain a special character')
export const emailSchema = z.string().trim().pipe(z.email()).transform((value) => value.toLowerCase())

export function publicUser(row: Record<string, unknown>) {
  return {
    id: String(row.id), slug: row.slug, fullName: row.full_name, email: row.email,
    role: row.role, planCode: row.plan_code, status: row.status,
    createdAt: row.created_at, updatedAt: row.updated_at,
  }
}

export function issueToken(userId: string, sessionId: string) {
  return jwt.sign({ sid: sessionId }, env.jwtSecret, {
    algorithm: 'HS256', expiresIn: '2h', subject: userId,
    issuer: 'cineflow', audience: 'cineflow-api',
  })
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12)
}

export async function getCurrentUser(request: Request): Promise<AuthUser> {
  const authorization = request.header('authorization')
  if (!authorization?.startsWith('Bearer ')) throw new HttpError(401, 'UNAUTHORIZED', 'Bearer token required')
  let subject: string | undefined
  let sessionId: string | undefined
  try {
    const decoded = jwt.verify(authorization.slice(7), env.jwtSecret, {
      algorithms: ['HS256'], issuer: 'cineflow', audience: 'cineflow-api',
    })
    if (typeof decoded === 'string' || !decoded.sub || !sessionIdSchema.safeParse(decoded.sid).success) {
      throw new Error('Invalid token subject or session')
    }
    subject = decoded.sub
    sessionId = decoded.sid as string
  } catch {
    throw new HttpError(401, 'UNAUTHORIZED', 'Invalid or expired token')
  }
  const session = await db('auth_sessions').where({ id: sessionId, user_id: subject }).whereNull('revoked_at')
    .where('expires_at', '>', new Date()).first('id')
  if (!session) throw new HttpError(401, 'UNAUTHORIZED', 'Session has expired or was revoked')
  const user = await db<AuthUser>('users').where({ id: subject, status: 'active' }).whereNull('deleted_at')
    .first('id', 'slug', 'full_name', 'email', 'role', 'plan_code', 'status')
  if (!user) throw new HttpError(401, 'UNAUTHORIZED', 'Account is unavailable')
  return user
}

export function requireRole(...roles: UserRole[]): RequestHandler {
  return async (request, response, next) => {
    try {
      const user = await getCurrentUser(request)
      if (!roles.includes(user.role)) throw new HttpError(403, 'FORBIDDEN', 'Insufficient permissions')
      response.locals.user = user
      next()
    } catch (error) {
      next(error)
    }
  }
}
