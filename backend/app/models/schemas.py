"""Contratos de entrada y salida de la API (Pydantic).

FastAPI los usa para validar las peticiones y para generar el esquema OpenAPI
que se ve en /api/docs.
"""

from typing import Any

from pydantic import BaseModel, Field


class HealthResponse(BaseModel):
    """Respuesta de /api/health.

    Es la sonda que confirma que el despliegue quedo bien: no solo dice que el
    proceso esta vivo, tambien que Prolog cargo y resuelve objetivos.
    """

    status: str = "ok"
    version: str
    knowledge_base: str
    kb_version: str | None = None
    # Falso si PySwip no encontro libswipl o si el .pl no cargo.
    prolog_ok: bool
    kb_predicates: int = 0
    checked_at: str | None = None


class QueryRequest(BaseModel):
    """Objetivo Prolog en crudo. Solo disponible si ALLOW_RAW_QUERY=true."""

    goal: str = Field(
        ...,
        min_length=1,
        max_length=500,
        description="Objetivo Prolog, sin el punto final",
        examples=["ping(X)"],
    )
    limit: int = Field(100, ge=1, le=1000, description="Maximo de soluciones")


class QueryResponse(BaseModel):
    goal: str
    # Verdadero si hubo al menos una solucion.
    success: bool
    count: int
    solutions: list[dict[str, Any]]


class CasoCreate(BaseModel):
    """Datos para crear un caso nuevo desde el modulo administrativo."""
    id: str = Field(..., min_length=1, description="Identificador en minusculas, sin tildes (ej. caso4)")
    titulo: str = Field(..., min_length=1)


class SospechosoCreate(BaseModel):
    id: str = Field(..., min_length=1)
    nombre: str = Field(..., min_length=1)


class LugarCreate(BaseModel):
    id: str = Field(..., min_length=1)
    nombre: str = Field(..., min_length=1)


class LugarIncidenteCreate(BaseModel):
    lugar_id: str = Field(..., min_length=1)


class EvidenciaCreate(BaseModel):
    id: str = Field(..., min_length=1)
    descripcion: str = Field(..., min_length=1)
    lugar: str = Field(..., min_length=1)


class DeclaracionCreate(BaseModel):
    id: str = Field(..., min_length=1)
    sospechoso: str = Field(..., min_length=1)
    texto: str = Field(..., min_length=1)


class MotivoCreate(BaseModel):
    sospechoso: str = Field(..., min_length=1)
    detalle: str = Field(..., min_length=1)


class MediosCreate(BaseModel):
    sospechoso: str = Field(..., min_length=1)
    detalle: str = Field(..., min_length=1)


class AccesoCreate(BaseModel):
    sospechoso: str = Field(..., min_length=1)
    lugar: str = Field(..., min_length=1)
    hora: str = Field(..., pattern=r"^\d{1,2}:\d{2}$", description="Formato HH:MM, ej. 23:45")


class ContradiccionEvidenciaCreate(BaseModel):
    declaracion_id: str = Field(..., min_length=1)
    evidencia_id: str = Field(..., min_length=1)


class ContradiccionDeclaracionCreate(BaseModel):
    declaracion_a: str = Field(..., min_length=1)
    declaracion_b: str = Field(..., min_length=1)


class EvidenciaSenalaCreate(BaseModel):
    evidencia_id: str = Field(..., min_length=1)
    sospechoso: str = Field(..., min_length=1)