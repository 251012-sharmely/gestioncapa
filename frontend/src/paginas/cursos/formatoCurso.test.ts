import { expect, it } from 'vitest'
import { condicionesCobro } from './formatoCurso'

it('HU53-03: diferencia el precio de cursar y el de la constancia', () => {
  expect(condicionesCobro({ costo: 30, modalidadCobro: 'CERTIFICADO', plazoPagoMinutos: null })).toContain('Constancia: S/ 30.00')
  expect(condicionesCobro({ costo: 30, modalidadCobro: 'CERTIFICADO', plazoPagoMinutos: null })).toContain('Curso sin cobro')
  expect(condicionesCobro({ costo: 150, modalidadCobro: 'PREVIO', plazoPagoMinutos: 60 })).toContain('60 minutos')
  expect(condicionesCobro({ costo: 0, modalidadCobro: 'GRATUITO', plazoPagoMinutos: null })).toContain('constancia sin cobro')
  expect(condicionesCobro({ costo: 30, modalidadCobro: null, plazoPagoMinutos: null })).toContain('por configurar')
})
