# Especificación T-20: proteger main, CI y revisión en pares

Estado: propuesta pendiente de aprobación; no autoriza implementación.
Fecha de revisión: 14/11/2026, America/Lima. Base local: `031eb92`.
Plan: [tasks/plan.md](tasks/plan.md), sección T-20.
Seguimiento: [tasks/todo.md](tasks/todo.md), sección T-20.

## Objetivo y caso de uso

Como integrante del equipo, quiero integrar cambios a `main` exclusivamente por
pull request, con pruebas satisfactorias y aprobación de otro integrante, para
evitar cambios sin revisión y dejar evidencia verificable de la retrospectiva
del Sprint 1. T-20 reemplaza a SCRUM-103. Planning Poker queda pendiente del equipo.

El usuario confirmó que el destino es **lovito99/gestioncapa**, remoto `upstream`.
`origin` apunta al fork **251012-sharmely/gestioncapa**; proteger ese fork por sí
solo no cumple la tarea. El autor trabaja en su rama; el administrador configura
GitHub y otro integrante con escritura publica la aprobación.

Esta es una sola política de integración: protección, CI y revisión aportan sus
condiciones y evidencia. No se añaden módulos al producto ni se despliega software.

## Decisiones confirmadas y supuestos por validar

- Conservar íntegramente los planes CPPP/T-23 y añadir T-20 al final de los dos
  archivos de `tasks/`, según respuesta expresa del usuario. Sus tareas y los
  marcadores de conflicto existentes no se resuelven en T-20.
- Preparar especificación y plan juntos, por solicitud expresa del usuario,
  y detenerse antes de escribir código o modificar la configuración de GitHub.
- La rama actual y el PR previo #24 usan `SCRUM-118`; falta confirmar su
  correspondencia en Jira. `T-20` es el identificador de trabajo; no sustituye
  una clave real. No reutilizar SCRUM-103.
- Se propone mantener la regla clásica descrita en `docs/calidad.md`, para el
  patrón exacto `main`, sin crear además un ruleset equivalente.
- La aprobación del plan no cambia las reglas de Git y build manuales de
  [AGENTS.md](AGENTS.md). El agente preparará mensajes; el usuario hará commits,
  publicaciones de la rama, PR y merge. Un administrador activará la protección.

## Estado comprobado e inconsistencias

Consultas públicas de solo lectura realizadas el 14/11/2026; no son una promesa
del estado futuro ni una verificación de cambios todavía no implementados.

| Hallazgo | Evidencia e implicación |
|---|---|
| `main` central sin protección | [API de la rama](https://api.github.com/repos/lovito99/gestioncapa/branches/main): `protected: false`; [rulesets](https://api.github.com/repos/lovito99/gestioncapa/rulesets): lista vacía. Guardar YAML o documentación no activa la protección. |
| El antecedente `ced5c2a` existe | Commit local del 26/10/2026; [API de PR asociados](https://api.github.com/repos/lovito99/gestioncapa/commits/ced5c2a9477990b729d285c988532fe38a190c9c/pulls): lista vacía, compatible con el ingreso directo descrito. No se reescribe ese historial. |
| Ambos workflows ya atienden PR | `calidad.yml`: `opened`, `synchronize`, `reopened`, `edited`; `e2e.yml`: eventos predeterminados de PR. Sin filtros de rutas o ramas para PR. La clave Jira ya se comprueba por rama o título, también al editar el PR. |
| Último PR de T-20 integrado sin cierre completo | [PR #24](https://github.com/lovito99/gestioncapa/pull/24), integrado el 07/11/2026 en Lima: [Calidad satisfactoria](https://github.com/lovito99/gestioncapa/actions/runs/42440069236), [E2E fallida](https://github.com/lovito99/gestioncapa/actions/runs/42440069254). [Revisiones](https://api.github.com/repos/lovito99/gestioncapa/pulls/24/reviews): solo `COMMENTED` de Copilot, sin aprobación humana registrada. No acredita el cierre de T-20. |
| E2E sigue fallando en la base actual | SHA `031eb9239af79fbe87ce715f7a23ae11be00834b`: [Calidad success](https://github.com/lovito99/gestioncapa/actions/runs/42542528998); [E2E failure](https://github.com/lovito99/gestioncapa/actions/runs/42542528888). El [job](https://github.com/lovito99/gestioncapa/actions/runs/42542528888/job/128920426576) pasó instalación, tipos, build y demo; falló en **E2E real**. La causa raíz aún no está determinada. |
| El fallo observado no es `startup_failure` | La [check suite](https://api.github.com/repos/lovito99/gestioncapa/check-suites/115234286891) terminó `completed/failure`. La anotación solo informa salida 1; el aviso de Node 20 en upload-artifact no demuestra la causa, y la subida de artefactos pasó. |
| Documentación contradictoria | `docs/calidad.md` habla de dos jobs, pero Calidad tiene tres; `docs/esp/calidad.md` exige «Calidad» y la plantilla enumera cuatro checks concretos. `README.md` afirma que se conserva el lockfile, pero `git ls-files` no registra ninguno: el local está ignorado por `.gitignore`. `docs/e2e.md` recomienda `npm ci` para un clon que carece de lockfile versionado. |
| Seguimiento anterior incompleto | `tasks/todo.md` contiene pendientes CPPP y marcadores `Updated upstream` / `Stashed changes` ya presentes en HEAD. No son conflictos creados por esta tarea. |

## Alcance y límites

Incluye diagnosticar y corregir la causa demostrada de E2E real; conservar o
ajustar mínimamente los workflows; alinear la guía y plantilla de revisión;
configurar manualmente la protección y registrar evidencia del nuevo PR.
La causa puede ser infraestructura, datos, prueba o producto: no se decide antes
de reproducirla. Si exige una funcionalidad ajena, actualizar alcance y plan antes
de implementarla. No eliminar pruebas ni rebajar requisitos para obtener verde.

Siempre: conservar los cuatro checks, permisos mínimos, pruebas con datos
aislados, nombres nuevos sin guiones bajos y evidencia ligada al último cambio.
Pedir decisión ante ampliaciones de alcance, dependencias nuevas, cambios de
política de lockfile o sustitución de la regla clásica. Nunca: escribir secretos,
aprobar en nombre de otro integrante, usar bypass, hacer push a `main`, ejecutar
builds localmente como agente ni efectuar operaciones Git de escritura.

No incluye API de Jira, estimaciones inventadas, migraciones de negocio,
CODEOWNERS con personas supuestas, merge queue, despliegue o arreglo del plan CPPP.

## Criterios de aceptación

| ID | Dado / Cuando / Entonces y evidencia exigida |
|---|---|
| T20-01 | Dado `main` en el repositorio central, cuando un cambio pretende integrarse, requiere PR y al menos **1 aprobación de otro integrante con escritura**. La regla está guardada, se aplica a administradores, no admite bypass y prohíbe force push y borrado. Verificar configuración efectiva y captura; no probar haciendo push a `main`. |
| T20-02 | Dado un PR sin aprobación o con un check pendiente/fallido, GitHub bloquea su integración. Nuevos cambios revisables invalidan aprobaciones previas; las conversaciones deben estar resueltas y la rama actualizada respecto de `main`. Proponer exigir también aprobación del último push por otra persona. Verificar en la regla y el estado del PR. |
| T20-03 | Al abrir, actualizar commits o reabrir cualquier PR, incluso documental o desde un fork, se solicitan `calidad.yml` y `e2e.yml`, sin filtros por archivos ni omisión por borrador. Al editar título se revalida Jira. Los conflictos de merge y la autorización inicial de Actions para contribuyentes externos deben resolverse antes de evaluar resultados. |
| T20-04 | El PR de cierre tiene los checks **Clave Jira**, **Tipos, build y pruebas**, **Entorno con Docker Compose** y **E2E demo y real** ejecutados y con `success`, exigidos por protección y asociados a GitHub Actions. Ambos workflows terminan satisfactoriamente para el último estado del PR. `skipped`, `neutral`, cancelación y resultados antiguos no son evidencia de ejecución correcta. |
| T20-05 | Una clave Jira válida en rama **o** título permite pasar trazabilidad; ausencia en ambos hace fallar ese check y bloquea merge. Corregir o quitar la única clave del título, sin nuevos commits, actualiza el resultado. Se valida sintaxis existente, no la existencia de la incidencia en Jira. |
| T20-06 | Otro integrante publica **Approve / APPROVED** en GitHub para los cambios vigentes; se registra el enlace a esa revisión en el PR. Un comentario, bot, casilla o aprobación descartada no cumplen. La revisión explica qué se comprobó. |
| T20-07 | Existe evidencia de la regla guardada y efectiva para `main`, URL del PR revisado, URL de aprobación y enlaces a las dos ejecuciones satisfactorias. Se registran repositorio, PR, SHA de cabecera, SHA probado si es el merge de prueba y fecha. El PR #24 y ejecuciones históricas solo sirven de antecedentes. |
| T20-08 | La guía, especificación de calidad y plantilla usan los mismos cuatro checks y describen roles, Git/build manuales, diagnóstico y evidencias pendientes con exactitud. Planning Poker queda identificado como pendiente hasta que el equipo aporte el resultado. |

## Pila, estructura y estilo

Monorepo npm workspaces, Node 24, npm 11; backend TypeScript/Fastify con
`node:test`, frontend React/Vite con Vitest y pruebas Node del servidor;
Playwright para E2E demo y real; PostgreSQL 17 y Redis 8 para integración.
Se conservan las versiones y rangos de los manifiestos; no se actualizan aquí.

```text
.github/workflows/calidad.yml  → trazabilidad, tipos/build/unitarias y entorno
.github/workflows/e2e.yml      → Playwright demo y real
.github/pull_request_template.md → contrato externo existente; conservar nombre
backend/test/                 → pruebas unitarias; integracion/ usa servicios
frontend/src/                 → interfaz y pruebas Vitest existentes
e2e/prb/real/                 → reproducción E2E que debe identificarse
e2e/ayud/                     → preparación y ayudas de los recorridos
docs/calidad.md, docs/esp/calidad.md, docs/e2e.md, README.md → guías existentes
SPEC.md, tasks/plan.md, tasks/todo.md → propuesta y seguimiento T-20
```

Ejemplo real de `.github/workflows/calidad.yml`; los nombres externos de entorno
se conservan y se convierten a alias camelCase antes de usarlos:

```js
const { PR_TITLE: prTitle, PR_BRANCH: prBranch } = process.env;
const jiraKey = /\b[A-Z][A-Z0-9]*-[1-9][0-9]*\b/;
```

Funciones y variables nuevas usan camelCase; tipos y componentes PascalCase;
archivos nuevos siguen su carpeta sin `_`. Mantener el formato del archivo tocado.
Conservar los nombres visibles de los checks para no romper la protección.

## Comandos y estrategia de verificación posterior a aprobación

Todos se ejecutan desde la raíz. No se ejecutan pruebas funcionales en esta fase.

| Responsable / comprobación | Comando completo | Condición |
|---|---|---|
| Agente: tipos | `npm run typecheck` | No invoca el script build; configuraciones revisadas con `noEmit`. |
| Agente: unitarias | `npm test` | `node:test`, Vitest y pruebas del servidor frontend. |
| Agente: lint disponible | `npm run lint -w frontend` | Registrar avisos preexistentes; no añadir supresiones. |
| Agente: tipos E2E | `npm run e2e:tipos` | Sin build. |
| Agente: integración | `npm run test:integracion` | Solo entorno temporal aislado; no usar una BD existente por defecto. |
| Agente: cobertura vigente | `npm run test:cobertura` | Entorno aislado; mínimo **60 %** en líneas, ramas y funciones de asistencia. |
| Agente: demo / real | `npm run e2e` / `npm run e2e:real` | El real usa exclusivamente `gestioncapa_e2e`; revisar aislamiento y puertos antes. |
| Agente: prueba enfocada | `npm run e2e:real -- --grep 'ID-del-criterio-identificado'` | Sustituir el ID tras el diagnóstico; no es un comando listo para ejecutar aún. |
| Agente: integridad documental | `git diff --check -- SPEC.md tasks/plan.md tasks/todo.md` | Al validar cambios nuevos, distinguir marcadores antiguos de errores introducidos. |
| Usuario: build local | `npm run build` | Manual; evidencia de CI anterior no acredita el build de esta entrega. |
| Usuario: desarrollo, si necesita reproducir | `npm run dev` | Servicios locales disponibles. |

Primero registrar el fallo y su causa, después escribir o precisar la prueba
de regresión que falla por el defecto, implementar lo mínimo y comprobar verde.
No presentar una prueba ya verde como TDD retroactivo. Para configuración y
documentación, usar validación declarativa y verificaciones negativas del PR;
no crear pruebas que solo reproduzcan líneas YAML ni simular un rojo artificial.
Si cambia la lógica de trazabilidad, cubrir entradas válidas, vacías, incorrectas
y contenido no confiable antes de cambiarla. Repetir suites solo tras cambios
que puedan afectarlas. La aceptación final requiere ejecución real en GitHub.

La protección se verificará por sus ajustes efectivos y por el bloqueo de merge
en casos negativos, sin intentar un push directo. La cuenta administradora no
se sustituye por credenciales o permisos supuestos del agente.

## Calidad, seguridad y preparación de entrega

Usar como puerta de salida las referencias solicitadas:
`~/.agents/agent-skills/references/definition-of-done.md` y
`~/.agents/agent-skills/references/security-checklist.md`, leídas en esta fase.
Registrar cada control aplicable como aprobado, fallido o pendiente; justificar
los que no apliquen. Leer sus skills asociadas al ejecutar la fase de revisión.

- Corrección: aceptación, pruebas de regresión y runtime de CI/protección reales.
- Calidad: limpieza acotada, tipos y lint; sin pruebas omitidas ni cobertura reducida.
- Integración/documentación: nombres estables, funcionamiento desde fork, guías
  coherentes y evidencia separada de antecedentes. No se prevén migraciones.
- Seguridad: título y rama son entradas no confiables; pasarlos por entorno,
  sin interpolarlos en shell. Conservar `contents: read`, evitar
  `pull_request_target` con código del PR y secretos de producción. No mostrar
  secretos al adjuntar logs o capturas. Datos de CI aislados y sin privilegios reales.
- Dependencias: npm es el gestor del workspace; no hay lockfile versionado.
  La lista de seguridad exige revisar reproducibilidad, scripts de instalación
  y auditoría; no constan todavía aprobadas. Mantener la convención actual es
  una limitación explícita, no un control satisfecho. Cualquier cambio de política
  se someterá a decisión antes de implementarse; no ejecutar instalaciones para
  descubrir scripts desconocidos ni remedios forzados de auditoría.
- Publicación: el usuario decide Git y merge; administrador y revisor aportan sus
  evidencias. Revertir cambios futuros mediante otro PR con revisión y checks;
  corregir la configuración sin desactivar la exigencia de PR/aprobación.

## Pendientes y puerta de aprobación

Confirmar clave Jira real, administrador disponible y revisor distinto del autor.
El diagnóstico debe identificar la prueba y archivo responsables del fallo E2E;
si amplía alcance, actualizar estos documentos antes de corregir. Acordar el
tratamiento del riesgo de dependencias antes del cierre de seguridad. Registrar
Planning Poker cuando el equipo lo realice.

Esta entrega solo guarda la propuesta. Implementación, build local manual,
configuración de GitHub, PR nuevo y revisión humana siguen pendientes. No existen
commits nuevos ni etiquetas creadas por el agente.

## Referencias oficiales consultadas

- [Protección de ramas, aprobaciones y checks](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches).
- [Eventos de PR, merge de prueba y contribuciones desde forks](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#pull_request).
- [Estados de checks y significado de startup_failure](https://docs.github.com/en/enterprise-cloud@latest/pull-requests/reference/status-checks).
- [setup-node sin lockfile](https://github.com/actions/setup-node/blob/main/docs/advanced-usage.md#running-without-a-lockfile).

---

# HU-53: Modalidad de cobro por curso

## Estado, objetivo y decisiones confirmadas

Implementación autorizada expresamente por el usuario después de la planificación
y continuada el 15/11/2026. Los cuatro bloques tienen código y pruebas locales.
Las pasarelas permanecen deshabilitadas hasta validar cuentas y sandboxes reales.
Se conserva el contenido anterior según la decisión de añadir secciones al final.

Como administrador del CPPP, quiero configurar cómo se cobra cada curso, para ofrecer
pago previo, pago solo por la constancia o gratuidad. Como participante, quiero conocer
el importe antes de inscribirme y que el acceso y la entrega de mi constancia respeten
las condiciones aceptadas. Origen: HU-53, acuerdo A-05 del 09/11/2026; afecta HU-20,
HU-32 y RF-22/RF-24/RF-25. Planning Poker pendiente, sin estimación inventada.

Confirmado expresamente por el usuario:

- Tres modalidades de cobro, independientes de `PRESENCIAL/VIRTUAL/HIBRIDA`.
- Pago previo: plazo configurable y obligatorio por curso, contado desde la inscripción.
- Conservar modalidad, monto y plazo de cada inscripción; editar el curso afecta solo a nuevas inscripciones.
- Integrar pagos reales mediante **Izipay y Culqi**, además de **efectivo presencial registrado por un administrador**.
- Efectivo no significa el servicio PagoEfectivo ni códigos CIP.
- Cuatro bloques documentados dentro de `SPEC.md`, con plan y tareas en `tasks/`.

Decisiones técnicas implementadas: moneda PEN; importes exactos en céntimos;
plazo expresado en minutos enteros positivos, sin valor por defecto; actualización
de cobro mediante `PATCH /api/cursos/:id/cobro`; cancelación persistida en hasta
60 segundos tras vencer, mientras el servicio esté operativo. El bloqueo de acceso
y el cómputo de cupos vencidos deben ser efectivos desde el vencimiento, sin esperar
ese procesamiento. El plazo técnico admite 1–525600 minutos y el importe del curso
hasta S/ 9999999999.99. Culqi aplica además su límite de producto al iniciar cargos;
los límites del comercio Izipay se deben acreditar en su sandbox antes de habilitarlo.

## Mapa de capacidades aprobado

| Id estable | Objetivo y límite | Depende de | Contrato que ofrece |
| --- | --- | --- | --- |
| politica-cobro | Crear, editar y mostrar condiciones de la oferta | Ninguno | Política validada y versión de condiciones |
| pagos-cursos | Obligaciones, Izipay, Culqi, efectivo y verificación | politica-cobro | Hecho financiero persistido, consultable e idempotente |
| inscripcion-acceso | Inscripción, reserva, vencimiento, cupos y autorización | politica-cobro, pagos-cursos | Intento de inscripción y derecho efectivo de acceso |
| constancias | Elegibilidad, retención y entrega | politica-cobro, pagos-cursos, inscripcion-acceso | Estado de entrega y documento emitido una sola vez |

Orden: `politica-cobro → pagos-cursos → inscripcion-acceso → constancias`.
Las interfaces proveedoras se describen en su bloque. Pagos no importa constancias
ni decide aprobación académica: los consumidores aplican los hechos financieros.
Se evitan dependencias circulares y un bus genérico de eventos.

## Revisión inicial del código e inconsistencias

| Evidencia local | Comportamiento actual | Brecha para HU-53 |
| --- | --- | --- |
| `backend/src/modules/cursos/cursos.repositorio.ts` | `costo > 0` genera `PENDIENTE_PAGO`; costo cero, `EN_CURSO` | No distingue cobro de curso y de constancia; no guarda condiciones históricas ni vencimiento |
| Mismo repositorio y migración `0012-inscripcionPendiente.sql` | Cupos cuentan todas las filas; inscripción única por curso/persona | No hay cancelación, liberación ni intentos sucesivos auditables |
| `cursos.rutas.ts`, `frontend/src/servicios/cursos.ts` | El cliente llama PUT para editar; backend y matriz de permisos no lo implementan | La edición del cobro necesita persistencia real; MSW no la acredita |
| Detalle y descarga de materiales; módulos de clases/asistencia/reuniones | Autorización por sesión/rol o pertenencia a clase | No existe una regla común que impida el acceso de una reserva impaga |
| `certificados.repositorio.ts` | Emisión actual restringida a presencial, participación y costo cero | El costo bloquea toda emisión; falta retención financiera separada |
| `certificados.modelo.ts` y `historial.repositorio.ts` | Validez documental: VALIDO/ANULADO/REEMPLAZADO; deuda derivada de inscripción pendiente | Deuda de constancia y retención no equivalen a inscripción pendiente |
| [Matriz CPPP](docs/enfoqueCppp.md) | RF-22, RF-24 y RF-25 pendientes | No hay pasarela ni efectivo real; HU-53 amplía el alcance originalmente diferido a HU-32 |
| `tasks/todo.md` | Marcadores de conflicto y secciones duplicadas ya versionados | Se preservan; su resolución queda fuera de esta propuesta |

La fuente literal completa de Requisitos v4/RF-25 no está disponible en el repositorio.
Se usan los criterios entregados, la matriz CPPP y [las reglas de certificados](docs/esp/certificados.md);
no se declara cotejado el texto original. La regla académica implementada exige 80 %
de asistencia, sesiones finalizadas y cierre dentro de siete días de la última sesión.
HU-53 modifica la condición financiera; no añade exámenes, cómputo académico virtual
ni firmas institucionales reales. La emisión actual sigue marcada como demostración.

## Especificación del bloque politica-cobro

Responsable de la oferta vigente; no confirma pagos ni cambia inscripciones existentes.
Propone `modalidadCobro` con valores `PREVIO`, `CERTIFICADO` y `GRATUITO`.
Mantiene `costo` por compatibilidad: representa el único importe exigible según la
modalidad. En las decisiones y registros financieros se usa `importeCentimos`,
entero exacto calculado en servidor desde el decimal validado, y `moneda: 'PEN'`.

| Modalidad visible | Importe | Al inscribirse | Acceso del participante | Constancia al cumplir requisitos |
| --- | --- | --- | --- | --- |
| Pago antes de llevar el curso | Mayor que cero | PENDIENTE_PAGO, con vencimiento | Tras pago verificado dentro de reserva vigente | Sin segundo cobro |
| Pago solo por el certificado | Mayor que cero, identificado como importe de constancia | EN_CURSO, confirmada | Inmediato | RETENIDA hasta pago verificado |
| Gratuito | Cero | EN_CURSO, confirmada | Inmediato | Sin cobro |

`plazoPagoMinutos` es obligatorio para PREVIO y no se aplica a las otras modalidades.
Rechazar cero, negativos, fracciones, valores fuera de rango y combinaciones incoherentes.
El servidor valida, aunque el formulario ya valide. No se confunde el medio de pago
con la modalidad de cobro. Cada medio ofrecido debe admitir el importe de la obligación;
no se redondea, fracciona ni sustituye silenciosamente un importe fuera de sus límites.

ADMIN activo crea y modifica condiciones. Se propone una actualización acotada de
cobro mediante PATCH, usada por un control identificado como «Guardar condiciones
de cobro» en la edición. No simula guardar otros campos mediante el PUT inexistente.
Rechazar cambios en cursos cerrados; comprobar versión de política al editar e
inscribirse para evitar aceptar un precio distinto del mostrado sin confirmación.
La transacción de inscripción fija las condiciones realmente aceptadas.

Catálogo público, catálogo privado y detalle muestran modalidad, monto, moneda y,
para PREVIO, duración del plazo antes de inscribirse. CERTIFICADO debe decir que el
curso se lleva sin cobro y cuánto cuesta la constancia; no presentarlo como totalmente
gratuito. El visitante solo ve la oferta y datos institucionales/profesionales ya
permitidos; nunca deudas, alumnos, DNI, referencias de pago ni datos de pasarelas.

## Especificación del bloque pagos-cursos

Una obligación pertenece a una persona y a un intento concreto de inscripción;
incluye concepto CURSO o CONSTANCIA y la copia inmutable de sus condiciones.
PREVIO genera obligación al reservar. CERTIFICADO la genera cuando se registra la
elegibilidad académica; no permite cobrar antes de acreditar esa elegibilidad.
GRATUITO queda EXENTO, sin operación financiera ni transacción ficticia.
Estado financiero, intento de transacción y estado académico son dimensiones distintas.

Entradas: obligación creada por el servidor, identidad del actor y medio elegido.
Salidas: identificadores locales estables, estado consultable y hecho financiero
verificado. La confirmación conserva proveedor/medio, identificador externo o recibo
interno, importe, moneda, fecha de verificación, referencia al intento y auditoría.
No se aceptan importes, propietarios ni estados «pagado» decididos por el navegador.

Integraciones propuestas, con contrato real y habilitación independiente:

- **Izipay:** producto Web Core propuesto. Token de sesión generado desde backend;
  checkout oficial y notificación IPN. Verificar firma con el procedimiento documentado,
  correlación, comercio, entorno, importe, moneda y estado final exigible del producto.
  Un error de comunicación, token generado o simple retorno visual no acredita cobro.
- **Culqi:** cargo único mediante su integración oficial y API v2. Verificar el recurso
  financiero con consulta autenticada al proveedor, correlación, comercio/entorno e
  importe/moneda. Un webhook recibido solo es una señal para verificar. No se inventa
  un esquema HMAC que la documentación del producto elegido no confirme.
- **Efectivo:** solo ADMIN activo registra recepción real, por el importe completo,
  con referencia interna única, momento de registro y auditoría. El participante no
  puede autoconfirmar. El recibo interno no se presenta como comprobante fiscal.

Persistir la obligación y la correlación antes de contactar al proveedor.
Idempotencia duradera por obligación/operación/evento/transacción, protegida también
con restricciones SQL. Repetir una solicitud con otra carga bajo la misma clave se
rechaza. Solo puede existir un intento externo activo o incierto por obligación.
Tras timeout o caída entre cobro y persistencia, conciliar antes de reintentar, cambiar
de pasarela o registrar efectivo. La integración debe disponer de un mecanismo
verificado para localizar esa operación; si el producto no lo permite, no se habilita
un reintento automático inseguro.

Confirmar y aplicar efectos locales con recuperación persistente tras reinicios,
sin depender de la vuelta del navegador. Notificaciones duplicadas o fuera de orden
no duplican cobros, cupos, matrículas en sesiones ni documentos, y un evento de fallo
antiguo no revierte un pago confirmado. Una segunda confirmación financiera inesperada
se conserva como incidencia conciliable; nunca se borra para ocultar un doble cargo.

Un pago verificado recibido después de cancelar la reserva se registra como hecho
financiero y queda pendiente de conciliación administrativa. No reactiva una reserva
cancelada ni sobreinscribe un cupo reasignado. La regla de expiración y la conciliación
son independientes. No se incluyen reembolsos automáticos, pagos parciales, cuotas,
recurrencia, SUNAT ni correo transaccional nuevo; se ofrece confirmación interna
consultable y comprobante interno. La política operativa de devolución queda pendiente.

## Especificación del bloque inscripcion-acceso

Cada intento tiene identificador estable y conserva política, importe, moneda,
plazo, `inscritoEn` y `venceEn`. Un refresh o reintento idempotente no reinicia el plazo.
Se conservan estados existentes; se añade cancelación explícita por vencimiento sin
borrar inscripciones, asistencias ni auditoría. Tras cancelación puede crearse otro
intento si el curso sigue publicado y hay cupo, con las condiciones vigentes.

Para PREVIO, la reserva ocupa un cupo hasta `venceEn`. Desde `ahora >= venceEn`,
sin pago aplicado oportunamente, se considera vencida y sin acceso. El cómputo de
cupos excluye reservas vencidas/canceladas, incluso si el procesador está atrasado.
El proceso automático persiste cancelación y libera una sola vez; funciona sin
navegador abierto, recupera retrasos al arrancar y tolera varias instancias.
Objetivo propuesto de persistencia: hasta 60 segundos con servicio operativo;
una interrupción no amplía el derecho de acceso ni el plazo contractual.

La activación exige pago verificado aplicado bajo bloqueo a una reserva aún vigente.
La fecha declarada por el navegador o un webhook sin verificar no decide el derecho.
Serializar inscripción, pago, expiración y última plaza con orden de bloqueos único.
Revisar expresamente el actual bloqueo de clase previo al de curso en asistencia:
no introducir el ciclo curso→clase / clase→curso. Leer el reloj de base de datos tras
adquirir bloqueos para no usar una hora anterior a una espera de bloqueo.

La política efectiva protege en servidor: detalle de contenidos/materiales privados,
descarga PDF, enlaces y videos, inscripción manual en sesiones, registro de asistencia
y credenciales/acceso a reuniones del curso. Una fila manual en `enrollments` no
sustituye el derecho del curso. Mantener permisos de ADMIN e INSTRUCTOR asignado
para gestión y las clases históricas independientes con `curso_id` nulo.
El catálogo y el resumen comercial pueden seguir visibles; no se filtran URLs
privadas en una respuesta que luego el frontend solo oculta.

## Especificación del bloque constancias

La decisión académica permanece en certificados. Pagar no convierte a una persona
en elegible. Para el alcance académico actualmente implementado, al cerrar el curso:

- GRATUITO elegible: emisión sin pago.
- PREVIO elegible y pago confirmado: emisión sin nuevo cargo.
- CERTIFICADO elegible: registrar copia de elegibilidad, condiciones y datos del
  documento; estado de entrega RETENIDA mientras exista deuda. Cuando se confirme
  el pago, emitir y entregar exactamente una constancia, también si el curso ya cerró.

RETENIDA es un estado de entrega financiera separado de VALIDO/ANULADO/REEMPLAZADO.
No se publica un código utilizable ni un PDF válido mientras esté retenida y no suma
horas certificadas. La restricción cubre todas las descargas, incluido historial,
y también excepciones y correcciones administrativas: una excepción académica no
perdona la deuda. El propietario y ADMIN pueden consultar la retención sin exposición pública.

Guardar la elegibilidad en el cierre oportuno permite liberar después del pago sin
reabrir el curso ni exigir de nuevo la ventana de siete días. El documento usa la
copia de datos académicos del cierre y registra la fecha real de emisión. Historial,
«Mis cursos», cierre y gestión de certificados muestran inscripción, deuda y entrega
por separado. Conservar documentos históricos, anulación/reemplazo y marca de demo;
HU-53 no acredita una firma de producción ni amplía automáticamente el alcance
académico a exámenes o modalidades sin evaluación implementada.

## Contratos HTTP implementados

Todas las rutas nuevas deben figurar en la matriz central de permisos. Respetar el
formato de errores existente; las rutas siguientes están implementadas y probadas
contra Fastify/PostgreSQL. La activación comercial de pasarelas sigue pendiente.

| Método y ruta | Actor | Resultado y límite |
| --- | --- | --- |
| POST /api/cursos | ADMIN | Añade política validada a la creación actual |
| PATCH /api/cursos/:id/cobro | ADMIN | Actualiza solo condiciones futuras, con control de versión |
| GET /api/publico/cursos y consultas actuales de curso | Público/autenticado según ruta existente | Oferta con modalidad e importe; datos privados solo para actor autorizado |
| GET /api/pagos/:id | Propietario o ADMIN | Obligación y confirmación interna sin secretos ni datos de tarjeta |
| POST /api/pagos/:id/intentos | Propietario | Inicia Izipay o Culqi con clave de idempotencia, según disponibilidad |
| POST /api/pagos/notificaciones/:proveedor | Proveedor verificado | Izipay/Culqi permitidos; confirmación solo tras verificación específica |
| POST /api/pagos/:id/conciliar | ADMIN | Verifica la operación de esta obligación mediante API de la pasarela; no crea otro cargo |
| POST /api/pagos/:id/efectivo | ADMIN | Registra efectivo real y auditado, sin carreras con intentos externos |

Conservar `POST /api/cursos/:id/inscribirme` y sus resultados existentes; añadir
identificador de intento, copia de condiciones, vencimiento y obligación cuando
corresponda. Respuestas con discriminantes explícitos: un estado desconocido nunca
se interpreta como confirmado. Invariantes de propiedad se comprueban en la escritura,
no solo en la interfaz. Diferenciar 401/403, 404, validación 422, conflicto 409 y
proveedor no disponible 503 según el patrón existente; no devolver trazas internas.

## Migración y compatibilidad propuestas

Añadir migraciones nuevas después de la última existente al implementar; no editar
ni renombrar migraciones históricas. Separar expansión de esquema, regularización
y activación; sin eliminación de columnas ni cambio de contratos externos.

Para la oferta actual, costo cero puede inicializar GRATUITO. Un curso con costo
positivo necesita modalidad y plazo explícitos antes de aceptar nuevas inscripciones.
No inventar retrospectivamente modalidades, montos aceptados, fechas límite ni pagos
a partir del precio actual. Inscripciones históricas confirmadas/terminadas conservan
sus derechos, sin considerarse «pagadas» por esa sola condición. Las pendientes antiguas
se identifican para regularización auditada: no caducan con una fecha inventada.
El tratamiento y comunicación de esas reservas requieren aprobación antes de activar
la migración sobre datos reales; no se bloquean ni cancelan masivamente sin ese acuerdo.

Ensayar sobre PostgreSQL 17 aislado con muestras gratuitas, con costo, pendientes,
terminadas y con documentos emitidos; comprobar cupos, referencias e historial.
Backfill por lotes acotados y reanudables. El repositorio tiene migración hacia
adelante, sin comando de rollback: definir y probar recuperación específica.
Revertir el binario antiguo tras activar nuevas modalidades puede saltarse los
controles: ante incidente, detener nuevas inscripciones/intentos, conservar controles
de acceso y conciliación y aplicar recuperación compatible. Una restauración solo
es aceptable si no pierde hechos financieros posteriores; no borrar pagos reales
para volver a una versión anterior.

## Stack, estructura y estilo

Versiones declaradas en manifiestos, no resolución exacta del árbol instalado:
Node >=24, npm >=11, Fastify ^5.12.8, pg ^8.16.3, Zod ^4.6.7, React ^19.2.8,
React Router ^7.18.4 y Playwright ^1.63.0. Backend TypeScript ^7.0.2 y frontend
~6.0.2; pruebas con node:test y Vitest ^5.0.3. Entorno de integración: PostgreSQL 17
y Redis 8, según configuración del repositorio. La política actual no versiona
lockfile npm; no se declara satisfecha la reproducibilidad exigida por el checklist
de seguridad ni se cambia esa política dentro de esta propuesta.

Código backend en `backend/src/modules/{cursos,pagos,certificados,historial,asistencia,reuniones}`
(pagos es propuesto); reglas de autorización en `backend/src/plugins/permisos.ts`;
migraciones en `backend/migraciones/`; pruebas en `backend/test/` y
`backend/test/integracion/`. Interfaz en `frontend/src/paginas/` y contratos en
`frontend/src/servicios/`; MSW en `frontend/src/mocks/`. Recorridos demo/reales en
`e2e/prb/demo/` y `e2e/prb/real/`. No crear estructura alternativa de pruebas.

Ejemplo de contrato, solo documental:

```typescript
type ModalidadCobro = 'PREVIO' | 'CERTIFICADO' | 'GRATUITO';
type PoliticaCobro = {
  modalidadCobro: ModalidadCobro;
  importeCentimos: number;
  moneda: 'PEN';
  plazoPagoMinutos: number | null;
};
```

Aplicar AGENTS.md: camelCase para funciones/variables, PascalCase para tipos/componentes
y archivos nuevos sin guiones bajos, siguiendo el estilo de cada carpeta. Conservar
columnas SQL, variables de entorno y contratos externos existentes; convertir con
alias al entrar a la aplicación. Seguir el formato local; sin refactor ajeno.

## Criterios de aceptación verificables

| Id | Condición observable | Bloque |
| --- | --- | --- |
| HU53-01 | ADMIN crea un curso en cada modalidad; servidor rechaza combinaciones inválidas y otros roles | politica-cobro |
| HU53-02 | ADMIN edita realmente el cobro; nueva inscripción usa nuevas condiciones y las anteriores permanecen idénticas | politica-cobro |
| HU53-03 | Catálogo y detalle indican modalidad, importe PEN y plazo de pago previo antes de inscribirse, sin datos privados | politica-cobro |
| HU53-04 | Izipay realiza un cobro de prueba con verificación servidor y correlación local; no basta retornar del checkout | pagos-cursos |
| HU53-05 | Culqi realiza un cobro de prueba verificado por API autenticada; no basta crear un token ni recibir un webhook | pagos-cursos |
| HU53-06 | Solo ADMIN registra efectivo real exacto con recibo interno único y auditoría; el participante recibe 403 | pagos-cursos |
| HU53-07 | Duplicados, concurrencia entre medios, timeout y caída tras cobro se concilian sin duplicar efectos ni reintentar a ciegas | pagos-cursos |
| HU53-08 | Firma/recurso inválido, importe/moneda/comercio/entorno/propietario incorrectos no confirman; las credenciales no salen al cliente/log | pagos-cursos |
| HU53-09 | Pago previo reserva un cupo y guarda plazo desde inscripción; repetir la solicitud no cambia condiciones ni vencimiento | inscripcion-acceso |
| HU53-10 | Sin derecho vigente no se obtienen materiales, descargas, asistencia ni credenciales de reunión, incluso con inscripción manual de clase | inscripcion-acceso |
| HU53-11 | En el límite de vencimiento se deniega acceso y el cupo puede reasignarse; el proceso cancela en hasta 60 s operativo, una sola vez | inscripcion-acceso |
| HU53-12 | Pago verificado oportuno confirma reserva y acceso; carrera pago/vencimiento/último cupo nunca sobreinscribe | inscripcion-acceso |
| HU53-13 | Pago tardío se conserva para conciliación; no reactiva la reserva ni afecta otro intento o un cupo reasignado | pagos-cursos, inscripcion-acceso |
| HU53-14 | CERTIFICADO confirma inscripción y permite cursar sin pago; al cumplir requisitos registra entrega RETENIDA | constancias |
| HU53-15 | Pago verificado de constancia libera una sola emisión desde elegibilidad guardada, aun después del cierre y sin reabrirlo | constancias |
| HU53-16 | Retenida no tiene documento/código público válido ni suma horas; excepciones y rutas alternativas no eluden la deuda | constancias |
| HU53-17 | GRATUITO permite inscripción y constancia elegible sin pago; PREVIO pagado no vuelve a cobrar constancia | constancias, inscripcion-acceso |
| HU53-18 | Historial, Mis cursos y administración distinguen deuda, inscripción y entrega; no confunden EXENTO con PAGADO | constancias, inscripcion-acceso |
| HU53-19 | Migración preserva inscripciones, documentos y derechos históricos sin inventar pagos/plazos; recuperación ensayada | Todos |
| HU53-20 | Recorridos y controles funcionan contra backend/BD reales; ambos sandboxes, revisión y evidencia están registrados | Todos |

## Estrategia de pruebas y comandos

Implementación aprobada: TDD por incremento, reproducir fallo esperado, cambio
mínimo y refactor con mismas pruebas. Si algo falla, investigar causa raíz antes de
corregir. El usuario realiza cada commit manualmente; el agente prepara el mensaje
y registra evidencia de red/green. Mantener suites existentes y cobertura actual
de asistencia >=60 % de líneas, ramas y funciones, sin skips ni umbrales rebajados.

Comandos desde la raíz. El inventario de archivos y pruebas realmente ejecutadas está en
[la guía de cobro](docs/esp/cobroCursos.md); los nombres de pruebas de esta estrategia
se consolidaron en `cobroCurso.test.ts` y `pagosCurso.test.ts`:

```bash
npm run dev
node --import tsx --test backend/test/politicaCobro.test.ts
node --import tsx --test --test-concurrency=1 backend/test/integracion/pagosCurso.test.ts
npm exec -w frontend -- vitest run src/paginas/cursos/CobroCursoFormulario.test.tsx
npm run typecheck -w backend
npm exec -w frontend -- tsc -p tsconfig.app.json --noEmit
npm exec -w frontend -- tsc -p tsconfig.node.json --noEmit
npm run e2e:tipos
npm run lint -w frontend
npm test
npm run test:integracion
npm run test:cobertura
npm run e2e -- --grep 'HU53-'
npm run e2e:real -- cobroCurso.spec.ts
npm run migrate:estado
```

Integración y E2E reales usan BD/Redis desechables, nunca la BD compartida o de
producción. Los filtros HU53 serán nombres de pruebas nuevos, no una suite existente.
Migraciones se ensayan con `npm run migrate` exclusivamente sobre esa BD aislada.
Los E2E de tarjetas se separan del flujo por defecto y apuntan solo a sandboxes;
sus comandos exactos dependerán del producto/SDK verificado al implementar.
Mocks sirven para casos deterministas y errores; no acreditan una pasarela real.
No se considera completado HU53-04/05/20 sin evidencia real de ambos sandboxes.

`npm run build` y variantes son **manuales del usuario**. El agente no los ejecuta,
tampoco `npm run verificar`. Las verificaciones funcionales se ejecutan en entorno aislado; no se ejecutan builds
funcionales, instalaciones, migraciones ni builds.

## Seguridad, revisión y límites de actuación

Siempre: validación en fronteras, SQL parametrizado, autorización por rol y objeto,
importe del servidor, idempotencia durable, conservación de auditoría y tratamiento
de errores sin secretos. Modelar amenazas sobre navegador→API, proveedor→notificación
y ADMIN→registro de efectivo: suplantación, alteración de importe, IDOR, repetición,
denegación de servicio y repudio del registro. Pruebas negativas por cada frontera.

Datos de tarjeta/CVV van al checkout del proveedor; no se almacenan ni pasan por
logs del CPPP. Claves secretas solo en backend y separadas entre test/producción;
tokens efímeros no se registran. Minimizar datos de facturación enviados al proveedor,
definir finalidad/retención de auditoría y no copiar payloads con datos personales
a informes de prueba. HTTPS, proveedores/orígenes permitidos, límites de cuerpo,
frecuencia y timeout; redirects internos validados y CSP acotada a los hosts
necesarios verificados, sin comodines para hacer funcionar el SDK.

La revisión final aplicará `code-simplification` sin cambiar comportamiento;
`code-review-and-quality` sobre corrección, seguridad, rendimiento, legibilidad y
mantenibilidad; `security-and-hardening` y las listas
[Definition of Done](/home/lovito99/.agents/agent-skills/references/definition-of-done.md)
y [Security Checklist](/home/lovito99/.agents/agent-skills/references/security-checklist.md).
Registrar controles aprobados, pendientes y no aplicables con justificación.
La política sin lockfile es una discrepancia previa a resolver por decisión del
proyecto, no motivo para marcar toda la seguridad como aprobada.

Consultar antes de ampliar alcance, introducir dependencias o modificar CI, resolver
condiciones históricas desconocidas o habilitar producción. La aprobación de esta
especificación autorizará diseñar las migraciones descritas, no aplicarlas a datos
reales. Nunca inventar pagos/credenciales, debilitar permisos, borrar pruebas para
pasar CI ni modificar historia ajena. Git de escritura, merges, PR, etiquetas y
publicación corresponden al usuario. No hacer push ni publicar.

## Pendientes y condiciones para publicar

- Aprobar esta especificación y el plan; estimación en Planning Poker por el equipo.
- CPPP aporta cuentas de comercio de Izipay y Culqi, producto contratado, acceso a
  sandboxes, límites y credenciales por un canal seguro; no se solicitan claves por chat.
- Configurar dominios HTTPS, callbacks/IPN/webhooks, secretos y permisos del comercio;
  confirmar cómo consultar operaciones inciertas antes de habilitar reintentos.
- Acordar tratamiento de pendientes históricas, límites de plazo y política operativa
  de pagos tardíos/devolución; aportar el texto completo de RF-25 v4 para cotejo.
- Implementar y demostrar los veinte criterios, revisar seguridad/DoD, ensayar
  recuperación y definir responsable de conciliación de efectivo/pagos tardíos.
- Antes de activar: evidencia de ambos sandboxes, alertas de obligaciones inciertas,
  reservas vencidas sin procesar y entregas retenidas ya pagadas; build manual,
  revisión humana y configuración de producción. La firma real de constancias tiene
  su propio pendiente; no eliminar la marca de demostración para simularla.

No hay autorización de publicación ni cobros reales en esta fase. Una integración
sandbox verificada no implica comercio de producción habilitado. Los mensajes de
commit serán recomendaciones manuales, sin cambiar versiones ni etiquetas.
La propuesta documental anterior queda sustituida por la clasificación del cambio
funcional: desde la base local `v2.0.0.1.0`, se propone `v3.0.0.0.0` para esta entrega,
por exigir `versionCobro` al aceptar nuevas inscripciones pagadas y restringir
contenido que antes se entregaba con solo una sesión iniciada. Es una recomendación
condicional; no se crearon commits ni etiquetas ni se cambiaron versiones npm.

## Fuentes oficiales consultadas para HU-53

Consultadas el 15/11/2026; verificar producto y versión exactos antes de implementar.

- [Izipay Web Core: inicio rápido y generación backend del token](https://developers.izipay.pe/web-core/quickstart/).
- [Izipay: notificación IPN](https://developers.izipay.pe/web-core/notifications/) y [validación de firma](https://developers.izipay.pe/web-core/Modalidades/firma-validation/).
- [Culqi: cargos únicos](https://docs.culqi.com/es/documentacion/pagos-online/cargo-unico/cargos/), [webhooks](https://docs.culqi.com/es/documentacion/pagos-online/webhooks/) y [referencia API](https://apidocs.culqi.com/).
- [OWASP: integración de pasarelas, verificación e idempotencia](https://cheatsheetseries.owasp.org/cheatsheets/Third_Party_Payment_Gateway_Integration_Cheat_Sheet.html).
- [PostgreSQL 17: bloqueos de fila](https://www.postgresql.org/docs/17/explicit-locking.html#LOCKING-ROWS) y [reloj de transacción frente a reloj real](https://www.postgresql.org/docs/17/functions-datetime.html#FUNCTIONS-DATETIME-CURRENT).


## Estado verificable de la implementación

- Política, edición PATCH, snapshots, reservas, control de acceso, efectivo y entrega
  retenida tienen implementación contra API/BD real. El documento operativo y la
  matriz de aceptación se mantienen en [docs/esp/cobroCursos.md](docs/esp/cobroCursos.md).
- La activación de reservas consume hechos financieros mediante el trigger
  `aplicarPagoReserva`; comparte transacción y lock del curso con el pago. No hay
  imports desde pagos hacia cursos/constancias ni un bus de eventos genérico.
- El servidor procesa expiraciones y entregas cada 30 s; la conciliación va en un
  ciclo independiente cada 60 s para no retrasar acceso por una pasarela caída.
- El histórico con condiciones desconocidas queda inventariado, sin pagos/plazos
  fabricados. La gratuidad legada se decide con evidencia congelada al migrar o
  al crear una inscripción sin intento en una oferta entonces gratuita; cambiar
  la oferta después no acredita derechos antiguos. No hay regularización masiva
  automática sin el acuerdo de negocio pendiente.
- Adaptadores HTTP, verificación de firma/recursos, checkout y recuperación están
  implementados para Izipay Web Core y Culqi Checkout Custom. Los contratos se
  probaron con respuestas simuladas; eso no acredita cobros en ambos sandboxes.
- Git, build, aprobación de entrega y publicación siguen siendo manuales.


# T-25: Elegir la pasarela de pagos

## Estado, objetivo y alcance

Fecha de consulta: 15/11/2026 (America/Lima). Base revisada: `a8adec4`;
rama existente `SCRUM-180-t-25-elegir-la-pasarela-de-pagos`.
La solicitud inicial pidió especificación y plan; después el usuario autorizó
expresamente continuar con la ejecución y confirmó «iziapaya, efectivo, transferencia».
Se normaliza el nombre a **Izipay**, candidata de T-25. La elección comunicada se
registra sin inventar acta, fecha del acuerdo institucional ni identidad de un aprobador.
Planning Poker sigue pendiente del equipo.

Como responsable del CPPP, quiero un comparativo verificable de pasarelas para
sustentar la elección y orientar HU-54. Es una capacidad documental de apoyo a la
decisión: investigación → comparativo → registro de elección → criterios derivados.
No requiere crear módulos de software ni cambiar el esquema financiero.

Entregables de ejecución: [comparativo](docs/esp/comparativoPasarelas.md),
[decisión](docs/decisions/001-pasarelaIzipay.md) y
[criterios locales para HU-54](docs/esp/hu54Pagos.md).
Plan y seguimiento: secciones T-25 de [tasks/plan.md](tasks/plan.md) y
[tasks/todo.md](tasks/todo.md). Se conserva íntegro el contenido anterior.

## Caso de uso y decisiones confirmadas

- Comparar **Culqi, Izipay, Openpay y PayU** para cobros web en Perú/PEN.
- Mantener **Niubiz descartada** por el pago adelantado informado en T-25.
  Es el motivo institucional recibido; no se generaliza a todas sus ofertas actuales.
- Registrar **Izipay como pasarela elegida**, efectivo presencial y transferencia
  bancaria como medios adicionales, según confirmación del usuario en esta conversación.
- Efectivo y transferencia no se presentan como otras pasarelas. Una elección
  comercial no constituye evidencia de afiliación, habilitación o cobros reales.
- El contenido vigente de HU-54 no se encontró en archivos, ramas ni documentos
  conectados. Se redactan criterios derivados con la elección confirmada; el cotejo
  y actualización de la historia original/remota quedan identificados, sin simularlos.

## Revisión del código e inconsistencias detectadas

| Fuente local o externa | Hallazgo | Tratamiento en T-25 |
| --- | --- | --- |
| `backend/src/modules/pagos/pagos.modelo.ts` y `pagos.servicio.ts` | Existen IZIPAY, CULQI y EFECTIVO; no TRANSFERENCIA. Ambos proveedores se habilitan por configuración | Distinguir implementación de HU-53 de elección comercial y de disponibilidad operativa |
| `frontend/src/servicios/izipay.ts` y `backend/src/modules/pagos/izipay.ts` | Integración Web Core, token backend y consulta firmada; falta acreditación comercial/sandbox | Confirmar que el producto contratado corresponde a este contrato, no a otra plataforma de la misma marca |
| `frontend/src/servicios/culqi.ts` | Yape desactivado expresamente en el checkout actual | Soporte publicado del proveedor no equivale a soporte de GestionCapa |
| `docs/esp/cobroCursos.md` y matriz RF-23 | Efectivo implementado y transferencia pendiente | HU-54 debe incluir el flujo bancario por construir y conservar auditoría/condiciones de HU-53 |
| Fuentes oficiales de tarifas | Tarifas POS, Link y web; IGV y cargos fijos distintos | Comparar mismo país/canal; cada dato lleva fuente, producto, moneda y fecha de consulta |
| Términos Izipay enlazados actualmente | La sección 12.1 conserva una promoción fechada en octubre de 2024 | No atribuir afiliación/mantenimiento gratuito actual por una promoción vencida |
| Tarifa PayU Perú | La URL consultada redirige fuera del tarifario; no se obtuvo una tarifa peruana verificable | Comisión «por cotizar», nunca cero ni una cifra de otro país; comparación económica pendiente |
| Documentación Yape | Código directo, QR y pago alternativo son recorridos distintos | Indicar mecanismo, condiciones y diferencias antes de prometer compatibilidad |

## Contenido obligatorio del comparativo

Por cada candidata: producto web peruano; comisión porcentual nacional/extranjera,
cargo fijo y moneda, IGV y condiciones; modalidad de Yape; modo de pruebas y acceso;
requisitos públicos de afiliación aplicables al CPPP; URL oficial de API y soporte.
Separar tarifa publicada, cotización del comercio y dato no verificado. No extrapolar
costos ni afiliación de POS/Link a una integración web. No calcular una ganadora por
costo sin ticket, volumen, mezcla de medios y tipo de cambio confirmados.

Los requisitos distinguen información pública de la elegibilidad real del CPPP:
RUC/titularidad, representación, cuenta bancaria y evaluación se cotejan por canal
seguro con el proveedor. No se publican documentos personales, claves ni cuentas reales.
Los datos ausentes se detallan como consultas comerciales pendientes, sin afirmar
que el comparativo económico está cerrado si falta una comisión por transacción.

## Criterios de aceptación y trazabilidad

| Id | Condición verificable | Evidencia |
| --- | --- | --- |
| T25-01 | Hay cuatro filas, una por candidata, con comisión por transacción, cargo fijo/moneda, IGV y canal; datos no públicos claramente pendientes | Tabla y fuentes oficiales; el cierre económico exige resolver la tarifa PayU pendiente |
| T25-02 | Cada fila distingue si acepta Yape, cómo, bajo qué condiciones y qué falta confirmar para el CPPP | Documentación o producto oficial, sin confundir QR con código directo |
| T25-03 | Cada candidata tiene modo de pruebas, documentación API y acceso/requisitos identificados; no se atribuyen cobros sandbox inexistentes | Enlaces oficiales y fecha de consulta |
| T25-04 | Requisitos de afiliación incluyen los publicados y las verificaciones particulares pendientes del CPPP | Tabla y lista de consultas comerciales |
| T25-05 | Niubiz figura descartada por el motivo recibido, con origen y alcance explícitos | Comparativo y registro de decisión |
| T25-06 | La elección Izipay + efectivo + transferencia tiene fuente y fecha de registro; se distingue elección de habilitación | ADR-001 y confirmación del usuario |
| T25-07 | HU-54 identifica Izipay y ambos medios manuales, conserva invariantes HU-53 y señala que falta cotejar el original | Documento HU-54; no afirmar edición remota de Jira |
| T25-08 | Documentos enlazados y consistentes; se preserva trabajo anterior y se informa el alcance real de la entrega | Revisión documental, hashes y `git diff --check` |

## Estructura, estilo y comandos

Se mantienen TypeScript/Fastify/pg en backend, React/Vite en frontend y Playwright
para E2E. T-25 modifica documentación Markdown; no introduce paquetes ni contratos HTTP.
`docs/esp/` contiene guías y `docs/decisions/` inicia el registro ADR al no existir una
convención anterior encontrada. Los archivos nuevos usan nombres sin guiones bajos.
Los identificadores externos/SQL existentes se conservan. Ejemplo de estilo documental:

| Proveedor | Canal | Fuente | Estado del dato |
| --- | --- | --- | --- |
| Izipay | Perú/web | Enlace oficial y consulta 15/11/2026 | Publicado / por confirmar con el comercio |

Comandos desde la raíz:

- `git diff --check`: higiene de los cambios nuevos, sin atribuir conflictos anteriores.
- `rg -n 'T-25|T25-|Izipay|HU-54' SPEC.md tasks/plan.md tasks/todo.md docs/esp/comparativoPasarelas.md docs/decisions/001-pasarelaIzipay.md docs/esp/hu54Pagos.md`: trazabilidad.
- Verificación de rutas relativas y anclas Markdown, más conservación por SHA-256
  de los prefijos anteriores. El procedimiento/resultados se registran en todo.md.

## Verificación, seguridad y límites

Esta entrega documental se verifica por exactitud, procedencia, vigencia, consistencia
y trazabilidad. TDD se aplica cuando hay comportamiento de software que cambiar;
aquí no se crean rojos artificiales ni pruebas que solo repliquen tablas Markdown.
Los fallos de acceso a fuentes se investigan y documentan; se contrastan páginas
oficiales, documentos enlazados y renderizado cuando el contenido requiere JavaScript.

Siempre: citar fuente primaria por dato, conservar moneda/IGV/canal, registrar la
elección como comunicación del usuario y mantener pendientes reales. Revisar DoD y
Security Checklist en lo aplicable a documentación y datos públicos.
Consultar antes de ampliar: otra tarea de integración, nuevas dependencias/migraciones,
contratación, afiliación o contacto externo no autorizado. Nunca: fabricar cotizaciones,
aprobaciones o pruebas de pago; guardar secretos; borrar historial financiero; habilitar
cobros, ejecutar build, hacer commit/tag/push/merge/PR o publicar desde el agente.

## Pendientes para cierre y entrega

Cotización PayU y condiciones específicas del CPPP; confirmación comercial del producto
Izipay, Yape y costos de alta; texto/cotejo de HU-54 y traslado al tracker por el equipo.
No se afirma que haya una integración de transferencia o Yape probada. El build no
aplica a T-25 documental; los builds de HU-53 siguen pendientes si no hay evidencia nueva.
Versión: cambio Interno para T-25, sin modificar versiones ni etiquetas. La última base
etiquetada local es `v2.0.0.1.0`, pero la rama incluye HU-53 sin nueva etiqueta:
no asignar automáticamente una versión a la entrega completa ignorando ese cambio.

## Ampliación autorizada: implementar los medios elegidos

El usuario solicita expresamente implementar, además de documentar. Se amplía el
alcance al flujo de pago existente de HU-53/HU-54: Izipay para nuevos cobros online,
efectivo administrativo y transferencia bancaria. La aprobación posterior permite
continuar con implementación; no se solicita de nuevo el permiso ya concedido.

### Comportamiento y aceptación de la implementación

- T25-I01: el checkout ofrece Izipay y efectivo; Culqi permanece como historial y
  conciliación, sin ofrecer ni aceptar nuevos cargos por la API del participante.
- T25-I02: transferencia deshabilitada por defecto. Habilitarla exige banco, titular
  y cuenta institucional configurados; los ejemplos no habilitan cobros ni inventan
  cuentas. El propietario autenticado ve el destino antes de declarar la transferencia.
- T25-I03: el propietario declara referencia, fecha bancaria y clave UUID; el destino
  se conserva como snapshot. Declarar no confirma el pago, cupo, acceso ni constancia.
  Reintentar la misma carga es idempotente; cambiarla con la misma clave se rechaza.
- T25-I04: una declaración activa bloquea otro pago o efectivo mientras ADMIN revisa.
  Un tercero no puede declarar ni leer la obligación; instructor y participante no
  pueden aprobar o rechazar transferencias.
- T25-I05: ADMIN activo confirma explícitamente recepción real, destino, referencia,
  fecha, importe completo y PEN. La aplicación usa el importe congelado de la deuda;
  discrepancias o reutilizar un abono no pagan otra obligación. La referencia bancaria
  se normaliza y combina con cuenta/banco/fecha para detectar duplicados.
- T25-I06: confirmar se realiza bajo los bloqueos curso→obligación y la exclusión
  financiera existentes. Confirmación repetida no duplica hechos ni efectos; se auditan
  actor, operación y fecha. Rechazar exige motivo y conserva declaración e historial.
- T25-I07: pago tardío se registra para conciliación sin recuperar cupo ni acceso.
  Se reutilizan las reglas de pago previo, certificado retenido y gratuidad de HU-53.
- T25-I08: UI participante y administrativa tienen estados pendiente, error, rechazo
  y confirmación. Los datos bancarios solo se consultan autenticado, sin caché pública.

Se implementa declaración por referencia, sin carga de archivos ni datos de tarjeta.
No se incorpora una nueva pasarela: se reutiliza Web Core existente, sin simular una
afiliación o transacción real. Yape exige habilitación comercial y prueba independiente.

### Estructura, comandos y límites técnicos

Backend: ampliar modelos/repositorio/rutas de pagos, matriz de permisos y configuración;
migración nueva `0029-transferenciasPago.sql`, sin modificar migraciones anteriores.
Frontend: extender el cliente de pagos, checkout y gestión administrativa con componentes
accesibles siguiendo Campo/Entrada/Boton existentes. Sin dependencias nuevas.

Pruebas: Node test + PostgreSQL/Redis temporales para permisos, persistencia, idempotencia,
duplicados, concurrencia y vencimientos; Vitest para formularios; Playwright contra API
y BD reales para el recorrido completo. No usar mocks como prueba de un cobro bancario.

- Backend: `npm run test -w backend`; `npm run test:integracion -w backend` con entorno aislado.
- Frontend: `npm run test -w frontend`; `npm run lint -w frontend`.
- Tipos sin build: `npm run typecheck -w backend`,
  `npm exec -w frontend -- tsc -p tsconfig.app.json --noEmit`,
  `npm exec -w frontend -- tsc -p tsconfig.node.json --noEmit`, `npm run e2e:tipos`.
- Navegador: `npm run e2e:real -- e2e/prb/real/transferenciaPago.spec.ts`.
- Build: exclusivamente manual por el usuario. Git y publicación también manuales.

Se prueban primero los rechazos por permisos y confirmación no verificada, después el
recorrido válido. Cada incremento registra RED/GREEN en tasks/todo.md. Las cuentas
de prueba usan datos explícitamente ficticios; no se consulta ni modifica la BD real.

### Ajustes verificados durante la implementación

El destino se persiste desde la primera oferta por obligación y se reutiliza al
recargar: una cuenta nueva de configuración afecta a nuevas obligaciones. El flag
controla ofrecer destinos nuevos; apagarlo conserva la declaración de abonos ya hechos
a destinos históricos. Una obligación que nunca recibió oferta no obtiene destino.

TRANSFERENCIA usa `DECLARADO` para conservar dinero ya movido externamente, también
si coexistía otro intento o la deuda se pagó en ese intervalo. Hay una declaración
por revisar por obligación, con índice propio; se mantiene el índice previo de un
cargo activo. `DECLARADO` bloquea nuevos cargos, efectivo y entrega/recuperación de
sesión Izipay. Los tokens ya entregados al navegador no pueden revocarse de oficio:
sus resultados se verifican y concilian. El doble ingreso crea incidencia visible
en ambos órdenes de llegada sin aplicar la deuda dos veces.

Se añade `0030-declaracionTransferencia.sql` para esta distinción. No se reducen
validaciones ni se eliminan índices o historial. El E2E detectó además 240 px de
desbordamiento del pie a 1024 px: se sustituyen sus columnas fijas por cuatro
columnas flexibles y se conserva la verificación a 320/768/1024/1440 px.

La ampliación cambia el nivel de entrega: nuevos cargos Culqi dejan de aceptarse
por elección del usuario, por lo que corresponde **Mayor** para consumidores de
esa API. Base local `v2.0.0.1.0`; propuesta condicional para la entrega conjunta con
HU-53 ya presente: `v3.0.0.0.0`. No se modifican versiones ni etiquetas.


# HU-32: Pago por transferencia BCP y en efectivo

Implementación solicitada expresamente tras T-25. Base: `9cc8510`, etiqueta local
`v3.0.0.0.0`. Se conserva todo el trabajo previo. El usuario confirmó retención de
tres meses y SMTP configurable con pruebas locales. Se continúa con código sin
otro ciclo de autorización documental; Git y build permanecen manuales.

## Objetivo, capacidades y caso de uso

El participante ve cuenta institucional, importe congelado y orden; adjunta voucher
JPG/PNG/PDF y referencia, queda en revisión y recibe el resultado por correo.
ADMIN verifica el abono real, aprueba/rechaza y registra efectivo con importe/fecha.
El archivo se elimina tras su plazo y se conserva la trazabilidad financiera.

| Capacidad | Responsabilidad | Depende de |
| --- | --- | --- |
| voucher-pago | Carga privada, unicidad de operación, descarga y revisión | Pagos T-25/HU-53 |
| comprobante-correo | Recibo PDF, correo de rechazo y cola SMTP durable | Decisión financiera |
| retencion-voucher | Eliminar contenido tras tres meses; conservar metadatos | Archivo/revisión |

Orden: contrato/validación → persistencia y carga → decisiones/efectivo y outbox →
SMTP/retención → UI y recorridos reales. Son extensiones del módulo de pagos.

## Aceptación verificable

- H32-01: cuenta/CCI/titular institucional configurados, importe PEN y código de
  orden visibles antes de subir; no se inventan cuentas BCP ni se cobra comisión.
- H32-02: voucher JPG, PNG o PDF de hasta 5 MiB validado por firma y tamaño; datos
  binarios privados en PostgreSQL, como los materiales existentes. Subida y
  declaración se guardan atómicamente; la UI muestra «En revisión» y no confirma dinero.
- H32-03: número de operación normalizado único entre vouchers, desde la subida,
  incluidos rechazados y archivos eliminados. Se rechaza reutilización aunque cambie
  fecha o cuenta; reintentar la misma clave y carga conserva la operación original.
- H32-04: solo propietario/ADMIN descargan, sin caché pública ni rutas de archivos
  suministradas por cliente. HTML/SVG/archivos fuera de límite se rechazan.
- H32-05: ADMIN activo contrasta importe completo, moneda, fecha, referencia y cuenta;
  aprobación conserva reglas HU-53 y genera comprobante PDF por correo; rechazo
  exige motivo y genera notificación. No confirma un voucher vencido/eliminado.
- H32-06: efectivo exige importe y fecha en la API/UI; importe debe coincidir con
  la deuda y fecha no futura. Se conservan recepción, actor, referencia y auditoría.
- H32-07: eventos de correo quedan en cola en la misma transacción del pago/decisión.
  Fallo SMTP no revierte dinero ni se declara enviado: reintentos y estado visible.
  Message-ID estable y exclusión de trabajadores; SMTP no garantiza entrega exactamente una vez.
- H32-08: tres meses calendario desde aprobación o rechazo; sin revisión, desde
  subida. El plazo se congela por archivo. Se elimina el contenido, se conserva
  hash/tamaño/operación/decisión y descarga posterior devuelve 410.
- H32-09: preservar pagos tardíos, exclusión entre medios, historial, idempotencia
  y conciliación de doble ingreso de T-25; no habilitar cupo vencido ni doble entrega.

Los tres meses son política acordada del CPPP, no un plazo atribuido a la Ley 29733.
Backups/replicas y retención del registro financiero deben formar parte de la
política operativa; borrar contenido activo no acredita por sí solo eliminación de backups.

## Estructura, contratos y estilo

TypeScript/Fastify/Zod/pg; React/TanStack Query; Node test, Vitest y Playwright.
Migraciones nuevas desde 0031, sin editar las 0001–0030. Módulos y tests de pago
existentes se amplían con archivos para validación de voucher, cola SMTP y retención.
Se reutiliza JSON/base64 de los materiales existentes; no se añade multipart.
La API de nuevas transferencias requiere voucher; las declaraciones históricas
siguen consultables y revisables. Datos de efectivo se validan además del servidor.

Funciones/variables camelCase, tipos/componentes PascalCase, nombres nuevos sin
guiones bajos. Ejemplo: `const archivo = Buffer.from(contenidoBase64, 'base64');`.
Validación estricta, consultas parametrizadas e importes en céntimos. Archivos se
sirven como adjuntos con MIME conocido y protección nosniff; nunca como HTML del sitio.

## Comandos y pruebas

- `npm run test -w backend`; `npm run test:integracion -w backend` con PostgreSQL/Redis temporales.
- `npm run test -w frontend`; `npm run lint -w frontend`.
- `npm run typecheck -w backend`.
- `npm exec -w frontend -- tsc -p tsconfig.app.json --noEmit` y
  `npm exec -w frontend -- tsc -p tsconfig.node.json --noEmit`.
- `npm run e2e:tipos`; `npm run e2e:real -- e2e/prb/real/transferenciaPago.spec.ts e2e/prb/real/cobroCurso.spec.ts`.
- `git diff --check`. Build `npm run build`: solo ejecución manual del usuario.

RED/GREEN por incremento. Pruebas prioritarias: formatos falsificados, tamaño,
IDOR, referencias duplicadas/concurrentes, repetición, rol inactivo, aprobación
sin archivo vigente, borrado con pago intacto, SMTP rechazado y éxito local con PDF.
Ninguna prueba envía correo a destinatarios reales ni mueve dinero bancario.

## Fronteras y publicación

Siempre validar archivos/propiedad, limitar cuerpos, evitar datos privados en logs,
conservar finanzas y proteger secretos SMTP. El usuario ya autorizó archivos,
tablas e integración SMTP necesarios para esta historia. No acceder a cuentas de
correo, afiliar servicios, configurar datos bancarios reales, hacer push o publicar.
SMTP productivo requiere TLS y credenciales propias; el transporte sin TLS solo
se permite a loopback en pruebas. Las notificaciones se guardan con SMTP apagado.

Pendientes externos: cuenta BCP, SMTP remitente/credenciales, backup/retención,
build y revisión humanos. El envío SMTP se probará contra un servidor local.

### Precisiones de integridad tras la revisión

La clave bancaria elimina separadores y se reserva también para referencias
históricas, sin crear vouchers ficticios. Duplicados históricos se conservan como
conflictos y bloquean nuevas asignaciones. La subida usa la misma transacción de
declaración. Reponer un archivo vencido solo se permite en su trámite pendiente
original, con versión nueva e historial de hashes; no reasigna la referencia a
otra solicitud. ADMIN puede rechazar el trámite con motivo para cerrar la revisión.
El efectivo compara importe y fecha incluso en reintentos con referencia conocida.

### Resultado de implementación y revisión HU-32

Implementados H32-01–H32-09 en tablas, API, trabajador y frontend. La guía operativa
está en [pagosTransferenciaEfectivo.md](docs/esp/pagosTransferenciaEfectivo.md) y los
contratos actualizados en [API.md](docs/API.md#hu-32--vouchers-privados-y-comprobantes-por-correo).

La revisión interna adversaria corrigió reserva de referencias históricas,
normalización, recuperación de evidencia pendiente vencida y replay de efectivo.
La revisión del código corrigió plazo configurable fuera de los tres meses acordados,
Message-ID inestable al rotar remitente y envío SMTP que podía superar su lease:
ahora se cancela en un máximo de 60 s frente a un lease de 120 s. Se verificó con
SMTP local rechazado, concurrente y sin respuesta, con datos ficticios y sin mover dinero bancario.
El tercer ciclo de revisión no encontró defectos adicionales en esas correcciones.
Se respetó la preferencia del usuario por revisión interna sin otro modelo.

Se simplificó el acceso tipado a configuración, se quitaron imports introducidos
sin uso y se compartió la condición de refresco de pagos/correos entre las vistas.
La mutación temporal de la validación de referencia fue detectada por sus pruebas;
el archivo se restauró y esas pruebas volvieron a verde.

Verificación final local: 324 unitarias backend, 326 integración PostgreSQL/Redis,
78 Vitest, 3 servidor frontend y 32 E2E Chromium aprobados, sin omisiones: 763 casos.
Tipos backend/frontend/E2E y formato del diff aprobados. Lint sin errores, con los
dos avisos preexistentes de pdfTexto/CursosPagina. Auditoría npm: cero vulnerabilidades;
firmas/procedencia auditadas sin registros inválidos ni ausentes. La política previa
sin lockfile no permite acreditar una instalación congelada reproducible.

La migración se probó desde 0030 con referencias históricas únicas y duplicadas:
preserva declaraciones, reserva conflictos y no fabrica archivos. Se probaron
IDOR, descarga 410, reemplazo versionado, rol inactivo, duplicados concurrentes,
retención con pago intacto, efectivo y liberación de acceso/constancia.

DoD y Security Checklist revisados: funcionalidad y controles locales verificados;
quedan build manual, aprobación humana, migración en staging/productivo, cuenta BCP,
SMTP real, alertas operativas y política de eliminación en MVCC/WAL/backups/réplicas.
No se declara cumplimiento legal completo ni publicación. No hay cambios de
versiones, commits, etiquetas o push por el agente.

Versión de esta ampliación: base local verificada `v3.0.0.0.0` (`9cc8510`), propuesta
condicional `v4.0.0.0.0` por exigir voucher y monto/fecha a consumidores anteriores
de la API. Mensaje propuesto: `feat!: implementar vouchers, efectivo y comprobantes`.
