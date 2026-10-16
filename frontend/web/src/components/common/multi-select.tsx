'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { ChevronDown, Plus, Search, X } from 'lucide-react'

export type MultiSelectOption = { id: string; name: string; active: boolean }

function searchable(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase()
}

export function MultiSelect({ label, options, value, onChange, onCreate, wide }: {
  label: string
  options: MultiSelectOption[]
  value: string[]
  onChange: (ids: string[]) => void
  onCreate: (name: string) => void
  wide?: boolean
}) {
  const id = useId()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const root = useRef<HTMLDivElement>(null)
  const trigger = useRef<HTMLButtonElement>(null)
  const selected = value.map((itemId) => {
    const item = options.find((option) => option.id === itemId)
    return item ? { ...item, missing: false } : { id: itemId, name: 'Mục đã bị xóa', active: false, missing: true }
  })
  const available = options.filter((option) => (option.active || value.includes(option.id)) && searchable(option.name).includes(searchable(query.trim())))

  useEffect(() => {
    if (!open) return
    const onPointer = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', onPointer)
    return () => document.removeEventListener('pointerdown', onPointer)
  }, [open])

  function toggle(itemId: string) {
    onChange(value.includes(itemId) ? value.filter((item) => item !== itemId) : [...value, itemId])
  }

  return (
    <div ref={root} className={`relative min-w-0 ${wide ? 'sm:col-span-2' : ''}`} onKeyDown={(event) => {
      if (event.key === 'Escape' && open) { event.stopPropagation(); setOpen(false); trigger.current?.focus() }
    }}>
      <span id={`${id}-label`} className="text-sm font-semibold">{label}</span>
      <button ref={trigger} type="button" aria-labelledby={`${id}-label ${id}-value`} aria-expanded={open} aria-controls={open ? `${id}-options` : undefined}
        onClick={() => { setOpen(!open); setQuery('') }}
        className={`mt-2 flex w-full items-center justify-between gap-3 rounded-xl border bg-white px-3 py-3 text-left text-sm outline-none focus-visible:ring-2 focus-visible:ring-orange-200 ${open ? 'border-orange-400' : 'border-slate-200'}`}>
        <span id={`${id}-value`} className={selected.length ? 'text-slate-700' : 'text-slate-400'}>{selected.length ? `Đã chọn ${selected.length} mục` : `Chọn ${label.toLowerCase()}...`}</span>
        <ChevronDown size={16} className={`shrink-0 text-slate-400 transition ${open ? 'rotate-180' : ''}`} />
      </button>
      {selected.length > 0 && <div className="mt-2 flex flex-wrap gap-2" aria-label={`${label} đã chọn`}>
        {selected.map((item) => <span key={item.id} className={`inline-flex max-w-full items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold ${item.missing ? 'bg-red-50 text-red-700' : 'bg-orange-50 text-orange-700'}`}>
          <span className="truncate">{item.name}{!item.active && !item.missing && ' (đã ẩn)'}</span>
          <button type="button" onClick={() => toggle(item.id)} aria-label={`Bỏ chọn ${item.name}`} className="rounded p-0.5 hover:bg-orange-100 focus-visible:outline-2 focus-visible:outline-orange-400"><X size={13} /></button>
        </span>)}
      </div>}
      {open && <div id={`${id}-options`} className="absolute left-0 right-0 top-full z-30 mt-2 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
        <div className="relative border-b border-slate-100 p-3">
          <Search size={16} className="absolute left-6 top-6 text-slate-400" />
          <input autoFocus type="search" aria-label={`Tìm ${label.toLowerCase()}`} value={query} onChange={(event) => setQuery(event.target.value)}
            placeholder={`Tìm ${label.toLowerCase()}...`} className="w-full rounded-xl bg-slate-50 py-2.5 pl-9 pr-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-orange-200" />
        </div>
        <div className="max-h-52 overflow-y-auto p-2" role="group" aria-label={`Danh sách ${label.toLowerCase()}`}>
          {available.map((item) => <label key={item.id} className={`flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm hover:bg-slate-50 ${value.includes(item.id) ? 'bg-orange-50/70 text-orange-700' : 'text-slate-700'}`}>
            <input type="checkbox" className="size-4 accent-orange-500" checked={value.includes(item.id)} onChange={() => toggle(item.id)} />
            <span>{item.name}{!item.active && <span className="ml-2 text-xs text-slate-400">Đã ẩn</span>}</span>
          </label>)}
          {!available.length && <p className="px-3 py-5 text-center text-sm text-slate-500">Không tìm thấy kết quả phù hợp.</p>}
        </div>
        <div className="flex items-center justify-between gap-2 border-t border-slate-100 p-3">
          <button type="button" onClick={() => { setOpen(false); onCreate(query.trim()) }} className="flex items-center gap-1.5 rounded-lg px-2 py-2 text-xs font-bold text-orange-600 hover:bg-orange-50"><Plus size={14} /> Thêm mới</button>
          <button type="button" onClick={() => { setOpen(false); trigger.current?.focus() }} className="rounded-lg bg-slate-950 px-3 py-2 text-xs font-bold text-white">Xong</button>
        </div>
      </div>}
    </div>
  )
}
