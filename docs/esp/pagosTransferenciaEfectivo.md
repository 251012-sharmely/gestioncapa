# HU-32: transferencia BCP y efectivo

El participante consulta su curso, ve la cuenta/CCI y titular institucionales,
el importe completo en soles y la orden de pago. Adjunta JPG, PNG o PDF de hasta
5 MiB, referencia y fecha. La pantalla muestra «En revisión». Esto conserva
evidencia; ADMIN debe contrastar el abono real en el banco antes de confirmarlo.
El sistema no añade comisión. Las condiciones del banco son ajenas al sistema.

## Uso y estados

1. El participante selecciona un voucher desde el detalle del curso. No debe
   incluir movimientos ajenos, claves ni datos que no ayuden a verificar el abono.
2. La declaración conserva la cuenta ofrecida, orden, monto congelado y referencia.
   Se reserva el número bancario globalmente sin separadores, incluso si se rechaza.
   No puede reutilizarse para otra orden, cuenta o fecha.
3. ADMIN abre «Pagos», consulta la orden y descarga el voucher por la ruta privada.
   Contrasta cuenta, importe completo, moneda, fecha y referencia con el banco.
   Aprueba con confirmación explícita o rechaza indicando el motivo.
4. Al aprobar se registra el pago y se encola un comprobante PDF por correo.
   El rechazo encola el motivo y conserva el archivo durante su plazo.
5. Para efectivo, ADMIN escribe referencia del recibo interno, importe recibido
   y fecha de recepción, y confirma que recibió el importe completo. El servidor
   rechaza importe distinto, fecha futura o repetición que altere esos datos.

Pago previo confirmado habilita contenido/asistencia mientras la reserva siga
vigente. Pago de certificado libera la entrega retenida según los requisitos
académicos existentes; el proceso de constancias se ejecuta cada 30 segundos.
Un pago tardío o adicional se registra para conciliación, sin recuperar cupo
vencido ni aplicar dos veces una obligación. No hay devolución automática.
El PDF de recepción es un comprobante interno, no una factura tributaria.

## Persistencia y protección

La migración `0031-vouchersYComprobantes.sql` añade:

| Tabla | Responsabilidad |
| --- | --- |
| `referenciasTransferencia` | Reserva canónica de números; conflictos históricos quedan reservados sin asignación nueva |
| `vouchersPago` | Versiones privadas BYTEA, hash, MIME, tamaño, cargador y plazos |
| `recepcionesEfectivo` | Importe y fecha recibidos por operación |
| `notificacionesPago` | Outbox durable de comprobantes y rechazos, intentos, leases y errores genéricos |

No se inventan archivos para declaraciones históricas. La migración conserva
esas declaraciones y bloquea números históricos duplicados para nueva asignación;
el CPPP debe resolver su conciliación manualmente. Las finanzas existentes siguen
protegidas frente al borrado de cursos y operaciones.

Cada descarga exige propietario o ADMIN activo; las respuestas privadas usan
no-store, nosniff, adjunto y CSP sandbox. No se publican vouchers, rutas o nombres
del cliente. Los formatos se comprueban por cabecera/firma y límite; esto no es
un antivirus ni saneamiento completo de PDF. El navegador no confirma dinero.

## Correo SMTP configurable

Los eventos se insertan en la misma transacción del pago o rechazo. SMTP apagado
conserva la cola. Un fallo se reintenta con espera creciente hasta una hora;
no cambia el dinero confirmado. El estado pendiente/en proceso/enviado queda
visible en el pago y se actualiza automáticamente.

| Variable | Valor/uso |
| --- | --- |
| `correoHabilitado` | false hasta configurar el remitente institucional |
| `correoServidor`, `correoPuerto` | Servidor SMTP; puerto587 por defecto |
| `correoSeguro` | false para STARTTLS obligatorio; true para TLS implícito (normalmente465) |
| `correoUsuario`, `correoClave` | Secretos del despliegue, nunca enviados al cliente |
| `correoRemitente` | Una dirección institucional válida |
| `correoPlazoEnvioMs` | 60000 por defecto; máximo60000, mínimo100; plazo total cancelable |
| `correoSinTlsParaPruebas` | Solo con NODE_ENV=test y servidor localhost/127.0.0.1 |

El trabajador reclama un mensaje con bloqueo de dos minutos, envía con un plazo
total máximo de un minuto y confirma la entrega con su identificador de proceso.
Un bloqueo abandonado permite reintentar tras reinicio. Message-ID depende del
evento y permanece estable al cambiar el remitente. SMTP tiene entrega al menos
una vez: una caída después de la aceptación y antes del registro puede reenviar
el correo. No duplica el pago. ENVIADO significa aceptado por SMTP, no leído.

Se usa Nodemailer10.6.0 y sus tipos8.0.2 con versiones exactas; no se ejecutaron
scripts de dependencias al instalar. La cancelación usa AbortSignal documentado
desde10.5 y comprobado contra SMTP local. Fuentes:
[transporte y TLS](https://nodemailer.com/smtp),
[mensajes y cancelación](https://nodemailer.com/message).

## Retención elegida: tres meses calendario

`voucherRetencionMeses=3` es la política confirmada por el usuario; se rechazan
otros valores. Cada archivo conserva su plazo. Al aprobar/rechazar antes de que
venza, el vencimiento pasa a tres meses calendario desde la decisión; si sigue
pendiente, se cuenta desde la subida. Un archivo ya vencido nunca se resucita.

La descarga devuelve410 al vencer, aunque el proceso aún no haya limpiado la fila.
El proceso arranca con el servidor y cada30segundos elimina hasta20 contenidos
vencidos por ciclo, bajo bloqueos SKIP LOCKED. Conserva hash, tamaño, operación,
referencia, auditoría y decisión financiera. Si hay atrasos, medir y atender la cola.

Un trámite pendiente cuyo archivo venció permite al propietario reponerlo en la
misma operación con nueva versión y clave idempotente. Se conserva el número
reservado y los hashes anteriores. No se aprueba una declaración nueva con archivo
vencido; puede rechazarse con motivo. Una decisión terminal impide nueva reposición.

Los tres meses son una decisión del CPPP, no un plazo que se atribuya a la ley.
El marco de protección de datos debe revisarse con el responsable institucional:
[Reglamento de la Ley29733, DS016-2024-JUS](https://www.gob.pe/institucion/anpd/normas-legales/6554453-16-2024-jus).
Poner BYTEA a NULL retira el archivo de la aplicación; PostgreSQL conserva versiones
MVCC hasta su mantenimiento y puede conservarlo en WAL, réplicas y backups. Faltan
la política operativa de esas copias, su eliminación programada y evidencia de
cumplimiento. No se declara borrado físico seguro ni conformidad legal completa.

## Preparación y recuperación de la entrega

1. Revisar el diff y ejecutar manualmente build y Git según AGENTS.md.
2. Ensayar backup/restauración y aplicar manualmente `npm run migrate` en staging.
   La migración nueva es0031; no editar migraciones aplicadas ni borrar historial.
3. Actualizar frontend y backend coordinadamente: nuevas transferencias exigen
   voucher y efectivo exige importe/fecha. Detener temporalmente entradas durante
   el cambio evita clientes anteriores. Mantener SMTP apagado hasta verificarlo.
4. Configurar cuenta BCP real por el canal seguro del CPPP; los ejemplos de
   `.env.example` son marcadores. No configurar cuentas reales en pruebas.
5. Configurar SMTP/TLS y remitente. Validar DNS del remitente y entrega en staging;
   habilitar con un grupo controlado y vigilar cola, reintentos y vencimientos.
6. Asignar responsable/alertas: pagos por conciliar, correo pendiente antiguo,
   vouchers vencidos aún con contenido y atraso de retenciones.

Ante fallos SMTP, apagar `correoHabilitado` conserva la cola y los pagos. Apagar
transferencias evita ofrecer nuevas cuentas pero conserva trámites ya declarados.
No revertir a un backend que acepte nuevas declaraciones sin voucher ni fechas
de efectivo. La recuperación es una versión correctiva compatible; conservar
tablas/migraciones. La retención no debe desactivarse al pausar correo.

Build manual, cuentas BCP/SMTP productivas, entrega real, política de copias y
aprobación humana quedan pendientes. No se ha publicado ni hecho push.
