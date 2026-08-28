import { useEffect, useState } from 'react'
import { api } from '../api/client'
import type { AccusationResponse, CaseItem, SuspectItem } from '../types'
import { Empty, ErrorBox, Loading, Panel, Pill, SectionTitle } from '../components/UI'

export function AccusationPage({
    currentCase,
    acusado,
    onAcusacionRegistrada,
    onGoResult,
}: {
    currentCase: CaseItem | null
    acusado: boolean
    onAcusacionRegistrada: () => void
    onGoResult: () => void
}) {
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
            const r = await api.acusar(currentCase.Caso, chosen.Id)
            setResult(r)
            onAcusacionRegistrada()
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
                action={acusado && !result ? <Pill tone="green">Ya acusaste en este caso</Pill> : undefined}
            />
            <ErrorBox error={error} />
            <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
                <Panel>
                    <h3 className="mb-3 font-bold !text-[#110e0c] border-b border-[#5a4d41]/40 pb-1">Sospechosos</h3>
                    <div className="space-y-2 suspect-list">
                        {suspects.map(s => {
                            const esSeleccionado = chosen?.Id === s.Id
                            return (
                                <button
                                    key={s.Id}
                                    onClick={() => { setChosen(s); setResult(null) }}
                                    className={`suspect-item w-full rounded-sm border-2 p-3 text-left transition-all ${
                                        esSeleccionado 
                                          ? '!bg-[#110e0c] !border-[#110e0c] shadow-md' 
                                          : 'border-[#5a4d41]/40'
                                    }`}
                                >
                                    <div className={`font-bold ${esSeleccionado ? '!text-[#ffffff]' : '!text-[#110e0c]'}`}>
                                        {s.Nombre}
                                    </div>
                                    <div className={`text-xs font-semibold ${esSeleccionado ? '!text-[#d4c5a9]' : '!text-[#5a4d41]'}`}>
                                        {s.Id}
                                    </div>
                                </button>
                            )
                        })}
                    </div>
                    <button
                        onClick={acusar}
                        disabled={!chosen || accusing}
                        className="mt-4 w-full rounded-sm !bg-[#110e0c] px-4 py-2.5 text-sm font-bold !text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                    >
                        {accusing ? 'Analizando…' : chosen ? `Acusar a ${chosen.Nombre}` : 'Elige un sospechoso'}
                    </button>
                    {acusado && (
                        <button
                            onClick={onGoResult}
                            className="mt-2 w-full rounded-sm border border-[#110e0c] bg-[#f2ebd9] px-4 py-2.5 text-sm font-bold !text-[#110e0c] transition-colors hover:bg-[#110e0c] hover:!text-white"
                        >
                            Ver resultado final →
                        </button>
                    )}
                </Panel>
                <div>
                    {accusing ? (
                        <Loading />
                    ) : !result ? (
                        <Empty text="Selecciona a un sospechoso y confirma tu acusación para ver el veredicto." />
                    ) : (
                        <div className="space-y-4">
                            <Panel className={result.correcto ? 'border-emerald-600 bg-emerald-100/80' : 'border-red-600 bg-red-100/80'}>
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                    <div>
                                        <Pill tone={result.correcto ? 'green' : 'red'}>{result.correcto ? 'Acusación correcta' : 'Acusación incorrecta'}</Pill>
                                        <div className="mt-3 text-2xl font-bold !text-[#110e0c]">{chosen?.Nombre}</div>
                                    </div>
                                    <Pill tone={result.nivel_sospecha >= 3 ? 'red' : result.nivel_sospecha >= 2 ? 'amber' : 'slate'}>
                                        Nivel de sospecha: {result.nivel_sospecha}
                                    </Pill>
                                </div>
                                {!result.correcto && result.responsable_logico && (
                                    <p className="mt-3 text-sm font-medium !text-[#110e0c]">
                                        El responsable lógico según Prolog es <strong>{result.responsable_logico}</strong>.
                                    </p>
                                )}
                                <button
                                    onClick={onGoResult}
                                    className="mt-4 rounded-sm !bg-[#110e0c] px-4 py-2.5 text-sm font-bold !text-white transition-opacity hover:opacity-90"
                                >
                                    Ir a Resultado →
                                </button>
                            </Panel>
                            <Panel>
                                <h3 className="mb-3 font-bold !text-[#110e0c] border-b border-[#5a4d41]/40 pb-1">Explicación lógica</h3>
                                {result.explicacion.length
                                    ? result.explicacion.map((x, i) => (
                                        <div key={i} className="mb-2 rounded-sm border border-[#5a4d41]/30 bg-[#f7f3e9] p-3 text-sm font-medium !text-[#110e0c]">{String(x)}</div>
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