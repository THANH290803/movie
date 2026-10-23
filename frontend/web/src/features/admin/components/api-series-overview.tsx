'use client'

import { useCallback, useEffect, useState, type FormEvent } from 'react'
import Link from 'next/link'
import { Check, ChevronDown, Clapperboard, Edit3, Eye, Film, Play, Plus, Search, Trash2 } from 'lucide-react'
import { PageHeader } from '@/components/common/page-header'
import { AdminActionDialog } from '@/components/common/admin-action-dialog'
import { Modal } from '@/components/common/modal'
import { adminApi } from '@/lib/api/admin'
import type { ApiEpisode, ApiTitle, ApiTitleDetail } from '@/lib/api/types'

type DeleteTarget = { kind: 'series' | 'season' | 'episode'; label: string; seasonNumber?: number; episodeSlug?: string }

export function ApiSeriesOverview() {
  const [series, setSeries] = useState<ApiTitle[]>([])
  const [query, setQuery] = useState('')
  const [selectedSlug, setSelectedSlug] = useState('')
  const [detail, setDetail] = useState<ApiTitleDetail | null>(null)
  const [selectedSeason, setSelectedSeason] = useState(1)
  const [seasonEditor, setSeasonEditor] = useState<number | 'new' | null>(null)
  const [seasonName, setSeasonName] = useState('')
  const [deleting, setDeleting] = useState<DeleteTarget | null>(null)
  const [preview, setPreview] = useState<{ name: string; url: string | null } | null>(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const loadList = useCallback(async () => {
    try {
      const items: ApiTitle[] = []
      for (let page = 1; ; page++) {
        const result = await adminApi.titles('series', page, 100)
        items.push(...result.data)
        if (page >= result.pagination.totalPages) break
      }
      setSeries(items)
      setSelectedSlug((current) => items.some((item) => item.slug === current) ? current : items[0]?.slug ?? '')
      setError('')
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Không thể tải phim bộ.') }
  }, [])
  const loadDetail = useCallback(async () => {
    if (!selectedSlug) { setDetail(null); return }
    try { const result = await adminApi.title(selectedSlug); setDetail(result.title); setSelectedSeason((current) => result.title.seasons.some((season) => season.seasonNumber === current) ? current : result.title.seasons[0]?.seasonNumber ?? 1); setError('') }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'Không thể tải chi tiết phim bộ.') }
  }, [selectedSlug])
  useEffect(() => { queueMicrotask(() => { void loadList() }) }, [loadList])
  useEffect(() => { queueMicrotask(() => { void loadDetail() }) }, [loadDetail])

  const filtered = series.filter((item) => item.name.toLocaleLowerCase('vi').includes(query.toLocaleLowerCase('vi')))
  const selected = series.find((item) => item.slug === selectedSlug)
  const activeSeason = detail?.seasons.find((season) => season.seasonNumber === selectedSeason)
  const totalEpisodes = detail?.seasons.reduce((total, season) => total + season.episodes.length, 0) ?? 0

  async function saveSeason(event: FormEvent) {
    event.preventDefault(); if (!detail || seasonEditor === null) return
    setBusy(true); setError('')
    try {
      if (seasonEditor === 'new') await adminApi.createSeason(detail.slug, { seasonNumber: Math.max(0, ...detail.seasons.map((season) => season.seasonNumber)) + 1, name: seasonName.trim() })
      else await adminApi.updateSeason(detail.slug, seasonEditor, { name: seasonName.trim() })
      setSeasonEditor(null); await loadDetail()
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Không thể lưu phần phim.') }
    finally { setBusy(false) }
  }
  async function remove() {
    if (!detail || !deleting) return
    setBusy(true); setError('')
    try {
      if (deleting.kind === 'series') { await adminApi.deleteTitle(detail.slug); setDeleting(null); await loadList(); return }
      if (deleting.kind === 'season') await adminApi.deleteSeason(detail.slug, deleting.seasonNumber!)
      else await adminApi.deleteEpisode(detail.slug, deleting.seasonNumber!, deleting.episodeSlug!)
      setDeleting(null); await loadDetail()
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Không thể xóa nội dung.') }
    finally { setBusy(false) }
  }
  async function openPreview(episode: ApiEpisode) {
    try {
      const result = await adminApi.sources(episode.slug)
      setPreview({ name: episode.name, url: result.data.find((source) => source.isActive && source.playbackUrl)?.playbackUrl ?? null })
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Không thể tải nguồn phát.') }
  }

  return <>
    <PageHeader eyebrow="CẤU TRÚC NỘI DUNG" title="Phim bộ & phần" description="Phim bộ có thể có nhiều phần hoặc phát hành trực tiếp theo danh sách tập." action={<Link href="/admin/series/new" className="flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-orange-200"><Plus size={17} /> Tạo phim bộ</Link>} />
    {error && <p role="alert" className="mb-5 rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}
    <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
      <section className="rounded-2xl border border-slate-200 bg-white p-4"><div className="relative mb-4"><Search className="absolute left-3 top-3 text-slate-400" size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm phim bộ..." className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-orange-400" /></div><div className="flex flex-col gap-2">{filtered.map((item) => <button key={item.id} onClick={() => { setSelectedSlug(item.slug); setDetail(null) }} className={`rounded-xl p-3 text-left transition ${item.slug === selectedSlug ? 'bg-slate-950 text-white' : 'hover:bg-slate-50'}`}><div className="flex items-center gap-3"><span className={`grid size-11 place-items-center rounded-xl ${item.slug === selectedSlug ? 'bg-orange-500' : 'bg-orange-50 text-orange-500'}`}><Film size={18} /></span><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold">{item.name}</p><p className={`mt-1 text-xs ${item.slug === selectedSlug ? 'text-slate-400' : 'text-slate-500'}`}>{item.releaseYear ?? 'Chưa có năm'} · {item.status === 'published' ? 'Đang chiếu' : 'Bản nháp'}</p></div><ChevronDown size={16} className="-rotate-90 opacity-40" /></div></button>)}</div></section>
      {selected && detail ? <section className="min-w-0"><div className="rounded-2xl bg-slate-950 p-6 text-white"><div className="flex flex-col justify-between gap-5 sm:flex-row"><div><div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-orange-400"><Clapperboard size={15} /> Thông tin phim bộ</div><h2 className="text-3xl font-bold">{detail.name}</h2><p className="mt-2 text-sm text-slate-400">{detail.releaseYear ?? '—'} · {detail.genres.map((genre) => genre.name).join(', ') || 'Chưa chọn thể loại'} · IMDb {detail.editorialRating ?? '—'}</p></div><div className="flex gap-2"><Link href={`/admin/series/${detail.slug}`} className="rounded-xl border border-white/15 p-3 text-slate-300 hover:bg-white/10" aria-label="Xem chi tiết phim"><Eye size={17} /></Link><Link href={`/admin/series/${detail.slug}/edit`} className="rounded-xl border border-white/15 p-3 text-slate-300 hover:bg-white/10" aria-label="Sửa phim"><Edit3 size={17} /></Link><button onClick={() => setDeleting({ kind: 'series', label: detail.name })} className="rounded-xl border border-white/15 p-3 text-slate-300 hover:bg-red-500/20 hover:text-red-300" aria-label="Xóa phim"><Trash2 size={17} /></button></div></div><p className="mt-5 max-w-3xl text-sm leading-6 text-slate-400">{detail.synopsis || 'Chưa có mô tả cho phim bộ này.'}</p><div className="mt-5 flex flex-wrap gap-2 text-xs text-slate-300"><span className="rounded-full bg-white/10 px-3 py-1.5">Diễn viên: {detail.credits.filter((credit) => credit.role === 'actor').map((credit) => credit.name).join(', ') || 'Chưa cập nhật'}</span><span className="rounded-full bg-white/10 px-3 py-1.5">{detail.seasons.length} phần</span><span className="rounded-full bg-white/10 px-3 py-1.5">{totalEpisodes} tập</span></div></div>
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5"><div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center"><div><h3 className="font-bold">Cấu trúc phát hành</h3><p className="mt-1 text-sm text-slate-500">Quản lý phần và tập trong cùng một màn hình.</p></div><button onClick={() => { setSeasonName(`Phần ${Math.max(0, ...detail.seasons.map((season) => season.seasonNumber)) + 1}`); setSeasonEditor('new') }} className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-bold hover:border-orange-300 hover:text-orange-600"><Plus size={16} /> Thêm phần</button></div>
        <div className="mt-5 flex flex-col gap-3">{detail.seasons.map((season) => <div key={season.id} className={`rounded-xl border p-4 ${selectedSeason === season.seasonNumber ? 'border-orange-200 bg-orange-50/40' : 'border-slate-100'}`}><div className="flex flex-wrap items-center gap-3"><button onClick={() => setSelectedSeason(season.seasonNumber)} className="flex min-w-0 flex-1 items-center gap-3 text-left"><span className="grid size-9 place-items-center rounded-lg bg-violet-100 text-xs font-bold text-violet-600">P{season.seasonNumber}</span><span><span className="block text-sm font-bold">{season.name}</span><span className="mt-1 block text-xs text-slate-500">{season.episodes.length} tập</span></span></button><button onClick={() => { setSeasonName(season.name); setSeasonEditor(season.seasonNumber) }} className="rounded-lg p-2 text-slate-400 hover:bg-white hover:text-slate-900" aria-label={`Sửa ${season.name}`}><Edit3 size={15} /></button><button onClick={() => setDeleting({ kind: 'season', label: season.name, seasonNumber: season.seasonNumber })} className="rounded-lg p-2 text-slate-400 hover:bg-white hover:text-red-500" aria-label={`Xóa ${season.name}`}><Trash2 size={15} /></button></div>
        {activeSeason?.id === season.id && <div className="mt-4 border-t border-slate-200/70 pt-4"><div className="mb-3 flex items-center justify-between"><p className="text-xs font-bold uppercase tracking-wider text-slate-400">Danh sách tập</p><Link href={`/admin/series/${detail.slug}/episodes/new?part=${season.seasonNumber}`} className="flex items-center gap-1.5 rounded-lg bg-slate-950 px-3 py-2 text-xs font-bold text-white"><Plus size={14} /> Thêm tập</Link></div>{!season.episodes.length ? <p className="rounded-lg bg-white p-4 text-center text-sm text-slate-500">Chưa có tập phim. Hãy thêm tập đầu tiên.</p> : <div className="flex flex-col gap-2">{season.episodes.map((episode: ApiEpisode) => <div key={episode.id} className="flex items-center gap-3 rounded-lg bg-white p-3"><span className="grid size-8 place-items-center rounded-md bg-slate-100 text-xs font-bold text-slate-500">{String(episode.episodeNumber).padStart(2, '0')}</span><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{episode.name}</p><p className="mt-0.5 text-xs text-slate-500">{episode.durationSeconds == null ? 'Chưa có thời lượng' : `${Math.round(episode.durationSeconds / 60)} phút`} · {episode.status === 'published' ? 'Đang chiếu' : 'Bản nháp'}</p></div><Link href={`/admin/series/${detail.slug}/episodes/${episode.slug}/edit?part=${season.seasonNumber}`} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-900" aria-label={`Sửa tập ${episode.episodeNumber}`}><Edit3 size={15} /></Link><button onClick={() => setDeleting({ kind: 'episode', label: `Tập ${episode.episodeNumber}`, seasonNumber: season.seasonNumber, episodeSlug: episode.slug })} className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-500" aria-label={`Xóa tập ${episode.episodeNumber}`}><Trash2 size={15} /></button><button onClick={() => void openPreview(episode)} className="rounded-lg bg-orange-50 p-2 text-orange-500 hover:bg-orange-100" aria-label={`Xem tập ${episode.episodeNumber}`}><Play size={14} fill="currentColor" /></button></div>)}</div>}</div>}</div>)}</div></div></section> : <div className="rounded-2xl border border-dashed border-slate-200 p-12 text-center text-slate-500">{selected ? 'Đang tải chi tiết...' : 'Không tìm thấy phim bộ phù hợp.'}</div>}
    </div>
    <Modal open={Boolean(preview)} onClose={() => setPreview(null)} title={preview?.name ?? 'Xem tập phim'} description="Bản xem trước của nguồn phát đang hoạt động."><div className="aspect-video overflow-hidden rounded-xl bg-slate-950">{preview?.url ? <video key={preview.url} src={preview.url} controls autoPlay className="size-full" /> : <div className="grid size-full place-items-center p-5 text-center text-sm text-slate-300">Tập này chưa có nguồn phát trực tiếp.</div>}</div></Modal>
    <AdminActionDialog open={seasonEditor !== null} onClose={() => setSeasonEditor(null)} title={seasonEditor === 'new' ? 'Thêm phần phim' : 'Chỉnh sửa phần phim'}>
      <form onSubmit={(event) => void saveSeason(event)}><label className="block text-sm font-semibold">Tên phần<input required value={seasonName} onChange={(event) => setSeasonName(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-3 text-sm font-normal outline-none focus:border-orange-400" placeholder="Ví dụ: Phần 3" /></label><div className="mt-auto flex justify-end gap-3 pt-6"><button type="button" onClick={() => setSeasonEditor(null)} className="rounded-xl px-4 py-3 text-sm font-semibold text-slate-500">Hủy</button><button disabled={busy} className="flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold text-white"><Check size={16} /> Lưu thay đổi</button></div></form>
    </AdminActionDialog>
    <AdminActionDialog open={Boolean(deleting)} onClose={() => setDeleting(null)} title={`Xóa ${deleting?.label ?? 'nội dung'}?`} danger>
      <p className="text-sm leading-6 text-slate-500">Bạn sắp xóa <strong className="text-slate-900">{deleting?.label}</strong>. Dữ liệu liên quan có thể không khôi phục được.</p><div className="mt-6 flex justify-end gap-3"><button type="button" onClick={() => setDeleting(null)} className="rounded-xl px-4 py-3 text-sm font-semibold text-slate-500">Hủy</button><button type="button" disabled={busy} onClick={() => void remove()} className="rounded-xl bg-red-500 px-5 py-3 text-sm font-bold text-white">Xác nhận xóa</button></div>
    </AdminActionDialog>
  </>
}


