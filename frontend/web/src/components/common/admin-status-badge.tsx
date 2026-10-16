import type { ReactNode } from 'react'

type StatusTone = 'success' | 'neutral' | 'danger'

const toneClasses: Record<StatusTone, string> = {
  success: 'bg-emerald-50 text-emerald-700',
  neutral: 'bg-slate-100 text-slate-600',
  danger: 'bg-red-50 text-red-600',
}

export function AdminStatusBadge({ children, tone }: { children: ReactNode; tone: StatusTone }) {
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${toneClasses[tone]}`}>
      <span aria-hidden="true" className="size-1.5 rounded-full bg-current" />
      {children}
    </span>
  )
}
