require('dotenv/config')

const path = require('node:path')

const config = {
  client: 'mysql2',
  connection: () => {
    const url = process.env.DATABASE_URL
    if (!url) {
      throw new Error('DATABASE_URL is required to run migrations')
    }
    const parsed = new URL(url)
    if (parsed.protocol !== 'mysql:') {
      throw new Error('DATABASE_URL must use the mysql:// scheme')
    }
    const database = decodeURIComponent(parsed.pathname.slice(1))
    if (!database) {
      throw new Error('DATABASE_URL must include a database name')
    }
    return { uri: url, database }
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
