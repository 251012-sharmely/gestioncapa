import assert from 'node:assert/strict';
import { before,after,test } from 'node:test';
import { createServer,type Socket } from 'node:net';
import { randomUUID } from 'node:crypto';
import { env } from '../../src/config/env.js';
import { pool } from '../../src/shared/database.js';
import { migrar } from '../../src/shared/migraciones.js';
import { crearObligacion,registrarEfectivo,obtenerPago } from '../../src/modules/pagos/pagos.repositorio.js';
import { enviarNotificacionesPago } from '../../src/modules/pagos/pagos.correo.js';

const mensajes:string[]=[];
const conexiones=new Set<Socket>();
let rechazar=true;
let bloquearEntrega=false;
let cursoId:string;
let admin:number;
let alumno:number;
const anterior={...env};
const servidor=createServer(conexion=>{
  conexiones.add(conexion);conexion.on('close',()=>conexiones.delete(conexion));
  conexion.setEncoding('utf8');conexion.write('220 localhost pruebas HU32\r\n');
  let pendiente='';let datos=false;let mensaje:string[]=[];
  conexion.on('data',trozo=>{
    pendiente+=trozo;
    let indice:number;
    while((indice=pendiente.indexOf('\r\n'))>=0) {
      const linea=pendiente.slice(0,indice);pendiente=pendiente.slice(indice+2);
      if(datos) {
        if(linea==='.') {datos=false;mensajes.push(mensaje.join('\r\n'));mensaje=[];if(!bloquearEntrega) conexion.write(rechazar?'451 Reintentar entrega\r\n':'250 Aceptado localmente\r\n');}
        else mensaje.push(linea.startsWith('..')?linea.slice(1):linea);
      } else if(/^EHLO|^HELO/.test(linea)) conexion.write('250 localhost\r\n');
      else if(linea==='DATA') {datos=true;conexion.write('354 Enviar mensaje\r\n');}
      else if(linea==='QUIT') conexion.end('221 Fin\r\n');
      else conexion.write('250 OK\r\n');
    }
  });
});

test('HU32-07: cancela un SMTP sin respuesta antes de agotar el lease y conserva el reintento', {timeout:2000},async()=>{
  const pago=await crearObligacion(pool,{cursoId,usuarioId:alumno,intentoId:randomUUID(),concepto:'CURSO',importeCentimos:15050,moneda:'PEN'});
  await registrarEfectivo(pago.id,admin,`CAJA-${randomUUID()}`);
  Object.assign(env,{correoPlazoEnvioMs:200,correoHabilitado:true});bloquearEntrega=true;
  try {
    assert.equal(await enviarNotificacionesPago(),0);
    const aviso=(await pool.query('select estado,intentos from "notificacionesPago" where "pagoId"=$1',[pago.id])).rows[0];
    assert.equal(aviso.estado,'PENDIENTE');assert.equal(aviso.intentos,1);
    assert.equal((await obtenerPago(pago.id))?.estado,'PAGADO');
  } finally {bloquearEntrega=false;Object.assign(env,{correoPlazoEnvioMs:60000});}
});
before(async()=>{
  await migrar(pool);
  const personas=(await pool.query(`insert into users(name,email,password_hash,role) values('Admin',$1,'sin-acceso','admin'),('Alumno',$2,'sin-acceso','agremiado') returning id`,
    [`correo-admin-${randomUUID()}@prueba.local`,`correo-alumno-${randomUUID()}@prueba.local`])).rows;
  admin=Number(personas[0].id);alumno=Number(personas[1].id);
  cursoId=(await pool.query(`insert into cursos(creador_id,instructor_id,titulo,horas_lectivas,modalidad,costo,cupos,tipo_certificado)
    values($1,$1,'Correo HU32',24,'PRESENCIAL',150.50,5,'PARTICIPACION') returning id::text`,[admin])).rows[0].id;
  await new Promise<void>(resolver=>servidor.listen(0,'127.0.0.1',resolver));
  const direccion=servidor.address();assert.ok(direccion&&typeof direccion==='object');
  Object.assign(env,{correoServidor:'127.0.0.1',correoPuerto:direccion.port,correoRemitente:'pagos@prueba.local',correoSinTlsParaPruebas:true});
});
after(async()=>{
  Object.assign(env,anterior);for(const conexion of conexiones) conexion.destroy();
  await new Promise<void>(resolver=>servidor.close(()=>resolver()));
  if(cursoId) {
    for(const tabla of ['auditoriaPagos','hechosPago','operacionesPago','obligacionesPago']) await pool.query(`delete from "${tabla}" where ${tabla==='obligacionesPago'?'"cursoId"=$1':'"pagoId" in (select id from "obligacionesPago" where "cursoId"=$1)'}`,[cursoId]);
    await pool.query('delete from cursos where id=$1',[cursoId]);await pool.query('delete from users where id=any($1::bigint[])',[[admin,alumno]]);
  }
  await pool.end();
});
test('HU32-07: SMTP local rechaza, reintenta y entrega un PDF; dos trabajadores no duplican el evento',async()=>{
  mensajes.length=0;
  const pago=await crearObligacion(pool,{cursoId,usuarioId:alumno,intentoId:randomUUID(),concepto:'CURSO',importeCentimos:15050,moneda:'PEN'});
  await registrarEfectivo(pago.id,admin,`CAJA-${randomUUID()}`);
  env.correoHabilitado=false;assert.equal(await enviarNotificacionesPago(),0);
  env.correoHabilitado=true;assert.equal(await enviarNotificacionesPago(),0);
  assert.equal((await obtenerPago(pago.id))?.estado,'PAGADO');
  const fallida=(await pool.query(`select estado,intentos,"ultimoError" from "notificacionesPago" where "pagoId"=$1`,[pago.id])).rows[0];
  assert.equal(fallida.estado,'PENDIENTE');assert.equal(fallida.intentos,1);assert.ok(fallida.ultimoError);
  rechazar=false;env.correoRemitente='pagos@otra-prueba.local';
  await pool.query('update "notificacionesPago" set "intentarEn"=clock_timestamp() where "pagoId"=$1',[pago.id]);
  const enviados=await Promise.all([enviarNotificacionesPago(),enviarNotificacionesPago()]);assert.equal(enviados.reduce((suma,total)=>suma+total,0),1);
  assert.equal(mensajes.length,2);
  const identificador=(mensaje:string)=>mensaje.match(/^Message-ID: (.+)$/mi)?.[1];
  assert.equal(identificador(mensajes[0]!),identificador(mensajes[1]!));
  assert.match(mensajes[1]!,/Content-Type: application\/pdf/);
  const pdf=mensajes[1]!.slice(mensajes[1]!.indexOf('Content-Type: application/pdf')).split('\r\n\r\n')[1]!.split('\r\n--')[0]!.replace(/\s/g,'');
  assert.match(Buffer.from(pdf,'base64').toString(),/^%PDF-/);
  assert.equal(await enviarNotificacionesPago(),0);
  assert.equal((await pool.query('select estado from "notificacionesPago" where "pagoId"=$1',[pago.id])).rows[0].estado,'ENVIADO');
});
