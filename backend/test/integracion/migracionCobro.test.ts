import assert from 'node:assert/strict';
import { test } from 'node:test';
import { randomBytes } from 'node:crypto';
import { cp, mkdtemp, readdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Pool } from 'pg';
import { env } from '../../src/config/env.js';
import { CARPETA_MIGRACIONES, migrar } from '../../src/shared/migraciones.js';
import { inventariarCobro } from '../../src/scripts/inventarioCobro.js';

test('HU53-19: migrar desde 0017 conserva derechos y pendientes sin inventar cobros ni plazos', async()=>{
  const nombre=`hu53migracion${randomBytes(6).toString('hex')}`;
  const conectar=(database:string)=>new Pool({host:env.DB_HOST,port:env.DB_PORT,user:env.DB_USER,password:env.DB_PASSWORD,database,ssl:env.DB_SSL?{rejectUnauthorized:false}:false});
  const administracion=conectar('postgres');
  let prueba:Pool|undefined;let carpeta:string|undefined;let creada=false;
  try {
    await administracion.query(`create database "${nombre}"`);creada=true;prueba=conectar(nombre);
    carpeta=await mkdtemp(join(tmpdir(),'hu53-migraciones-'));
    const origen=fileURLToPath(CARPETA_MIGRACIONES);
    for (const archivo of await readdir(origen)) if (/^\d{4}.*\.sql$/.test(archivo) && archivo.slice(0,4)<='0017') await cp(join(origen,archivo),join(carpeta,archivo));
    await migrar(prueba,carpeta);
    const usuarios=(await prueba.query<{id:string}>(`insert into users(name,email,password_hash,role) values
      ('Admin','admin@hu53.local','sin-acceso','admin'),('Docente','docente@hu53.local','sin-acceso','instructor'),
      ('Histórico','alumno@hu53.local','sin-acceso','agremiado') returning id::text`)).rows;
    const cursos=(await prueba.query<{id:string}>(`insert into cursos(creador_id,instructor_id,titulo,horas_lectivas,modalidad,costo,cupos,tipo_certificado)
      values($1,$2,'Legado gratuito',24,'PRESENCIAL',0,10,'PARTICIPACION'),($1,$2,'Legado con costo',24,'PRESENCIAL',150.50,10,'PARTICIPACION') returning id::text`,[usuarios[0]!.id,usuarios[1]!.id])).rows;
    await prueba.query(`insert into inscripciones_curso(curso_id,usuario_id,estado,inscrito_en) values($1,$3,'EN_CURSO','2026-10-01T10:00:00Z'),($2,$3,'PENDIENTE_PAGO','2026-10-02T10:00:00Z')`,[cursos[0]!.id,cursos[1]!.id,usuarios[2]!.id]);
    const antes=(await prueba.query('select curso_id::text,usuario_id::text,estado,inscrito_en from inscripciones_curso where usuario_id=$1 order by curso_id',[usuarios[2]!.id])).rows;
    await migrar(prueba);
    assert.deepEqual((await prueba.query('select curso_id::text,usuario_id::text,estado,inscrito_en from inscripciones_curso where usuario_id=$1 order by curso_id',[usuarios[2]!.id])).rows,antes);
    assert.equal((await prueba.query('select count(*)::int as total from "obligacionesPago"')).rows[0].total,0);
    assert.equal((await prueba.query('select count(*)::int as total from "intentosInscripcion"')).rows[0].total,0);
    const inventario=await inventariarCobro(prueba);
    const pendiente=inventario.find(c=>c.cursoId===cursos[1]!.id)!;
    assert.equal(pendiente.pendientesSinCondiciones,1);
    assert.equal(pendiente.requiereConfigurarOferta,true);
    assert.equal(inventario.find(c=>c.cursoId===cursos[0]!.id)?.derechosGratuitosConservados,1);
    assert.equal((await migrar(prueba)).length,0);
  } finally {
    await prueba?.end();
    if (creada) await administracion.query(`drop database "${nombre}" with (force)`);
    await administracion.end();
    if (carpeta) await rm(carpeta,{recursive:true});
  }
});
