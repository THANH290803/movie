import { ApiEpisodeForm } from '@/features/admin/components/api-episode-form'

export default async function Page({ params }: { params: Promise<{ slug: string; episodeSlug: string }> }) {
  const { slug, episodeSlug } = await params
  return <ApiEpisodeForm titleSlug={slug} episodeSlug={episodeSlug} />
}
