import Link from 'next/link'
import { routes } from '@/config/routes'

export default function MovieNotFound() {
  return (
    <section className="py-16 text-center">
      <h1 className="text-3xl font-bold">Không tìm thấy phim</h1>
      <Link href={routes.site.movies} className="mt-6 inline-block text-orange-300">Quay lại kho phim</Link>
    </section>
  )
}
