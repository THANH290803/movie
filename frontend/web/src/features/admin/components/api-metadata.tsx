'use client'

import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { Clapperboard, Pencil, Plus, Search, Tag, Trash2, UserRound } from 'lucide-react'
import { PageHeader } from '@/components/common/page-header'
import { AdminStatusBadge } from '@/components/common/admin-status-badge'
import { AdminTablePagination } from '@/components/common/admin-table-pagination'
import { Modal } from '@/components/common/modal'
import { ApiMetadataEditor } from '@/features/admin/components/api-metadata-editor'
import { useAdminTablePagination } from '@/hooks/use-admin-table-pagination'
import { adminApi } from '@/lib/api/admin'
import type { ApiGenre, ApiPerson } from '@/lib/api/types'

type Kind = 'genre' | 'director' | 'actor'
type Row = ApiGenre | ApiPerson
const labels = { genre: 'Thể loại', director: 'Đạo diễn', actor: 'Diễn viên' }
const descriptions = { genre: 'Quản lý danh mục thể loại dùng chung cho phim dài và phim bộ.', director: 'Quản lý hồ sơ đạo diễn và các tác phẩm liên quan.', actor: 'Quản lý hồ sơ diễn viên và dàn diễn viên của từng phim.' }

export function ApiMetadata({ kind }: { kind: Kind }) {
  const [all, setAll] = useState<Row[]>([])
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('all')
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Row | null>(null)
  const [deleting, setDeleting] = useState<Row | null>(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [country, setCountry] = useState('')
  const [roles, setRoles] = useState<('director' | 'actor')[]>(kind === 'genre' ? [] : [kind])
  const [active, setActive] = useState(true)
  const [notice, setNotice] = useState<{ text: string; error: boolean } | null>(null)
  const [busy, setBusy] = useState(false)
  const Icon = kind === 'genre' ? Tag : kind === 'director' ? Clapperboard : UserRound

  const load = useCallback(async () => {
    try { const rows = kind === 'genre' ? await adminApi.allGenres() : (await adminApi.allPeople()).filter((person) => person.roles.includes(kind)); setAll(rows); setNotice(null) }
    catch (cause) { setNotice({ text: cause instanceof Error ? cause.message : 'Không thể tải danh mục.', error: true }) }
  }, [kind])
  useEffect(() => { queueMicrotask(() => { void load() }) }, [load])

  const filtered = all.filter((item) => `${item.name} ${'roles' in item ? item.country ?? '' : item.description ?? ''}`.toLocaleLowerCase('vi').includes(query.toLocaleLowerCase('vi')) && (status === 'all' || item.isActive === (status === 'active')))
  const { rows, page, pageSize, setPage, changePageSize, resetPage } = useAdminTablePagination(filtered)

  function edit(item?: Row) {
    setEditing(item ?? null); setName(item?.name ?? '')
    setDescription(item ? 'roles' in item ? item.biography ?? '' : item.description ?? '' : '')
    setCountry(item && 'roles' in item ? item.country ?? '' : '')
    setRoles(item && 'roles' in item ? item.roles : kind === 'genre' ? [] : [kind])
    setActive(item?.isActive ?? true); setNotice(null); setOpen(true)
  }
  async function save(event: FormEvent) {
    event.preventDefault(); setBusy(true); setNotice(null)
    try {
      if (kind === 'genre') {
        const body = { name: name.trim(), description: description.trim() || null, isActive: active }
        if (editing) await adminApi.updateGenre(editing.id, body); else await adminApi.createGenre(body)
      } else {
        const body = { name: name.trim(), country: country.trim() || null, biography: description.trim() || null, roles, isActive: active }
        if (editing) await adminApi.updatePerson(editing.id, body); else await adminApi.createPerson(body)
      }
      setOpen(false); await load(); setNotice({ text: `Đã lưu ${labels[kind].toLowerCase()}.`, error: false })
    } catch (cause) { setNotice({ text: cause instanceof Error ? cause.message : 'Không thể lưu danh mục.', error: true }) }
    finally { setBusy(false) }
  }
  async function remove() {
    if (!deleting) return
    setBusy(true); setNotice(null)
    const shared = kind !== 'genre' && 'roles' in deleting && deleting.roles.length > 1
    try {
      if (kind === 'genre') await adminApi.deleteGenre(deleting.id)
      else if (shared && 'roles' in deleting) await adminApi.updatePerson(deleting.id, { roles: deleting.roles.filter((role) => role !== kind) })
      else await adminApi.deletePerson(deleting.id)
      setDeleting(null); await load(); setNotice({ text: shared ? 'Đã gỡ vai trò khỏi hồ sơ chung.' : 'Đã xóa mục.', error: false })
    } catch (cause) { setNotice({ text: cause instanceof Error ? cause.message : 'Không thể xóa mục.', error: true }) }
    finally { setBusy(false) }
  }

  return <>
    <PageHeader eyebrow="DANH MỤC NỘI DUNG" title={labels[kind]} description={descriptions[kind]} action={<button type="button" onClick={() => edit()} className="flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-orange-200 hover:bg-orange-600"><Plus size={17} /> Thêm {labels[kind].toLowerCase()}</button>} />
    {notice && <div role={notice.error ? 'alert' : 'status'} className={`mb-6 flex items-start justify-between gap-3 rounded-xl p-4 text-sm font-medium ${notice.error ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}`}>{notice.text}<button type="button" aria-label="Đóng thông báo" onClick={() => setNotice(null)} className="shrink-0 underline">Đóng</button></div>}
    <div className="mb-6 grid gap-4 sm:grid-cols-3">{[['Tổng số', all.length, 'bg-orange-100 text-orange-600'], ['Đang sử dụng', all.filter((item) => item.isActive).length, 'bg-emerald-100 text-emerald-600'], ['Đã ẩn', all.filter((item) => !item.isActive).length, 'bg-slate-100 text-slate-500']].map(([label, count, color]) => <div key={label} className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5"><span className={`grid size-11 place-items-center rounded-xl ${color}`}><Icon size={20} /></span><div><p className="text-sm text-slate-500">{label}</p><p className="mt-1 text-2xl font-bold">{count}</p></div></div>)}</div>
    <section className="admin-table-card"><div className="admin-table-toolbar"><div className="flex flex-col gap-3 sm:flex-row"><div className="relative"><Search size={16} className="absolute left-3 top-3.5 text-slate-400" /><input type="search" aria-label={`Tìm ${labels[kind]}`} value={query} onChange={(event) => { setQuery(event.target.value); resetPage() }} placeholder={`Tìm ${labels[kind].toLowerCase()}...`} className="w-full rounded-xl border border-slate-200 py-3 pl-9 pr-4 text-sm outline-none focus:border-orange-400 sm:w-72" /></div><select aria-label="Lọc trạng thái" value={status} onChange={(event) => { setStatus(event.target.value); resetPage() }} className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-orange-400"><option value="all">Tất cả trạng thái</option><option value="active">Đang sử dụng</option><option value="hidden">Đã ẩn</option></select></div><p className="text-sm text-slate-500" aria-live="polite">{filtered.length} {labels[kind].toLowerCase()}</p></div>
      <div className="admin-table-scroll"><table className="admin-data-table"><caption className="sr-only">Danh sách {labels[kind]}</caption><thead className="border-b border-slate-100 text-xs uppercase tracking-wider text-slate-400"><tr>{['Tên', kind === 'genre' ? 'Mô tả' : 'Quốc gia / Vai trò', 'Nội dung liên quan', 'Trạng thái', 'Thao tác'].map((heading) => <th scope="col" key={heading} className="px-3 py-4">{heading}</th>)}</tr></thead><tbody>{rows.map((item) => <tr key={item.id} className="border-b border-slate-50 hover:bg-slate-50/60"><td className="px-3 py-4"><div className="flex items-center gap-3 font-semibold"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-orange-50 text-orange-600">{kind === 'genre' ? <Tag size={17} /> : item.name.split(' ').map((part) => part[0]).slice(0, 2).join('')}</span>{item.name}</div></td><td className="max-w-72 px-3 py-4 text-slate-500">{'roles' in item ? <><p>{item.country || 'Chưa cập nhật'}</p><p className="mt-1 text-xs text-orange-600">{item.roles.map((role) => labels[role]).join(' · ')}</p></> : <p className="line-clamp-2">{item.description || 'Chưa có mô tả'}</p>}</td><td className="px-3 py-4 text-slate-500">—</td><td className="px-3 py-4"><AdminStatusBadge tone={item.isActive ? 'success' : 'neutral'}>{item.isActive ? 'Đang sử dụng' : 'Đã ẩn'}</AdminStatusBadge></td><td className="px-3 py-4"><div className="flex items-center gap-1"><button type="button" aria-label={`Chỉnh sửa ${item.name}`} title="Chỉnh sửa" onClick={() => edit(item)} className="grid size-10 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-900"><Pencil size={17} /></button><button type="button" aria-label={`Xóa ${item.name}`} title="Xóa" onClick={() => { setDeleting(item); setNotice(null) }} className="grid size-10 place-items-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500"><Trash2 size={17} /></button></div></td></tr>)}</tbody></table></div>{!rows.length && <p className="admin-table-empty">Không tìm thấy {labels[kind].toLowerCase()} phù hợp.</p>}<AdminTablePagination totalItems={filtered.length} page={page} pageSize={pageSize} onPageChange={setPage} onPageSizeChange={changePageSize} />
    </section>
    {open && <ApiMetadataEditor kind={kind} editing={Boolean(editing)} name={name} setName={setName} country={country} setCountry={setCountry} roles={roles} setRoles={setRoles} active={active} setActive={setActive} description={description} setDescription={setDescription} error={notice?.error ? notice.text : null} busy={busy} onClose={() => setOpen(false)} onSave={(event) => void save(event)} />}
    <Modal open={Boolean(deleting)} onClose={() => setDeleting(null)} title={`Xóa ${labels[kind].toLowerCase()}?`} description="Nội dung đang tham chiếu mục này có thể ngăn xóa."><p className="text-sm text-slate-500">{deleting && 'roles' in deleting && deleting.roles.length > 1 ? `Chỉ gỡ vai trò ${labels[kind].toLowerCase()} khỏi hồ sơ chung “${deleting.name}”.` : `Bạn sắp xóa “${deleting?.name}”.`}</p><div className="mt-6 flex justify-end gap-3"><button type="button" onClick={() => setDeleting(null)} className="rounded-xl px-4 py-3 text-sm text-slate-500">Hủy</button><button type="button" disabled={busy} onClick={() => void remove()} className="rounded-xl bg-red-500 px-5 py-3 text-sm font-bold text-white">Xác nhận xóa</button></div></Modal>
  </>
}


