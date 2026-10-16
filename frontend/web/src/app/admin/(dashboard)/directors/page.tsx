import type { Metadata } from 'next'
import { MetadataScreen } from '@/features/metadata/components/metadata-screen'

export const metadata: Metadata = { title: 'Đạo diễn' }

export default function DirectorsPage() {
  return <MetadataScreen key="director" kind="director" />
}
