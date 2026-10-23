import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, ChevronLeft, ChevronRight, Film, Radio } from 'lucide-react'
import { routes } from '@/config/routes'
import { catalogEpisodeSlug } from '@/lib/slug'
import { WatchEpisodeList } from '@/features/movies/components/watch-episode-list'
import type { CatalogMovie } from '@/features/movies/types/catalog-movie'

export function WatchScreen({ movie, selectedEpisodeSlug, subtitles = [] }: { movie: CatalogMovie; selectedEpisodeSlug?: string; subtitles?: { languageCode: string; label: string; url: string; isDefault: boolean }[] }) {
  const allEpisodes = movie.type === 'Phim bộ'
    ? movie.parts.flatMap((part) => part.episodes.map((episode) => ({ part, episode })))
    : []
  const selected = allEpisodes.find(({ part, episode }) => (episode.slug ?? catalogEpisodeSlug(part.name, episode.number)) === selectedEpisodeSlug) ?? allEpisodes[0]
  const currentIndex = selected ? allEpisodes.findIndex(({ episode }) => episode.id === selected.episode.id) : -1
  const previous = currentIndex > 0 ? allEpisodes[currentIndex - 1] : undefined
  const next = currentIndex >= 0 ? allEpisodes[currentIndex + 1] : undefined
  const videoUrl = movie.type === 'Phim lẻ' ? movie.videoUrl : selected?.episode.videoUrl

  return (
    <article className="cine-watch">
      <Link className="cine-back" href={routes.site.movie(movie.slug)}><ArrowLeft size={17} /> Quay lại chi tiết phim</Link>
      <header className="cine-watch-heading">
        <div>
          <p className="cine-kicker orange">CINEFLOW / KHÔNG GIAN XEM PHIM</p>
          <h1>{movie.name}</h1>
          <p>{movie.type === 'Phim bộ' && selected ? `${selected.part.name} · Tập ${selected.episode.number}: ${selected.episode.title}` : `${movie.type} · ${movie.year}`}</p>
        </div>
        <span className="cine-watch-badge"><Radio size={15} /> {movie.type}</span>
      </header>

      <div className="cine-watch-layout">
        <div className="cine-watch-main">
          <div className="cine-watch-player">
            {videoUrl ? (
              <video key={videoUrl} src={videoUrl} controls preload="metadata" poster={movie.image} playsInline aria-label={selected ? `Xem ${movie.name}, ${selected.part.name}, tập ${selected.episode.number}` : `Xem ${movie.name}`}>
                {subtitles.map((subtitle) => <track key={`${subtitle.languageCode}-${subtitle.url}`} kind="subtitles" src={subtitle.url} srcLang={subtitle.languageCode} label={subtitle.label} default={subtitle.isDefault} />)}
              </video>
            ) : (
              <div className="cine-watch-unavailable">
                <Image src={movie.image} alt="" fill sizes="(max-width: 1100px) 100vw, 70vw" />
                <div>
                  <span className="cine-watch-unavailable-icon"><Film size={30} /></span>
                  <strong>Chưa có video để phát</strong>
                  <p>{selected ? `Tập ${selected.episode.number} hiện chưa có nguồn video. Vui lòng quay lại sau.` : 'Phim hiện chưa có nguồn video. Vui lòng quay lại sau.'}</p>
                </div>
              </div>
            )}
          </div>

          <div className="cine-watch-below">
            <div>
              <p className="cine-kicker orange">ĐANG XEM</p>
              <h2>{selected ? `Tập ${selected.episode.number} · ${selected.episode.title}` : movie.name}</h2>
              <p>{selected ? selected.episode.synopsis : movie.synopsis}</p>
            </div>
            {selected && (
              <nav className="cine-watch-next" aria-label="Chuyển tập">
                {previous && <Link href={routes.site.watchEpisode(movie.slug, previous.episode.slug ?? catalogEpisodeSlug(previous.part.name, previous.episode.number))}><ChevronLeft size={17} /> Tập trước</Link>}
                {next && <Link href={routes.site.watchEpisode(movie.slug, next.episode.slug ?? catalogEpisodeSlug(next.part.name, next.episode.number))}>Tập tiếp <ChevronRight size={17} /></Link>}
              </nav>
            )}
          </div>
        </div>

        {movie.type === 'Phim bộ' && (
          <aside className="cine-watch-episodes" aria-label="Chọn tập phim">
            <div className="cine-watch-episodes-heading"><div><p className="cine-kicker orange">DANH SÁCH PHÁT</p><h2>Chọn tập phim</h2></div><span>{allEpisodes.length} tập</span></div>
            <div className="cine-watch-parts">
              {movie.parts.map((part) => {
                const firstEpisode = part.episodes[0]
                return firstEpisode ? (
                  <Link key={part.id} href={routes.site.watchEpisode(movie.slug, firstEpisode.slug ?? catalogEpisodeSlug(part.name, firstEpisode.number))} className={selected?.part.id === part.id ? 'is-active' : ''}>{part.name}</Link>
                ) : <span key={part.id} className="is-empty">{part.name}</span>
              })}
            </div>
            {selected?.part.episodes.length ? (
              <WatchEpisodeList key={`${selected.part.id}-${selected.episode.id}`} movieSlug={movie.slug} partName={selected.part.name} episodes={selected.part.episodes} selectedEpisodeId={selected.episode.id} />
            ) : <p className="cine-episodes-empty">Chưa có tập nào để xem.</p>}
          </aside>
        )}
      </div>
    </article>
  )
}
