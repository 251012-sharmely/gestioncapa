import type { FastifyInstance } from 'fastify';
import { vencerReservas } from './modules/cursos/inscripciones.vencimiento.js';
import { liberarRetenidas } from './modules/certificados/certificados.repositorio.js';
import { recuperarOperaciones } from './modules/pagos/pagos.procesador.js';
import { enviarNotificacionesPago } from './modules/pagos/pagos.correo.js';
import { eliminarVouchersVencidos } from './modules/pagos/pagos.archivos.js';

export async function procesarAccesoCobro() {
  return {cursosRevisados:await vencerReservas(),constanciasEmitidas:await liberarRetenidas()};
}
export function iniciarProcesosCobro(app:FastifyInstance) {
  let acceso:Promise<void>|null=null;
  let pagos:Promise<void>|null=null;
  let recibos:Promise<void>|null=null;
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
  const revisarRecibos=()=>{
    if(recibos) return;
    recibos=Promise.all([enviarNotificacionesPago(),eliminarVouchersVencidos()]).then(([correosEnviados,vouchersEliminados])=>{
      if(correosEnviados||vouchersEliminados) app.log.info({correosEnviados,vouchersEliminados},'Procesados comprobantes y retención de vouchers.');
    }).catch(()=>app.log.error('No se pudieron procesar comprobantes y vouchers. Se reintentará el ciclo.')).finally(()=>{recibos=null;});
  };
  const intervaloAcceso=setInterval(revisarAcceso,30000);
  const intervaloPagos=setInterval(revisarPagos,60000);
  const intervaloRecibos=setInterval(revisarRecibos,30000);
  intervaloAcceso.unref(); intervaloPagos.unref();intervaloRecibos.unref();
  app.addHook('onClose',async()=>{
    clearInterval(intervaloAcceso);clearInterval(intervaloPagos);clearInterval(intervaloRecibos);
    await Promise.allSettled([acceso,pagos,recibos].filter((tarea):tarea is Promise<void>=>tarea!==null));
  });
  revisarAcceso(); revisarPagos();revisarRecibos();
}
