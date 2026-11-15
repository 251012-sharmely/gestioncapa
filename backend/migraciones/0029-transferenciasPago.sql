alter table "obligacionesPago" alter column medio type varchar(15);
alter table "operacionesPago" alter column medio type varchar(15);
alter table "hechosPago" alter column medio type varchar(15);
alter table "obligacionesPago" drop constraint "obligacionesPago_medio_check";
alter table "operacionesPago" drop constraint "operacionesPago_medio_check";
alter table "obligacionesPago" add constraint "medioObligacionValido"
  check (medio in ('IZIPAY','CULQI','EFECTIVO','TRANSFERENCIA'));
alter table "operacionesPago" add constraint "medioOperacionValido"
  check (medio in ('IZIPAY','CULQI','EFECTIVO','TRANSFERENCIA'));

-- El destino ofrecido queda vinculado a la obligación antes de transferir.
create table "destinosTransferencia" (
  id uuid primary key,
  "pagoId" bigint not null references "obligacionesPago"(id),
  banco varchar(80) not null,
  titular varchar(160) not null,
  cuenta varchar(34) not null check (cuenta ~ '^[0-9]{6,34}$'),
  cci varchar(20) not null check (cci ~ '^[0-9]{20}$'),
  "creadoEn" timestamptz not null default clock_timestamp(),
  unique ("pagoId",banco,titular,cuenta,cci)
);
create table "transferenciasPago" (
  "operacionId" uuid primary key references "operacionesPago"(id),
  "destinoId" uuid not null references "destinosTransferencia"(id),
  referencia varchar(100) not null,
  "fechaOperacion" date not null check ("fechaOperacion"<=current_date),
  "motivoRechazo" varchar(500),
  "revisadoPor" bigint references users(id),
  "revisadoEn" timestamptz,
  "revisionHash" varchar(64),
  check (("revisadoPor" is null and "revisadoEn" is null and "revisionHash" is null)
    or ("revisadoPor" is not null and "revisadoEn" is not null and "revisionHash" is not null))
);
