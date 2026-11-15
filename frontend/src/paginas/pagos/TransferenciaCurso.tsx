import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Boton } from '@/components/ui/Boton'
import { Campo } from '@/components/ui/Campo'
import { Entrada } from '@/components/ui/Entrada'
import { mensajeDeError } from '@/lib/api'
import { pagos,type Pago } from '@/servicios/pagos'

const estadosTransferencia={INICIADO:'Pendiente de revisión',DECLARADO:'Pendiente de revisión',INCIERTO:'Requiere conciliación',RECHAZADO:'Rechazada',CONFIRMADO:'Confirmada'}

export function TransferenciaCurso({pago,alActualizar}:{pago:Pago;alActualizar:()=>Promise<void>}) {
  // Conserva el destino que vio la persona aunque cambie durante el formulario.
  const [destino]=useState(pago.destinoTransferencia)
  const [clave,cambiarClave]=useState(()=>crypto.randomUUID())
  const [confirmado,cambiarConfirmado]=useState(false)
  const declarar=useMutation({mutationFn:(entrada:Parameters<typeof pagos.declararTransferencia>[1])=>pagos.declararTransferencia(pago.id,entrada),
    onSuccess:async()=>{cambiarClave(crypto.randomUUID());cambiarConfirmado(false);await alActualizar()},
    onError:async()=>{await alActualizar()},
  })
  const bloqueado=pago.operaciones.some(op=>op.medio==='TRANSFERENCIA'&&['INICIADO','INCIERTO','DECLARADO'].includes(op.estado))
  const soloDeclaracion=pago.estado==='PAGADO'||!pago.exigible||!pago.medios.transferencia||pago.operaciones.some(op=>op.medio!=='TRANSFERENCIA'&&['INICIADO','INCIERTO'].includes(op.estado))||pago.incidencias.length>0
  return <div className="space-y-3">
    {pago.transferencias.map(transferencia=><div key={transferencia.operacionId} className="break-all rounded-lg bg-surface-2 p-3 text-sm" role="status">
      <p className="font-semibold">Transferencia {transferencia.referencia} · {estadosTransferencia[transferencia.estado]}</p>
      {transferencia.motivoRechazo && <p>{transferencia.motivoRechazo}</p>}
    </div>)}
    {destino && !bloqueado && <form aria-label="Declarar transferencia bancaria" className="space-y-4 rounded-xl border border-line p-4" onSubmit={e=>{
      e.preventDefault()
      if(!confirmado||declarar.isPending) return
      const datos=new FormData(e.currentTarget)
      declarar.mutate({destinoId:destino.id,clave,referencia:String(datos.get('referencia')??'').trim(),fechaOperacion:String(datos.get('fechaOperacion')??'')})
    }}>
      <h3 className="font-semibold">Transferencia bancaria</h3>
      {soloDeclaracion && <p role="status">No realices otro pago. Este formulario permite conservar únicamente un abono bancario ya realizado para revisión del CPPP.</p>}
      {!pago.exigible && <p role="status">La reserva venció. Declara únicamente un abono ya realizado; registrarlo no recupera el cupo ni el acceso.</p>}
      <dl className="space-y-1 break-all text-sm">
        <div><dt className="font-semibold">Banco</dt><dd>{destino.banco}</dd></div>
        <div><dt className="font-semibold">Titular institucional</dt><dd>{destino.titular}</dd></div>
        <div><dt className="font-semibold">Cuenta en soles</dt><dd>{destino.cuenta}</dd></div>
        <div><dt className="font-semibold">CCI</dt><dd>{destino.cci}</dd></div>
      </dl>
      <p className="text-sm">Importe completo: S/ {(pago.importeCentimos/100).toFixed(2)} PEN. Declarar la transferencia no confirma el pago: el CPPP debe verificar el abono.</p>
      <fieldset disabled={declarar.isPending} className="space-y-4">
        <Campo etiqueta="Referencia de la transferencia" obligatorio><Entrada name="referencia" required minLength={3} maxLength={100} autoComplete="off" /></Campo>
        <Campo etiqueta="Fecha de la operación bancaria" obligatorio><Entrada name="fechaOperacion" type="date" required /></Campo>
        <label className="flex items-start gap-2 text-sm"><input type="checkbox" required checked={confirmado} onChange={e=>cambiarConfirmado(e.target.checked)} className="mt-1 size-4" />Ya realicé la transferencia al destino indicado y solicito verificarla.</label>
        <Boton type="submit" cargando={declarar.isPending} disabled={!confirmado}>Declarar transferencia</Boton>
      </fieldset>
    </form>}
    {declarar.isError && <p role="alert" className="text-danger">{mensajeDeError(declarar.error,'No pudimos registrar la declaración. Consulta su estado antes de reintentar.')}</p>}
  </div>
}
