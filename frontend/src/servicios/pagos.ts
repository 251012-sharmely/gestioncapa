import { api } from '@/lib/api'

export type DestinoTransferencia = {id:string;banco:string;titular:string;cuenta:string;cci:string}
export type TransferenciaPago = Omit<DestinoTransferencia,'id'> & {
  operacionId:string;referencia:string;fechaOperacion:string;estado:'INICIADO'|'DECLARADO'|'INCIERTO'|'RECHAZADO'|'CONFIRMADO';motivoRechazo:string|null
}
export type RevisionTransferencia = {decision:'RECHAZAR';motivo:string} | {
  decision:'CONFIRMAR';referencia:string;fechaOperacion:string;importeCentimos:number;moneda:'PEN';verificado:true
}
export type Pago = {
  id:string;cursoId:string;concepto:'CURSO'|'CONSTANCIA';importeCentimos:number;moneda:'PEN';estado:'PENDIENTE'|'PAGADO';
  cursoTitulo:string;participanteNombre:string;exigible:boolean;
  operaciones:{id:string;medio:'IZIPAY'|'CULQI'|'EFECTIVO'|'TRANSFERENCIA';estado:'INICIADO'|'INCIERTO'|'DECLARADO'|'RECHAZADO'|'CONFIRMADO';referenciaExterna:string|null;clave?:string;sesionRecuperable?:boolean}[];
  incidencias:{motivo:string;referencia:string}[];
  transferencias:TransferenciaPago[];destinoTransferencia:DestinoTransferencia|null;
  medios:{izipay:boolean;culqi:boolean;efectivo:boolean;transferencia:boolean;entorno:'sandbox'|'produccion'};
}
export type SesionIzipay = {token:string;keyRSA:string;comercio:string;orden:string;transaccionId:string;importe:string;urlIPN:string;entorno:'sandbox'|'produccion'}
export const pagos = {
  obtener:async(id:string)=>(await api.get<Pago>(`/pagos/${id}`)).data,
  iniciar:async(id:string,entrada:{medio:'IZIPAY'|'CULQI';clave:string;token?:string})=>
    (await api.post<{operacionId:string;estado:string;izipay?:SesionIzipay}>(`/pagos/${id}/intentos`,entrada)).data,
  notificarIzipay:async(respuesta:unknown)=>{await api.post('/pagos/notificaciones/izipay',respuesta)},
  efectivo:async(id:string,referencia:string)=>(await api.post<Pago>(`/pagos/${id}/efectivo`,{referencia})).data,
  declararTransferencia:async(id:string,entrada:{destinoId:string;referencia:string;fechaOperacion:string;clave:string})=>
    (await api.post<{operacionId:string;estado:string}>(`/pagos/${id}/transferencias`,entrada)).data,
  revisarTransferencia:async(id:string,operacionId:string,entrada:RevisionTransferencia)=>
    (await api.post<{estado:string}>(`/pagos/${id}/transferencias/${operacionId}/revision`,entrada)).data,
  conciliar:async(id:string,operacionId:string,referencia?:string)=>(await api.post(`/pagos/${id}/conciliar`,{operacionId,referencia})).data,
}
