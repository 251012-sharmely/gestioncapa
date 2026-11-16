import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Boton } from '@/components/ui/Boton'
import { Campo } from '@/components/ui/Campo'
import { Entrada } from '@/components/ui/Entrada'
import { mensajeDeError } from '@/lib/api'
import { pagos,type Pago,type TransferenciaPago,type RevisionTransferencia } from '@/servicios/pagos'
import { ArchivoVoucher } from './ArchivoVoucher'

export function RevisionTransferenciaFormulario({pago,transferencia,alActualizar}:{pago:Pago;transferencia:TransferenciaPago;alActualizar:()=>Promise<void>}) {
  const [verificado,cambiarVerificado]=useState(false)
  const [error,cambiarError]=useState('')
  const revisar=useMutation({mutationFn:(entrada:RevisionTransferencia)=>pagos.revisarTransferencia(pago.id,transferencia.operacionId,entrada),
    onSuccess:alActualizar,onError:alActualizar,
  })
  const terminal=transferencia.estado!=='INICIADO'&&transferencia.estado!=='DECLARADO'
  return <section className="space-y-4 rounded-xl border border-line bg-white p-4 sm:p-5" aria-label={`Transferencia ${transferencia.referencia}`}>
    <h2 className="text-lg font-semibold">Revisar transferencia</h2>
    <dl className="space-y-1 break-all text-sm">
      <div><dt className="font-semibold">Participante</dt><dd>{pago.participanteNombre}</dd></div>
      <div><dt className="font-semibold">Curso e importe completo</dt><dd>{pago.cursoTitulo} · S/ {(pago.importeCentimos/100).toFixed(2)} PEN</dd></div>
      <div><dt className="font-semibold">Destino mostrado al participante</dt><dd>{transferencia.banco} · {transferencia.titular}<br />Cuenta {transferencia.cuenta} · CCI {transferencia.cci}</dd></div>
      <div><dt className="font-semibold">Referencia y fecha declaradas</dt><dd>{transferencia.referencia} · {transferencia.fechaOperacion}</dd></div>
    </dl>
    <ArchivoVoucher pagoId={pago.id} transferencia={transferencia} alActualizar={alActualizar} />
    {terminal ? <p role="status">
      {transferencia.estado==='CONFIRMADO' && 'Abono confirmado.'}
      {transferencia.estado==='RECHAZADO' && `Transferencia rechazada: ${transferencia.motivoRechazo}`}
      {transferencia.estado==='INCIERTO' && 'Requiere conciliación bancaria con el CPPP antes de aplicar cambios.'}
    </p> : <>
      {!pago.exigible && <p role="status">Esta reserva no está vigente. Confirmar conservará el abono para conciliación sin recuperar cupo ni acceso.</p>}
      <form aria-label="Confirmar transferencia" className="space-y-3" onSubmit={e=>{
        e.preventDefault()
        if(!verificado||revisar.isPending) return
        const datos=new FormData(e.currentTarget)
        const importe=String(datos.get('importe')??'')
        if(!/^\d+(?:\.\d{1,2})?$/.test(importe)) {cambiarError('Escribe un importe válido en soles, con hasta dos decimales.');return}
        const [entero,decimal='']=importe.split('.')
        const importeCentimos=Number(entero)*100+Number(decimal.padEnd(2,'0'))
        cambiarError('')
        revisar.mutate({decision:'CONFIRMAR',verificado:true,importeCentimos,moneda:'PEN',
          referencia:String(datos.get('referencia')??'').trim(),fechaOperacion:String(datos.get('fechaOperacion')??'')})
      }}>
        <fieldset disabled={revisar.isPending||transferencia.voucher?.disponible===false} className="space-y-3">
          <Campo etiqueta="Importe abonado (S/)" ayuda="Copia el importe del abono bancario; debe cubrir el importe completo." obligatorio><Entrada name="importe" type="number" min="0.01" max="9999999999.99" step="0.01" required /></Campo>
          <Campo etiqueta="Referencia bancaria verificada" obligatorio><Entrada name="referencia" defaultValue={transferencia.referencia} minLength={3} maxLength={100} required /></Campo>
          <Campo etiqueta="Fecha bancaria verificada" obligatorio><Entrada name="fechaOperacion" type="date" defaultValue={transferencia.fechaOperacion} required /></Campo>
          <label className="flex items-start gap-2 text-sm"><input type="checkbox" required checked={verificado} onChange={e=>cambiarVerificado(e.target.checked)} className="mt-1 size-4" />He verificado el abono real en la cuenta institucional indicada, su importe, moneda, fecha y referencia.</label>
          <Boton type="submit" cargando={revisar.isPending} disabled={!verificado} className="max-w-full whitespace-normal">Confirmar abono bancario</Boton>
        </fieldset>
      </form>
      <form aria-label="Rechazar transferencia" className="space-y-3 border-t border-line pt-4" onSubmit={e=>{
        e.preventDefault()
        if(revisar.isPending) return
        const datos=new FormData(e.currentTarget)
        revisar.mutate({decision:'RECHAZAR',motivo:String(datos.get('motivo')??'').trim()})
      }}>
        <fieldset disabled={revisar.isPending} className="space-y-3">
          <Campo etiqueta="Motivo del rechazo" ayuda="Describe la discrepancia sin incluir datos personales ni claves." obligatorio><Entrada name="motivo" required minLength={5} maxLength={500} /></Campo>
          <Boton type="submit" variante="peligro" cargando={revisar.isPending}>Rechazar transferencia</Boton>
        </fieldset>
      </form>
    </>}
    {(error||revisar.isError) && <p role="alert" className="text-danger">{error||mensajeDeError(revisar.error,'No se pudo guardar la revisión. Consulta el estado antes de reintentar.')}</p>}
  </section>
}
