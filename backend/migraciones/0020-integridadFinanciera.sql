-- El historial financiero no desaparece al borrar su curso u obligación.
do $$
declare restriccion record;
begin
  for restriccion in select conrelid::regclass as tabla, conname as nombre, pg_get_constraintdef(oid) as definicion
    from pg_constraint where contype='f' and confdeltype='c'
    and conrelid in ('"obligacionesPago"'::regclass,'"operacionesPago"'::regclass,'"hechosPago"'::regclass,'"auditoriaPagos"'::regclass)
  loop
    execute format('alter table %s drop constraint %I',restriccion.tabla,restriccion.nombre);
    execute format('alter table %s add constraint %I %s',restriccion.tabla,restriccion.nombre,replace(restriccion.definicion,'ON DELETE CASCADE','ON DELETE RESTRICT'));
  end loop;
end $$;
create table "incidenciasPago" (
  id bigserial primary key,
  "pagoId" bigint not null references "obligacionesPago"(id),
  "operacionId" uuid not null references "operacionesPago"(id),
  motivo varchar(20) not null check (motivo in ('IMPORTE','REFERENCIA','TARDIO')),
  referencia varchar(160) not null,
  "importeCentimos" bigint not null,
  moneda varchar(3) not null,
  "creadoEn" timestamptz not null default clock_timestamp(),
  unique ("operacionId",referencia,motivo)
);
