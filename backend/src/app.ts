import express from 'express'
import cors from 'cors'
import { rateLimit } from 'express-rate-limit'
import swaggerUi from 'swagger-ui-express'
import { env } from './config/env'
import { healthRouter } from './modules/health/health.routes'
import { authRouter } from './modules/auth/auth.routes'
import { adminUsersRouter } from './modules/admin/users.routes'
import { adminDashboardRouter } from './modules/admin/dashboard.routes'
import { publicMetadataRouter, adminGenresRouter, adminPeopleRouter } from './modules/metadata/metadata.routes'
import { adminMediaRouter } from './modules/media/media.routes'
import { adminTitlesRouter } from './modules/titles/titles.routes'
import { adminSeasonsRouter } from './modules/titles/seasons.routes'
import { adminEpisodesRouter } from './modules/titles/episodes.routes'
import { adminSourcesRouter, adminSubtitlesRouter } from './modules/titles/streams.routes'
import { catalogRouter } from './modules/catalog/catalog.routes'
import { savedRouter } from './modules/saved/saved.routes'
import { openApiDocument } from './docs/openapi'
import { errorHandler } from './shared/http/errors'
import { notFound } from './shared/http/not-found'

export function createApp() {
  const app = express()

  app.disable('x-powered-by')
  app.set('trust proxy', env.trustProxy)
  app.use(cors({ origin: env.corsOrigins }))
  app.use(express.json({ limit: '1mb' }))
  app.use('/health', healthRouter)
  app.get('/openapi.json', (_request, response) => response.json(openApiDocument))
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openApiDocument))

  const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 20, standardHeaders: 'draft-8', legacyHeaders: false })
  app.use(['/api/v1/auth/login', '/api/v1/auth/register'], authLimiter)
  const refreshLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 30, standardHeaders: 'draft-8', legacyHeaders: false })
  app.use('/api/v1/auth/refresh', refreshLimiter)
  app.use('/api/v1/auth', authRouter)
  app.use('/api/v1/catalog', catalogRouter)
  app.use('/api/v1', publicMetadataRouter)
  app.use('/api/v1/me/saved-titles', savedRouter)

  app.use('/api/v1/admin/dashboard', adminDashboardRouter)
  app.use('/api/v1/admin/users', adminUsersRouter)
  app.use('/api/v1/admin/genres', adminGenresRouter)
  app.use('/api/v1/admin/people', adminPeopleRouter)
  app.use('/api/v1/admin/media-assets', adminMediaRouter)
  app.use('/api/v1/admin/titles/:titleSlug/seasons/:seasonNumber/episodes', adminEpisodesRouter)
  app.use('/api/v1/admin/titles/:titleSlug/seasons', adminSeasonsRouter)
  app.use('/api/v1/admin/episodes/:episodeSlug/sources', adminSourcesRouter)
  app.use('/api/v1/admin/episodes/:episodeSlug/subtitles', adminSubtitlesRouter)
  app.use('/api/v1/admin/titles', adminTitlesRouter)
  app.use(notFound)
  app.use(errorHandler)

  return app
}
