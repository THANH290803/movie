import { createApp } from './app'
import { checkDatabaseConnection, db } from './config/database'
import { env } from './config/env'

async function start() {
  try {
    const hasSchema = await checkDatabaseConnection()
    console.log(`MySQL connected: ${env.db.host}:${env.db.port}/${env.db.database}`)
    if (!hasSchema) console.warn('Required tables are missing. Apply migrations before using the API.')
    const server = createApp().listen(env.port, () => {
      console.log(`Cineflow API: http://localhost:${env.port}`)
      console.log(`Swagger UI: http://localhost:${env.port}/api-docs`)
      console.log(`OpenAPI JSON: http://localhost:${env.port}/openapi.json`)
    })
    const shutdown = () => server.close(() => { void db.destroy() })
    process.on('SIGINT', shutdown)
    process.on('SIGTERM', shutdown)
  } catch (error) {
    console.error('MySQL connection failed:', error)
    await db.destroy()
    process.exitCode = 1
  }
}

void start()
