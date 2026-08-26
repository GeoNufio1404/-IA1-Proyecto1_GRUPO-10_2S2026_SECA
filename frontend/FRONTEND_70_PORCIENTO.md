# Frontend Logic Detective — distribución 70/30

## 70% implementado en este frontend

1. Inicio y selección de casos.
2. Hub de investigación del caso.
3. Listado y expediente de sospechosos.
4. Accesos por sospechoso.
5. Evidencias relacionadas y total de evidencias.
6. Nivel de sospecha y explicación lógica.
7. Análisis de motivos y medios.
8. Coartadas válidas e inválidas.
9. Contradicciones entre declaraciones / evidencia e información falsa.
10. Posibles cómplices, sospechoso principal y responsable lógico.
11. Módulo administrativo integrado con **todos los endpoints POST existentes**.
12. Vista de estado técnico `/health`.

El cliente API (`src/api/client.ts`) contiene integración para todos los endpoints REST presentes en `backend/app/api/routes.py` al momento de esta entrega.

## 30% reservado para el otro integrante

Estas vistas/funcionalidades están deliberadamente fuera del frontend actual para repartir el trabajo:

1. **Bitácora de investigación persistente**: historial de cada acción realizada por el detective.
2. **Línea temporal visual de acontecimientos**: vista cronológica con eventos, horas y relaciones.
3. **Interrogatorio guiado de sospechosos/testigos** con una experiencia tipo conversación.
4. **Acusación final interactiva** con confirmación, validación y puntuación.
5. **Informe final exportable a PDF** e historial de investigaciones completadas.

> Nota técnica: el backend actual no expone endpoints específicos para bitácora, timeline, interrogatorio, acusación persistida, puntuación, historial o PDF. Para que el 30% pendiente sea completamente funcional, primero deben agregarse esos contratos REST.

## Ejecución

```bash
npm install
npm run dev
```

Vite usa el proxy `/api` configurado en `vite.config.ts`, por lo que el frontend consume el backend sin codificar una URL fija.
