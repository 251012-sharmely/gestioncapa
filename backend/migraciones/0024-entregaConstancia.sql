create table "entregasConstancia" (
  id bigserial primary key,
  "cursoId" bigint not null references cursos(id),
  "usuarioId" bigint not null references users(id),
  "intentoId" uuid not null references "intentosInscripcion"(id),
  "pagoId" bigint not null references "obligacionesPago"(id),
  "actorId" bigint not null references users(id),
  datos jsonb not null,
  motivo text,
  estado varchar(10) not null default 'RETENIDA' check (estado in ('RETENIDA','EMITIDA')),
  codigo varchar(100) references certificados_curso(codigo),
  "elegibleEn" timestamptz not null default clock_timestamp(),
  "emitidoEn" timestamptz,
  unique ("cursoId","usuarioId"),
  check ((estado='RETENIDA' and codigo is null and "emitidoEn" is null)
    or (estado='EMITIDA' and codigo is not null and "emitidoEn" is not null))
);
