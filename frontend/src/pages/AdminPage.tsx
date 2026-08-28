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
      <span className="mb-1 block text-xs font-bold uppercase text-[#5a4d41]">{label}</span>
      <input
        value={f[key] || ''}
        onChange={e => setF({ ...f, [key]: e.target.value })}
        placeholder={placeholder}
        required
        className="w-full rounded-sm border border-[#5a4d41] bg-[#f7f3e9] px-3 py-2.5 text-sm font-medium text-[#110e0c] outline-none focus:border-[#110e0c] focus:ring-1 focus:ring-[#110e0c]"
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
      {success && <div className="mb-4 rounded-sm border border-emerald-600 bg-emerald-100 p-3 text-sm font-bold text-emerald-950">{success}</div>}
      <div className="grid gap-4 lg:grid-cols-[300px_1fr]">
        <Panel>
          <h3 className="mb-3 font-bold !text-[#110e0c] border-b border-[#5a4d41]/40 pb-1">Operación</h3>
          <div className="space-y-1 suspect-list">
            {actions.map(([id, label]) => {
              const esSeleccionado = action === id
              return (
                <button
                  key={id}
                  onClick={() => { setAction(id); setF({}); setError(null); setSuccess(null) }}
                  className={`suspect-item w-full rounded-sm border-2 p-2.5 text-left text-sm font-bold transition-all ${
                    esSeleccionado 
                      ? '!bg-[#110e0c] !border-[#110e0c] !text-white shadow-md' 
                      : 'border-[#5a4d41]/40 !text-[#110e0c]'
                  }`}
                >
                  {label}
                </button>
              )
            })}
          </div>
        </Panel>
        <Panel>
          <div className="mb-5 flex items-center justify-between border-b border-[#5a4d41]/40 pb-3">
            <div>
              <h3 className="font-bold !text-[#110e0c] text-lg uppercase tracking-wide">{actions.find(x => x[0] === action)?.[1]}</h3>
              <p className="text-xs font-semibold text-[#5a4d41]">Endpoint administrativo</p>
            </div>
            <Pill tone="amber">POST</Pill>
          </div>
          <form onSubmit={submit} className="space-y-4">
            {action !== 'caso' && (
              <label className="block">
                <span className="mb-1 block text-xs font-bold uppercase text-[#5a4d41]">Caso</span>
                <select 
                  value={caseId} 
                  onChange={e => setCaseId(e.target.value)} 
                  className="w-full rounded-sm border border-[#5a4d41] bg-[#f7f3e9] px-3 py-2.5 text-sm font-medium text-[#110e0c]"
                >
                  {cases.map(c => <option key={c.Caso} value={c.Caso}>{c.Titulo} ({c.Caso})</option>)}
                </select>
              </label>
            )}
            {fields()}
            <button 
              disabled={saving} 
              className="w-full rounded-sm !bg-[#110e0c] px-4 py-2.5 text-sm font-bold !text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {saving ? 'Guardando…' : 'Ejecutar operación'}
            </button>
          </form>
        </Panel>
      </div>
    </>
  )
}