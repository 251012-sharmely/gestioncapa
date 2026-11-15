import { createHash,randomUUID } from 'node:crypto';
import { pool } from '../../shared/database.js';
import { ErrorPago,entradaTransferencia,entradaRevisionTransferencia,type DeclaracionTransferencia,type RevisionTransferencia,type DestinoTransferencia,type OperacionPago } from './pagos.modelo.js';
import { conPago,iniciarOperacion,guardarHecho } from './pagos.repositorio.js';
import type { PoolClient } from 'pg';

export async function buscarDestinoTransferencia(pagoId:string,cliente:Pick<PoolClient,'query'>=pool) {
  return (await cliente.query<DestinoTransferencia & {id:string}>(`select id,banco,titular,cuenta,cci from "destinosTransferencia" where "pagoId"=$1 order by "creadoEn",id limit 1`,[pagoId])).rows[0];
}
export async function ofrecerTransferencia(pagoId:string,destino:DestinoTransferencia) {
  const anterior=await buscarDestinoTransferencia(pagoId);
  if(anterior) return anterior;
  return conPago(pagoId,async(cliente)=>{
    const existente=await buscarDestinoTransferencia(pagoId,cliente);
    if(existente) return existente;
    return (await cliente.query<DestinoTransferencia & {id:string}>(`insert into "destinosTransferencia"(id,"pagoId",banco,titular,cuenta,cci)
      values($1,$2,$3,$4,$5,$6) returning id,banco,titular,cuenta,cci`,[randomUUID(),pagoId,destino.banco,destino.titular,destino.cuenta,destino.cci])).rows[0]!;
  });
}
export async function declararTransferencia(pagoId:string,usuarioId:number,entrada:DeclaracionTransferencia) {
  const datos=entradaTransferencia.parse(entrada);
  return iniciarOperacion(pagoId,usuarioId,{medio:'TRANSFERENCIA',clave:datos.clave,
    cargaHash:createHash('sha256').update(JSON.stringify(datos)).digest('hex'),transferencia:datos});
}
export async function listarTransferencias(pagoId:string) {
  return (await pool.query<DestinoTransferencia & {operacionId:string;referencia:string;fechaOperacion:string;estado:string;motivoRechazo:string|null}>(`
    select t."operacionId",t.referencia,to_char(t."fechaOperacion",'YYYY-MM-DD') as "fechaOperacion",o.estado,
      d.banco,d.titular,d.cuenta,d.cci,t."motivoRechazo",t."revisadoEn"::text,t."revisadoPor"::text
    from "transferenciasPago" t join "operacionesPago" o on o.id=t."operacionId"
    join "destinosTransferencia" d on d.id=t."destinoId" where o."pagoId"=$1 order by o.numero desc limit 10`,[pagoId])).rows;
}
export async function revisarTransferencia(pagoId:string,operacionId:string,actorId:number,entrada:RevisionTransferencia) {
  const datos=entradaRevisionTransferencia.parse(entrada);
  const revisionHash=createHash('sha256').update(JSON.stringify(datos)).digest('hex');
  return conPago(pagoId,async(cliente,pago)=>{
    if (!(await cliente.query(`select id from users where id=$1 and active and role='admin' for share`,[actorId])).rowCount) throw new ErrorPago(403,'SIN_PERMISO','No tienes permiso para revisar transferencias.');
    const registro=(await cliente.query<{referencia:string;fechaOperacion:string;cci:string;revisionHash:string|null}>(`
      select t.referencia,to_char(t."fechaOperacion",'YYYY-MM-DD') as "fechaOperacion",d.cci,t."revisionHash"
      from "transferenciasPago" t join "operacionesPago" o on o.id=t."operacionId" join "destinosTransferencia" d on d.id=t."destinoId"
      where o.id=$1 and o."pagoId"=$2 and o.medio='TRANSFERENCIA'`,[operacionId,pagoId])).rows[0];
    if (!registro) throw new ErrorPago(404,'TRANSFERENCIA_NO_EXISTE','La transferencia no pertenece a esta obligación.');
    const op=(await cliente.query<OperacionPago>(`select id,"pagoId"::text as "pagoId",medio,estado from "operacionesPago" where id=$1`,[operacionId])).rows[0]!;
    if (registro.revisionHash===revisionHash) return op.estado;
    if (op.estado!=='INICIADO' && op.estado!=='DECLARADO') throw new ErrorPago(409,'TRANSFERENCIA_REVISADA','La transferencia ya fue revisada.');
    if (datos.decision==='RECHAZAR') {
      await cliente.query(`update "operacionesPago" set estado='RECHAZADO',"actualizadoEn"=clock_timestamp() where id=$1`,[op.id]);
      await cliente.query(`insert into "auditoriaPagos"("pagoId","actorId",accion,"operacionId") values($1,$2,'RECHAZAR_TRANSFERENCIA',$3)`,[pagoId,actorId,op.id]);
    } else {
      if (datos.importeCentimos!==pago.importeCentimos) throw new ErrorPago(409,'IMPORTE_INVALIDO','El importe debe coincidir con el importe completo pendiente.');
      if (datos.referencia!==registro.referencia || datos.fechaOperacion!==registro.fechaOperacion) throw new ErrorPago(409,'REFERENCIA_INVALIDA','La referencia y fecha deben coincidir con la declaración.');
      const referencia=createHash('sha256').update(JSON.stringify([registro.cci,datos.fechaOperacion,datos.referencia])).digest('hex');
      await cliente.query('select pg_advisory_xact_lock(hashtextextended($1,0))',[`TRANSFERENCIA:${referencia}`]);
      if ((await cliente.query(`select 1 from "hechosPago" where medio='TRANSFERENCIA' and referencia=$1`,[referencia])).rowCount) throw new ErrorPago(409,'REFERENCIA_REUTILIZADA','La referencia bancaria ya se utilizó.');
      await guardarHecho(cliente,pago,op,{referencia,importeCentimos:datos.importeCentimos,moneda:datos.moneda},actorId);
    }
    await cliente.query(`update "transferenciasPago" set "revisadoPor"=$2,"revisadoEn"=clock_timestamp(),"revisionHash"=$3,"motivoRechazo"=$4 where "operacionId"=$1`,
      [op.id,actorId,revisionHash,datos.decision==='RECHAZAR'?datos.motivo:null]);
    return datos.decision==='RECHAZAR'?'RECHAZADO':'CONFIRMADO';
  });
}
