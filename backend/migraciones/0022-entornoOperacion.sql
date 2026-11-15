alter table "operacionesPago" add column entorno varchar(12) not null default 'sandbox' check (entorno in ('sandbox','produccion'));
