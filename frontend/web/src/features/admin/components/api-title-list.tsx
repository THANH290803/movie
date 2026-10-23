'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { Edit3, Eye, Plus, Search, Trash2 } from 'lucide-react'
import { PageHeader } from '@/components/common/page-header'
import { AdminStatusBadge } from '@/components/common/admin-status-badge'
import { AdminTablePagination } from '@/components/common/admin-table-pagination'
import { AdminActionDialog } from '@/components/common/admin-action-dialog'
import { adminApi } from '@/lib/api/admin'
import type { ApiTitle, ApiTitleDetail } from '@/lib/api/types'

const statusLabel: Record<string, string> = { draft: 'Bản nháp', scheduled: 'Lên lịch', published: 'Đang chiếu', archived: 'Lưu trữ' }

export function ApiTitleList({ kind }: { kind: 'movie' | 'series' }) {
  const [rows, setRows] = useState<ApiTitle[]>([])
  const [details, setDetails] = useState<Record<string, ApiTitleDetail>>({})
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [query, setQuery] = useState('')
  const [deleting, setDeleting] = useState<ApiTitle | null>(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const base = kind === 'movie' ? '/admin/movies' : '/admin/series'

  const load = useCallback(async () => {
    try {
      const result = await adminApi.titles(kind, page, pageSize, query)
      setRows(result.data)
      setTotal(result.pagination.total)
      setError('')
      const resolved = await Promise.all(result.data.map(async (row) => {
        try { return [row.slug, (await adminApi.title(row.slug)).title] as const }
        catch { return null }
      }))
      setDetails(Object.fromEntries(resolved.filter((item): item is readonly [string, ApiTitleDetail] => item !== null)))
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Không thể tải danh sách phim.') }
  }, [kind, page, pageSize, query])
  useEffect(() => { queueMicrotask(() => { void load() }) }, [load])

  async function remove() {
    if (!deleting) return
    setBusy(true)
    try { await adminApi.deleteTitle(deleting.slug); setDeleting(null); if (rows.length === 1 && page > 1) setPage(page - 1); else await load() }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'Không thể lưu trữ phim.') }
    finally { setBusy(false) }
  }

  return <>
    <PageHeader eyebrow="KHO NỘI DUNG" title="Kho phim" description="Phim dài là nội dung chỉ có một tập duy nhất, có thể xem chi tiết và quản lý nguồn phát trong admin." action={<Link href={`${base}/new`} className="flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-orange-200"><Plus size={17} /> Thêm phim dài</Link>} />
    {error && <p role="alert" className="mb-5 rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}
    <div className="admin-table-card">
      <div className="admin-table-toolbar"><div className="relative"><Search className="absolute left-3 top-3 text-slate-400" size={16} /><input value={query} onChange={(event) => { setQuery(event.target.value); setPage(1) }} placeholder="Tìm tên phim..." className="rounded-xl border border-slate-200 py-2.5 pl-9 pr-4 text-sm outline-none focus:border-orange-400" /></div><p className="text-sm text-slate-500">{total} phim dài</p></div>
      <div className="admin-table-scroll"><table className="admin-data-table"><caption className="sr-only">Danh sách phim dài</caption><thead className="border-b border-slate-100 text-xs uppercase tracking-wider text-slate-400"><tr>{['Tên phim', 'Loại', 'Năm', 'Thể loại', 'Trạng thái', 'Thao tác'].map((heading) => <th scope="col" className="px-3 py-4" key={heading}>{heading}</th>)}</tr></thead><tbody>{rows.map((movie) => <tr className="border-b border-slate-50" key={movie.id}>
        <td className="px-3 py-4 font-semibold">{movie.name}</td>
        <td className="px-3"><span className="rounded-full bg-orange-50 px-2.5 py-1 text-xs font-semibold text-orange-600">Phim dài · 01 tập</span></td>
        <td className="px-3 text-slate-500">{movie.releaseYear ?? '—'}</td>
        <td className="px-3 text-slate-500">{details[movie.slug]?.genres.map((genre) => genre.name).join(', ') || 'Chưa chọn thể loại'}</td>
        <td className="px-3"><AdminStatusBadge tone={movie.status === 'published' ? 'success' : 'neutral'}>{statusLabel[movie.status ?? 'draft']}</AdminStatusBadge></td>
        <td className="px-3"><div className="flex items-center gap-1"><Link href={`${base}/${movie.slug}`} className="inline-flex size-10 items-center justify-center rounded-lg text-slate-400 hover:bg-orange-50 hover:text-orange-600" aria-label={`Xem chi tiết ${movie.name}`} title="Xem chi tiết"><Eye size={17} /></Link><Link href={`${base}/${movie.slug}/edit`} className="inline-flex size-10 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-900" aria-label={`Sửa ${movie.name}`} title="Sửa phim"><Edit3 size={17} /></Link><button type="button" onClick={() => setDeleting(movie)} className="inline-flex size-10 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500" aria-label={`Xóa ${movie.name}`} title="Xóa phim"><Trash2 size={17} /></button></div></td>
      </tr>)}</tbody></table></div>
      {!rows.length && <p className="admin-table-empty">Không tìm thấy phim dài phù hợp.</p>}
      <AdminTablePagination totalItems={total} page={page} pageSize={pageSize} onPageChange={setPage} onPageSizeChange={(size) => { setPageSize(size); setPage(1) }} />
    </div>
    <AdminActionDialog open={Boolean(deleting)} onClose={() => setDeleting(null)} title="Xác nhận xóa phim?" danger>
      <p className="text-sm leading-6 text-slate-500">Bạn sắp lưu trữ <strong className="text-slate-900">{deleting?.name}</strong>. Phim sẽ ẩn khỏi trang người xem.</p>
      <div className="mt-6 flex justify-end gap-3"><button type="button" onClick={() => setDeleting(null)} className="rounded-xl px-4 py-3 text-sm font-semibold text-slate-500">Hủy</button><button type="button" disabled={busy} onClick={() => void remove()} className="rounded-xl bg-red-500 px-5 py-3 text-sm font-bold text-white">Xóa phim</button></div>
    </AdminActionDialog>
  </>
}

