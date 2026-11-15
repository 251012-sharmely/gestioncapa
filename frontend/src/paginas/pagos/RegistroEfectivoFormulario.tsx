import { useState } from 'react'
import { Boton } from '@/components/ui/Boton'
import { Campo } from '@/components/ui/Campo'
import { Entrada } from '@/components/ui/Entrada'
import type { Pago } from '@/servicios/pagos'

export function RegistroEfectivoFormulario({pago,ocupado,alRegistrar}:{pago:Pago;ocupado:boolean;alRegistrar:(referencia:string)=>void}) {
  const [confirmado,cambiarConfirmado]=useState(false)
  const enProceso=pago.operaciones.some(op=>op.estado==='INICIADO'||op.estado==='INCIERTO')
  return <form className="space-y-4 rounded-xl border border-line bg-white p-5" onSubmit={e=>{
    e.preventDefault()
    const datos=new FormData(e.currentTarget)
    if (confirmado) void alRegistrar(String(datos.get('referencia')??'').trim())
  }}>
    <h2 className="text-lg font-semibold">Registrar efectivo</h2>
    <dl className="space-y-2 text-sm">
      <div><dt className="font-semibold">Participante</dt><dd>{pago.participanteNombre}</dd></div>
      <div><dt className="font-semibold">Curso</dt><dd>{pago.cursoTitulo}</dd></div>
      <div><dt className="font-semibold">Importe completo</dt><dd>S/ {(pago.importeCentimos/100).toFixed(2)} PEN</dd></div>
    </dl>
    {enProceso && <p role="status">Debes conciliar la operación de la pasarela antes de registrar efectivo.</p>}
    {!pago.exigible && pago.estado!=='PAGADO' && <p role="status">La reserva no está vigente. Registrar la recepción conservará el pago para revisión y no recuperará el cupo.</p>}
    <fieldset disabled={ocupado||enProceso||pago.estado==='PAGADO'} className="space-y-4">
      <Campo etiqueta="Referencia del recibo interno" obligatorio>
        <Entrada name="referencia" required minLength={3} maxLength={100} autoComplete="off" />
      </Campo>
      <label className="flex items-start gap-2 text-sm">
        <input type="checkbox" required checked={confirmado} onChange={e=>cambiarConfirmado(e.target.checked)} className="mt-1 size-4" />
        He recibido el importe completo en efectivo y verifiqué el participante y el curso.
      </label>
      <Boton type="submit" cargando={ocupado} disabled={!confirmado}>Registrar recepción de efectivo</Boton>
    </fieldset>
  </form>
}
