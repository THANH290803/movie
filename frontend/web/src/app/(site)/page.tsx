import { HomeScreen } from '@/features/movies/components/home-screen'
import { getPublicTitles } from '@/features/movies/lib/catalog-api'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  return <HomeScreen movies={await getPublicTitles()} />
}
