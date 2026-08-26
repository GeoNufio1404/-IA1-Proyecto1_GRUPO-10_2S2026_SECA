import type { ReactNode } from 'react'
import { Alert, Badge, Spinner } from 'flowbite-react'

export function SectionTitle({ eyebrow, title, text, action }: { eyebrow?: string; title: string; text?: string; action?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
      <div>
        {eyebrow && <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-indigo-600">{eyebrow}</p>}
        <h1 className="text-2xl font-semibold text-gray-900 md:text-3xl">{title}</h1>
        {text && <p className="mt-2 max-w-2xl text-sm text-gray-500">{text}</p>}
      </div>
      {action}
    </div>
  )
}

export function Panel({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <section className={`rounded-xl border border-gray-200 bg-white p-5 shadow-sm ${className}`}>{children}</section>
}

const toneColor = { cyan: 'indigo', green: 'success', red: 'failure', amber: 'warning', slate: 'gray' } as const

export function Pill({ children, tone = 'cyan' }: { children: ReactNode; tone?: 'cyan' | 'green' | 'red' | 'amber' | 'slate' }) {
  return <Badge color={toneColor[tone]} className="inline-flex rounded-full px-2.5 py-1 text-xs font-semibold">{children}</Badge>
}

export function Empty({ text = 'No hay datos disponibles.' }: { text?: string }) {
  return <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-6 text-center text-sm text-gray-400">{text}</div>
}

export function ErrorBox({ error }: { error: string | null }) {
  return error ? <Alert color="failure" className="mb-4">{error}</Alert> : null
}

export function Loading() {
  return (
    <div className="flex items-center justify-center gap-2 py-10 text-sm text-gray-400">
      <Spinner size="sm" /> Consultando motor de inferencia…
    </div>
  )
}

