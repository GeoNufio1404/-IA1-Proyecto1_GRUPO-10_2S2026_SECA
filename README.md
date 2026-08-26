# Proyecto 1 — Sistema Experto (React + FastAPI + Prolog)

Aplicacion web que consulta una base de conocimiento en SWI-Prolog a traves de
una API REST. Todo se empaqueta en **un solo contenedor** y se despliega en
**Google Cloud Run** mediante GitHub Actions.

```
Navegador ──HTTP──> Cloud Run (1 contenedor)
                     ├── FastAPI  /api/*      ── PySwip ── SWI-Prolog ── base.pl
                     └── estaticos de Vite  /  (build de React)
```

## Por que un solo contenedor

Frontend y backend comparten origen, asi que **no hay CORS que configurar** ni
variables tipo `VITE_API_URL` apuntando a otro dominio. Un deploy, una URL, un
workflow. Para un proyecto de curso esto elimina la mitad de la infraestructura
sin perder nada.

## Requisitos

| Herramienta | Version | Para que |
|---|---|---|
| Python | 3.11+ | backend |
| Node.js | 20+ | frontend |
| SWI-Prolog | 9.x | solo para desarrollo local sin Docker |
| Docker Desktop | reciente | probar la imagen de produccion |
| gcloud CLI | reciente | configurar GCP la primera vez |

---

## Desarrollo local

### Opcion A — sin Docker (iteracion mas rapida)

Requiere SWI-Prolog instalado en el sistema; en Windows, el instalador de
[swi-prolog.org](https://www.swi-prolog.org/download/stable) marcando la opcion
de agregarlo al PATH.

```powershell
# Terminal 1 — backend
cd backend
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
$env:ALLOW_RAW_QUERY = "true"
uvicorn app.main:app --reload --port 8000

# Terminal 2 — frontend
cd frontend
npm install
npm run dev
```

- Frontend: http://localhost:5173
- API y documentacion interactiva: http://localhost:8000/api/docs

El proxy configurado en `vite.config.ts` redirige `/api` al puerto 8000, por eso
el codigo del cliente siempre usa rutas relativas.

### Opcion B — docker compose

```powershell
docker compose up
```

### Opcion C — la imagen de produccion, en local

Es la unica forma de verificar antes de desplegar que el build de Vite y el
fallback del SPA funcionan:

```powershell
docker build -t proyecto1 .
docker run -p 8080:8080 proyecto1
```

Todo queda en http://localhost:8080.

---

## Despliegue en GCP

### Paso 0 — antes de empezar

Necesitas una cuenta de Google con **facturacion habilitada** (Cloud Run pide
tarjeta aunque no cobre). El nivel gratuito cubre 2 millones de peticiones al
mes; con `--min-instances 0` el servicio escala a cero y no cobra nada mientras
nadie lo use. Si eres estudiante, el programa de creditos de Google Cloud te da
saldo suficiente de sobra.

### Paso 1 — primer despliegue manual

Antes de automatizar, comprueba que la imagen levanta en Cloud Run. Este comando
sube el codigo, lo construye con Cloud Build usando tu `Dockerfile` y lo
despliega, todo en un paso:

```bash
gcloud auth login
gcloud config set project TU_PROJECT_ID
gcloud services enable run.googleapis.com artifactregistry.googleapis.com cloudbuild.googleapis.com

gcloud run deploy proyecto1 \
  --source . \
  --region us-central1 \
  --allow-unauthenticated
```

Si esto funciona, ya tienes la app en linea. Lo que sigue es solo automatizarlo.

### Paso 2 — repositorio de imagenes

```bash
gcloud artifacts repositories create proyecto1-repo \
  --repository-format=docker \
  --location=us-central1 \
  --description="Imagenes del Proyecto 1"
```

### Paso 3 — service account para GitHub Actions

```bash
export PROJECT_ID=TU_PROJECT_ID
export SA=github-deployer

gcloud iam service-accounts create $SA --display-name="GitHub Actions deployer"

# Tres permisos, cada uno con su razon:
#   run.admin              -> crear y actualizar el servicio de Cloud Run
#   artifactregistry.writer-> subir la imagen
#   iam.serviceAccountUser -> asignar al servicio su identidad de ejecucion
for ROL in roles/run.admin roles/artifactregistry.writer roles/iam.serviceAccountUser; do
  gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:$SA@$PROJECT_ID.iam.gserviceaccount.com" \
    --role="$ROL"
done

gcloud iam service-accounts keys create gcp-key.json \
  --iam-account="$SA@$PROJECT_ID.iam.gserviceaccount.com"
```

### Paso 4 — secrets en GitHub

En el repositorio: **Settings → Secrets and variables → Actions → New repository secret**

| Secret | Valor |
|---|---|
| `GCP_PROJECT_ID` | el ID del proyecto (no el nombre) |
| `GCP_SA_KEY` | el contenido **completo** de `gcp-key.json`, pegado tal cual |

Despues **borra `gcp-key.json` de tu maquina**. Esa llave no expira: quien la
tenga puede desplegar en tu proyecto. Ya esta cubierta en `.gitignore`, pero la
proteccion real es no conservarla.

### Paso 5 — listo

Cada push a `main` dispara [.github/workflows/deploy.yml](.github/workflows/deploy.yml).
La URL del servicio aparece en el resumen de la ejecucion en la pestana Actions.

---

## Estructura

```
.
├── Dockerfile                 # multi-stage: node compila el front, python lo sirve
├── docker-compose.yml         # solo desarrollo
├── .github/workflows/
│   └── deploy.yml             # build -> Artifact Registry -> Cloud Run
├── backend/
│   ├── requirements.txt
│   ├── app/
│   │   ├── main.py            # app FastAPI + estaticos + fallback del SPA
│   │   ├── config.py          # settings desde variables de entorno
│   │   ├── api/routes.py      # endpoints REST
│   │   ├── models/schemas.py  # contratos Pydantic
│   │   └── services/
│   │       └── prolog_engine.py  # wrapper de PySwip (lock + normalizacion)
│   └── prolog/
│       └── base.pl            # base de conocimiento  <-- aqui va tu logica
└── frontend/
    ├── vite.config.ts         # proxy /api en desarrollo
    └── src/
        ├── App.tsx            # pagina de verificacion  <-- reemplazar
        ├── api/client.ts      # cliente HTTP centralizado
        └── types/index.ts     # espejo TS de los modelos Pydantic
```

El esqueleto esta deliberadamente vacio de dominio: `base.pl` solo tiene un
predicado de humo (`ping/1`) y `App.tsx` es una pagina de estado. Eso permite
cerrar el CI/CD primero y construir la aplicacion encima sin tener que borrar
codigo de ejemplo.

## Endpoints

Por ahora solo lo necesario para validar el despliegue. La logica del proyecto
se agrega despues.

| Metodo | Ruta | Descripcion |
|---|---|---|
| GET | `/api/health` | ejecuta un objetivo real contra Prolog y reporta `prolog_ok` |
| POST | `/api/query` | objetivo Prolog en crudo — **solo si `ALLOW_RAW_QUERY=true`** |
| GET | `/api/docs` | documentacion interactiva (Swagger UI) |

Comprobacion de un despliegue:

```bash
curl https://TU-SERVICIO.run.app/api/health
# {"status":"ok","version":"0.1.0","knowledge_base":"base.pl",
#  "kb_version":"0.1.0","prolog_ok":true}
```

Si `prolog_ok` es `true`, la cadena completa funciona: el contenedor tiene
SWI-Prolog, PySwip encontro `libswipl` y la base de conocimiento cargo.

## Variables de entorno

| Variable | Por defecto | Notas |
|---|---|---|
| `PORT` | `8080` | Cloud Run la inyecta automaticamente |
| `PROLOG_KB` | `backend/prolog/base.pl` | ruta de la base de conocimiento |
| `STATIC_DIR` | `../static` | build de Vite; si no existe solo se sirve la API |
| `ALLOW_RAW_QUERY` | `false` | activar solo en desarrollo (ver abajo) |

---

## Cosas que conviene saber

**PySwip no es thread-safe.** SWI-Prolog corre como una unica maquina virtual
dentro del proceso de Python. Por eso el contenedor usa `--workers 1` y
`PrologEngine` serializa cada consulta con un lock. No es una optimizacion
pendiente: quitarlo produce crashes intermitentes bajo carga. Cloud Run escala
creando mas contenedores, asi que la restriccion no limita el rendimiento.

**`/api/query` es peligroso en produccion.** Prolog puede leer archivos y lanzar
procesos del sistema (`shell/1`), asi que un endpoint que ejecuta objetivos
arbitrarios equivale a ejecucion remota de codigo. Queda desactivado por defecto
y el workflow lo fuerza a `false` al desplegar. El patron correcto para la
entrega es un endpoint por pregunta, como `/api/parentesco/...`, con el objetivo
Prolog construido en el servidor.

**Arranque en frio.** Con `--min-instances 0` la primera peticion tras un rato de
inactividad tarda unos segundos, porque hay que levantar el contenedor y cargar
la base de conocimiento. Si vas a presentar el proyecto en vivo, abre la URL unos
minutos antes, o pon `--min-instances 1` durante ese dia (deja de ser gratis
mientras este activo).

## Problemas comunes

**`ImportError` o "could not find libswipl"** — PySwip no encuentra SWI-Prolog.
En local, verifica que `swipl --version` responde desde la misma terminal. En el
contenedor, descomenta `ENV SWI_HOME_DIR=/usr/lib/swi-prolog` en el `Dockerfile`.

**El frontend carga pero la API devuelve 404** — el catch-all del SPA en
`main.py` va despues del router de la API; si mueves ese bloque, se traga las
rutas `/api/*`.

**`npm ci` falla en el build de Docker** — no existe `package-lock.json`. Corre
`npm install` una vez dentro de `frontend/` y haz commit del lock.

**Prolog devuelve vacio para nombres validos** — el backend pasa los parametros
en minusculas y citados. Los atomos de `base.pl` tambien deben estar en
minusculas.
