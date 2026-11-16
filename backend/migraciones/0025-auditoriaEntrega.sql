alter table "auditoriaCertificados" drop constraint "auditoriaCertificados_accion_check";
alter table "auditoriaCertificados" add constraint "accionCertificadoValida"
  check (accion in ('CERRAR','EMITIR','EXCEPCION','ANULAR','CORREGIR','RETENER','LIBERAR_POR_PAGO'));
