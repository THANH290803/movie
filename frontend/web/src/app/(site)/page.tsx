import { HomeScreen } from '@/features/movies/components/home-screen'
import { mockCatalog } from '@/features/movies/data/mock-catalog'

export default function HomePage() {
  return <HomeScreen movies={mockCatalog} />
}
