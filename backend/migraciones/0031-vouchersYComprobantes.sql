create table "referenciasTransferencia" (
  numero varchar(100) primary key,
  "operacionId" uuid unique references "operacionesPago"(id) on delete cascade,
  "conflictoHistorico" boolean not null default false,
  check (("operacionId" is null)="conflictoHistorico")
);
-- Reservar números históricos sin inventar archivos ni resolver conflictos por fecha/cuenta.
insert into "referenciasTransferencia"(numero,"operacionId","conflictoHistorico")
select numero,case when count(*)=1 then (array_agg("operacionId"))[1] else null end,count(*)>1
from (select "operacionId",regexp_replace(upper(referencia),'[^A-Z0-9]','','g') as numero from "transferenciasPago") t
where numero<>'' group by numero;

create table "vouchersPago" (
  id uuid primary key,
  "operacionId" uuid not null references "transferenciasPago"("operacionId") on delete cascade,
  version integer not null check (version>0),
  clave uuid not null,
  "cargadoPor" bigint not null references users(id),
  tipo varchar(32) not null check (tipo in ('image/png','image/jpeg','application/pdf')),
  contenido bytea,
  tamano integer not null check (tamano between 1 and 5242880),
  hash varchar(64) not null,
  "mesesRetencion" smallint not null check ("mesesRetencion" in (3,4)),
  "cargadoEn" timestamptz not null default clock_timestamp(),
  "eliminarEn" timestamptz not null,
  "eliminadoEn" timestamptz,
  unique ("operacionId",version), unique ("operacionId",clave),
  check ((contenido is null)=("eliminadoEn" is not null)),
  check (contenido is null or octet_length(contenido)=tamano)
);
create index "vouchersPorRetencion" on "vouchersPago"("eliminarEn") where contenido is not null;

create table "recepcionesEfectivo" (
  "operacionId" uuid primary key references "operacionesPago"(id) on delete cascade,
  "importeCentimos" bigint not null check ("importeCentimos">0),
  "fechaRecepcion" date not null check ("fechaRecepcion"<=current_date)
);
create table "notificacionesPago" (
  id uuid primary key,
  "pagoId" bigint not null references "obligacionesPago"(id) on delete cascade,
  "operacionId" uuid not null references "operacionesPago"(id) on delete cascade,
  tipo varchar(15) not null check (tipo in ('COMPROBANTE','RECHAZO')),
  destinatario varchar(180) not null,
  asunto varchar(160) not null,
  texto text not null,
  estado varchar(15) not null default 'PENDIENTE' check (estado in ('PENDIENTE','ENVIANDO','ENVIADO')),
  intentos integer not null default 0,
  "intentarEn" timestamptz not null default clock_timestamp(),
  "procesamientoId" uuid,
  "bloqueadoHasta" timestamptz,
  "ultimoError" varchar(40),
  "enviadoEn" timestamptz,
  "creadoEn" timestamptz not null default clock_timestamp(),
  unique ("operacionId",tipo)
);
create index "notificacionesPagoPendientes" on "notificacionesPago"("intentarEn") where estado<>'ENVIADO';
