import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Boton } from '@/components/ui/Boton'
import { Cargando, ErrorCarga } from '@/components/ui/Estados'
import { mensajeDeError } from '@/lib/api'
import { pagos,pagoNecesitaActualizacion } from '@/servicios/pagos'
import { abrirIzipay } from '@/servicios/izipay'
import { TransferenciaCurso } from '../pagos/TransferenciaCurso'
import { EstadoCorreosPago } from '../pagos/ArchivoVoucher'

export function PagoCurso({pagoId}:{pagoId:string}) {
  const cache=useQueryClient()
  const [error,cambiarError]=useState('')
  const consulta=useQuery({queryKey:['pago',pagoId],queryFn:()=>pagos.obtener(pagoId),
    refetchInterval:query=>query.state.data&&pagoNecesitaActualizacion(query.state.data)?3000:false})
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
  if (consulta.isPending) return <Cargando texto="Consultando pago…" />
  if (consulta.isError) return <ErrorCarga mensaje={mensajeDeError(consulta.error,'No pudimos consultar el pago.')} onReintentar={consulta.refetch} />
  const pago=consulta.data
  const importe=`S/ ${(pago.importeCentimos/100).toFixed(2)}`
  const enProceso=pago.operaciones.some(op=>['INICIADO','INCIERTO','DECLARADO'].includes(op.estado)) || pago.incidencias.length>0
  const transferenciaPendiente=pago.operaciones.some(op=>op.medio==='TRANSFERENCIA'&&['INICIADO','INCIERTO','DECLARADO'].includes(op.estado))
  const recuperable=pago.incidencias.length===0 && !transferenciaPendiente && pago.operaciones.find(op=>op.medio==='IZIPAY' && op.estado==='INICIADO' && op.sesionRecuperable && op.clave)
  const tarjeta='space-y-3 rounded-xl border border-line bg-white p-4 sm:p-6'
  if (pago.estado==='PAGADO') return <section className={tarjeta} aria-label="Estado de pago">
    <h2 className="font-semibold text-brand">Pago confirmado</h2>
    <p>{importe} · Comprobante interno #{pago.id}.</p>
    <EstadoCorreosPago notificaciones={pago.notificaciones} />
    {pago.incidencias.length>0 && <p role="status">El CPPP debe revisar este pago antes de aplicar cambios a tu reserva.</p>}
    {pago.destinoTransferencia && <details open={pago.transferencias.some(transferencia=>transferencia.estado==='DECLARADO')}>
      <summary className="cursor-pointer text-sm font-semibold">Consultar transferencias o declarar un abono ya realizado</summary>
      <TransferenciaCurso key={pago.id} pago={pago} alActualizar={refrescar} />
    </details>}
  </section>
  if (!pago.exigible) return <section className={tarjeta} aria-label="Estado de pago">
    <h2 className="font-semibold">Reserva no vigente</h2>
    <p>Esta reserva no está vigente. Revisa el curso y sus cupos antes de solicitar una nueva inscripción.</p>
    <EstadoCorreosPago notificaciones={pago.notificaciones} />
    <TransferenciaCurso key={pago.id} pago={pago} alActualizar={refrescar} />
  </section>
  return <section className={tarjeta} aria-label="Pago del curso">
    <h2 className="font-semibold">{pago.concepto==='CONSTANCIA'?'Pago de la constancia':'Pago antes de llevar el curso'}</h2>
    <p className="text-xl font-semibold">{importe}</p>
    <p className="text-sm text-muted">Referencia de pago #{pago.id}. La confirmación aparecerá aquí después de verificarla.</p>
    {enProceso && <p role="status">Tu operación está en verificación. Consulta su estado antes de realizar otro pago.</p>}
    <div className="flex flex-wrap gap-3">
      <Boton disabled={enProceso||iniciar.isPending||!pago.medios.izipay} onClick={()=>{cambiarError('');iniciar.mutate({medio:'IZIPAY',clave:crypto.randomUUID()})}}>Pagar con Izipay</Boton>
      <Boton variante="secundario" onClick={()=>void refrescar()}>Consultar estado</Boton>
      {recuperable && <Boton variante="secundario" disabled={iniciar.isPending} onClick={()=>iniciar.mutate({medio:'IZIPAY',clave:recuperable.clave!})}>Reabrir sesión de Izipay</Boton>}
    </div>
    {!pago.medios.izipay && <p className="text-sm text-muted">Los pagos en línea aún no están disponibles.</p>}
    <p className="text-sm">También puedes pagar en la oficina del CPPP. Indica la referencia #{pago.id}; el administrador registrará la recepción.</p>
    <TransferenciaCurso key={pago.id} pago={pago} alActualizar={refrescar} />
    {error && <p role="alert" className="text-danger">{error}</p>}
    <EstadoCorreosPago notificaciones={pago.notificaciones} />
  </section>
}
