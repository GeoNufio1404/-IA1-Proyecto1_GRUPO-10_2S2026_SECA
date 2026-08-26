import type { ReactNode } from 'react'

export type ViewName = 'inicio' | 'caso' | 'sospechosos' | 'analisis' | 'resultado' | 'admin' | 'sistema'

interface Props {
  children: ReactNode
  view: ViewName
  onNavigate: (view: ViewName) => void
  caseTitle?: string
}

type IconName = 'home' | 'case' | 'users' | 'chart' | 'check' | 'settings' | 'server'

const nav: Array<[ViewName, string, IconName]> = [
  ['inicio', 'Inicio', 'home'],
  ['caso', 'Investigación', 'case'],
  ['sospechosos', 'Sospechosos', 'users'],
  ['analisis', 'Análisis', 'chart'],
  ['resultado', 'Resultado', 'check'],
  ['admin', 'Administración', 'settings'],
  ['sistema', 'Sistema', 'server'],
]

function Icon({ name, className }: { name: IconName; className?: string }) {
  const shared = {
    className,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.75,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  }
  switch (name) {
    case 'home':
      return <svg {...shared}><path d="M4 11.5 12 4l8 7.5" /><path d="M6 10v9h12v-9" /></svg>
    case 'case':
      return <svg {...shared}><path d="M4 7h5l1.8 2H20v10H4z" /></svg>
    case 'users':
      return <svg {...shared}><circle cx="9" cy="8" r="3" /><path d="M3.5 19c.7-3 2.8-5 5.5-5s4.8 2 5.5 5" /><circle cx="17.5" cy="9" r="2.3" /><path d="M15.3 19c.3-2.1 1.6-3.7 3.2-4.4" /></svg>
    case 'chart':
      return <svg {...shared}><path d="M5 19V11" /><path d="M11 19V7" /><path d="M17 19v-5" /><path d="M4 19h16" /></svg>
    case 'check':
      return <svg {...shared}><circle cx="12" cy="12" r="8.5" /><path d="M8.5 12.2l2.4 2.4 4.6-5" /></svg>
    case 'settings':
      return <svg {...shared}><circle cx="12" cy="12" r="3" /><path d="M12 3.5v2.2M12 18.3v2.2M4.7 6.3l1.6 1.5M17.7 16.2l1.6 1.5M3.5 12h2.2M18.3 12h2.2M4.7 17.7l1.6-1.5M17.7 7.8l1.6-1.5" /></svg>
    case 'server':
      return <svg {...shared}><rect x="4.5" y="4.5" width="15" height="5.5" rx="1.2" /><rect x="4.5" y="14" width="15" height="5.5" rx="1.2" /><path d="M7.5 7.3h.01M7.5 16.8h.01" /></svg>
  }
}

export function Layout({ children, view, onNavigate, caseTitle }: Props) {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 flex-col border-r border-gray-200 bg-white lg:flex">
        <div className="flex items-center gap-3 border-b border-gray-100 px-5 py-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-sm font-bold text-white">LD</div>
          <div>
            <h1 className="text-sm font-semibold text-gray-900">Logic Detective</h1>
            <p className="text-xs text-gray-400">Sistema experto de investigación</p>
          </div>
        </div>
        <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
          {nav.map(([id, label, icon]) => (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                view === id ? 'bg-indigo-50 font-medium text-indigo-700' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Icon name={icon} className={`h-[18px] w-[18px] shrink-0 ${view === id ? 'text-indigo-600' : 'text-gray-400'}`} />
              {label}
            </button>
          ))}
        </nav>
        <div className="m-3 rounded-lg border border-gray-100 bg-gray-50 p-3 text-xs text-gray-500">
          <div className="font-medium text-gray-700">Motor simbólico</div>
          FastAPI → PySwip → SWI-Prolog
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white/80 px-5 py-3.5 backdrop-blur lg:px-8">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-indigo-600">Centro de investigación</p>
            <h2 className="text-sm font-semibold text-gray-900">{caseTitle || 'Logic Detective'}</h2>
          </div>
          <button
            onClick={() => onNavigate('admin')}
            className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:border-indigo-300 hover:text-indigo-600"
          >
            Módulo administrativo
          </button>
        </header>

        <main className="mx-auto max-w-7xl p-5 lg:p-8">{children}</main>

        <div className="fixed bottom-3 left-3 right-3 z-30 flex gap-1 overflow-x-auto rounded-xl border border-gray-200 bg-white p-1.5 shadow-lg lg:hidden">
          {nav.slice(0, 6).map(([id, label, icon]) => (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              className={`flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-2 text-xs ${
                view === id ? 'bg-indigo-50 font-medium text-indigo-700' : 'text-gray-500'
              }`}
            >
              <Icon name={icon} className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

