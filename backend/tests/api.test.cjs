const test = require('node:test')
const assert = require('node:assert/strict')

process.env.JWT_SECRET ||= 'test-only-secret-that-is-longer-than-32-bytes'
process.env.DB_HOST ||= '127.0.0.1'
process.env.DB_USER ||= 'test'
process.env.DB_NAME ||= 'test'

const { createApp } = require('../dist/app')
const { openApiDocument } = require('../dist/docs/openapi')
const { issueToken, passwordSchema } = require('../dist/modules/auth/auth')
const { refreshTokenSchema, sessionIdSchema } = require('../dist/modules/auth/auth.sessions')
const { sourceSchema, subtitleSchema, titleUpdateSchema, episodeUpdateSchema } = require('../dist/modules/titles/title.schemas')
const { publicationChanges } = require('../dist/modules/titles/title.service')
const { slugify } = require('../dist/shared/lib/validation')
const { userUpdateSchema } = require('../dist/modules/admin/users.routes')
const { genreUpdateSchema, personUpdateSchema } = require('../dist/modules/metadata/metadata.routes')

test('new passwords require eight characters and all four character groups', () => {
  assert.equal(passwordSchema.safeParse('Abcdef1!').success, true)
  assert.equal(passwordSchema.safeParse('Abcde1!').success, false)
  assert.equal(passwordSchema.safeParse('abcdef1!').success, false)
  assert.equal(passwordSchema.safeParse('ABCDEF1!').success, false)
  assert.equal(passwordSchema.safeParse('Abcdefg!').success, false)
  assert.equal(passwordSchema.safeParse('Abcdef12').success, false)
  assert.equal(passwordSchema.safeParse('Abcdef1 ').success, false)
  assert.equal(passwordSchema.safeParse(`${'a'.repeat(70)}A1!`).success, false)
  assert.equal(openApiDocument.components.schemas.RegisterInput.properties.password.minLength, 8)
})

test('access tokens identify a session and refresh tokens require the expected format', () => {
  const sessionId = '8a11bb91-f2d7-4f41-8b2c-e7d0bb0d3549'
  assert.equal(sessionIdSchema.safeParse(sessionId).success, true)
  assert.equal(refreshTokenSchema.safeParse(`${sessionId}.${'A'.repeat(43)}`).success, true)
  assert.equal(refreshTokenSchema.safeParse(`${sessionId}.short`).success, false)
  const jwt = require('jsonwebtoken')
  const decoded = jwt.decode(issueToken('123', sessionId))
  assert.equal(decoded.sid, sessionId)
  assert.equal(decoded.sub, '123')
  assert.equal(openApiDocument.components.schemas.AuthTokens.required.includes('refreshToken'), true)
  assert.ok(openApiDocument.paths['/api/v1/auth/refresh'].post)
  assert.ok(openApiDocument.paths['/api/v1/auth/logout'].post)
})

test('OpenAPI documents every path parameter and uses resolvable schemas', () => {
  const operationIds = new Set()
  let operations = 0
  for (const [path, methods] of Object.entries(openApiDocument.paths)) {
    for (const operation of Object.values(methods)) {
      operations++
      assert.equal(operationIds.has(operation.operationId), false)
      operationIds.add(operation.operationId)
      const declared = (operation.parameters || []).filter((item) => item.in === 'path').map((item) => item.name).sort()
      const present = [...path.matchAll(/\{([^}]+)\}/g)].map((match) => match[1]).sort()
      assert.deepEqual(declared, present, path)
    }
  }
  function visit(value) {
    if (!value || typeof value !== 'object') return
    if (value.$ref) assert.ok(openApiDocument.components.schemas[value.$ref.split('/').pop()], value.$ref)
    for (const item of Object.values(value)) visit(item)
  }
  visit(openApiDocument.paths)
  visit(openApiDocument.components.schemas)
  assert.ok(operations >= 60)
})

test('source and subtitle inputs enforce one playback location', () => {
  assert.equal(sourceSchema.safeParse({ sourceKind: 'external', format: 'hls', priority: 1, isActive: true, playbackUrl: 'https://example.com/a.m3u8' }).success, true)
  assert.equal(sourceSchema.safeParse({ sourceKind: 'external', format: 'hls', priority: 1, isActive: true, playbackUrl: 'https://example.com/a.m3u8', mediaAssetId: '1' }).success, false)
  assert.equal(sourceSchema.safeParse({ sourceKind: 'uploaded', format: 'mp4', priority: 1, isActive: true }).success, false)
  assert.equal(subtitleSchema.safeParse({ languageCode: 'vi', label: 'Tiếng Việt', format: 'vtt', isDefault: true, mediaAssetId: '1' }).success, true)
  assert.equal(subtitleSchema.safeParse({ languageCode: 'vi', label: 'Tiếng Việt', format: 'vtt', isDefault: true, mediaAssetId: '1', subtitleUrl: 'https://example.com/vi.vtt' }).success, false)
})

test('slugs are ASCII and scheduled content needs a date', () => {
  assert.equal(slugify('Đường Về Nhà'), 'duong-ve-nha')
  assert.throws(() => publicationChanges({ status: 'scheduled' }))
  assert.equal(publicationChanges({ status: 'published' }).status, 'published')
})

test('partial title and episode edits do not reset publication status', () => {
  assert.deepEqual(titleUpdateSchema.parse({ name: 'New title' }), { name: 'New title' })
  assert.deepEqual(episodeUpdateSchema.parse({ name: 'New episode' }), { name: 'New episode' })
  assert.deepEqual(userUpdateSchema.parse({ fullName: 'New name' }), { fullName: 'New name' })
  assert.deepEqual(genreUpdateSchema.parse({ name: 'New genre' }), { name: 'New genre' })
  assert.deepEqual(personUpdateSchema.parse({ name: 'New person' }), { name: 'New person' })
})

test('Swagger is served and admin routes require a bearer token without querying MySQL', async () => {
  const server = createApp().listen(0)
  try {
    const address = server.address()
    assert.ok(address && typeof address !== 'string')
    const base = `http://127.0.0.1:${address.port}`
    const docs = await fetch(`${base}/api-docs/`)
    assert.equal(docs.status, 200)
    const spec = await fetch(`${base}/openapi.json`)
    assert.equal(spec.status, 200)
    const protectedRoute = await fetch(`${base}/api/v1/admin/titles`)
    assert.equal(protectedRoute.status, 401)
    const invalidRegister = await fetch(`${base}/api/v1/auth/register`, {
      method: 'POST', headers: { 'content-type': 'application/json' }, body: '{}',
    })
    assert.equal(invalidRegister.status, 400)
    const invalidRefresh = await fetch(`${base}/api/v1/auth/refresh`, {
      method: 'POST', headers: { 'content-type': 'application/json' }, body: '{}',
    })
    assert.equal(invalidRefresh.status, 400)
  } finally {
    await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()))
  }
})
