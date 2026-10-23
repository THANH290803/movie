'use client'

export default function SiteError({ error, reset }: { error: Error; reset: () => void }) {
  return <div className="mx-auto max-w-3xl px-6 py-20 text-center text-white"><h1 className="text-3xl font-bold">Không thể tải nội dung</h1><p className="mt-4 text-slate-300">{error.message}</p><button onClick={reset} className="mt-6 rounded-xl bg-orange-500 px-5 py-3 font-bold text-white">Thử lại</button></div>
}
