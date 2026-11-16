import assert from 'node:assert/strict';
import { before,after,test } from 'node:test';
import { randomUUID } from 'node:crypto';
import type { FastifyInstance } from 'fastify';
import { buildApp } from '../../src/app.js';
import { env } from '../../src/config/env.js';
import { pool } from '../../src/shared/database.js';
import { redis } from '../../src/shared/redis.js';
import { migrar } from '../../src/shared/migraciones.js';
import { crearPdfTexto } from '../../src/shared/pdf.js';

let app:FastifyInstance;
const usuarios=new Map<string,{id:string;token:string}>();
const anterior={...env};
const voucher={tipo:'application/pdf',contenidoBase64:crearPdfTexto('Voucher ficticio HU32',['No acredita un abono real.']).toString('base64')};
const llamar=(actor:string|null,method:'GET'|'POST'|'PUT',url:string,payload?:object)=>app.inject({method,url,
  headers:actor?{authorization:`Bearer ${usuarios.get(actor)!.token}`}:{},...(payload?{payload}:{})});
before(async()=>{
  await migrar(pool);app=await buildApp();
  for(const [nombre,role] of [['admin','admin'],['alumno','agremiado'],['otro','agremiado'],['docente','instructor']]) {
    const usuario=(await pool.query(`insert into users(name,email,password_hash,role) values($1,$2,'sin-acceso',$3) returning id::text`,[nombre,`hu32-${randomUUID()}@prueba.local`,role])).rows[0];
    usuarios.set(nombre!,{id:usuario.id,token:app.jwt.sign({sub:usuario.id})});
  }
  Object.assign(env,{transferenciaHabilitada:true,transferenciaBanco:'BCP',transferenciaTitular:'Entidad de prueba',transferenciaCuenta:'1234567890123',transferenciaCci:'00212345678901234567'});
});
after(async()=>{
  try {
    await pool.query('delete from "intentosInscripcion" where "cursoId" in (select id from cursos where creador_id=$1)',[usuarios.get('admin')?.id]);
    for(const tabla of ['transferenciasPago','destinosTransferencia','incidenciasPago','auditoriaPagos','hechosPago','operacionesPago','obligacionesPago']) {
      const pagos='select p.id from "obligacionesPago" p join cursos c on c.id=p."cursoId" where c.creador_id=$1';
      const filtro=tabla==='transferenciasPago'?`"operacionId" in (select id from "operacionesPago" where "pagoId" in (${pagos}))`:tabla==='obligacionesPago'?'"cursoId" in (select id from cursos where creador_id=$1)':`"pagoId" in (${pagos})`;
      await pool.query(`delete from "${tabla}" where ${filtro}`,[usuarios.get('admin')?.id]);
    }
    await pool.query('delete from cursos where creador_id=$1',[usuarios.get('admin')?.id]);
    await pool.query('delete from users where id=any($1::bigint[])',[[...usuarios.values()].map(usuario=>usuario.id)]);
  } finally {Object.assign(env,anterior);await app?.close();await pool.end();redis.disconnect();}
});
async function preparar() {
  const curso=(await llamar('admin','POST','/api/cursos',{titulo:'HU32 transferencia BCP',instructorId:usuarios.get('docente')!.id,horasLectivas:24,modalidad:'PRESENCIAL',
    costo:150.50,modalidadCobro:'PREVIO',plazoPagoMinutos:60,cupos:5,tipoCertificado:'PARTICIPACION',modulos:[{titulo:'Contenido HU32'}]})).json();
  await llamar('admin','POST',`/api/cursos/${curso.id}/publicar`);
  const alta=await llamar('alumno','POST',`/api/cursos/${curso.id}/inscribirme`,{versionCobro:1});
  assert.equal(alta.statusCode,201,alta.body);
  const pagoId=alta.json().pagoId as string;
  const consulta=(await llamar('alumno','GET',`/api/pagos/${pagoId}`)).json();
  return {pagoId,cursoId:curso.id,entrada:{destinoId:consulta.destinoTransferencia.id,referencia:`BCP-${randomUUID()}`,fechaOperacion:'2026-01-01',clave:randomUUID(),voucher}};
}
async function subir(caso:Awaited<ReturnType<typeof preparar>>) {
  const respuesta=await llamar('alumno','POST',`/api/pagos/${caso.pagoId}/transferencias`,caso.entrada);
  assert.equal(respuesta.statusCode,201,respuesta.body);return respuesta.json().operacionId as string;
}
const confirmar=(caso:Awaited<ReturnType<typeof preparar>>)=>({decision:'CONFIRMAR',referencia:caso.entrada.referencia,fechaOperacion:caso.entrada.fechaOperacion,importeCentimos:15050,moneda:'PEN',verificado:true});

test('HU32-01/02/04: guarda voucher privado con cuenta, orden y monto; descarga solo propietario o ADMIN',async()=>{
  const caso=await preparar();const op=await subir(caso);const ruta=`/api/pagos/${caso.pagoId}/transferencias/${op}/voucher`;
  const consulta=(await llamar('alumno','GET',`/api/pagos/${caso.pagoId}`)).json();
  assert.equal(consulta.estado,'PENDIENTE');assert.equal(consulta.transferencias[0].voucher.disponible,true);
  assert.equal(consulta.destinoTransferencia.banco,'BCP');assert.equal(consulta.importeCentimos,15050);
  assert.equal((await llamar(null,'GET',ruta)).statusCode,401);assert.equal((await llamar('otro','GET',ruta)).statusCode,403);
  assert.equal((await llamar('docente','GET',ruta)).statusCode,403);
  const archivo=await llamar('admin','GET',ruta);
  assert.equal(archivo.statusCode,200,archivo.body);assert.equal(archivo.headers['cache-control'],'private, no-store');
  assert.match(String(archivo.headers['content-disposition']),/^attachment/);assert.equal(archivo.headers['x-content-type-options'],'nosniff');
  assert.equal(archivo.rawPayload.toString('base64'),voucher.contenidoBase64);
  assert.equal((await llamar('alumno','POST',`/api/pagos/${caso.pagoId}/transferencias`,caso.entrada)).statusCode,200);
  const ajeno=await preparar();
  assert.equal((await llamar('admin','GET',`/api/pagos/${ajeno.pagoId}/transferencias/${op}/voucher`)).statusCode,404);
});

test('HU32-02/03: rechaza referencia repetida con otros separadores/fecha/cuenta y archivo falso sin guardar',async()=>{
  const primero=await preparar();await subir(primero);
  const segundo=await preparar();segundo.entrada.referencia=primero.entrada.referencia.replaceAll('-',' ');segundo.entrada.fechaOperacion='2026-01-02';
  assert.equal((await llamar('alumno','POST',`/api/pagos/${segundo.pagoId}/transferencias`,segundo.entrada)).statusCode,409);
  const tercero=await preparar();
  assert.equal((await llamar('alumno','POST',`/api/pagos/${tercero.pagoId}/transferencias`,{...tercero.entrada,voucher:{...voucher,tipo:'image/png'}})).statusCode,422);
  assert.equal((await pool.query('select 1 from "operacionesPago" where "pagoId"=$1',[tercero.pagoId])).rowCount,0);
});

test('HU32-04/08: HTTP devuelve 410 al vencer y permite reposición versionada solo al propietario',async()=>{
  const caso=await preparar();const op=await subir(caso);const ruta=`/api/pagos/${caso.pagoId}/transferencias/${op}/voucher`;
  const entrada={clave:randomUUID(),version:1,voucher};
  assert.equal((await llamar('alumno','PUT',ruta,entrada)).statusCode,409);
  await pool.query(`update "vouchersPago" set "eliminarEn"=clock_timestamp()-interval '1 second' where "operacionId"=$1`,[op]);
  assert.equal((await llamar('alumno','GET',ruta)).statusCode,410);
  assert.equal((await llamar('admin','PUT',ruta,entrada)).statusCode,403);
  assert.equal((await llamar('otro','PUT',ruta,entrada)).statusCode,403);
  assert.equal((await llamar('alumno','PUT',ruta,entrada)).statusCode,200);
  assert.equal((await llamar('alumno','PUT',ruta,entrada)).statusCode,200);
  assert.equal((await llamar('alumno','GET',ruta)).statusCode,200);
  const revision=`/api/pagos/${caso.pagoId}/transferencias/${op}/revision`;
  await pool.query('update users set active=false where id=$1',[usuarios.get('admin')!.id]);
  try {assert.equal((await llamar('admin','POST',revision,confirmar(caso))).statusCode,401);}
  finally {await pool.query('update users set active=true where id=$1',[usuarios.get('admin')!.id]);}
  assert.equal((await llamar('admin','POST',revision,confirmar(caso))).statusCode,200);
  assert.equal((await llamar('alumno','PUT',ruta,{...entrada,clave:randomUUID(),version:2})).statusCode,409);
});

test('HU32-05: confirma acceso y encola comprobante una vez; rechazar exige motivo y notifica',async()=>{
  const caso=await preparar();const op=await subir(caso);const ruta=`/api/pagos/${caso.pagoId}/transferencias/${op}/revision`;
  assert.equal((await llamar('alumno','POST',ruta,confirmar(caso))).statusCode,403);
  assert.equal((await llamar('admin','POST',ruta,confirmar(caso))).statusCode,200);
  assert.equal((await llamar('admin','POST',ruta,confirmar(caso))).statusCode,200);
  assert.equal((await llamar('alumno','GET',`/api/cursos/${caso.cursoId}`)).json().estadoInscripcion,'EN_CURSO');
  assert.equal((await pool.query(`select 1 from "notificacionesPago" where "operacionId"=$1 and tipo='COMPROBANTE'`,[op])).rowCount,1);
  const rechazado=await preparar();const otroOp=await subir(rechazado);
  assert.equal((await llamar('admin','POST',`/api/pagos/${rechazado.pagoId}/transferencias/${otroOp}/revision`,{decision:'RECHAZAR',motivo:'No existe el abono en la cuenta BCP.'})).statusCode,200);
  assert.equal((await pool.query(`select 1 from "notificacionesPago" where "operacionId"=$1 and tipo='RECHAZO'`,[otroOp])).rowCount,1);
});

test('HU32-06: efectivo exige monto y fecha, audita recepción e impide replay con otra carga',async()=>{
  const caso=await preparar();const ruta=`/api/pagos/${caso.pagoId}/efectivo`;
  const entrada={referencia:`CAJA-${randomUUID()}`,importeCentimos:15050,fechaRecepcion:'2026-01-01'};
  assert.equal((await llamar('admin','POST',ruta,{referencia:entrada.referencia})).statusCode,422);
  assert.equal((await llamar('admin','POST',ruta,{...entrada,importeCentimos:1})).statusCode,409);
  assert.equal((await llamar('admin','POST',ruta,{...entrada,fechaRecepcion:'2999-01-01'})).statusCode,422);
  assert.equal((await llamar('admin','POST',ruta,entrada)).statusCode,200);
  assert.equal((await llamar('admin','POST',ruta,entrada)).statusCode,200);
  assert.equal((await llamar('admin','POST',ruta,{...entrada,fechaRecepcion:'2026-01-02'})).statusCode,409);
  assert.equal((await pool.query(`select 1 from "recepcionesEfectivo" r join "operacionesPago" o on o.id=r."operacionId" where o."pagoId"=$1`,[caso.pagoId])).rowCount,1);
});
