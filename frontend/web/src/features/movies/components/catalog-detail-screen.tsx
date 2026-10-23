'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { ArrowDown, ArrowLeft, ArrowUpRight, Film, Heart, Layers3, Play, Star } from 'lucide-react'
import { routes } from '@/config/routes'
import { catalogEpisodeSlug } from '@/lib/slug'
import { useSavedMovies } from '@/features/movies/hooks/use-saved-movies'
import { getCatalogMeta } from '@/features/movies/lib/catalog-meta'
import type { CatalogMovie } from '@/features/movies/types/catalog-movie'

export function CatalogDetailScreen({ movie, relatedMovies }: { movie: CatalogMovie; relatedMovies: CatalogMovie[] }) {
  const { savedIds, toggleSaved } = useSavedMovies()
  const isSaved = savedIds.includes(String(movie.id))
  const hasEpisodes = movie.type === 'Phim bộ' && movie.parts.some((part) => part.episodes.length > 0)

  return (
    <article className="cine-detail">
      <Link href={routes.site.movies} className="cine-back"><ArrowLeft size={17} /> Quay lại thư viện</Link>
      <header className="cine-detail-hero">
        <Image className="cine-detail-backdrop" src={movie.image} alt="" fill sizes="(max-width: 900px) 100vw, 80vw" />
        <div className="cine-detail-poster"><Image src={movie.image} alt={`Hình minh họa ${movie.name}`} fill sizes="(max-width: 600px) 50vw, 250px" /><span className="cine-detail-poster-mark" aria-hidden="true">CINEFLOW</span></div>
        <div className="cine-detail-copy">
          <p className="cine-kicker orange">CINEFLOW / CHI TIẾT PHIM</p>
          <div className="cine-detail-eyebrow"><span className="cine-detail-label">{movie.type === 'Phim bộ' ? <Layers3 size={14} /> : <Film size={14} />}{movie.type}</span><span className="cine-detail-year">{movie.year}</span></div>
          <h1>{movie.name}</h1>
          <p className="cine-detail-subtitle">{movie.genre}</p>
          <div className="cine-detail-meta"><span className="cine-detail-length">{getCatalogMeta(movie)}</span><span className="cine-detail-rating"><Star size={16} fill="currentColor" /><strong>{movie.rating}</strong><small>Điểm phim</small></span></div>
          <div className="cine-detail-actions">
            {movie.type === 'Phim lẻ' || hasEpisodes ? (
              <Link className="cine-primary-button" href={routes.site.watch(movie.slug)}><Play size={16} fill="currentColor" />{movie.type === 'Phim bộ' ? 'Xem tập đầu' : 'Xem phim'}</Link>
            ) : <span className="cine-primary-button is-disabled">Chưa có tập phim</span>}
            <a className="cine-secondary-button" href={movie.type === 'Phim bộ' ? '#episodes' : '#overview'}><ArrowDown size={15} />{movie.type === 'Phim bộ' ? 'Xem danh sách tập' : 'Xem nội dung phim'}</a>
            <button className={`cine-save-button${isSaved ? ' is-saved' : ''}`} type="button" onClick={() => void toggleSaved(movie.slug)} aria-pressed={isSaved}>
              <Heart size={16} fill={isSaved ? 'currentColor' : 'none'} />{isSaved ? 'Đã lưu' : 'Lưu phim'}
            </button>
          </div>
        </div>
      </header>

      <div className="cine-detail-body">
        <div className="cine-detail-main">
          <section id="overview" className="cine-overview" aria-labelledby="cine-overview-title">
            <p className="cine-kicker orange">CÂU CHUYỆN / {movie.year}</p>
            <h2 id="cine-overview-title">Nội dung phim</h2>
            <p>{movie.synopsis}</p>
          </section>
          {movie.type === 'Phim bộ' && <SeriesEpisodes movie={movie} />}
        </div>
        <aside className="cine-detail-info" aria-label="Thông tin phim">
          <p className="cine-kicker orange">HỒ SƠ PHIM</p>
          <h2>Thông tin phim</h2>
          <dl>
            <div><dt>Định dạng</dt><dd>{movie.type}</dd></div>
            <div><dt>Năm phát hành</dt><dd>{movie.year}</dd></div>
            <div><dt>{movie.type === 'Phim bộ' ? 'Số phần' : 'Thời lượng'}</dt><dd>{getCatalogMeta(movie)}</dd></div>
            {movie.type === 'Phim bộ' && <div><dt>Số tập</dt><dd>{movie.parts.reduce((total, part) => total + part.episodes.length, 0)} tập</dd></div>}
            <div><dt>Thể loại</dt><dd>{movie.genre}</dd></div>
            <div><dt>Diễn viên</dt><dd>{movie.cast}</dd></div>
          </dl>
        </aside>
      </div>

      {relatedMovies.length > 0 && (
        <section className="cine-detail-related" aria-labelledby="cine-related-title">
          <div className="cine-detail-related-heading"><div><p className="cine-kicker orange">DÀNH CHO BẠN</p><h2 id="cine-related-title">Có thể bạn thích</h2></div><Link href={routes.site.movies}>Xem kho phim <ArrowUpRight size={16} /></Link></div>
          <div className="cine-detail-related-list">
            {relatedMovies.map((relatedMovie) => (
              <Link key={relatedMovie.id} href={routes.site.movie(relatedMovie.slug)} className="cine-detail-related-item">
                <span className="cine-detail-related-image"><Image src={relatedMovie.image} alt="" fill sizes="(max-width: 640px) 80px, 105px" /></span>
                <span className="cine-detail-related-copy"><strong>{relatedMovie.name}</strong><small>{relatedMovie.year} · {relatedMovie.type}</small><span>{relatedMovie.genre}</span></span>
                <ArrowUpRight className="cine-detail-related-arrow" size={16} />
              </Link>
            ))}
          </div>
        </section>
      )}
    </article>
  )
}

function SeriesEpisodes({ movie }: { movie: Extract<CatalogMovie, { type: 'Phim bộ' }> }) {
  const [selectedPartId, setSelectedPartId] = useState<string | number | null>(null)
  const activePart = movie.parts.find((part) => part.id === selectedPartId) ?? movie.parts[0]
  const totalEpisodes = movie.parts.reduce((total, part) => total + part.episodes.length, 0)

  return (
    <section id="episodes" className="cine-episodes" aria-labelledby="cine-episodes-title">
      <div className="cine-episodes-heading">
        <div><p className="cine-kicker orange">PHIM BỘ</p><h2 id="cine-episodes-title">Danh sách tập</h2><p>{movie.parts.length > 1 ? 'Chọn phần để xem các tập trong phần đó.' : activePart ? `Các tập trong ${activePart.name}.` : 'Các tập sẽ được cập nhật tại đây.'}</p></div>
        <span className="cine-episodes-count">{movie.parts.length} phần · {totalEpisodes} tập</span>
      </div>

      {movie.parts.length > 1 ? (
        <div className="cine-season-tabs" aria-label="Chọn phần phim">
          {movie.parts.map((part) => (
            <button key={part.id} type="button" className={part.id === activePart?.id ? 'is-active' : ''} aria-pressed={part.id === activePart?.id} onClick={() => setSelectedPartId(part.id)}>
              {part.name}<span>{part.episodes.length} tập</span>
            </button>
          ))}
        </div>
      ) : activePart ? (
        <p className="cine-single-season">{activePart.name} · {activePart.episodes.length} tập</p>
      ) : null}

      {activePart && activePart.episodes.length > 0 ? (
        <ol className="cine-episode-grid">
          {activePart.episodes.map((episode) => (
            <li key={episode.id}>
              <Link href={routes.site.watchEpisode(movie.slug, episode.slug ?? catalogEpisodeSlug(activePart.name, episode.number))} className="cine-episode-card" aria-label={`Xem ${activePart.name}, tập ${episode.number}: ${episode.title}`}>
                <div className="cine-episode-thumb"><Image src={movie.image} alt="" fill sizes="(max-width: 640px) 100vw, 180px" /><span>TẬP {String(episode.number).padStart(2, '0')}</span></div>
                <div className="cine-episode-copy"><p>{activePart.name} · {episode.duration}</p><h3>{episode.title}</h3><span>{episode.synopsis}</span></div>
                <span className="cine-episode-play" aria-hidden="true"><Play size={18} fill="currentColor" /></span>
              </Link>
            </li>
          ))}
        </ol>
      ) : (
        <p className="cine-episodes-empty">Phần này chưa có tập nào.</p>
      )}
    </section>
  )
}
