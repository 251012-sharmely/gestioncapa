import type { FastifyInstance } from 'fastify';
import { vencerReservas } from './modules/cursos/inscripciones.vencimiento.js';
import { liberarRetenidas } from './modules/certificados/certificados.repositorio.js';
import { recuperarOperaciones } from './modules/pagos/pagos.procesador.js';

export async function procesarAccesoCobro() {
  return {cursosRevisados:await vencerReservas(),constanciasEmitidas:await liberarRetenidas()};
}
export function iniciarProcesosCobro(app:FastifyInstance) {
  let acceso:Promise<void>|null=null;
  let pagos:Promise<void>|null=null;
  const revisarAcceso=()=>{
    if (acceso) return;
    acceso=procesarAccesoCobro().then(resultado=>{
      if (resultado.cursosRevisados || resultado.constanciasEmitidas) app.log.info(resultado,'Procesadas reservas y entregas de constancias.');
    }).catch(()=>app.log.error('No se pudieron procesar reservas y constancias. Se reintentará el ciclo.')).finally(()=>{acceso=null;});
  };
  const revisarPagos=()=>{
    if (pagos) return;
    pagos=recuperarOperaciones().then(resultado=>{
      if (resultado.pendientes) app.log.warn(resultado,'Existen operaciones de pago pendientes de conciliación.');
    }).catch(()=>app.log.error('No se pudo revisar la conciliación de pagos. Se reintentará el ciclo.')).finally(()=>{pagos=null;});
  };
  const intervaloAcceso=setInterval(revisarAcceso,30000);
  const intervaloPagos=setInterval(revisarPagos,60000);
  intervaloAcceso.unref(); intervaloPagos.unref();
  app.addHook('onClose',async()=>{
    clearInterval(intervaloAcceso);clearInterval(intervaloPagos);
    await Promise.allSettled([acceso,pagos].filter((tarea):tarea is Promise<void>=>tarea!==null));
  });
  revisarAcceso(); revisarPagos();
}
