import { db } from '../config/database'
import { emailSchema, hashPassword, passwordSchema } from '../modules/auth/auth'
import { uniqueSlug } from '../shared/lib/validation'

async function main() {
  const email = emailSchema.parse(process.env.ADMIN_BOOTSTRAP_EMAIL)
  const password = passwordSchema.parse(process.env.ADMIN_BOOTSTRAP_PASSWORD)
  const name = (process.env.ADMIN_BOOTSTRAP_NAME ?? 'Cineflow Admin').trim()
  if (!name || name.length > 100) throw new Error('ADMIN_BOOTSTRAP_NAME must be 1-100 characters')
  const admins = await db('users').where({ role: 'admin', status: 'active' }).whereNull('deleted_at').first('id')
  if (admins) throw new Error('An active admin already exists; create further admins through the API')
  const existing = await db('users').where({ email }).first('id')
  if (existing) throw new Error('An account with this email already exists')
  const slug = await uniqueSlug(db, 'users', name, 100)
  const [id] = await db('users').insert({
    full_name: name, email, slug, password_hash: await hashPassword(password),
    role: 'admin', plan_code: 'free', status: 'active',
  })
  console.log(`Admin created: ${email} (ID ${id})`)
}

main().catch((error) => {
  console.error('Could not create initial admin:', error instanceof Error ? error.message : error)
  process.exitCode = 1
}).finally(() => db.destroy())
