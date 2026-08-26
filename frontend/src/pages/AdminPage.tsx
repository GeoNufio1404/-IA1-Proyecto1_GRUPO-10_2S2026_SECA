import { useEffect, useState, type FormEvent } from 'react'
import { api } from '../api/client'
import type { CaseItem } from '../types'
import { ErrorBox, Panel, Pill, SectionTitle } from '../components/UI'

type Action = 'caso' | 'sospechoso' | 'lugar' | 'incidente' | 'evidencia' | 'declaracion' | 'motivo' | 'medios' | 'acceso' | 'contraEvidencia' | 'contraDeclaracion' | 'senala'
const actions: [Action, string][] = [
  ['caso', 'Crear caso'], ['sospechoso', 'Sospechoso'], ['lugar', 'Lugar'], ['incidente', 'Lugar incidente'],
  ['evidencia', 'Evidencia'], ['declaracion', 'Declaración'], ['motivo', 'Motivo'], ['medios', 'Medios'],
  ['acceso', 'Acceso'], ['contraEvidencia', 'Contradicción evidencia'], ['contraDeclaracion', 'Contradicción declaraciones'], ['senala', 'Evidencia señala'],
]

export function AdminPage({ currentCase, onCaseCreated }: { currentCase: CaseItem | null; onCaseCreated: (c: CaseItem) => void }) {
  const [action, setAction] = useState<Action>('caso')
  const [cases, setCases] = useState<CaseItem[]>([])
  const [caseId, setCaseId] = useState(currentCase?.Caso || '')
  const [f, setF] = useState<Record<string, string>>({})
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    api.casos().then(r => { setCases(r.casos); if (!caseId && r.casos[0]) setCaseId(r.casos[0].Caso) }).catch(e => setError(e.message))
  }, [])

  const input = (key: string, label: string, placeholder = '') => (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-gray-500">{label}</span>
      <input
        value={f[key] || ''}
        onChange={e => setF({ ...f, [key]: e.target.value })}
        placeholder={placeholder}
        required
        className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition-colors focus:border-indigo-400 focus:ring-1 focus:ring-indigo-100"
      />
    </label>
  )

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setSaving(true)
    try {
      let r: any
      switch (action) {
        case 'caso': r = await api.crearCaso({ id: f.id, titulo: f.titulo }); onCaseCreated({ Caso: f.id, Titulo: f.titulo }); break
        case 'sospechoso': r = await api.crearSospechoso(caseId, { id: f.id, nombre: f.nombre }); break
        case 'lugar': r = await api.crearLugar(caseId, { id: f.id, nombre: f.nombre }); break
        case 'incidente': r = await api.definirLugarIncidente(caseId, { lugar_id: f.lugar_id }); break
        case 'evidencia': r = await api.crearEvidencia(caseId, { id: f.id, descripcion: f.descripcion, lugar: f.lugar }); break
        case 'declaracion': r = await api.crearDeclaracion(caseId, { id: f.id, sospechoso: f.sospechoso, texto: f.texto }); break
        case 'motivo': r = await api.crearMotivo(caseId, { sospechoso: f.sospechoso, detalle: f.detalle }); break
        case 'medios': r = await api.crearMedios(caseId, { sospechoso: f.sospechoso, detalle: f.detalle }); break
        case 'acceso': r = await api.crearAcceso(caseId, { sospechoso: f.sospechoso, lugar: f.lugar, hora: f.hora }); break
        case 'contraEvidencia': r = await api.crearContradiccionEvidencia(caseId, { declaracion_id: f.declaracion_id, evidencia_id: f.evidencia_id }); break
        case 'contraDeclaracion': r = await api.crearContradiccionDeclaracion(caseId, { declaracion_a: f.declaracion_a, declaracion_b: f.declaracion_b }); break
        case 'senala': r = await api.marcarEvidencia(caseId, f.evidencia_id, { evidencia_id: f.evidencia_id, sospechoso: f.sospechoso }); break
      }
      setSuccess(`Operación completada: ${JSON.stringify(r)}`)
      setF({})
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const fields = () => {
    switch (action) {
      case 'caso': return <>{input('id', 'ID del caso', 'caso4')}{input('titulo', 'Título', 'El caso del laboratorio')}</>
      case 'sospechoso': return <>{input('id', 'ID', 'ana_lopez')}{input('nombre', 'Nombre', 'Ana López')}</>
      case 'lugar': return <>{input('id', 'ID del lugar', 'biblioteca')}{input('nombre', 'Nombre', 'Biblioteca')}</>
      case 'incidente': return input('lugar_id', 'ID del lugar incidente', 'laboratorio')
      case 'evidencia': return <>{input('id', 'ID evidencia', 'ev11')}{input('descripcion', 'Descripción')}{input('lugar', 'ID del lugar')}</>
      case 'declaracion': return <>{input('id', 'ID declaración', 'decl7')}{input('sospechoso', 'ID sospechoso')}{input('texto', 'Declaración')}</>
      case 'motivo':
      case 'medios': return <>{input('sospechoso', 'ID sospechoso')}{input('detalle', 'Detalle')}</>
      case 'acceso': return <>{input('sospechoso', 'ID sospechoso')}{input('lugar', 'ID lugar')}{input('hora', 'Hora HH:MM', '23:45')}</>
      case 'contraEvidencia': return <>{input('declaracion_id', 'ID declaración')}{input('evidencia_id', 'ID evidencia')}</>
      case 'contraDeclaracion': return <>{input('declaracion_a', 'Declaración A')}{input('declaracion_b', 'Declaración B')}</>
      case 'senala': return <>{input('evidencia_id', 'ID evidencia')}{input('sospechoso', 'ID sospechoso')}</>
    }
  }

  return (
    <>
      <SectionTitle
        eyebrow="Módulo administrativo"
        title="Base de conocimiento"
        text="Panel para consumir todos los endpoints POST creados actualmente en FastAPI. Los cambios se aplican a la base cargada por Prolog durante la ejecución."
      />
      <ErrorBox error={error} />
      {success && <div className="mb-4 rounded-lg border border-emerald-100 bg-emerald-50 p-3 text-sm text-emerald-700">{success}</div>}
      <div className="grid gap-4 lg:grid-cols-[300px_1fr]">
        <Panel>
          <h3 className="mb-3 font-semibold text-gray-900">Operación</h3>
          <div className="space-y-1">
            {actions.map(([id, label]) => (
              <button
                key={id}
                onClick={() => { setAction(id); setF({}); setError(null); setSuccess(null) }}
                className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${action === id ? 'bg-indigo-50 font-medium text-indigo-700' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                {label}
              </button>
            ))}
          </div>
        </Panel>
        <Panel>
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900">{actions.find(x => x[0] === action)?.[1]}</h3>
              <p className="text-xs text-gray-400">Endpoint administrativo</p>
            </div>
            <Pill tone="amber">POST</Pill>
          </div>
          <form onSubmit={submit} className="space-y-4">
            {action !== 'caso' && (
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-gray-500">Caso</span>
                <select value={caseId} onChange={e => setCaseId(e.target.value)} className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900">
                  {cases.map(c => <option key={c.Caso} value={c.Caso}>{c.Titulo} ({c.Caso})</option>)}
                </select>
              </label>
            )}
            {fields()}
            <button disabled={saving} className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:opacity-50">
              {saving ? 'Guardando…' : 'Ejecutar operación'}
            </button>
          </form>
        </Panel>
      </div>
    </>
  )
}

