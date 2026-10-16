import EpisodeForm from '@/features/episodes/components/episode-form'

type Props = {
  params: Promise<{ id: string; episodeId: string }>
  searchParams: Promise<{ partId?: string | string[] }>
}

export default async function EditEpisodePage({ params, searchParams }: Props) {
  const [{ id, episodeId }, { partId }] = await Promise.all([params, searchParams])
  return <EpisodeForm mode="edit" seriesId={id} episodeId={episodeId} partId={typeof partId === 'string' ? partId : undefined} />
}
