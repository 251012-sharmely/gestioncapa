import type { PoolClient } from 'pg';
import { pool } from '../../shared/database.js';

export async function cancelarReservasVencidas(cliente:PoolClient,cursoId:string) {
  await cliente.query(`with vencidos as (
    update "intentosInscripcion" set estado='CANCELADA',"canceladoEn"=clock_timestamp()
    where "cursoId"=$1 and estado='PENDIENTE_PAGO' and "venceEn"<=clock_timestamp() returning id
  ) update inscripciones_curso set estado='CANCELADA' where "intentoId" in (select id from vencidos)`,[cursoId]);
}
export async function vencerReservas() {
  const cursos=(await pool.query<{id:string}>(`select distinct "cursoId"::text as id from "intentosInscripcion"
    where estado='PENDIENTE_PAGO' and "venceEn"<=clock_timestamp() limit 100`)).rows;
  for (const curso of cursos) {
    const cliente=await pool.connect();
    try {
      await cliente.query('begin');
      await cliente.query('select id from cursos where id=$1 for update',[curso.id]);
      await cancelarReservasVencidas(cliente,curso.id);
      await cliente.query('commit');
    } catch(error) { await cliente.query('rollback'); throw error; }
    finally { cliente.release(); }
  }
  return cursos.length;
}
