"""Persistencia de la bitacora de investigacion.

No contiene logica deductiva -- la logica de inferencia es exclusiva de
Prolog segun el enunciado, pero registrar que hizo el detective (que
consulto, a quien acuso) es simple persistencia de eventos, asi que vive
en Python.

Sigue el mismo espiritu que casos_admin.pl: escribir en disco para que la
informacion sobreviva un reinicio del backend.
"""

from __future__ import annotations

import json
import logging
import threading
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

logger = logging.getLogger(__name__)

DATA_DIR = Path(__file__).resolve().parent.parent.parent / "data"
BITACORA_PATH = DATA_DIR / "bitacora.json"

_lock = threading.Lock()


def _ensure_storage() -> None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    if not BITACORA_PATH.is_file():
        BITACORA_PATH.write_text(
            json.dumps({"entradas": []}, ensure_ascii=False, indent=2), encoding="utf-8"
        )


def _leer() -> dict[str, Any]:
    _ensure_storage()
    try:
        return json.loads(BITACORA_PATH.read_text(encoding="utf-8"))
    except (json.JSONDecodeError, OSError) as exc:
        logger.error("Bitacora corrupta o ilegible, se reinicia: %s", exc)
        return {"entradas": []}


def _escribir(data: dict[str, Any]) -> None:
    BITACORA_PATH.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")


def agregar_entrada(
    caso: str,
    tipo: str,
    detalle: str,
    sospechoso: str | None = None,
    correcto: bool | None = None,
    nivel_sospecha: int | None = None,
) -> dict[str, Any]:
    """Agrega una entrada y la persiste en disco. Devuelve la entrada creada."""
    entrada = {
        "id": uuid.uuid4().hex[:12],
        "caso": caso,
        "tipo": tipo,
        "sospechoso": sospechoso,
        "detalle": detalle,
        "correcto": correcto,
        "nivel_sospecha": nivel_sospecha,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
    with _lock:
        data = _leer()
        data["entradas"].append(entrada)
        _escribir(data)
    return entrada


def obtener_bitacora(caso: str) -> list[dict[str, Any]]:
    """Todas las entradas de un caso, mas recientes primero."""
    with _lock:
        data = _leer()
    entradas = [e for e in data["entradas"] if e["caso"] == caso]
    return sorted(entradas, key=lambda e: e["timestamp"], reverse=True)


def obtener_investigaciones() -> list[dict[str, Any]]:
    """Historial global de investigaciones resueltas (acusaciones), cualquier caso."""
    with _lock:
        data = _leer()
    entradas = [e for e in data["entradas"] if e["tipo"] == "acusacion"]
    return sorted(entradas, key=lambda e: e["timestamp"], reverse=True)