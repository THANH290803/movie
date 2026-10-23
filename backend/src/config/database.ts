import knex from 'knex'
import type { Connection } from 'mysql2'
import { env } from './env'

export const db = knex({
  client: 'mysql2',
  connection: {
    ...env.db,
    timezone: 'Z',
    supportBigNumbers: true,
    bigNumberStrings: true,
  },
  pool: {
    min: 0,
    max: 10,
    afterCreate(connection: Connection, done: (error: Error | null, connection: Connection) => void) {
      connection.query("SET time_zone = '+00:00'", (error: Error | null) => done(error, connection))
    },
  },
  acquireConnectionTimeout: 10000,
})

const coreTables = [
  'users', 'media_assets', 'genres', 'people', 'person_roles', 'titles',
  'title_genres', 'title_people', 'seasons', 'episodes', 'episode_sources',
  'episode_subtitles', 'saved_titles', 'auth_sessions',
]

export async function checkDatabaseConnection() {
  await db.raw('SELECT 1 AS connected')
  const row = await db('information_schema.tables').where({ table_schema: env.db.database, table_type: 'BASE TABLE' })
    .whereIn('table_name', coreTables).countDistinct<{ total: number | string }>({ total: 'table_name' }).first()
  return Number(row?.total ?? 0) === coreTables.length
}
