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

# Especificación HU-22: catálogo público y retorno al curso

Estado: **propuesta pendiente de aprobación; implementación detenida**.
Fecha: 14/11/2026, America/Lima. HEAD consultado: `e1fa402`.
Rama: `SCRUM-67-hu-22-pagina-publica-de-cursos-del-subdominio`; correspondencia
Jira sugerida por la rama, no comprobada contra Jira.
Plan y checklist: secciones HU-22 de [tasks/plan.md](tasks/plan.md) y
[tasks/todo.md](tasks/todo.md). La especificación T-20 anterior se conserva.

## Objetivo, alcance y decisiones confirmadas

Un colegiado o docente sin cuenta debe explorar los cursos vigentes del CPPP
sin autenticarse, elegir «Inscribirme», iniciar sesión o registrarse y volver
al mismo curso para continuar. Se incorpora el acuerdo A-08 del 09/11, agregado
al criterio el 10/11, y el enlace «Consultar constancias» en el encabezado sin
sesión. Las fechas y el acuerdo proceden de la historia aportada por el usuario.

El usuario confirmó en esta sesión:

- HU-22 retoma la inscripción/reserva existente; el cobro real corresponde a HU-32.
- El nombre profesional del instructor y la información institucional pueden
  ser públicos. Se excluyen datos personales de alumnos y contactos particulares.
- Colegiados y docentes visitantes reutilizan el registro participante existente,
  con rol técnico `AGREMIADO`. No se concede rol instructor ni se valida padrón.
- Se mantiene el criterio previo de conservar los documentos anteriores y añadir
  las secciones de trabajo. Esta solicitud autoriza especificación y planificación
  juntas; no autoriza todavía código, pruebas nuevas ni cambios de configuración.

Es un recorrido de usuario sobre catálogo, autenticación e inscripción ya
existentes. HU-20 y HU-32 son dependencias de producto con alcance propio; no se
crean módulos nuevos de pagos, identidad ni certificación en esta historia.

## Revisión del código e inconsistencias

| Área | Estado observado y brecha |
|---|---|
| Portada pública | [rutas.tsx](frontend/src/rutas.tsx) sirve `/` y `/capacitaciones` con `CatalogoPagina publico`, sin guardia de sesión. No hace falta crear otra portada. |
| Vigencia y privacidad | [cursos.rutas.ts](backend/src/modules/cursos/cursos.rutas.ts) publica `GET /api/publico/cursos` con lista explícita de campos y `Cache-Control: no-store`. [cursos.repositorio.ts](backend/src/modules/cursos/cursos.repositorio.ts) exige `PUBLICADO` y fecha final nula o no vencida en Lima. MSW reproduce esa regla. |
| Información visible | [CursosPagina.tsx](frontend/src/paginas/cursos/CursosPagina.tsx) muestra fechas, modalidad, horas, precio y cupos. Las tarjetas públicas enlazan únicamente a `/login`, sin identificador del curso ni acción explícita «Inscribirme». |
| Acceso | [LoginPagina.tsx](frontend/src/paginas/LoginPagina.tsx) usa `location.state.desde` si llega desde una ruta protegida. La tarjeta pública no lo aporta. «Crear cuenta» tampoco propaga destino. |
| Registro | [RegistroPagina.tsx](frontend/src/paginas/RegistroPagina.tsx) inicia la sesión tras el alta y redirige siempre a `/catalogo`; volver al login también pierde el curso. |
| Inscripción y pago | [DetalleCursoPagina.tsx](frontend/src/paginas/cursos/DetalleCursoPagina.tsx) ofrece inscripción explícita para AGREMIADO: gratuita confirmada o reserva `PENDIENTE_PAGO`. No existe checkout en ese recorrido; la historia no debe presentarlo como un cobro implementado. |
| Constancias | `/verificar` y `/verificar/:codigo` ya son públicos y usan HU-20. [Encabezado.tsx](frontend/src/components/layout/Encabezado.tsx) incluye acceso y enlace institucional, pero carece de «Consultar constancias». |
| Pruebas actuales | Los dos `catalogoPublico.spec.ts` comprueban navegación anónima/API. No prueban selección → login/registro → mismo curso. El ayudante de registro espera `/catalogo` cuando no hay destino; ese comportamiento debe seguir válido. |
| Documentación | Las guías de registro e inscripción conservan menciones a `PARTICIPANTE` y organizaciones que no describen el código actual de entidad única y rol `AGREMIADO`. La documentación nueva usará el contrato real sin rehacer historias ajenas. |
| Seguridad existente | La sesión usa JWT en `sessionStorage`; el interceptor 401 lleva a `/login` sin conservar destino. Son límites existentes que deben registrarse en revisión, sin atribuir a HU-22 una migración de sesiones que no realiza. |

La revisión anterior es estática. No se han ejecutado recorridos ni suites en
esta fase y no se atribuyen a HU-22 resultados registrados en otras entregas.

## Contrato propuesto del recorrido

```text
Catálogo público → Inscribirme en curso 12 → /login?curso=12
  ├─ Acceder → /cursos/12 → confirmar inscripción o reservar
  └─ Crear cuenta → /registro?curso=12 → /cursos/12 → confirmar o reservar
Encabezado sin sesión → Consultar constancias → /verificar
```

- El parámetro nuevo `curso` contiene solo el ID, con el mismo formato del backend:
  de 1 a 15 dígitos, primero distinto de cero (`^[1-9]\d{0,14}$`). Se mantiene
  como texto. No se acepta una URL o ruta arbitraria ni un ID repetido en la query.
- El identificador válido se conserva en el cambio login ↔ registro, recargas,
  validación de formulario y errores de credenciales o alta duplicada. No se
  guarda una segunda sesión ni información personal para conseguirlo.
- El destino se construye como `/cursos/<id>` solo después de validar. Este
  destino tiene prioridad si existe; si no existe o es inválido, el login conserva
  su retorno interno `desde` y su inicio por rol. No convertir `desde` en una URL
  externa. El registro sin selección conserva `/catalogo` como destino actual.
- El acceso y el registro devuelven a la pantalla del curso, sin inscribir ni
  reservar automáticamente. La confirmación sigue siendo una acción del usuario.
- El curso se consulta de nuevo al llegar al detalle. La autenticación no prueba
  disponibilidad ni concede permisos: el servidor conserva sus comprobaciones.
- El catálogo público mantiene seis resultados por página, filtros y búsqueda.
  «Vigente» conserva la regla existente: publicado y fecha final hoy o posterior
  en Lima, o sin fechas. En este último caso se muestra «Fechas por confirmar»;
  no se inventa un calendario. Cursos sin cupos muestran «Sin cupos» y no ofrecen
  una acción activa que prometa inscripción.
- «Consultar constancias» es el texto del enlace a HU-20, no una pantalla nueva.
  La referencia a SIFODS define esa ubicación y propósito, sin exigir copiar su
  diseño o marca. Se conserva el enlace institucional de `CPPP.web.url`.

## Criterios de aceptación verificables

| ID | Dado / Cuando / Entonces |
|---|---|
| HU22-01 | Dado un visitante sin sesión, al abrir `/` o `/capacitaciones` ve únicamente cursos publicados vigentes. Borradores, cerrados y vencidos no aparecen en resultados ni totales. Se conservan búsqueda, filtros y paginación, con vigencia del día de Lima. |
| HU22-02 | Cada resultado muestra título, fechas o «Fechas por confirmar», modalidad, horas lectivas, costo en soles con dos decimales o condición gratuita, y cupos disponibles. No se solicitan credenciales para ver esa información. |
| HU22-03 | La respuesta pública contiene únicamente los campos permitidos de curso; no incluye DNI, correos, celulares particulares, contraseñas, usuarios inscritos, estado individual de inscripción, materiales o enlaces de reunión. El nombre profesional del instructor y contactos institucionales están permitidos. Las rutas privadas siguen requiriendo autorización. |
| HU22-04 | Al pulsar «Inscribirme» en una tarjeta con disponibilidad, el visitante llega al acceso con la selección de ese curso. Cambiar la selección cambia el destino; no existe una selección global que mezcle pestañas. Con sesión participante vigente llega directamente al curso; sin cupos se muestra «Sin cupos» y no se inicia inscripción. |
| HU22-05 | Tras acceder con una cuenta existente desde esa selección, se abre el mismo `/cursos/:id`. Una contraseña errónea y una recarga del acceso no pierden la selección. El acceso sin selección conserva los inicios por rol y los retornos QR existentes. |
| HU22-06 | Desde el acceso del curso, «Crear cuenta» conserva la selección; volver al login y recargar también. Un alta válida inicia sesión y abre ese mismo curso. Los errores de registro conservan la selección; un duplicado permite volver al acceso. El registro sin curso sigue yendo al catálogo y no concede permisos de instructor. |
| HU22-07 | Al volver al curso no se ha creado ninguna inscripción automáticamente. Al confirmar explícitamente, un gratuito queda `EN_CURSO` y uno con costo queda `PENDIENTE_PAGO`, sin mensaje de pago realizado. Reintentar no duplica la inscripción. Si el curso ya no existe, está cerrado, no es accesible o no tiene cupos, se informa el estado real sin fingir una inscripción. |
| HU22-08 | El encabezado sin sesión, en catálogo, login y registro, incluye «Consultar constancias». Abre `/verificar` y permite consultar HU-20 sin login. También permite ir al sitio principal configurado del CPPP. No se modifica la exposición mínima aprobada para la verificación por código de HU-20. |
| HU22-09 | Parámetros vacíos, cero, negativos, decimales, ID demasiado largo, duplicados, rutas, esquemas y URLs se ignoran como destino de curso. No provocan redirección externa, bucle, petición arbitraria ni cambio de rol. Los controles de API siguen aplicándose aunque se manipule la URL. |
| HU22-10 | Carga, vacío, error con reintento y estados sin cupos son comprensibles. Catálogo, encabezado y acceso/registro se usan con teclado y foco visible, sin scroll horizontal a 320 y 360 px, y conservan una presentación legible a 768, 1024 y 1440 px. Las nuevas acciones tienen nombre accesible y no anidan enlaces. |

## Pila, estructura y estilo

Node 24, npm 11 y workspaces existentes. Frontend React 19, React Router 7,
TanStack Query, Tailwind y Vitest; E2E Playwright; backend Fastify/TypeScript,
PostgreSQL y Redis. Se conservan manifiestos y contratos del repositorio.

```text
frontend/src/paginas/cursos/CursosPagina.tsx  → catálogo compartido y tarjetas
frontend/src/paginas/LoginPagina.tsx         → entrada con selección
frontend/src/paginas/RegistroPagina.tsx      → alta y retorno al curso
frontend/src/components/layout/Encabezado.tsx → accesos públicos institucionales
frontend/src/lib/                          → retornoCurso.ts y su test, propuestos
frontend/src/mocks/                        → contrato demo existente
backend/test/integracion/catalogo.test.ts  → privacidad/vigencia reales existentes
e2e/prb/demo/, e2e/prb/real/                → recorridos; ayud/ comparte acciones
docs/esp/                                 → guía HU-22 posterior a aprobación
```

Ejemplo real de estilo de `formatoCurso.ts`, sin añadir implementación ahora:

```ts
export const costoCurso = (costo: number) => (costo === 0 ? 'Gratuito' : `S/ ${costo.toFixed(2)}`)
```

Nombres nuevos sin `_`: camelCase en variables/funciones y PascalCase en tipos
y componentes. Mantener el formato del archivo tocado, los componentes y tokens
institucionales. El contrato de ID y campos públicos se toma del backend; no se
añaden dependencias, APIs públicas de detalle ni nuevas formas de autenticación.

## Pruebas y comandos después de aprobar

| Comprobación | Comando desde la raíz | Condición |
|---|---|---|
| Unidad del retorno propuesto | `npm exec -w frontend -- vitest run src/lib/retornoCurso.test.ts` | El archivo se escribirá tras aprobación; primero rojo por comportamiento esperado. |
| Recorridos nuevos demo | `npm run e2e -- --grep 'HU22-'` | IDs en nombres de pruebas; proyectos escritorio y móvil actuales. |
| Recorridos nuevos reales | `npm run e2e:real -- --grep 'HU22-'` | Solo `gestioncapa_e2e`, datos aislados, nunca una BD de producción. |
| Unitarias de ambos workspaces | `npm test` | Incluye pruebas Node del servidor frontend; no invoca build. |
| Tipos de aplicación y E2E | `npm run typecheck` y `npm run e2e:tipos` | Revisar las configuraciones `noEmit`; sin ejecutar scripts build. |
| Lint disponible | `npm run lint -w frontend` | No añadir supresiones para ocultar fallos. |
| Regresión de API | `npm run test:integracion` | PostgreSQL/Redis temporales; revisar aislamiento antes de ejecutar. |
| Regresión de navegador | `npm run e2e` y `npm run e2e:real` | Acceso por rol, QR, registro, catálogo, HU-16 y HU-20. |
| Integridad documental | `git diff --check -- SPEC.md tasks/plan.md tasks/todo.md` | Distinguir los cambios actuales de los ya presentes. |
| Build, solo usuario | `npm run build` | Manual y pendiente hasta evidencia posterior a implementación. |
| Desarrollo, si hace falta | `npm run dev:demo` o `npm run dev` | El segundo requiere servicios locales disponibles. |

Usar pruebas unitarias para validar el ID y construir destinos; Playwright para
los recorridos visibles y errores; integración para preservar el contrato público
y las autorizaciones. Reutilizar pruebas actuales que ya acreditan comportamiento
existente; no inventar rojos para lo que ya funciona. La nueva lógica y cualquier
defecto corregido requieren prueba previa fallida por la causa adecuada.
No cambiar el umbral vigente de cobertura de asistencia, ni omitir pruebas.

## Contrato visual, seguridad y límites

La pantalla permite comparar cursos y elegir uno. Se conserva su diseño CPPP:
tipografía, colores y componentes actuales. La acción «Inscribirme» debe ser
explícita y asociada a su curso, sin meter un enlace dentro de otro. El encabezado
debe acomodar marca, web institucional, constancias y acceso también en móvil.
Verificar contraste, tabulación, foco, DOM, consola y red en navegador real;
no basta compilar o comprobar tipos. No se requiere un rediseño del login.

Fronteras de confianza: query del navegador → navegación de acceso/registro;
API pública → tarjeta; sesión → detalle e inscripción protegidos. Activos:
credenciales, datos de alumnos, permisos y vacantes. Casos de abuso: forzar una
URL externa, inyectar un rol en el alta, leer campos privados o reservar sin
confirmación. Mitigaciones: ID validado y destino construido, lista de campos,
reglas de servidor, escape de texto de React y ninguna escritura al redirigir.

Siempre: pruebas previas a cambios de comportamiento, compatibilidad QR,
revisión de privacidad y datos de prueba aislados. Pedir decisión si aparece
una migración, nueva dependencia, cambio de autenticación del servidor, cobro
o alta de instructor externo. Nunca: secretos en documentación/logs, ampliar
permisos para evitar un 403, simular pagos o saltar controles para obtener verde.

No se reescriben migraciones históricas ni se cambia la política temporal de
inscripción de HU-16: hoy el catálogo filtra vencidos y el endpoint comprueba
publicación/cupos/rol. El cierre de inscripción por fecha requeriría definir una
regla adicional. Tampoco se configura DNS, TLS o hosting en esta fase.

La revisión final debe contrastar el resultado con
`~/.agents/agent-skills/references/definition-of-done.md` y
`~/.agents/agent-skills/references/security-checklist.md`. Registrar controles
aprobados, pendientes y no aplicables con su motivo. Persistencia de sesión en
`sessionStorage` y dependencias sin lockfile versionado son riesgos preexistentes;
no declararlos corregidos por esta historia. No ejecutar instalaciones con scripts
desconocidos ni remediaciones forzadas como parte de la revisión.

## Aprobación y preparación de entrega

La implementación seguirá los incrementos del plan solo después de aprobación.
Aplicar debugging-and-error-recovery ante fallos, code-simplification únicamente
en lo tocado y revisión de calidad/seguridad antes de entregar. Git, PR y build
los ejecuta el usuario según AGENTS.md; no hay commits ni publicaciones del agente.

Para publicar después faltará comprobar build manual, CI, revisión humana,
catálogo real sin MSW y resolución de rutas `/`, `/login`, `/registro` y
`/verificar` en el subdominio con HTTPS. DNS, acceso al servidor y hostname final
no se presuponen disponibles. Reversión por PR al estado anterior, sin cambios
de datos de negocio por este recorrido de navegación.

Preguntas de alcance sobre pago, privacidad y tipo de alta: resueltas por el
usuario y reflejadas arriba. Pendiente: aprobar esta propuesta. El checklist
de HU-22 distinguirá las verificaciones documentales actuales de la ejecución
funcional futura. El contenido T-20/CPPP previo conserva su estado independiente.
