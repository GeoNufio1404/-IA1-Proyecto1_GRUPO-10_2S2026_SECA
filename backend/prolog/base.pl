% ===========================================================================
% Base de conocimiento
% ===========================================================================
% Placeholder minimo. Su unica funcion hoy es demostrar que el contenedor
% desplegado logra cargar SWI-Prolog y resolver un objetivo, es decir, validar
% el pipeline de CI/CD de extremo a extremo.
%
% Aqui va la logica de tu proyecto cuando la escribas.
% ===========================================================================

% Version de la base. El endpoint /api/health la reporta, asi que sirve para
% confirmar de un vistazo que Cloud Run esta sirviendo el commit correcto.
version_kb('0.1.0').

% Predicado de humo: si /api/health devuelve prolog_ok = true, entonces
% Python cargo libswipl, consulto este archivo y resolvio un objetivo.
ping(pong).

:- discontiguous caso/2.
:- discontiguous sospechoso/3.
:- discontiguous lugar/3.
:- discontiguous lugar_del_incidente/2.
:- discontiguous evidencia/4.
:- discontiguous evidencia_senala/3.
:- discontiguous declaracion/4.
:- discontiguous contradice/3.
:- discontiguous contradice_decl/3.
:- discontiguous motivo/3.
:- discontiguous acceso_registrado/4.
:- discontiguous medios_disponibles/3.

% Necesario para que el modulo administrativo pueda agregar hechos en
% tiempo de ejecucion (assertz). Sin esto, Prolog los trata como "estaticos"
% (ya tienen clausulas cargadas desde el archivo) y assertz lanza un error.
:- dynamic caso/2.
:- dynamic sospechoso/3.
:- dynamic lugar/3.
:- dynamic lugar_del_incidente/2.
:- dynamic evidencia/4.
:- dynamic evidencia_senala/3.
:- dynamic declaracion/4.
:- dynamic contradice/3.
:- dynamic contradice_decl/3.
:- dynamic motivo/3.
:- dynamic acceso_registrado/4.
:- dynamic medios_disponibles/3.

% ===========================================================================
% CASO 1: El Robo del Prototipo
% ===========================================================================

caso(caso1, 'El Robo del Prototipo').

% --- Sospechosos ---
sospechoso(caso1, mario_lopez,     'Mario López').
sospechoso(caso1, carla_ruiz,      'Carla Ruiz').
sospechoso(caso1, diego_fernandez, 'Diego Fernández').
sospechoso(caso1, beto_garcia,     'Beto García').

% --- Lugares ---
lugar(caso1, laboratorio_robotica, 'Laboratorio de Robótica').
lugar(caso1, entrada_principal,    'Entrada principal del edificio').
lugar(caso1, pasillo_lab,          'Pasillo frente al laboratorio').
lugar(caso1, oficina_asistente,    'Oficina del asistente de laboratorio').
lugar(caso1, estacionamiento,      'Estacionamiento de la facultad').

% El lugar donde ocurrió el robo en sí (para calcular "oportunidad" después)
lugar_del_incidente(caso1, laboratorio_robotica).

% --- Evidencias ---
% evidencia(Caso, Id, Descripcion, Lugar)
evidencia(caso1, ev1,  'Huella dactilar en la ventana del laboratorio', laboratorio_robotica).
evidencia(caso1, ev2,  'Registro de tarjeta de acceso a nombre de Mario a las 23:45', entrada_principal).
evidencia(caso1, ev3,  'Cámara de seguridad del pasillo apagada esa noche', pasillo_lab).
evidencia(caso1, ev4,  'Mensaje de texto de Diego: voy a ganar como sea', entrada_principal).
evidencia(caso1, ev5,  'Reporte de la llave maestra del conserje perdida por 2 horas', pasillo_lab).
evidencia(caso1, ev6,  'Caja vacía del prototipo encontrada en el estacionamiento', estacionamiento).
evidencia(caso1, ev7,  'Huella de bota de trabajo cerca de la caja vacía', estacionamiento).
evidencia(caso1, ev8,  'Correo de Carla pidiendo un préstamo urgente de dinero', oficina_asistente).
evidencia(caso1, ev9,  'Registro de acceso de invitado a nombre de Diego a las 22:00', entrada_principal).
evidencia(caso1, ev10, 'Destornillador fuera de su lugar habitual, con uso reciente', laboratorio_robotica).

% --- A quién señala cada evidencia (nos sirve luego para las reglas) ---
evidencia_senala(caso1, ev2,  mario_lopez).
evidencia_senala(caso1, ev4,  diego_fernandez).
evidencia_senala(caso1, ev5,  beto_garcia).
evidencia_senala(caso1, ev7,  beto_garcia).
evidencia_senala(caso1, ev8,  carla_ruiz).
evidencia_senala(caso1, ev9,  diego_fernandez).
evidencia_senala(caso1, ev10, mario_lopez).

% --- Declaraciones ---
% declaracion(Caso, Id, Sospechoso, Contenido)
declaracion(caso1, decl1, mario_lopez,     'Dice que se fue del campus a las 8:00 pm y no regreso.').
declaracion(caso1, decl2, carla_ruiz,      'Dice que cerró el laboratorio a las 9:00 pm y se fue a casa.').
declaracion(caso1, decl3, diego_fernandez, 'Dice que nunca estuvo en el edificio esa noche.').
declaracion(caso1, decl4, beto_garcia,     'Dice que hizo su ronda normal sin notar nada extraño.').
declaracion(caso1, decl5, testigo,         'Vio a alguien correr hacia el estacionamiento después de medianoche.').
declaracion(caso1, decl6, beto_garcia, 'Dice haber visto a Carla saliendo del edificio hasta las 10:30 pm, no a las 9:00 pm como ella afirma.').

% --- Qué declaración contradice qué evidencia (esto alimentará la regla de coartada inválida) ---
contradice(caso1, decl1, ev2).
contradice(caso1, decl3, ev9).
contradice(caso1, decl4, ev5).

% contradice_decl(Caso, DeclaracionA, DeclaracionB)
contradice_decl(caso1, decl6, decl2).

% --- Motivos identificados ---
motivo(caso1, mario_lopez,     'Queria el credito individual del proyecto').
motivo(caso1, carla_ruiz,      'Problemas economicos').
motivo(caso1, diego_fernandez, 'Queria eliminar competencia para ganar').

% --- Registros de acceso (quién entró, a qué lugar, a qué hora) ---
acceso_registrado(caso1, mario_lopez,     laboratorio_robotica, hora(23,45)).
acceso_registrado(caso1, carla_ruiz,      laboratorio_robotica, hora(21,0)).
acceso_registrado(caso1, diego_fernandez, entrada_principal,    hora(22,0)).
acceso_registrado(caso1, beto_garcia,     pasillo_lab,          hora(23,0)).

% --- Medios disponibles (herramientas/conocimiento para cometer el robo) ---
medios_disponibles(caso1, mario_lopez,     'Conoce el laboratorio y el equipo').
medios_disponibles(caso1, carla_ruiz,      'Tiene llaves y acceso total').
medios_disponibles(caso1, beto_garcia,     'Tiene llaves de todo el edificio').

% ===========================================================================
% CASO 2: El Sabotaje del Proyecto de Graduacion
% ===========================================================================

caso(caso2, 'El Sabotaje del Proyecto de Graduacion').

% --- Sospechosos ---
sospechoso(caso2, rene_martinez,    'Rene Martinez').
sospechoso(caso2, sofia_delgado,    'Sofia Delgado').
sospechoso(caso2, profesor_mendez,  'Profesor Mendez').
sospechoso(caso2, tecnico_sistemas, 'Tecnico de Sistemas (Ivan Cos)').

% --- Lugares ---
lugar(caso2, laboratorio_computo, 'Laboratorio de Computo').
lugar(caso2, sala_servidores,     'Sala de Servidores').
lugar(caso2, cubiculo_asesor,     'Cubiculo del profesor asesor').
lugar(caso2, biblioteca,          'Biblioteca').
lugar(caso2, cafeteria,           'Cafeteria de la Facultad').

% El sabotaje (borrado de archivos y respaldos) ocurrio desde la sala de servidores.
lugar_del_incidente(caso2, sala_servidores).

% --- Evidencias ---
evidencia(caso2, ev1,  'Registro de acceso remoto a la cuenta de la victima a las 2:00 am', sala_servidores).
evidencia(caso2, ev2,  'Historial de chat con amenaza de Rene: te vas a arrepentir', laboratorio_computo).
evidencia(caso2, ev3,  'Camara del laboratorio de computo desconectada esa noche', laboratorio_computo).
evidencia(caso2, ev4,  'Respaldo en la nube borrado desde la cuenta de Sofia', sala_servidores).
evidencia(caso2, ev5,  'Correo del profesor expresando preocupacion por su prestigio', cubiculo_asesor).
evidencia(caso2, ev6,  'Testigo vio al tecnico entrar al laboratorio fuera de horario', laboratorio_computo).
evidencia(caso2, ev7,  'Registro de la llave de la sala de servidores usada por el tecnico esa noche', sala_servidores).
evidencia(caso2, ev8,  'Publicacion en redes sociales de Sofia esa noche, ubicada en otra ciudad', biblioteca).
evidencia(caso2, ev9,  'Conexion VPN usada para ocultar la IP real, desde la cuenta de Rene', laboratorio_computo).
evidencia(caso2, ev10, 'Recibo de cafe comprado por el profesor en la cafeteria a la hora del incidente', cafeteria).

% --- A quien senala cada evidencia ---
evidencia_senala(caso2, ev2,  rene_martinez).
evidencia_senala(caso2, ev4,  sofia_delgado).
evidencia_senala(caso2, ev5,  profesor_mendez).
evidencia_senala(caso2, ev6,  tecnico_sistemas).
evidencia_senala(caso2, ev7,  tecnico_sistemas).
evidencia_senala(caso2, ev8,  sofia_delgado).
evidencia_senala(caso2, ev9,  rene_martinez).
evidencia_senala(caso2, ev10, profesor_mendez).

% --- Declaraciones ---
declaracion(caso2, decl1, rene_martinez,    'Dice que esa noche estaba durmiendo en su casa.').
declaracion(caso2, decl2, sofia_delgado,    'Dice que estuvo en la biblioteca estudiando toda la noche.').
declaracion(caso2, decl3, profesor_mendez,  'Dice que estuvo en la cafeteria trabajando hasta tarde.').
declaracion(caso2, decl4, tecnico_sistemas, 'Dice que no entro al laboratorio esa noche.').
declaracion(caso2, decl5, testigo,          'Vio luces encendidas en el laboratorio de computo pasada la medianoche.').
declaracion(caso2, decl6, tecnico_sistemas, 'Dice haber visto a Rene saliendo del campus a la 1:00 am esa noche.').

% --- Contradicciones: declaracion vs evidencia ---
contradice(caso2, decl1, ev9).
contradice(caso2, decl2, ev8).
contradice(caso2, decl4, ev6).
contradice(caso2, decl4, ev7).

% --- Contradiccion: declaracion vs declaracion ---
% decl6 (el tecnico dice haber visto a Rene fuera del campus) contradice
% decl1 (Rene dice que estaba durmiendo en su casa, es decir, no salio).
contradice_decl(caso2, decl6, decl1).

% --- Motivos identificados ---
motivo(caso2, rene_martinez,   'Conflicto por la autoria del trabajo').
motivo(caso2, sofia_delgado,   'Resentimiento personal').
motivo(caso2, profesor_mendez, 'Miedo a quedar mal si el proyecto fallaba').
% tecnico_sistemas: sin motivo identificado, no se agrega hecho.

% --- Registros de acceso ---
acceso_registrado(caso2, rene_martinez,    sala_servidores,     hora(2,0)).
acceso_registrado(caso2, sofia_delgado,    sala_servidores,     hora(2,15)).
acceso_registrado(caso2, tecnico_sistemas, sala_servidores,     hora(23,30)).
acceso_registrado(caso2, profesor_mendez,  cafeteria,           hora(23,0)).

% --- Medios disponibles ---
medios_disponibles(caso2, rene_martinez,    'Conocimiento tecnico avanzado').
medios_disponibles(caso2, sofia_delgado,    'Acceso a la cuenta en la nube de la victima').
medios_disponibles(caso2, tecnico_sistemas, 'Control total del sistema y llaves').
% profesor_mendez: sin medios tecnicos directos, no se agrega hecho.


% ===========================================================================
% CASO 3: La Muerte del Ingeniero Espino
% ===========================================================================

caso(caso3, 'La Muerte del Ingeniero Espino').

% --- Sospechosos ---
sospechoso(caso3, estudiante_alvarez, 'Estudiante Alvarez').
sospechoso(caso3, secretaria_paz,     'Secretaria Paz').
sospechoso(caso3, colega_rios,        'Colega Rios').
sospechoso(caso3, sobrino_torres,     'Sobrino Torres').

% --- Lugares ---
lugar(caso3, oficina_ingeniero,       'Oficina del ingeniero').
lugar(caso3, sala_cafe_facultad,      'Sala de cafe de la facultad').
lugar(caso3, estacionamiento_docentes,'Estacionamiento de docentes').
lugar(caso3, salon_clases,            'Salon de clases').
lugar(caso3, pasillo_administrativo,  'Pasillo administrativo').

% El envenenamiento se origino en la oficina (donde se tomo el cafe).
lugar_del_incidente(caso3, oficina_ingeniero).

% --- Evidencias ---
evidencia(caso3, ev1,  'Taza de cafe con restos de una sustancia toxica', oficina_ingeniero).
evidencia(caso3, ev2,  'Camara de la sala de cafe mostrando a la secretaria preparando el cafe del ingeniero', sala_cafe_facultad).
evidencia(caso3, ev3,  'Recibo de compra en farmacia de una sustancia quimica usada como veneno', estacionamiento_docentes).
evidencia(caso3, ev4,  'Registro de acceso a la oficina la noche anterior a nombre del sobrino', oficina_ingeniero).
evidencia(caso3, ev5,  'Correos entre el colega Rios y el ingeniero discutiendo por la plaza de investigacion', pasillo_administrativo).
evidencia(caso3, ev6,  'Testigo vio al estudiante Alvarez merodeando cerca de la oficina esa tarde', pasillo_administrativo).
evidencia(caso3, ev7,  'Documento de herencia: el sobrino es el unico beneficiario', oficina_ingeniero).
evidencia(caso3, ev8,  'Registro de horario: la secretaria salio antes de su turno esa noche', sala_cafe_facultad).
evidencia(caso3, ev9,  'Huellas del colega Rios en la puerta de la oficina, pese a negar haber estado ahi', oficina_ingeniero).
evidencia(caso3, ev10, 'Reporte medico preliminar que confirma la sustancia toxica hallada en la taza', oficina_ingeniero).

% --- A quien senala cada evidencia ---
evidencia_senala(caso3, ev2, secretaria_paz).
evidencia_senala(caso3, ev3, estudiante_alvarez).
evidencia_senala(caso3, ev4, sobrino_torres).
evidencia_senala(caso3, ev5, colega_rios).
evidencia_senala(caso3, ev6, estudiante_alvarez).
evidencia_senala(caso3, ev7, sobrino_torres).
evidencia_senala(caso3, ev8, secretaria_paz).
evidencia_senala(caso3, ev9, colega_rios).
% ev1 y ev10: confirman el envenenamiento en general, no senalan a nadie en particular.

% --- Declaraciones ---
declaracion(caso3, decl1, estudiante_alvarez, 'Dice que esa tarde estuvo en la biblioteca estudiando.').
declaracion(caso3, decl2, secretaria_paz,     'Dice que se quedo hasta el final de su turno como siempre.').
declaracion(caso3, decl3, colega_rios,        'Dice que nunca entro a la oficina del ingeniero ese dia.').
declaracion(caso3, decl4, sobrino_torres,     'Dice que no estuvo en la universidad esa noche.').
declaracion(caso3, decl5, testigo,            'Vio al ingeniero tomando su cafe con normalidad antes de las 6 pm, sin quejarse de malestar.').
declaracion(caso3, decl6, colega_rios,        'Dice haber visto al estudiante Alvarez cerca de la oficina minutos antes de las 6 pm.').

% --- Contradicciones: declaracion vs evidencia ---
contradice(caso3, decl1, ev6).
contradice(caso3, decl2, ev8).
contradice(caso3, decl3, ev9).
contradice(caso3, decl4, ev4).

% --- Contradiccion: declaracion vs declaracion ---
% decl6 (el colega dice haber visto al estudiante cerca de la oficina)
% contradice decl1 (el estudiante dice que estuvo en la biblioteca).
contradice_decl(caso3, decl6, decl1).

% --- Motivos identificados ---
motivo(caso3, estudiante_alvarez, 'Evitar perder el curso y quedar fuera de la carrera').
motivo(caso3, secretaria_paz,     'Conflicto laboral y economico con el ingeniero').
motivo(caso3, colega_rios,        'Eliminar competencia por la plaza de investigacion').
motivo(caso3, sobrino_torres,     'Heredar los bienes del ingeniero').

% --- Registros de acceso ---
% Nota: el estudiante solo tiene registro en el pasillo (merodeo),
% no dentro de la oficina, a proposito - eso lo distingue de los demas.
acceso_registrado(caso3, secretaria_paz,     oficina_ingeniero,      hora(17,45)).
acceso_registrado(caso3, colega_rios,        oficina_ingeniero,      hora(17,30)).
acceso_registrado(caso3, sobrino_torres,     oficina_ingeniero,      hora(21,0)).
acceso_registrado(caso3, estudiante_alvarez, pasillo_administrativo, hora(17,0)).

% --- Medios disponibles ---
% Solo la secretaria tiene acceso DIRECTO para preparar/servir el cafe;
% el estudiante tiene el medio quimico, pero no acceso directo al cafe.
% Colega y sobrino no tienen un medio directo identificado - a proposito,
% para que la logica los descarte como responsables aunque tengan motivo.
medios_disponibles(caso3, secretaria_paz,     'Unico con acceso directo para preparar y servir el cafe').
medios_disponibles(caso3, estudiante_alvarez, 'Compro una sustancia quimica que pudo usarse como veneno').

% ===========================================================================
% REGLAS - se aplican a cualquier caso (caso1, caso2, caso3)
% ===========================================================================

% -- Bloque 1: condiciones basicas de un sospechoso -

% Tuvo acceso a un lugar cualquiera (no necesariamente el del incidente).
tuvo_acceso(Caso, Sospechoso, Lugar) :-
    acceso_registrado(Caso, Sospechoso, Lugar, _).

% Tuvo oportunidad si su acceso registrado coincide con el lugar del incidente.
tuvo_oportunidad(Caso, Sospechoso) :-
    lugar_del_incidente(Caso, Lugar),
    acceso_registrado(Caso, Sospechoso, Lugar, _).

% Envoltorio de motivo/3, para no depender del nombre exacto del hecho.
tiene_motivo(Caso, Sospechoso) :-
    motivo(Caso, Sospechoso, _).

% Envoltorio de medios_disponibles/3, mismo motivo que arriba.
tuvo_medios(Caso, Sospechoso) :-
    medios_disponibles(Caso, Sospechoso, _).

% -- Bloque 2: contradicciones --

% Version consultable de una contradiccion entre declaracion y evidencia.
contradiccion_evidencia(Caso, Sospechoso, Evidencia) :-
    contradice(Caso, Decl, Evidencia),
    declaracion(Caso, Decl, Sospechoso, _).

% Dos sospechosos se contradicen si sus declaraciones chocan entre si.
% \= significa "no unifica con" (son personas distintas).
contradiccion_declaraciones(Caso, SospechosoA, SospechosoB) :-
    contradice_decl(Caso, DeclA, DeclB),
    declaracion(Caso, DeclA, SospechosoA, _),
    declaracion(Caso, DeclB, SospechosoB, _),
    SospechosoA \= SospechosoB.

% Indica si una declaracion especifica fue contradicha, ya sea por
% evidencia o por otra declaracion (en cualquiera de los dos lados).
declaracion_contradicha(Caso, DeclId) :-
    contradice(Caso, DeclId, _).
declaracion_contradicha(Caso, DeclId) :-
    contradice_decl(Caso, DeclId, _).
declaracion_contradicha(Caso, DeclId) :-
    contradice_decl(Caso, _, DeclId).

% -- Bloque 3: coartadas --

% Coartada invalida si existe una contradiccion contra evidencia.
coartada_invalida(Caso, Sospechoso) :-
    contradice(Caso, Decl, _Evidencia),
    declaracion(Caso, Decl, Sospechoso, _).

% Coartada valida: negacion por fallo (\+). Prolog intenta probar
% coartada_invalida y, si no lo logra, la da por valida.
coartada_valida(Caso, Sospechoso) :-
    sospechoso(Caso, Sospechoso, _),
    \+ coartada_invalida(Caso, Sospechoso).

% -- Bloque 4: informacion falsa y evidencias --

% Dio informacion falsa si contradice una evidencia,
% o si aparece en cualquiera de los dos lados de una
% contradiccion entre declaraciones.
informacion_falsa(Caso, Sospechoso) :-
    contradiccion_evidencia(Caso, Sospechoso, _).
informacion_falsa(Caso, Sospechoso) :-
    contradiccion_declaraciones(Caso, Sospechoso, _).
informacion_falsa(Caso, Sospechoso) :-
    contradiccion_declaraciones(Caso, _, Sospechoso).

% Version sin duplicados, util para mostrar listas en la interfaz.
sospechosos_con_info_falsa(Caso, Lista) :-
    findall(S, informacion_falsa(Caso, S), Bruta),
    sort(Bruta, Lista).

% Evidencias que senalan a un sospechoso en particular.
evidencia_relacionada(Caso, Sospechoso, Evidencia) :-
    evidencia_senala(Caso, Evidencia, Sospechoso).

% -- Bloque 5: nivel de sospecha --

% Suma las 4 condiciones principales (0 o 1 cada una).
% -> es if-then: si la condicion es verdadera, asigna 1; si falla, 0.
nivel_sospecha(Caso, Sospechoso, Nivel) :-
    sospechoso(Caso, Sospechoso, _),
    ( tuvo_oportunidad(Caso, Sospechoso)  -> A = 1 ; A = 0 ),
    ( tiene_motivo(Caso, Sospechoso)      -> B = 1 ; B = 0 ),
    ( tuvo_medios(Caso, Sospechoso)       -> C = 1 ; C = 0 ),
    ( coartada_invalida(Caso, Sospechoso) -> D = 1 ; D = 0 ),
    Nivel is A + B + C + D.

% Clasifica un nivel numerico en una categoria de texto.
% El ! (corte) evita que Prolog seleccione mas de una categoria.
clasificar_nivel(Nivel, alto) :-
    Nivel >= 3, !.
clasificar_nivel(Nivel, medio) :-
    Nivel >= 2, !.
clasificar_nivel(_, bajo).

% -- Bloque 6: conclusiones del caso --

% El sospechoso con el nivel de sospecha mas alto entre todos.
sospechoso_principal(Caso, Sospechoso) :-
    findall(Nivel-S, nivel_sospecha(Caso, S, Nivel), Pares),
    max_member(_-Sospechoso, Pares).

% Cumple las 4 condiciones principales a la vez.
responsable_logico(Caso, Sospechoso) :-
    tuvo_oportunidad(Caso, Sospechoso),
    tiene_motivo(Caso, Sospechoso),
    tuvo_medios(Caso, Sospechoso),
    coartada_invalida(Caso, Sospechoso).

% Dos sospechosos distintos son posibles complices si ambos
% califican como responsable_logico. @< evita pares duplicados
% en distinto orden (ej. mario-diego y diego-mario).
posibles_complices(Caso, SospechosoA, SospechosoB) :-
    responsable_logico(Caso, SospechosoA),
    responsable_logico(Caso, SospechosoB),
    SospechosoA @< SospechosoB.

% -- Bloque 7: utilidades con recursividad --

% Cuenta los elementos de una lista sin usar length/2 nativo.
% Caso base: lista vacia tiene 0 elementos.
contar_elementos([], 0).
% Caso recursivo: cuenta el resto y le suma 1.
contar_elementos([_Cabeza|Resto], Total) :-
    contar_elementos(Resto, TotalResto),
    Total is TotalResto + 1.

% Total de evidencias que senalan a un sospechoso.
total_evidencias_sospechoso(Caso, Sospechoso, Total) :-
    findall(Ev, evidencia_relacionada(Caso, Sospechoso, Ev), ListaEvidencias),
    contar_elementos(ListaEvidencias, Total).

% -- Bloque 8: explicacion logica (al final, porque depende de todo lo anterior) --

% Cada razon_valida representa una condicion que el sospechoso cumple.
razon_valida(Caso, Sospechoso, 'Tuvo oportunidad: acceso registrado en el lugar del incidente.') :-
    tuvo_oportunidad(Caso, Sospechoso).
razon_valida(Caso, Sospechoso, Texto) :-
    motivo(Caso, Sospechoso, Detalle),
    format(atom(Texto), 'Tiene motivo: ~w.', [Detalle]).
razon_valida(Caso, Sospechoso, Texto) :-
    medios_disponibles(Caso, Sospechoso, Detalle),
    format(atom(Texto), 'Tuvo los medios: ~w.', [Detalle]).
razon_valida(Caso, Sospechoso, 'Su coartada es invalida: contradicha por evidencia o declaracion.') :-
    coartada_invalida(Caso, Sospechoso).

% Junta todas las razones validas de un sospechoso en una sola lista.
% Esto es lo que la interfaz muestra como "explicacion logica" del caso.
explicacion(Caso, Sospechoso, Razones) :-
    sospechoso(Caso, Sospechoso, _),
    findall(Razon, razon_valida(Caso, Sospechoso, Razon), Razones).


% ===========================================================================
% LINEA DE TIEMPO - eventos cronologicos (accesos + evidencias)
% ===========================================================================

evento_cronologico(Caso, hora(H, M), acceso, Sospechoso, Lugar, Descripcion) :-
    acceso_registrado(Caso, Sospechoso, Lugar, hora(H, M)),
    lugar(Caso, Lugar, NombreLugar),
    format(atom(Descripcion), 'Ingreso a ~w', [NombreLugar]).

evento_cronologico(Caso, hora(H, M), evidencia, Sospechoso, Lugar, DescripEvid) :-
    acceso_registrado(Caso, Sospechoso, Lugar, hora(H, M)),
    evidencia_senala(Caso, EvId, Sospechoso),
    evidencia(Caso, EvId, DescripEvid, _).

% ===========================================================================
% PERSISTENCIA - permite que el modulo administrativo cree casos, sospechosos,
% evidencias, etc., y que sobrevivan un reinicio del backend.
%
% Los 3 casos de fabrica quedan intactos arriba en este mismo archivo. Todo
% lo que se cree desde el admin se guarda aparte, en casos_admin.pl, y se
% vuelve a cargar cada vez que arranca el servidor.
% ===========================================================================

:- dynamic archivo_admin/1.

% La ruta se calcula UNA sola vez, mientras este archivo se esta cargando
% (prolog_load_context solo tiene valor valido en ese momento exacto), y se
% guarda como un hecho fijo para poder usarla despues, desde cualquier
% consulta futura (ej. cuando el backend llama crear_caso a las 3 semanas).
:- prolog_load_context(directory, Dir),
   atomic_list_concat([Dir, '/casos_admin.pl'], Ruta),
   assertz(archivo_admin(Ruta)).

% No se usa consult/1 para recargar. Si dos archivos distintos definen el
% mismo predicado (caso/2 en base.pl Y en casos_admin.pl), SWI-Prolog trata
% la segunda carga como una REDEFINICION y borra las clausulas del primer
% archivo -- justo lo que NO queremos (borraria los Casos 1, 2 y 3). En vez
% de eso, se leen los terminos uno por uno y se agregan con assertz, que si
% acumula sin pisar lo que ya existe.
cargar_hechos_desde(Stream) :-
    read(Stream, Termino),
    ( Termino == end_of_file
    -> true
    ;  ( catch(assertz(Termino), _, true),
         cargar_hechos_desde(Stream) )
    ).

:- archivo_admin(Ruta),
   ( exists_file(Ruta)
   -> setup_call_cleanup(
          open(Ruta, read, Stream),
          cargar_hechos_desde(Stream),
          close(Stream)
      )
   ;  true
   ).

% Escribe un hecho en memoria (assertz) Y en disco (para que persista).
guardar_hecho(Hecho) :-
    assertz(Hecho),
    archivo_admin(Ruta),
    setup_call_cleanup(
        open(Ruta, append, Stream),
        portray_clause(Stream, Hecho),
        close(Stream)
    ).

% --- Predicados que el backend llama, uno por cada tipo de dato ---
% Cada uno valida antes de guardar: que el caso/sospechoso exista, y que
% no se este duplicando algo que ya existe.

crear_caso(Id, Titulo) :-
    \+ caso(Id, _),
    guardar_hecho(caso(Id, Titulo)).

agregar_sospechoso(Caso, Id, Nombre) :-
    caso(Caso, _),
    \+ sospechoso(Caso, Id, _),
    guardar_hecho(sospechoso(Caso, Id, Nombre)).

agregar_lugar(Caso, Id, Nombre) :-
    caso(Caso, _),
    \+ lugar(Caso, Id, _),
    guardar_hecho(lugar(Caso, Id, Nombre)).

definir_lugar_incidente(Caso, LugarId) :-
    caso(Caso, _),
    lugar(Caso, LugarId, _),
    guardar_hecho(lugar_del_incidente(Caso, LugarId)).

agregar_evidencia(Caso, Id, Descripcion, Lugar) :-
    caso(Caso, _),
    lugar(Caso, Lugar, _),
    \+ evidencia(Caso, Id, _, _),
    guardar_hecho(evidencia(Caso, Id, Descripcion, Lugar)).

agregar_declaracion(Caso, Id, Sospechoso, Texto) :-
    caso(Caso, _),
    sospechoso(Caso, Sospechoso, _),
    \+ declaracion(Caso, Id, _, _),
    guardar_hecho(declaracion(Caso, Id, Sospechoso, Texto)).

agregar_motivo(Caso, Sospechoso, Detalle) :-
    sospechoso(Caso, Sospechoso, _),
    guardar_hecho(motivo(Caso, Sospechoso, Detalle)).

agregar_medios(Caso, Sospechoso, Detalle) :-
    sospechoso(Caso, Sospechoso, _),
    guardar_hecho(medios_disponibles(Caso, Sospechoso, Detalle)).

agregar_acceso(Caso, Sospechoso, Lugar, Hora) :-
    sospechoso(Caso, Sospechoso, _),
    lugar(Caso, Lugar, _),
    guardar_hecho(acceso_registrado(Caso, Sospechoso, Lugar, Hora)).

agregar_contradiccion_evidencia(Caso, DeclId, EvidenciaId) :-
    declaracion(Caso, DeclId, _, _),
    evidencia(Caso, EvidenciaId, _, _),
    guardar_hecho(contradice(Caso, DeclId, EvidenciaId)).

agregar_contradiccion_declaracion(Caso, DeclA, DeclB) :-
    declaracion(Caso, DeclA, _, _),
    declaracion(Caso, DeclB, _, _),
    guardar_hecho(contradice_decl(Caso, DeclA, DeclB)).

agregar_evidencia_senala(Caso, EvidenciaId, Sospechoso) :-
    evidencia(Caso, EvidenciaId, _, _),
    sospechoso(Caso, Sospechoso, _),
    guardar_hecho(evidencia_senala(Caso, EvidenciaId, Sospechoso)).