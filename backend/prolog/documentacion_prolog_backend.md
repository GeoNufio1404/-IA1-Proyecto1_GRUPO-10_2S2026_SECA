# Documentacion de la Base de Conocimiento en Prolog — Logic Detective

**Archivo fuente:** `backend/prolog/base.pl`
**Responsable:** Oswaldo (motor de inferencia, los 3 casos)
**Para:** Kelly (integracion PySwip / backend FastAPI)
**Ultima actualizacion:** Caso 1, Caso 2 y Caso 3 completos y validados

---

## 1. Como esta organizado el archivo

El archivo sigue este orden:

1. `version_kb/1` y `ping/1` — predicados de control del CI/CD (no tocar, no forman parte de la logica del proyecto).
2. Declaraciones `discontiguous` — le avisan a Prolog que los hechos estan agrupados por caso, no por tipo de predicado (es intencional).
3. **Hechos del Caso 1** (El Robo del Prototipo)
4. **Hechos del Caso 2** (El Sabotaje del Proyecto de Graduacion)
5. **Hechos del Caso 3** (La Muerte del Ingeniero Espino)
6. **Reglas** — un solo bloque, compartido por los 3 casos. Todas reciben `Caso` como primer parametro (`caso1`, `caso2` o `caso3`), asi que la misma regla sirve para cualquiera de los tres.

## 2. Convenciones importantes para el backend

- **Todos los IDs (sospechosos, lugares, evidencias, casos) estan en minusculas y sin tildes/enie.** Ejemplo: `mario_lopez`, no `Mario_López`. Esto es obligatorio porque PySwip compara atomos de forma sensible a mayusculas/tildes.
- **Los nombres "bonitos" (para mostrar en pantalla) SI llevan tildes** y estan en un segundo argumento de tipo texto, separado del ID. Ejemplo: `sospechoso(caso1, mario_lopez, 'Mario López')` — el ID (`mario_lopez`) es lo que se usa para consultar, el texto (`'Mario López'`) es lo que se muestra al usuario.
- **El identificador de caso siempre es el primer argumento** de cualquier hecho o regla: `caso1`, `caso2`, `caso3`.
- Los predicados de "hechos crudos" (lo que ya se sabe de la investigacion) y los de "reglas" (lo que Prolog deduce) estan separados a proposito — el backend deberia consultar principalmente las **reglas**, no los hechos crudos directamente, salvo para mostrar listas simples (ej. lista de sospechosos, lista de evidencias).

## 3. Hechos disponibles (datos crudos de cada caso)

| Predicado | Aridad | Significado | Ejemplo |
|---|---|---|---|
| `caso(Caso, Titulo)` | 2 | Nombre del caso | `caso(caso1, 'El Robo del Prototipo')` |
| `sospechoso(Caso, Id, Nombre)` | 3 | Un sospechoso del caso | `sospechoso(caso1, mario_lopez, 'Mario López')` |
| `lugar(Caso, Id, Nombre)` | 3 | Un lugar relevante | `lugar(caso1, laboratorio_robotica, 'Laboratorio de Robótica')` |
| `lugar_del_incidente(Caso, LugarId)` | 2 | Donde ocurrio el hecho central | `lugar_del_incidente(caso1, laboratorio_robotica)` |
| `evidencia(Caso, Id, Descripcion, LugarId)` | 4 | Una evidencia y donde se hallo | `evidencia(caso1, ev1, '...', laboratorio_robotica)` |
| `evidencia_senala(Caso, EvidenciaId, SospechosoId)` | 3 | A quien apunta una evidencia | `evidencia_senala(caso1, ev2, mario_lopez)` |
| `declaracion(Caso, Id, SospechosoId, Contenido)` | 4 | Lo que dijo un sospechoso o testigo | `declaracion(caso1, decl1, mario_lopez, '...')` |
| `contradice(Caso, DeclaracionId, EvidenciaId)` | 3 | Una declaracion que choca con una evidencia | `contradice(caso1, decl1, ev2)` |
| `contradice_decl(Caso, DeclaracionIdA, DeclaracionIdB)` | 3 | Dos declaraciones que chocan entre si | `contradice_decl(caso1, decl6, decl2)` |
| `motivo(Caso, SospechosoId, Detalle)` | 3 | El motivo identificado de un sospechoso | `motivo(caso1, mario_lopez, '...')` |
| `acceso_registrado(Caso, SospechosoId, LugarId, hora(H,M))` | 4 | Registro de acceso a un lugar | `acceso_registrado(caso1, mario_lopez, laboratorio_robotica, hora(23,45))` |
| `medios_disponibles(Caso, SospechosoId, Detalle)` | 3 | Herramientas/conocimiento que tenia | `medios_disponibles(caso1, mario_lopez, '...')` |

Nota: no todos los sospechosos tienen hechos de `motivo/3` o `medios_disponibles/3` — eso es intencional (representa que no se les identifico un motivo o medio claro). Si el backend consulta uno de estos predicados para un sospechoso que no lo tiene, Prolog simplemente no devuelve resultado (no es un error).

## 4. Reglas de inferencia (lo que el backend deberia consultar)

Todas se consultan con `Caso` (`caso1`, `caso2` o `caso3`) como primer argumento.

| Regla | Aridad | Que responde | Ejemplo de consulta | Ejemplo de resultado |
|---|---|---|---|---|
| `tuvo_acceso(Caso, Sospechoso, Lugar)` | 3 | Si un sospechoso tuvo acceso registrado a un lugar cualquiera | `tuvo_acceso(caso1, mario_lopez, X)` | `X = laboratorio_robotica` |
| `tuvo_oportunidad(Caso, Sospechoso)` | 2 | Si tuvo acceso al lugar exacto del incidente | `tuvo_oportunidad(caso1, X)` | `X = mario_lopez ; X = carla_ruiz` |
| `tiene_motivo(Caso, Sospechoso)` | 2 | Si se le identifico un motivo | `tiene_motivo(caso1, X)` | lista de sospechosos con motivo |
| `tuvo_medios(Caso, Sospechoso)` | 2 | Si tuvo las herramientas/conocimiento necesario | `tuvo_medios(caso1, X)` | lista de sospechosos con medios |
| `coartada_valida(Caso, Sospechoso)` | 2 | Si su coartada NO fue contradicha | `coartada_valida(caso1, X)` | `X = carla_ruiz` |
| `coartada_invalida(Caso, Sospechoso)` | 2 | Si su coartada SI fue contradicha por una evidencia | `coartada_invalida(caso1, X)` | lista de sospechosos con coartada invalida |
| `contradiccion_evidencia(Caso, Sospechoso, Evidencia)` | 3 | Que evidencia contradice la declaracion de un sospechoso | `contradiccion_evidencia(caso1, mario_lopez, X)` | `X = ev2` |
| `contradiccion_declaraciones(Caso, SospechosoA, SospechosoB)` | 3 | Que dos sospechosos se contradicen entre si | `contradiccion_declaraciones(caso1, X, Y)` | `X = beto_garcia, Y = carla_ruiz` |
| `informacion_falsa(Caso, Sospechoso)` | 2 | Si el sospechoso mintio (por evidencia o por declaracion cruzada) | `informacion_falsa(caso1, X)` | puede repetir al mismo sospechoso varias veces (una por cada razon) |
| `sospechosos_con_info_falsa(Caso, Lista)` | 2 | Version SIN duplicados de lo anterior, lista lista para mostrar en pantalla | `sospechosos_con_info_falsa(caso1, X)` | `X = [beto_garcia, carla_ruiz, diego_fernandez, mario_lopez]` |
| `evidencia_relacionada(Caso, Sospechoso, Evidencia)` | 3 | Que evidencias apuntan a un sospechoso | `evidencia_relacionada(caso1, mario_lopez, X)` | `X = ev2 ; X = ev10` |
| `total_evidencias_sospechoso(Caso, Sospechoso, Total)` | 3 | Cuantas evidencias apuntan a un sospechoso (numero) | `total_evidencias_sospechoso(caso1, mario_lopez, X)` | `X = 2` |
| `nivel_sospecha(Caso, Sospechoso, Nivel)` | 3 | Puntaje 0-4 segun cuantas condiciones cumple | `nivel_sospecha(caso1, X, N)` | `X = mario_lopez, N = 4` |
| `clasificar_nivel(Nivel, Categoria)` | 2 | Convierte el numero en 'alto'/'medio'/'bajo' | `clasificar_nivel(4, X)` | `X = alto` |
| `sospechoso_principal(Caso, Sospechoso)` | 2 | El de mayor nivel de sospecha en todo el caso | `sospechoso_principal(caso1, X)` | `X = mario_lopez` |
| `responsable_logico(Caso, Sospechoso)` | 2 | Cumple las 4 condiciones a la vez (la acusacion correcta) | `responsable_logico(caso1, X)` | `X = mario_lopez` |
| `posibles_complices(Caso, SospechosoA, SospechosoB)` | 3 | Dos sospechosos que son responsables a la vez | `posibles_complices(caso2, X, Y)` | `X = rene_martinez, Y = sofia_delgado` |
| `explicacion(Caso, Sospechoso, ListaDeRazones)` | 3 | Lista de texto explicando por que se le senala | `explicacion(caso1, mario_lopez, X)` | lista de 4 strings (ver seccion 6) |

## 5. Mapa: requisito del enunciado -> predicado a usar

Esta tabla es la mas util para diseñar los endpoints, porque conecta directamente lo que pide la rubrica con el predicado exacto que hay que llamar.

| Lo que pide el enunciado | Predicado a consultar |
|---|---|
| Personas que tuvieron acceso al lugar | `tuvo_acceso/3` |
| Personas que tuvieron oportunidad | `tuvo_oportunidad/2` |
| Personas con motivo | `tiene_motivo/2` (usar junto con `motivo/3` para el detalle en texto) |
| Personas con medios | `tuvo_medios/2` (usar junto con `medios_disponibles/3` para el detalle) |
| Personas con coartada valida | `coartada_valida/2` |
| Personas con coartada invalida | `coartada_invalida/2` |
| Declaraciones que contradicen otras declaraciones | `contradiccion_declaraciones/3` |
| Declaraciones que contradicen una evidencia | `contradiccion_evidencia/3` |
| Sospechosos que dieron informacion falsa | `sospechosos_con_info_falsa/2` (version sin duplicados) |
| Evidencias relacionadas con cada sospechoso | `evidencia_relacionada/3` |
| Nivel de sospecha de cada involucrado | `nivel_sospecha/3` + `clasificar_nivel/2` |
| Posibles complices | `posibles_complices/3` |
| Principal sospechoso | `sospechoso_principal/2` |
| Responsable logico del caso | `responsable_logico/2` |
| Explicacion de las reglas usadas | `explicacion/3` |

**Importante (seguridad):** segun quedo definido en el README del proyecto, en produccion no se debe exponer un endpoint de consulta libre (`/api/query` con objetivo Prolog en crudo). Cada fila de esta tabla deberia convertirse en **su propio endpoint especifico** (ej. `GET /api/casos/{caso}/sospechosos/{id}/oportunidad`), construyendo el objetivo Prolog del lado del servidor, no recibiendolo directo del cliente.

## 6. Ejemplo de flujo completo (lo que pasa cuando el usuario "acusa")

Supongamos que el usuario, investigando el Caso 1, hace clic en "Acusar a Mario Lopez":

1. El frontend manda al backend: `POST /api/casos/caso1/acusar` con `{ "sospechoso": "mario_lopez" }`.
2. El backend arma la consulta Prolog: `responsable_logico(caso1, mario_lopez)`.
3. Prolog responde `true`.
4. El backend pide tambien la explicacion: `explicacion(caso1, mario_lopez, Razones)`.
5. Prolog devuelve:
   ```
   Razones = [
     'Tuvo oportunidad: acceso registrado en el lugar del incidente.',
     'Tiene motivo: Queria el credito individual del proyecto.',
     'Tuvo los medios: Conoce el laboratorio y el equipo.',
     'Su coartada es invalida: contradicha por evidencia o declaracion.'
   ]
   ```
6. El backend empaqueta todo en JSON y se lo manda al frontend, que muestra: "Acusacion correcta" + la lista de razones.

Si el usuario hubiera acusado a alguien que **no** es `responsable_logico` (ej. Carla), el paso 3 devuelve `false`, y el backend puede usar `nivel_sospecha` y `explicacion` (que igual funciona para cualquier sospechoso, aunque no sea el responsable) para explicar por que esa persona sigue siendo sospechosa pero no la correcta.

## 7. Referencia rapida de los 3 casos

| Caso | Titulo | Sospechosos (IDs) | Responsable logico esperado | Nota especial |
|---|---|---|---|---|
| `caso1` | El Robo del Prototipo | `mario_lopez`, `carla_ruiz`, `diego_fernandez`, `beto_garcia` | `mario_lopez` | Caso "directo", un solo responsable |
| `caso2` | El Sabotaje del Proyecto de Graduacion | `rene_martinez`, `sofia_delgado`, `profesor_mendez`, `tecnico_sistemas` | `rene_martinez` y `sofia_delgado` (ambos) | Demuestra `posibles_complices/3` |
| `caso3` | La Muerte del Ingeniero Espino | `estudiante_alvarez`, `secretaria_paz`, `colega_rios`, `sobrino_torres` | `secretaria_paz` | Varios sospechosos con nivel alto, pero solo uno es responsable (distingue sospecha de responsabilidad) |

## 8. Como probarlo tu misma (sin backend, directo en Prolog)

Si quieres validar cualquier consulta antes de conectarla al backend, desde la raiz del repo:

```powershell
swipl backend/prolog/base.pl
```

Y dentro del prompt `?-`, cualquier consulta de la seccion 4, por ejemplo:

```prolog
?- responsable_logico(caso2, X).
```

Usa `;` para pedir la siguiente respuesta si hay mas de una.

## 9. Notas tecnicas para PySwip

- Los atomos que le mandes desde Python a Prolog deben ir en minusculas y sin tildes, igual que estan definidos aqui (ej. `mario_lopez`, no `Mario_Lopez`).
- Las respuestas de tipo lista (como `explicacion/3` o `sospechosos_con_info_falsa/2`) llegan como listas de Python normales una vez que PySwip las convierte — no requieren procesamiento especial.
- Si una consulta no tiene resultados (ej. preguntar `tuvo_medios` de alguien que no tiene ese hecho), PySwip simplemente no devuelve resultados — no lanza una excepcion. Hay que manejar el caso de "lista vacia" en el backend.
- Cualquier duda sobre un predicado especifico que no quede claro en esta tabla, preguntame directamente y lo aclaramos o ajustamos entre los dos antes de que armes el endpoint.
