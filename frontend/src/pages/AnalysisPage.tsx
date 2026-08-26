import { useEffect, useState } from 'react'
import { api } from '../api/client'
import type { CaseItem, GenericSolution } from '../types'
import { Empty, ErrorBox, Loading, Panel, Pill, SectionTitle } from '../components/UI'
import { flattenSolution } from '../lib/format'

export function AnalysisPage({ currentCase }: { currentCase: CaseItem | null }) {
  const [data, setData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!currentCase) return
    setLoading(true)
    Promise.all([
      api.motivos(currentCase.Caso),
      api.medios(currentCase.Caso),
      api.coartadasValidas(currentCase.Caso),
      api.coartadasInvalidas(currentCase.Caso),
      api.contradiccionesDeclaraciones(currentCase.Caso),
      api.informacionFalsa(currentCase.Caso),
      api.complices(currentCase.Caso),
    ]).then(([m, md, cv, ci, cd, f, co]) => setData({ m, md, cv, ci, cd, f, co })).catch(e => setError(e.message)).finally(() => setLoading(false))
  }, [currentCase])

  if (!currentCase) return <Empty text="Selecciona un caso antes de analizar inferencias." />

  const rows = (arr: GenericSolution[]) =>
    arr.length ? arr.map((x, i) => <div key={i} className="rounded-lg bg-gray-50 p-3 text-sm text-gray-600">{flattenSolution(x)}</div>) : <Empty />

  return (
    <>
      <SectionTitle
        eyebrow="Motor de inferencia"
        title="Análisis cruzado"
        text="Esta vista reúne inferencias clave del caso: motivos, medios, coartadas, contradicciones, información falsa y posibles cómplices."
      />
      <ErrorBox error={error} />
      {loading ? (
        <Loading />
      ) : data && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <Panel><h3 className="mb-3 font-semibold text-gray-900">Motivos</h3><div className="space-y-2">{rows(data.m.motivos)}</div></Panel>
          <Panel><h3 className="mb-3 font-semibold text-gray-900">Medios</h3><div className="space-y-2">{rows(data.md.medios)}</div></Panel>
          <Panel><h3 className="mb-3 font-semibold text-gray-900">Coartadas válidas</h3><div className="space-y-2">{rows(data.cv.coartadas_validas || [])}</div></Panel>
          <Panel><h3 className="mb-3 font-semibold text-gray-900">Coartadas inválidas</h3><div className="space-y-2">{rows(data.ci.coartadas_invalidas || [])}</div></Panel>
          <Panel><h3 className="mb-3 font-semibold text-gray-900">Contradicciones entre declaraciones</h3><div className="space-y-2">{rows(data.cd.contradicciones)}</div></Panel>
          <Panel>
            <h3 className="mb-3 font-semibold text-gray-900">Información falsa</h3>
            {data.f.sospechosos.length ? <div className="flex flex-wrap gap-2">{data.f.sospechosos.map((s: string) => <Pill key={s} tone="red">{s}</Pill>)}</div> : <Empty />}
          </Panel>
          <Panel className="md:col-span-2 xl:col-span-3">
            <h3 className="mb-3 font-semibold text-gray-900">Posibles cómplices</h3>
            <div className="grid gap-2 md:grid-cols-2">{rows(data.co.posibles_complices)}</div>
          </Panel>
        </div>
      )}
    </>
  )
}
