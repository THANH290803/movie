import { ApiTitleDetailScreen } from '@/features/admin/components/api-title-detail'

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  return <ApiTitleDetailScreen kind="series" slug={slug} />
}
