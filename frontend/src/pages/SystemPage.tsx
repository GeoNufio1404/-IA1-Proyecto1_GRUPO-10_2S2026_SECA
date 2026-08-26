import { useEffect, useState } from 'react'
import { api } from '../api/client'
import type { HealthResponse } from '../types'
import { ErrorBox, Loading, Panel, Pill, SectionTitle } from '../components/UI'

export function SystemPage() {
  const [h, setH] = useState<HealthResponse | null>(null)
  const [e, setE] = useState<string | null>(null)

  useEffect(() => { api.health().then(setH).catch(x => setE(x.message)) }, [])

  return (
    <>
      <SectionTitle eyebrow="Diagnóstico" title="Estado del sistema" text="Verifica la comunicación React → FastAPI → PySwip → SWI-Prolog." />
      <ErrorBox error={e} />
      {!h && !e ? (
        <Loading />
      ) : h && (
        <Panel>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Metric k="API" v={h.status} />
            <Metric k="Versión" v={h.version} />
            <Metric k="Base" v={h.knowledge_base} />
            <Metric k="KB versión" v={h.kb_version || '—'} />
            <Metric k="Predicados" v={String(h.kb_predicates ?? '—')} />
            <div className="rounded-lg bg-gray-50 p-4">
              <div className="text-xs text-gray-400">Prolog</div>
              <div className="mt-2"><Pill tone={h.prolog_ok ? 'green' : 'red'}>{h.prolog_ok ? 'Operativo' : 'Sin respuesta'}</Pill></div>
            </div>
          </div>
        </Panel>
      )}
    </>
  )
}

function Metric({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded-lg bg-gray-50 p-4">
      <div className="text-xs text-gray-400">{k}</div>
      <div className="mt-1 font-semibold text-gray-900">{v}</div>
    </div>
  )
}
