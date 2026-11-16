import { expect,it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { RegistroEfectivoFormulario } from './RegistroEfectivoFormulario'
import type { Pago } from '@/servicios/pagos'

const pago:Pago={id:'123',cursoId:'1',concepto:'CURSO',importeCentimos:15050,moneda:'PEN',estado:'PENDIENTE',cursoTitulo:'Curso HU53',participanteNombre:'Participante de prueba',
  exigible:true,operaciones:[],incidencias:[],medios:{izipay:false,culqi:false,efectivo:true,entorno:'sandbox'}}
it('HU53-06: muestra titular, importe exacto y confirmación explícita de recepción',()=>{
  const html=renderToStaticMarkup(<RegistroEfectivoFormulario pago={pago} ocupado={false} alRegistrar={async()=>{}} />)
  expect(html).toContain('Participante de prueba');expect(html).toContain('150.50');expect(html).toContain('He recibido el importe completo')
  expect(html).toContain('Referencia del recibo interno');expect(html).toContain('checkbox')
})
it('HU53-07: bloquea efectivo mientras exista una operación externa incierta',()=>{
  const html=renderToStaticMarkup(<RegistroEfectivoFormulario pago={{...pago,operaciones:[{id:'op',medio:'CULQI',estado:'INCIERTO',referenciaExterna:null}]}} ocupado={false} alRegistrar={async()=>{}} />)
  expect(html).toContain('disabled');expect(html).toContain('conciliar')
})
