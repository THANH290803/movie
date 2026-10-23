import type { Metadata } from 'next'
import { SavedScreen } from '@/features/movies/components/saved-screen'

export const metadata: Metadata = { title: 'Danh sách của tôi | Cineflow' }

export default function SavedPage() {
  return <SavedScreen />
}
