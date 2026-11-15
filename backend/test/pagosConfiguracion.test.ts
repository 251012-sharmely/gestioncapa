import assert from 'node:assert/strict';
import { test } from 'node:test';
import { parseEnv } from '../src/config/env.schema.js';

const base = { DB_HOST:'localhost',DB_NAME:'test',DB_USER:'test',DB_PASSWORD:'solo-pruebas',REDIS_URL:'redis://localhost:6379',
  JWT_SECRET:'sesion-de-prueba-32-caracteres-minimo',QR_SECRET:'qr-de-prueba-distinto-32-caracteres-minimo',ADMIN_EMAIL:'test@example.org',ADMIN_PASSWORD:'clave-solo-de-prueba' };
test('HU53-08: pasarelas deshabilitadas por defecto; ejemplos no habilitan cobros', () => {
  const config = parseEnv(base);
  assert.equal(config.izipayHabilitado, false); assert.equal(config.culqiHabilitado, false);
  assert.equal(config.pagosEntorno, 'sandbox');
});
test('HU53-08: activar exige credenciales propias, entorno coherente y callback HTTPS', () => {
  for (const cambio of [{ izipayHabilitado:'true' },{ culqiHabilitado:'true' }, { pagosEntorno:'produccion' },
    { culqiHabilitado:'true', culqiClavePublica:'pk_test_CAMBIA',culqiClaveSecreta:'sk_test_CAMBIA',pagosUrlPublica:'https://cursos.example.org' }]) {
    assert.throws(() => parseEnv({ ...base,...cambio }));
  }
  const config = parseEnv({ ...base,culqiHabilitado:'true',culqiClavePublica:'pk_test_soloEjemploSinCuenta',culqiClaveSecreta:'sk_test_soloEjemploSinCuenta',pagosUrlPublica:'https://cursos.example.org' });
  assert.equal(config.culqiHabilitado, true);
  assert.throws(() => parseEnv({ ...base,culqiHabilitado:'true',culqiClavePublica:'pk_live_noUsar',culqiClaveSecreta:'sk_live_noUsar',pagosUrlPublica:'https://cursos.example.org' }));
});
