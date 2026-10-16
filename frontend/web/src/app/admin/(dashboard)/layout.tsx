import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { AdminShell } from '@/components/layouts/admin/admin-shell'
import '@/components/common/admin-table.css'

export const metadata: Metadata = {
  title: { default: 'Quản trị | Cineflow', template: '%s | Cineflow Admin' },
  robots: { index: false, follow: false },
}

// Add a server-side session/role check here when the authentication API is ready.
// This layout currently wraps demo screens; it does not grant or verify access.
export default function AdminLayout({ children }: { children: ReactNode }) {
  return <AdminShell>{children}</AdminShell>
}
