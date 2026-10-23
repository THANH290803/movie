'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { api, currentUser, onSessionChange } from '@/lib/api/client'
import type { ApiPage, ApiTitle } from '@/lib/api/types'

type SavedState = {
  movies: ApiTitle[]
  savedIds: string[]
  loading: boolean
  error: string | null
  toggleSaved: (slug: string) => Promise<void>
}

const SavedContext = createContext<SavedState | null>(null)

async function fetchSavedTitles() {
  const items: ApiTitle[] = []
  for (let page = 1; ; page++) {
    const result = await api<ApiPage<ApiTitle>>(`/me/saved-titles?page=${page}&pageSize=100`)
    items.push(...result.data)
    if (page >= result.pagination.totalPages) return items
  }
}

export function SavedMoviesProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const [movies, setMovies] = useState<ApiTitle[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    async function load() {
      if (!currentUser()) { setMovies([]); setError(null); setLoading(false); return }
      setLoading(true)
      try {
        const items = await fetchSavedTitles()
        if (active) { setMovies(items); setError(null) }
      } catch (cause) {
        if (active) setError(cause instanceof Error ? cause.message : 'Không thể tải danh sách đã lưu.')
      } finally { if (active) setLoading(false) }
    }
    void load()
    const unsubscribe = onSessionChange(() => { void load() })
    return () => { active = false; unsubscribe() }
  }, [])

  async function toggleSaved(slug: string) {
    if (!currentUser()) {
      router.push(`/login?next=${encodeURIComponent(window.location.pathname)}`)
      return
    }
    const saved = movies.some((movie) => movie.slug === slug)
    try {
      if (saved) {
        await api<void>(`/me/saved-titles/${encodeURIComponent(slug)}`, { method: 'DELETE' })
        setMovies((current) => current.filter((movie) => movie.slug !== slug))
      } else {
        await api<{ slug: string }>('/me/saved-titles', { method: 'POST', body: JSON.stringify({ slug }) })
        setMovies(await fetchSavedTitles())
      }
      setError(null)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Không thể cập nhật danh sách đã lưu.')
    }
  }

  return <SavedContext.Provider value={{ movies, savedIds: movies.map((movie) => movie.id), loading, error, toggleSaved }}>{children}</SavedContext.Provider>
}

export function useSavedMovies() {
  const context = useContext(SavedContext)
  if (!context) throw new Error('useSavedMovies requires SavedMoviesProvider')
  return context
}
