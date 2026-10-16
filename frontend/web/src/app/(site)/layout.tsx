import type { ReactNode } from 'react'
import { SiteShell } from '@/components/layouts/site/site-shell'
import './site.css'

export default function SiteLayout({ children }: { children: ReactNode }) {
  return <SiteShell>{children}</SiteShell>
}
