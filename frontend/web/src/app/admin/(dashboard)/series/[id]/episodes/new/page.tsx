import EpisodeForm from '@/features/episodes/components/episode-form'

type Props = {
  params: Promise<{ id: string }>
  searchParams: Promise<{ partId?: string | string[] }>
}

export default async function NewEpisodePage({ params, searchParams }: Props) {
  const [{ id }, { partId }] = await Promise.all([params, searchParams])
  return <EpisodeForm mode="create" seriesId={id} partId={typeof partId === 'string' ? partId : undefined} />
}
