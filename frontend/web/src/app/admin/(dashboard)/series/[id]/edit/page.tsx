import SeriesForm from '@/features/series/components/series-form'
export default async function EditSeriesPage({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; return <SeriesForm mode="edit" seriesId={id} /> }
