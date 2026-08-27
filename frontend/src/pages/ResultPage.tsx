import { useEffect, useState } from 'react'
import { api } from '../api/client'
import type { CaseItem, BitacoraEntry } from '../types'
import { Empty, ErrorBox, Loading, Panel, Pill, SectionTitle } from '../components/UI'

export function ResultPage({ currentCase }: { currentCase: CaseItem | null }) {
  const [data, setData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const [bitacora, setBitacora] = useState<BitacoraEntry[]>([])
  const [loadingBitacora, setLoadingBitacora] = useState(false)
  const [errorBitacora, setErrorBitacora] = useState<string | null>(null)
  const [selectedEntry, setSelectedEntry] = useState<BitacoraEntry | null>(null)

  useEffect(() => {
    if (!currentCase) return
    setLoading(true)
    Promise.all([
      api.sospechosoPrincipal(currentCase.Caso),
      api.responsable(currentCase.Caso),
      api.complices(currentCase.Caso)
    ])
      .then(([p, r, c]) => setData({ p, r, c }))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [currentCase])

  useEffect(() => {
    setLoadingBitacora(true)
    api.getBitacora()
      .then((entries: BitacoraEntry[]) => {
        setBitacora(Array.isArray(entries) ? [...entries].reverse() : [])
      })
      .catch(e => setErrorBitacora(e.message))
      .finally(() => setLoadingBitacora(false))
  }, [])

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
            <h3 className="mb-3 font-semibold text-gray-900">Bitácora e Historial de Investigaciones</h3>
            <ErrorBox error={errorBitacora} />
            {loadingBitacora ? (
              <Loading />
            ) : bitacora.length ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-600">
                  <thead className="border-b bg-gray-50 text-xs uppercase text-gray-700">
                    <tr>
                      <th scope="col" className="px-4 py-3">Fecha / Hora</th>
                      <th scope="col" className="px-4 py-3">Caso / Sospechoso</th>
                      <th scope="col" className="px-4 py-3">Resultado</th>
                      <th scope="col" className="px-4 py-3">Detalle</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bitacora.map((entry, idx) => (
                      <tr key={entry.id || idx} className="border-b hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 font-medium text-gray-900">
                          {entry.timestamp ? new Date(entry.timestamp).toLocaleString() : 'N/A'}
                        </td>
                        <td className="px-4 py-3">
                          {entry.sospechoso || entry.caso_id || currentCase.Caso}
                        </td>
                        <td className="px-4 py-3">
                          <Pill tone={entry.resultado?.toLowerCase().includes('culpable') ? 'red' : 'green'}>
                            {entry.resultado || 'Procesado'}
                          </Pill>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            type="button"
                            onClick={() => setSelectedEntry(entry)}
                            className="font-medium text-blue-600 hover:underline"
                          >
                            Ver consulta
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <Empty text="No se registran eventos guardados en la bitácora." />
            )}
          </Panel>
        </div>
      )}

      {selectedEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-2xl rounded-xl bg-white p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-lg font-semibold text-gray-900">Detalle de entrada en Bitácora</h3>
              <button
                type="button"
                onClick={() => setSelectedEntry(null)}
                className="text-gray-400 hover:text-gray-600 font-bold"
              >
                Cerrar
              </button>
            </div>
            <div className="space-y-3 text-sm text-gray-700">
              <p><strong>Timestamp:</strong> {selectedEntry.timestamp}</p>
              <p><strong>Caso / Identificador:</strong> {selectedEntry.caso_id || selectedEntry.sospechoso || 'N/A'}</p>
              <p><strong>Resultado obtenido:</strong> {selectedEntry.resultado}</p>
              {selectedEntry.reglas_aplicadas && selectedEntry.reglas_aplicadas.length > 0 && (
                <div>
                  <strong className="block mb-1">Reglas evaluadas:</strong>
                  <ul className="list-disc list-inside rounded-lg bg-gray-50 p-3 font-mono text-xs text-gray-800 space-y-1">
                    {selectedEntry.reglas_aplicadas.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>
              )}
              {selectedEntry.detalles && (
                <div>
                  <strong className="block mb-1">Estructura adicional:</strong>
                  <pre className="overflow-x-auto rounded-lg bg-gray-50 p-3 font-mono text-xs text-gray-800">
                    {JSON.stringify(selectedEntry.detalles, null, 2)}
                  </pre>
                </div>
              )}
            </div>
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setSelectedEntry(null)}
                className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
              >
                Aceptar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}