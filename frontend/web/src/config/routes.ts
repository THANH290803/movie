export const routes = {
  site: {
    home: '/',
    movies: '/movies',
    saved: '/saved',
    login: '/login',
    register: '/register',
    movie: (slug: string) => `/movies/${encodeURIComponent(slug)}`,
    watch: (slug: string) => `/movies/${encodeURIComponent(slug)}/watch`,
    watchEpisode: (slug: string, episodeSlug: string) =>
      `/movies/${encodeURIComponent(slug)}/watch?episode=${encodeURIComponent(episodeSlug)}`,
  },
  admin: {
    home: '/admin',
    login: '/admin/login',
    dashboard: '/admin/dashboard',
    movies: '/admin/movies',
    series: '/admin/series',
    genres: '/admin/genres',
    directors: '/admin/directors',
    actors: '/admin/actors',
    users: '/admin/users',
    settings: '/admin/settings',
  },
} as const
