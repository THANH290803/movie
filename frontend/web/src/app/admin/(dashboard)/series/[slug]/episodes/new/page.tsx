import { ApiEpisodeForm } from '@/features/admin/components/api-episode-form'

export default async function Page({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ part?: string }> }) {
  const [{ slug }, { part }] = await Promise.all([params, searchParams])
  return <ApiEpisodeForm titleSlug={slug} seasonNumber={part ? Number(part) : undefined} />
}
