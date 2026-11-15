import { pool } from '../../shared/database.js';
import { env } from '../../config/env.js';
import { conciliarOperacion } from './pagos.notificaciones.js';

export async function recuperarOperaciones() {
  await pool.query(`update "operacionesPago" set "sesionCifrada"=null,"sesionVenceEn"=null
    where "sesionCifrada" is not null and (estado='CONFIRMADO' or "sesionVenceEn"<=clock_timestamp())`);
  // Los casos que necesitan una referencia manual siguen visibles, pero no
  // consumen el lote de consultas automáticas de otras obligaciones.
  const operaciones = (await pool.query<{ id: string }>(`
    select id from "operacionesPago"
    where estado in ('INICIADO','INCIERTO') and entorno=$1
      and "creadoEn"<clock_timestamp()-interval '30 seconds'
      and ((medio='IZIPAY' and $2) or
           (medio='CULQI' and $3 and "referenciaExterna" is not null))
    order by "actualizadoEn",numero limit 3`,
  [env.pagosEntorno, env.izipayHabilitado, env.culqiHabilitado])).rows;

  const resultados = await Promise.allSettled(operaciones.map(async operacion => {
    try {
      return await conciliarOperacion(operacion.id);
    } finally {
      // Incluso una consulta fallida cede su turno al siguiente lote.
      await pool.query('update "operacionesPago" set "actualizadoEn"=clock_timestamp() where id=$1', [operacion.id]);
    }
  }));
  const confirmadas = resultados.filter(resultado => resultado.status === 'fulfilled' && resultado.value === 'CONFIRMADO').length;
  const pendientes = (await pool.query<{ total: number }>(`
    select count(*)::int as total from "operacionesPago"
    where estado in ('INICIADO','INCIERTO') and entorno=$1`, [env.pagosEntorno])).rows[0]!.total;
  return { confirmadas, pendientes };
}
