# =============================================================================
# Stage 1 — Compilar el frontend (React + Vite + TypeScript)
# =============================================================================
FROM node:20-alpine AS frontend-build

WORKDIR /app/frontend

# Se copian primero los manifiestos para aprovechar la cache de capas de Docker:
# mientras package.json no cambie, no se vuelven a instalar las dependencias.
# El comodin en package-lock.json* evita que falle si aun no has generado el lock.
COPY frontend/package.json frontend/package-lock.json* ./
RUN npm ci --no-audit --prefer-offline || npm install --no-audit

COPY frontend/ ./
RUN npm run build


# =============================================================================
# Stage 2 — Runtime: Python + SWI-Prolog + estaticos del frontend
# =============================================================================
FROM python:3.11-slim

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1

# swi-prolog-nox = SWI-Prolog sin las librerias graficas (XPCE).
# Es lo que necesita PySwip (libswipl) y pesa bastante menos que el paquete completo.
RUN apt-get update \
    && apt-get install -y --no-install-recommends swi-prolog-nox \
    && rm -rf /var/lib/apt/lists/*

# Si PySwip no encuentra libswipl.so al arrancar, descomenta esta linea.
# En Debian/Ubuntu SWI-Prolog se instala en esta ruta.
# ENV SWI_HOME_DIR=/usr/lib/swi-prolog

WORKDIR /app

COPY backend/requirements.txt ./
RUN pip install -r requirements.txt

COPY backend/app ./app
COPY backend/prolog ./prolog

# Los estaticos compilados en el stage anterior. FastAPI los sirve directamente,
# por eso no hace falta nginx ni un segundo contenedor.
COPY --from=frontend-build /app/frontend/dist ./static

ENV PORT=8080 \
    STATIC_DIR=/app/static \
    PROLOG_KB=/app/prolog/base.pl \
    ALLOW_RAW_QUERY=false

# Cloud Run no lo exige, pero correr como usuario sin privilegios es buena practica.
RUN useradd --create-home --shell /bin/bash appuser \
    && chown -R appuser:appuser /app
USER appuser

EXPOSE 8080

# IMPORTANTE: --workers 1 es obligatorio, no una optimizacion.
# PySwip embebe una unica maquina virtual de Prolog en el proceso y no es
# thread-safe; con varios workers obtendrias crashes intermitentes.
# Para escalar, Cloud Run levanta mas contenedores, no mas workers.
#
# Forma JSON con `sh -c` porque hace falta expandir ${PORT}; el `exec` hace que
# uvicorn reemplace al shell y reciba las senales de apagado de Cloud Run.
CMD ["sh", "-c", "exec uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8080} --workers 1"]
