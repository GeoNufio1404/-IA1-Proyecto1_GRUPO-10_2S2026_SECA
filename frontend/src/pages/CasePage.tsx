import { useEffect, useState } from 'react'
import { api } from '../api/client'
import type { CaseItem, GenericSolution, TimelineEvento } from '../types'
import { Empty, ErrorBox, Loading, Panel, Pill, SectionTitle } from '../components/UI'
import { flattenSolution, prettyId } from '../lib/format'
import { useInterrogatorio } from '../lib/investigationState'

export function CasePage({
  currentCase,
  onGoSuspects,
  onGoAnalysis,
  onGoAccusation,
}: {
  currentCase: CaseItem | null
  onGoSuspects: () => void
  onGoAnalysis: () => void
  onGoAccusation: () => void
}) {
  const { interrogados } = useInterrogatorio(currentCase?.Caso)
  const [opp, setOpp] = useState<GenericSolution[]>([])
  const [totalSuspects, setTotalSuspects] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const [timeline, setTimeline] = useState<TimelineEvento[]>([])
  const [lugarIncidente, setLugarIncidente] = useState<string | null>(null)
  const [loadingTimeline, setLoadingTimeline] = useState(true)
  const [errorTimeline, setErrorTimeline] = useState<string | null>(null)

  useEffect(() => {
    if (!currentCase) return
    setLoading(true)
    Promise.all([api.sospechosos(currentCase.Caso), api.oportunidad(currentCase.Caso)])
      .then(([s, o]) => { setTotalSuspects(s.sospechosos.length); setOpp(o.oportunidad) })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [currentCase])

  useEffect(() => {
    if (!currentCase) return
    setLoadingTimeline(true)
    api.timeline(currentCase.Caso)
      .then(r => { setTimeline(r.eventos); setLugarIncidente(r.lugar_incidente) })
      .catch(e => setErrorTimeline(e.message))
      .finally(() => setLoadingTimeline(false))
  }, [currentCase])

  if (!currentCase) return <Empty text="Selecciona un caso desde Inicio para comenzar." />

  const timelineFiltrado = timeline.filter(e => interrogados.includes(e.sospechoso))

  return (
    <>
      <SectionTitle
        eyebrow="Centro de investigación"
        title={currentCase.Titulo}
        text="Este es tu punto de partida. Desde aquí accedes a los expedientes, cruzas inferencias y formulas tu acusación final."
        action={<Pill tone="green">Caso activo</Pill>}
      />
      <ErrorBox error={error} />
      {loading ? (
        <Loading />
      ) : (
        <>
          {/* Fichas de Pasos de Investigación estilo Expediente */}
          <div className="grid gap-4 md:grid-cols-3">
            {/* Paso 1 */}
            <Panel className="flex flex-col justify-between border-[#5a4d41]/40">
              <div>
                <div className="mb-3 flex items-center justify-between border-b border-[#5a4d41]/30 pb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#3b322c]">Ficha #01</span>
                  <Pill tone="slate">Paso 1</Pill>
                </div>
                <h3 className="mb-2 text-lg font-bold !text-[#110e0c]">Expedientes y sospechosos</h3>
                <p className="text-sm font-medium !text-[#3b322c]">
                  Interroga a cada persona para desbloquear su expediente: accesos, evidencias y contradicciones.
                </p>
              </div>
              <button
                onClick={onGoSuspects}
                className="mt-5 w-full rounded-sm !bg-[#110e0c] px-4 py-2.5 text-sm font-bold !text-white transition-opacity hover:opacity-90"
              >
                Abrir expedientes ({totalSuspects}) →
              </button>
            </Panel>

            {/* Paso 2 */}
            <Panel className="flex flex-col justify-between border-[#5a4d41]/40">
              <div>
                <div className="mb-3 flex items-center justify-between border-b border-[#5a4d41]/30 pb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#3b322c]">Ficha #02</span>
                  <Pill tone="slate">Paso 2</Pill>
                </div>
                <h3 className="mb-2 text-lg font-bold !text-[#110e0c]">Cruzar inferencias</h3>
                <p className="text-sm font-medium !text-[#3b322c]">
                  Motivo, medios, coartadas, contradicciones y línea de tiempo de lo ya interrogado.
                </p>
              </div>
              <button
                onClick={onGoAnalysis}
                className="mt-5 w-full rounded-sm !bg-[#110e0c] px-4 py-2.5 text-sm font-bold !text-white transition-opacity hover:opacity-90"
              >
                Abrir análisis →
              </button>
            </Panel>

            {/* Paso 3 */}
            <Panel className="flex flex-col justify-between border-[#5a4d41]/40">
              <div>
                <div className="mb-3 flex items-center justify-between border-b border-[#5a4d41]/30 pb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#3b322c]">Ficha #03</span>
                  <Pill tone="slate">Paso 3</Pill>
                </div>
                <h3 className="mb-2 text-lg font-bold !text-[#110e0c]">Formular acusación</h3>
                <p className="text-sm font-medium !text-[#3b322c]">
                  Cuando tengas suficientes pistas, acusa al responsable y verifica tu conclusión.
                </p>
              </div>
              <button
                onClick={onGoAccusation}
                className="mt-5 w-full rounded-sm !bg-[#110e0c] px-4 py-2.5 text-sm font-bold !text-white transition-opacity hover:opacity-90"
              >
                Ir a acusación →
              </button>
            </Panel>
          </div>

          {/* Oportunidades Detectadas */}
          <Panel className="mt-4">
            <h3 className="mb-3 font-bold !text-[#110e0c] border-b border-[#5a4d41]/40 pb-1">
              Oportunidad detectada (todos los sospechosos)
            </h3>
            <div className="grid gap-2 md:grid-cols-2">
              {opp.length ? (
                opp.map((x, i) => (
                  <div key={i} className="rounded-sm border border-[#5a4d41]/30 bg-[#f7f3e9] p-3 text-sm font-medium !text-[#110e0c]">
                    {flattenSolution(x)}
                  </div>
                ))
              ) : (
                <Empty text="No hay oportunidades inferidas." />
              )}
            </div>
          </Panel>

          {/* Línea de Tiempo */}
          <Panel className="mt-4">
            <div className="mb-3 flex items-center justify-between border-b border-[#5a4d41]/40 pb-2">
              <h3 className="font-bold !text-[#110e0c]">Línea de tiempo</h3>
              {lugarIncidente && interrogados.length > 0 && <Pill tone="red">Incidente: {prettyId(lugarIncidente)}</Pill>}
            </div>
            <ErrorBox error={errorTimeline} />
            {loadingTimeline ? (
              <Loading />
            ) : timelineFiltrado.length ? (
              <ol className="relative border-l-2 border-[#5a4d41] pl-5">
                {timelineFiltrado.map((e, i) => (
                  <li key={i} className="mb-5 last:mb-0">
                    <span
                      className={`absolute -left-[7px] mt-1.5 h-3 w-3 rounded-full border border-[#110e0c] ${
                        e.es_lugar_incidente ? 'bg-red-600' : e.tipo === 'evidencia' ? 'bg-amber-500' : 'bg-[#110e0c]'
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
              <Empty text="Aún no hay eventos de sospechosos interrogados. Interroga a alguien desde Expedientes para empezar a llenar la línea de tiempo." />
            )}
          </Panel>
        </>
      )}
    </>
  )
}