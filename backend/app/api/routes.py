"""Endpoints REST. Se montan bajo el prefijo /api desde main.py.
"""

from datetime import datetime
import logging

from fastapi import APIRouter, HTTPException, status

from app.models.schemas import (
    HealthResponse, QueryRequest, QueryResponse,
    CasoCreate, SospechosoCreate, LugarCreate, LugarIncidenteCreate,
    EvidenciaCreate, DeclaracionCreate, MotivoCreate, MediosCreate,
    AccesoCreate, ContradiccionEvidenciaCreate, ContradiccionDeclaracionCreate,
    EvidenciaSenalaCreate, AcusacionCreate,
    BitacoraEntradaCreate, InformeFinalResponse,
)
from app.services import bitacora
from app.services.prolog_engine import PrologError, get_engine, quote_atom

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/health", response_model=HealthResponse, tags=["sistema"])
def health() -> HealthResponse:
    engine = get_engine()
    prolog_ok = False
    kb_version = None
    kb_predicates = 0

    try:
        prolog_ok = engine.ask("ping(pong)")
        soluciones = engine.query("version_kb(V)", limit=1)
        if soluciones:
            kb_version = str(soluciones[0]["V"])
        kb_predicates = len(list(engine.query("current_predicate(_)")))
    except PrologError as exc:
        logger.error("Fallo la comprobacion de Prolog: %s", exc)

    return HealthResponse(
        version=settings.version,
        knowledge_base=engine.kb_path.name,
        kb_version=kb_version,
        prolog_ok=prolog_ok,
        kb_predicates=kb_predicates,
        checked_at=datetime.utcnow().isoformat()
    )

@router.post("/query", response_model=QueryResponse, tags=["prolog"])
def raw_query(payload: QueryRequest) -> QueryResponse:
    """Ejecuta un objetivo Prolog arbitrario.

    Util para depurar la base de conocimiento durante el desarrollo. Queda
    desactivado si ALLOW_RAW_QUERY es false, porque Prolog puede leer archivos
    y lanzar procesos: expuesto a internet seria ejecucion remota de codigo.
    """
    if not settings.allow_raw_query:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Las consultas en crudo estan desactivadas en este entorno",
        )

    try:
        solutions = get_engine().query(payload.goal, limit=payload.limit)
    except PrologError as exc:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc

    return QueryResponse(
        goal=payload.goal,
        success=bool(solutions),
        count=len(solutions),
        solutions=solutions,
    )

"======================================FUNCIONES======================================="
def validar_sospechoso(caso:str, sospechoso:str):
    """Valida que el sospechoso pertenezca al caso."""
    objetivo = f"sospechoso({quote_atom(caso)}, {quote_atom(sospechoso)}, Nombre)"

    try:
        soluciones = get_engine().query(objetivo, limit=1)
    except PrologError as exc:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc

    if not soluciones:
        raise HTTPException(
            status.HTTP_404_NOT_FOUND,
            detail=f"El sospechoso '{sospechoso}' no pertenece al caso '{caso}'."
        )


def validar_caso(caso:str):
    """Valida que el caso exista."""
    objetivo = f"caso({quote_atom(caso)}, Titulo)"

    try:
        soluciones = get_engine().query(objetivo, limit=1)
    except PrologError as exc:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc

    if not soluciones:
        raise HTTPException(
            status.HTTP_404_NOT_FOUND,
            detail=f"El caso '{caso}' no existe."
        )

    
"============================================================================"
@router.get("/casos", tags=["casos"])
def obtener_casos():
    """Obtiene la lista de casos disponibles."""
    objetivo = "caso(Caso, Titulo)"

    try:
        soluciones = get_engine().query(objetivo)
    except PrologError as exc:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc

    return {
        "casos": soluciones,
    }

@router.get("/casos/{caso}/sospechosos",tags=["casos"])
def obtener_sospechoso(caso: str):
    """Obtiene los sospechosos de un caso."""
    validar_caso(caso)
    objetivo = f"sospechoso({quote_atom(caso)}, Id, Nombre)"

    try:
        soluciones = get_engine().query(objetivo)
    except PrologError as exc:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc

    return {
        "caso": caso,
        "sospechosos": soluciones,
    }


@router.get("/casos/{caso}/accesos/{sospechoso}", tags=["casos"])
def obtener_accesos(caso: str, sospechoso: str):
    """Obtiene los accesos de un sospechoso en un caso."""
    validar_caso(caso)
    validar_sospechoso(caso, sospechoso)
    objetivo = f"tuvo_acceso({quote_atom(caso)}, {quote_atom(sospechoso)}, Lugar)"

    try:
        soluciones = get_engine().query(objetivo)
    except PrologError as exc:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc

    return {
        "caso": caso,
        "sospechoso": sospechoso,
        "lugares": soluciones,
    }

@router.get("/casos/{caso}/oportunidad", tags=["casos"])
def obtener_oportunidad(caso: str):
    """Obtiene si el sospechoso tuvo oportunidad de cometer el incidente."""

    # Validar que el caso exista antes de obtener la oportunidad
    validar_caso(caso)
    # Construir el objetivo Prolog para obtener la oportunidad
    objetivo =f"tuvo_oportunidad({quote_atom(caso)}, Sospechoso)"

    try:
        soluciones = get_engine().query(objetivo)
    except PrologError as exc:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc

    return {
        "caso": caso,
        "oportunidad": soluciones,
    }

@router.get("/casos/{caso}/motivos", tags=["casos"])
def obtener_motivos(caso: str):
    """Obtiene los sospechosos que tuvieron un motivo para cometer el incidente."""
    validar_caso(caso)
    objetivo = f"tiene_motivo({quote_atom(caso)}, Sospechoso)"

    try:
        soluciones = get_engine().query(objetivo)
    except PrologError as exc:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc

    return {
        "caso": caso,
        "motivos": soluciones,
    }

@router.get("/casos/{caso}/medios", tags=["casos"])
def obtener_medios(caso: str):
    """Obtiene los sospechosos que tuvieron medios para cometer el crimen."""
    validar_caso(caso)
    objetivo = f"tuvo_medios({quote_atom(caso)}, Sospechoso)"

    try:
        soluciones = get_engine().query(objetivo)
    except PrologError as exc:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc

    return {
        "caso": caso,
        "medios": soluciones,
    }

@router.get("/casos/{caso}/coartadas/validas", tags=["casos"])
def obtener_coartadas_validas(caso: str):
    """Obtiene los sospechosos que tienen coartadas validas para el caso."""
    validar_caso(caso)
    objetivo = f"coartada_valida({quote_atom(caso)}, Sospechoso)"

    try:
        soluciones = get_engine().query(objetivo)
    except PrologError as exc:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc

    return {
        "caso": caso,
        "coartadas_validas": soluciones,
    }

@router.get("/casos/{caso}/coartadas/invalidas", tags=["casos"])
def obtener_coartadas_invalidas(caso: str):
    """Obtiene los sospechosos que tienen coartadas invalidas para el caso."""
    validar_caso(caso)
    objetivo = f"coartada_invalida({quote_atom(caso)}, Sospechoso)"

    try:
        soluciones = get_engine().query(objetivo)
    except PrologError as exc:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc

    return {
        "caso": caso,
        "coartadas_invalidas": soluciones,
    }

@router.get("/casos/{caso}/contradicciones/evidencias/{sospechoso}", tags=["casos"])
def obtener_contradicciones_evidencia(caso:str, sospechoso:str):
    """Obtiene las evidencias que contradicen la declaracion de un sospechoso en un caso."""
    validar_caso(caso)
    # Validar que el sospechoso pertenece al caso antes de obtener las contradicciones
    validar_sospechoso(caso, sospechoso)

    # Construir el objetivo Prolog para obtener las contradicciones de evidencia
    objetivo =( 
        f"contradiccion_evidencia("
        f"{quote_atom(caso)}, "
        f"{quote_atom(sospechoso)},  "
        f"Evidencia )" 
    )

    try:
        soluciones = get_engine().query(objetivo)
    except PrologError as exc:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc

    return {
        "caso": caso,
        "sospechoso": sospechoso,
        "contradicciones": soluciones,
    }

@router.get("/casos/{caso}/contradicciones/declaraciones", tags=["casos"])
def obtener_contradicciones_declaraciones(caso:str):
    """Obtiene dos sospechosos que se contradicen entre si en un caso."""

    validar_caso(caso)
    objetivo = (
        f"contradiccion_declaraciones("
        f"{quote_atom(caso)}, "
        f"SospechosoA, "
        f"SospechosoB) "
    )

    try:
        soluciones = get_engine().query(objetivo)
    except PrologError as exc:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc

    return {
        "caso": caso,
        "contradicciones": soluciones,
    }

@router.get("/casos/{caso}/informacion-falsa", tags=["casos"])
def obtener_informacion_falsa(caso:str):
    """Obtiene los sospechosos que dieron informacion falsa en un caso(por evidencia o por declaracion cruzada)."""

    validar_caso(caso)

    objetivo =(
        f"sospechosos_con_info_falsa("
        f"{quote_atom(caso)}, "
        f"Lista) "
    )
    try:
        soluciones = get_engine().query(objetivo, limit=1)
    except PrologError as exc:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc

    lista = soluciones[0].get("Lista", []) if soluciones else []

    return {
        "caso": caso,
        "sospechosos": lista,
    }


"======================================================="
@router.get("/casos/{caso}/evidencias/{sospechoso}", tags=["casos"])
def obtener_evidencia_relacionada(caso:str, sospechoso:str):
    """Obtiene las evidencias relacionadas a un sospechoso en un caso."""
    validar_caso(caso)

    # Validar que el sospechoso pertenece al caso antes de obtener las evidencias
    validar_sospechoso(caso, sospechoso)

    # Construir el objetivo Prolog para obtener las evidencias relacionadas
    objetivo = (
        f"evidencia_relacionada("
        f"{quote_atom(caso)}, "
        f"{quote_atom(sospechoso)}, "
        f"Evidencia) "
    )

    try:
        soluciones = get_engine().query(objetivo)
    except PrologError as exc:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc

    return {
        "caso": caso,
        "sospechoso": sospechoso,
        "evidencias": soluciones,
    }

"======================================================"
@router.get("/casos/{caso}/evidencias/{sospechoso}/total", tags=["casos"])
def obtener_total_evidencia(caso:str, sospechoso:str):
    """Obtiene el total de evidencias relacionadas a un sospechoso en un caso."""
    validar_caso(caso)
    # Validar que el sospechoso pertenece al caso antes de obtener el total de evidencias
    validar_sospechoso(caso, sospechoso)

    # Construir el objetivo Prolog para obtener el total de evidencias relacionadas
    objetivo = (
        f"total_evidencias_sospechoso("
        f"{quote_atom(caso)}, "
        f"{quote_atom(sospechoso)}, "
        f"Total) "
    )

    try:
        soluciones = get_engine().query(objetivo, limit=1)
    except PrologError as exc:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc

    total = soluciones[0].get("Total", 0) if soluciones else 0

    return {
        "caso": caso,
        "sospechoso": sospechoso,
        "total_evidencias": total,
    }

"======================================================"
@router.get("/casos/{caso}/nivel-sospecha/{sospechoso}", tags=["casos"])
def obtener_nivel_sospecha(caso:str, sospechoso:str):
    """Obtiene el nivel de sospecha de un sospechoso en un caso."""
    validar_caso(caso)
    # Validar que el sospechoso pertenece al caso antes de obtener el nivel de sospecha
    validar_sospechoso(caso, sospechoso)

    # Construir el objetivo Prolog para obtener el nivel de sospecha
    objetivo = (
        f"nivel_sospecha("
        f"{quote_atom(caso)}, "
        f"{quote_atom(sospechoso)}, "
        f"Nivel) "
    )

    try:
        soluciones = get_engine().query(objetivo, limit=1)
    except PrologError as exc:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc

    nivel = soluciones[0].get("Nivel", 0) if soluciones else 0

    return {
        "caso": caso,
        "sospechoso": sospechoso,
        "nivel_sospecha": nivel,
    }

"======================================================"
@router.get("/casos/{caso}/sospechoso-principal", tags=["casos"])
def obtener_sospechoso_principal(caso:str):
    """Obtiene el sospechoso principal de un caso."""
    validar_caso(caso)
    objetivo = (
        f"sospechoso_principal("
        f"{quote_atom(caso)}, "
        f"Sospechoso) "
    )

    try:
        soluciones = get_engine().query(objetivo, limit=1)
    except PrologError as exc:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc

    sospechoso_principal = soluciones[0].get("Sospechoso") if soluciones else None

    return {
        "caso": caso,
        "sospechoso_principal": sospechoso_principal,
    }

"======================================================"
@router.get("/casos/{caso}/responsable", tags=["casos"])
def obtener_responsable_logico(caso:str):
    """Obtiene el responsable logico de un caso."""
    validar_caso(caso)
    objetivo = (
        f"responsable_logico("
        f"{quote_atom(caso)}, "
        f"Sospechoso) "
    )

    try:
        soluciones = get_engine().query(objetivo, limit=1)
    except PrologError as exc:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc

    responsable_logico = soluciones[0].get("Sospechoso") if soluciones else None

    return {
        "caso": caso,
        "responsable_logico": responsable_logico,
    }

"======================================================"
@router.get("/casos/{caso}/complices", tags=["casos"])
def obtener_posibles_complices(caso:str):
    """Obtiene las parejas de posibles complices de un caso."""
    validar_caso(caso)
    objetivo = (
        f"posibles_complices("
        f"{quote_atom(caso)}, "
        f"SospechosoA, "
        f"SospechosoB) "
    )

    try:
        soluciones = get_engine().query(objetivo)
    except PrologError as exc:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc

    return {
        "caso": caso,
        "posibles_complices": soluciones,
    }

"======================================================"
@router.get("/casos/{caso}/explicacion/{sospechoso}", tags=["casos"])
def obtener_explicacion(caso:str, sospechoso:str):
    """Obtiene las razones por las que se señala a un sospechoso."""
    validar_caso(caso)

    # Verificar que el sospechoso pertenece al caso antes de obtener la explicación
    validar_sospechoso(caso, sospechoso)

    # Construir el objetivo Prolog para obtener la explicación
    objetivo = (
        f"explicacion("
        f"{quote_atom(caso)}, "
        f"{quote_atom(sospechoso)}, "
        f"ListaDeRazones) "
    )

    try:
        soluciones = get_engine().query(objetivo, limit=1)
    except PrologError as exc:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc

    razones = soluciones[0].get("ListaDeRazones", []) if soluciones else []
    return {
        "caso": caso,
        "sospechoso": sospechoso,
        "explicacion": razones,
    }

"======================================================"
@router.post("/casos/{caso}/acusar", tags=["casos"])
def acusar_sospechoso(caso: str, payload: AcusacionCreate):
    """Registra la acusacion del detective y verifica si coincide con el
    responsable logico calculado por Prolog.

    No agrega logica nueva a la base de conocimiento: combina tres reglas
    que ya existen (responsable_logico, nivel_sospecha, explicacion).
    """
    validar_caso(caso)
    validar_sospechoso(caso, payload.sospechoso)

    objetivo_responsable = f"responsable_logico({quote_atom(caso)}, Sospechoso)"
    objetivo_nivel = (
        f"nivel_sospecha({quote_atom(caso)}, {quote_atom(payload.sospechoso)}, Nivel)"
    )
    objetivo_explicacion = (
        f"explicacion({quote_atom(caso)}, {quote_atom(payload.sospechoso)}, ListaDeRazones)"
    )

    try:
        sol_responsable = get_engine().query(objetivo_responsable, limit=1)
        sol_nivel = get_engine().query(objetivo_nivel, limit=1)
        sol_explicacion = get_engine().query(objetivo_explicacion, limit=1)
    except PrologError as exc:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc

    responsable_logico = sol_responsable[0].get("Sospechoso") if sol_responsable else None
    nivel = sol_nivel[0].get("Nivel", 0) if sol_nivel else 0
    razones = sol_explicacion[0].get("ListaDeRazones", []) if sol_explicacion else []

    bitacora.agregar_entrada(
        caso=caso,
        tipo="acusacion",
        detalle=f"El detective acuso a {payload.sospechoso}.",
        sospechoso=payload.sospechoso,
        correcto=responsable_logico == payload.sospechoso,
        nivel_sospecha=nivel,
    )

    return {
        "caso": caso,
        "sospechoso_acusado": payload.sospechoso,
        "correcto": responsable_logico == payload.sospechoso,
        "responsable_logico": responsable_logico,
        "nivel_sospecha": nivel,
        "explicacion": razones,
    }

"======================================================"
@router.post("/casos/{caso}/bitacora", tags=["bitacora"], status_code=status.HTTP_201_CREATED)
def registrar_bitacora(caso: str, payload: BitacoraEntradaCreate):
    """Registra una accion del detective (consulta, acusacion, etc.).

    No involucra logica deductiva: es persistencia simple de lo que el
    detective fue haciendo durante la investigacion.
    """
    validar_caso(caso)
    if payload.sospechoso:
        validar_sospechoso(caso, payload.sospechoso)

    entrada = bitacora.agregar_entrada(
        caso=caso,
        tipo=payload.tipo,
        detalle=payload.detalle,
        sospechoso=payload.sospechoso,
    )
    return entrada


@router.get("/casos/{caso}/bitacora", tags=["bitacora"])
def obtener_bitacora_caso(caso: str):
    """Devuelve la bitacora completa de un caso, mas reciente primero."""
    validar_caso(caso)
    return {
        "caso": caso,
        "entradas": bitacora.obtener_bitacora(caso),
    }


@router.get("/investigaciones", tags=["bitacora"])
def obtener_historial_investigaciones():
    """Historial de investigaciones resueltas (acusaciones), cualquier caso.

    Funcionalidad opcional listada explicitamente en el enunciado.
    """
    return {
        "investigaciones": bitacora.obtener_investigaciones(),
    }


"======================================================"
@router.get("/casos/{caso}/informe", response_model=InformeFinalResponse, tags=["casos"])
def obtener_informe_final(caso: str):
    """Genera el informe final del caso: conclusion logica + bitacora de la
    investigacion. Requisito obligatorio del enunciado.
    """
    try:
        sol_caso = get_engine().query(f"caso({quote_atom(caso)}, Titulo)", limit=1)
    except PrologError as exc:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    if not sol_caso:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail=f"El caso '{caso}' no existe.")
    titulo = sol_caso[0].get("Titulo", caso)

    try:
        sol_responsable = get_engine().query(
            f"responsable_logico({quote_atom(caso)}, Sospechoso)", limit=1
        )
    except PrologError as exc:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    responsable = sol_responsable[0].get("Sospechoso") if sol_responsable else None

    nivel = None
    explicacion: list = []
    evidencias: list = []
    if responsable:
        try:
            sol_nivel = get_engine().query(
                f"nivel_sospecha({quote_atom(caso)}, {quote_atom(responsable)}, Nivel)", limit=1
            )
            sol_explicacion = get_engine().query(
                f"explicacion({quote_atom(caso)}, {quote_atom(responsable)}, ListaDeRazones)", limit=1
            )
            evidencias = get_engine().query(
                f"evidencia_relacionada({quote_atom(caso)}, {quote_atom(responsable)}, Evidencia)"
            )
        except PrologError as exc:
            raise HTTPException(status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
        nivel = sol_nivel[0].get("Nivel") if sol_nivel else None
        explicacion = sol_explicacion[0].get("ListaDeRazones", []) if sol_explicacion else []

    try:
        contradicciones = get_engine().query(
            f"contradiccion_declaraciones({quote_atom(caso)}, SospechosoA, SospechosoB)"
        )
    except PrologError as exc:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc

    return InformeFinalResponse(
        caso=caso,
        titulo=titulo,
        responsable_logico=responsable,
        nivel_sospecha=nivel,
        explicacion=explicacion,
        evidencias_relacionadas=evidencias,
        contradicciones_declaraciones=contradicciones,
        bitacora=bitacora.obtener_bitacora(caso),
        generado_en=datetime.utcnow().isoformat(),
    )

"======================================================"
@router.get("/casos/{caso}/declaraciones/{persona}", tags=["casos"])
def obtener_declaraciones(caso: str, persona: str):
    """Declaraciones de un sospechoso o testigo, marcando cuales fueron
    contradichas. La deteccion de contradiccion es un predicado Prolog
    (declaracion_contradicha/2); Python solo cruza el resultado con la
    lista base, sin agregar logica deductiva nueva.
    """
    validar_caso(caso)

    objetivo = f"declaracion({quote_atom(caso)}, DeclId, {quote_atom(persona)}, Contenido)"
    try:
        declaraciones = get_engine().query(objetivo)
    except PrologError as exc:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc

    resultado = []
    for d in declaraciones:
        decl_id = d["DeclId"]
        try:
            contradicha = get_engine().ask(
                f"declaracion_contradicha({quote_atom(caso)}, {quote_atom(decl_id)})"
            )
        except PrologError as exc:
            raise HTTPException(status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
        resultado.append({"id": decl_id, "contenido": d["Contenido"], "contradicha": contradicha})

    return {"caso": caso, "persona": persona, "declaraciones": resultado}

"======================================================"
@router.get("/casos/{caso}/timeline", tags=["casos"])
def obtener_timeline(caso: str):
    """Linea de tiempo combinando accesos y evidencias vinculadas a cada
    sospechoso en el momento de su acceso. El join sigue viviendo en Prolog
    (evento_cronologico/5 + sospechoso/3 + lugar/3); Python solo ordena y
    da formato de salida.
    """
    validar_caso(caso)

    objetivo = (
        f"evento_cronologico({quote_atom(caso)}, hora(H,M), Tipo, Sospechoso, Lugar, Descripcion), "
        f"sospechoso({quote_atom(caso)}, Sospechoso, NombreSospechoso), "
        f"lugar({quote_atom(caso)}, Lugar, NombreLugar)"
    )

    try:
        soluciones = get_engine().query(objetivo)
        incidente = get_engine().query(
            f"lugar_del_incidente({quote_atom(caso)}, LugarIncidente)", limit=1
        )
    except PrologError as exc:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc

    lugar_incidente = incidente[0].get("LugarIncidente") if incidente else None

    eventos = [
        {
            "tipo": s["Tipo"],
            "sospechoso": s["Sospechoso"],
            "nombre_sospechoso": s["NombreSospechoso"],
            "lugar": s["Lugar"],
            "nombre_lugar": s["NombreLugar"],
            "descripcion": s["Descripcion"],
            "hora": f"{int(s['H']):02d}:{int(s['M']):02d}",
            "hora_minutos": int(s["H"]) * 60 + int(s["M"]),
            "es_lugar_incidente": s["Lugar"] == lugar_incidente,
        }
        for s in soluciones
    ]
    eventos.sort(key=lambda e: (e["hora_minutos"], e["tipo"]))

    return {
        "caso": caso,
        "lugar_incidente": lugar_incidente,
        "eventos": eventos,
    }

"====================== ENDPOINTS DE CREACION (MODULO ADMINISTRATIVO) ======================"

@router.post("/casos", tags=["admin"], status_code=status.HTTP_201_CREATED)
def crear_caso(payload: CasoCreate):
    """Crea un caso nuevo desde el modulo administrativo."""
    objetivo = f"crear_caso({quote_atom(payload.id)}, {quote_atom(payload.titulo)})"
    try:
        exito = get_engine().ask(objetivo)
    except PrologError as exc:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    if not exito:
        raise HTTPException(status.HTTP_409_CONFLICT, detail=f"El caso '{payload.id}' ya existe.")
    return {"caso": payload.id, "titulo": payload.titulo, "creado": True}


@router.post("/casos/{caso}/sospechosos", tags=["admin"], status_code=status.HTTP_201_CREATED)
def crear_sospechoso(caso: str, payload: SospechosoCreate):
    validar_caso(caso)
    objetivo = f"agregar_sospechoso({quote_atom(caso)}, {quote_atom(payload.id)}, {quote_atom(payload.nombre)})"
    try:
        exito = get_engine().ask(objetivo)
    except PrologError as exc:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    if not exito:
        raise HTTPException(status.HTTP_409_CONFLICT, detail=f"El sospechoso '{payload.id}' ya existe en '{caso}'.")
    return {"caso": caso, "sospechoso": payload.id, "creado": True}


@router.post("/casos/{caso}/lugares", tags=["admin"], status_code=status.HTTP_201_CREATED)
def crear_lugar(caso: str, payload: LugarCreate):
    validar_caso(caso)
    objetivo = f"agregar_lugar({quote_atom(caso)}, {quote_atom(payload.id)}, {quote_atom(payload.nombre)})"
    try:
        exito = get_engine().ask(objetivo)
    except PrologError as exc:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    if not exito:
        raise HTTPException(status.HTTP_409_CONFLICT, detail=f"El lugar '{payload.id}' ya existe en '{caso}'.")
    return {"caso": caso, "lugar": payload.id, "creado": True}


@router.post("/casos/{caso}/lugar-incidente", tags=["admin"])
def marcar_lugar_incidente(caso: str, payload: LugarIncidenteCreate):
    validar_caso(caso)
    objetivo = f"definir_lugar_incidente({quote_atom(caso)}, {quote_atom(payload.lugar_id)})"
    try:
        exito = get_engine().ask(objetivo)
    except PrologError as exc:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    if not exito:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, detail="No se pudo definir el lugar del incidente (revisa que el lugar exista).")
    return {"caso": caso, "lugar_del_incidente": payload.lugar_id}


@router.post("/casos/{caso}/evidencias", tags=["admin"], status_code=status.HTTP_201_CREATED)
def crear_evidencia(caso: str, payload: EvidenciaCreate):
    validar_caso(caso)
    objetivo = (
        f"agregar_evidencia({quote_atom(caso)}, {quote_atom(payload.id)}, "
        f"{quote_atom(payload.descripcion)}, {quote_atom(payload.lugar)})"
    )
    try:
        exito = get_engine().ask(objetivo)
    except PrologError as exc:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    if not exito:
        raise HTTPException(status.HTTP_409_CONFLICT, detail=f"La evidencia '{payload.id}' ya existe o el lugar no existe.")
    return {"caso": caso, "evidencia": payload.id, "creado": True}


@router.post("/casos/{caso}/declaraciones", tags=["admin"], status_code=status.HTTP_201_CREATED)
def crear_declaracion(caso: str, payload: DeclaracionCreate):
    validar_caso(caso)
    objetivo = (
        f"agregar_declaracion({quote_atom(caso)}, {quote_atom(payload.id)}, "
        f"{quote_atom(payload.sospechoso)}, {quote_atom(payload.texto)})"
    )
    try:
        exito = get_engine().ask(objetivo)
    except PrologError as exc:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    if not exito:
        raise HTTPException(status.HTTP_409_CONFLICT, detail=f"La declaracion '{payload.id}' ya existe o el sospechoso no existe.")
    return {"caso": caso, "declaracion": payload.id, "creado": True}


@router.post("/casos/{caso}/motivos", tags=["admin"])
def crear_motivo(caso: str, payload: MotivoCreate):
    validar_caso(caso)
    validar_sospechoso(caso, payload.sospechoso)
    objetivo = f"agregar_motivo({quote_atom(caso)}, {quote_atom(payload.sospechoso)}, {quote_atom(payload.detalle)})"
    try:
        exito = get_engine().ask(objetivo)
    except PrologError as exc:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    return {"caso": caso, "sospechoso": payload.sospechoso, "motivo_agregado": exito}


@router.post("/casos/{caso}/medios", tags=["admin"])
def crear_medios(caso: str, payload: MediosCreate):
    validar_caso(caso)
    validar_sospechoso(caso, payload.sospechoso)
    objetivo = f"agregar_medios({quote_atom(caso)}, {quote_atom(payload.sospechoso)}, {quote_atom(payload.detalle)})"
    try:
        exito = get_engine().ask(objetivo)
    except PrologError as exc:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    return {"caso": caso, "sospechoso": payload.sospechoso, "medios_agregados": exito}


@router.post("/casos/{caso}/accesos", tags=["admin"])
def crear_acceso(caso: str, payload: AccesoCreate):
    validar_caso(caso)
    validar_sospechoso(caso, payload.sospechoso)
    try:
        h, m = payload.hora.split(":")
        hora_termino = f"hora({int(h)},{int(m)})"
    except ValueError:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, detail="El formato de hora debe ser 'HH:MM'.")
    objetivo = (
        f"agregar_acceso({quote_atom(caso)}, {quote_atom(payload.sospechoso)}, "
        f"{quote_atom(payload.lugar)}, {hora_termino})"
    )
    try:
        exito = get_engine().ask(objetivo)
    except PrologError as exc:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    if not exito:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, detail="No se pudo registrar el acceso (revisa que el lugar exista).")
    return {"caso": caso, "sospechoso": payload.sospechoso, "acceso_agregado": True}


@router.post("/casos/{caso}/contradicciones/evidencias", tags=["admin"])
def crear_contradiccion_evidencia(caso: str, payload: ContradiccionEvidenciaCreate):
    validar_caso(caso)
    objetivo = (
        f"agregar_contradiccion_evidencia({quote_atom(caso)}, "
        f"{quote_atom(payload.declaracion_id)}, {quote_atom(payload.evidencia_id)})"
    )
    try:
        exito = get_engine().ask(objetivo)
    except PrologError as exc:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    if not exito:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, detail="La declaracion o la evidencia indicada no existen en ese caso.")
    return {"caso": caso, "contradiccion_agregada": True}


@router.post("/casos/{caso}/contradicciones/declaraciones", tags=["admin"])
def crear_contradiccion_declaracion(caso: str, payload: ContradiccionDeclaracionCreate):
    validar_caso(caso)
    objetivo = (
        f"agregar_contradiccion_declaracion({quote_atom(caso)}, "
        f"{quote_atom(payload.declaracion_a)}, {quote_atom(payload.declaracion_b)})"
    )
    try:
        exito = get_engine().ask(objetivo)
    except PrologError as exc:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    if not exito:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, detail="Alguna de las declaraciones indicadas no existe en ese caso.")
    return {"caso": caso, "contradiccion_agregada": True}


@router.post("/casos/{caso}/evidencias/{evidencia_id}/senala", tags=["admin"])
def marcar_evidencia_senala(caso: str, evidencia_id: str, payload: EvidenciaSenalaCreate):
    validar_caso(caso)
    validar_sospechoso(caso, payload.sospechoso)
    objetivo = (
        f"agregar_evidencia_senala({quote_atom(caso)}, "
        f"{quote_atom(evidencia_id)}, {quote_atom(payload.sospechoso)})"
    )
    try:
        exito = get_engine().ask(objetivo)
    except PrologError as exc:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    return {"caso": caso, "evidencia": evidencia_id, "sospechoso": payload.sospechoso, "marcado": exito}