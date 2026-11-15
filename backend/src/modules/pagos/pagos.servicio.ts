import { createHash } from 'node:crypto';
import { env } from '../../config/env.js';
import { pool } from '../../shared/database.js';
import { ErrorPago, type Pago } from './pagos.modelo.js';
import { iniciarOperacion, confirmarOperacion, cambiarEstadoOperacion } from './pagos.repositorio.js';
import { crearSesionIzipay, datosIzipay } from './izipay.js';
import { crearCargoCulqi, consultarCargoCulqi, verificarCargoCulqi } from './culqi.js';
import { guardarSesionIzipay, recuperarSesionIzipay } from './pagos.sesion.js';

export function mediosDisponibles() {
  return { izipay:env.izipayHabilitado,culqi:false,efectivo:true,transferencia:env.transferenciaHabilitada,entorno:env.pagosEntorno };
}
export async function iniciarPago(pago:Pago,usuarioId:number,entrada:{medio:'IZIPAY'|'CULQI';clave:string;token?:string|undefined}) {
  if ((entrada.medio==='IZIPAY' && !env.izipayHabilitado) || (entrada.medio==='CULQI' && !env.culqiHabilitado)) throw new ErrorPago(503,'PASARELA_NO_CONFIGURADA','Esta pasarela todavía no está disponible.');
  if (!(await pool.query('select id from "intentosInscripcion" where id=$1',[pago.intentoId])).rowCount) throw new ErrorPago(409,'CONDICIONES_PENDIENTES','Las condiciones de esta inscripción requieren revisión administrativa.');
  if (entrada.medio==='CULQI') {
    const prefijo=env.pagosEntorno==='sandbox' ? 'tkn_test_' : 'tkn_live_';
    if (!entrada.token?.startsWith(prefijo) || !/^[A-Za-z0-9]+$/.test(entrada.token.slice(prefijo.length))) throw new ErrorPago(422,'TOKEN_INVALIDO','El token no corresponde al entorno de pago.');
    if (pago.importeCentimos<100 || pago.importeCentimos>9999900) throw new ErrorPago(422,'IMPORTE_NO_ADMITIDO','El importe no está dentro de los límites de Culqi.');
  }
  const op=await iniciarOperacion(pago.id,usuarioId,{ medio:entrada.medio,clave:entrada.clave,entorno:env.pagosEntorno,
    cargaHash:createHash('sha256').update(JSON.stringify({medio:entrada.medio,token:entrada.token??null})).digest('hex') });
  if (!op.nueva) {
    const izipay=op.medio==='IZIPAY' ? await recuperarSesionIzipay(op.id) : undefined;
    return { operacionId:op.id,estado:op.estado,repetida:true,...(izipay?{izipay}:{}) };
  }
  try {
    if (entrada.medio==='IZIPAY') {
      const datos=datosIzipay(op,pago,env);
      const token=await crearSesionIzipay(datos,env);
      const izipay={ token,keyRSA:env.izipayRsaPublica!,comercio:datos.comercio,orden:datos.orden,
        transaccionId:datos.transaccionId,importe:(pago.importeCentimos/100).toFixed(2),urlIPN:`${env.pagosUrlPublica}/api/pagos/notificaciones/izipay`,entorno:op.entorno };
      await guardarSesionIzipay(op.id,izipay);
      // La creación externa puede haber coincidido con una declaración bancaria.
      // Aplica también a la primera entrega las condiciones de recuperación.
      const disponible=await recuperarSesionIzipay(op.id);
      return { operacionId:op.id,estado:op.estado,...(disponible?{izipay:disponible}:{}) };
    }
    const usuario=(await pool.query<{email:string}>('select email from users where id=$1',[usuarioId])).rows[0]!;
    const referencia=await crearCargoCulqi(op,pago,entrada.token!,usuario.email,env.culqiClaveSecreta!);
    await pool.query('update "operacionesPago" set "referenciaExterna"=$2 where id=$1',[op.id,referencia]);
    const cargo=await consultarCargoCulqi(referencia,env.culqiClaveSecreta!);
    const hecho=verificarCargoCulqi(cargo,op,env.pagosEntorno);
    await pool.query('update "operacionesPago" set "referenciaExterna"=$2 where id=$1',[op.id,hecho.referencia]);
    const resultado=await confirmarOperacion(op.id,hecho);
    return { operacionId:op.id,estado:resultado };
  } catch (error) {
    await cambiarEstadoOperacion(op.id,error instanceof ErrorPago && error.code==='PAGO_RECHAZADO'?'RECHAZADO':'INCIERTO');
    throw error;
  }
}
