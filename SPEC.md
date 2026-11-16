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
