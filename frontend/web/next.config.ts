import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },
  async redirects() {
    return [
      // Keep old admin bookmarks working after moving management routes.
      { source: '/dashboard', destination: '/admin/dashboard', permanent: false },
      { source: '/users', destination: '/admin/users', permanent: false },
      { source: '/settings', destination: '/admin/settings', permanent: false },
      { source: '/series/:path*', destination: '/admin/series/:path*', permanent: false },
      { source: '/movies/new', destination: '/admin/movies/new', permanent: false },
      { source: '/movies/:id/edit', destination: '/admin/movies/:id/edit', permanent: false },
    ]
  },
}

export default nextConfig
