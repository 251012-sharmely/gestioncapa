import { randomUUID } from 'node:crypto';
import { env } from '../config/env.js';
import { pool } from '../shared/database.js';

if (env.NODE_ENV!=='test'||env.DB_NAME!=='gestioncapa_e2e') throw new Error('La fixture de transferencia requiere la base exclusiva de E2E.');
try {
  const admin=(await pool.query('select id from users where email=$1',[env.ADMIN_EMAIL])).rows[0];
  const docente=(await pool.query(`select id from users where role='instructor' and active order by id limit 1`)).rows[0];
  if(!admin||!docente) throw new Error('Prepara los usuarios E2E antes de crear el curso.');
  const titulo=`Transferencia E2E ${randomUUID().slice(0,8)}`;
  const curso=(await pool.query(`insert into cursos(creador_id,instructor_id,titulo,horas_lectivas,modalidad,costo,cupos,tipo_certificado,estado,"modalidadCobro","plazoPagoMinutos")
    values($1,$2,$3,24,'PRESENCIAL',30.50,1,'PARTICIPACION','PUBLICADO','PREVIO',60) returning id::text`,[admin.id,docente.id,titulo])).rows[0];
  await pool.query(`insert into modulos_curso(curso_id,titulo,orden) values($1,'Contenido tras transferencia',1)`,[curso.id]);
  console.log(JSON.stringify({id:curso.id,titulo}));
} finally {await pool.end();}
