"""Configuracion de la aplicacion, leida desde variables de entorno."""

from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict

# Raiz del paquete backend (…/backend), calculada a partir de este archivo
# para que funcione igual en local y dentro del contenedor.
BASE_DIR = Path(__file__).resolve().parent.parent


class Settings(BaseSettings):
    app_name: str = "Sistema Experto en Prolog"
    version: str = "0.1.0"

    # Puerto que inyecta Cloud Run automaticamente en tiempo de ejecucion.
    port: int = 8080

    # Base de conocimiento que se carga al arrancar.
    prolog_kb: Path = BASE_DIR / "prolog" / "base.pl"

    # Carpeta con el build de Vite. En el contenedor es /app/static; en local
    # no existe, y entonces la app simplemente sirve solo la API (el frontend
    # lo levanta el servidor de Vite).
    static_dir: Path = BASE_DIR / "static"

    # El endpoint /api/query ejecuta Prolog arbitrario. Prolog puede abrir
    # archivos e invocar el shell, asi que exponerlo publicamente equivale a
    # dar ejecucion remota de codigo. Se deja activo solo en desarrollo.
    allow_raw_query: bool = False

    # Origenes permitidos para CORS. En produccion el frontend se sirve desde
    # el mismo contenedor, asi que esto solo aplica al servidor de Vite.
    cors_origins: list[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ]

    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=False,
        extra="ignore",
    )


settings = Settings()
