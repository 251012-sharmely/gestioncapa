import type { PoolClient } from 'pg';
import { pathToFileURL } from 'node:url';
import { pool } from '../shared/database.js';

type InventarioCobro={cursoId:string;costoOferta:number;modalidadCobro:string|null;requiereConfigurarOferta:boolean;pendientesSinCondiciones:number;derechosGratuitosConservados:number};
/** Inventario para acordar la regularización; no modifica datos ni deduce pagos. */
export async function inventariarCobro(cliente:Pick<PoolClient,'query'>=pool) {
  return (await cliente.query<InventarioCobro>(`select c.id::text as "cursoId",c.costo::float8 as "costoOferta",c."modalidadCobro",
    (c.costo>0 and c."modalidadCobro" is null) as "requiereConfigurarOferta",
    count(i.curso_id) filter(where i."intentoId" is null and i.estado='PENDIENTE_PAGO')::int as "pendientesSinCondiciones",
    count(i.curso_id) filter(where i."constanciaGratuitaLegada")::int as "derechosGratuitosConservados"
    from cursos c left join inscripciones_curso i on i.curso_id=c.id group by c.id order by c.id`)).rows;
}

if (process.argv[1] && import.meta.url===pathToFileURL(process.argv[1]).href) {
  try {
    if (process.argv.slice(2).some(arg=>arg!=='--inventario')) throw new Error('Solo se admite --inventario.');
    console.log(JSON.stringify({aviso:'Solo lectura. El costo es el de la oferta actual, no el aceptado históricamente. Los pendientes antiguos requieren acuerdo administrativo.',cursos:await inventariarCobro()},null,2));
  } catch {
    console.error('No se pudo obtener el inventario de cobro. Verifica la configuración y usa únicamente --inventario.');process.exitCode=1;
  } finally {await pool.end();}
}
