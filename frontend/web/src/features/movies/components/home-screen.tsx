import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Play, Star } from 'lucide-react'
import { routes } from '@/config/routes'
import { MovieCard } from '@/features/movies/components/movie-card'
import { getCatalogMeta } from '@/features/movies/lib/catalog-meta'
import type { CatalogMovie } from '@/features/movies/types/catalog-movie'

export function HomeScreen({ movies }: { movies: CatalogMovie[] }) {
  const featured = movies[0]

  return (
    <>
      <section className="cine-hero">
        <Image className="cine-hero-image" src={featured.image} alt="" fill priority sizes="(max-width: 900px) 100vw, 80vw" />
        <div className="cine-hero-copy">
          <p className="cine-kicker"><span>PHIM NỔI BẬT</span><i /> Lựa chọn cho bạn</p>
          <h1>DUNE:<br /><em>PART TWO</em></h1>
          <p className="cine-hero-meta">{featured.year}<b>•</b>{getCatalogMeta(featured)}<b>•</b><span><Star size={14} fill="currentColor" /> {featured.rating}</span></p>
          <p className="cine-hero-desc">{featured.synopsis}</p>
          <Link className="cine-primary-button" href={routes.site.movie(featured.id)}><Play size={16} fill="currentColor" /> Xem chi tiết</Link>
        </div>
      </section>

      <section className="cine-section">
        <div className="cine-section-heading"><div><p className="cine-kicker orange">DÀNH CHO BẠN</p><h2>Đang thịnh hành</h2></div><Link className="cine-see-all" href={routes.site.movies}>Xem tất cả <ArrowRight size={16} /></Link></div>
        <div className="cine-card-grid">{movies.slice(0, 4).map((movie) => <MovieCard key={movie.id} movie={movie} />)}</div>
      </section>

      <section className="cine-section">
        <div className="cine-section-heading"><div><p className="cine-kicker orange">MỚI CẬP NHẬT</p><h2>Phim mới trên Cineflow</h2></div></div>
        <div className="cine-card-grid">{movies.slice(3, 7).map((movie) => <MovieCard key={movie.id} movie={movie} />)}</div>
      </section>
    </>
  )
}
