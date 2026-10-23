import { Router } from 'express'
import { checkDatabaseConnection } from '../../config/database'

export const healthRouter = Router()

healthRouter.get('/', (_request, response) => {
  response.json({ status: 'ok' })
})

healthRouter.get('/ready', async (_request, response) => {
  try {
    const hasSchema = await checkDatabaseConnection()
    response.status(hasSchema ? 200 : 503).json({ status: hasSchema ? 'ready' : 'schema_missing' })
  } catch {
    response.status(503).json({ status: 'database_unavailable' })
  }
})
