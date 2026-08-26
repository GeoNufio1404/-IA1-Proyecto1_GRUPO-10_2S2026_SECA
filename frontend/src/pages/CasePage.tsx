import { useEffect, useState } from 'react'
import { api } from '../api/client'
import type { CaseItem, GenericSolution, SuspectItem } from '../types'
import { Empty, ErrorBox, Loading, Panel, Pill, SectionTitle } from '../components/UI'
import { flattenSolution } from '../lib/format'

export function CasePage({ currentCase, onSelectSuspect, onGoAnalysis }: { currentCase: CaseItem | null; onSelectSuspect: (s: SuspectItem) => void; onGoAnalysis: () => void }) {
  const [suspects, setSuspects] = useState<SuspectItem[]>([])
  const [opp, setOpp] = useState<GenericSolution[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!currentCase) return
    Promise.all([api.sospechosos(currentCase.Caso), api.oportunidad(currentCase.Caso)])
      .then(([s, o]) => { setSuspects(s.sospechosos); setOpp(o.oportunidad) })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [currentCase])

  if (!currentCase) return <Empty text="Selecciona un caso desde Inicio para comenzar." />

  return (
    <>
      <SectionTitle
        eyebrow="Investigación activa"
        title={currentCase.Titulo}
        text="Comienza por las personas involucradas. La información se descubre progresivamente mediante consultas al motor lógico."
        action={<Pill tone="green">Caso activo</Pill>}
      />
      <ErrorBox error={error} />
      {loading ? (
        <Loading />
      ) : (
        <>
          <div className="grid gap-4 lg:grid-cols-3">
            <Panel className="lg:col-span-2">
              <h3 className="mb-4 font-semibold text-gray-900">Sospechosos del caso</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {suspects.map(s => (
                  <button
                    key={s.Id}
                    onClick={() => onSelectSuspect(s)}
                    className="rounded-lg border border-gray-200 bg-white p-4 text-left transition-colors hover:border-indigo-300 hover:bg-indigo-50/40"
                  >
                    <div className="mb-1 font-semibold text-gray-900">{s.Nombre}</div>
                    <div className="text-xs text-gray-400">{s.Id}</div>
                    <div className="mt-3 text-xs font-medium text-indigo-600">Abrir expediente →</div>
                  </button>
                ))}
              </div>
            </Panel>
            <Panel>
              <h3 className="mb-3 font-semibold text-gray-900">Oportunidad detectada</h3>
              <div className="space-y-2">
                {opp.length
                  ? opp.map((x, i) => <div key={i} className="rounded-lg bg-gray-50 p-3 text-sm text-gray-600">{flattenSolution(x)}</div>)
                  : <Empty text="No hay oportunidades inferidas." />}
              </div>
            </Panel>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <Panel>
              <div className="font-semibold text-gray-900">Investigar personas</div>
              <p className="mt-1 text-sm text-gray-500">Accesos, evidencias relacionadas, contradicciones y nivel de sospecha.</p>
            </Panel>
            <Panel>
              <div className="font-semibold text-gray-900">Cruzar inferencias</div>
              <p className="mt-1 text-sm text-gray-500">Motivo, medios, coartadas e información falsa.</p>
              <button onClick={onGoAnalysis} className="mt-3 text-sm font-medium text-indigo-600 hover:text-indigo-700">Abrir análisis →</button>
            </Panel>
            <Panel>
              <div className="font-semibold text-gray-900">Concluir</div>
              <p className="mt-1 text-sm text-gray-500">Consulta responsable lógico, sospechoso principal y explicación.</p>
            </Panel>
          </div>
        </>
      )}
    </>
  )
}

