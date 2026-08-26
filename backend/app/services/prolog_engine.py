"""Envoltorio sobre PySwip.

Toda la interaccion con Prolog pasa por aqui. La clase resuelve tres problemas
que PySwip no resuelve por si solo:

1. Concurrencia. PySwip embebe *una* maquina virtual de SWI-Prolog en el
   proceso de Python y no es thread-safe. FastAPI ejecuta los endpoints
   sincronos en un pool de hilos, asi que dos peticiones simultaneas entrarian
   al motor a la vez. El lock serializa las consultas.
2. Tipos. Las soluciones vienen con objetos propios de PySwip (Atom, Functor)
   y con bytes, que no son serializables a JSON. Se normalizan a tipos nativos.
3. Escapado. Interpolar texto del usuario dentro de un objetivo Prolog sin
   escaparlo permite inyeccion; `quote_atom` lo cubre.
"""

from __future__ import annotations

import logging
import threading
from pathlib import Path
from typing import Any

from pyswip import Prolog

logger = logging.getLogger(__name__)


class PrologError(RuntimeError):
    """Error al consultar la base de conocimiento."""


def quote_atom(value: str) -> str:
    """Convierte un texto en un atomo Prolog citado y seguro.

    Sin esto, un valor como `x), shell('rm -rf /'), member(x` se inyectaria
    directamente en el objetivo.
    """
    escaped = value.replace("\\", "\\\\").replace("'", "\\'")
    return f"'{escaped}'"


def _to_python(value: Any) -> Any:
    """Traduce un valor devuelto por PySwip a algo serializable en JSON."""
    if value is None or isinstance(value, (bool, int, float, str)):
        return value
    if isinstance(value, bytes):
        return value.decode("utf-8", errors="replace")
    if isinstance(value, (list, tuple)):
        return [_to_python(item) for item in value]
    if isinstance(value, dict):
        return {key: _to_python(item) for key, item in value.items()}

    # Functor: tiene nombre y argumentos -> se reconstruye como texto, p. ej.
    # "padre(juan, maria)".
    name = getattr(value, "name", None)
    args = getattr(value, "args", None)
    if name is not None and args is not None:
        rendered = ", ".join(str(_to_python(arg)) for arg in args)
        return f"{_to_python(name)}({rendered})"

    # Atom: expone el texto en .value
    inner = getattr(value, "value", None)
    if inner is not None:
        return _to_python(inner)

    return str(value)


class PrologEngine:
    """Motor Prolog compartido por toda la aplicacion."""

    def __init__(self, kb_path: Path) -> None:
        self._kb_path = Path(kb_path).resolve()
        self._lock = threading.Lock()
        self._prolog = Prolog()
        self._loaded = False
        self.load()

    @property
    def kb_path(self) -> Path:
        return self._kb_path

    @property
    def is_loaded(self) -> bool:
        return self._loaded

    def load(self) -> None:
        """Carga (o recarga) la base de conocimiento."""
        if not self._kb_path.is_file():
            raise PrologError(f"No se encontro la base de conocimiento: {self._kb_path}")

        # as_posix() es necesario en Windows: SWI-Prolog interpreta la barra
        # invertida como caracter de escape dentro del nombre de archivo.
        path = str(self._kb_path.resolve()).replace("\\", "/")
        path = path.replace("'", "\\'")  # escapar comillas simples

        with self._lock:
            if self._loaded:
                # Volver a consultar sin descargar duplicaria las clausulas.
                list(self._prolog.query(f"unload_file('{path}')"))
            print("CONSULTANDO: ", f"consult('{path}')")
            list(self._prolog.query("set_prolog_flag(encoding, utf8)"))
            list(self._prolog.query(f"consult('{path}')"))
            self._loaded = True

        logger.info("Base de conocimiento cargada: %s", path)

    def query(self, goal: str, limit: int = 100) -> list[dict[str, Any]]:
        """Ejecuta un objetivo y devuelve las soluciones ya normalizadas.

        Una lista vacia significa que el objetivo es falso. Un objetivo cierto
        sin variables libres devuelve `[{}]`.
        """
        goal = goal.strip().rstrip(".")
        if not goal:
            raise PrologError("El objetivo esta vacio")

        with self._lock:
            try:
                solutions = list(self._prolog.query(goal, maxresult=limit))
            except Exception as exc:  # PySwip lanza errores propios de SWI
                raise PrologError(f"Error al evaluar '{goal}': {exc}") from exc

        return [
            {name: _to_python(value) for name, value in solution.items()}
            for solution in solutions
        ]

    def ask(self, goal: str) -> bool:
        """Version booleana: solo indica si el objetivo tiene alguna solucion."""
        return bool(self.query(goal, limit=1))


# ---------------------------------------------------------------------------
# Instancia unica
# ---------------------------------------------------------------------------
# Solo puede existir una maquina virtual de Prolog por proceso, asi que el
# motor se crea una vez y se inyecta en los endpoints con get_engine().

_engine: PrologEngine | None = None


def init_engine(kb_path: Path) -> PrologEngine:
    global _engine
    if _engine is None:
        _engine = PrologEngine(kb_path)
    return _engine


def get_engine() -> PrologEngine:
    if _engine is None:
        raise PrologError("El motor Prolog no ha sido inicializado")
    return _engine
