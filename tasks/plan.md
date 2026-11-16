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

## HU-22: catálogo público, acceso y retorno al curso

SCRUM-67 / SCRUM-5. Revisión 15/11/2026 sobre `000a93c`.
Estado: **P1–P6 implementados y verificados localmente; entrega manual pendiente**.
[Especificación vigente](../SPEC.md#especificación-hu-22-catálogo-público-y-retorno-al-curso).
Se conserva el plan CPPP y el checklist histórico de HU-22; esta propuesta recupera
sus enlaces y actualiza alcance/diagnóstico desde la rama realmente disponible.

### Enfoque y dependencias

Reutilizar catálogo público, registro HU-50, inscripción HU-16 y verificación HU-20.
No cambiar tablas ni crear servicios de pago. Un identificador de curso en query
conserva la selección entre login/registro/recarga; construir siempre el destino
interno. La autenticación no ejecuta la inscripción.

Orden: P1 retorno seguro → P2 alta con selección → P3 acción pública → P4 constancias
→ P5 regresión/revisión → P6 documentación de entrega. P4 no depende técnicamente
de P1–P3, pero se ejecutará después para validar el encabezado con el recorrido
completo. No se requieren agentes paralelos ni modificaciones simultáneas.

### HU22-P1 — Retorno seguro desde login y 401 (M, hasta 5 archivos)

Ejecución autorizada por el usuario el 15/11/2026. Se divide P1 en dos cortes para
respetar el tamaño: P1a ayudante/test + login + E2E demo (4 archivos), P1b guard/
interceptor 401 + E2E real (3 archivos). El guard también conserva la selección en
query para que recargar el login tras expiración local no la pierda.

- **Resultado:** HU22-05/09; selección válida, error/recarga, acceso directo y QR
  compatibles. Conservar el curso al recibir401 sin aceptar URLs de redirección.
- **Archivos previstos:** nuevos `frontend/src/lib/retornoCurso.ts` y test,
  `frontend/src/paginas/LoginPagina.tsx`, `frontend/src/lib/api.ts`,
  `e2e/prb/demo/catalogoPublico.spec.ts`.
- **Verificación:** Vitest de retorno primero RED/GREEN; E2E de login/recarga/401,
  parámetros inválidos/duplicados y QR con query; comprobar ausencia de POST al volver.
- **Dependencia:** aprobación de especificación/plan. No alterar almacenamiento de sesión.

### HU22-P2 — Registro con selección (M, hasta 4 archivos)

- **Resultado:** HU22-06; crear cuenta y alternar login/registro conservan curso.
  Errores no pierden selección; alta directa mantiene catálogo y rol participante.
- **Archivos previstos:** `RegistroPagina.tsx`, `e2e/ayud/registro.ts`,
  `e2e/prb/demo/registro.spec.ts`, `e2e/prb/real/registro.spec.ts`.
- **Verificación:** casos de alta con/sin selección y errores, primero RED/GREEN;
  ejecutar `npm run e2e:real -- registro.spec.ts` sobre BD aislada.
- **Dependencia:** P1. Si el ayudante crece, crear un caso específico sin degradar HU-50.

**Control A:** P1/P2 verdes, retorno seguro, alta sin escalado y QR conservado;
registrar resultados y mensajes para commits manuales.

### HU22-P3 — Inscribirme en catálogo público (M, hasta 4 archivos)

- **Resultado:** HU22-01/02/04/07; acción visible por curso disponible, destino
  correcto con/sin sesión, sin elementos interactivos anidados. Confirmación
  explícita en detalle: gratis confirmado o reserva pendiente; sin duplicados.
- **Archivos previstos:** `frontend/src/paginas/cursos/CursosPagina.tsx`,
  `e2e/prb/demo/catalogoPublico.spec.ts`, `e2e/prb/real/catalogoPublico.spec.ts`,
  nuevo `e2e/ayud/catalogoPublico.ts` para compartir preparación y recorrido.
- **Verificación:** recorrido completo demo/real, dos cursos distintos, gratis/con
  costo, sin cupos, curso eliminado/no autorizado y errores; RED antes del cambio.
- **Dependencias:** P1/P2. Mantener formatos, vigencia y filtros existentes.

### HU22-P4 — Consultar constancias desde encabezado (M, hasta 4 archivos)

- **Resultado:** HU22-08/10; enlace anónimo exacto a `/verificar`, web institucional
  conservada y encabezado usable en todos los anchos previstos.
- **Archivos:** `frontend/src/components/layout/Encabezado.tsx`, las dos suites
  `catalogoPublico.spec.ts` de demo/real y el ayudante de recorrido público.
- **Verificación:** enlace ausente en RED; navegar sin sesión, probar estados HU-20,
  teclado/foco y 320/360/768/1024/1440px sin desbordamiento, consola limpia.
- **Dependencia operativa:** P3; no modificar el verificador ni abrir PDFs privados.

**Control B:** visitante explora, accede/se registra, retoma el curso y confirma
inscripción; constancias accesibles sin sesión y enlaces institucionales visibles.

### HU22-P5 — Regresión, simplificación y revisión (M, hasta 5 archivos si hay correcciones)

- **Resultado:** HU22-03/09/10 y aceptación completa; validar datos públicos en API
  real y permisos existentes, simplificar solo lo tocado sin cambiar comportamiento.
- **Archivos previstos:** `backend/test/integracion/catalogo.test.ts`,
  `frontend/src/mocks/cursosDemo.test.ts` y hasta 3 archivos afectados si aparece un
  defecto real. Si hace falta más alcance, dividir antes de implementar.
- **Verificación:** suites frontend/backend, integración catálogo/registro, tipos
  sin build, lint y E2E públicos/registro/roles; comandos en SPEC. Registrar causa
  raíz de fallos y prueba de regresión, sin suprimir checks ni debilitar contratos.
- **Revisión:** corrección, claridad, arquitectura, seguridad y coste; DoD y
  `~/.agents/agent-skills/references/security-checklist.md`. No marcar gates externos verdes.
- **Dependencias:** P1–P4.

### HU22-P6 — Guía y entrega revisable (M, hasta 5 archivos)

- **Resultado:** contratos y evidencia documentados; pendientes reales y mensajes
  de commits/versionado listos para ejecución manual del usuario.
- **Archivos previstos:** nueva `docs/esp/catalogoPublico.md`, `docs/rutas.md`,
  secciones HU-22 de `SPEC.md`, `tasks/plan.md` y `tasks/todo.md`.
- **Verificación:** enlaces, formato y trazabilidad HU22-01…10. Build manual
  pendiente hasta evidencia del usuario; no crear commits, tags, PR o push.
- **Dependencia:** P5. Mantener todo el contenido independiente preexistente.

**Control C:** aceptación local demostrada; para publicar faltan build del usuario,
CI/revisión humana y verificación del subdominio/HTTPS y rutas SPA/API reales.

### Riesgos y preparación

| Riesgo | Tratamiento |
| --- | --- |
| Pérdida de selección o redirección manipulada | Query de identificador único validado; nunca URL arbitraria; regresión QR/401 |
| Cupos o curso cambian durante login | Reconsultar detalle, mostrar estado y confirmar solo por acción explícita; servidor autoritativo |
| Confundir reserva con pago | Mantener PENDIENTE_PAGO y texto honesto; no añadir cobro en HU-22 |
| Cambio incompatible en tarjetas/selectores | Mantener enlace de título y añadir CTA accesible, actualizando pruebas por comportamiento |
| Historial documental con conflictos y links ausentes | Añadir al final y conservar prefijos; enlaces HU-22 apuntan a secciones recuperadas |
| Dependencias sin instalación congelada | Registrar política heredada; no ejecutar instalación ni cambiar paquetes/CI durante esta fase |
| Subdominio solo sugerido | Verificación operativa posterior, sin declarar DNS/HTTPS/publicación aprobados |

No quedan preguntas funcionales bloqueantes con las aclaraciones previas. Aprobar
incluye los supuestos sobre vigencia/fechas de SPEC; nuevas reglas se especificarán
antes de ampliar el alcance. La estimación del equipo no se inventa.

Commits creados: ninguno. La propuesta documental inicial era Interno
`v2.0.0.1.1`; tras implementar se propone **Función**, `v2.1.0.0.0` desde
`v2.0.0.1.0`, por el nuevo recorrido público. No cambia una API existente ni
requiere migración. Git y build siguen siendo manuales.

### Entrega por incrementos para commits manuales

El usuario revisa y selecciona los hunks compartidos; estas son propuestas,
no commits ejecutados ni versiones distintas por cada tarea:

1. `feat: conservar el curso elegido al iniciar sesión` — ayudante, login, guard,
   interceptor 401 y pruebas de retorno; incluye los casos de revisión de rutas.
2. `feat: retomar el curso después del registro participante` — alta, enlaces y
   pruebas compartidas; conserva rol y registro directo.
3. `feat: iniciar inscripción desde el catálogo público` — tarjetas y recorridos
   gratuitos/con costo, respetando cupos y confirmación explícita.
4. `feat: consultar constancias desde el encabezado público` — enlace, accesos,
   teclado y presentación móvil.
5. `fix: ajustar el pie institucional al ancho disponible` — columnas flexibles y
   regresión de los 240 px de desbordamiento detectados a 1024 px.
6. `docs: registrar operación y verificación de HU-22` — guía, rutas, criterios,
   plan y evidencia real, con build/CI/subdominio pendientes.

Los hallazgos de revisión reabrieron P1/P2 en cortes pequeños con RED/GREEN.
P5 no exigió cambiar backend: las pruebas existentes de catálogo/registro ya
cubren lista pública explícita, vigencia, roles y unicidad de inscripción.

Resultados: 660 casos aprobados (271 backend, 239 integración, 76 Vitest, 3 servidor,
33 E2E reales y 38 demo). Tipos y diff aprobados; lint sin errores y dos avisos
preexistentes; auditoría local sin vulnerabilidades. Las suites de navegador se
ejecutaron secuencialmente con un trabajador tras diagnosticar presión de memoria.
No se cambió código, timeout ni calidad para ocultar los fallos de recursos.

Control A y B completados. Control C conserva build manual, CI/revisión humana y
validación del subdominio productivo como pendientes. Ningún commit, tag o push
fue ejecutado por el agente.
