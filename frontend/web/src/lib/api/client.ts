'use client'

import type { AuthResult, ApiUser } from './types'

const baseUrl = (process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3001').replace(/\/$/, '')
const storageKey = 'cineflow.auth.v1'
const changedEvent = 'cineflow:auth-changed'
let pendingRefresh: Promise<AuthResult> | null = null

type Session = AuthResult

export class ApiError extends Error {
  constructor(public status: number, message: string, public code?: string) { super(message) }
}

function readStorage(): { session: Session; persistent: boolean } | null {
  if (typeof window === 'undefined') return null
  for (const storage of [window.sessionStorage, window.localStorage]) {
    const raw = storage.getItem(storageKey)
    if (!raw) continue
    try {
      const session = JSON.parse(raw) as Session
      if (session.accessToken && session.refreshToken && session.user) {
        return { session, persistent: storage === window.localStorage }
      }
    } catch { storage.removeItem(storageKey) }
  }
  return null
}

export function currentUser(): ApiUser | null { return readStorage()?.session.user ?? null }
export function isSignedIn() { return readStorage() !== null }

export function saveSession(session: Session, persistent = false) {
  const storage = persistent ? window.localStorage : window.sessionStorage
  const other = persistent ? window.sessionStorage : window.localStorage
  other.removeItem(storageKey)
  storage.setItem(storageKey, JSON.stringify(session))
  window.dispatchEvent(new Event(changedEvent))
}

export function clearSession() {
  if (typeof window === 'undefined') return
  window.sessionStorage.removeItem(storageKey)
  window.localStorage.removeItem(storageKey)
  window.dispatchEvent(new Event(changedEvent))
}

export function onSessionChange(listener: () => void) {
  window.addEventListener(changedEvent, listener)
  window.addEventListener('storage', listener)
  return () => { window.removeEventListener(changedEvent, listener); window.removeEventListener('storage', listener) }
}

async function request<T>(path: string, init: RequestInit = {}, accessToken?: string): Promise<T> {
  let response: Response
  try {
    response = await fetch(`${baseUrl}/api/v1${path}`, {
      ...init,
      headers: {
        ...(init.body ? { 'Content-Type': 'application/json' } : {}),
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        ...init.headers,
      },
      cache: 'no-store',
    })
  } catch {
    throw new ApiError(503, 'Không thể kết nối đến API. Hãy kiểm tra backend.')
  }
  if (!response.ok) {
    const error = await response.json().catch(() => null) as { error?: string; message?: string; details?: { message: string }[] } | null
    throw new ApiError(response.status, error?.details?.[0]?.message ?? error?.message ?? `API trả mã ${response.status}`, error?.error)
  }
  return response.status === 204 ? undefined as T : response.json() as Promise<T>
}

export function publicApi<T>(path: string, init?: RequestInit) { return request<T>(path, init) }

async function refreshSession() {
  const stored = readStorage()
  if (!stored) throw new ApiError(401, 'Bạn cần đăng nhập.')
  if (!pendingRefresh) {
    pendingRefresh = request<AuthResult>('/auth/refresh', { method: 'POST', body: JSON.stringify({ refreshToken: stored.session.refreshToken }) })
      .then((session) => { saveSession(session, stored.persistent); return session })
      .catch((error) => { clearSession(); throw error })
      .finally(() => { pendingRefresh = null })
  }
  return pendingRefresh
}

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const session = readStorage()
  if (!session) throw new ApiError(401, 'Bạn cần đăng nhập.')
  try {
    return await request<T>(path, init, session.session.accessToken)
  } catch (error) {
    if (!(error instanceof ApiError) || error.status !== 401 || error.code !== 'UNAUTHORIZED') throw error
    const renewed = await refreshSession()
    return request<T>(path, init, renewed.accessToken)
  }
}

export async function signIn(email: string, password: string, persistent = false) {
  const result = await request<AuthResult>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) })
  saveSession(result, persistent)
  return result.user
}

export async function signUp(fullName: string, email: string, password: string) {
  const result = await request<AuthResult>('/auth/register', { method: 'POST', body: JSON.stringify({ fullName, email, password }) })
  saveSession(result)
  return result.user
}

export async function signOut() {
  const stored = readStorage()
  try {
    if (stored) await request<void>('/auth/logout', { method: 'POST', body: JSON.stringify({ refreshToken: stored.session.refreshToken }) })
  } finally { clearSession() }
}
