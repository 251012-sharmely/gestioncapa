import { useState } from 'react'
import { Boton } from '@/components/ui/Boton'
import { Campo } from '@/components/ui/Campo'
import { Entrada } from '@/components/ui/Entrada'
import type { Pago,RecepcionEfectivo } from '@/servicios/pagos'

export function RegistroEfectivoFormulario({pago,ocupado,alRegistrar}:{pago:Pago;ocupado:boolean;alRegistrar:(entrada:RecepcionEfectivo)=>void}) {
  const [confirmado,cambiarConfirmado]=useState(false)
  const [error,cambiarError]=useState('')
  const enProceso=pago.operaciones.some(op=>['INICIADO','INCIERTO','DECLARADO'].includes(op.estado))
  return <form className="space-y-4 rounded-xl border border-line bg-white p-5" onSubmit={e=>{
    e.preventDefault()
    const datos=new FormData(e.currentTarget)
    if (!confirmado||ocupado||enProceso) return
    const importe=String(datos.get('importe')??'')
    if(!/^\d+(?:\.\d{1,2})?$/.test(importe)) {cambiarError('Escribe un importe válido con hasta dos decimales.');return}
    const [entero,decimal='']=importe.split('.')
    const importeCentimos=Number(entero)*100+Number(decimal.padEnd(2,'0'))
    if(importeCentimos!==pago.importeCentimos) {cambiarError('El importe recibido debe coincidir con el importe completo de la orden.');return}
    cambiarError('')
    alRegistrar({referencia:String(datos.get('referencia')??'').trim(),importeCentimos,fechaRecepcion:String(datos.get('fechaRecepcion')??'')})
  }}>
    <h2 className="text-lg font-semibold">Registrar efectivo</h2>
    <dl className="space-y-2 text-sm">
      <div><dt className="font-semibold">Participante</dt><dd>{pago.participanteNombre}</dd></div>
      <div><dt className="font-semibold">Curso</dt><dd>{pago.cursoTitulo}</dd></div>
      <div><dt className="font-semibold">Importe completo</dt><dd>S/ {(pago.importeCentimos/100).toFixed(2)} PEN</dd></div>
    </dl>
    {enProceso && <p role="status">Debes conciliar o revisar la operación pendiente antes de registrar efectivo.</p>}
    {!pago.exigible && pago.estado!=='PAGADO' && <p role="status">La reserva no está vigente. Registrar la recepción conservará el pago para revisión y no recuperará el cupo.</p>}
    <fieldset disabled={ocupado||enProceso||pago.estado==='PAGADO'} className="space-y-4">
      <Campo etiqueta="Referencia del recibo interno" obligatorio>
        <Entrada name="referencia" required minLength={3} maxLength={100} autoComplete="off" />
      </Campo>
      <Campo etiqueta="Importe recibido (S/)" obligatorio><Entrada name="importe" type="number" min="0.01" max="9999999999.99" step="0.01" required /></Campo>
      <Campo etiqueta="Fecha de recepción" obligatorio><Entrada name="fechaRecepcion" type="date" required /></Campo>
      <label className="flex items-start gap-2 text-sm">
        <input type="checkbox" required checked={confirmado} onChange={e=>cambiarConfirmado(e.target.checked)} className="mt-1 size-4" />
        He recibido el importe completo en efectivo y verifiqué el participante y el curso.
      </label>
      <Boton type="submit" cargando={ocupado} disabled={!confirmado}>Registrar recepción de efectivo</Boton>
    </fieldset>
    {error&&<p role="alert" className="text-danger">{error}</p>}
  </form>
}
