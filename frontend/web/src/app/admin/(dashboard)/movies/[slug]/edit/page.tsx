import { ApiTitleForm } from '@/features/admin/components/api-title-form'

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  return <ApiTitleForm kind="movie" slug={slug} />
}
