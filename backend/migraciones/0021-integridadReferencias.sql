alter table "incidenciasPago" drop constraint "incidenciasPago_operacionId_referencia_motivo_key";
alter table "incidenciasPago" add constraint "incidenciaContenidoUnico"
  unique ("operacionId",referencia,motivo,"importeCentimos",moneda);
