'use client'

import { useRef, useState } from 'react'
import { emptySelection } from '@/features/metadata/lib/metadata-rules'
import { metadataActions, useMetadataStore } from '@/features/metadata/stores/metadata-store'
import type { MetadataSelection } from '@/features/metadata/types/metadata'

export function useContentMetadata(type: 'movie' | 'series', id?: string) {
  const state = useMetadataStore()
  const [draft, setDraft] = useState<MetadataSelection | null>(null)
  const newKey = useRef<string | null>(null)
  const key = id ? `${type}:${id}` : null
  const selection = draft ?? (key ? state.assignments[key] : undefined) ?? emptySelection

  function save(title: string) {
    if (!key && !newKey.current) newKey.current = `${type}:${crypto.randomUUID()}`
    return metadataActions.saveAssignment(key ?? newKey.current!, title, selection)
  }

  return { selection, setSelection: setDraft, save }
}
