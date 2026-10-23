import type { Metadata } from 'next'
import { ApiMetadata } from '@/features/admin/components/api-metadata'

export const metadata: Metadata = { title: 'Diễn viên' }

export default function ActorsPage() {
  return <ApiMetadata kind="actor" />
}
