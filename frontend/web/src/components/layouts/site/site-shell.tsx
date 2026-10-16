"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CirclePlay,
  Compass,
  Heart,
  Home,
  Menu,
  Search,
  X,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { routes } from "@/config/routes";
import { useSavedMovies } from "@/features/movies/hooks/use-saved-movies";

const navItems = [
  { label: "Trang chủ", href: routes.site.home, icon: Home },
  { label: "Khám phá", href: routes.site.movies, icon: Compass },
  { label: "Danh sách của tôi", href: routes.site.saved, icon: Heart },
];
const genres = [
  "Tất cả",
  "Hành động",
  "Tâm lý",
  "Kinh dị",
  "Phiêu lưu",
  "Tình cảm",
];

export function SiteShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const { savedIds } = useSavedMovies();

  return (
    <div className="cine-app">
      {menuOpen && (
        <button
          className="cine-mobile-overlay"
          type="button"
          onClick={() => setMenuOpen(false)}
          aria-label="Đóng menu"
        />
      )}
      <aside className={`cine-sidebar${menuOpen ? " is-open" : ""}`}>
        <div className="cine-brand">
          <Link
            href={routes.site.home}
            onClick={() => setMenuOpen(false)}
            aria-label="Cineflow — Trang chủ"
          >
            <span className="cine-logo">
              <CirclePlay size={19} />
            </span>
            <strong>
              CINE<span>FLOW</span>
            </strong>
          </Link>
          <button
            className="cine-close"
            type="button"
            onClick={() => setMenuOpen(false)}
            aria-label="Đóng menu"
          >
            <X size={20} />
          </button>
        </div>
        <p className="cine-nav-label">KHÔNG GIAN CỦA BẠN</p>
        <nav className="cine-nav" aria-label="Điều hướng người xem">
          {navItems.map(({ label, href, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMenuOpen(false)}
              className={
                pathname === href ||
                (href === routes.site.movies && pathname.startsWith("/movies"))
                  ? "is-active"
                  : ""
              }
            >
              <Icon size={17} />
              {label}
              {href === routes.site.saved && savedIds.length > 0 && (
                <b className="cine-count">{savedIds.length}</b>
              )}
            </Link>
          ))}
        </nav>
        <div className="cine-side-line" />
        <p className="cine-nav-label">THỂ LOẠI PHIM</p>
        <nav className="cine-genres" aria-label="Lọc theo thể loại">
          {genres.map((genre) => (
            <Link
              key={genre}
              href={
                genre === "Tất cả"
                  ? routes.site.movies
                  : `${routes.site.movies}?genre=${encodeURIComponent(genre)}`
              }
              onClick={() => setMenuOpen(false)}
            >
              {genre}
            </Link>
          ))}
        </nav>
        {/* <div className="cine-sidebar-bottom">
          <p>
            Những câu chuyện hay
            <br />
            luôn chờ bạn khám phá.
          </p>
          <span>© Cineflow</span>
        </div> */}
      </aside>
      <div className="cine-main">
        <header className="cine-header">
          <button
            className="cine-menu-btn"
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="Mở menu"
          >
            <Menu size={22} />
          </button>
          <form className="cine-search" action={routes.site.movies}>
            <Search size={17} aria-hidden="true" />
            <input
              name="q"
              type="search"
              placeholder="Tìm kiếm phim..."
              aria-label="Tìm kiếm phim"
            />
          </form>
          <div className="cine-header-end">
            <span className="cine-header-caption">KHÔNG GIAN ĐIỆN ẢNH</span>
            <span className="cine-header-mark">C</span>
          </div>
        </header>
        <main className="cine-content">{children}</main>
      </div>
    </div>
  );
}
