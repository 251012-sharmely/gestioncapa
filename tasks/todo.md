# Seguimiento CPPP

## Etapa 1
- [x] Identidad: título e insignia de la pestaña, rol visible Agremiado, documentación institucional.
- [x] Catálogo público paginado: solo publicados de la organización CPPP configurada, sin materiales ni datos de inscritos.
- [x] Revocación del token al salir, conservando otras sesiones del mismo usuario.
- [x] Bloqueo de 15 minutos tras cinco accesos fallidos y límite de peticiones por usuario.
- [x] Pruebas de API, permisos y navegador Chromium; tipos y documentación.
- [ ] Build: ejecución manual por el usuario.

## Etapas siguientes
- [ ] Etapa 2: padrón, recuperación, perfiles, usuarios y sedes.
- [ ] Etapa 3: formación, categorías, reprogramación y notificaciones.
- [ ] Etapa 4: aprendizaje y evaluaciones.
- [ ] Etapa 5: pagos y comprobantes.
- [ ] Etapa 6: certificación y auditoría.
- [ ] Etapa 7: videoconferencia propia y asistencia virtual.
- [ ] Etapa 8: consulta, reportes y operación.

No se cambia el estado de una etapa por tener únicamente una pantalla demo.

## Evidencia de esta entrega

- Tipos de backend/frontend aprobados; sin ejecutar build.
- 255 pruebas unitarias backend y 55 frontend, más 3 del servidor frontend.
- 215 pruebas de integración aprobadas en una base temporal aislada.
- 29 recorridos Chromium: catálogo público (dos a 360 px y uno con backend real), acceso y navegación.
- Mutación comprobada: cambiar el bloqueo al sexto fallo hace fallar la prueba.
- Lint frontend: sin errores, con dos advertencias preexistentes (regex en pdfTexto y estado en efecto del catálogo).
- Pendientes: build manual, revisión humana del PR y matriz completa de navegadores.


## T-23: adaptación y evidencia

- [x] Documentar cambio de enfoque, vocabulario y compatibilidad del Sprint 1.
- [x] Corregir el mapa de la portada pública y los nombres visibles de roles en documentación vigente.
- [x] Registrar prioridades de los sprints 2 y 3 sin inventar fechas o puntos.
- [x] Distinguir integración real, demostración y evidencia externa pendiente.
- [ ] Validar correspondencia del original Figma con la copia usada por el frontend.
- [ ] Adjuntar evidencia del backlog y Planning Poker del Lab 5.
- [x] Incorporar reglas HU-20 v2 delegadas al equipo; firmas oficiales pendientes.

Esta entrega de T-23 modifica documentación; las pruebas de la etapa 1 registradas
arriba corresponden a la entrega anterior, no se atribuyen a nuevas funciones.


Verificación documental de T-23: 55 enlaces locales comprobados, referencias a
código/pruebas existentes y alcance de sprints revisados; `git diff --check` sin
errores. No se ejecutaron pruebas funcionales nuevas ni build porque todos los
cambios de esta entrega son Markdown. No se modificaron versiones ni Git.


## HU-50

- [x] Registro persistente, rol fijado por servidor, unicidad, bcrypt y auditoría atómica.
- [x] Validación en español, conservación de datos y recuperación asistida.
- [x] Formulario y flujo demo/real a 360 px con teclados numéricos.
- [ ] Aplicar migraciones en el entorno de entrega y ejecutar build manual.

La recuperación automática por correo, el padrón y el docente externo quedan fuera
de esta entrega.


## HU-16

- [x] Confirmación gratuita y reserva pagada persistente, sin duplicados ni exceso de cupos.
- [x] Estado consistente en detalle, Mis cursos, historial y PDF.
- [x] Conservar inscripción manual y estados históricos.
- [ ] Migración 0012 y build en el entorno de entrega: ejecución manual.

HU-33 y HU-32 quedan fuera de esta entrega.

## HU-35 · Roles y entidad única del CPPP

<<<<<<< Updated upstream
- [x] Roles administrador, instructor y agremiado en API, interfaz y demo.
- [x] Migraciones nuevas de roles y retirada de multiorganización conservando relaciones.
- [x] Instructor asignado consulta asistencia; otros instructores reciben 403.
- [x] Gestión administrativa de usuarios con bcrypt, cambios de rol y auditoría.
- [x] Correos CPPP y sustitución de sesión/reunión de extintores.
- [x] Tipos, 329 pruebas unitarias, 239 integraciones y recorridos reales de roles/usuarios verificados.
- [ ] Respaldo/restauración, build, migración y Git/PR manuales en el entorno de entrega.
=======
## HU-20 (Sprint 2, demostración)

- [x] Emisión presencial por 80 %, cierre transaccional y código estable.
- [x] PDF con logo, DNI oculto, QR, fuentes locales y firmas genéricas identificadas.
- [x] Verificación pública mínima; documento/archivo solo para titular o administrador.
- [x] Excepción, anulación y corrección con actor, fecha y motivo auditados.
- [x] Recorrido real a 360 px y contraste del QR renderizado en PDF.
- [ ] Migración 0013 y build del entorno de entrega: ejecución manual.
- [ ] Firmas auténticas y plantilla oficial; reglas de los sprints 3–5.

## HU-34 · Horas acumuladas

- [x] Total de certificados válidos con horas de la instantánea y compatibilidad histórica.
- [x] Exclusión de anulados/reemplazados y desglose por año de emisión en Lima.
- [x] Historial con todos los años por defecto, filtro anual y mensaje de cero horas.
- [x] Resumen PDF con total y desglose anual; pruebas unitarias, API y navegador.
- [ ] Build y entrega Git/PR manual del usuario.
>>>>>>> Stashed changes
<<<<<<< Updated upstream
=======

---

## T-20: main protegida, CI por PR y revisión registrada

Estado: **especificación y plan propuestos; implementación pendiente de aprobación**.
Fecha: 14/11/2026. [Especificación](../SPEC.md) · [Plan](plan.md), sección T-20.
Destino confirmado: `lovito99/gestioncapa` (`upstream`).
Se añade esta sección con autorización del usuario, conservando íntegros los
pendientes CPPP y marcadores de conflicto anteriores.

### Preparación de esta entrega documental

- [x] Revisar AGENTS.md, scripts, workflows, plantilla, guías e historial local.
- [x] Confirmar destino central y permiso para añadir secciones a los planes existentes.
- [x] Consultar protección, ejecuciones y revisiones actuales mediante GET públicos.
- [x] Identificar que falla E2E real; no atribuirle una causa todavía no demostrada.
- [x] Definir T20-01…08, responsabilidades, límites, dependencias y verificaciones.
- [x] Guardar SPEC.md y las secciones T-20 de plan.md y todo.md.
- [ ] Obtener aprobación del usuario antes de implementar.

### Ejecución posterior a aprobación

- [ ] **T20-P1 — Diagnóstico reproducible** (S; depende de aprobación).
  - Aceptación: prueba concreta, fallo esperado y causa raíz documentados.
  - Verificación: log/informe y comando enfocado; rojo por el defecto, no por servicios caídos.
  - Archivos: prueba identificada en `e2e/prb/real/`, si requiere precisión; `docs/evidenciaT20.md`.
  - Precisar archivos de P2 antes de modificar su implementación.
- [ ] **T20-P2 — Corrección mínima** (M; depende de P1).
  - Aceptación: regresión roja antes del arreglo, verde después, limpieza acotada sin cambiar comportamiento.
  - Verificación: prueba enfocada, tipos, unitarias y E2E demo/real; integración y cobertura si aplican.
  - Archivos: máximo cuatro, identificados por P1; sin ampliación silenciosa de alcance.
  - Entregar mensaje de commit al usuario; el agente no lo ejecuta.
- [ ] **Control A — Causa y regresión**: evidencia rojo/verde, alcance revisado y suites afectadas satisfactorias.
- [ ] **T20-P3 — Contrato CI/Jira** (M; depende de P2).
  - Aceptación: eventos de PR, clave en rama o título y cuatro checks reales, con permisos mínimos.
  - Verificación: YAML/Actions, entradas/salidas del validador y eventos/Checks del PR.
  - Archivos: dos workflows, evidencia y test solo si cambia lógica; no reescribir lo que ya cumple.
- [ ] **T20-P4 — Guías coherentes** (M; depende de P3).
  - Aceptación: nombres de checks, revisión humana, instalación y evidencias sin contradicciones.
  - Verificación: comparación con scripts/workflows, enlaces y diff documental.
  - Archivos: `docs/calidad.md`, `docs/esp/calidad.md`, `docs/e2e.md`, `README.md` y plantilla existente del PR.
- [ ] **Control B — Listo para PR manual**: comprobaciones aplicables, build ejecutado por el usuario y PR nuevo al central con clave confirmada.
- [ ] **T20-P5 — Protección efectiva** (S; depende de Control B y checks recientes).
  - Aceptación: regla `main` guardada, PR + 1 aprobación, cuatro checks y sin bypass.
  - Verificación: captura/configuración efectiva y merge bloqueado sin aprobación o con checks fallidos; sin push de prueba.
  - Responsable: administrador humano. Registro: `docs/evidenciaT20.md`.
- [ ] **T20-P6 — Revisión y evidencia final** (S; depende de P5).
  - Aceptación: Approve humano vigente y cuatro checks success para el último estado del PR.
  - Verificación: enlaces, SHAs, captura y T20-01…08; revisión de calidad, seguridad y preparación de entrega.
  - Archivos: `docs/evidenciaT20.md` y esta sección de seguimiento.
  - Si cambia el PR al registrar evidencia, repetir checks y renovar la aprobación.
- [ ] **Control C — Cierre**: criterios y Definition of Done acreditados; límites y pendientes informados antes de decidir merge manual.

### Evidencias y decisiones todavía pendientes

- [ ] Confirmar en Jira si `SCRUM-118` es la clave real de T-20.
- [ ] Identificar administrador y revisor humano con escritura, distinto del autor.
- [ ] Diagnosticar la causa del fallo E2E real y registrar su prueba de regresión.
- [ ] Resolver o aceptar expresamente los riesgos de dependencias, scripts y ausencia de lockfile versionado.
- [ ] Aportar build local ejecutado manualmente por el usuario tras la implementación.
- [ ] Captura de la regla guardada para `main` central y protección efectiva.
- [ ] URL del nuevo PR y de la aprobación humana vigente.
- [ ] URLs de Calidad y E2E satisfactorias, con fecha y SHAs del estado aceptado.
- [ ] Registrar Planning Poker cuando el equipo aporte su estimación.
- [ ] Revisar `~/.agents/agent-skills/references/definition-of-done.md` y `security-checklist.md` sobre el resultado implementado, sin declarar aprobados controles pendientes.

Esta fase solo añade documentación; no ejecuta pruebas funcionales, build,
operaciones Git de escritura ni cambios de configuración en GitHub. Las
ejecuciones consultadas son antecedentes remotos. No hay commits nuevos del
agente ni versión publicada; propuesta documental: Interno, `v2.0.0.1.1`
desde la base local comprobada `v2.0.0.1.0`, según VERSIONING.md.

---

## HU-22: catálogo público y retorno al curso

Estado: **especificación y plan propuestos; implementación pendiente de aprobación**.
Fecha: 14/11/2026. [Especificación HU-22](../SPEC.md#especificación-hu-22-catálogo-público-y-retorno-al-curso)
· [Plan HU-22](plan.md#hu-22-catálogo-público-acceso-y-retorno-al-curso).
Se conserva el contenido CPPP/T-20 previo y sus pendientes independientes.

### Preparación documental

- [x] Revisar portada pública, API, vigencia, tarjetas, login/registro y HU-16/HU-20.
- [x] Detectar pérdida de curso en login/alta y ausencia del enlace de constancias.
- [x] Confirmar alcance de reserva frente a cobro real, privacidad y cuenta participante.
- [x] Definir contrato del parámetro `curso` y criterios HU22-01…10.
- [x] Añadir especificación, dependencias, tareas y verificaciones sin implementar.
- [ ] Obtener aprobación del usuario antes de escribir código o pruebas nuevas.

### Incrementos posteriores a aprobación

- [ ] **HU22-P1 — Retorno seguro desde login** (M; depende de aprobación).
  - Aceptación: HU22-05/09, ID validado, error/recarga y compatibilidad QR/inicio por rol.
  - Verificar: Vitest de retorno y Playwright HU22-05/09, primero rojo y después verde.
  - Archivos: ayudante/test `retornoCurso`, LoginPagina y E2E demo público; cuatro en total.
- [ ] **HU22-P2 — Registro con selección** (M; depende de P1).
  - Aceptación: HU22-06, alta y cambio login/registro sin perder curso; registro directo conserva catálogo.
  - Verificar: casos HU22-06 demo/real antes y después; regresión HU-50 sin selección.
  - Archivos: RegistroPagina, ayudante de registro y dos suites de registro; cuatro en total.
- [ ] **Control A**: retorno validado, compatibilidad, pruebas registradas y mensajes para commits manuales.
- [ ] **HU22-P3 — Inscribirme en el catálogo público** (M; depende de P1–P2).
  - Aceptación: HU22-01/02/04/07, selección correcta y confirmación explícita gratuita o reserva pendiente.
  - Verificar: recorrido completo demo/real; sin POST al autenticar ni cobro simulado.
  - Archivos: CursosPagina, dos suites públicas y ayudante compartido solo si se necesita; máximo cuatro.
- [ ] **HU22-P4 — Consultar constancias** (M; después de P3).
  - Aceptación: HU22-08/10, enlace anónimo a HU-20 y encabezado usable en móvil/teclado.
  - Verificar: enlace ausente en rojo, después acceso a `/verificar` y códigos de prueba; web institucional conservada.
  - Archivos: Encabezado y dos suites públicas; tres en total.
- [ ] **Control B**: recorrido público completo, privacidad, constancias y estados visibles verificados en navegador.
- [ ] **HU22-P5 — Regresión, limpieza y revisión** (M; depende de P1–P4).
  - Aceptación: HU22-03/09/10 y regresión; limpieza limitada a código tocado.
  - Verificar: unitarias, tipos, lint, API aislada y Playwright; causa raíz antes de arreglar fallos.
  - Revisar Definition of Done y security-checklist sin ocultar riesgos de sesión/dependencias previos.
  - Máximo cinco archivos de corrección/revisión; dividir antes si aparece más alcance.
- [ ] **HU22-P6 — Documentación y entrega** (M; depende de P5).
  - Aceptación: contrato y evidencia reales, pendientes explícitos y mensajes/versionado manuales.
  - Verificar: enlaces y diff; build solo por el usuario. No publicar ni hacer push.
  - Archivos: guía pública propuesta, rutas y secciones HU-22 de SPEC/plan/todo; cinco en total.
- [ ] **Control C**: aceptación, build manual, CI, revisión humana y subdominio real comprobados antes de decidir publicar.

### Evidencia pendiente

- [ ] Rojo → verde de cada comportamiento nuevo o defecto corregido.
- [ ] Acceso y alta desde tarjeta, error/recarga y retorno al curso elegido en demo y real.
- [ ] Inscripción solo tras confirmación, estados gratuito/PENDIENTE_PAGO y ausencia de duplicados.
- [ ] API sin datos privados; detalle/materiales protegidos; sin escalado a instructor.
- [ ] Parámetros manipulados y compatibilidad de QR/inicios por rol.
- [ ] Constancias sin sesión y enlace institucional desde el encabezado.
- [ ] Teclado, foco, consola/red y anchos 320/360/768/1024/1440.
- [ ] Resultado de tipos, lint, unitarias, integración aislada y suites Playwright.
- [ ] Resultado del build ejecutado manualmente por el usuario tras implementar.
- [ ] Revisión de las dos referencias en `~/.agents/agent-skills/references/` y riesgos pendientes registrados.
- [ ] Evidencia de CI, revisión humana y rutas/HTTPS del subdominio; publicación fuera de esta fase.

No se han ejecutado pruebas funcionales, builds ni operaciones Git de escritura
en esta entrega documental. Los resultados previos de otras secciones no se
atribuyen a HU-22. Sin commits nuevos del agente ni versión publicada;
clasificación documental Interno y propuesta condicional `v2.0.0.1.1` desde
`v2.0.0.1.0`, sin asignar incrementos por cada tarea.
>>>>>>> Stashed changes
