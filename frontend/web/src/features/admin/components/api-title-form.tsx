'use client'

import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Clapperboard, FileVideo, Film, ImagePlus, Layers3, Play, Plus, Save } from 'lucide-react'
import { PageHeader } from '@/components/common/page-header'
import { adminApi } from '@/lib/api/admin'
import type { ApiGenre, ApiMediaAsset, ApiPerson, ApiTitleDetail } from '@/lib/api/types'

const input = 'mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm font-normal outline-none focus:border-orange-400'

function SectionTitle({ icon: Icon, title, description }: { icon: typeof Film; title: string; description: string }) {
  return <div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-orange-50 text-orange-500"><Icon size={19} /></span><div><h2 className="font-bold">{title}</h2><p className="mt-1 text-sm text-slate-500">{description}</p></div></div>
}

function Field({ label, children, wide = false }: { label: string; children: ReactNode; wide?: boolean }) {
  return <label className={`text-sm font-semibold ${wide ? 'sm:col-span-2' : ''}`}>{label}{children}</label>
}

export function ApiTitleForm({ kind, slug }: { kind: 'movie' | 'series'; slug?: string }) {
  const router = useRouter()
  const [persistedSlug, setPersistedSlug] = useState(slug ?? '')
  const [title, setTitle] = useState<ApiTitleDetail | null>(null)
  const [genres, setGenres] = useState<ApiGenre[]>([])
  const [people, setPeople] = useState<ApiPerson[]>([])
  const [assets, setAssets] = useState<ApiMediaAsset[]>([])
  const [name, setName] = useState('')
  const [originalName, setOriginalName] = useState('')
  const [releaseYear, setReleaseYear] = useState('')
  const [synopsis, setSynopsis] = useState('')
  const [rating, setRating] = useState('')
  const [genreIds, setGenreIds] = useState<string[]>([])
  const [directorIds, setDirectorIds] = useState<string[]>([])
  const [actorIds, setActorIds] = useState<string[]>([])
  const [posterAssetId, setPosterAssetId] = useState('')
  const [backdropAssetId, setBackdropAssetId] = useState('')
  const [durationMinutes, setDurationMinutes] = useState('')
  const [videoUrl, setVideoUrl] = useState('')
  const [subtitleUrl, setSubtitleUrl] = useState('')
  const [format, setFormat] = useState<'mp4' | 'webm' | 'hls' | 'dash'>('mp4')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const base = kind === 'movie' ? '/admin/movies' : '/admin/series'

  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        const [genreRows, peopleRows, assetRows, detail] = await Promise.all([adminApi.allGenres(), adminApi.allPeople(), adminApi.allMediaAssets(), slug ? adminApi.title(slug) : Promise.resolve(null)])
        if (!mounted) return
        setGenres(genreRows); setPeople(peopleRows); setAssets(assetRows)
        if (detail) {
          const item = detail.title
          if (item.kind !== kind) throw new Error('Sai loại phim.')
          setTitle(item); setName(item.name); setOriginalName(item.originalName ?? ''); setReleaseYear(item.releaseYear ? String(item.releaseYear) : ''); setSynopsis(item.synopsis ?? ''); setRating(item.editorialRating == null ? '' : String(item.editorialRating)); setGenreIds(item.genres.map((genre) => genre.id)); setDirectorIds(item.credits.filter((credit) => credit.role === 'director').map((credit) => credit.personId)); setActorIds(item.credits.filter((credit) => credit.role === 'actor').map((credit) => credit.personId)); setPosterAssetId(item.posterAssetId ?? ''); setBackdropAssetId(item.backdropAssetId ?? '')
          if (kind === 'movie') setDurationMinutes(item.seasons[0]?.episodes[0]?.durationSeconds == null ? '' : String(Math.round(item.seasons[0].episodes[0].durationSeconds! / 60)))
        }
      } catch (cause) { if (mounted) setError(cause instanceof Error ? cause.message : 'Không thể tải dữ liệu.') }
    }
    void load(); return () => { mounted = false }
  }, [slug, kind])

  async function save(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError('')
    const credits = [...directorIds.map((personId, creditOrder) => ({ personId, role: 'director', creditOrder })), ...actorIds.map((personId, creditOrder) => ({ personId, role: 'actor', creditOrder }))]
    const body = { name: name.trim(), originalName: originalName.trim() || null, releaseYear: releaseYear ? Number(releaseYear) : null, synopsis: synopsis.trim() || null, editorialRating: rating ? Number(rating) : null, posterAssetId: posterAssetId || null, backdropAssetId: backdropAssetId || null, genreIds, credits }
    try {
      const result = persistedSlug ? await adminApi.updateTitle(persistedSlug, body) : await adminApi.createTitle({ ...body, kind, status: 'draft' })
      setPersistedSlug(result.title.slug)
      if (kind === 'movie') {
        const episode = result.title.seasons[0]?.episodes[0]
        if (episode) {
          if (durationMinutes) await adminApi.updateEpisode(result.title.slug, 0, episode.slug, { durationSeconds: Number(durationMinutes) * 60 })
          if (videoUrl) { await adminApi.createSource(episode.slug, { sourceKind: 'external', playbackUrl: videoUrl, format, priority: 1, isActive: true }); setVideoUrl('') }
          if (subtitleUrl) { await adminApi.createSubtitle(episode.slug, { languageCode: 'vi', label: 'Tiếng Việt', subtitleUrl, format: 'vtt', isDefault: true }); setSubtitleUrl('') }
        }
      }
      router.push(`${base}/${result.title.slug}`); router.refresh()
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Không thể lưu phim.') }
    finally { setBusy(false) }
  }
  const toggle = (items: string[], set: (next: string[]) => void, id: string) => set(items.includes(id) ? items.filter((value) => value !== id) : [...items, id])
  const poster = assets.find((asset) => asset.id === posterAssetId)?.url ?? title?.posterUrl
  const groups = [{ label: 'Thể loại', rows: genres, selected: genreIds, set: setGenreIds }, { label: 'Đạo diễn', rows: people.filter((person) => person.roles.includes('director')), selected: directorIds, set: setDirectorIds }, { label: 'Diễn viên', rows: people.filter((person) => person.roles.includes('actor')), selected: actorIds, set: setActorIds }]

  return <>
    <PageHeader eyebrow={kind === 'movie' ? 'KHO PHIM / PHIM DÀI' : 'PHIM BỘ & TẬP'} title={`${slug ? 'Chỉnh sửa' : 'Thêm'} ${kind === 'movie' ? 'phim dài' : 'phim bộ'}`} description={kind === 'movie' ? 'Phim dài là nội dung có một tập duy nhất. Điền thông tin để xuất bản chuyên nghiệp.' : 'Phim bộ có thể tổ chức theo phần, mỗi phần có danh sách tập riêng.'} action={<Link href={base} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold"><ArrowLeft size={16} /> Quay lại danh sách</Link>} />
    {error && <p role="alert" className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</p>}
    <form onSubmit={(event) => void save(event)} className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
      <main className="flex min-w-0 flex-col gap-6">
        <section className="rounded-2xl border border-slate-200 bg-white p-6"><SectionTitle icon={kind === 'movie' ? Clapperboard : Film} title={kind === 'movie' ? 'Thông tin cơ bản' : 'Thông tin phim bộ'} description="Thông tin khán giả sẽ nhìn thấy trên trang phim." /><div className="mt-6 grid gap-5 sm:grid-cols-2"><Field label="Tên phim *" wide><input required maxLength={255} value={name} onChange={(event) => setName(event.target.value)} className={input} placeholder="Ví dụ: Interstellar" /></Field><Field label="Tên gốc"><input value={originalName} onChange={(event) => setOriginalName(event.target.value)} className={input} placeholder="Original title" /></Field><Field label="Năm phát hành"><input type="number" min="1888" max="65535" value={releaseYear} onChange={(event) => setReleaseYear(event.target.value)} className={input} /></Field><Field label="Điểm đánh giá"><input type="number" min="0" max="10" step="0.1" value={rating} onChange={(event) => setRating(event.target.value)} className={input} /></Field><div className="grid gap-4 sm:col-span-2 sm:grid-cols-3">{groups.map((group) => <fieldset key={group.label} className="rounded-xl border border-slate-200 p-3"><legend className="px-1 text-sm font-semibold">{group.label}</legend><div className="max-h-36 space-y-2 overflow-y-auto">{group.rows.map((row) => <label key={row.id} className="flex items-center gap-2 text-sm"><input type="checkbox" checked={group.selected.includes(row.id)} onChange={() => toggle(group.selected, group.set, row.id)} className="accent-orange-500" />{row.name}</label>)}{!group.rows.length && <p className="text-xs text-slate-400">Chưa có mục</p>}</div></fieldset>)}</div><Field label="Mô tả phim" wide><textarea value={synopsis} onChange={(event) => setSynopsis(event.target.value)} rows={4} className={input} placeholder="Tóm tắt nội dung, bối cảnh và điểm hấp dẫn của phim..." /></Field></div></section>
        {kind === 'movie' ? <section className="rounded-2xl border border-slate-200 bg-white p-6"><SectionTitle icon={FileVideo} title="Tập phim duy nhất" description="Thời lượng, nguồn phát và phụ đề của phim dài." /><div className="mt-6 grid gap-5 sm:grid-cols-2"><Field label="Thời lượng (phút)"><input type="number" min="0" value={durationMinutes} onChange={(event) => setDurationMinutes(event.target.value)} className={input} /></Field><Field label="Định dạng nguồn"><select value={format} onChange={(event) => setFormat(event.target.value as typeof format)} className={input}><option value="mp4">MP4</option><option value="webm">WebM</option><option value="hls">HLS</option><option value="dash">DASH</option></select></Field><Field label="URL phát video" wide><input type="url" value={videoUrl} onChange={(event) => setVideoUrl(event.target.value)} className={input} placeholder="https://cdn.example.com/movie.mp4" /></Field><Field label="URL phụ đề tiếng Việt (VTT)" wide><input type="url" value={subtitleUrl} onChange={(event) => setSubtitleUrl(event.target.value)} className={input} placeholder="https://cdn.example.com/movie.vtt" /></Field></div><p className="mt-4 text-xs text-slate-500">Video và ảnh cần được lưu trên CDN trước khi thêm URL hoặc chọn tài nguyên.</p></section> : <section className="rounded-2xl border border-slate-200 bg-white p-6"><SectionTitle icon={Layers3} title="Cấu trúc tập phim" description="Tạo phim trước, sau đó quản lý phần và tập trong cùng một màn hình." /><div className="mt-6 space-y-3">{(title?.seasons ?? [{ id: 'new', seasonNumber: 1, name: 'Phần 1', episodes: [] }]).map((season) => <div key={season.id} className="rounded-xl border border-slate-200 p-4"><div className="flex items-center justify-between"><strong className="text-sm">{season.name}</strong><span className="text-xs text-slate-400">{season.episodes.length} tập</span></div>{season.episodes.slice(0, 3).map((episode) => <p key={episode.id} className="mt-3 rounded-lg bg-slate-50 p-3 text-sm">{episode.episodeNumber}. {episode.name}</p>)}</div>)}</div>{slug && <Link href={`${base}/${slug}`} className="mt-5 inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold hover:text-orange-600"><Plus size={16} /> Quản lý phần và tập</Link>}</section>}
        <div className="flex justify-end gap-3"><Link href={base} className="rounded-xl px-5 py-3 text-sm font-bold text-slate-500">Hủy</Link><button type="submit" disabled={busy || Boolean(slug && !title)} className="flex items-center gap-2 rounded-xl bg-orange-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-orange-200 disabled:opacity-50"><Save size={16} /> {busy ? 'Đang lưu...' : 'Lưu phim'}</button></div>
      </main>
      <aside className="flex flex-col gap-6"><section className="rounded-2xl border border-slate-200 bg-white p-5"><h3 className="font-bold">Ảnh poster</h3><p className="mt-1 text-xs text-slate-500">JPG, PNG hoặc WebP · tỷ lệ 2:3</p><div className="relative mt-4 grid aspect-[2/3] place-items-center overflow-hidden rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 text-center">{poster ? <Image src={poster} alt="Poster phim" fill unoptimized sizes="340px" className="object-cover" /> : <span><ImagePlus className="mx-auto text-orange-400" /><strong className="mt-3 block text-sm">Chọn ảnh poster</strong><span className="mt-1 block text-xs text-slate-500">Từ kho media đã tải lên</span></span>}</div><select aria-label="Chọn poster" value={posterAssetId} onChange={(event) => setPosterAssetId(event.target.value)} className={input}><option value="">Chưa chọn poster</option>{assets.filter((asset) => asset.assetKind === 'poster').map((asset) => <option key={asset.id} value={asset.id}>{asset.storageKey}</option>)}</select><label className="mt-4 block text-xs font-semibold">Ảnh nền<select value={backdropAssetId} onChange={(event) => setBackdropAssetId(event.target.value)} className={input}><option value="">Chưa chọn ảnh nền</option>{assets.filter((asset) => asset.assetKind === 'backdrop').map((asset) => <option key={asset.id} value={asset.id}>{asset.storageKey}</option>)}</select></label></section><section className="rounded-2xl bg-slate-950 p-5 text-white"><p className="text-xs font-bold uppercase tracking-widest text-orange-400">Xem trước</p><h3 className="mt-3 text-xl font-bold">{name || 'Tên phim của bạn'}</h3><p className="mt-2 text-sm text-slate-400">{releaseYear || '—'} · {kind === 'movie' ? 'Phim dài · 01 tập' : 'Phim bộ'}</p>{slug && <Link href={`${base}/${slug}`} className="mt-5 flex w-fit items-center gap-2 rounded-xl bg-orange-500 px-4 py-3 text-sm font-bold"><Play size={15} fill="currentColor" /> Xem chi tiết trong admin</Link>}</section></aside>
    </form>
  </>
}
