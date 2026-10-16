import type { Metadata } from 'next'
import { MetadataScreen } from '@/features/metadata/components/metadata-screen'

export const metadata: Metadata = { title: 'Diễn viên' }

export default function ActorsPage() {
  return <MetadataScreen key="actor" kind="actor" />
}
