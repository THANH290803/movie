"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  Clapperboard,
  Film,
  FolderKanban,
  LayoutDashboard,
  LogOut,
  Menu,
  Search,
  Settings,
  Users,
  Tag,
  Video,
  UserRound,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { routes } from '@/config/routes';
import { api, isSignedIn, signOut } from '@/lib/api/client';
import type { ApiUser } from '@/lib/api/types';

const links = [
  { href: routes.admin.dashboard, label: "Tổng quan", icon: LayoutDashboard },
  { href: routes.admin.movies, label: "Kho phim", icon: Film },
  { href: routes.admin.series, label: "Phim bộ & phần", icon: FolderKanban },
  { href: routes.admin.users, label: "Người dùng", icon: Users },
  { href: routes.admin.genres, label: "Thể loại", icon: Tag },
  { href: routes.admin.directors, label: "Đạo diễn", icon: Video },
  { href: routes.admin.actors, label: "Diễn viên", icon: UserRound },
  { href: routes.admin.settings, label: "Cài đặt", icon: Settings },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<ApiUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    if (!isSignedIn()) {
      router.replace(routes.admin.login);
      return;
    }
    api<{ user: ApiUser }>('/auth/me').then(({ user: account }) => {
      if (!active) return;
      if (account.role !== 'admin' && account.role !== 'editor') { router.replace(routes.admin.login); return; }
      setUser(account);
      setLoading(false);
    }).catch((cause) => {
      if (!active) return;
      if (cause?.status === 401 || cause?.status === 403) router.replace(routes.admin.login);
      else { setError(cause instanceof Error ? cause.message : 'Không thể tải tài khoản.'); setLoading(false); }
    });
    return () => { active = false; };
  }, [router]);
  const active = links.find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`)) ?? links[0];
  if (loading) return <div className="grid min-h-screen place-items-center bg-[#f7f8fc] text-slate-500">Đang kiểm tra phiên đăng nhập...</div>;
  if (error) return <div role="alert" className="grid min-h-screen place-items-center bg-[#f7f8fc] text-red-700">{error}</div>;
  if (!user) return null;
  return (
    <div className="min-h-screen bg-[#f7f8fc] text-slate-900">
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col overflow-y-auto border-r border-slate-200 bg-white px-5 py-6 transition-transform lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex items-center justify-between px-2">
          <Link href={routes.admin.dashboard} className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-slate-950 text-orange-400">
              <Clapperboard size={20} />
            </span>
            <span className="text-xl font-bold tracking-tight">
              cine<span className="text-orange-500">flow</span>
            </span>
          </Link>
          <button
            className="lg:hidden"
            onClick={() => setOpen(false)}
            aria-label="Đóng menu"
          >
            <X size={20} />
          </button>
        </div>
        <div className="mt-8 flex items-center gap-3 rounded-2xl bg-slate-50 p-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-orange-100 text-sm font-bold text-orange-600">
            CF
          </div>
          <div>
            <p className="text-sm font-semibold">Cineflow Studio</p>
            <p className="text-xs text-slate-500">Không gian chính</p>
          </div>
        </div>
        <p className="mb-3 mt-9 px-3 text-[10px] font-bold tracking-[.18em] text-slate-400">
          QUẢN LÝ NỘI DUNG
        </p>
        <nav className="space-y-1">
          {links.slice(0, 4).filter((item) => user.role === 'admin' || item.href !== routes.admin.users).map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${active.href === href ? "bg-slate-950 text-white shadow-lg shadow-slate-200" : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"}`}
            >
              <Icon size={18} />
              <span>{label}</span>
              {label === "Phim bộ & phần" && (
                <span className="ml-auto rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-bold text-orange-600">
                  ·
                </span>
              )}
            </Link>
          ))}
        </nav>
        <p className="mb-3 mt-6 px-3 text-[10px] font-bold tracking-[.18em] text-slate-400">DANH MỤC</p>
        <nav aria-label="Danh mục phim" className="space-y-1">
          {links.slice(4, 7).map(({ href, label, icon: Icon }) => <Link key={href} href={href} onClick={() => setOpen(false)} aria-current={active.href === href ? 'page' : undefined} className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${active.href === href ? 'bg-slate-950 text-white shadow-lg shadow-slate-200' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'}`}><Icon size={18} /><span>{label}</span></Link>)}
        </nav>
        <p className="mb-3 mt-9 px-3 text-[10px] font-bold tracking-[.18em] text-slate-400">
          HỆ THỐNG
        </p>
        <Link
          href={routes.admin.settings}
          onClick={() => setOpen(false)}
          className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium ${pathname === "/admin/settings" ? "bg-slate-950 text-white" : "text-slate-500 hover:bg-slate-100"}`}
        >
          <Settings size={18} />
          Cài đặt
        </Link>
        <div className="mt-auto flex shrink-0 items-center gap-3 border-t border-slate-100 pt-4">
          <div className="grid h-9 w-9 place-items-center rounded-full bg-slate-900 text-xs font-bold text-white">
            {user.fullName.slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold">{user.fullName}</p>
            <p className="truncate text-xs text-slate-500">{user.email}</p>
          </div>
          <button
            className="ml-auto text-slate-400"
            onClick={async () => { await signOut(); router.replace(routes.admin.login); }}
            aria-label="Đăng xuất"
          >
            <LogOut size={16} />
          </button>
        </div>
      </aside>
      <section className="lg:pl-72">
        <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-200/80 bg-[#f7f8fc]/90 px-5 backdrop-blur lg:px-10">
          <div className="flex items-center gap-3">
            <button
              className="rounded-xl bg-white p-2 shadow-sm lg:hidden"
              onClick={() => setOpen(true)}
              aria-label="Mở menu"
            >
              <Menu size={20} />
            </button>
            <div className="hidden text-sm text-slate-400 sm:block">
              Không gian chính <span className="mx-2">/</span>{" "}
              <strong className="text-slate-900">{active.label}</strong>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              className="rounded-xl bg-white p-3 text-slate-500 shadow-sm"
              aria-label="Tìm kiếm"
            >
              <Search size={17} />
            </button>
            <button
              className="relative rounded-xl bg-white p-3 text-slate-500 shadow-sm"
              aria-label="Thông báo"
            >
              <Bell size={17} />
              <i className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-orange-500" />
            </button>
            <div className="ml-2 grid h-9 w-9 place-items-center rounded-full bg-slate-900 text-xs font-bold text-white">
              {user.fullName.slice(0, 2).toUpperCase()}
            </div>
          </div>
        </header>
        <div className="px-5 py-8 lg:px-10">{children}</div>
      </section>
    </div>
  );
}

export default AdminShell;
