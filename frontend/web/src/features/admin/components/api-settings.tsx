'use client'

import { useEffect, useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { PageHeader } from '@/components/common/page-header'
import { api, clearSession } from '@/lib/api/client'
import type { ApiUser } from '@/lib/api/types'

const field = 'mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-normal text-slate-950 outline-none transition focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-100'

export function ApiSettings() {
  const router = useRouter()
  const [user, setUser] = useState<ApiUser | null>(null)
  const [fullName, setFullName] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => { api<{ user: ApiUser }>('/auth/me').then(({ user: account }) => { setUser(account); setFullName(account.fullName) }).catch((cause) => setError(cause instanceof Error ? cause.message : 'Không thể tải tài khoản.')) }, [])

  async function updateProfile(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError(''); setMessage('')
    try {
      const result = await api<{ user: ApiUser }>('/auth/me', { method: 'PATCH', body: JSON.stringify({ fullName }) })
      setUser(result.user); setMessage('Đã cập nhật hồ sơ. Tải lại trang để cập nhật tên trên thanh điều hướng.')
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Không thể cập nhật hồ sơ.') }
    finally { setBusy(false) }
  }

  async function changePassword(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError(''); setMessage('')
    try {
      await api<void>('/auth/change-password', { method: 'POST', body: JSON.stringify({ currentPassword, newPassword }) })
      clearSession(); router.replace('/admin/login')
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Không thể đổi mật khẩu.') }
    finally { setBusy(false) }
  }

  return <>
    <PageHeader eyebrow="HỆ THỐNG" title="Cài đặt" description="Quản lý hồ sơ và bảo mật tài khoản quản trị Cineflow." />
    <div className="max-w-6xl space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        {[
          ['Hồ sơ quản trị', 'Tên, email và tài khoản'],
          ['Bảo mật', 'Mật khẩu và phiên đăng nhập'],
          ['Quyền truy cập', 'Vai trò trong hệ thống'],
        ].map(([title, description], index) => <div key={title} className={`rounded-2xl border p-5 ${index === 0 ? 'border-orange-200 bg-orange-50/70' : 'border-slate-200 bg-white'}`}><div className={`mb-4 flex size-10 items-center justify-center rounded-xl text-sm font-bold ${index === 0 ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-600'}`}>0{index + 1}</div><h2 className="font-bold text-slate-950">{title}</h2><p className="mt-1 text-sm text-slate-500">{description}</p></div>)}
      </div>
      {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      {message && <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</p>}
      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <form onSubmit={(event) => void updateProfile(event)} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-6"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-orange-500">Thông tin chung</p><h2 className="mt-2 text-xl font-bold text-slate-950">Hồ sơ quản trị</h2><p className="mt-1 text-sm text-slate-500">Thông tin hiển thị trên trang quản trị.</p></div><span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">{user ? 'Đang hoạt động' : 'Đang tải'}</span></div>
          <div className="mt-7 grid gap-5 sm:grid-cols-2"><label className="text-sm font-semibold text-slate-700">Họ và tên<input required minLength={2} value={fullName} onChange={(event) => setFullName(event.target.value)} className={field} /></label><label className="text-sm font-semibold text-slate-700">Email quản trị<input readOnly value={user?.email ?? ''} className={field} /></label><label className="text-sm font-semibold text-slate-700 sm:col-span-2">Quyền truy cập<input readOnly value={user?.role === 'admin' ? 'Quản trị viên' : user?.role === 'editor' ? 'Biên tập viên' : 'Người xem'} className={field} /></label></div>
          <div className="mt-7 flex items-center justify-between gap-4 border-t border-slate-100 pt-6"><p className="text-xs text-slate-400">Hồ sơ được đồng bộ với tài khoản.</p><button disabled={!user || busy} className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-orange-500 disabled:opacity-50">Lưu thay đổi</button></div>
        </form>
        <form onSubmit={(event) => void changePassword(event)} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"><div className="border-b border-slate-100 pb-6"><p className="text-xs font-bold uppercase tracking-[0.18em] text-orange-500">Bảo mật</p><h2 className="mt-2 text-xl font-bold text-slate-950">Đổi mật khẩu</h2><p className="mt-1 text-sm text-slate-500">Sau khi đổi mật khẩu, bạn cần đăng nhập lại.</p></div><div className="mt-7 space-y-5"><label className="block text-sm font-semibold text-slate-700">Mật khẩu hiện tại<input required type="password" autoComplete="current-password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} className={field} /></label><label className="block text-sm font-semibold text-slate-700">Mật khẩu mới<input required type="password" autoComplete="new-password" minLength={8} value={newPassword} onChange={(event) => setNewPassword(event.target.value)} className={field} /></label><p className="text-xs leading-5 text-slate-500">Ít nhất 8 ký tự, gồm chữ thường, chữ hoa, số và ký tự đặc biệt.</p></div><div className="mt-7 flex justify-end border-t border-slate-100 pt-6"><button disabled={busy} className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-orange-500 disabled:opacity-50">Đổi mật khẩu</button></div></form>
      </div>
    </div>
  </>
}
