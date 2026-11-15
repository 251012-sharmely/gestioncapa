import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Boton } from '@/components/ui/Boton'
import { Cargando, ErrorCarga } from '@/components/ui/Estados'
import { mensajeDeError } from '@/lib/api'
import { pagos } from '@/servicios/pagos'
import { abrirIzipay } from '@/servicios/izipay'
import { abrirCulqi } from '@/servicios/culqi'

export function PagoCurso({pagoId}:{pagoId:string}) {
  const cache=useQueryClient()
  const [error,cambiarError]=useState('')
  const [formularioAbierto,cambiarAbierto]=useState(false)
  const consulta=useQuery({queryKey:['pago',pagoId],queryFn:()=>pagos.obtener(pagoId),
    refetchInterval:query=>query.state.data?.estado==='PENDIENTE'?3000:false})
  const refrescar=async()=>{
    await consulta.refetch()
    await Promise.all(['curso','historial','participante'].map(clave=>cache.invalidateQueries({queryKey:[clave]})))
  }
  useEffect(()=>{
    if (consulta.data?.estado==='PAGADO') void Promise.all(['curso','historial','participante'].map(clave=>cache.invalidateQueries({queryKey:[clave]})))
  },[cache,consulta.data?.estado])
  const iniciar=useMutation({mutationFn:(entrada:Parameters<typeof pagos.iniciar>[1])=>pagos.iniciar(pagoId,entrada),
    onSuccess:async resultado=>{
      await refrescar()
      if (resultado.izipay) await abrirIzipay(resultado.izipay,respuesta=>{
        void pagos.notificarIzipay(respuesta).then(refrescar).catch(()=>{cambiarError('La respuesta requiere verificación. Consulta el estado antes de realizar otro pago.');void refrescar()})
      })
    },
    onError:async fallo=>{cambiarError(mensajeDeError(fallo,'No pudimos completar la operación. Consulta su estado.'));await refrescar()},
  })
  const usarCulqi=async()=>{
    if (!consulta.data?.medios.culqiClavePublica) return
    cambiarError('');cambiarAbierto(true)
    const clave=crypto.randomUUID()
    try {
      await abrirCulqi(consulta.data.medios.culqiClavePublica,consulta.data.importeCentimos,token=>{
        cambiarAbierto(false);iniciar.mutate({medio:'CULQI',clave,token})
      },()=>{cambiarAbierto(false);cambiarError('La pasarela no pudo completar el formulario. Revisa los datos e inténtalo nuevamente.')})
    } catch {cambiarAbierto(false);cambiarError('No pudimos abrir Culqi. Vuelve a consultar el estado antes de pagar.')}
  }
  if (consulta.isPending) return <Cargando texto="Consultando pago…" />
  if (consulta.isError) return <ErrorCarga mensaje={mensajeDeError(consulta.error,'No pudimos consultar el pago.')} onReintentar={consulta.refetch} />
  const pago=consulta.data
  const importe=`S/ ${(pago.importeCentimos/100).toFixed(2)}`
  const enProceso=pago.operaciones.some(op=>op.estado==='INICIADO'||op.estado==='INCIERTO') || pago.incidencias.length>0
  const recuperable=pago.incidencias.length===0 && pago.operaciones.find(op=>op.medio==='IZIPAY' && op.estado==='INICIADO' && op.sesionRecuperable && op.clave)
  const tarjeta='space-y-3 rounded-xl border border-line bg-white p-4 sm:p-6'
  if (pago.estado==='PAGADO') return <section className={tarjeta} aria-label="Estado de pago">
    <h2 className="font-semibold text-brand">Pago confirmado</h2>
    <p>{importe} · Comprobante interno #{pago.id}.</p>
    {pago.incidencias.length>0 && <p role="status">El CPPP debe revisar este pago antes de aplicar cambios a tu reserva.</p>}
  </section>
  if (!pago.exigible) return <section className={tarjeta} aria-label="Estado de pago">
    <h2 className="font-semibold">Reserva no vigente</h2>
    <p>Esta reserva no está vigente. Revisa el curso y sus cupos antes de solicitar una nueva inscripción.</p>
  </section>
  return <section className={tarjeta} aria-label="Pago del curso">
    <h2 className="font-semibold">{pago.concepto==='CONSTANCIA'?'Pago de la constancia':'Pago antes de llevar el curso'}</h2>
    <p className="text-xl font-semibold">{importe}</p>
    <p className="text-sm text-muted">Referencia de pago #{pago.id}. La confirmación aparecerá aquí después de verificarla.</p>
    {enProceso && <p role="status">Tu operación está en verificación. Consulta su estado antes de realizar otro pago.</p>}
    <div className="flex flex-wrap gap-3">
      <Boton disabled={enProceso||iniciar.isPending||formularioAbierto||!pago.medios.izipay} onClick={()=>{cambiarError('');iniciar.mutate({medio:'IZIPAY',clave:crypto.randomUUID()})}}>Pagar con Izipay</Boton>
      <Boton disabled={enProceso||iniciar.isPending||formularioAbierto||!pago.medios.culqi} onClick={()=>void usarCulqi()}>Pagar con Culqi</Boton>
      <Boton variante="secundario" onClick={()=>void refrescar()}>Consultar estado</Boton>
      {recuperable && <Boton variante="secundario" disabled={iniciar.isPending||formularioAbierto} onClick={()=>iniciar.mutate({medio:'IZIPAY',clave:recuperable.clave!})}>Reabrir sesión de Izipay</Boton>}
    </div>
    {formularioAbierto && <Boton variante="secundario" onClick={()=>cambiarAbierto(false)}>Cerré el formulario</Boton>}
    {!pago.medios.izipay && !pago.medios.culqi && <p className="text-sm text-muted">Los pagos en línea aún no están disponibles.</p>}
    <p className="text-sm">También puedes pagar en la oficina del CPPP. Indica la referencia #{pago.id}; el administrador registrará la recepción.</p>
    {error && <p role="alert" className="text-danger">{error}</p>}
  </section>
}
