alter table cursos add constraint "plazoPrevioObligatorio"
  check ("modalidadCobro" is distinct from 'PREVIO' or "plazoPagoMinutos" is not null);
create table "obligacionesPago" (
  id bigserial primary key,
  "cursoId" bigint not null references cursos(id) on delete cascade,
  "usuarioId" bigint not null references users(id),
  "intentoId" uuid not null,
  concepto varchar(15) not null check (concepto in ('CURSO','CONSTANCIA')),
  "importeCentimos" bigint not null check ("importeCentimos" between 1 and 999999999999),
  moneda varchar(3) not null check (moneda='PEN'),
  estado varchar(15) not null default 'PENDIENTE' check (estado in ('PENDIENTE','PAGADO')),
  medio varchar(10) check (medio in ('IZIPAY','CULQI','EFECTIVO')),
  "creadoEn" timestamptz not null default clock_timestamp(),
  "pagadoEn" timestamptz,
  unique ("intentoId",concepto),
  check ((estado='PENDIENTE' and "pagadoEn" is null and medio is null)
    or (estado='PAGADO' and "pagadoEn" is not null and medio is not null))
);
create table "operacionesPago" (
  id uuid primary key,
  numero bigserial unique,
  "pagoId" bigint not null references "obligacionesPago"(id) on delete cascade,
  medio varchar(10) not null check (medio in ('IZIPAY','CULQI','EFECTIVO')),
  clave uuid not null,
  "cargaHash" varchar(64) not null,
  estado varchar(15) not null default 'INICIADO' check (estado in ('INICIADO','INCIERTO','RECHAZADO','CONFIRMADO')),
  "referenciaExterna" varchar(160),
  "creadoEn" timestamptz not null default clock_timestamp(),
  "actualizadoEn" timestamptz not null default clock_timestamp(),
  unique ("pagoId",clave)
);
create unique index "unaOperacionActiva" on "operacionesPago"("pagoId") where estado in ('INICIADO','INCIERTO');
create table "hechosPago" (
  id bigserial primary key,
  "pagoId" bigint not null references "obligacionesPago"(id) on delete cascade,
  "operacionId" uuid not null references "operacionesPago"(id) on delete cascade,
  medio varchar(10) not null,
  referencia varchar(160) not null,
  "importeCentimos" bigint not null,
  moneda varchar(3) not null,
  "verificadoEn" timestamptz not null default clock_timestamp(),
  "requiereConciliacion" boolean not null default false,
  unique (medio,referencia)
);
create table "auditoriaPagos" (
  id bigserial primary key,
  "pagoId" bigint not null references "obligacionesPago"(id) on delete cascade,
  "actorId" bigint references users(id),
  accion varchar(40) not null,
  "operacionId" uuid references "operacionesPago"(id) on delete cascade,
  "creadoEn" timestamptz not null default clock_timestamp()
);
create index "pagosPorUsuario" on "obligacionesPago"("usuarioId","cursoId");
