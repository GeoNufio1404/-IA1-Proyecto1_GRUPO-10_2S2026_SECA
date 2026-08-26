# Documentación de API

## Información general

El backend está desarrollado con **FastAPI** y expone una API REST para consultar la información y las reglas de inferencia del sistema experto desarrollado en Prolog.

## URL base en desarrollo

```jsx
http://127.0.0.1:8000/api
```

## Formato de los identificadores

Los identificadores utilizados por la API deben escribirse:

- En minúsculas.
- Sin tildes.
- Sin ñ.
- Usando _ cuando corresponda.

Ejemplos:

```jsx
caso1
caso2
caso3

mario_lopez
carla_ruiz
diego_fernandez
beto_garcia
```

## Casos

### Obtener los casos

```jsx
GET /api/casos
```

Devuelve los casos disponibles para que el usuario pueda seleccionarlos.

Ejemplo de respuesta:

```jsx
[
    {
        "Id": "caso1",
        "Titulo": "El Robo del Prototipo"
    }
]
```

## Sospechosos

### Obtener sospechosos de un caso

```jsx
[
    {
        "Id": "caso1",
        "Titulo": "El Robo del Prototipo"
    }
]
```

Ejemplo:

```jsx
GET /api/casos/caso1/sospechosos
```

Respuesta:

```jsx
[
    {
        "Id": "mario_lopez",
        "Nombre": "Mario López"
    },
    {
        "Id": "carla_ruiz",
        "Nombre": "Carla Ruiz"
    }
]
```

## Oportunidad

### Obtener sospechosos que tuvieron oportunidad

```jsx
GET /api/casos/{caso}/oportunidad
```

Ejemplo:

```jsx
GET /api/casos/caso1/oportunidad
```

Respuesta:

```jsx
{
    "caso": "caso1",
    "oportunidad": [
        {
            "Sospechoso": "mario_lopez"
        }
    ]
}
```

## Motivos

### Obtener sospechosos con motivo

```jsx
GET /api/casos/{caso}/motivos
```

Ejemplo:

```jsx
GET /api/casos/caso1/motivos
```

Respuesta:

```jsx
{
    "caso": "caso1",
    "motivos": [
        {
            "Sospechoso": "mario_lopez"
        }
    ]
}
```

# Coartadas

### Coartadas válidas

```
GET /api/casos/{caso}/coartadas/validas
```

### Coartadas inválidas

```
GET /api/casos/{caso}/coartadas/invalidas
```

Ejemplo:

```
GET /api/casos/caso1/coartadas/invalidas
```

Respuesta:

```
{
    "caso": "caso1",
    "coartadas_invalidas": [
        {
            "Sospechoso": "mario_lopez"
        }
    ]
}
```

# Contradicciones

## Evidencias que contradicen a un sospechoso

```
GET /api/casos/{caso}/contradicciones/evidencias/{sospechoso}
```

Ejemplo:

```
GET /api/casos/caso1/contradicciones/evidencias/mario_lopez
```

Respuesta:

```
{
    "caso": "caso1",
    "sospechoso": "mario_lopez",
    "contradicciones": [
        {
            "Evidencia": "ev2"
        }
    ]
}
```

## Contradicciones entre declaraciones

```
GET /api/casos/{caso}/contradicciones/declaraciones
```

Ejemplo:

```
GET /api/casos/caso1/contradicciones/declaraciones
```

Respuesta:

```
{
    "caso": "caso1",
    "contradicciones": [
        {
            "SospechosoA": "beto_garcia",
            "SospechosoB": "carla_ruiz"
        }
    ]
}
```

# Información falsa

```
GET /api/casos/{caso}/informacion-falsa
```

Ejemplo:

```
GET /api/casos/caso1/informacion-falsa
```

Respuesta:

```
{
    "caso": "caso1",
    "sospechosos": [
        "beto_garcia",
        "carla_ruiz",
        "diego_fernandez",
        "mario_lopez"
    ]
}
```

# Evidencias

## Evidencias relacionadas con un sospechoso

```
GET /api/casos/{caso}/evidencias/{sospechoso}
```

Ejemplo:

```
GET /api/casos/caso1/evidencias/mario_lopez
```

Respuesta:

```
{
    "caso": "caso1",
    "sospechoso": "mario_lopez",
    "evidencias": [
        {
            "Evidencia": "ev2"
        },
        {
            "Evidencia": "ev10"
        }
    ]
}
```

## Total de evidencias

```
GET /api/casos/{caso}/evidencias/{sospechoso}/total
```

Ejemplo:

```
GET /api/casos/caso1/evidencias/mario_lopez/total
```

Respuesta:

```
{
    "caso": "caso1",
    "sospechoso": "mario_lopez",
    "total_evidencias": 2
}
```

# Nivel de sospecha

```
GET /api/casos/{caso}/nivel-sospecha/{sospechoso}
```

Ejemplo:

```
GET /api/casos/caso1/nivel-sospecha/mario_lopez
```

Respuesta:

```
{
    "caso": "caso1",
    "sospechoso": "mario_lopez",
    "nivel_sospecha": 4
}
```

El nivel corresponde al puntaje calculado por las reglas de Prolog.

# Sospechoso principal

```
GET /api/casos/{caso}/sospechoso-principal
```

Ejemplo:

```
GET /api/casos/caso1/sospechoso-principal
```

Respuesta:

```
{
    "caso": "caso1",
    "sospechoso_principal": "mario_lopez"
}
```

# Responsable lógico

```
GET /api/casos/{caso}/responsable
```

Ejemplo:

```
GET /api/casos/caso1/responsable
```

Respuesta:

```
{
    "caso": "caso1",
    "responsable_logico": "mario_lopez"
}
```

# Posibles cómplices

```
GET /api/casos/{caso}/complices
```

Ejemplo:

```
GET /api/casos/caso2/complices
```

Respuesta:

```
{
    "caso": "caso2",
    "posibles_complices": [
        {
            "SospechosoA": "rene_martinez",
            "SospechosoB": "sofia_delgado"
        }
    ]
}
```

# Explicación

```
GET /api/casos/{caso}/explicacion/{sospechoso}
```

Ejemplo:

```
GET /api/casos/caso1/explicacion/mario_lopez
```

Respuesta:

```
{
  "caso": "caso1",
  "sospechoso": "mario_lopez",
  "explicacion": [
    "Tuvo oportunidad: acceso registrado en el lugar del incidente.",
    "Tiene motivo: Queria el credito individual del proyecto.",
    "Tuvo los medios: Conoce el laboratorio y el equipo.",
    "Su coartada es invalida: contradicha por evidencia o declaracion."
  ]
}
```

El frontend puede mostrar esta lista como las razones por las cuales el sistema señala al sospechoso.

# Validaciones

El backend valida que:

1. El caso exista.
2. El sospechoso pertenezca al caso indicado.

Por ejemplo:

```
GET /api/casos/caso2/explicacion/mario_lopez
```

Si `mario_lopez` pertenece a `caso1` y no a `caso2`, el backend devuelve:

```
{
    "detail": "El sospechoso 'mario_lopez' no pertenece al caso 'caso2'."
}
```

Por lo tanto, el frontend **no necesita implementar esta validación por su cuenta** para determinar si un sospechoso pertenece al caso.

| Funcionalidad | Endpoint |
| --- | --- |
| Casos | `GET /api/casos` |
| Sospechosos | `GET /api/casos/{caso}/sospechosos` |
| Oportunidad | `GET /api/casos/{caso}/oportunidad` |
| Motivos | `GET /api/casos/{caso}/motivos` |
| Medios | `GET /api/casos/{caso}/medios` |
| Coartadas válidas | `GET /api/casos/{caso}/coartadas/validas` |
| Coartadas inválidas | `GET /api/casos/{caso}/coartadas/invalidas` |
| Contradicciones de evidencia | `GET /api/casos/{caso}/contradicciones/evidencias/{sospechoso}` |
| Contradicciones entre declaraciones | `GET /api/casos/{caso}/contradicciones/declaraciones` |
| Información falsa | `GET /api/casos/{caso}/informacion-falsa` |
| Evidencias | `GET /api/casos/{caso}/evidencias/{sospechoso}` |
| Total de evidencias | `GET /api/casos/{caso}/evidencias/{sospechoso}/total` |
| Nivel de sospecha | `GET /api/casos/{caso}/nivel-sospecha/{sospechoso}` |
| Sospechoso principal | `GET /api/casos/{caso}/sospechoso-principal` |
| Responsable lógico | `GET /api/casos/{caso}/responsable` |
| Cómplices | `GET /api/casos/{caso}/complices` |
| Explicación | `GET /api/casos/{caso}/explicacion/{sospechoso}` |