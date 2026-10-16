import MovieForm from '@/features/movies/components/movie-form'
export default async function EditMoviePage({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; return <MovieForm mode="edit" movieId={id} /> }
