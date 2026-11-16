import { expect,it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { RegistroEfectivoFormulario } from './RegistroEfectivoFormulario'
import type { Pago } from '@/servicios/pagos'
import { EfectivoPagina } from './EfectivoPagina'
import { QueryClient,QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'

const pago:Pago={id:'123',cursoId:'1',concepto:'CURSO',importeCentimos:15050,moneda:'PEN',estado:'PENDIENTE',cursoTitulo:'Curso HU53',participanteNombre:'Participante de prueba',
  exigible:true,operaciones:[],incidencias:[],transferencias:[],destinoTransferencia:null,medios:{izipay:false,culqi:false,efectivo:true,transferencia:false,entorno:'sandbox'}}
it('HU53-06: muestra titular, importe exacto y confirmación explícita de recepción',()=>{
  const html=renderToStaticMarkup(<RegistroEfectivoFormulario pago={pago} ocupado={false} alRegistrar={async()=>{}} />)
  expect(html).toContain('Participante de prueba');expect(html).toContain('150.50');expect(html).toContain('He recibido el importe completo')
  expect(html).toContain('Referencia del recibo interno');expect(html).toContain('checkbox')
  expect(html).toContain('Importe recibido (S/)');expect(html).toContain('Fecha de recepción')
})
it('HU53-07: bloquea efectivo mientras exista una operación externa incierta',()=>{
  const html=renderToStaticMarkup(<RegistroEfectivoFormulario pago={{...pago,operaciones:[{id:'op',medio:'CULQI',estado:'INCIERTO',referenciaExterna:null}]}} ocupado={false} alRegistrar={async()=>{}} />)
  expect(html).toContain('disabled');expect(html).toContain('conciliar')
})
it('T25-I05/06: permite revisar el abono con confirmación explícita y rechazo motivado',()=>{
  const cache=new QueryClient()
  cache.setQueryData(['pago','123'],{...pago,operaciones:[{id:'op',medio:'TRANSFERENCIA',estado:'INICIADO'}],transferencias:[{
    operacionId:'op',referencia:'BANCO-123',fechaOperacion:'2026-01-01',estado:'INICIADO',motivoRechazo:null,
    banco:'Banco de prueba',titular:'Entidad de prueba',cuenta:'1234567890',cci:'00212345678901234567',
  }]})
  const html=renderToStaticMarkup(<QueryClientProvider client={cache}><MemoryRouter initialEntries={['/admin/pagos?pago=123']}><EfectivoPagina /></MemoryRouter></QueryClientProvider>)
  expect(html).toContain('Revisar transferencia');expect(html).toContain('Banco de prueba');expect(html).toContain('150.50')
  expect(html).toContain('He verificado el abono real');expect(html).toContain('Confirmar abono bancario')
  expect(html).toContain('Motivo del rechazo');expect(html).not.toContain('Verificar con la pasarela')
})
