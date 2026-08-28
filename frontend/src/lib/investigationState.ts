import { useCallback, useEffect, useState } from 'react'

const STORAGE_KEY = 'ld_interrogatorio'

interface EstadoInterrogatorio {
  caso: string
  interrogados: string[]
}

function leer(): EstadoInterrogatorio | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function escribir(estado: EstadoInterrogatorio) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(estado))
}

// Si el caso guardado no coincide con el actual, el estado se considera
// vacio: asi es como "se reinicia completamente" al cambiar de caso.
function getInterrogados(caso: string): string[] {
  const estado = leer()
  if (!estado || estado.caso !== caso) return []
  return estado.interrogados
}

function marcarInterrogado(caso: string, sospechosoId: string) {
  const actuales = getInterrogados(caso)
  if (actuales.includes(sospechosoId)) return
  escribir({ caso, interrogados: [...actuales, sospechosoId] })
}

/** Hook para leer/actualizar quien ya fue interrogado en el caso actual. */
export function useInterrogatorio(caso: string | undefined) {
  const [interrogados, setInterrogados] = useState<string[]>(() => (caso ? getInterrogados(caso) : []))

  useEffect(() => {
    setInterrogados(caso ? getInterrogados(caso) : [])
  }, [caso])

  const marcar = useCallback((sospechosoId: string) => {
    if (!caso) return
    marcarInterrogado(caso, sospechosoId)
    setInterrogados(getInterrogados(caso))
  }, [caso])

  const estaInterrogado = useCallback((id: string) => interrogados.includes(id), [interrogados])

  return { interrogados, marcar, estaInterrogado }
}

const ACUSACION_KEY = 'ld_acusacion'

interface EstadoAcusacion {
  caso: string
  acusado: true
}

function getAcusacionRealizada(caso: string): boolean {
  try {
    const raw = sessionStorage.getItem(ACUSACION_KEY)
    if (!raw) return false
    const estado = JSON.parse(raw) as EstadoAcusacion
    return estado.caso === caso && estado.acusado === true
  } catch {
    return false
  }
}

function marcarAcusacionRealizada(caso: string) {
  sessionStorage.setItem(ACUSACION_KEY, JSON.stringify({ caso, acusado: true }))
}

/** Hook para saber si ya se formulo una acusacion en el caso actual, y para marcarla. */
export function useAcusacion(caso: string | undefined) {
  const [acusado, setAcusado] = useState(() => (caso ? getAcusacionRealizada(caso) : false))

  useEffect(() => {
    setAcusado(caso ? getAcusacionRealizada(caso) : false)
  }, [caso])

  const marcar = useCallback(() => {
    if (!caso) return
    marcarAcusacionRealizada(caso)
    setAcusado(true)
  }, [caso])

  return { acusado, marcar }
}