# ADR-001: Izipay y medios manuales para los cobros del CPPP

## Estado

**Aceptada según la elección comunicada por el usuario.** Registra la decisión de
negocio; no acredita contratación, habilitación comercial ni despliegue.

## Fecha y procedencia

Fecha de registro: **15/11/2026, America/Lima**. Origen de la tarea: T-25, reunión del
equipo del 09/11/2026. No se atribuye esa fecha al acuerdo concreto de elección.

El usuario primero indicó que ya existía una decisión aprobada. Al pedir identificar
la opción, respondió literalmente: **«iziapaya, efectivo, transferencia»**.
Se interpreta «iziapaya» como **Izipay**, candidata expresamente nombrada en T-25.
La identidad del aprobador institucional, la fecha del acuerdo y una referencia
externa al acta no fueron aportadas; la evidencia disponible es esta confirmación.
No se inventan ni se exige una nueva aprobación para registrar lo comunicado.

## Contexto

El CPPP necesita cobrar cursos y constancias según HU-53. La tarea pide comparar
Culqi, Izipay, Openpay y PayU y actualizar HU-54 con la elegida. Niubiz se recibió
descartada por un pago inicial. El [comparativo](../esp/comparativoPasarelas.md)
conserva las condiciones publicadas y los datos por cotizar.

Al registrar la elección, el código incorporaba Izipay, Culqi y efectivo. La
ampliación posterior implementa transferencia por referencia y revisión ADMIN.
El código no prueba por sí mismo afiliación comercial ni cobro real con Yape.
La existencia de dos adaptadores no significaba que el CPPP hubiera elegido ambos.

## Decisión

1. **Pasarela online elegida: Izipay.** La integración futura se especifica contra
   el producto contratado y se valida en sandbox antes de activar cobros reales.
2. **Efectivo presencial:** medio manual adicional, registrado por ADMIN tras
   recepción real, conservando la auditoría e invariantes de HU-53.
3. **Transferencia bancaria:** medio manual adicional para HU-54. Se requiere
   comprobar el abono real y su aplicación a una obligación; subir una imagen
   de voucher no confirma un pago por sí solo.
4. **Niubiz descartada** por el motivo informado en T-25. Las demás candidatas se
   documentan como alternativas comparadas, sin suponer que no tengan costos de alta.

No se recibió una ponderación o justificación económica del CPPP. La elección no
se presenta como conclusión automática de menor comisión ni como recomendación del
agente: se registra la opción que comunicó el usuario.

## Alternativas consideradas

| Alternativa | Información considerada | Resultado de esta decisión |
| --- | --- | --- |
| Culqi | Tarifa web, Yape, API y entorno de integración documentados | No seleccionada como pasarela objetivo de HU-54 |
| Openpay | Pasarela Perú, requisitos y Yape como pago alternativo | No seleccionada; condiciones completas sujetas a contrato |
| PayU | API Perú, Yape y sandbox; comisión peruana no verificada | No seleccionada; tarifa por cotizar |
| Niubiz | Motivo de exclusión recibido en T-25 | Descartada por pago adelantado informado |

## Consecuencias y límites

Los [criterios locales para HU-54](../esp/hu54Pagos.md) identifican Izipay, efectivo
y transferencia sin cambiar las condiciones congeladas de HU-53. La ampliación
implementa TRANSFERENCIA como declaración y confirmación/rechazo administrativo.
Configurar cuentas y contrastar abonos sigue siendo responsabilidad del CPPP.

El producto Izipay, la elegibilidad de Yape y los costos actuales deben confirmarse
con el comercio. Una brecha comercial se comunica al CPPP; no habilita un cambio de
proveedor de oficio ni permite prometer una función no disponible.

Se conserva Culqi para notificaciones, conciliación e historial. La API del
participante deja de iniciar nuevos cargos Culqi y el checkout ofrece Izipay.
No se borran hechos financieros ni se configuran credenciales productivas.

La decisión debe cotejarse con HU-54 original y trasladarse al tracker por el equipo.
El registro local no equivale a una edición de Jira ni a un contrato bancario.
