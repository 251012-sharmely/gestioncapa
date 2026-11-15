-- Conserva un derecho de emisión conocido al activar HU-53; no acredita un pago.
alter table inscripciones_curso add column "constanciaGratuitaLegada" boolean not null default false;
update inscripciones_curso i set "constanciaGratuitaLegada"=true from cursos c
  where c.id=i.curso_id and c.costo=0 and i."intentoId" is null and i.estado in ('EN_CURSO','TERMINADO');
