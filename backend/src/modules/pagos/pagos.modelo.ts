import { z } from 'zod';

export class ErrorPago extends Error {
  constructor(readonly statusCode: number, readonly code: string, mensaje: string) { super(mensaje); }
}
export type MedioPago = 'IZIPAY' | 'CULQI' | 'EFECTIVO' | 'TRANSFERENCIA';
export type Pago = {
  id: string; cursoId: string; usuarioId: string; intentoId: string; concepto: 'CURSO' | 'CONSTANCIA';
  importeCentimos: number; moneda: 'PEN'; estado: 'PENDIENTE' | 'PAGADO'; medio: MedioPago | null; pagadoEn: string | null;
};
export type OperacionPago = {
  entorno: 'sandbox' | 'produccion';
  id: string; numero: string; pagoId: string; medio: MedioPago; clave: string; cargaHash: string;
  estado: 'INICIADO' | 'INCIERTO' | 'RECHAZADO' | 'CONFIRMADO' | 'DECLARADO'; referenciaExterna: string | null;
};
export const entradaIntento = z.object({ medio: z.enum(['IZIPAY','CULQI']), clave: z.uuid(), token: z.string().min(10).max(100).optional() }).strict();
export const entradaEfectivo = z.object({ referencia: z.string().trim().min(3).max(100).regex(/^[A-Za-z0-9 ./-]+$/) }).strict();

const referenciaBancaria = z.string().trim().min(3).max(100).regex(/^[A-Za-z0-9 ./-]+$/)
  .transform(valor => valor.toUpperCase().replace(/\s+/g,' '));
export const entradaTransferencia = z.object({ destinoId:z.uuid(), clave:z.uuid(), referencia:referenciaBancaria, fechaOperacion:z.iso.date() }).strict();
export const entradaRevisionTransferencia = z.discriminatedUnion('decision',[
  z.object({decision:z.literal('CONFIRMAR'),referencia:referenciaBancaria,fechaOperacion:z.iso.date(),
    importeCentimos:z.number().int().min(1).max(999999999999),moneda:z.literal('PEN'),verificado:z.literal(true)}).strict(),
  z.object({decision:z.literal('RECHAZAR'),motivo:z.string().trim().min(5).max(500)}).strict(),
]);
export type DeclaracionTransferencia = z.infer<typeof entradaTransferencia>;
export type RevisionTransferencia = z.infer<typeof entradaRevisionTransferencia>;
export type DestinoTransferencia = {banco:string;titular:string;cuenta:string;cci:string};
