import type { Metadata } from 'next'
import { CatalogScreen } from '@/features/movies/components/catalog-screen'
import { getPublicTitles } from '@/features/movies/lib/catalog-api'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = { title: 'Khám phá phim | Cineflow' }

export default async function MoviesPage({ searchParams }: { searchParams: Promise<{ q?: string | string[]; genre?: string | string[] }> }) {
  const { q, genre } = await searchParams
  const query = typeof q === 'string' ? q : ''
  const genreName = typeof genre === 'string' ? genre : ''
  return <CatalogScreen movies={await getPublicTitles(query, genreName)} query={query} genre={genreName} />
}
