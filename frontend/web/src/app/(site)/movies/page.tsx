import type { Metadata } from 'next'
import { CatalogScreen } from '@/features/movies/components/catalog-screen'
import { mockCatalog } from '@/features/movies/data/mock-catalog'

export const metadata: Metadata = { title: 'Khám phá phim | Cineflow' }

export default async function MoviesPage({ searchParams }: { searchParams: Promise<{ q?: string | string[]; genre?: string | string[] }> }) {
  const { q, genre } = await searchParams
  return <CatalogScreen movies={mockCatalog} query={typeof q === 'string' ? q : ''} genre={typeof genre === 'string' ? genre : ''} />
}
