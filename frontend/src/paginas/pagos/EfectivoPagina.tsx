import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import { Campo } from '@/components/ui/Campo'
import { Entrada, Selector } from '@/components/ui/Entrada'
import { Boton } from '@/components/ui/Boton'
import { Cargando, ErrorCarga } from '@/components/ui/Estados'
import { mensajeDeError } from '@/lib/api'
import { pagos,pagoNecesitaActualizacion,type RecepcionEfectivo } from '@/servicios/pagos'
import { EstadoCorreosPago } from './ArchivoVoucher'
import { RegistroEfectivoFormulario } from './RegistroEfectivoFormulario'
import { RevisionTransferenciaFormulario } from './RevisionTransferenciaFormulario'

export function EfectivoPagina() {
  const [parametros,cambiarParametros]=useSearchParams()
  const seleccion=parametros.get('pago')??''
  const valido=/^[1-9]\d{0,14}$/.test(seleccion)
  const cache=useQueryClient()
  const [operacionId,cambiarOperacion]=useState('')
  const consulta=useQuery({queryKey:['pago',seleccion],queryFn:()=>pagos.obtener(seleccion),enabled:valido,
    refetchInterval:query=>query.state.data&&pagoNecesitaActualizacion(query.state.data)?3000:false})
  const operacionesExternas=consulta.data?.operaciones.filter(op=>op.medio==='IZIPAY'||op.medio==='CULQI')??[]
  const primeraOperacion=operacionesExternas[0]?.id??''
  const actualizar=async()=>{
    await Promise.all([cache.invalidateQueries({queryKey:['pago']}),cache.invalidateQueries({queryKey:['curso']}),cache.invalidateQueries({queryKey:['historial']})])
  }
  const registrar=useMutation({mutationFn:(entrada:RecepcionEfectivo)=>pagos.efectivo(seleccion,entrada),onSuccess:actualizar})
  const conciliar=useMutation({mutationFn:(referencia:string)=>pagos.conciliar(seleccion,operacionId||primeraOperacion,referencia||undefined),onSuccess:actualizar})
  return <div className="mx-auto max-w-200 space-y-5 px-4 py-8">
    <h1 className="text-2xl font-bold">Gestión de pagos</h1>
    <p className="text-sm text-muted">Consulta la referencia del participante para registrar efectivo, revisar una transferencia o verificar una operación con la pasarela.</p>
    <form className="flex flex-wrap items-end gap-3" onSubmit={e=>{
      e.preventDefault();const datos=new FormData(e.currentTarget);cambiarOperacion('')
      cambiarParametros({pago:String(datos.get('pago')??'').trim()})
    }}>
      <Campo etiqueta="Referencia de pago" obligatorio><Entrada name="pago" type="number" min="1" step="1" required defaultValue={seleccion} /></Campo>
      <Boton type="submit">Consultar pago</Boton>
    </form>
    {valido && consulta.isPending && <Cargando texto="Consultando obligación…" />}
    {valido && consulta.isError && <ErrorCarga mensaje={mensajeDeError(consulta.error,'No pudimos consultar esta referencia.')} onReintentar={consulta.refetch} />}
    {consulta.data && <>
      {consulta.data.estado==='PAGADO' && <p role="status" className="rounded-lg bg-brand-soft p-3">Pago confirmado · Comprobante interno #{consulta.data.id}.</p>}
      <EstadoCorreosPago notificaciones={consulta.data.notificaciones} />
      <RegistroEfectivoFormulario key={seleccion} pago={consulta.data} ocupado={registrar.isPending} alRegistrar={referencia=>registrar.mutate(referencia)} />
      {registrar.isError && <p role="alert" className="text-danger">{mensajeDeError(registrar.error,'No pudimos registrar la recepción.')}</p>}
      {consulta.data.transferencias.map(transferencia=><RevisionTransferenciaFormulario key={transferencia.operacionId} pago={consulta.data} transferencia={transferencia} alActualizar={actualizar} />)}
      {consulta.data.incidencias.length>0 && <section className="rounded-lg border border-line p-4">
        <h2 className="font-semibold">Incidencias para revisión</h2>
        <ul className="break-all">{consulta.data.incidencias.map((incidencia,i)=><li key={i}>{incidencia.motivo} · Referencia {incidencia.referencia}</li>)}</ul>
        <p className="mt-2 text-sm">Verifica la recepción y acuerda la solución con el CPPP. Este registro no ejecuta devoluciones automáticas.</p>
      </section>}
      {operacionesExternas.length>0 && <form className="space-y-3 rounded-xl border border-line p-5" onSubmit={e=>{
        e.preventDefault();const datos=new FormData(e.currentTarget);conciliar.mutate(String(datos.get('referencia')??'').trim())
      }}>
        <h2 className="font-semibold">Verificar con la pasarela</h2>
        <Campo etiqueta="Operación"><Selector value={operacionId||primeraOperacion} onChange={e=>cambiarOperacion(e.target.value)}>
          {operacionesExternas.map(op=><option key={op.id} value={op.id}>{op.medio} · {op.estado} · {op.id.slice(-8)}</option>)}
        </Selector></Campo>
        <Campo etiqueta="Referencia del cargo de Culqi" ayuda="Solo Culqi: consulta el identificador chr_ en su panel. Izipay se verifica con su referencia registrada.">
          <Entrada name="referencia" maxLength={100} autoComplete="off" />
        </Campo>
        <Boton type="submit" cargando={conciliar.isPending}>Verificar operación</Boton>
        {conciliar.isError && <p role="alert" className="text-danger">{mensajeDeError(conciliar.error,'No se pudo verificar la operación.')}</p>}
      </form>}
    </>}
  </div>
}
