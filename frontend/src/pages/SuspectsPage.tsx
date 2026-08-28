import { useEffect, useState } from 'react'
import { api } from '../api/client'
import type { CaseItem, SuspectItem, DeclaracionItem } from '../types'
import { Empty, ErrorBox, Loading, Panel, Pill, SectionTitle } from '../components/UI'
import { useInterrogatorio } from '../lib/investigationState'

export function SuspectsPage({ currentCase, selected, onSelect }: { currentCase: CaseItem | null; selected: SuspectItem | null; onSelect: (s: SuspectItem) => void }) {
  const [list, setList] = useState<SuspectItem[]>([])
  const [error, setError] = useState<string | null>(null)
  const { estaInterrogado, marcar } = useInterrogatorio(currentCase?.Caso)

  useEffect(() => {
    if (currentCase) api.sospechosos(currentCase.Caso).then(r => setList(r.sospechosos)).catch(e => setError(e.message))
  }, [currentCase])

  if (!currentCase) return <Empty text="Selecciona primero un caso." />

  return (
    <>
      <SectionTitle
        eyebrow="Expedientes"
        title="Sospechosos"
        text="Interroga a cada persona para desbloquear su expediente: accesos, evidencias, contradicciones y nivel de sospecha."
      />
      <ErrorBox error={error} />
      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        <Panel>
          <div className="space-y-2 suspect-list">
            {list.map(s => {
              const desbloqueado = estaInterrogado(s.Id)
              const esSeleccionado = selected?.Id === s.Id
              
              return (
                <button
                  key={s.Id}
                  onClick={() => onSelect(s)}
                  className={`suspect-item w-full rounded-sm border-2 p-3 text-left transition-all ${
                    esSeleccionado 
                      ? '!bg-[#110e0c] !border-[#110e0c] shadow-md' 
                      : 'border-[#5a4d41]/40'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className={`font-bold ${esSeleccionado ? '!text-[#ffffff]' : '!text-[#110e0c]'}`}>
                      {s.Nombre}
                    </div>
                    {desbloqueado ? <Pill tone="green">Interrogado</Pill> : <Pill tone="red">Bloqueado</Pill>}
                  </div>
                  <div className={`text-xs font-semibold ${esSeleccionado ? '!text-[#d4c5a9]' : '!text-[#5a4d41]'}`}>
                    {s.Id}
                  </div>
                </button>
              )
            })}
          </div>
        </Panel>
        <div>
          {!selected ? (
            <Empty text="Elige un sospechoso para comenzar." />
          ) : estaInterrogado(selected.Id) ? (
            <ExpedienteDetalle caso={currentCase.Caso} sospechoso={selected} />
          ) : (
            <Interrogatorio caso={currentCase.Caso} sospechoso={selected} onFinalizado={() => marcar(selected.Id)} />
          )}
        </div>
      </div>
    </>
  )
}

function Interrogatorio({ caso, sospechoso, onFinalizado }: { caso: string; sospechoso: SuspectItem; onFinalizado: () => void }) {
  const [declaraciones, setDeclaraciones] = useState<DeclaracionItem[]>([])
  const [revealed, setRevealed] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [registrando, setRegistrando] = useState(false)

  useEffect(() => {
    setRevealed(0)
    setLoading(true)
    setError(null)
    api.declaraciones(caso, sospechoso.Id)
      .then(r => setDeclaraciones(r.declaraciones))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [caso, sospechoso.Id])

  const siguiente = () => setRevealed(r => Math.min(r + 1, declaraciones.length))
  const terminado = declaraciones.length > 0 && revealed >= declaraciones.length

  const finalizar = async () => {
    setRegistrando(true)
    setError(null)
    const contradicciones = declaraciones.filter(d => d.contradicha).length
    try {
      await api.registrarBitacora(caso, {
        tipo: 'interrogatorio',
        sospechoso: sospechoso.Id,
        detalle: `Interrogatorio a ${sospechoso.Nombre}: ${declaraciones.length} declaración(es) revisadas, ${contradicciones} contradicción(es) detectada(s).`,
      })
      onFinalizado()
    } catch (e: any) {
      setError(e.message)
    } finally {
      setRegistrando(false)
    }
  }

  if (loading) return <Loading />

  return (
    <Panel>
      <ErrorBox error={error} />
      <div className="mb-4 flex items-center justify-between border-b border-[#5a4d41] pb-2">
        <h3 className="font-bold !text-[#110e0c]">Interrogando a {sospechoso.Nombre}</h3>
        {declaraciones.length > 0 && <Pill tone="slate">{revealed}/{declaraciones.length}</Pill>}
      </div>

      {!declaraciones.length ? (
        <>
          <Empty text="Esta persona no tiene declaraciones registradas en el caso." />
          <button onClick={finalizar} disabled={registrando} className="mt-4 rounded-sm !bg-[#110e0c] px-4 py-2.5 text-sm font-bold !text-white hover:opacity-90 disabled:opacity-50">
            {registrando ? 'Registrando…' : 'Marcar como interrogado y desbloquear expediente'}
          </button>
        </>
      ) : (
        <>
          <div className="space-y-3">
            {declaraciones.slice(0, revealed).map((d, i) => (
              <div key={d.id} className="space-y-1">
                <div className="ml-auto max-w-[85%] rounded-sm border border-[#110e0c] !bg-[#110e0c] px-4 py-2.5 text-sm !text-white font-medium shadow-sm">
                  Detective: pregunta {i + 1}, ¿qué recuerda de esa noche?
                </div>
                <div className={`mr-auto max-w-[85%] rounded-sm border px-4 py-2.5 text-sm font-medium ${
                  d.contradicha 
                    ? 'border-red-600 bg-red-100 !text-red-950' 
                    : 'border-[#5a4d41] bg-[#fdfbf7] !text-[#110e0c]'
                }`}>
                  {d.contenido}
                  {d.contradicha && <div className="mt-1"><Pill tone="red">Contradicha por la evidencia</Pill></div>}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5">
            {!terminado ? (
              <button onClick={siguiente} className="rounded-sm !bg-[#110e0c] px-4 py-2.5 text-sm font-bold !text-white hover:opacity-90">
                Siguiente pregunta →
              </button>
            ) : (
              <button onClick={finalizar} disabled={registrando} className="rounded-sm !bg-[#110e0c] px-4 py-2.5 text-sm font-bold !text-white hover:opacity-90 disabled:opacity-50">
                {registrando ? 'Registrando…' : 'Finalizar y desbloquear expediente'}
              </button>
            )}
          </div>
        </>
      )}
    </Panel>
  )
}

function ExpedienteDetalle({ caso, sospechoso }: { caso: string; sospechoso: SuspectItem }) {
  const [details, setDetails] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    Promise.all([
      api.accesos(caso, sospechoso.Id),
      api.evidencias(caso, sospechoso.Id),
      api.totalEvidencias(caso, sospechoso.Id),
      api.nivelSospecha(caso, sospechoso.Id),
      api.contradiccionesEvidencia(caso, sospechoso.Id),
      api.explicacion(caso, sospechoso.Id),
    ]).then(([a, e, t, n, c, x]) => setDetails({ a, e, t, n, c, x })).catch(e => setError(e.message)).finally(() => setLoading(false))
  }, [caso, sospechoso.Id])

  if (loading) return <Loading />
  if (error) return <ErrorBox error={error} />
  if (!details) return null

  return (
    <div className="space-y-4">
      <Panel>
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#5a4d41] pb-3">
          <div>
            <div className="text-xl font-bold !text-[#110e0c] uppercase tracking-wider">{sospechoso.Nombre}</div>
            <div className="text-sm font-bold !text-[#5a4d41]">{sospechoso.Id}</div>
          </div>
          <Pill tone={details.n.nivel_sospecha >= 70 ? 'red' : details.n.nivel_sospecha >= 40 ? 'amber' : 'green'}>
            Sospecha: {details.n.nivel_sospecha}
          </Pill>
        </div>
      </Panel>
      <div className="grid gap-4 md:grid-cols-2">
        <Panel>
          <h3 className="mb-3 font-bold !text-[#110e0c] border-b border-[#5a4d41]/40 pb-1">Accesos registrados</h3>
          {details.a.lugares.length
            ? details.a.lugares.map((x: any, i: number) => <div className="mb-2 rounded-sm border border-[#7a6a5c]/30 bg-[#f7f3e9] p-2.5 text-sm font-medium !text-[#110e0c]" key={i}>{String(x.Lugar ?? Object.values(x)[0])}</div>)
            : <Empty />}
        </Panel>
        <Panel>
          <h3 className="mb-3 font-bold !text-[#110e0c] border-b border-[#5a4d41]/40 pb-1">Evidencias relacionadas <Pill>{details.t.total_evidencias}</Pill></h3>
          {details.e.evidencias.length
            ? details.e.evidencias.map((x: any, i: number) => <div className="mb-2 rounded-sm border border-[#7a6a5c]/30 bg-[#f7f3e9] p-2.5 text-sm font-medium !text-[#110e0c]" key={i}>{String(x.Evidencia ?? Object.values(x)[0])}</div>)
            : <Empty />}
        </Panel>
        <Panel>
          <h3 className="mb-3 font-bold !text-[#110e0c] border-b border-[#5a4d41]/40 pb-1">Contradicciones</h3>
          {details.c.contradicciones.length
            ? details.c.contradicciones.map((x: any, i: number) => <div className="mb-2 rounded-sm border border-red-300 bg-red-100 p-2.5 text-sm font-bold !text-red-950" key={i}>{String(x.Evidencia ?? Object.values(x)[0])}</div>)
            : <Empty />}
        </Panel>
        <Panel>
          <h3 className="mb-3 font-bold !text-[#110e0c] border-b border-[#5a4d41]/40 pb-1">Explicación lógica</h3>
          {details.x.explicacion.length
            ? details.x.explicacion.map((x: any, i: number) => <div className="mb-2 rounded-sm border border-[#5a4d41]/30 bg-[#f7f3e9] p-2.5 text-sm font-medium !text-[#110e0c]" key={i}>{String(x)}</div>)
            : <Empty text="El motor aún no reporta razones para esta persona." />}
        </Panel>
      </div>
    </div>
  )
}