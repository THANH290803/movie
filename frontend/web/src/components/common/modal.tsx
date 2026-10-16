'use client'

import type { ReactNode } from 'react'
import { Dialog } from '@base-ui/react/dialog'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Modal({ open, title, description, onClose, children, wide = false }: {
  open: boolean
  title: string
  description: string
  onClose: () => void
  children: ReactNode
  wide?: boolean
}) {
  return (
    <Dialog.Root open={open} onOpenChange={(next) => { if (!next) onClose() }}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-slate-950/45 backdrop-blur-sm" />
        <div
          className="fixed inset-0 z-50 overflow-y-auto p-4"
          onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}
        >
          <div
            className="flex min-h-full items-center justify-center"
            onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}
          >
            <Dialog.Popup className={cn(
              'flex w-full flex-col rounded-lg bg-white p-6 text-slate-900 shadow-2xl outline-none',
              wide ? 'max-w-[48rem]' : 'max-w-xl',
            )}>
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <Dialog.Title className="text-xl font-bold">{title}</Dialog.Title>
                  <Dialog.Description className="mt-2 text-sm leading-6 text-slate-500">{description}</Dialog.Description>
                </div>
                <Dialog.Close aria-label="Đóng" className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-orange-400">
                  <X size={19} />
                </Dialog.Close>
              </div>
              {children}
            </Dialog.Popup>
          </div>
        </div>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
