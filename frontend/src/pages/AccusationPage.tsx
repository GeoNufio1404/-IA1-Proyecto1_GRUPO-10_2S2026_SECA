import { useEffect, useState } from 'react'
import { api } from '../api/client'
import type { AccusationResponse, CaseItem, SuspectItem } from '../types'
import { Empty, ErrorBox, Loading, Panel, Pill, SectionTitle } from '../components/UI'

export function AccusationPage({ currentCase }: { currentCase: CaseItem | null }) {
    const [suspects, setSuspects] = useState<SuspectItem[]>([])
    const [chosen, setChosen] = useState<SuspectItem | null>(null)
    const [result, setResult] = useState<AccusationResponse | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [accusing, setAccusing] = useState(false)

    useEffect(() => {
        setChosen(null)
        setResult(null)
        if (currentCase) api.sospechosos(currentCase.Caso).then(r => setSuspects(r.sospechosos)).catch(e => setError(e.message))
    }, [currentCase])

    const acusar = async () => {
        if (!currentCase || !chosen) return
        setAccusing(true)
        setError(null)
        try {
            setResult(await api.acusar(currentCase.Caso, chosen.Id))
        } catch (e: any) {
            setError(e.message)
        } finally {
            setAccusing(false)
        }
    }

    if (!currentCase) return <Empty text="Selecciona un caso antes de formular tu acusación." />

    return (
        <>
            <SectionTitle
                eyebrow="Veredicto"
                title="Acusación final"
                text="Elige a quién acusas. El motor de Prolog confirma si tu conclusión coincide con el responsable lógico y muestra la explicación completa."
            />
            <ErrorBox error={error} />
            <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
                <Panel>
                    <h3 className="mb-3 font-semibold text-gray-900">Sospechosos</h3>
                    <div className="space-y-2">
                        {suspects.map(s => (
                            <button
                                key={s.Id}
                                onClick={() => { setChosen(s); setResult(null) }}
                                className={`w-full rounded-lg border p-3 text-left transition-colors ${chosen?.Id === s.Id ? 'border-indigo-300 bg-indigo-50' : 'border-gray-200 bg-white hover:border-gray-300'
                                    }`}
                            >
                                <div className="font-medium text-gray-900">{s.Nombre}</div>
                                <div className="text-xs text-gray-400">{s.Id}</div>
                            </button>
                        ))}
                    </div>
                    <button
                        onClick={acusar}
                        disabled={!chosen || accusing}
                        className="mt-4 w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:opacity-50"
                    >
                        {accusing ? 'Analizando…' : chosen ? `Acusar a ${chosen.Nombre}` : 'Elige un sospechoso'}
                    </button>
                </Panel>
                <div>
                    {accusing ? (
                        <Loading />
                    ) : !result ? (
                        <Empty text="Selecciona a un sospechoso y confirma tu acusación para ver el veredicto." />
                    ) : (
                        <div className="space-y-4">
                            <Panel className={result.correcto ? 'border-emerald-200 bg-emerald-50/40' : 'border-red-200 bg-red-50/40'}>
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                    <div>
                                        <Pill tone={result.correcto ? 'green' : 'red'}>{result.correcto ? 'Acusación correcta' : 'Acusación incorrecta'}</Pill>
                                        <div className="mt-3 text-2xl font-semibold text-gray-900">{chosen?.Nombre}</div>
                                    </div>
                                    <Pill tone={result.nivel_sospecha >= 3 ? 'red' : result.nivel_sospecha >= 2 ? 'amber' : 'slate'}>
                                        Nivel de sospecha: {result.nivel_sospecha}
                                    </Pill>
                                </div>
                                {!result.correcto && result.responsable_logico && (
                                    <p className="mt-3 text-sm text-gray-600">
                                        El responsable lógico según Prolog es <strong>{result.responsable_logico}</strong>.
                                    </p>
                                )}
                            </Panel>
                            <Panel>
                                <h3 className="mb-3 font-semibold text-gray-900">Explicación lógica</h3>
                                {result.explicacion.length
                                    ? result.explicacion.map((x, i) => (
                                        <div key={i} className="mb-2 rounded-lg border border-indigo-100 bg-indigo-50 p-3 text-sm text-indigo-800">{String(x)}</div>
                                    ))
                                    : <Empty text="El motor no reportó razones específicas para esta persona." />}
                            </Panel>
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}