import type {
  AccessResponse, AccomplicesResponse, AccesoCreate, AlibisResponse, CasoCreate, CasesResponse,
  ContradiccionDeclaracionCreate, ContradiccionEvidenciaCreate, ContradictionsResponse, DeclaracionCreate,
  EvidenciaCreate, EvidenceResponse, EvidenceTotalResponse, EvidenciaSenalaCreate, ExplanationResponse,
  FalseInfoResponse, HealthResponse, LugarCreate, LugarIncidenteCreate, MeansResponse, MediosCreate,
  MotivesResponse, MotivoCreate, OpportunityResponse, PrincipalResponse, QueryResponse, ResponsibleResponse,
  SospechosoCreate, SuspectsResponse, SuspicionLevelResponse,
} from '../types'

const BASE_URL = '/api'

export class ApiError extends Error {
  constructor(message: string, readonly status: number) {
    super(message)
    this.name = 'ApiError'
  }
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!response.ok) {
    let detail = response.statusText || 'Error de API'
    try {
      const body = await response.json()
      if (typeof body?.detail === 'string') detail = body.detail
      else if (body?.detail) detail = JSON.stringify(body.detail)
    } catch { /* ignore */ }
    throw new ApiError(detail, response.status)
  }
  if (response.status === 204) return undefined as T
  return response.json() as Promise<T>
}

const post = <T>(path: string, body: unknown) => request<T>(path, { method: 'POST', body: JSON.stringify(body) })

export const api = {
  health: () => request<HealthResponse>('/health'),
  query: (goal: string, limit = 100) => post<QueryResponse>('/query', { goal, limit }),

  casos: () => request<CasesResponse>('/casos'),
  sospechosos: (caso: string) => request<SuspectsResponse>(`/casos/${encodeURIComponent(caso)}/sospechosos`),
  accesos: (caso: string, sospechoso: string) => request<AccessResponse>(`/casos/${caso}/accesos/${sospechoso}`),
  oportunidad: (caso: string) => request<OpportunityResponse>(`/casos/${caso}/oportunidad`),
  motivos: (caso: string) => request<MotivesResponse>(`/casos/${caso}/motivos`),
  medios: (caso: string) => request<MeansResponse>(`/casos/${caso}/medios`),
  coartadasValidas: (caso: string) => request<AlibisResponse>(`/casos/${caso}/coartadas/validas`),
  coartadasInvalidas: (caso: string) => request<AlibisResponse>(`/casos/${caso}/coartadas/invalidas`),
  contradiccionesEvidencia: (caso: string, sospechoso: string) => request<ContradictionsResponse>(`/casos/${caso}/contradicciones/evidencias/${sospechoso}`),
  contradiccionesDeclaraciones: (caso: string) => request<ContradictionsResponse>(`/casos/${caso}/contradicciones/declaraciones`),
  informacionFalsa: (caso: string) => request<FalseInfoResponse>(`/casos/${caso}/informacion-falsa`),
  evidencias: (caso: string, sospechoso: string) => request<EvidenceResponse>(`/casos/${caso}/evidencias/${sospechoso}`),
  totalEvidencias: (caso: string, sospechoso: string) => request<EvidenceTotalResponse>(`/casos/${caso}/evidencias/${sospechoso}/total`),
  nivelSospecha: (caso: string, sospechoso: string) => request<SuspicionLevelResponse>(`/casos/${caso}/nivel-sospecha/${sospechoso}`),
  sospechosoPrincipal: (caso: string) => request<PrincipalResponse>(`/casos/${caso}/sospechoso-principal`),
  responsable: (caso: string) => request<ResponsibleResponse>(`/casos/${caso}/responsable`),
  complices: (caso: string) => request<AccomplicesResponse>(`/casos/${caso}/complices`),
  explicacion: (caso: string, sospechoso: string) => request<ExplanationResponse>(`/casos/${caso}/explicacion/${sospechoso}`),

  crearCaso: (data: CasoCreate) => post<Record<string, unknown>>('/casos', data),
  crearSospechoso: (caso: string, data: SospechosoCreate) => post<Record<string, unknown>>(`/casos/${caso}/sospechosos`, data),
  crearLugar: (caso: string, data: LugarCreate) => post<Record<string, unknown>>(`/casos/${caso}/lugares`, data),
  definirLugarIncidente: (caso: string, data: LugarIncidenteCreate) => post<Record<string, unknown>>(`/casos/${caso}/lugar-incidente`, data),
  crearEvidencia: (caso: string, data: EvidenciaCreate) => post<Record<string, unknown>>(`/casos/${caso}/evidencias`, data),
  crearDeclaracion: (caso: string, data: DeclaracionCreate) => post<Record<string, unknown>>(`/casos/${caso}/declaraciones`, data),
  crearMotivo: (caso: string, data: MotivoCreate) => post<Record<string, unknown>>(`/casos/${caso}/motivos`, data),
  crearMedios: (caso: string, data: MediosCreate) => post<Record<string, unknown>>(`/casos/${caso}/medios`, data),
  crearAcceso: (caso: string, data: AccesoCreate) => post<Record<string, unknown>>(`/casos/${caso}/accesos`, data),
  crearContradiccionEvidencia: (caso: string, data: ContradiccionEvidenciaCreate) => post<Record<string, unknown>>(`/casos/${caso}/contradicciones/evidencias`, data),
  crearContradiccionDeclaracion: (caso: string, data: ContradiccionDeclaracionCreate) => post<Record<string, unknown>>(`/casos/${caso}/contradicciones/declaraciones`, data),
  marcarEvidencia: (caso: string, evidenciaId: string, data: EvidenciaSenalaCreate) => post<Record<string, unknown>>(`/casos/${caso}/evidencias/${evidenciaId}/senala`, data),
}
