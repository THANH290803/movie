'use client'

import { useEffect, useState, type FormEvent } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, FileVideo, Save, Upload } from 'lucide-react'
import { PageHeader } from '@/components/common/page-header'
import { adminApi } from '@/lib/api/admin'
import type { ApiSource, ApiSubtitle, ApiTitleDetail } from '@/lib/api/types'

const field = 'mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm font-normal outline-none focus:border-orange-400'

export function ApiEpisodeForm({ titleSlug, episodeSlug, seasonNumber }: { titleSlug: string; episodeSlug?: string; seasonNumber?: number }) {
  const router = useRouter()
  const [title, setTitle] = useState<ApiTitleDetail | null>(null)
  const [selectedSeason, setSelectedSeason] = useState(seasonNumber ?? 1)
  const [number, setNumber] = useState('')
  const [name, setName] = useState('')
  const [synopsis, setSynopsis] = useState('')
  const [minutes, setMinutes] = useState('')
  const [sources, setSources] = useState<ApiSource[]>([])
  const [subtitles, setSubtitles] = useState<ApiSubtitle[]>([])
  const [url, setUrl] = useState('')
  const [format, setFormat] = useState<'mp4' | 'webm' | 'hls' | 'dash'>('mp4')
  const [subtitleUrl, setSubtitleUrl] = useState('')
  const [subtitleLanguage, setSubtitleLanguage] = useState('vi')
  const [subtitleLabel, setSubtitleLabel] = useState('Tiếng Việt')
  const [status, setStatus] = useState('draft')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const base = `/admin/series/${titleSlug}`

  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        const result = await adminApi.title(titleSlug)
        if (!mounted) return
        setTitle(result.title)
        const season = result.title.seasons.find((part) => part.episodes.some((episode) => episode.slug === episodeSlug))
        if (episodeSlug && !season) throw new Error('Không tìm thấy tập phim.')
        if (season) {
          const episode = season.episodes.find((item) => item.slug === episodeSlug)!
          setSelectedSeason(season.seasonNumber)
          setNumber(String(episode.episodeNumber))
          setName(episode.name)
          setSynopsis(episode.synopsis ?? '')
          setMinutes(episode.durationSeconds == null ? '' : String(Math.round(episode.durationSeconds / 60)))
          setStatus(episode.status ?? 'draft')
          const [sourceResult, subtitleResult] = await Promise.all([adminApi.sources(episode.slug), adminApi.subtitles(episode.slug)])
          if (mounted) { setSources(sourceResult.data); setSubtitles(subtitleResult.data) }
        } else if (result.title.seasons.length) setSelectedSeason(seasonNumber ?? result.title.seasons[0].seasonNumber)
      } catch (cause) { if (mounted) setError(cause instanceof Error ? cause.message : 'Không thể tải tập phim.') }
    }
    void load()
    return () => { mounted = false }
  }, [titleSlug, episodeSlug, seasonNumber])

  async function execute(action: () => Promise<unknown>) {
    setBusy(true); setError('')
    try {
      await action()
      if (episodeSlug) {
        const [sourceResult, subtitleResult] = await Promise.all([adminApi.sources(episodeSlug), adminApi.subtitles(episodeSlug)])
        setSources(sourceResult.data); setSubtitles(subtitleResult.data)
      }
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Thao tác thất bại.') }
    finally { setBusy(false) }
  }

  function save(event: FormEvent) {
    event.preventDefault()
    void execute(async () => {
      const body = { name: name.trim(), synopsis: synopsis.trim() || null, durationSeconds: minutes ? Number(minutes) * 60 : null }
      if (episodeSlug) await adminApi.updateEpisode(titleSlug, selectedSeason, episodeSlug, body)
      else await adminApi.createEpisode(titleSlug, selectedSeason, { ...body, episodeNumber: Number(number), status: 'draft' })
      router.push(base); router.refresh()
    })
  }

  return <>
    <PageHeader eyebrow="PHIM BỘ / TẬP PHIM" title={episodeSlug ? 'Chỉnh sửa tập phim' : 'Thêm tập phim'} description="Mỗi tập có thông tin riêng, nguồn phát và phụ đề." action={<Link href={base} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold"><ArrowLeft size={16} /> Quay lại phim bộ</Link>} />
    {error && <p role="alert" className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
      <main className="flex min-w-0 flex-col gap-6">
        <form onSubmit={save} className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-orange-50 text-orange-500"><FileVideo size={19} /></span><div><h2 className="font-bold">Thông tin tập</h2><p className="mt-1 text-sm text-slate-500">Tên tập, số thứ tự và nội dung hiển thị.</p></div></div>
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <label className="text-sm font-semibold sm:col-span-2">Tên tập *<input required value={name} onChange={(event) => setName(event.target.value)} placeholder="Ví dụ: Ngày mới" className={field} /></label>
            <label className="text-sm font-semibold">Phần<select disabled={Boolean(episodeSlug)} value={selectedSeason} onChange={(event) => setSelectedSeason(Number(event.target.value))} className={field}>{title?.seasons.map((season) => <option key={season.id} value={season.seasonNumber}>{season.name}</option>)}</select></label>
            <label className="text-sm font-semibold">Số tập<input required disabled={Boolean(episodeSlug)} type="number" min="1" value={number} onChange={(event) => setNumber(event.target.value)} className={field} /></label>
            <label className="text-sm font-semibold">Thời lượng (phút)<input type="number" min="0" value={minutes} onChange={(event) => setMinutes(event.target.value)} className={field} /></label>
            <label className="text-sm font-semibold">Trạng thái<input readOnly value={status === 'published' ? 'Đang chiếu' : 'Bản nháp'} className={`${field} bg-slate-50`} /></label>
            <label className="text-sm font-semibold sm:col-span-2">Mô tả tập<textarea rows={4} value={synopsis} onChange={(event) => setSynopsis(event.target.value)} placeholder="Tóm tắt nội dung tập phim..." className={field} /></label>
          </div>
          <div className="mt-6 flex justify-end gap-3"><Link href={base} className="rounded-xl px-5 py-3 text-sm font-bold text-slate-500">Hủy</Link><button disabled={busy || !title} className="flex items-center gap-2 rounded-xl bg-orange-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-orange-200 disabled:opacity-50"><Save size={16} /> Lưu tập phim</button></div>
        </form>

        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="font-bold">Tài nguyên tập phim</h2><p className="mt-1 text-sm text-slate-500">Nguồn phát từ URL CDN và phụ đề WebVTT.</p>
          {!episodeSlug ? <p className="mt-5 rounded-xl bg-slate-50 p-4 text-sm text-slate-500">Lưu tập phim trước, sau đó thêm video và phụ đề.</p> : <div className="mt-5 grid gap-5 lg:grid-cols-2">
            <div className="min-w-0 rounded-xl border-2 border-dashed border-slate-200 p-5"><Upload size={20} className="text-orange-400" /><h3 className="mt-3 text-sm font-bold">Video tập phim</h3><p className="mt-1 text-xs text-slate-500">MP4, WebM, HLS hoặc DASH</p>{sources.map((source) => <div key={source.id} className="mt-3 flex items-start justify-between gap-2 rounded-lg bg-slate-50 p-2 text-xs"><span className="min-w-0 break-all">{source.playbackUrl ?? `Media #${source.mediaAssetId}`}</span><button type="button" className="text-red-600" onClick={() => { if (window.confirm('Xóa nguồn phát?')) void execute(() => adminApi.deleteSource(episodeSlug, source.id)) }}>Xóa</button></div>)}<form onSubmit={(event) => { event.preventDefault(); void execute(async () => { await adminApi.createSource(episodeSlug, { sourceKind: 'external', playbackUrl: url, format, priority: 1, isActive: true }); setUrl('') }) }} className="mt-4 space-y-2"><input required type="url" value={url} onChange={(event) => setUrl(event.target.value)} placeholder="https://.../video.mp4" className={field} /><div className="flex gap-2"><select value={format} onChange={(event) => setFormat(event.target.value as typeof format)} className="rounded-xl border border-slate-200 px-3 py-2 text-sm"><option value="mp4">MP4</option><option value="webm">WebM</option><option value="hls">HLS</option><option value="dash">DASH</option></select><button disabled={busy} className="rounded-xl bg-orange-500 px-4 py-2 text-sm font-bold text-white">Thêm nguồn</button></div></form></div>
            <div className="min-w-0 rounded-xl border-2 border-dashed border-slate-200 p-5"><Upload size={20} className="text-orange-400" /><h3 className="mt-3 text-sm font-bold">Phụ đề VTT</h3><p className="mt-1 text-xs text-slate-500">Đường dẫn tệp WebVTT (.vtt)</p>{subtitles.map((subtitle) => <div key={subtitle.id} className="mt-3 flex justify-between gap-2 rounded-lg bg-slate-50 p-2 text-xs"><span>{subtitle.label} ({subtitle.languageCode})</span><button type="button" className="text-red-600" onClick={() => { if (window.confirm('Xóa phụ đề?')) void execute(() => adminApi.deleteSubtitle(episodeSlug, subtitle.id)) }}>Xóa</button></div>)}<form onSubmit={(event) => { event.preventDefault(); void execute(async () => { await adminApi.createSubtitle(episodeSlug, { languageCode: subtitleLanguage, label: subtitleLabel, subtitleUrl, format: 'vtt', isDefault: subtitles.length === 0 }); setSubtitleUrl('') }) }} className="mt-4 space-y-2"><input required type="url" value={subtitleUrl} onChange={(event) => setSubtitleUrl(event.target.value)} placeholder="https://.../subtitle.vtt" className={field} /><div className="flex gap-2"><input required aria-label="Mã ngôn ngữ" value={subtitleLanguage} onChange={(event) => setSubtitleLanguage(event.target.value)} className="w-16 rounded-xl border border-slate-200 px-2 py-2 text-sm" /><input required aria-label="Tên phụ đề" value={subtitleLabel} onChange={(event) => setSubtitleLabel(event.target.value)} className="min-w-0 flex-1 rounded-xl border border-slate-200 px-2 py-2 text-sm" /><button disabled={busy} className="rounded-xl bg-orange-500 px-3 py-2 text-sm font-bold text-white">Thêm</button></div></form></div>
          </div>}
        </section>
      </main>
      <aside className="h-fit rounded-2xl bg-slate-950 p-6 text-white"><p className="text-xs font-bold uppercase tracking-widest text-orange-400">Luồng nội dung</p><p className="mt-4 text-sm leading-6 text-slate-300">Phim bộ: {title?.name ?? titleSlug} · Phần {selectedSeason}{episodeSlug ? ` · Tập ${number}` : ''}</p><div className="mt-6 flex items-center gap-2 rounded-xl bg-white/10 px-4 py-3 text-sm"><Upload size={16} /> Dùng URL CDN để thêm tài nguyên</div>{episodeSlug && <div className="mt-6 space-y-2 border-t border-white/10 pt-5"><p className="text-xs font-bold uppercase tracking-wider text-slate-400">Xuất bản tập</p><button type="button" disabled={busy || status === 'published'} onClick={() => void execute(async () => { await adminApi.updateEpisode(titleSlug, selectedSeason, episodeSlug, { status: 'published' }); setStatus('published') })} className="w-full rounded-xl bg-orange-500 px-4 py-2 text-sm font-bold disabled:opacity-50">Xuất bản tập</button><button type="button" disabled={busy || status === 'draft'} onClick={() => void execute(async () => { await adminApi.updateEpisode(titleSlug, selectedSeason, episodeSlug, { status: 'draft' }); setStatus('draft') })} className="w-full rounded-xl border border-white/20 px-4 py-2 text-sm disabled:opacity-50">Đưa về bản nháp</button></div>}</aside>
    </div>
  </>
}
