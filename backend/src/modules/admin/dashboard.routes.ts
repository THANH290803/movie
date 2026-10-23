import { Router } from 'express'
import { db } from '../../config/database'
import { requireRole } from '../auth/auth'

export const adminDashboardRouter = Router()
adminDashboardRouter.use(requireRole('editor', 'admin'))

adminDashboardRouter.get('/', async (_request, response) => {
  const count = async (table: string, filter: Record<string, unknown> = {}) => {
    const row = await db(table).where(filter).count<{ total: string | number }>({ total: '*' }).first()
    return Number(row?.total ?? 0)
  }
  const [users, movies, series, publishedTitles, episodes, genres, people] = await Promise.all([
    count('users', { status: 'active' }), count('titles', { kind: 'movie' }),
    count('titles', { kind: 'series' }), count('titles', { status: 'published' }),
    count('episodes'), count('genres'), count('people'),
  ])
  response.json({ users, movies, series, publishedTitles, episodes, genres, people })
})
