'use client'

import type { FormEvent } from 'react'
import { Save } from 'lucide-react'
import { Modal } from '@/components/common/modal'

type Kind = 'genre' | 'director' | 'actor'
type Role = 'director' | 'actor'

const labels = { genre: 'thể loại', director: 'đạo diễn', actor: 'diễn viên' }
const inputClass = 'w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-normal outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100'

export function ApiMetadataEditor({ kind, editing, name, setName, country, setCountry, roles, setRoles, active, setActive, description, setDescription, error, busy, onClose, onSave }: {
  kind: Kind
  editing: boolean
  name: string
  setName: (value: string) => void
  country: string
  setCountry: (value: string) => void
  roles: Role[]
  setRoles: (value: Role[]) => void
  active: boolean
  setActive: (value: boolean) => void
  description: string
  setDescription: (value: string) => void
  error: string | null
  busy: boolean
  onClose: () => void
  onSave: (event: FormEvent<HTMLFormElement>) => void
}) {
  return <Modal open wide title={`${editing ? 'Chỉnh sửa' : 'Thêm'} ${labels[kind]}`} description={kind === 'genre' ? 'Danh mục dùng chung khi tạo và chỉnh sửa phim, phim bộ.' : 'Một người có thể vừa là đạo diễn vừa là diễn viên. Hồ sơ được dùng chung giữa hai danh sách.'} onClose={onClose}>
    <form onSubmit={onSave} className="flex flex-1 flex-col">
      <div className="grid gap-4 min-[520px]:grid-cols-2">
        <label className="grid gap-2 text-sm font-semibold">{kind === 'genre' ? 'Tên thể loại' : 'Họ và tên'}<span className="sr-only">bắt buộc</span><input autoFocus required maxLength={100} value={name} onChange={(event) => setName(event.target.value)} placeholder={kind === 'genre' ? 'Ví dụ: Hành động' : kind === 'director' ? 'Ví dụ: Christopher Nolan' : 'Ví dụ: Timothée Chalamet'} className={inputClass} /></label>
        {kind !== 'genre' && <><label className="grid gap-2 text-sm font-semibold">Quốc gia<input maxLength={100} value={country} onChange={(event) => setCountry(event.target.value)} placeholder="Ví dụ: Việt Nam" className={inputClass} /></label><fieldset className="min-w-0"><legend className="mb-2 text-sm font-semibold">Vai trò</legend><div className="flex min-h-[42px] flex-wrap items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5">{(['director', 'actor'] as Role[]).map((role) => <label key={role} className="flex items-center gap-2 text-sm"><input type="checkbox" checked={roles.includes(role)} onChange={() => setRoles(roles.includes(role) ? roles.filter((item) => item !== role) : [...roles, role])} className="size-4 accent-orange-500" />{role === 'director' ? 'Đạo diễn' : 'Diễn viên'}</label>)}</div></fieldset></>}
        <label className="grid gap-2 text-sm font-semibold">Trạng thái<select value={active ? 'active' : 'hidden'} onChange={(event) => setActive(event.target.value === 'active')} className={inputClass}><option value="active">Đang sử dụng</option><option value="hidden">Đã ẩn</option></select></label>
        <label className="col-span-full grid gap-2 text-sm font-semibold">{kind === 'genre' ? 'Mô tả' : 'Giới thiệu'}<textarea maxLength={2000} value={description} onChange={(event) => setDescription(event.target.value)} className={`${inputClass} min-h-24 resize-y`} placeholder={kind === 'genre' ? 'Mô tả ngắn về thể loại...' : 'Giới thiệu và những tác phẩm nổi bật...'} /></label>
      </div>
      {error && <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      <div className="mt-5 flex justify-end gap-3 border-t border-slate-100 pt-4"><button type="button" onClick={onClose} className="rounded-xl px-4 py-3 text-sm font-semibold text-slate-500 hover:bg-slate-100">Hủy</button><button type="submit" disabled={busy || (kind !== 'genre' && !roles.length)} className="flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold text-white hover:bg-orange-600 disabled:opacity-50"><Save size={16} />{editing ? 'Lưu thay đổi' : 'Thêm mới'}</button></div>
    </form>
  </Modal>
}
