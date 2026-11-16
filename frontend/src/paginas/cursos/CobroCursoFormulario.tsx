import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Campo } from '@/components/ui/Campo'
import { Entrada, Selector } from '@/components/ui/Entrada'
import { Boton } from '@/components/ui/Boton'
import { mensajeDeError } from '@/lib/api'
import { cursos, type DetalleCurso, type PoliticaCobro } from '@/servicios/cursos'

export function CobroCursoFormulario({ valor, alCambiar, errores = {} }: {
  valor: PoliticaCobro; alCambiar: (valor: PoliticaCobro) => void; errores?: Partial<Record<keyof PoliticaCobro, string>>
}) {
  return <div className="grid gap-4 sm:grid-cols-2">
    <Campo etiqueta="Modalidad de cobro" obligatorio error={errores.modalidadCobro}>
      <Selector value={valor.modalidadCobro} required onChange={e => {
        const modalidadCobro = e.target.value as PoliticaCobro['modalidadCobro']
        alCambiar({ modalidadCobro, costo: modalidadCobro === 'GRATUITO' ? 0 : valor.costo,
          plazoPagoMinutos: modalidadCobro === 'PREVIO' ? valor.plazoPagoMinutos : null })
      }}>
        <option value="" disabled>Selecciona cómo se cobra</option>
        <option value="PREVIO">Pago antes de llevar el curso</option>
        <option value="CERTIFICADO">Pago solo por el certificado</option>
        <option value="GRATUITO">Gratuito</option>
      </Selector>
    </Campo>
    <Campo etiqueta={valor.modalidadCobro === 'CERTIFICADO' ? 'Importe de la constancia (S/)' : 'Costo (S/)'} obligatorio error={errores.costo}>
      <Entrada type="number" inputMode="decimal" min={valor.modalidadCobro === 'GRATUITO' ? 0 : 0.01} max="9999999999.99" step="0.01" required
        disabled={valor.modalidadCobro === 'GRATUITO'} value={Number.isFinite(valor.costo) ? valor.costo : ''}
        onChange={e => alCambiar({ ...valor, costo: e.target.valueAsNumber })} />
    </Campo>
    {valor.modalidadCobro === 'PREVIO' && <Campo etiqueta="Plazo para pagar (minutos)" obligatorio error={errores.plazoPagoMinutos}
      ayuda="Se cuenta desde la inscripción. Al vencer, se cancela la reserva y se libera el cupo.">
      <Entrada type="number" inputMode="numeric" required min="1" max="525600" step="1" value={valor.plazoPagoMinutos ?? ''}
        onChange={e => alCambiar({ ...valor, plazoPagoMinutos: Number.isFinite(e.target.valueAsNumber) ? e.target.valueAsNumber : null })} />
    </Campo>}
  </div>
}

export function EditarCobroCurso({ curso }: { curso: DetalleCurso }) {
  const cache = useQueryClient()
  const [valor, cambiar] = useState<PoliticaCobro>({ modalidadCobro: curso.modalidadCobro ?? '', costo: curso.costo, plazoPagoMinutos: curso.plazoPagoMinutos ?? null })
  const guardar = useMutation({ mutationFn: () => cursos.actualizarCobro(curso.id, { ...valor, versionCobro: curso.versionCobro! }),
    onSuccess: async actualizado => {
      cache.setQueryData(['curso', curso.id], actualizado)
      await cache.invalidateQueries({ queryKey: ['cursos'] })
    } })
  return <form aria-label="Condiciones de cobro" className="rounded-xl border border-line bg-white p-4 sm:p-6" onSubmit={e => { e.preventDefault(); guardar.mutate() }}>
    <h2 className="mb-2 font-serif text-xl font-bold">Condiciones de cobro</h2>
    <p className="mb-4 text-sm text-muted">Los cambios se aplican a nuevas inscripciones. Las personas ya inscritas conservan sus condiciones.</p>
    <fieldset disabled={guardar.isPending || curso.estado === 'CERRADO'}>
      <CobroCursoFormulario valor={valor} alCambiar={cambiar} />
      <Boton type="submit" className="mt-4" disabled={!curso.versionCobro} cargando={guardar.isPending}>Guardar condiciones de cobro</Boton>
    </fieldset>
    {guardar.isError && <p role="alert" className="mt-3 text-danger">{mensajeDeError(guardar.error, 'No pudimos guardar las condiciones.')}</p>}
    {guardar.isSuccess && <p role="status" className="mt-3">Condiciones de cobro guardadas.</p>}
  </form>
}
