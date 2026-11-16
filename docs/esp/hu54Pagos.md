# HU-54 — Criterios de pago derivados de T-25

**Requisitos locales e implementación**, 15/11/2026. T-25 fija **Izipay** como pasarela,
con **efectivo presencial y transferencia bancaria** como medios adicionales,
según la [decisión comunicada](../decisions/001-pasarelaIzipay.md).

No se encontró el título, descripción ni criterios originales de HU-54 en el
repositorio o documentos conectados. Esta es una propuesta concreta para cotejar
e incorporar a esa historia; no afirma haber sustituido requisitos desconocidos
ni haber editado Jira. La autorización del usuario permite preparar este resultado.

## Historia derivada

Como participante del CPPP, quiero pagar la obligación correspondiente a mi curso
o constancia con Izipay, o mediante efectivo o transferencia validados por el CPPP,
para continuar con el acceso o la entrega según las condiciones que acepté.

## Criterios con la pasarela elegida

| Id | Dado / cuando / entonces | Evidencia exigida para la futura implementación |
| --- | --- | --- |
| H54-01 | Dada una obligación exigible, al ofrecer pago online, se identifica **Izipay**, importe PEN y concepto del intento aceptado, sin recalcularlos desde la oferta actual | UI y consulta autenticada contra BD real |
| H54-02 | Dado Izipay habilitado para el comercio, cuando el propietario paga, el servidor confirma únicamente un resultado financiero auténtico y correlacionado con comercio, pedido, operación, importe, moneda y entorno | Recorrido sandbox del producto contratado y pruebas negativas de firma/correlación |
| H54-03 | Dado un retorno visual, firma inválida, discrepancia o resultado incierto, cuando se consulta su estado, no se presenta como pagado ni se habilita un nuevo cargo a ciegas; se conserva la incidencia y conciliación | Repetición, timeout y recuperación sin duplicar cargos/efectos |
| H54-04 | Dado un comercio que solicita Yape, cuando se evalúa su activación, se verifica habilitación y condiciones comerciales del producto Izipay; solo se ofrece el medio cuando su recorrido esté disponible y probado | Confirmación del proveedor y prueba específica; la selección Izipay sola no acredita Yape |
| H54-05 | Dado efectivo recibido físicamente, cuando ADMIN activo registra el importe completo y recibo único, se audita actor/fecha/referencia y se aplica una sola vez a la obligación | API/BD real, permisos, duplicados y exclusión con operación externa pendiente |
| H54-06 | Dada una transferencia declarada, cuando el participante aporta su referencia o comprobante, el pago queda pendiente de verificación; la imagen no lo confirma | Implementada declaración por referencia y fecha, sin carga de archivos ni cambio financiero anticipado |
| H54-07 | Dado un abono bancario real en una cuenta institucional configurada, cuando ADMIN lo concilia con la obligación, se comprueban referencia, importe, moneda y titularidad/cuenta de destino necesarias; se registra actor y fecha y se evita reutilizar el mismo abono | Datos bancarios validados por el CPPP y transacción/auditoría reales; no se fabrican números de cuenta |
| H54-08 | Dado un rechazo de comprobante, discrepancia o abono duplicado, cuando se revisa, se conserva motivo y evidencia privada, sin confirmar ni perder historial | Pruebas de error, autorización, privacidad y conservación |
| H54-09 | Dado pago previo, pago solo de constancia o gratuidad, cuando cambia el estado financiero, se respeta HU-53: activación oportuna, retención hasta pago elegible y ausencia de deuda en gratuito | Tres recorridos con snapshots, acceso y emisión única |
| H54-10 | Dada una reserva vencida, cuando llega un pago tardío por cualquier medio, se conserva para conciliación sin recuperar automáticamente cupo ni acceso | Concurrencia/última plaza y registro financiero tardío |
| H54-11 | Dada una persona ajena, cuando intenta consultar, modificar o descargar una evidencia bancaria, el servidor deniega el acceso; solo propietario y roles autorizados ven lo necesario | IDOR y descarga directa; auditoría y tratamiento mínimo de datos |
| H54-12 | Dado el paso a producción, cuando se habilita el cobro, se dispone de afiliación, configuración HTTPS, gestión segura de secretos, conciliación/alertas y evidencia de sandbox, build y revisión manuales | Checklist de activación con responsables; selección comercial no equivale a despliegue |

Los criterios H54-01 a H54-12 son identificadores locales para revisión. El equipo
debe mapearlos a la numeración/alcance de la historia original y conservar lo que
esta ya exija. No se declara que los doce estén implementados por redactarlos.

## Estado técnico que no debe confundirse con los criterios

| Medio o capacidad | Estado del código al revisar T-25 | Trabajo de HU-54 / dependencia |
| --- | --- | --- |
| Izipay | Adaptador Web Core, sesión/token y verificación; deshabilitado por defecto | Cotejar producto/credenciales del comercio y acreditar cobro/rechazo/recuperación sandbox |
| Efectivo | Registro ADMIN con importe del servidor, referencia y auditoría | Reusar y comprobar integración con el alcance definitivo de HU-54 |
| Transferencia | Declaración por referencia/fecha, destino persistido y revisión ADMIN con permisos, idempotencia y auditoría | Configurar cuenta institucional y procedimiento real de contraste bancario; no se cargan archivos |
| Yape con Izipay | Documentado por el proveedor; no acreditado para el CPPP | Validación comercial y técnica específica antes de ofrecerlo |
| Culqi | Historial, notificaciones y conciliación conservados; nuevos cargos HTTP rechazados | Adaptar consumidores a Izipay y conservar credenciales necesarias para las operaciones anteriores |

La pasarela no sustituye el flujo manual de transferencia. Un webhook o callback
del navegador tampoco sustituye la conciliación bancaria de una transferencia.
Los cargos, documentos y medios históricos se preservan durante cualquier transición.

## Datos y decisiones necesarios antes de implementar estos criterios

- Texto vigente y enlace/clave del tracker de HU-54 para cotejo final.
- Producto Izipay contratado, afiliación y alcance de Yape: véase el
  [comparativo](comparativoPasarelas.md), sin presumir promociones vigentes.
- Banco(s)/cuenta(s) institucionales autorizadas, moneda y referencia que permita
  identificar un abono; no se solicita publicar esos datos privados en Git.
- Procedimiento de tesorería: responsables, motivo de rechazo, pagos parciales,
  importes excedentes, devoluciones y tratamiento de abonos sin identificación.
- Política de comprobantes: formato, tamaño, almacenamiento privado, acceso y plazo
  de conservación; si hay carga, validar archivo/contenido, no ejecutar ni exponerlo.
- Relación con RF-23 y demás criterios originales: cotejar la referencia a voucher
  BCP sin asumir que el usuario haya limitado todas las transferencias a un banco.

La ampliación solicitada implementó las declaraciones y decisiones con TDD,
PostgreSQL/Redis temporales y navegador contra API real. Los resultados y pendientes
se registran en [tasks/todo.md](../../tasks/todo.md#implementación-t-25--ampliación-solicitada).
Las pruebas no acreditan afiliación Izipay, abonos reales, despliegue ni todos los
requisitos originales de HU-54. Build, commits, etiquetas, PR y publicación son manuales.
