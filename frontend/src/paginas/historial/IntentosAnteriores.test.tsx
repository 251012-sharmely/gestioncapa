import { expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { IntentosAnteriores } from './IntentosAnteriores'

const anteriores=[{intentoId:'anterior',estado:'CANCELADA',modalidadCobro:'PREVIO',importeCentimos:4500,inscritoEn:'2026-11-14T15:00:00Z',venceEn:'2026-11-14T16:00:00Z',pagoId:'123',estadoFinanciero:'PAGADO'}]
it('HU53-18: conserva condiciones anteriores y permite consultar su pago',()=>{
  const html=renderToStaticMarkup(<MemoryRouter><IntentosAnteriores intentos={anteriores} /></MemoryRouter>)
  expect(html).toContain('Inscripciones anteriores')
  expect(html).toContain('45.00');expect(html).toContain('Reserva cancelada')
  expect(html).toContain('Pago confirmado');expect(html).toContain('Consultar pago #123')
})
it('HU53-18: administración consulta la referencia por su ruta protegida',()=>{
  const html=renderToStaticMarkup(<MemoryRouter><IntentosAnteriores intentos={anteriores} administrador /></MemoryRouter>)
  expect(html).toContain('/admin/pagos?pago=123')
})
it('HU53-18: un intento sin obligación no monta una consulta de pago',()=>{
  const html=renderToStaticMarkup(<MemoryRouter><IntentosAnteriores intentos={[{...anteriores[0]!,pagoId:null}]} /></MemoryRouter>)
  expect(html).not.toContain('Consultar pago #')
})
