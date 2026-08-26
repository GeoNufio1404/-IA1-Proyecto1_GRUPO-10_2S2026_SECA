import { useEffect, useState } from 'react'
import { api } from '../api/client'
import type { CaseItem, SuspectItem } from '../types'
import { Empty, ErrorBox, Loading, Panel, Pill, SectionTitle } from '../components/UI'

export function SuspectsPage({ currentCase, selected, onSelect }: { currentCase: CaseItem | null; selected: SuspectItem | null; onSelect: (s: SuspectItem) => void }) {
  const [list, setList] = useState<SuspectItem[]>([])
  const [details, setDetails] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (currentCase) api.sospechosos(currentCase.Caso).then(r => setList(r.sospechosos)).catch(e => setError(e.message))
  }, [currentCase])

  useEffect(() => {
    if (!currentCase || !selected) { setDetails(null); return }
    setLoading(true)
    Promise.all([
      api.accesos(currentCase.Caso, selected.Id),
      api.evidencias(currentCase.Caso, selected.Id),
      api.totalEvidencias(currentCase.Caso, selected.Id),
      api.nivelSospecha(currentCase.Caso, selected.Id),
      api.contradiccionesEvidencia(currentCase.Caso, selected.Id),
      api.explicacion(currentCase.Caso, selected.Id),
    ]).then(([a, e, t, n, c, x]) => setDetails({ a, e, t, n, c, x })).catch(e => setError(e.message)).finally(() => setLoading(false))
  }, [currentCase, selected])

  if (!currentCase) return <Empty text="Selecciona primero un caso." />

  return (
    <>
      <SectionTitle
        eyebrow="Expedientes"
        title="Sospechosos"
        text="Selecciona una persona para consultar de forma integrada los endpoints de acceso, evidencias, contradicciones, nivel de sospecha y explicación."
      />
      <ErrorBox error={error} />
      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        <Panel>
          <div className="space-y-2">
            {list.map(s => (
              <button
                key={s.Id}
                onClick={() => onSelect(s)}
                className={`w-full rounded-lg border p-3 text-left transition-colors ${
                  selected?.Id === s.Id ? 'border-indigo-300 bg-indigo-50' : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="font-medium text-gray-900">{s.Nombre}</div>
                <div className="text-xs text-gray-400">{s.Id}</div>
              </button>
            ))}
          </div>
        </Panel>
        <div>
          {!selected ? (
            <Empty text="Elige un sospechoso para abrir su expediente." />
          ) : loading ? (
            <Loading />
          ) : details && (
            <div className="space-y-4">
              <Panel>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="text-xl font-semibold text-gray-900">{selected.Nombre}</div>
                    <div className="text-sm text-gray-400">{selected.Id}</div>
                  </div>
                  <Pill tone={details.n.nivel_sospecha >= 70 ? 'red' : details.n.nivel_sospecha >= 40 ? 'amber' : 'green'}>
                    Sospecha: {details.n.nivel_sospecha}
                  </Pill>
                </div>
              </Panel>
              <div className="grid gap-4 md:grid-cols-2">
                <Panel>
                  <h3 className="mb-3 font-semibold text-gray-900">Accesos registrados</h3>
                  {details.a.lugares.length
                    ? details.a.lugares.map((x: any, i: number) => <div className="mb-2 rounded-lg bg-gray-50 p-3 text-sm text-gray-600" key={i}>{String(x.Lugar ?? Object.values(x)[0])}</div>)
                    : <Empty />}
                </Panel>
                <Panel>
                  <h3 className="mb-3 font-semibold text-gray-900">Evidencias relacionadas <Pill>{details.t.total_evidencias}</Pill></h3>
                  {details.e.evidencias.length
                    ? details.e.evidencias.map((x: any, i: number) => <div className="mb-2 rounded-lg bg-gray-50 p-3 text-sm text-gray-600" key={i}>{String(x.Evidencia ?? Object.values(x)[0])}</div>)
                    : <Empty />}
                </Panel>
                <Panel>
                  <h3 className="mb-3 font-semibold text-gray-900">Contradicciones</h3>
                  {details.c.contradicciones.length
                    ? details.c.contradicciones.map((x: any, i: number) => <div className="mb-2 rounded-lg border border-red-100 bg-red-50 p-3 text-sm text-red-700" key={i}>{String(x.Evidencia ?? Object.values(x)[0])}</div>)
                    : <Empty />}
                </Panel>
                <Panel>
                  <h3 className="mb-3 font-semibold text-gray-900">Explicación lógica</h3>
                  {details.x.explicacion.length
                    ? details.x.explicacion.map((x: any, i: number) => <div className="mb-2 rounded-lg border border-indigo-100 bg-indigo-50 p-3 text-sm text-indigo-800" key={i}>{String(x)}</div>)
                    : <Empty text="El motor aún no reporta razones para esta persona." />}
                </Panel>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

