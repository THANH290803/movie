export const routes = {
  site: {
    home: '/',
    movies: '/movies',
    saved: '/saved',
    movie: (id: number | string) => `/movies/${encodeURIComponent(String(id))}`,
    watch: (id: number | string) => `/movies/${encodeURIComponent(String(id))}/watch`,
    watchEpisode: (id: number | string, episodeId: number | string) =>
      `/movies/${encodeURIComponent(String(id))}/watch?episode=${encodeURIComponent(String(episodeId))}`,
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
