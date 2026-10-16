import MovieForm from '@/features/movies/components/movie-form'

export const metadata = { title: 'Thêm phim dài | Cineflow' }

export default function NewMoviePage() {
  return <MovieForm mode="create" />
}
