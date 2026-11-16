-- Declarar un abono ya realizado no inicia otro cargo en la pasarela.
alter table "operacionesPago" drop constraint "operacionesPago_estado_check";
alter table "operacionesPago" add constraint "estadoOperacionValido"
  check (estado in ('INICIADO','INCIERTO','RECHAZADO','CONFIRMADO','DECLARADO'));
alter table "operacionesPago" add constraint "declaracionSoloTransferencia"
  check (estado<>'DECLARADO' or medio='TRANSFERENCIA');
create unique index "unaTransferenciaPorRevisar" on "operacionesPago"("pagoId")
  where medio='TRANSFERENCIA' and estado in ('INICIADO','INCIERTO','DECLARADO');
