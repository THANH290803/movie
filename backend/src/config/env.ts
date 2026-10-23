import 'dotenv/config'

const port = Number(process.env.PORT ?? 3001)
const dbPort = Number(process.env.DB_PORT ?? 3306)
const trustProxy = Number(process.env.TRUST_PROXY ?? 0)

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error('PORT must be an integer between 1 and 65535')
}

if (!Number.isInteger(dbPort) || dbPort < 1 || dbPort > 65535) {
  throw new Error('DB_PORT must be an integer between 1 and 65535')
}
if (!Number.isInteger(trustProxy) || trustProxy < 0 || trustProxy > 3) {
  throw new Error('TRUST_PROXY must be an integer between 0 and 3')
}

function required(name: string): string {
  const value = process.env[name]?.trim()
  if (!value) throw new Error(`${name} is required`)
  return value
}

const jwtSecret = required('JWT_SECRET')
if (Buffer.byteLength(jwtSecret, 'utf8') < 32 || jwtSecret.startsWith('replace_')) {
  throw new Error('JWT_SECRET must be a unique random value of at least 32 bytes')
}

const mediaPublicBaseUrl = process.env.MEDIA_PUBLIC_BASE_URL?.trim() || null
if (mediaPublicBaseUrl && !['http:', 'https:'].includes(new URL(mediaPublicBaseUrl).protocol)) {
  throw new Error('MEDIA_PUBLIC_BASE_URL must be an HTTP or HTTPS URL')
}

export const env = {
  port,
  db: {
    host: required('DB_HOST'),
    port: dbPort,
    user: required('DB_USER'),
    password: process.env.DB_PASSWORD ?? '',
    database: required('DB_NAME'),
  },
  jwtSecret,
  trustProxy,
  corsOrigins: (process.env.CORS_ORIGINS ?? 'http://localhost:3000,http://127.0.0.1:3000')
    .split(',').map((origin) => origin.trim()).filter(Boolean),
  mediaPublicBaseUrl,
}
