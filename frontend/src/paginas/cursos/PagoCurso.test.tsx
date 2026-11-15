import { expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { PagoCurso } from './PagoCurso'

function mostrar(cambio:object={}) {
  const cache=new QueryClient()
  cache.setQueryData(['pago','123'],{id:'123',cursoId:'10',concepto:'CURSO',importeCentimos:15050,moneda:'PEN',estado:'PENDIENTE',exigible:true,
    operaciones:[],incidencias:[],transferencias:[],destinoTransferencia:{id:'destino',banco:'Banco de prueba',titular:'Entidad de prueba',cuenta:'1234567890',cci:'00212345678901234567'},
    medios:{izipay:true,culqi:true,efectivo:true,transferencia:true,entorno:'sandbox'},...cambio})
  return renderToStaticMarkup(<QueryClientProvider client={cache}><PagoCurso pagoId="123" /></QueryClientProvider>)
}
it('T25-I01: muestra importe real e Izipay elegida sin ofrecer nuevos cargos Culqi',()=>{
  const html=mostrar()
  expect(html).toContain('150.50');expect(html).toContain('Pagar con Izipay');expect(html).not.toContain('Pagar con Culqi')
  expect(html).toContain('oficina del CPPP')
})
it('HU53-07: una operación incierta impide ofrecer otro cobro',()=>{
  const html=mostrar({operaciones:[{id:'op',medio:'CULQI',estado:'INCIERTO'}]})
  expect(html).toContain('verificación')
  expect(html).toMatch(/<button[^>]+disabled[^>]*>Pagar con Izipay/)
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
it('T25-I02/03: ofrece destino institucional y declaración sin prometer confirmación inmediata',()=>{
  const html=mostrar()
  expect(html).toContain('Banco de prueba');expect(html).toContain('00212345678901234567')
  expect(html).toContain('Referencia de la transferencia');expect(html).toContain('Fecha de la operación bancaria')
  expect(html).toContain('Declarar transferencia');expect(html).toContain('no confirma el pago')
})
it('T25-I06: conserva visible el rechazo y permite declarar una nueva transferencia',()=>{
  const html=mostrar({transferencias:[{operacionId:'op',estado:'RECHAZADO',referencia:'ABONO-1',fechaOperacion:'2026-01-01',motivoRechazo:'No se encontró el abono.'}]})
  expect(html).toContain('No se encontró el abono.');expect(html).toContain('Declarar transferencia')
})
it('T25-I04: no reabre sesión de Izipay después de declarar un abono bancario',()=>{
  const html=mostrar({operaciones:[{id:'online',medio:'IZIPAY',estado:'INICIADO',clave:'clave',sesionRecuperable:true},
    {id:'banco',medio:'TRANSFERENCIA',estado:'DECLARADO'}]})
  expect(html).not.toContain('Reabrir sesión de Izipay')
})
it('T25-I08: una transferencia incierta se muestra para conciliación, sin anunciarla confirmada',()=>{
  const html=mostrar({operaciones:[{id:'banco',medio:'TRANSFERENCIA',estado:'INCIERTO'}],
    transferencias:[{operacionId:'banco',estado:'INCIERTO',referencia:'ABONO-1',fechaOperacion:'2026-01-01',motivoRechazo:null}]})
  expect(html).toContain('Requiere conciliación');expect(html).not.toContain('· Confirmada')
})
