import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { CobroCursoFormulario } from './CobroCursoFormulario'

describe('HU53-01 formulario de cobro', () => {
  it('ofrece las tres modalidades y pide plazo solo para pago previo', () => {
    const html = renderToStaticMarkup(<CobroCursoFormulario valor={{ modalidadCobro: 'PREVIO', costo: 150, plazoPagoMinutos: 60 }} alCambiar={() => {}} />)
    expect(html).toContain('Pago antes de llevar el curso')
    expect(html).toContain('Pago solo por el certificado')
    expect(html).toContain('Gratuito')
    expect(html).toContain('Plazo para pagar (minutos)')
    expect(html).toContain('desde la inscripción')
  })
  it('explica qué se paga sin pedir plazo para constancia o gratuito', () => {
    const html = renderToStaticMarkup(<CobroCursoFormulario valor={{ modalidadCobro: 'CERTIFICADO', costo: 30, plazoPagoMinutos: null }} alCambiar={() => {}} />)
    expect(html).toContain('Importe de la constancia')
    expect(html).not.toContain('Plazo para pagar (minutos)')
    const gratis = renderToStaticMarkup(<CobroCursoFormulario valor={{ modalidadCobro: 'GRATUITO', costo: 0, plazoPagoMinutos: null }} alCambiar={() => {}} />)
    expect(gratis).toContain('disabled')
  })
})
