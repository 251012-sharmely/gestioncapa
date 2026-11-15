import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { pool } from '../../shared/database.js';
import { idCurso } from '../cursos/cursos.validacion.js';
import { ErrorPago, entradaEfectivo, entradaIntento } from './pagos.modelo.js';
import { obtenerPago, registrarEfectivo } from './pagos.repositorio.js';
import { iniciarPago, mediosDisponibles } from './pagos.servicio.js';
import { recibirIzipay, recibirCulqi, conciliarOperacion } from './pagos.notificaciones.js';
import { buscarOperacion } from './pagos.repositorio.js';
import { z } from 'zod';
import { redis } from '../../shared/redis.js';
import { createHash } from 'node:crypto';
import { env } from '../../config/env.js';

type ConPago=FastifyRequest<{Params:{id:string}}>;
async function ejecutar(reply:FastifyReply,operacion:()=>Promise<unknown>) {
  try { return await operacion(); } catch(error) {
    if (error instanceof ErrorPago) return reply.code(error.statusCode).send({code:error.code,message:error.message});
    throw error;
  }
}
async function pagoAutorizado(request:ConPago) {
  const id=idCurso.parse(request.params.id);
  const pago=await obtenerPago(id);
  if (!pago) throw new ErrorPago(404,'PAGO_NO_EXISTE','La obligación no existe.');
  if (request.usuario!.role!=='admin' && String(pago.usuarioId)!==String(request.usuario!.id)) throw new ErrorPago(403,'SIN_PERMISO','No tienes permiso para consultar esta obligación.');
  return pago;
}
export async function registrarPagos(app:FastifyInstance) {
  app.post('/api/pagos/notificaciones/:proveedor',{bodyLimit:262144},async(request:FastifyRequest<{Params:{proveedor:string}}>,reply)=>ejecutar(reply,async()=>{
    const proveedor=z.enum(['izipay','culqi']).parse(request.params.proveedor);
    const clave=`gestioncapa:${env.DB_NAME}:pagos:${proveedor}:${createHash('sha256').update(request.ip).digest('hex')}`;
    const usos=Number(await redis.eval("local n=redis.call('INCR',KEYS[1]); if n==1 then redis.call('EXPIRE',KEYS[1],60) end; return n",1,clave));
    if (usos>120) return reply.header('Retry-After','60').code(429).send({code:'LIMITE_NOTIFICACIONES',message:'Reintenta la notificación más tarde.'});
    const estado=proveedor==='izipay'?await recibirIzipay(request.body):await recibirCulqi(request.body);
    return {estado};
  }));
  app.post('/api/pagos/:id/conciliar',{bodyLimit:4096},async(request:ConPago,reply)=>ejecutar(reply,async()=>{
    const pago=await pagoAutorizado(request);
    const entrada=z.object({operacionId:z.uuid(),referencia:z.string().max(100).optional()}).strict().parse(request.body);
    const op=await buscarOperacion(entrada.operacionId);
    if (!op || op.pagoId!==pago.id) throw new ErrorPago(404,'OPERACION_NO_EXISTE','La operación no pertenece a esta obligación.');
    return {estado:await conciliarOperacion(op.id,entrada.referencia)};
  }));
  app.get('/api/pagos/:id',async (request:ConPago,reply)=>ejecutar(reply,async()=>{
    const pago=await pagoAutorizado(request);
    const contexto=(await pool.query(`select c.titulo as "cursoTitulo",u.name as "participanteNombre",
      case when p.concepto='CURSO' then t.estado='PENDIENTE_PAGO' and t."venceEn">clock_timestamp() and i."intentoId"=t.id
        else exists(select 1 from "entregasConstancia" e where e."pagoId"=p.id and e.estado='RETENIDA') end as exigible
      from "obligacionesPago" p join cursos c on c.id=p."cursoId" join users u on u.id=p."usuarioId"
      left join "intentosInscripcion" t on t.id=p."intentoId" left join inscripciones_curso i on i.curso_id=c.id and i.usuario_id=u.id where p.id=$1`,[pago.id])).rows[0];
    const operaciones=(await pool.query(`select id,medio,estado,entorno,"referenciaExterna",clave,
      (estado='INICIADO' and "sesionCifrada" is not null and "sesionVenceEn">clock_timestamp()) as "sesionRecuperable"
      from "operacionesPago" where "pagoId"=$1 order by numero desc limit 10`,[pago.id])).rows;
    const incidencias=(await pool.query(`select motivo,referencia,"creadoEn" from "incidenciasPago" where "pagoId"=$1 order by id desc limit 10`,[pago.id])).rows;
    return reply.header('Cache-Control','private, no-store').send({...pago,...contexto,exigible:contexto?.exigible===true,operaciones,incidencias,medios:mediosDisponibles()});
  }));
  app.post('/api/pagos/:id/intentos',{bodyLimit:4096},async(request:ConPago,reply)=>ejecutar(reply,async()=>{
    reply.header('Cache-Control','private, no-store');
    const pago=await pagoAutorizado(request);
    if (String(pago.usuarioId)!==String(request.usuario!.id)) throw new ErrorPago(403,'SIN_PERMISO','Solo el propietario puede iniciar su pago.');
    const entrada=entradaIntento.parse(request.body);
    return iniciarPago(pago,request.usuario!.id,entrada);
  }));
  app.post('/api/pagos/:id/efectivo',{bodyLimit:4096},async(request:ConPago,reply)=>ejecutar(reply,async()=>{
    const pago=await pagoAutorizado(request);
    const {referencia}=entradaEfectivo.parse(request.body);
    await registrarEfectivo(pago.id,request.usuario!.id,referencia);
    return reply.header('Cache-Control','private, no-store').send(await obtenerPago(pago.id));
  }));
}
