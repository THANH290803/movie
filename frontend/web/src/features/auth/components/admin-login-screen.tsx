"use client";
import { useState } from "react";
import { useRouter } from 'next/navigation';
import { routes } from '@/config/routes';
import { signIn, signOut } from '@/lib/api/client';
import {
  ArrowRight,
  Clapperboard,
  LockKeyhole,
  ShieldCheck,
  Users,
} from "lucide-react";
export default function AdminLoginScreen() {
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  return (
    <main className="grid min-h-screen bg-slate-950 lg:grid-cols-2">
      <section className="relative hidden overflow-hidden px-12 py-16 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,#f9731630,transparent_35%),radial-gradient(circle_at_80%_80%,#7c3aed30,transparent_35%)]" />
        <div className="relative">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-orange-500">
              <Clapperboard />
            </span>
            <b className="text-xl">
              cine<span className="text-orange-400">flow</span>
            </b>
          </div>
          <p className="mt-28 text-xs font-bold tracking-[.2em] text-orange-400">
            CINEMA / CONTROL ROOM
          </p>
          <h1 className="mt-5 max-w-lg text-6xl font-bold leading-[1.05]">
            Điều khiển{" "}
            <em className="font-serif font-normal text-orange-400">
              trải nghiệm
            </em>{" "}
            xem phim.
          </h1>
          <p className="mt-7 max-w-md leading-7 text-slate-400">
            Một không gian gọn gàng để quản lý mọi câu chuyện, mọi phần và từng
            tập phim.
          </p>
        </div>
        <p className="relative text-sm text-slate-400">Quản lý nội dung, tập phim và tài khoản trong một không gian.</p>
      </section>
      <section className="flex items-center justify-center bg-white px-6 py-12">
        <div className="w-full max-w-md">
          <div className="mb-12 flex items-center gap-3 lg:hidden">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-slate-950 text-orange-400">
              <Clapperboard />
            </span>
            <b className="text-xl">
              cine<span className="text-orange-500">flow</span>
            </b>
          </div>
          <div className="mb-8 grid h-12 w-12 place-items-center rounded-2xl bg-orange-100 text-orange-600">
            <ShieldCheck size={23} />
          </div>
          <p className="text-xs font-bold tracking-[.2em] text-orange-500">
            XIN CHÀO, ADMIN
          </p>
          <h2 className="mt-4 text-4xl font-bold tracking-tight text-slate-950">
            Đăng nhập vào
            <br />
            không gian quản trị
          </h2>
          <p className="mt-4 text-slate-500">
            Tiếp tục quản lý thư viện phim của bạn.
          </p>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setPending(true);
              setError('');
              try {
                const user = await signIn(email, password, remember);
                if (user.role !== 'admin' && user.role !== 'editor') {
                  await signOut();
                  throw new Error('Tài khoản này không có quyền vào trang quản trị.');
                }
                router.replace(routes.admin.dashboard);
              } catch (cause) {
                setError(cause instanceof Error ? cause.message : 'Đăng nhập thất bại.');
              } finally { setPending(false); }
            }}
            className="mt-9 space-y-5"
          >
            <label className="block text-sm font-semibold">
              Email quản trị
              <div className="mt-2 flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 focus-within:border-orange-400">
                <Users size={17} className="text-slate-400" />
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  autoComplete="username"
                  className="w-full outline-none"
                />
              </div>
            </label>
            <label className="block text-sm font-semibold">
              Mật khẩu
              <div className="mt-2 flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 focus-within:border-orange-400">
                <LockKeyhole size={17} className="text-slate-400" />
                <input
                  required
                  type={show ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="current-password"
                  className="w-full outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShow(!show)}
                  className="text-xs text-orange-600"
                >
                  {show ? "Ẩn" : "Hiện"}
                </button>
              </div>
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-500">
              <input
                type="checkbox"
                checked={remember}
                onChange={(event) => setRemember(event.target.checked)}
                className="accent-orange-500"
              />{" "}
              Ghi nhớ đăng nhập
            </label>
            {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
            <button disabled={pending} className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 py-4 font-bold text-white transition hover:bg-orange-500 disabled:opacity-60">
              {pending ? 'Đang đăng nhập...' : 'Đăng nhập'} <ArrowRight size={17} />
            </button>
          </form>
          <p className="mt-8 flex items-center gap-2 text-xs text-slate-400">
            Đăng nhập bằng tài khoản quản trị hoặc biên tập viên.
          </p>
        </div>
      </section>
    </main>
  );
}
