'use client'

import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { Edit3, Plus, Search, Trash2, X } from 'lucide-react'
import { PageHeader } from '@/components/common/page-header'
import { AdminStatusBadge } from '@/components/common/admin-status-badge'
import { AdminTablePagination } from '@/components/common/admin-table-pagination'
import { adminApi } from '@/lib/api/admin'
import type { ApiUser } from '@/lib/api/types'

const empty = { fullName: '', email: '', password: '', role: 'viewer' as ApiUser['role'], planCode: 'free' as ApiUser['planCode'], status: 'invited' as ApiUser['status'] }
const field = 'rounded-xl border border-slate-200 px-3 py-3 font-normal outline-none focus:border-orange-400'
const statusLabels = { invited: 'Đã mời', active: 'Hoạt động', suspended: 'Tạm khóa' }

export function ApiUsers() {
  const [rows, setRows] = useState<ApiUser[]>([])
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [total, setTotal] = useState(0)
  const [query, setQuery] = useState('')
  const [editing, setEditing] = useState<ApiUser | null>(null)
  const [open, setOpen] = useState(false)
  const [deleting, setDeleting] = useState<ApiUser | null>(null)
  const [form, setForm] = useState(empty)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    try {
      const result = await adminApi.users(page, pageSize, query)
      setRows(result.data)
      setTotal(result.pagination.total)
      setError('')
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Không thể tải tài khoản.') }
  }, [page, pageSize, query])
  useEffect(() => { queueMicrotask(() => { void load() }) }, [load])

  function openForm(user?: ApiUser) {
    setEditing(user ?? null)
    setForm(user ? { fullName: user.fullName, email: user.email, password: '', role: user.role, planCode: user.planCode, status: user.status } : empty)
    setOpen(true)
    setError('')
  }
  async function save(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError('')
    try {
      const { password, ...rest } = form
      const body = { ...rest, ...(password ? { password } : {}) }
      if (editing) await adminApi.updateUser(editing.slug, body)
      else await adminApi.createUser(body)
      setOpen(false); await load()
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Không thể lưu tài khoản.') }
    finally { setBusy(false) }
  }
  async function remove() {
    if (!deleting) return
    setBusy(true); setError('')
    try {
      await adminApi.deleteUser(deleting.slug)
      setDeleting(null)
      if (rows.length === 1 && page > 1) setPage(page - 1)
      else await load()
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Không thể xóa tài khoản.') }
    finally { setBusy(false) }
  }

  return <>
    <PageHeader eyebrow="TÀI KHOẢN" title="Người dùng" description="Quản lý tài khoản, gói dịch vụ và trạng thái hoạt động." action={<button onClick={() => openForm()} className="flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-orange-200"><Plus size={17} /> Thêm người dùng</button>} />
    {error && !open && <p role="alert" className="mb-5 rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}
    <div className="admin-table-toolbar admin-table-toolbar--external"><div className="relative w-full max-w-sm"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} /><input value={query} onChange={(event) => { setQuery(event.target.value); setPage(1) }} placeholder="Tìm theo tên hoặc email..." className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm outline-none transition focus:border-orange-400" /></div><p className="text-sm text-slate-500">{total} tài khoản</p></div>
    <div className="admin-table-card admin-table-card--continued">
      <div className="admin-table-scroll"><table className="admin-data-table"><caption className="sr-only">Danh sách người dùng</caption><thead className="border-b border-slate-100 text-xs uppercase tracking-wider text-slate-400"><tr>{['Tài khoản', 'Gói dịch vụ', 'Ngày tham gia', 'Trạng thái', 'Thao tác'].map((label) => <th scope="col" className="px-3 py-4" key={label}>{label}</th>)}</tr></thead><tbody>{rows.map((row) => <tr className="border-b border-slate-50 last:border-0" key={row.id}><td className="px-3 py-4"><p className="font-semibold">{row.fullName}</p><p className="text-xs text-slate-400">{row.email} · {row.role}</p></td><td className="px-3"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${row.planCode === 'premium' ? 'bg-violet-50 text-violet-600' : 'bg-slate-100 text-slate-600'}`}>{row.planCode === 'premium' ? 'Premium' : 'Free'}</span></td><td className="px-3 text-slate-500">{new Date(row.createdAt).toLocaleDateString('vi-VN')}</td><td className="px-3"><AdminStatusBadge tone={row.status === 'active' ? 'success' : row.status === 'suspended' ? 'danger' : 'neutral'}>{statusLabels[row.status]}</AdminStatusBadge></td><td className="px-3"><button onClick={() => openForm(row)} aria-label={`Sửa ${row.fullName}`} className="mr-2 rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-900"><Edit3 size={15} /></button><button onClick={() => setDeleting(row)} aria-label={`Xóa ${row.fullName}`} className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-500"><Trash2 size={15} /></button></td></tr>)}</tbody></table></div>
      {!rows.length && <p className="admin-table-empty">Không tìm thấy người dùng phù hợp.</p>}
      <AdminTablePagination totalItems={total} page={page} pageSize={pageSize} onPageChange={setPage} onPageSizeChange={(size) => { setPageSize(size); setPage(1) }} />
    </div>
    {open && <div className="fixed inset-0 z-50 flex overflow-y-auto bg-slate-950/40 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) setOpen(false) }}><form onSubmit={(event) => void save(event)} role="dialog" aria-modal="true" aria-labelledby="user-form-title" className="m-auto flex w-full max-w-[44rem] flex-col rounded-lg bg-white p-6 shadow-2xl"><div className="mb-6 flex items-start justify-between"><div><p className="text-xs font-bold tracking-[.18em] text-orange-500">TÀI KHOẢN</p><h2 id="user-form-title" className="mt-1 text-2xl font-bold">{editing ? 'Chỉnh sửa người dùng' : 'Thêm người dùng'}</h2></div><button type="button" onClick={() => setOpen(false)} aria-label="Đóng" className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"><X size={20} /></button></div>
      {error && <p role="alert" className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      <div className="grid gap-4"><label className="grid gap-2 text-sm font-semibold">Họ và tên<input required minLength={2} value={form.fullName} onChange={(event) => setForm({ ...form, fullName: event.target.value })} className={field} placeholder="Nguyễn Văn A" /></label><label className="grid gap-2 text-sm font-semibold">Email<input required type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} className={field} placeholder="email@example.com" /></label><label className="grid gap-2 text-sm font-semibold">Mật khẩu {editing ? '(để trống nếu không đổi)' : '(bắt buộc khi kích hoạt)'}<input type="password" minLength={8} required={!editing && form.status === 'active'} value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} className={field} autoComplete="new-password" /></label><div className="grid gap-4 sm:grid-cols-3"><label className="grid gap-2 text-sm font-semibold">Gói dịch vụ<select value={form.planCode} onChange={(event) => setForm({ ...form, planCode: event.target.value as ApiUser['planCode'] })} className={field}><option value="free">Free</option><option value="premium">Premium</option></select></label><label className="grid gap-2 text-sm font-semibold">Quyền<select value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value as ApiUser['role'] })} className={field}><option value="viewer">Viewer</option><option value="editor">Editor</option><option value="admin">Admin</option></select></label><label className="grid gap-2 text-sm font-semibold">Trạng thái<select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as ApiUser['status'] })} className={field}><option value="invited">Đã mời</option><option value="active">Hoạt động</option><option value="suspended">Tạm khóa</option></select></label></div></div><div className="mt-auto flex justify-end gap-3 pt-7"><button type="button" onClick={() => setOpen(false)} className="rounded-xl px-4 py-3 text-sm font-semibold text-slate-500 hover:bg-slate-100">Hủy</button><button type="submit" disabled={busy} className="rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold text-white hover:bg-orange-600 disabled:opacity-50">{editing ? 'Lưu thay đổi' : 'Tạo người dùng'}</button></div>
    </form></div>}
    {deleting && <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 p-4"><div role="alertdialog" aria-modal="true" aria-labelledby="delete-user-title" className="w-full max-w-md rounded-lg bg-white p-6 shadow-2xl"><h2 id="delete-user-title" className="text-xl font-bold">Xóa người dùng?</h2><p className="mt-2 text-sm leading-6 text-slate-500">Bạn chắc chắn muốn xóa <strong className="text-slate-800">{deleting.fullName}</strong>? Hành động này không thể hoàn tác.</p><div className="mt-7 flex justify-end gap-3"><button type="button" onClick={() => setDeleting(null)} className="rounded-xl px-4 py-3 text-sm font-semibold text-slate-500 hover:bg-slate-100">Hủy</button><button type="button" disabled={busy} onClick={() => void remove()} className="rounded-xl bg-red-500 px-5 py-3 text-sm font-bold text-white hover:bg-red-600 disabled:opacity-50">Xóa người dùng</button></div></div></div>}
  </>
}
