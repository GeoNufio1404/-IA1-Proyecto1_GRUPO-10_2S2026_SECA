import { useEffect, useState } from 'react'
import { api } from '../api/client'
import type { CaseItem } from '../types'
import { ErrorBox, Loading, Panel, Pill, SectionTitle } from '../components/UI'

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
          <button onClick={onAdmin} className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-700">
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
            <Panel key={item.Caso} className="group transition-colors hover:border-indigo-300">
              <div className="mb-6 flex items-center justify-between">
                <Pill>{item.Caso}</Pill>
                <span className="text-3xl font-semibold text-gray-100">0{index + 1}</span>
              </div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900">{item.Titulo}</h3>
              <p className="mb-5 text-sm text-gray-500">
                Caso disponible para investigación. Consulta sospechosos, evidencias, contradicciones, coartadas y nivel de sospecha.
              </p>
              <button
                onClick={() => onOpenCase(item)}
                className="w-full rounded-lg bg-gray-50 px-4 py-3 text-sm font-medium text-gray-700 transition-colors group-hover:bg-indigo-600 group-hover:text-white"
              >
                Iniciar investigación →
              </button>
            </Panel>
          ))}
        </div>
      )}
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <Panel>
          <div className="text-2xl font-semibold text-gray-900">{cases.length}</div>
          <div className="text-sm text-gray-500">Casos disponibles</div>
        </Panel>
        <Panel>
          <div className="text-2xl font-semibold text-gray-900">Prolog</div>
          <div className="text-sm text-gray-500">Motor de inferencia simbólica</div>
        </Panel>
        <Panel>
          <div className="text-2xl font-semibold text-gray-900">100%</div>
          <div className="text-sm text-gray-500">Conclusiones justificables por reglas</div>
        </Panel>
      </div>
    </>
  )
}

