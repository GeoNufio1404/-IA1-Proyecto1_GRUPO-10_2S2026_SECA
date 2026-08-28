import { useEffect, useState } from 'react'
import { api } from '../api/client'
import type { CaseItem, GenericSolution, TimelineEvento } from '../types'
import { Empty, ErrorBox, Loading, Panel, Pill, SectionTitle } from '../components/UI'
import { flattenSolution, prettyId } from '../lib/format'
import { useInterrogatorio } from '../lib/investigationState'

function filtrarPorInterrogados<T extends Record<string, unknown>>(items: T[], interrogados: string[]): T[] {
  if (!interrogados.length) return []
  return items.filter(item => Object.values(item).some(v => typeof v === 'string' && interrogados.includes(v)))
}

export function AnalysisPage({ currentCase }: { currentCase: CaseItem | null }) {
  const { interrogados } = useInterrogatorio(currentCase?.Caso)
  const [totalSuspects, setTotalSuspects] = useState(0)
  const [data, setData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const [timeline, setTimeline] = useState<TimelineEvento[]>([])
  const [lugarIncidente, setLugarIncidente] = useState<string | null>(null)
  const [loadingTimeline, setLoadingTimeline] = useState(false)
  const [errorTimeline, setErrorTimeline] = useState<string | null>(null)

  useEffect(() => {
    if (!currentCase) return
    setLoading(true)
    Promise.all([
      api.sospechosos(currentCase.Caso),
      api.motivos(currentCase.Caso),
      api.medios(currentCase.Caso),
      api.coartadasValidas(currentCase.Caso),
      api.coartadasInvalidas(currentCase.Caso),
      api.contradiccionesDeclaraciones(currentCase.Caso),
      api.informacionFalsa(currentCase.Caso),
      api.complices(currentCase.Caso),
    ]).then(([sus, m, md, cv, ci, cd, f, co]) => { setTotalSuspects(sus.sospechosos.length); setData({ m, md, cv, ci, cd, f, co }) })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [currentCase])

  useEffect(() => {
    if (!currentCase) { setTimeline([]); return }
    setLoadingTimeline(true)
    api.timeline(currentCase.Caso)
      .then(r => { setTimeline(r.eventos); setLugarIncidente(r.lugar_incidente) })
      .catch(e => setErrorTimeline(e.message))
      .finally(() => setLoadingTimeline(false))
  }, [currentCase])

  if (!currentCase) return <Empty text="Selecciona un caso antes de analizar inferencias." />

  const rows = (arr: GenericSolution[]) =>
    arr.length ? (
      arr.map((x, i) => (
        <div key={i} className="rounded-sm border border-[#5a4d41]/30 bg-[#f7f3e9] p-3 text-sm font-medium !text-[#110e0c]">
          {flattenSolution(x)}
        </div>
      ))
    ) : (
      <Empty text="Sin datos de los sospechosos interrogados." />
    )

  const timelineFiltrado = timeline.filter(e => interrogados.includes(e.sospechoso))
  const infoFalsaFiltrada = data ? (data.f.sospechosos as string[]).filter(s => interrogados.includes(s)) : []

  return (
    <>
      <SectionTitle
        eyebrow="Motor de inferencia"
        title="Análisis cruzado"
        text="Esta vista reúne inferencias clave del caso: motivos, medios, coartadas, contradicciones, información falsa, cómplices y línea de tiempo."
      />

      {/* Banner de Estado del Expediente Estilizado */}
      <Panel className="mb-4 border-2 border-[#5a4d41]/60 !bg-[#f2ebd9]">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-bold !text-[#110e0c]">
            Mostrando únicamente información de sospechosos ya interrogados.
          </p>
          <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider !text-[#110e0c]">
            <span>Progreso:</span>
            <Pill tone="green">
              {interrogados.length} de {totalSuspects}
            </Pill>
          </div>
        </div>
      </Panel>

      <ErrorBox error={error} />

      {loading ? (
        <Loading />
      ) : data && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <Panel>
            <h3 className="mb-3 font-bold !text-[#110e0c] border-b border-[#5a4d41]/40 pb-1">Motivos</h3>
            <div className="space-y-2">{rows(filtrarPorInterrogados(data.m.motivos, interrogados))}</div>
          </Panel>

          <Panel>
            <h3 className="mb-3 font-bold !text-[#110e0c] border-b border-[#5a4d41]/40 pb-1">Medios</h3>
            <div className="space-y-2">{rows(filtrarPorInterrogados(data.md.medios, interrogados))}</div>
          </Panel>

          <Panel>
            <h3 className="mb-3 font-bold !text-[#110e0c] border-b border-[#5a4d41]/40 pb-1">Coartadas válidas</h3>
            <div className="space-y-2">{rows(filtrarPorInterrogados(data.cv.coartadas_validas || [], interrogados))}</div>
          </Panel>

          <Panel>
            <h3 className="mb-3 font-bold !text-[#110e0c] border-b border-[#5a4d41]/40 pb-1">Coartadas inválidas</h3>
            <div className="space-y-2">{rows(filtrarPorInterrogados(data.ci.coartadas_invalidas || [], interrogados))}</div>
          </Panel>

          <Panel>
            <h3 className="mb-3 font-bold !text-[#110e0c] border-b border-[#5a4d41]/40 pb-1">Contradicciones entre declaraciones</h3>
            <div className="space-y-2">{rows(filtrarPorInterrogados(data.cd.contradicciones, interrogados))}</div>
          </Panel>

          <Panel>
            <h3 className="mb-3 font-bold !text-[#110e0c] border-b border-[#5a4d41]/40 pb-1">Información falsa</h3>
            {infoFalsaFiltrada.length ? (
              <div className="flex flex-wrap gap-2">
                {infoFalsaFiltrada.map((s: string) => (
                  <Pill key={s} tone="red">{s}</Pill>
                ))}
              </div>
            ) : (
              <Empty text="Sin datos de los sospechosos interrogados." />
            )}
          </Panel>

          <Panel className="md:col-span-2 xl:col-span-3">
            <h3 className="mb-3 font-bold !text-[#110e0c] border-b border-[#5a4d41]/40 pb-1">Posibles cómplices</h3>
            <div className="grid gap-2 md:grid-cols-2">{rows(filtrarPorInterrogados(data.co.posibles_complices, interrogados))}</div>
          </Panel>

          {/* Línea de Tiempo de Inferencias */}
          <Panel className="md:col-span-2 xl:col-span-3">
            <div className="mb-3 flex items-center justify-between border-b border-[#5a4d41]/40 pb-2">
              <h3 className="font-bold !text-[#110e0c]">Línea de tiempo</h3>
              {lugarIncidente && <Pill tone="red">Incidente: {prettyId(lugarIncidente)}</Pill>}
            </div>
            <ErrorBox error={errorTimeline} />
            {loadingTimeline ? (
              <Loading />
            ) : timelineFiltrado.length ? (
              <ol className="relative border-l-2 border-[#5a4d41] pl-5">
                {timelineFiltrado.map((e, i) => (
                  <li key={i} className="mb-5 last:mb-0">
                    <span
                      className={`absolute -left-[7px] mt-1.5 h-3 w-3 rounded-full border border-[#110e0c] ${e.es_lugar_incidente ? 'bg-red-600' : e.tipo === 'evidencia' ? 'bg-amber-500' : 'bg-[#110e0c]'
                        }`}
                    />
                    <div className="flex flex-wrap items-center gap-2">
                      <Pill tone="slate">{e.hora}</Pill>
                      <Pill tone={e.tipo === 'evidencia' ? 'amber' : 'cyan'}>{e.tipo}</Pill>
                      <span className="font-bold !text-[#110e0c]">{e.nombre_sospechoso}</span>
                      <span className="text-sm font-medium !text-[#3b322c]">— {e.descripcion}</span>
                      {e.es_lugar_incidente && <Pill tone="red">Lugar del incidente</Pill>}
                    </div>
                  </li>
                ))}
              </ol>
            ) : (
              <Empty text="Aún no hay eventos de sospechosos interrogados. Los eventos de personas sin interrogar quedan ocultos (los 'agujeros' de la línea de tiempo)." />
            )}
          </Panel>
        </div>
      )}
    </>
  )
}