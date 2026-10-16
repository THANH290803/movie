import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'Đăng nhập quản trị | Cineflow',
  robots: { index: false, follow: false },
}

export default function AdminAuthLayout({ children }: { children: ReactNode }) {
  return children
}
