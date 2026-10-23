import { z } from 'zod'
import { randomBytes } from 'node:crypto'
import type { Knex } from 'knex'

export const slugSchema = z.string().trim().min(1).max(255)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use lowercase letters, numbers and hyphens')

export const idSchema = z.union([
  z.string().regex(/^[1-9]\d*$/),
  z.number().int().positive().safe(),
]).transform(String)

export const dateTimeSchema = z.iso.datetime({ offset: true })

export const pageQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().refine((value) => [10, 25, 50, 100].includes(value)).default(10),
  search: z.string().trim().max(100).optional(),
})

export function slugify(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd').toLowerCase().replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '').slice(0, 255)
}

export function normalizedName(value: string): string {
  return slugify(value).replace(/-/g, ' ')
}

export function toDate(value: string | null | undefined): Date | null {
  return value ? new Date(value) : null
}

export async function uniqueSlug(database: Knex | Knex.Transaction, table: 'users' | 'titles' | 'episodes', seed: string, maxLength = 255) {
  const base = (slugify(seed) || table.slice(0, -1)).slice(0, maxLength)
  for (let attempt = 0; attempt < 8; attempt++) {
    const suffix = attempt === 0 ? '' : `-${randomBytes(3).toString('hex')}`
    const slug = `${base.slice(0, maxLength - suffix.length)}${suffix}`
    if (!await database(table).where({ slug }).first('id')) return slug
  }
  throw new Error('Could not allocate unique slug')
}
