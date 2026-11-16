create table "intentosInscripcion" (
  id uuid primary key,
  "cursoId" bigint not null references cursos(id) on delete cascade,
  "usuarioId" bigint not null references users(id),
  "modalidadCobro" varchar(15) not null check ("modalidadCobro" in ('PREVIO','CERTIFICADO','GRATUITO')),
  "importeCentimos" bigint not null check ("importeCentimos" between 0 and 999999999999),
  moneda varchar(3) not null default 'PEN' check (moneda='PEN'),
  "versionCobro" integer not null check ("versionCobro">0),
  "plazoPagoMinutos" integer,
  "inscritoEn" timestamptz not null,
  "venceEn" timestamptz,
  estado varchar(20) not null check (estado in ('PENDIENTE_PAGO','EN_CURSO','TERMINADO','CANCELADA')),
  "canceladoEn" timestamptz,
  "pagoId" bigint references "obligacionesPago"(id),
  check (("modalidadCobro"='PREVIO' and "importeCentimos">0 and "plazoPagoMinutos" is not null and "plazoPagoMinutos" between 1 and 525600 and "venceEn" is not null)
    or ("modalidadCobro"='CERTIFICADO' and "importeCentimos">0 and "plazoPagoMinutos" is null and "venceEn" is null)
    or ("modalidadCobro"='GRATUITO' and "importeCentimos"=0 and "plazoPagoMinutos" is null and "venceEn" is null))
);
create index "intentosPorPersona" on "intentosInscripcion"("cursoId","usuarioId","inscritoEn" desc);
create index "reservasPorVencer" on "intentosInscripcion"("venceEn") where estado='PENDIENTE_PAGO';
alter table inscripciones_curso add column "intentoId" uuid references "intentosInscripcion"(id) on delete set null;
alter table inscripciones_curso drop constraint "inscripcionEstadoValido";
alter table inscripciones_curso drop constraint "inscripcionFechaFinValida";
alter table inscripciones_curso add constraint "inscripcionEstadoValido"
  check (estado in ('EN_CURSO','TERMINADO','PENDIENTE_PAGO','CANCELADA'));
alter table inscripciones_curso add constraint "inscripcionFechaFinValida"
  check ((estado in ('EN_CURSO','PENDIENTE_PAGO','CANCELADA') and terminado_en is null)
    or (estado='TERMINADO' and terminado_en is not null));

-- Consumidor del contrato financiero: aplicar el hecho confirmado bajo el lock del curso.
create function "aplicarPagoReserva"() returns trigger language plpgsql as $$
declare intento "intentosInscripcion"%rowtype; operacion uuid; referenciaPago text;
begin
  if new.estado<>'PAGADO' or old.estado='PAGADO' or new.concepto<>'CURSO' then return new; end if;
  select * into intento from "intentosInscripcion" where id=new."intentoId" for update;
  if not found then return new; end if;
  if intento.estado='PENDIENTE_PAGO' and new."pagadoEn"<intento."venceEn"
    and exists(select 1 from cursos where id=intento."cursoId" and estado='PUBLICADO')
    and exists(select 1 from inscripciones_curso where curso_id=intento."cursoId" and usuario_id=intento."usuarioId" and "intentoId"=intento.id)
  then
    update "intentosInscripcion" set estado='EN_CURSO' where id=intento.id;
    update inscripciones_curso set estado='EN_CURSO' where "intentoId"=intento.id;
    insert into enrollments(class_id,user_id) select id,intento."usuarioId" from classes
      where curso_id=intento."cursoId" and estado='PROGRAMADA' on conflict do nothing;
  else
    if intento.estado='PENDIENTE_PAGO' and intento."venceEn"<=new."pagadoEn" then
      update "intentosInscripcion" set estado='CANCELADA',"canceladoEn"=clock_timestamp() where id=intento.id;
      update inscripciones_curso set estado='CANCELADA' where "intentoId"=intento.id;
    end if;
    select "operacionId",referencia into operacion,referenciaPago from "hechosPago" where "pagoId"=new.id order by id limit 1;
    update "hechosPago" set "requiereConciliacion"=true where "pagoId"=new.id;
    if operacion is not null then
      insert into "incidenciasPago"("pagoId","operacionId",motivo,referencia,"importeCentimos",moneda)
        values(new.id,operacion,'TARDIO',referenciaPago,new."importeCentimos",new.moneda) on conflict do nothing;
    end if;
  end if;
  return new;
end $$;
create trigger "pagoConfirmaReserva" after update of estado on "obligacionesPago"
  for each row execute function "aplicarPagoReserva"();

create function "tieneAccesoCurso"(curso bigint,persona bigint) returns boolean language sql stable as $$
  select exists(select 1 from inscripciones_curso i left join "intentosInscripcion" t on t.id=i."intentoId"
    where i.curso_id=curso and i.usuario_id=persona and i.estado in ('EN_CURSO','TERMINADO')
    and (i."intentoId" is null or (t.estado in ('EN_CURSO','TERMINADO') and (t."modalidadCobro"<>'PREVIO'
      or exists(select 1 from "obligacionesPago" p where p.id=t."pagoId" and p.estado='PAGADO' and p."pagadoEn"<t."venceEn")))));
$$;
