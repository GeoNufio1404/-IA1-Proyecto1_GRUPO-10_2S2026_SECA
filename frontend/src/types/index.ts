export interface HealthResponse {
  status: string
  version: string
  knowledge_base: string
  kb_version: string | null
  prolog_ok: boolean
  kb_predicates?: number
  checked_at?: string | null
}

export interface QueryResponse {
  goal: string
  success: boolean
  count: number
  solutions: Array<Record<string, unknown>>
}

export interface CaseItem { Caso: string; Titulo: string }
export interface SuspectItem { Id: string; Nombre: string }
export interface GenericSolution { [key: string]: unknown }

export interface CasesResponse { casos: CaseItem[] }
export interface SuspectsResponse { caso: string; sospechosos: SuspectItem[] }
export interface AccessResponse { caso: string; sospechoso: string; lugares: GenericSolution[] }
export interface OpportunityResponse { caso: string; oportunidad: GenericSolution[] }
export interface MotivesResponse { caso: string; motivos: GenericSolution[] }
export interface MeansResponse { caso: string; medios: GenericSolution[] }
export interface AlibisResponse { caso: string; coartadas_validas?: GenericSolution[]; coartadas_invalidas?: GenericSolution[] }
export interface ContradictionsResponse { caso: string; sospechoso?: string; contradicciones: GenericSolution[] }
export interface FalseInfoResponse { caso: string; sospechosos: string[] }
export interface EvidenceResponse { caso: string; sospechoso: string; evidencias: GenericSolution[] }
export interface EvidenceTotalResponse { caso: string; sospechoso: string; total_evidencias: number }
export interface SuspicionLevelResponse { caso: string; sospechoso: string; nivel_sospecha: number }
export interface PrincipalResponse { caso: string; sospechoso_principal: string | null }
export interface ResponsibleResponse { caso: string; responsable_logico: string | null }
export interface AccomplicesResponse { caso: string; posibles_complices: GenericSolution[] }
export interface ExplanationResponse { caso: string; sospechoso: string; explicacion: unknown[] }

export interface CasoCreate { id: string; titulo: string }
export interface SospechosoCreate { id: string; nombre: string }
export interface LugarCreate { id: string; nombre: string }
export interface LugarIncidenteCreate { lugar_id: string }
export interface EvidenciaCreate { id: string; descripcion: string; lugar: string }
export interface DeclaracionCreate { id: string; sospechoso: string; texto: string }
export interface MotivoCreate { sospechoso: string; detalle: string }
export interface MediosCreate { sospechoso: string; detalle: string }
export interface AccesoCreate { sospechoso: string; lugar: string; hora: string }
export interface ContradiccionEvidenciaCreate { declaracion_id: string; evidencia_id: string }
export interface ContradiccionDeclaracionCreate { declaracion_a: string; declaracion_b: string }
export interface EvidenciaSenalaCreate { evidencia_id: string; sospechoso: string }

export interface AccusationResponse {
  caso: string
  sospechoso_acusado: string
  correcto: boolean
  responsable_logico: string | null
  nivel_sospecha: number
  explicacion: unknown[]
}

export interface BitacoraEntry {
  id?: string;
  timestamp: string;
  caso_id?: string;
  sospechoso?: string;
  resultado: string;
  reglas_aplicadas?: string[];
  detalles?: Record<string, any>;
  [key: string]: any;
}