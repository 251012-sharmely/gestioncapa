import type { PoolClient } from 'pg';
import { pool } from '../../shared/database.js';
import type { UsuarioAutenticado } from '../../plugins/autorizacion.js';

export async function puedeAccederContenido(cursoId:string,usuario:UsuarioAutenticado,cliente:Pick<PoolClient,'query'>=pool) {
  const fila=(await cliente.query<{acceso:boolean}>(`select (u.role='admin' or (u.role='instructor' and c.instructor_id=u.id)
    or (u.role='agremiado' and "tieneAccesoCurso"(c.id,u.id))) as acceso from cursos c
    join users u on u.id=$2 and u.active where c.id=$1`,[cursoId,usuario.id])).rows[0];
  return fila?.acceso===true;
}
