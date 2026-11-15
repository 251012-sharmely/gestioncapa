import { api } from '@/lib/api'

export type Pago = {
  id:string;cursoId:string;concepto:'CURSO'|'CONSTANCIA';importeCentimos:number;moneda:'PEN';estado:'PENDIENTE'|'PAGADO';
  cursoTitulo:string;participanteNombre:string;exigible:boolean;
  operaciones:{id:string;medio:'IZIPAY'|'CULQI'|'EFECTIVO';estado:'INICIADO'|'INCIERTO'|'RECHAZADO'|'CONFIRMADO';referenciaExterna:string|null;clave?:string;sesionRecuperable?:boolean}[];
  incidencias:{motivo:string;referencia:string}[];
  medios:{izipay:boolean;culqi:boolean;efectivo:boolean;entorno:'sandbox'|'produccion';culqiClavePublica?:string};
}
export type SesionIzipay = {token:string;keyRSA:string;comercio:string;orden:string;transaccionId:string;importe:string;urlIPN:string;entorno:'sandbox'|'produccion'}
export const pagos = {
  obtener:async(id:string)=>(await api.get<Pago>(`/pagos/${id}`)).data,
  iniciar:async(id:string,entrada:{medio:'IZIPAY'|'CULQI';clave:string;token?:string})=>
    (await api.post<{operacionId:string;estado:string;izipay?:SesionIzipay}>(`/pagos/${id}/intentos`,entrada)).data,
  notificarIzipay:async(respuesta:unknown)=>{await api.post('/pagos/notificaciones/izipay',respuesta)},
  efectivo:async(id:string,referencia:string)=>(await api.post<Pago>(`/pagos/${id}/efectivo`,{referencia})).data,
  conciliar:async(id:string,operacionId:string,referencia?:string)=>(await api.post(`/pagos/${id}/conciliar`,{operacionId,referencia})).data,
}
