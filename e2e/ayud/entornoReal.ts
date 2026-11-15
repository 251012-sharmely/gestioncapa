import { cuentaReal } from './datos'

// Valores públicos exclusivos de E2E, compartidos por servidor y fixtures.
// La conexión a PostgreSQL/Redis se hereda de la terminal o del job de CI.
export const entornoBackendReal = {
  NODE_ENV: 'test',
  DB_NAME: 'gestioncapa_e2e',
  HOST: '127.0.0.1',
  PORT: '8180',
  FRONTEND_URL: 'http://127.0.0.1:4174',
  ADMIN_EMAIL: cuentaReal.email,
  ADMIN_PASSWORD: cuentaReal.password,
  ADMIN_NAME: 'Administrador E2E',
  JWT_SECRET: 'secreto-local-exclusivo-para-pruebas-e2e',
  QR_SECRET: 'secreto-qr-local-exclusivo-para-pruebas-e2e',
  LOG_LEVEL: 'warn',
}
