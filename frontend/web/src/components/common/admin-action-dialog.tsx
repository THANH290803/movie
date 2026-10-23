'use client'

import type { ReactNode } from 'react'
import { Dialog } from '@base-ui/react/dialog'
import { X } from 'lucide-react'

export function AdminActionDialog({ open, title, onClose, children, wide = false, danger = false }: {
  open: boolean
  title: string
  onClose: () => void
  children: ReactNode
  wide?: boolean
  danger?: boolean
}) {
  return <Dialog.Root open={open} onOpenChange={(next) => { if (!next) onClose() }}>
    <Dialog.Portal>
      <Dialog.Backdrop className="fixed inset-0 z-50 bg-slate-950/50" />
      <div className="fixed inset-0 z-50 overflow-y-auto p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
        <div className="flex min-h-full items-center justify-center" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
          <Dialog.Popup role={danger ? 'alertdialog' : 'dialog'} className={`flex w-full flex-col rounded-lg bg-white p-6 text-slate-900 shadow-2xl outline-none ${wide ? 'max-w-[48rem]' : 'max-w-xl'}`}>
            <div className="flex items-center justify-between"><Dialog.Title className="text-xl font-bold text-slate-950">{title}</Dialog.Title><Dialog.Close aria-label="Đóng" className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"><X size={19} /></Dialog.Close></div>
            <div className="mt-6 flex flex-1 flex-col">{children}</div>
          </Dialog.Popup>
        </div>
      </div>
    </Dialog.Portal>
  </Dialog.Root>
}
