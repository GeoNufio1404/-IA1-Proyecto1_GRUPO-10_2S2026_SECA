"""Punto de entrada de la aplicacion.

Un solo proceso sirve dos cosas:
  * la API REST bajo /api
  * el build de Vite (React) en el resto de rutas

Al vivir en el mismo origen, el navegador no necesita CORS en produccion.
"""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles

from app.api.routes import router as api_router
from app.config import settings
from app.services.prolog_engine import init_engine

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)-8s %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # La base de conocimiento se consulta una sola vez, al arrancar, no en cada
    # peticion: cargarla es la parte cara.
    logger.info("Inicializando motor Prolog…")
    init_engine(settings.prolog_kb)
    yield
    logger.info("Apagando aplicacion")


app = FastAPI(
    title=settings.app_name,
    version=settings.version,
    lifespan=lifespan,
    # La documentacion se mueve bajo /api para no chocar con las rutas del SPA.
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
)

# Solo relevante en desarrollo, cuando el frontend corre en el servidor de Vite
# (puerto 5173) y por tanto en otro origen.
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api")


# ---------------------------------------------------------------------------
# Frontend
# ---------------------------------------------------------------------------
# Este bloque va DESPUES del router de la API: la ruta comodin de abajo captura
# todo lo que no haya coincidido antes, asi que el orden importa.

STATIC_DIR = settings.static_dir

if STATIC_DIR.is_dir():
    assets_dir = STATIC_DIR / "assets"
    if assets_dir.is_dir():
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/{full_path:path}", include_in_schema=False)
    async def serve_spa(full_path: str):
        """Sirve el archivo pedido; si no existe, devuelve index.html.

        Ese fallback es lo que permite que el enrutado del lado del cliente
        funcione al recargar la pagina en una ruta como /consultas.
        """
        if full_path.startswith("api/"):
            return JSONResponse({"detail": "Not Found"}, status_code=404)

        candidate = (STATIC_DIR / full_path).resolve()
        # Comprobacion anti path traversal: sin esto, una peticion a
        # /../../etc/passwd escaparia de la carpeta de estaticos.
        if (
            full_path
            and candidate.is_file()
            and candidate.is_relative_to(STATIC_DIR.resolve())
        ):
            return FileResponse(candidate)

        return FileResponse(STATIC_DIR / "index.html")

else:
    logger.warning(
        "No existe %s: se sirve solo la API. "
        "En desarrollo esto es normal (usa el servidor de Vite).",
        STATIC_DIR,
    )
