import { createHash } from 'node:crypto';
import { z } from 'zod';
import { ErrorPago,entradaEfectivo,entradaTransferencia } from './pagos.modelo.js';

export const limiteVoucher=5*1024*1024;
export const entradaArchivoVoucher=z.object({tipo:z.enum(['image/png','image/jpeg','application/pdf']),
  contenidoBase64:z.string().min(4).max(6990508)}).strict();
export type ArchivoVoucher={tipo:'image/png'|'image/jpeg'|'application/pdf';contenido:Buffer;tamano:number;hash:string};
export const entradaSubidaVoucher=entradaTransferencia.extend({voucher:entradaArchivoVoucher}).strict();
export const entradaReposicionVoucher=z.object({clave:z.uuid(),version:z.number().int().min(1),voucher:entradaArchivoVoucher}).strict();
export const entradaRecepcionEfectivo=entradaEfectivo.extend({importeCentimos:z.number().int().min(1).max(999999999999),fechaRecepcion:z.iso.date()}).strict();
export type RecepcionEfectivo=z.infer<typeof entradaRecepcionEfectivo>;

export function normalizarNumeroOperacion(referencia:string) {
  const numero=referencia.toUpperCase().replace(/[ ./-]/g,'');
  if(!/^[A-Z0-9]{3,100}$/.test(numero)) throw new ErrorPago(422,'OPERACION_INVALIDA','Indica un número de operación válido.');
  return numero;
}
export function validarArchivoVoucher(entrada:unknown):ArchivoVoucher {
  const datos=entradaArchivoVoucher.parse(entrada);
  if(datos.contenidoBase64.length%4!==0||!/^[A-Za-z0-9+/]*={0,2}$/.test(datos.contenidoBase64)) throw new ErrorPago(422,'VOUCHER_INVALIDO','El archivo no es válido.');
  const contenido=Buffer.from(datos.contenidoBase64,'base64');
  if(contenido.length>limiteVoucher||contenido.toString('base64')!==datos.contenidoBase64) throw new ErrorPago(422,'VOUCHER_INVALIDO','Selecciona un archivo válido de hasta 5 MiB.');
  const png=contenido.length>=33&&contenido.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]))&&contenido.subarray(12,16).toString()==='IHDR'&&
    contenido.readUInt32BE(16)>0&&contenido.readUInt32BE(20)>0&&contenido.readUInt32BE(16)<=12000&&contenido.readUInt32BE(20)<=12000;
  const jpeg=contenido.length>=10&&contenido[0]===255&&contenido[1]===216&&contenido[2]===255&&contenido.at(-2)===255&&contenido.at(-1)===217;
  const pdf=contenido.length>=16&&/^%PDF-[12]\.\d/.test(contenido.subarray(0,8).toString('ascii'))&&contenido.subarray(-1024).includes(Buffer.from('%%EOF'));
  if(!(datos.tipo==='image/png'?png:datos.tipo==='image/jpeg'?jpeg:pdf)) throw new ErrorPago(422,'TIPO_VOUCHER_INVALIDO','El contenido no corresponde a un JPG, PNG o PDF admitido.');
  return {tipo:datos.tipo,contenido,tamano:contenido.length,hash:createHash('sha256').update(contenido).digest('hex')};
}
