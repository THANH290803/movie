import type { Metadata } from 'next'
import { MetadataScreen } from '@/features/metadata/components/metadata-screen'

export const metadata: Metadata = { title: 'Thể loại' }

export default function GenresPage() {
  return <MetadataScreen key="genre" kind="genre" />
}
