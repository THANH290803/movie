import type { Metadata } from 'next'
import { ApiMetadata } from '@/features/admin/components/api-metadata'

export const metadata: Metadata = { title: 'Thể loại' }

export default function GenresPage() {
  return <ApiMetadata kind="genre" />
}
