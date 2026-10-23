import { ApiTitleForm } from '@/features/admin/components/api-title-form'

export const metadata = { title: 'Thêm phim dài | Cineflow' }

export default function NewMoviePage() {
  return <ApiTitleForm kind="movie" />
}
