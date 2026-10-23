import type { Metadata } from 'next'
import { ApiMetadata } from '@/features/admin/components/api-metadata'

export const metadata: Metadata = { title: 'Đạo diễn' }

export default function DirectorsPage() {
  return <ApiMetadata kind="director" />
}
