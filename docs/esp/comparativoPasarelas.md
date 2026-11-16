# T-25 — Comparativo de pasarelas para el CPPP

Consulta de fuentes: **15/11/2026, America/Lima**. Canal comparado: cobros por web
en Perú, principalmente en PEN. Este cuadro recoge condiciones publicadas, no una
cotización vinculante para el CPPP. Se identifica cada dato no disponible.

**Elección comunicada por el usuario: Izipay.** Medios adicionales: efectivo
presencial y transferencia bancaria. Véanse el [registro de decisión](../decisions/001-pasarelaIzipay.md)
y los [criterios locales de HU-54](hu54Pagos.md).

## Cuadro solicitado

| Candidata y producto | Comisión por transacción publicada | Aceptación de Yape | Modo de pruebas | Inscripción del CPPP: requisitos públicos y pendientes | Documentación API |
| --- | --- | --- | --- | --- | --- |
| **Culqi / CulqiOnline** | Nacional: **3.44 % + US$ 0.20**; extranjera: **3.99 % + US$ 0.20**. Publica comisiones inafectas a IGV, con salvedad del componente emisor no financiero; condiciones por evaluación [C1], [C2] | **Sí, directo** por API/Checkout: **3.44 % + US$ 0.20**; no confundir con PagoEfectivo [C2], [C4] | Panel de integración y llaves test, sin cargos bancarios reales [C3], [C5] | Crear comercio, datos de entidad/representación y cuenta bancaria; validación comercial. Verificar requisitos concretos y titularidad para el CPPP [C3], [C6] | [API REST](https://apidocs.culqi.com/) y [Yape](https://docs.culqi.com/es/documentacion/pagos-online/cargo-unico/tokens-yape) |
| **Izipay / pasarela web** | Tarjeta nacional: **3.44 % + S/ 0.69**, ambos más IGV; extranjera: **4.09 % + S/ 0.69**, ambos más IGV. Referencia publicada, por confirmar para el producto/comercio [I1] | **Sí en el SDK, condicionado**: los términos §12.1 señalan ventas online mensuales **mayores a S/ 200 000**, sujetas a aprobación. No se acreditó una tarifa específica de Yape para el CPPP [I1], [I2] | SDK y API sandbox; exige comercio/credenciales compatibles con el producto [I3] | Afiliación, identificación/rubro del comercio, representación y cuenta de abono según evaluación. Confirmar Web Core, costos actuales y habilitación de Yape; la promoción gratuita indicada está vencida [I1], [I3] | [Web Core](https://developers.izipay.pe/web-core/) y [contrato REST](https://developers.izipay.pe/yaml/api-v1-esp.yaml) |
| **Openpay / pasarela Perú** | BBVA publica **hasta 3.44 % + IGV**, fijado por rubro en contrato. Falta confirmar el cargo fijo web y las condiciones por medio/extranjería del CPPP; no extrapolar el fee de Link o POS [O1] | **Sí como pago alternativo**, según su página de pasarela. El mecanismo concreto/API y la tarifa correspondiente requieren confirmación; no se acredita un checkout directo con código Yape equivalente a las otras opciones [O2] | Cuenta sandbox con API y dashboard propios; activación de producción separada [O3] | RUC, representación, tienda operativa, cuenta empresarial y evaluación. La cuenta de abono debe corresponder al comercio; verificar elegibilidad de la entidad CPPP [O1], [O4] | [Documentación Perú](https://documents.openpay.pe/docs/) |
| **PayU / Perú** | **Por cotizar.** No se obtuvo un tarifario peruano vigente verificable: la URL de tarifas redirige fuera del contenido esperado. No se asigna cero ni una tarifa de otro país [P1], [P4] | **Sí, directo**, documentado por la API Perú. Tiene casos de Yape para sandbox [P2] | API sandbox y datos de prueba por país; la documentación distingue pruebas de producción [P2], [P3] | Solicitud, validación de riesgo, documentación que requiera el panel y activación. Pedir checklist vigente para la entidad y cuenta del CPPP, además de tarifa contractual [P4] | [API Perú](https://developers.payulatam.com/latam/es/docs/integrations/api-integration/payments-api-peru.html) y [Pricing](https://developers.payulatam.com/latam/es/docs/integrations/api-integration/pricing-api.html) |

### Cómo leer las condiciones

- Un porcentaje coincidente no implica el mismo costo: los cargos fijos pueden
  estar en USD o PEN y el tratamiento del IGV no es idéntico. Para convertir un fijo
  en USD se debe conocer el tipo de cambio que realmente aplicará el proveedor.
- Las tarifas varían por contrato, rubro, medio, tarjeta y volumen. No se verificó
  el RUC, banco ni volumen del CPPP; el cuadro no asegura su aprobación comercial.
- Los mínimos de PagoEfectivo/Cuotéalo en Culqi no se trasladan automáticamente a
  tarjetas o Yape [C2]. Las tarifas del POS y del Link tampoco se trasladan a la web.
- Un sandbox documentado no significa que GestionCapa haya realizado un cobro allí.
  T-25 no ejecuta transacciones, crea cuentas ni habilita comercios.

## Niubiz descartada

**Descartada para esta decisión por el pago por adelantado informado en T-25**,
originado en la reunión del equipo del 09/11/2026. No se recibió una cotización
o contrato de Niubiz que precise producto, importe o vigencia. Se conserva el
motivo institucional recibido, sin afirmar que todas sus ofertas actuales exijan
adelantos ni incorporarla como quinta candidata.

La exclusión no acredita que las otras cuatro opciones carezcan de cargos de alta.
Para la elegida se deben confirmar expresamente afiliación, mantenimiento e importes
anticipados. Si contradicen el motivo usado para excluir Niubiz, el CPPP debe revisar
esas condiciones; el equipo técnico no cambia de pasarela por su cuenta.

## Diferencias depuradas durante la comparación

1. **Promoción Izipay vencida.** El PDF actualmente enlazado por su sitio, versión de
   recurso 307, conserva en §12.1/página 27 una oferta del 01–31/10/2024. No sustenta
   una afiliación o mantenimiento a S/ 0 en noviembre de 2026 [I1].
2. **Producto Izipay.** El código de HU-53 usa Web Core. Credenciales o material de
   otra plataforma de Izipay no se consideran intercambiables sin cotejar el contrato.
3. **Yape.** La disponibilidad técnica publicada y su habilitación comercial son
   condiciones distintas. En Openpay se documenta pago alternativo; no se equipara
   sin evidencia al ingreso directo del código de aprobación.
4. **PayU.** El acceso a la página comercial no permitió recuperar una tarifa.
   La API Perú sí está documentada: no se deduce de esa redirección que PayU haya
   dejado de operar o no acepte nuevos comercios.
5. **Disponibilidad en GestionCapa.** Culqi tiene Yape desactivado en su checkout;
   Izipay no tiene evidencia de un recorrido Yape validado para el comercio. La
   transferencia no existía en `MedioPago` al iniciar la investigación. La ampliación
   solicitada la incorpora con declaración y revisión administrativa, sin afirmar
   que la entidad ya haya configurado su cuenta o acreditado cobros sandbox.

## Datos comerciales necesarios para completar el cuadro económico

| Destino | Dato que debe aportar/confirmar el proveedor por un canal del CPPP |
| --- | --- |
| Izipay, elegida | Producto/contrato compatible con Web Core; elegibilidad de la entidad; tasa por tarjeta y por Yape; cargo fijo/IGV; alta, mantenimiento y anticipos vigentes; alcance del umbral Yape; pruebas y abonos |
| Openpay | Tarifa completa web por medio, cargo fijo y moneda, extranjería, modalidad Yape y requisitos particulares de la cuenta institucional |
| PayU | Tarifa Perú por transacción, fijo/moneda, impuestos, alta/retiros y checklist de afiliación vigente del CPPP |
| Culqi | Cotización final, cuenta de abono, tratamiento del componente emisor y conversión del fijo USD aplicable al comercio |
| CPPP | RUC/titularidad y facultades de contratación validados por el canal seguro, banco(s) para transferencias, responsables y volumen/ticket para evaluar costos |

No hace falta compartir esas claves o documentos personales por chat ni guardarlos
en Git. El CPPP/equipo comercial realiza las consultas: no se enviaron mensajes ni
solicitudes de afiliación desde el agente. Mientras falten tarifas, **la comparación
económica completa queda pendiente**, aunque la elección comunicada ya esté registrada.

## Relación con HU-54 y el código existente

La [decisión ADR-001](../decisions/001-pasarelaIzipay.md) selecciona Izipay para nuevos
desarrollos de cobro online, con efectivo y transferencia como medios adicionales.
La ampliación de T-25 reutiliza Izipay para nuevos cobros y conserva conciliación,
notificaciones e historial Culqi. Añade declaración y revisión de transferencia;
no borra hechos financieros ni activa producción.

Los [criterios HU-54](hu54Pagos.md) trasladan esta elección a requisitos verificables,
separando la transferencia implementada por referencia, el efectivo existente y la
validación pendiente del comercio Izipay. Deben cotejarse con la historia original.

## Fuentes primarias y verificación

Todas consultadas el 15/11/2026. Se parafrasean condiciones y se enlaza el documento
de origen; no se reproduce el contrato completo ni se usa una comparación de terceros.

[C1]: https://culqi.com/precios/ "Tarifario Online y Link de Culqi"
[C2]: https://ayuda.culqi.com/portal/es/kb/articles/cual-es-la-comision-de-culqionline "Comisión CulqiOnline y salvedad IGV"
[C3]: https://docs.culqi.com/es/documentacion/pagos-online "Afiliación y entornos Culqi"
[C4]: https://docs.culqi.com/es/documentacion/pagos-online/cargo-unico/tokens-yape "Yape directo Culqi"
[C5]: https://apidocs.culqi.com/ "API y llaves de prueba Culqi"
[C6]: https://culqi.com/static/files/terminos_y_condiciones_culqi_web.pdf "Contrato de afiliación Culqi"
[I1]: https://www.izipay.pe/pdf/terminos-y-condiciones/ "Términos actualmente enlazados; PDF 307, §12.1, p. 27"
[I2]: https://developers.izipay.pe/products/pay-with-yape-code/ "Yape con código en el SDK Izipay"
[I3]: https://developers.izipay.pe/web-core/quickstart/ "SDK sandbox y generación backend de token"
[O1]: https://www.bbva.pe/empresas/productos/cobros-y-pagos/soluciones-de-pago/pasarela-de-pago.html "Comisión y requisitos de pasarela Openpay Perú"
[O2]: https://www.openpay.pe/soluciones/pasarela-de-pagos "Yape como pago alternativo de la pasarela"
[O3]: https://documents.openpay.pe/docs/ "Cuenta sandbox y activación Openpay Perú"
[O4]: https://www.openpay.pe/terminos-condiciones "Representación y cuenta de abono del comercio"
[P1]: https://peru.payu.com/tarifas/ "Tarifa no recuperable; redirige al sitio corporativo"
[P2]: https://developers.payulatam.com/latam/es/docs/integrations/api-integration/payments-api-peru.html "API Perú y pruebas Yape"
[P3]: https://developers.payulatam.com/latam/es/docs/getting-started/test-your-solution.html "Entorno y datos de pruebas PayU"
[P4]: https://developers.payulatam.com/latam/es/docs/getting-started/create-an-account.html "Alta, validación y activación PayU"

Limitaciones de acceso: Openpay requiere JavaScript; su contenido de pasarela se
comprobó con Chromium en un contexto aislado. El visor Izipay se siguió hasta el PDF
actual y se contrastó su texto, evitando usar solo la versión 233 indexada. PayU
se contrastó por HTTP y navegador: no se obtuvo una comisión de su página de tarifas.
