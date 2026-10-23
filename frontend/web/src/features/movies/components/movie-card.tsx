'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Heart, Play, Star } from 'lucide-react'
import { routes } from '@/config/routes'
import { useSavedMovies } from '@/features/movies/hooks/use-saved-movies'
import { getCatalogMeta } from '@/features/movies/lib/catalog-meta'
import type { CatalogMovie } from '@/features/movies/types/catalog-movie'

export function MovieCard({ movie }: { movie: CatalogMovie }) {
  const { savedIds, toggleSaved } = useSavedMovies()
  const isSaved = savedIds.includes(String(movie.id))

  return (
    <article className="cine-card">
      <div className="cine-poster">
        <Link href={routes.site.movie(movie.slug)} aria-label={`Xem chi tiết ${movie.name}`}>
          <Image src={movie.image} alt="" fill sizes="(max-width: 600px) 50vw, (max-width: 1100px) 33vw, 20vw" />
          <span className="cine-poster-shade" />
          <span className="cine-poster-play"><Play size={17} fill="currentColor" /></span>
        </Link>
        <button
          className={`cine-save-icon${isSaved ? ' is-saved' : ''}`}
          type="button"
          onClick={() => void toggleSaved(movie.slug)}
          aria-label={isSaved ? `Bỏ lưu ${movie.name}` : `Lưu ${movie.name}`}
          aria-pressed={isSaved}
        >
          <Heart size={16} fill={isSaved ? 'currentColor' : 'none'} />
        </button>
        <span className="cine-rating"><Star size={12} fill="currentColor" /> {movie.rating}</span>
      </div>
      <h3><Link href={routes.site.movie(movie.slug)}>{movie.name}</Link></h3>
      <p>{movie.year} · {getCatalogMeta(movie)}<span>{movie.type}</span></p>
    </article>
  )
}
