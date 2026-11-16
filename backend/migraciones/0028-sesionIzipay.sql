alter table "operacionesPago" add column "sesionCifrada" text;
alter table "operacionesPago" add column "sesionVenceEn" timestamptz;
alter table "operacionesPago" add constraint "sesionCompleta"
  check (("sesionCifrada" is null) = ("sesionVenceEn" is null));
