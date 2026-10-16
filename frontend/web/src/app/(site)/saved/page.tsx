import type { Metadata } from 'next'
import { SavedScreen } from '@/features/movies/components/saved-screen'
import { mockCatalog } from '@/features/movies/data/mock-catalog'

export const metadata: Metadata = { title: 'Danh sách của tôi | Cineflow' }

export default function SavedPage() {
  return <SavedScreen movies={mockCatalog} />
}
