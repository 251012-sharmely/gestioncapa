import { expect, it } from 'vitest'
import type { Historial } from '@/servicios/historial'
import { queTeFalta } from './progreso'
import { intervaloEntrega } from '@/servicios/historial'

it('HU53-18: reserva cancelada no se presenta como curso en progreso',()=>{
  const curso:Historial['cursos'][number]={id:'1',titulo:'Curso de prueba',horasLectivas:24,modalidad:'PRESENCIAL',inscritoEn:'2026-11-15T10:00:00Z',terminadoEn:null,
    estado:'CANCELADA',certificados:[],sesiones:[],requisitoAsistencia:80,pagoPendiente:false,asistencia:{presentes:0,realizadas:0,porcentaje:null}}
  expect(queTeFalta(curso)?.texto).toContain('cupo se liberó')
})

it('HU53-15: actualiza la entrega pagada hasta recibir la constancia y luego deja de consultar',()=>{
  const curso={estadoEntrega:'RETENIDA',estadoFinanciero:'PAGADO'} as Historial['cursos'][number]
  expect(intervaloEntrega({cursos:[curso]})).toBe(3000)
  expect(intervaloEntrega({cursos:[{...curso,estadoFinanciero:'PENDIENTE'}]})).toBe(false)
  expect(intervaloEntrega({cursos:[{...curso,estadoEntrega:'EMITIDA'}]})).toBe(false)
  expect(intervaloEntrega(undefined)).toBe(false)
})
