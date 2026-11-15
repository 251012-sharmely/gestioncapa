import { z } from 'zod';

const costo = z.number().finite().min(0).max(9999999999.99).multipleOf(0.01);
export const modalidadesCobro = ['PREVIO', 'CERTIFICADO', 'GRATUITO'] as const;
export const camposCobro = {
  modalidadCobro: z.enum(modalidadesCobro),
  costo,
  plazoPagoMinutos: z.number().int().positive().max(525600, 'El plazo máximo es un año.').nullable().default(null),
};

export function validarCoherenciaCobro(datos: { modalidadCobro: string; costo: number; plazoPagoMinutos: number | null }, contexto: z.RefinementCtx) {
  if ((datos.modalidadCobro === 'GRATUITO') !== (datos.costo === 0)) {
    contexto.addIssue({ code: 'custom', path: ['costo'], message: datos.modalidadCobro === 'GRATUITO' ? 'Un curso gratuito debe tener costo cero.' : 'Indica un importe mayor que cero.' });
  }
  if ((datos.modalidadCobro === 'PREVIO') !== (datos.plazoPagoMinutos !== null)) {
    contexto.addIssue({ code: 'custom', path: ['plazoPagoMinutos'], message: datos.modalidadCobro === 'PREVIO' ? 'Indica el plazo para pagar desde la inscripción.' : 'El plazo solo corresponde al pago previo.' });
  }
}

export const esquemaPoliticaCobro = z.object(camposCobro).strict().superRefine(validarCoherenciaCobro);
export const esquemaCambioCobro = z.object({ ...camposCobro, versionCobro: z.number().int().positive() }).strict().superRefine(validarCoherenciaCobro);
export const entradaInscripcion=z.object({versionCobro:z.number().int().positive().optional()}).strict();
export type PoliticaCobro = z.infer<typeof esquemaPoliticaCobro>;

export function aCentimos(importe: number): number {
  costo.parse(importe);
  return Number(importe.toFixed(2).replace('.', ''));
}
