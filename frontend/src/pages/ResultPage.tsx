import { useEffect, useState } from 'react'
import { api } from '../api/client'
import type { CaseItem } from '../types'
import { Empty, ErrorBox, Loading, Panel, Pill, SectionTitle } from '../components/UI'

export function ResultPage({ currentCase }: { currentCase: CaseItem | null }) {
  const [data, setData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!currentCase) return
    setLoading(true)
    Promise.all([api.sospechosoPrincipal(currentCase.Caso), api.responsable(currentCase.Caso), api.complices(currentCase.Caso)])
      .then(([p, r, c]) => setData({ p, r, c })).catch(e => setError(e.message)).finally(() => setLoading(false))
  }, [currentCase])

  if (!currentCase) return <Empty text="Selecciona un caso para ver su resultado lógico." />

  return (
    <>
      <SectionTitle
        eyebrow="Conclusión"
        title="Resultado de la investigación"
        text="La conclusión mostrada proviene de los predicados del motor Prolog; no se calcula con condiciones duplicadas en React."
      />
      <ErrorBox error={error} />
      {loading ? (
        <Loading />
      ) : data && (
        <div className="space-y-4">
          <Panel>
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <Pill tone="amber">Sospechoso principal</Pill>
                <div className="mt-3 text-3xl font-semibold text-gray-900">{data.p.sospechoso_principal || 'Sin conclusión'}</div>
                <p className="mt-2 text-sm text-gray-500">Persona con mayor señalamiento según las reglas de sospecha.</p>
              </div>
              <div className="rounded-xl border border-red-100 bg-red-50 p-5">
                <Pill tone="red">Responsable lógico</Pill>
                <div className="mt-3 text-3xl font-semibold text-gray-900">{data.r.responsable_logico || 'No determinado'}</div>
                <p className="mt-2 text-sm text-gray-500">Resultado lógico final obtenido por el motor de inferencia.</p>
              </div>
            </div>
          </Panel>
          <Panel>
            <h3 className="mb-3 font-semibold text-gray-900">Posibles cómplices</h3>
            {data.c.posibles_complices.length
              ? data.c.posibles_complices.map((x: any, i: number) => <div key={i} className="mb-2 rounded-lg bg-gray-50 p-3 text-sm text-gray-600">{Object.values(x).join(' ↔ ')}</div>)
              : <Empty text="No se identificaron parejas de posibles cómplices." />}
          </Panel>
          <Panel>
            <h3 className="font-semibold text-gray-900">Pendiente para el 30% restante</h3>
            <p className="mt-2 text-sm text-gray-500">La acusación final interactiva, el informe PDF, la bitácora y el historial de investigaciones quedan señalados como trabajo del segundo integrante porque el backend actual todavía no expone endpoints específicos para persistir esas acciones.</p>
          </Panel>
        </div>
      )}
    </>
  )
}
