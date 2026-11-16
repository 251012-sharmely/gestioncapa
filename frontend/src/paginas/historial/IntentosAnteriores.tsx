import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { IntentoAnterior } from '@/servicios/historial'
import { Boton } from '@/components/ui/Boton'
import { fechaCorta } from '@/lib/formato'
import { PagoCurso } from '../cursos/PagoCurso'

export function IntentosAnteriores({intentos=[],administrador=false}:{intentos?:IntentoAnterior[];administrador?:boolean}) {
  const [pagoVisible,cambiarPago]=useState<string|null>(null)
  if (!intentos.length) return null
  return <details className="rounded-lg border border-line p-3 text-sm">
    <summary className="cursor-pointer font-semibold">Inscripciones anteriores ({intentos.length})</summary>
    <ul className="mt-3 space-y-4">{intentos.map(intento=><li key={intento.intentoId} className="space-y-2">
      <p>{fechaCorta(intento.inscritoEn)} · {intento.estado==='CANCELADA'?'Reserva cancelada':intento.estado==='TERMINADO'?'Terminada':'Inscripción anterior'}</p>
      <p>{intento.modalidadCobro==='PREVIO'?'Pago previo':intento.modalidadCobro==='CERTIFICADO'?'Pago por constancia':'Gratuito'} · S/ {(intento.importeCentimos/100).toFixed(2)}</p>
      {intento.venceEn && <p>Plazo de pago: {new Date(intento.venceEn).toLocaleString('es-PE',{timeZone:'America/Lima'})} (Lima).</p>}
      <p>{intento.estadoFinanciero==='PAGADO'?'Pago confirmado; consulta su aplicación a esta reserva.':intento.estadoFinanciero==='VENCIDO'?'Plazo vencido; no requiere un nuevo cobro de esta reserva.':'Consulta el estado de este intento.'}</p>
      {intento.pagoId && (administrador
        ? <Link to={`/admin/pagos?pago=${intento.pagoId}`} className="font-semibold text-brand underline">Consultar pago #{intento.pagoId}</Link>
        : <Boton variante="secundario" onClick={()=>cambiarPago(pagoVisible===intento.pagoId?null:intento.pagoId)}>Consultar pago #{intento.pagoId}</Boton>)}
      {pagoVisible && intento.pagoId===pagoVisible && <PagoCurso pagoId={pagoVisible} />}
    </li>)}</ul>
  </details>
}
