import { useEffect, useState } from 'react'
import { api } from '../api/client'
import type { CaseItem, BitacoraEntry } from '../types'
import { Empty, ErrorBox, Loading, Panel, Pill, SectionTitle } from '../components/UI'
import { generarInformePDF } from '../lib/pdf'

export function ResultPage({ currentCase }: { currentCase: CaseItem | null }) {
  const [data, setData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const [bitacora, setBitacora] = useState<BitacoraEntry[]>([])
  const [loadingBitacora, setLoadingBitacora] = useState(false)
  const [errorBitacora, setErrorBitacora] = useState<string | null>(null)

  const [investigaciones, setInvestigaciones] = useState<BitacoraEntry[]>([])
  const [loadingInvestigaciones, setLoadingInvestigaciones] = useState(false)
  const [errorInvestigaciones, setErrorInvestigaciones] = useState<string | null>(null)

  const [selectedEntry, setSelectedEntry] = useState<BitacoraEntry | null>(null)

  const [exportando, setExportando] = useState(false)
  const [errorExport, setErrorExport] = useState<string | null>(null)

  const exportarPDF = async () => {
    if (!currentCase) return
    setExportando(true)
    setErrorExport(null)
    try {
      const informe = await api.informe(currentCase.Caso)
      generarInformePDF(informe)
    } catch (e: any) {
      setErrorExport(e.message)
    } finally {
      setExportando(false)
    }
  }

  useEffect(() => {
    if (!currentCase) return
    setLoading(true)
    Promise.all([
      api.sospechosoPrincipal(currentCase.Caso),
      api.responsable(currentCase.Caso),
      api.complices(currentCase.Caso),
    ])
      .then(([p, r, c]) => setData({ p, r, c }))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [currentCase])

  useEffect(() => {
    if (!currentCase) { setBitacora([]); return }
    setLoadingBitacora(true)
    api.getBitacora(currentCase.Caso)
      .then(r => setBitacora(r.entradas))
      .catch(e => setErrorBitacora(e.message))
      .finally(() => setLoadingBitacora(false))
  }, [currentCase])

  useEffect(() => {
    setLoadingInvestigaciones(true)
    api.getInvestigaciones()
      .then(r => setInvestigaciones(r.investigaciones))
      .catch(e => setErrorInvestigaciones(e.message))
      .finally(() => setLoadingInvestigaciones(false))
  }, [])

  if (!currentCase) return <Empty text="Selecciona un caso para ver su resultado lógico." />

  const tabla = (
    titulo: string,
    entradas: BitacoraEntry[],
    loadingFlag: boolean,
    errorFlag: string | null,
    emptyText: string,
    mostrarCaso: boolean,
  ) => (
    <Panel>
      <h3 className="mb-3 font-semibold text-gray-900">{titulo}</h3>
      <ErrorBox error={errorFlag} />
      {loadingFlag ? (
        <Loading />
      ) : entradas.length ? (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="border-b bg-gray-50 text-xs uppercase text-gray-700">
              <tr>
                <th scope="col" className="px-4 py-3">Fecha / Hora</th>
                {mostrarCaso && <th scope="col" className="px-4 py-3">Caso</th>}
                <th scope="col" className="px-4 py-3">Tipo</th>
                <th scope="col" className="px-4 py-3">Sospechoso</th>
                <th scope="col" className="px-4 py-3">Resultado</th>
                <th scope="col" className="px-4 py-3">Detalle</th>
              </tr>
            </thead>
            <tbody>
              {entradas.map((entry, idx) => (
                <tr key={entry.id || idx} className="border-b hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {entry.timestamp ? new Date(entry.timestamp).toLocaleString() : 'N/A'}
                  </td>
                  {mostrarCaso && <td className="px-4 py-3">{entry.caso}</td>}
                  <td className="px-4 py-3">{entry.tipo}</td>
                  <td className="px-4 py-3">{entry.sospechoso ?? '—'}</td>
                  <td className="px-4 py-3">
                    {entry.correcto === null ? (
                      <Pill tone="slate">N/A</Pill>
                    ) : (
                      <Pill tone={entry.correcto ? 'green' : 'red'}>
                        {entry.correcto ? 'Correcto' : 'Incorrecto'}
                      </Pill>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => setSelectedEntry(entry)}
                      className="font-medium text-blue-600 hover:underline"
                    >
                      Ver detalle
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <Empty text={emptyText} />
      )}
    </Panel>
  )

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
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="font-semibold text-gray-900">Informe final</h3>
                <p className="mt-1 text-sm text-gray-500">Descarga el informe con conclusión, explicación, evidencias, contradicciones y bitácora del caso.</p>
              </div>
              <button
                onClick={exportarPDF}
                disabled={exportando}
                className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:opacity-50"
              >
                {exportando ? 'Generando…' : 'Exportar informe a PDF'}
              </button>
            </div>
            <ErrorBox error={errorExport} />
          </Panel>

          {tabla('Bitácora de este caso', bitacora, loadingBitacora, errorBitacora, 'No hay eventos registrados para este caso.', false)}
          {tabla('Historial de investigaciones (todos los casos)', investigaciones, loadingInvestigaciones, errorInvestigaciones, 'Aún no hay acusaciones registradas.', true)}
        </div>
      )}

      {selectedEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-lg font-semibold text-gray-900">Detalle de entrada</h3>
              <button type="button" onClick={() => setSelectedEntry(null)} className="text-gray-400 hover:text-gray-600 font-bold">Cerrar</button>
            </div>
            <div className="space-y-2 text-sm text-gray-700">
              <p><strong>Timestamp:</strong> {selectedEntry.timestamp}</p>
              <p><strong>Caso:</strong> {selectedEntry.caso}</p>
              <p><strong>Tipo:</strong> {selectedEntry.tipo}</p>
              <p><strong>Sospechoso:</strong> {selectedEntry.sospechoso ?? '—'}</p>
              <p><strong>Nivel de sospecha:</strong> {selectedEntry.nivel_sospecha ?? '—'}</p>
              <p><strong>Detalle:</strong> {selectedEntry.detalle}</p>
            </div>
            <div className="flex justify-end pt-2">
              <button type="button" onClick={() => setSelectedEntry(null)} className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800">Aceptar</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}