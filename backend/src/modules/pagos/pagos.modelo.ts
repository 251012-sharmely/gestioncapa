import { z } from 'zod';

export class ErrorPago extends Error {
  constructor(readonly statusCode: number, readonly code: string, mensaje: string) { super(mensaje); }
}
export type MedioPago = 'IZIPAY' | 'CULQI' | 'EFECTIVO';
export type Pago = {
  id: string; cursoId: string; usuarioId: string; intentoId: string; concepto: 'CURSO' | 'CONSTANCIA';
  importeCentimos: number; moneda: 'PEN'; estado: 'PENDIENTE' | 'PAGADO'; medio: MedioPago | null; pagadoEn: string | null;
};
export type OperacionPago = {
  entorno: 'sandbox' | 'produccion';
  id: string; numero: string; pagoId: string; medio: MedioPago; clave: string; cargaHash: string;
  estado: 'INICIADO' | 'INCIERTO' | 'RECHAZADO' | 'CONFIRMADO'; referenciaExterna: string | null;
};
export const entradaIntento = z.object({ medio: z.enum(['IZIPAY','CULQI']), clave: z.uuid(), token: z.string().min(10).max(100).optional() }).strict();
export const entradaEfectivo = z.object({ referencia: z.string().trim().min(3).max(100).regex(/^[A-Za-z0-9 ./-]+$/) }).strict();
