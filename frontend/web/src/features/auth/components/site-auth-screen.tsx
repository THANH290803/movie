'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { routes } from '@/config/routes'
import { signIn, signUp } from '@/lib/api/client'

export function SiteAuthScreen({ mode, next = routes.site.home }: { mode: 'login' | 'register'; next?: string }) {
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')
  const destination = next.startsWith('/') && !next.startsWith('//') ? next : routes.site.home

  return <section className="mx-auto max-w-md py-12 text-white">
    <p className="cine-kicker orange">TÀI KHOẢN CINEFLOW</p>
    <h1 className="mt-4 text-3xl font-bold">{mode === 'login' ? 'Đăng nhập' : 'Tạo tài khoản'}</h1>
    <p className="mt-2 text-sm text-slate-400">{mode === 'login' ? 'Đăng nhập để lưu những phim bạn muốn xem sau.' : 'Đăng ký để tạo danh sách phim của riêng bạn.'}</p>
    <form className="mt-8 space-y-5 rounded-2xl border border-white/10 bg-white/5 p-6" onSubmit={async (event) => {
      event.preventDefault()
      setPending(true)
      setError('')
      try {
        if (mode === 'login') await signIn(email, password, true)
        else await signUp(fullName, email, password)
        router.replace(destination)
        router.refresh()
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : 'Không thể xác thực tài khoản.')
      } finally { setPending(false) }
    }}>
      {mode === 'register' && <label className="block text-sm">Họ và tên<input required minLength={2} maxLength={100} autoComplete="name" className="mt-2 block w-full rounded-lg border border-white/15 bg-slate-900 p-3 text-white outline-none focus:border-orange-400" value={fullName} onChange={(event) => setFullName(event.target.value)} /></label>}
      <label className="block text-sm">Email<input required type="email" autoComplete="email" className="mt-2 block w-full rounded-lg border border-white/15 bg-slate-900 p-3 text-white outline-none focus:border-orange-400" value={email} onChange={(event) => setEmail(event.target.value)} /></label>
      <label className="block text-sm">Mật khẩu<input required type="password" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} className="mt-2 block w-full rounded-lg border border-white/15 bg-slate-900 p-3 text-white outline-none focus:border-orange-400" value={password} onChange={(event) => setPassword(event.target.value)} /></label>
      {mode === 'register' && <p className="text-xs text-slate-400">Ít nhất 8 ký tự, gồm chữ thường, chữ hoa, số và ký tự đặc biệt.</p>}
      {error && <p role="alert" className="rounded-lg bg-red-500/15 p-3 text-sm text-red-300">{error}</p>}
      <button type="submit" disabled={pending} className="w-full rounded-lg bg-orange-500 px-4 py-3 font-bold text-white disabled:opacity-60">{pending ? 'Đang xử lý...' : mode === 'login' ? 'Đăng nhập' : 'Đăng ký'}</button>
    </form>
    <p className="mt-5 text-sm text-slate-400">{mode === 'login' ? 'Chưa có tài khoản?' : 'Đã có tài khoản?'} <Link className="font-semibold text-orange-400" href={`${mode === 'login' ? routes.site.register : routes.site.login}?next=${encodeURIComponent(destination)}`}>{mode === 'login' ? 'Đăng ký' : 'Đăng nhập'}</Link></p>
  </section>
}
