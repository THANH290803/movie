import type { ReactNode } from 'react'
import { SiteShell } from '@/components/layouts/site/site-shell'
import { SavedMoviesProvider } from '@/features/movies/hooks/saved-movies-provider'
import './site.css'

export default function SiteLayout({ children }: { children: ReactNode }) {
  return <SavedMoviesProvider><SiteShell>{children}</SiteShell></SavedMoviesProvider>
}
