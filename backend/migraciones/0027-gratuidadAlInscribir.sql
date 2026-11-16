-- Compatibilidad con altas legadas sin intento: se captura la oferta al nacer
-- la inscripción. Editar después el curso nunca redefine ese derecho.
create function "capturarGratuidadLegada"() returns trigger language plpgsql as $$
begin
  if new."intentoId" is null and new.estado in ('EN_CURSO','TERMINADO') then
    new."constanciaGratuitaLegada" := exists(select 1 from cursos where id=new.curso_id and costo=0);
  end if;
  return new;
end $$;
create trigger "gratuidadAlInscribir" before insert on inscripciones_curso
  for each row execute function "capturarGratuidadLegada"();
