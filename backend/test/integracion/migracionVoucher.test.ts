import assert from 'node:assert/strict';
import { test } from 'node:test';
import { randomBytes,randomUUID } from 'node:crypto';
import { cp,mkdtemp,readdir,rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Pool } from 'pg';
import { env } from '../../src/config/env.js';
import { CARPETA_MIGRACIONES,migrar } from '../../src/shared/migraciones.js';

test('HU32-03: migración reserva referencias históricas y sus conflictos sin fabricar vouchers',async()=>{
  const nombre=`hu32migracion${randomBytes(6).toString('hex')}`;
  const conectar=(database:string)=>new Pool({host:env.DB_HOST,port:env.DB_PORT,user:env.DB_USER,password:env.DB_PASSWORD,database,ssl:env.DB_SSL?{rejectUnauthorized:false}:false});
  const administracion=conectar('postgres');
  let prueba:Pool|undefined;let carpeta:string|undefined;let creada=false;
  try {
    await administracion.query(`create database "${nombre}"`);creada=true;prueba=conectar(nombre);
    carpeta=await mkdtemp(join(tmpdir(),'hu32-migraciones-'));
    const origen=fileURLToPath(CARPETA_MIGRACIONES);
    for(const archivo of await readdir(origen)) if(/^\d{4}.*\.sql$/.test(archivo)&&archivo.slice(0,4)<='0030') await cp(join(origen,archivo),join(carpeta,archivo));
    await migrar(prueba,carpeta);
    const usuario=(await prueba.query(`insert into users(name,email,password_hash,role) values('Histórico','historico@prueba.local','sin-acceso','admin') returning id`)).rows[0].id;
    const curso=(await prueba.query(`insert into cursos(creador_id,instructor_id,titulo,horas_lectivas,modalidad,costo,cupos,tipo_certificado)
      values($1,$1,'Legado HU32',24,'PRESENCIAL',15,5,'PARTICIPACION') returning id`,[usuario])).rows[0].id;
    const operaciones:string[]=[];
    for(const referencia of ['BCP-123','BCP 123','BCP-456']) {
      const pago=(await prueba.query(`insert into "obligacionesPago"("cursoId","usuarioId","intentoId",concepto,"importeCentimos",moneda)
        values($1,$2,$3,'CURSO',1500,'PEN') returning id`,[curso,usuario,randomUUID()])).rows[0].id;
      const destino=randomUUID();const operacion=randomUUID();operaciones.push(operacion);
      await prueba.query(`insert into "destinosTransferencia"(id,"pagoId",banco,titular,cuenta,cci) values($1,$2,'BCP','Entidad ficticia','1234567890','00212345678901234567')`,[destino,pago]);
      await prueba.query(`insert into "operacionesPago"(id,"pagoId",medio,clave,"cargaHash",estado,entorno)
        values($1,$2,'TRANSFERENCIA',$3,$4,'DECLARADO','sandbox')`,[operacion,pago,randomUUID(),'0'.repeat(64)]);
      await prueba.query(`insert into "transferenciasPago"("operacionId","destinoId",referencia,"fechaOperacion") values($1,$2,$3,'2026-01-01')`,[operacion,destino,referencia]);
    }
    const antes=(await prueba.query('select * from "transferenciasPago" order by referencia')).rows;
    await migrar(prueba);
    assert.deepEqual((await prueba.query('select * from "transferenciasPago" order by referencia')).rows,antes);
    const referencias=(await prueba.query('select numero,"operacionId","conflictoHistorico" from "referenciasTransferencia" order by numero')).rows;
    assert.deepEqual(referencias,[{numero:'BCP123',operacionId:null,conflictoHistorico:true},{numero:'BCP456',operacionId:operaciones[2],conflictoHistorico:false}]);
    assert.equal((await prueba.query('select count(*)::int as total from "vouchersPago"')).rows[0].total,0);
    assert.equal((await migrar(prueba)).length,0);
  } finally {
    await prueba?.end();
    if(creada) await administracion.query(`drop database "${nombre}" with (force)`);
    await administracion.end();
    if(carpeta) await rm(carpeta,{recursive:true});
  }
});
