import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import { test } from 'node:test';
import { verificarRespuestaIzipay } from '../src/modules/pagos/izipay.js';
const claveHash = 'solo-clave-de-pruebas-sin-comercio-32';
const esperado = { transaccionId:'c2c03121-d0a7-42bc-8448-f08fd88c3451',orden:'0000000123',comercio:'COMERCIO-PRUEBA',importeCentimos:15050 };
const firmar = (cambio: object = {}) => {
  const payloadHttp = JSON.stringify({ code:'00',transactionId:esperado.transaccionId,response:{ merchant:{merchantCode:esperado.comercio},order:[{orderNumber:esperado.orden,amount:'150.50',currency:'PEN',uniqueId:'venta-prueba-1',codeAuth:'123456',stateMessage:'Autorizado'}] },...cambio });
  return { payloadHttp,signature:createHmac('sha256',claveHash).update(payloadHttp).digest('base64') };
};
test('HU53-04: verifica firma de bytes originales y datos del cobro Izipay', () => {
  assert.equal(verificarRespuestaIzipay(firmar(),esperado,claveHash).referencia,'COMERCIO-PRUEBA:venta-prueba-1');
  assert.throws(()=>verificarRespuestaIzipay({...firmar(),signature:'falsa'},esperado,claveHash));
  assert.throws(()=>verificarRespuestaIzipay(firmar({transactionId:'otra'}),esperado,claveHash));
  assert.throws(()=>verificarRespuestaIzipay(firmar({code:'05'}),esperado,claveHash));
  assert.throws(()=>verificarRespuestaIzipay(firmar(),{...esperado,comercio:'otro'},claveHash));
  // El importe verificado discrepante debe llegar al libro como incidencia, no confirmar la deuda.
  assert.equal(verificarRespuestaIzipay(firmar(),{...esperado,importeCentimos:1},claveHash).importeCentimos,15050);
});

test('HU53-07: conserva dos autorizaciones verificadas para conciliar un posible doble cargo', () => {
  const contenido=JSON.parse(firmar().payloadHttp);
  contenido.response.order.push({...contenido.response.order[0],uniqueId:'venta-prueba-2'});
  const payloadHttp=JSON.stringify(contenido);
  const respuesta=verificarRespuestaIzipay({payloadHttp,signature:createHmac('sha256',claveHash).update(payloadHttp).digest('base64')},esperado,claveHash);
  assert.equal(respuesta.adicionales.length,1);
  assert.equal(respuesta.adicionales[0]?.referencia,'COMERCIO-PRUEBA:venta-prueba-2');
});
