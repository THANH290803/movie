'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Activity, Film, FolderKanban, Play, Users } from 'lucide-react'
import { PageHeader } from '@/components/common/page-header'
import { adminApi } from '@/lib/api/admin'
import type { ApiTitle } from '@/lib/api/types'

type Stats = Awaited<ReturnType<typeof adminApi.dashboard>>

async function allTitles(kind: 'movie' | 'series') {
  const rows: ApiTitle[] = []
  for (let page = 1; ; page++) {
    const result = await adminApi.titles(kind, page, 100)
    rows.push(...result.data)
    if (page >= result.pagination.totalPages) break
  }
  return rows
}

export function ApiDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [titles, setTitles] = useState<ApiTitle[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true
    Promise.all([adminApi.dashboard(), allTitles('movie'), allTitles('series')]).then(([values, movies, series]) => {
      if (!mounted) return
      setStats(values)
      setTitles([...movies, ...series])
    }).catch((cause) => { if (mounted) setError(cause instanceof Error ? cause.message : 'Không thể tải tổng quan.') })
    return () => { mounted = false }
  }, [])

  const cards = [
    { label: 'Tổng số phim', value: stats ? stats.movies + stats.series : null, icon: Film, color: 'bg-orange-100 text-orange-600', href: '/admin/movies' },
    { label: 'Phim bộ', value: stats?.series, icon: FolderKanban, color: 'bg-violet-100 text-violet-600', href: '/admin/series' },
    { label: 'Tổng số tập', value: stats?.episodes, icon: Play, color: 'bg-blue-100 text-blue-600', href: '/admin/series' },
    { label: 'Người dùng', value: stats?.users, icon: Users, color: 'bg-emerald-100 text-emerald-600', href: '/admin/users' },
  ]
  const months = Array.from({ length: 6 }, (_, index) => {
    const date = new Date()
    date.setDate(1)
    date.setMonth(date.getMonth() - (5 - index))
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    const published = titles.filter((item) => item.publishedAt?.startsWith(key))
    return { label: `T${date.getMonth() + 1}`, movies: published.filter((item) => item.kind === 'movie').length, series: published.filter((item) => item.kind === 'series').length }
  })
  const max = Math.max(1, ...months.flatMap((month) => [month.movies, month.series]))
  const recent = [...titles].sort((a, b) => (b.publishedAt ?? '').localeCompare(a.publishedAt ?? '')).slice(0, 3)

  return <>
    <PageHeader eyebrow={new Intl.DateTimeFormat('vi-VN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date()).toUpperCase()} title="Chào mừng trở lại, Admin" description="Đây là tình hình thư viện phim của bạn hôm nay." />
    {error && <p role="alert" className="mb-6 rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{cards.map(({ label, value, icon: Icon, color, href }) => <Link href={href} key={label} className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-orange-300"><div className="mb-5 flex items-center justify-between"><span className={`grid h-10 w-10 place-items-center rounded-xl ${color}`}><Icon size={19} /></span></div><p className="text-sm text-slate-500">{label}</p><strong className="mt-1 block text-2xl font-bold">{value == null ? '—' : value.toLocaleString('vi-VN')}</strong><p className="mt-1 text-xs text-slate-400">Dữ liệu hiện tại</p></Link>)}</div>
    <div className="mt-6 grid gap-6 xl:grid-cols-[1.5fr_1fr]">
      <div className="rounded-2xl border border-slate-200 bg-white p-6"><div className="flex items-center justify-between"><div><h2 className="font-bold">Nội dung xuất bản</h2><p className="mt-1 text-sm text-slate-500">Phim đã xuất bản trong 6 tháng gần nhất</p></div><span className="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500">6 tháng ▾</span></div><div className="mt-8 flex h-64 items-end gap-3 border-b border-l border-slate-100 px-3 pb-0 sm:gap-6">{months.map((month) => <div key={month.label} className="flex h-full flex-1 flex-col justify-end gap-1"><div className="flex min-h-0 flex-1 items-end gap-1"><div title={`${month.movies} phim lẻ`} className="w-1/2 rounded-t-md bg-orange-400 transition hover:bg-orange-500" style={{ height: `${month.movies ? Math.max(8, month.movies / max * 100) : 0}%` }} /><div title={`${month.series} phim bộ`} className="w-1/2 rounded-t-md bg-slate-200" style={{ height: `${month.series ? Math.max(8, month.series / max * 100) : 0}%` }} /></div><span className="mt-3 text-center text-[10px] text-slate-400">{month.label}</span></div>)}</div><div className="mt-5 flex gap-5 text-xs text-slate-500"><span><i className="mr-2 inline-block h-2 w-2 rounded-full bg-orange-400" />Phim lẻ</span><span><i className="mr-2 inline-block h-2 w-2 rounded-full bg-slate-200" />Phim bộ</span></div></div>
      <div className="rounded-2xl border border-slate-200 bg-white p-6"><div className="flex items-center justify-between"><div><h2 className="font-bold">Hoạt động gần đây</h2><p className="mt-1 text-sm text-slate-500">Nội dung mới trong thư viện</p></div><Activity size={18} className="text-orange-500" /></div><div className="mt-6 space-y-5">{recent.map((item) => <Link key={item.id} href={`/admin/${item.kind === 'movie' ? 'movies' : 'series'}/${item.slug}`} className="flex gap-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-orange-100 text-xs font-bold text-orange-600">{item.name[0]}</span><span><span className="block text-sm font-semibold">{item.name}</span><span className="text-xs text-slate-500">{item.kind === 'movie' ? 'Phim lẻ' : 'Phim bộ'} · {item.status === 'published' ? 'Đang chiếu' : 'Bản nháp'}</span></span></Link>)}{!recent.length && <p className="text-sm text-slate-500">Chưa có phim nào.</p>}</div></div>
    </div>
  </>
}
