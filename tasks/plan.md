# Plan de implementación CPPP

Fuente: T-23 / SCRUM-121 y Requisitos GestionCapa CPPP v4.0, 27/10/2026,
proporcionados por el usuario. Alcance elegido: todos los requisitos por etapas.
El detalle y la evidencia se mantienen en [la matriz](../docs/enfoqueCppp.md).

El calendario del producto se conserva: Sprint 2 (27/10–09/11/2026), certificados
con QR; Sprint 3, pagos y sesiones virtuales seguras antes del evento de fines
de noviembre. Las etapas técnicas siguientes no reemplazan esa prioridad ni
fijan fechas no proporcionadas. Véase [T-23](../docs/esp/reestructuracionCppp.md).

| Etapa | Resultado verificable | Dependencias |
|---|---|---|
| 1. Base institucional y acceso | Identidad CPPP, catálogo público, sesión revocable, bloqueo y límites | PostgreSQL y Redis existentes |
| 2. Personas y afiliación | Perfil, recuperación, usuarios, sedes y padrón habilitado | Contrato del padrón, SMTP y política de altas |
| 3. Formación | Edición real de cursos, categorías/etiquetas, sesiones y avisos | Etapa 2 y notificaciones |
| 4. Aprendizaje | Avance, evaluaciones, intentos adicionales y foro | Etapas 2–3 |
| 5. Pagos | Pasarela, BCP, efectivo, confirmación y comprobantes | Pasarela aprobada, comisiones, cuenta BCP, SMTP |
| 6. Certificación | Cierre con asistencia/nota/pago, excepción, firma, QR, anulación y auditoría | Etapas 3–5 y firma autorizada del Decano |
| 7. Videoconferencia | Jitsi propio, control real de pantalla/expulsión y asistencia | Servidor y despliegue Jitsi aprobado |
| 8. Consulta y operación | Historial completo, horas, reportes PDF/Excel, paneles, rendimiento y respaldo | Etapas anteriores y servidor del CPPP |

La vista MSW o una ruta pendiente no acredita una funcionalidad del backend.
Cada etapa verifica permisos, errores, persistencia y recorrido de usuario.
No se ejecutan builds, cambios de versión ni operaciones Git de escritura.
No se inventan credenciales, pagos, afiliados habilitados ni firmas.

La URL sugerida capacitacion.cpppregion-cusco.com y el presupuesto de 5 USD
son requisitos del documento, no un despliegue o una capacidad ya contratados.
El documento no especifica API/esquema del padrón, pasarela, SMTP, acceso al
servidor ni firma autorizada. Las reglas HU-20 v2 se recibieron y se documentan
en [certificados](../docs/esp/certificados.md). Las integraciones y firmas
se deben aportar antes de dar por completadas las etapas correspondientes.

---

## T-20: protección de main, CI y revisión en pares

Estado: **propuesta pendiente de aprobación; implementación detenida**.
Especificación: [SPEC.md](../SPEC.md). Lista de trabajo: [todo.md](todo.md),
sección T-20. Fecha: 14/11/2026. Base local: `031eb92`.

Esta sección se añade con autorización expresa del usuario y conserva el plan
CPPP anterior. El repositorio objetivo confirmado es `lovito99/gestioncapa`
(`upstream`), no el fork de `origin`. Las etapas siguientes son de T-20.

### Enfoque y decisiones

La base ya contiene dos workflows de PR, validación Jira y plantilla de revisión.
Se verifican y corrigen las brechas demostradas; no se recrean mecanismos que
ya funcionan. La consulta actual muestra `main` sin protección, E2E real fallida
y PR #24 con comentario de bot, sin aprobación humana. La causa E2E no se infiere
de la anotación genérica de salida 1 ni del aviso de Node 20 de upload-artifact.

Conservar cuatro checks: **Clave Jira**, **Tipos, build y pruebas**,
**Entorno con Docker Compose** y **E2E demo y real**. La regla clásica para `main`
exigirá PR, una aprobación de otro integrante, checks, rama actualizada y
conversaciones resueltas; sin bypass, force push o borrado.

Aplicar rojo → verde a cambios de comportamiento y validar configuración con
resultados reales del PR. Cada incremento se entrega con mensaje de commit
para ejecución manual; los builds también son manuales. No habilitar auto-merge.

### Dependencias y orden

```text
Aprobación de SPEC y plan
  → T20-P1: reproducir y localizar E2E real
  → T20-P2: corregir el defecto demostrado
  → Control A: regresión y alcance
  → T20-P3: verificar contrato de los workflows y Jira
  → T20-P4: alinear documentación de contribución
  → Control B: verificación local y build manual del usuario
  → publicación de rama y creación de PR, solo por el usuario
  → ejecuciones recientes del PR con los cuatro checks disponibles
  → T20-P5: guardar y comprobar protección, por administrador
  → T20-P6: revisión humana, evidencia y revisión final
  → Control C: decisión manual de entrega, sin publicar desde el agente
```

Trabajo secuencial en este workspace; no se planifica delegación. El administrador
puede preparar acceso y el equipo estimar en paralelo a la investigación, sin
alterar código ni fusionar nada. La aprobación humana se obtiene después del
último cambio revisable y debe renovarse si se invalida.

### T20-P1: diagnóstico reproducible de E2E real

Descripción: obtener el log/informe del job conocido y reproducir el fallo de
la prueba concreta en entorno aislado. Usar debugging-and-error-recovery:
reproducir, localizar, comprobar hipótesis y registrar causa antes de corregir.

Aceptación:
- [ ] Identificar prueba, mensaje y condición que falla, con comando enfocado.
- [ ] Distinguir fallo de aplicación/prueba/datos/infraestructura de startup.
- [ ] Registrar causa y archivos de la corrección en el plan antes de editar código.

Verificación: `npm run e2e:real -- --grep 'ID-del-criterio-identificado'`,
sustituyendo el marcador tras leer el log. La prueba debe fallar por el defecto;
un problema de servicios no sirve como rojo de una corrección de producto.
Si ya hay una prueba que reproduce el defecto, conservarla y precisar su alcance.
Si falta, escribir la regresión primero. No inventar la causa si no hay logs.

Dependencia: aprobación. Tamaño: S, hasta dos archivos.
Archivos: prueba identificada en `e2e/prb/real/`, si necesita precisión;
`docs/evidenciaT20.md` para diagnóstico. No hay corrección en este incremento.

### T20-P2: corrección mínima con regresión

Descripción: aplicar test-driven-development e incremental-implementation al
defecto demostrado en P1; refinar el test antes del cambio si el existente no
expresa el resultado requerido. No modificar el producto solo para acomodar
expectativas incorrectas de una prueba.

Aceptación:
- [ ] Registrar rojo por el defecto y verde con la corrección mínima.
- [ ] El recorrido real funciona; demo y suites afectadas conservan su resultado.
- [ ] Simplificar únicamente lo tocado y volver a verificar si cambia código.

Verificación: prueba enfocada de P1, `npm run e2e:real`, `npm run e2e`,
`npm run typecheck`, `npm run e2e:tipos` y `npm test`; lint frontend si se toca.
Integración y cobertura si se toca API, datos o preparación del backend.
Servicios y pruebas destructivas únicamente en entorno temporal aislado.

Dependencia: P1. Tamaño: M, máximo cuatro archivos entre prueba, causa y evidencia.
Archivos concretos: se fijan en P1; pueden estar en `e2e/ayud/`, backend o frontend.
Si el defecto requiere otra funcionalidad, detener ese cambio y revisar alcance.
Commit manual sugerido: título según causa demostrada; `fix:` si corrige producto,
`ci:` si es exclusivamente infraestructura. No se presupone un arreglo concreto.

### Control A: después de P1–P2

- [ ] Causa y rojo/verde documentados; corrección acotada revisable.
- [ ] Suites afectadas pasan sin skips, supresiones ni cambios de umbral.
- [ ] El usuario tiene el incremento y el mensaje para su commit manual.

### T20-P3: contrato de CI y trazabilidad

Descripción: comprobar y ajustar solo si hace falta los disparadores y pasos de
los dos workflows. Mantener nombres y permisos; evitar filtros que excluyan PR
documentales. No cambiar la política de instalación sin decisión expresa.

Aceptación:
- [ ] Ambos workflows atienden apertura, commits nuevos y reapertura; Calidad
  revalida Jira al editar el título y no depende de secretos del fork.
- [ ] Jira acepta clave en rama o título y rechaza ausencia en ambos, pasando
  datos no confiables por entorno; si cambia lógica, pruebas previas en rojo.
- [ ] Los cuatro jobs de aceptación ejecutan sus pasos, sin omitir pruebas ni
  esconder errores con `continue-on-error` o resultados neutros.

Verificación: validación YAML/Actions con `actionlint .github/workflows/calidad.yml
.github/workflows/e2e.yml` si se dispone de actionlint (no está instalado ahora);
pruebas de entrada y salida del validador real y matriz de eventos en GitHub.
No construir tests que solo comparen texto YAML. Si algo ya cumple, registrar
evidencia sin reescribirlo ni atribuirle un ciclo TDD nuevo. Confirmación runtime
de PR y cambios de título en P5–P6; no basta la validación estática.

Dependencia: P2. Tamaño: M, hasta cuatro archivos.
Archivos: los dos workflows, evidencia y prueba de lógica solo si esta cambia.
Commit manual condicional: `ci: asegurar las verificaciones de PR de T-20`.
Si no hay cambios, no se propone un commit vacío.

### T20-P4: documentación coherente de revisión

Descripción: ajustar contradicciones encontradas y mantener la plantilla como
guía de evidencia, dejando claro que la regla de GitHub es quien bloquea merge.

Aceptación:
- [ ] Guías enumeran los cuatro checks, revisión humana vigente, repositorio
  central, configuración manual y diagnóstico del último fallo comprobado.
- [ ] Plantilla pide Jira, prueba/build y enlace a Approve; distingue pendientes
  de evidencias. No presenta comentarios del PR #24 como aprobación.
- [ ] Instrucciones de instalación coinciden con la política de lockfile vigente;
  se registra el riesgo sin cambiar versiones ni política silenciosamente.

Verificación: comparar guías con workflows y scripts; comprobar enlaces locales
y diff. Docs únicamente: no escribir pruebas artificiales ni ejecutar build.
Dependencia: P3. Tamaño: M, cinco archivos.
Archivos: `docs/calidad.md`, `docs/esp/calidad.md`, `docs/e2e.md`, `README.md`,
`.github/pull_request_template.md` (nombre existente).
Commit manual sugerido: `docs: unificar el flujo de revisión y CI de T-20`.

### Control B: después de P3–P4

- [ ] Tipos, unitarias, lint aplicable y E2E pasan tras los cambios pertinentes.
- [ ] Integración y cobertura vigente pasan cuando correspondan.
- [ ] El usuario ejecuta `npm run build` y aporta resultado; pendiente hasta entonces.
- [ ] El usuario publica la rama y abre manualmente un PR nuevo al repositorio
  central con clave Jira confirmada. No reutilizar un PR ya integrado.

### T20-P5: activar y verificar la protección efectiva

Descripción: el administrador guarda la regla exacta de `main`. Publicar YAML
no sustituye este paso. No intentar un push a main para probar el bloqueo.

Aceptación:
- [ ] PR y una aprobación, invalidación de revisiones obsoletas, comprobación
  del último push por otra persona, conversaciones resueltas y rama actualizada.
- [ ] Los cuatro checks recientes de GitHub Actions son obligatorios; regla
  aplicada a administradores, sin bypass, force push ni eliminación.
- [ ] Captura de la regla guardada y consulta de protección efectiva concuerdan;
  el PR no permite merge si falta aprobación o falla un check.

Verificación manual: Settings → Branches del repositorio central, regla `main`,
Checks y caja de integración del PR. Consultas GET de rama/protección, con cuenta
administradora cuando se necesite; no almacenar tokens. Preparar casos negativos
de Jira sin fusionarlos, corregir y repetir CI. Capturar falta de aprobación
antes de solicitar Approve. Si hay que cambiar un commit, renovar revisión.

Dependencia: Control B y checks recientes seleccionables. Tamaño: S, cero cambios
de código; registro en `docs/evidenciaT20.md`. No genera por sí solo un commit de código.

### T20-P6: revisión humana, evidencia y puerta de entrega

Descripción: otro integrante revisa el PR; el agente revisa lo implementado con
code-review-and-quality y security-and-hardening y aplica shipping-and-launch
para informar la preparación de entrega, sin publicar ni integrar.

Aceptación:
- [ ] Approve de otro integrante para cambios vigentes y URL registrada; ambos
  workflows con success y cuatro checks ejecutados en el último estado del PR.
- [ ] Evidencia incluye regla, PR, aprobación, ejecuciones, fecha y SHAs; ningún
  antecedente ni casilla sustituye evidencia. Planning Poker sigue al equipo.
- [ ] Definition of Done y security-checklist revisados, riesgos y pendientes
  explícitos, verificación proporcional y mensajes de commit/versionado manuales.

Verificación: inspección real del PR y revisión del diff; contrastar T20-01…08
con evidencia. Usar las dos referencias de `~/.agents/agent-skills/references/`.
La aprobación, configuración o CI que falten impiden declarar T-20 terminada.
Revisar dependencias/scripts y dejar su riesgo resuelto o expresamente aceptado;
no declarar aprobada la seguridad solo por no cambiar código de autenticación.

Dependencia: P5; revisión humana posterior al último cambio revisable.
Tamaño: S, `docs/evidenciaT20.md` y sección T-20 de `tasks/todo.md`.
Commit manual sugerido cuando exista evidencia: `docs: registrar la revisión y evidencia de T-20`.
Si añadir evidencia modifica el PR, repetir los checks y renovar Approve antes de merge.

### Control C: completo y revisable

- [ ] T20-01…08 acreditados y discrepancias resueltas; no basta el código local.
- [ ] Build manual, revisión humana y seguridad tienen resultado o pendiente explícito.
- [ ] Reversión prevista por PR revisado; no desactivar protección para integrar.
- [ ] Entrega informa cambios, pruebas/resultados, pendientes y commits reales.
  El agente no publica, no hace push y no crea commits, tags ni PR.

### Riesgos y tratamiento

| Riesgo | Impacto | Tratamiento |
|---|---|---|
| Causa E2E desconocida o logs no disponibles | Alto | Investigar primero; pedir únicamente log/informe faltante si bloquea, sin arreglos por suposición. |
| Falta de administrador o revisor con escritura | Alto | Identificar responsables humanos; código local no acredita protección/revisión. |
| Configurar el fork o nombres de checks equivocados | Alto | Destino central confirmado, comprobar emisor y nombres de ejecuciones recientes. |
| Regla exige checks que no se han ejecutado recientemente | Medio | Usuario abre PR, ejecutar workflows y seleccionar los checks observados antes de merge. |
| Dependencias variables y scripts sin política registrada | Alto | Evaluar con security-checklist; elevar decisión de reproducibilidad sin forzar instalación o auditoría. |
| Pérdida de trabajo CPPP por sobrescritura | Alto | Añadir secciones con autorización; conservar prefijo de ambos archivos y conflictos anteriores. |
| Evidencia queda obsoleta tras otro commit | Alto | Vincular SHAs; repetir checks y aprobación tras cambios revisables. |

### Estimación y versión

Los tamaños anteriores orientan la división técnica; no asignan puntos ni
sustituyen Planning Poker. Esa estimación sigue pendiente del equipo.

Base local verificable: `v2.0.0.1.0`, etiqueta sobre `031eb92`. La propuesta
documental actual es **Interno**, con versión orientativa `v2.0.0.1.1` si se
publica desde esa base. Se recomienda una versión por entrega, no por cada tarea.
Si la implementación corrige comportamiento del producto, reclasificar según
[VERSIONING.md](../VERSIONING.md) al revisar el diff final. Sin cambios de versiones,
etiquetas, índice o historial por parte del agente.
