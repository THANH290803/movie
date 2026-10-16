import express from 'express'
import { healthRouter } from './modules/health/health.routes'
import { notFound } from './shared/http/not-found'

export function createApp() {
  const app = express()

  app.use(express.json())
  app.use('/health', healthRouter)
  app.use(notFound)

  return app
}
