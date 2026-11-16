import { expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { PagoCurso } from './PagoCurso'

function mostrar(cambio:object={}) {
  const cache=new QueryClient()
  cache.setQueryData(['pago','123'],{id:'123',cursoId:'10',concepto:'CURSO',importeCentimos:15050,moneda:'PEN',estado:'PENDIENTE',exigible:true,
    operaciones:[],incidencias:[],medios:{izipay:true,culqi:true,efectivo:true,entorno:'sandbox',culqiClavePublica:'pk_test_ejemplo'},...cambio})
  return renderToStaticMarkup(<QueryClientProvider client={cache}><PagoCurso pagoId="123" /></QueryClientProvider>)
}
it('HU53-04/05: muestra importe real y las dos pasarelas sin prometer confirmación por retorno',()=>{
  const html=mostrar()
  expect(html).toContain('150.50');expect(html).toContain('Pagar con Izipay');expect(html).toContain('Pagar con Culqi')
  expect(html).toContain('oficina del CPPP')
})
it('HU53-07: una operación incierta impide ofrecer otro cobro',()=>{
  const html=mostrar({operaciones:[{id:'op',medio:'CULQI',estado:'INCIERTO'}]})
  expect(html).toContain('verificación')
  expect([...html.matchAll(/<button[^>]+disabled[^>]*>/g)].length).toBeGreaterThanOrEqual(2)
})
it('HU53-18: pago confirmado y reserva vencida se muestran sin habilitar nuevos cargos',()=>{
  const pagado=mostrar({estado:'PAGADO'})
  expect(pagado).toContain('Pago confirmado');expect(pagado).not.toContain('Pagar con')
  const vencido=mostrar({exigible:false})
  expect(vencido).toContain('no está vigente');expect(vencido).not.toContain('Pagar con')
})
it('HU53-07: permite recuperar la sesión original Izipay vigente sin iniciar otro cobro',()=>{
  const html=mostrar({operaciones:[{id:'op',medio:'IZIPAY',estado:'INICIADO',clave:'clave-original',sesionRecuperable:true}]})
  expect(html).toContain('Reabrir sesión de Izipay')
})
