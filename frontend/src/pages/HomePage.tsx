import { useEffect, useState } from 'react'
import { api } from '../api/client'
import type { CaseItem } from '../types'
import { ErrorBox, Loading, Panel, Pill, SectionTitle } from '../components/UI'

// Icono SVG de Lupa de Detective
function SearchIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  )
}

export function HomePage({ onOpenCase, onAdmin }: { onOpenCase: (item: CaseItem) => void; onAdmin: () => void }) {
  const [cases, setCases] = useState<CaseItem[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.casos().then(r => setCases(r.casos)).catch(e => setError(e.message)).finally(() => setLoading(false))
  }, [])

  return (
    <>
      <SectionTitle
        eyebrow="Inicio"
        title="Resuelve el caso con lógica, no con suposiciones"
        text="Explora evidencias, contrasta declaraciones y consulta inferencias calculadas por Prolog antes de emitir una conclusión."
        action={
          <button
            onClick={onAdmin}
            className="rounded-sm !bg-[#110e0c] px-4 py-2.5 text-sm font-bold !text-white transition-opacity hover:opacity-90"
          >
            Administrar casos
          </button>
        }
      />
      <ErrorBox error={error} />
      {loading ? (
        <Loading />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {cases.map((item, index) => (
            <Panel key={item.Caso} className="group transition-colors border-[#5a4d41]/40">
              <div className="mb-6 flex items-center justify-between">
                <Pill tone="cyan">{item.Caso}</Pill>
                {/* Número de expediente en tono contrastado tipo tinta */}
                <span className="text-3xl font-bold text-[#5a4d41]/40 font-mono">
                  0{index + 1}
                </span>
              </div>
              <h3 className="mb-3 font-bold !text-[#110e0c] border-b border-[#5a4d41]/40 pb-1">{item.Titulo}</h3>
              <p className="mb-5 text-sm font-medium !text-[#3b322c]">
                Caso disponible para investigación. Consulta sospechosos, evidencias, contradicciones, coartadas y nivel de sospecha.
              </p>

              {/* Botón estandarizado al estilo "Administrar casos" con Lupa */}
              <button
                onClick={() => onOpenCase(item)}
                className="flex w-full items-center justify-center gap-2 rounded-sm !bg-[#110e0c] px-4 py-2.5 text-sm font-bold !text-white transition-opacity hover:opacity-90"
              >
                <SearchIcon className="h-4 w-4" />
                Iniciar investigación →
              </button>
            </Panel>
          ))}
        </div>
      )}
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <Panel>
          <div className="text-2xl font-bold !text-[#110e0c]">{cases.length}</div>
          <div className="text-sm font-semibold !text-[#5a4d41]">Casos disponibles</div>
        </Panel>
        <Panel>
          <div className="text-2xl font-bold !text-[#110e0c]">Prolog</div>
          <div className="text-sm font-semibold !text-[#5a4d41]">Motor de inferencia simbólica</div>
        </Panel>
        <Panel>
          <div className="text-2xl font-bold !text-[#110e0c]">100%</div>
          <div className="text-sm font-semibold !text-[#5a4d41]">Conclusiones justificables por reglas</div>
        </Panel>
      </div>
    </>
  )
}