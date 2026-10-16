'use client'

import { useMemo, useSyncExternalStore } from 'react'

const storageKey = 'cineflow:saved-movies'
const changeEvent = 'cineflow:saved-movies-change'

function subscribe(callback: () => void) {
  window.addEventListener('storage', callback)
  window.addEventListener(changeEvent, callback)
  return () => {
    window.removeEventListener('storage', callback)
    window.removeEventListener(changeEvent, callback)
  }
}

function getSnapshot() {
  return window.localStorage.getItem(storageKey) ?? '[]'
}

function getServerSnapshot() {
  return '[]'
}

export function useSavedMovies() {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  const savedIds = useMemo(() => {
    try {
      const parsed: unknown = JSON.parse(snapshot)
      return Array.isArray(parsed) ? parsed.filter((id): id is number => typeof id === 'number') : []
    } catch {
      return []
    }
  }, [snapshot])

  function toggleSaved(id: number) {
    const next = savedIds.includes(id) ? savedIds.filter((savedId) => savedId !== id) : [...savedIds, id]
    window.localStorage.setItem(storageKey, JSON.stringify(next))
    window.dispatchEvent(new Event(changeEvent))
  }

  return { savedIds, toggleSaved }
}
