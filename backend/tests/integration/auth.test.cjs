const test = require('node:test')
const assert = require('node:assert/strict')
const { randomUUID } = require('node:crypto')

const { createApp } = require('../../dist/app')
const { db } = require('../../dist/config/database')

test('refresh token rotates, logout revokes access, and password change revokes sessions', async () => {
  const email = `refresh-test-${randomUUID()}@example.com`
  const password = 'Secure123!'
  const nextPassword = 'Updated123!'
  const server = createApp().listen(0)
  const address = server.address()
  assert.ok(address && typeof address !== 'string')
  const base = `http://127.0.0.1:${address.port}/api/v1/auth`

  async function post(path, body, token) {
    return fetch(`${base}${path}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', ...(token ? { authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify(body),
    })
  }

  async function me(token) {
    return fetch(`${base}/me`, { headers: { authorization: `Bearer ${token}` } })
  }

  try {
    const registered = await post('/register', { fullName: 'Refresh Test', email, password })
    assert.equal(registered.status, 201)
    const first = await registered.json()
    assert.equal(first.user.email, email)
    assert.equal((await me(first.accessToken)).status, 200)

    const rotatedResponse = await post('/refresh', { refreshToken: first.refreshToken })
    assert.equal(rotatedResponse.status, 200)
    const second = await rotatedResponse.json()
    assert.notEqual(second.refreshToken, first.refreshToken)
    assert.equal((await post('/refresh', { refreshToken: first.refreshToken })).status, 401)
    assert.equal((await me(second.accessToken)).status, 200)

    const parallelLogin = await post('/login', { email, password })
    assert.equal(parallelLogin.status, 200)
    const parallel = await parallelLogin.json()

    assert.equal((await post('/logout', { refreshToken: second.refreshToken })).status, 204)
    assert.equal((await me(first.accessToken)).status, 401)
    assert.equal((await me(second.accessToken)).status, 401)
    assert.equal((await post('/refresh', { refreshToken: second.refreshToken })).status, 401)
    assert.equal((await me(parallel.accessToken)).status, 200)

    const loggedIn = await post('/login', { email, password })
    assert.equal(loggedIn.status, 200)
    const third = await loggedIn.json()
    assert.equal((await post('/change-password', { currentPassword: password, newPassword: nextPassword }, third.accessToken)).status, 204)
    assert.equal((await me(third.accessToken)).status, 401)
    assert.equal((await post('/refresh', { refreshToken: third.refreshToken })).status, 401)
    assert.equal((await me(parallel.accessToken)).status, 401)
    assert.equal((await post('/refresh', { refreshToken: parallel.refreshToken })).status, 401)
    assert.equal((await post('/login', { email, password })).status, 401)
    assert.equal((await post('/login', { email, password: nextPassword })).status, 200)
  } finally {
    try {
      await db('users').where({ email }).delete()
    } finally {
      try {
        await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()))
      } finally {
        await db.destroy()
      }
    }
  }
})
