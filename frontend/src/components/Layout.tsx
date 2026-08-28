import type { ReactNode } from 'react'

export type ViewName = 'inicio' | 'caso' | 'sospechosos' | 'analisis' | 'resultado' | 'acusacion' | 'admin' | 'sistema'

interface Props {
  children: ReactNode
  view: ViewName
  onNavigate: (view: ViewName) => void
  caseTitle?: string
}

type IconName = 'home' | 'case' | 'users' | 'chart' | 'check' | 'gavel' | 'settings' | 'server'

const nav: Array<[ViewName, string, IconName]> = [
  ['inicio', 'Inicio', 'home'],
  ['caso', 'Investigación', 'case'],
  ['sospechosos', 'Sospechosos', 'users'],
  ['analisis', 'Análisis', 'chart'],
  ['acusacion', 'Acusación', 'gavel'],
]

const vistasDelCaso: ViewName[] = ['sospechosos', 'analisis', 'resultado', 'acusacion']

function Icon({ name, className }: { name: IconName; className?: string }) {
  const shared = {
    className,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  }
  switch (name) {
    case 'home': return <svg {...shared}><path d="M4 11.5 12 4l8 7.5" /><path d="M6 10v9h12v-9" /></svg>
    case 'case': return <svg {...shared}><path d="M4 7h5l1.8 2H20v10H4z" /></svg>
    case 'users': return <svg {...shared}><circle cx="9" cy="8" r="3" /><path d="M3.5 19c.7-3 2.8-5 5.5-5s4.8 2 5.5 5" /><circle cx="17.5" cy="9" r="2.3" /><path d="M15.3 19c.3-2.1 1.6-3.7 3.2-4.4" /></svg>
    case 'chart': return <svg {...shared}><path d="M5 19V11" /><path d="M11 19V7" /><path d="M17 19v-5" /><path d="M4 19h16" /></svg>
    case 'check': return <svg {...shared}><circle cx="12" cy="12" r="8.5" /><path d="M8.5 12.2l2.4 2.4 4.6-5" /></svg>
    case 'settings': return <svg {...shared}><circle cx="12" cy="12" r="3" /><path d="M12 3.5v2.2M12 18.3v2.2M4.7 6.3l1.6 1.5M17.7 16.2l1.6 1.5M3.5 12h2.2M18.3 12h2.2M4.7 17.7l1.6-1.5M17.7 7.8l1.6-1.5" /></svg>
    case 'server': return <svg {...shared}><rect x="4.5" y="4.5" width="15" height="5.5" rx="1.2" /><rect x="4.5" y="14" width="15" height="5.5" rx="1.2" /><path d="M7.5 7.3h.01M7.5 16.8h.01" /></svg>
    case 'gavel': return <svg {...shared}><path d="M14 5l5 5-2.5 2.5-5-5z" /><path d="M9 10l5 5-6 6-5-5z" /><path d="M4 21h7" /></svg>
  }
}

// COMPONENTE DE FONDO SVG (Textura de Corcho, Lupa e Hilos Rojos)
function DetectiveBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <svg className="w-full h-full opacity-35" xmlns="http://www.w3.org/2000/svg">
        <defs>
          {/* Patrón de Textura de Corcho */}
          <pattern id="corkPattern" width="40" height="40" patternUnits="userSpaceOnUse">
            <rect width="40" height="40" fill="#bfa075" />
            <circle cx="5" cy="5" r="1.5" fill="#8f6e43" opacity="0.6" />
            <circle cx="25" cy="12" r="2" fill="#694d27" opacity="0.5" />
            <circle cx="35" cy="28" r="1.2" fill="#d8b88c" opacity="0.7" />
            <circle cx="12" cy="32" r="1.8" fill="#523a19" opacity="0.4" />
            <path d="M 18 20 Q 22 25 20 30" stroke="#7a592e" strokeWidth="1" fill="none" opacity="0.5" />
          </pattern>
        </defs>

        {/* Capa 1: Textura de Pizarra de Corcho */}
        <rect width="100%" height="100%" fill="url(#corkPattern)" />

        {/* Capa 2: Hilos Rojos de Investigación */}
        <path
          d="M 200 150 L 550 420 L 980 200 M 550 420 L 380 850 L 880 750"
          stroke="#b81d1d"
          strokeWidth="3"
          strokeDasharray="8,6"
          fill="none"
          opacity="0.6"
        />

        {/* Capa 3: Lupa de Detective Transparente en Fondo */}
        <g transform="translate(750, 100) rotate(-15)" opacity="0.25">
          <circle cx="100" cy="100" r="70" stroke="#110e0c" strokeWidth="12" fill="none" />
          <circle cx="100" cy="100" r="60" stroke="#ffffff" strokeWidth="4" strokeDasharray="10,5" fill="none" />
          <line x1="150" y1="150" x2="240" y2="240" stroke="#110e0c" strokeWidth="20" strokeLinecap="round" />
          <path d="M 80 50 Q 130 55 145 85" stroke="#ffffff" strokeWidth="6" strokeLinecap="round" />
        </g>
      </svg>
    </div>
  )
}

export function Layout({ children, view, onNavigate, caseTitle }: Props) {
  const dentroDelCaso = vistasDelCaso.includes(view)

  return (
    <div className="min-h-screen bg-[#bfa075] text-[#1f1a17] relative">
      {/* Fondo Vectorial Físico Garantizado */}
      <DetectiveBackground />

      {/* Sidebar Fijo */}
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 flex-col border-r-2 border-[#5a4d41] bg-[#bcab8c] lg:flex">
        <div className="flex items-center gap-3 border-b border-[#a39274] px-5 py-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-sm bg-[#110e0c] text-sm font-bold text-[#f7f3e9]">
            LD
          </div>
          <div>
            <h1 className="text-sm font-bold text-[#110e0c]">Logic Detective</h1>
            <p className="text-xs text-[#4a3f35] font-semibold">Sistema de investigación</p>
          </div>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {nav.map(([id, label, icon]) => (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              className={`flex w-full items-center gap-3 rounded-sm px-3 py-2 text-sm font-bold transition-none ${
                view === id
                  ? 'bg-[#110e0c] text-[#ffffff]'
                  : 'text-[#1a1614] hover:bg-[#a39274]'
              }`}
            >
              <Icon
                name={icon}
                className={`h-[18px] w-[18px] shrink-0 ${
                  view === id ? 'text-[#ffffff]' : 'text-[#1a1614]'
                }`}
              />
              {label}
            </button>
          ))}
        </nav>
        <div className="m-3 rounded-sm border border-[#5a4d41] bg-[#a39274] p-3 text-xs text-[#110e0c]">
          <div className="font-bold text-[#110e0c]">Motor simbólico</div>
          FastAPI → PySwip → SWI-Prolog
        </div>
      </aside>

      {/* Contenido principal */}
      <div className="lg:pl-64 relative z-10">
        <header className="sticky top-0 z-10 flex items-center justify-between border-b-2 border-[#5a4d41] bg-[#bcab8c] px-5 py-3.5 shadow-md lg:px-8">
          <div className="flex items-center gap-3">
            {dentroDelCaso && (
              <button
                onClick={() => onNavigate('caso')}
                className="rounded-sm border border-[#110e0c] bg-[#d4c5a9] px-3 py-1.5 text-xs font-bold text-[#110e0c] hover:bg-[#110e0c] hover:text-[#ffffff]"
              >
                ← Investigación
              </button>
            )}
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-[#3b322c]">
                Centro de investigación
              </p>
              <h2 className="text-sm font-bold text-[#110e0c]">{caseTitle || 'Logic Detective'}</h2>
            </div>
          </div>
          <button
            onClick={() => onNavigate('admin')}
            className="rounded-sm border border-[#110e0c] bg-[#d4c5a9] px-3 py-1.5 text-xs font-bold text-[#110e0c] hover:bg-[#110e0c] hover:text-[#ffffff]"
          >
            Módulo administrativo
          </button>
        </header>

        <main className="mx-auto max-w-7xl p-5 lg:p-8">{children}</main>

        {/* Bottom Nav para Móviles */}
        <div className="fixed bottom-3 left-3 right-3 z-30 flex gap-1 overflow-x-auto rounded-md border-2 border-[#5a4d41] bg-[#bcab8c] p-1.5 shadow-lg lg:hidden">
          {nav.map(([id, label, icon]) => (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              className={`flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-sm px-3 py-2 text-xs font-bold ${
                view === id
                  ? 'bg-[#110e0c] text-[#ffffff]'
                  : 'text-[#1a1614]'
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