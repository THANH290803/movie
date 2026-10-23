require('dotenv/config')

const path = require('node:path')

const config = {
  client: 'mysql2',
  connection: () => {
    const required = ['DB_HOST', 'DB_USER', 'DB_NAME']
    const missing = required.filter((key) => !process.env[key]?.trim())
    if (missing.length) {
      throw new Error(`Missing MySQL environment variables: ${missing.join(', ')}`)
    }

    const port = Number(process.env.DB_PORT || 3306)
    if (!Number.isInteger(port) || port < 1 || port > 65535) {
      throw new Error('DB_PORT must be an integer between 1 and 65535')
    }

    return {
      host: process.env.DB_HOST,
      port,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD ?? '',
      database: process.env.DB_NAME,
    }
  },
  migrations: {
    directory: path.join(__dirname, 'migrations'),
    extension: 'js',
    loadExtensions: ['.js'],
    tableName: 'schema_migrations',
  },
}

module.exports = {
  development: config,
  test: config,
  production: config,
}
