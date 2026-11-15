-- Expansión compatible: un precio histórico positivo no prueba modalidad ni plazo.
alter table cursos add column "modalidadCobro" varchar(15);
alter table cursos add column "plazoPagoMinutos" integer;
alter table cursos add column "versionCobro" integer not null default 1 check ("versionCobro" > 0);
update cursos set "modalidadCobro"='GRATUITO' where costo=0;
alter table cursos add constraint "politicaCobroCoherente" check (
  ("modalidadCobro" is null and "plazoPagoMinutos" is null)
  or ("modalidadCobro"='GRATUITO' and costo=0 and "plazoPagoMinutos" is null)
  or ("modalidadCobro"='CERTIFICADO' and costo>0 and "plazoPagoMinutos" is null)
  or ("modalidadCobro"='PREVIO' and costo>0 and "plazoPagoMinutos" between 1 and 525600)
);
