import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { test, expect } from '../../ayud/prueba'
import { cuentaReal, cuentas } from '../../ayud/datos'
import { entrar } from '../../ayud/sesion'
import type { Page } from '@playwright/test'
import { entornoBackendReal } from '../../ayud/entornoReal'

test.use({ viewport: { width: 360, height: 800 } })

async function registrarEfectivo(page: Page, pagoId: string) {
  await page.goto(`/admin/pagos?pago=${pagoId}`)
  await expect(page.getByRole('heading', { name: 'Registrar efectivo', exact: true })).toBeVisible()
  await page.getByLabel('Referencia del recibo interno').fill(`CAJA-E2E-${pagoId}`)
  await page.getByRole('checkbox', { name: /He recibido el importe completo/ }).check()
  await page.getByRole('button', { name: 'Registrar recepción de efectivo', exact: true }).click()
  await expect(page.getByRole('status').filter({ hasText: 'Pago confirmado' })).toBeVisible()
}

test('HU53: crea y edita el cobro; reserva, recibe efectivo y habilita contenido', async ({ page, context }) => {
  test.setTimeout(90000)
  const errores: string[] = []
  page.on('pageerror', error => errores.push(error.message))
  const titulo = `HU53 pago previo ${Date.now()}`
  await entrar(page, cuentaReal)
  await page.goto('/admin/cursos/nuevo')
  await page.getByLabel('Nombre del curso').fill(titulo)
  await page.getByRole('textbox', { name: 'Descripción', exact: true }).fill('Curso con reserva y pago previo.')
  await page.getByLabel('Categoría').selectOption('Educación')
  await page.getByRole('combobox', { name:'Modalidad', exact: true }).selectOption('PRESENCIAL')
  await page.getByLabel('Instructor asignado').selectOption({ label: 'Carlos Mendoza Ríos' })
  await page.getByLabel('Fecha de inicio').fill('2032-01-15')
  await page.getByLabel('Fecha de fin').fill('2032-01-20')
  await page.getByLabel('Horas lectivas').fill('24')
  await page.getByRole('combobox', { name:'Modalidad de cobro', exact: true }).selectOption('PREVIO')
  await page.getByLabel('Costo (S/)').fill('25.50')
  await page.getByLabel('Plazo para pagar (minutos)').fill('60')
  await page.getByLabel('Cupos').fill('1')
  await page.getByRole('button', { name: '+ Agregar módulo', exact: true }).click()
  await page.getByLabel('Nombre del módulo 1').fill('Contenido reservado')
  await page.getByRole('button', { name: 'Listo', exact: true }).click()
  await page.getByRole('button', { name: 'Guardar borrador', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Editar curso', exact: true })).toBeVisible()
  const cursoId = new URL(page.url()).pathname.split('/').at(-2)!
  const editor = page.getByRole('form', { name: 'Condiciones de cobro', exact: true })
  await editor.getByLabel('Costo (S/)').fill('30.50')
  const guardado = page.waitForResponse(respuesta => respuesta.request().method() === 'PATCH' && respuesta.url().endsWith(`/cursos/${cursoId}/cobro`))
  await editor.getByRole('button', { name: 'Guardar condiciones de cobro' }).click()
  expect((await guardado).status()).toBe(200)
  await page.goto(`/cursos/${cursoId}`)
  await page.getByRole('button', { name: 'Publicar en catálogo' }).click()
  await expect(page.getByText('Publicado', { exact: true })).toBeVisible()
  const participante = await context.newPage()
  await entrar(participante, cuentas.part)
  await participante.goto(`/cursos/${cursoId}`)
  await expect(participante.getByText(/Pago antes de llevar el curso.*30\.50/)).toBeVisible()
  const alta = participante.waitForResponse(respuesta => respuesta.url().endsWith(`/cursos/${cursoId}/inscribirme`))
  await participante.getByRole('button', { name: 'Inscribirme', exact: true }).click()
  const { pagoId } = await (await alta).json() as { pagoId: string }
  await expect(participante.getByRole('button', { name: 'Pendiente de pago', exact: true })).toBeDisabled()
  await expect(participante.getByRole('heading', { name: '1. Contenido reservado' })).toHaveCount(0)
  await expect(participante.getByRole('button', { name: 'Pagar con Culqi' })).toBeDisabled()
  await registrarEfectivo(page, pagoId)
  await expect(participante.getByRole('heading', { name: 'Pago confirmado', exact: true })).toBeVisible({ timeout: 10000 })
  await expect(participante.getByRole('heading', { name: '1. Contenido reservado' })).toBeVisible()
  expect(await participante.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await participante.screenshot({ path: test.info().outputPath('pagoConfirmado.png'), fullPage: true })
  await participante.close()
  expect(errores).toEqual([])
})

test('HU53: retiene la constancia hasta pagar y emite gratis sin obligación', async ({ page, context }) => {
  test.setTimeout(90000)
  const { stdout } = await promisify(execFile)('node', ['--import', 'tsx', 'src/scripts/cobroDemoE2e.ts'], {
    cwd: 'backend', env: { ...process.env, ...entornoBackendReal },
  })
  const cursos = JSON.parse(stdout) as { id: string; titulo: string; modalidadCobro: string }[]
  await entrar(page, cuentaReal)
  const participante = await context.newPage()
  await entrar(participante, cuentas.part)
  for (const curso of cursos) {
    await page.goto(`/admin/cursos/${curso.id}/cerrar`)
    await page.getByRole('button', { name: 'Emitir constancias', exact: true }).click()
    await expect(page.getByRole('heading', { name: 'Certificados del curso', exact: true })).toBeVisible()
    const fila = page.getByRole('row').filter({ hasText: 'María Quispe' })
    if (curso.modalidadCobro === 'CERTIFICADO') {
      await expect(fila).toContainText('Retenida')
      const enlace = fila.getByRole('link', { name: /pago/i })
      const pagoId = new URL((await enlace.getAttribute('href'))!, 'http://localhost').searchParams.get('pago')!
      await participante.goto(`/cursos/${curso.id}`)
      await expect(participante.getByText(/Constancia retenida:/)).toBeVisible()
      await participante.screenshot({ path: test.info().outputPath('constanciaRetenida.png'), fullPage: true })
      await registrarEfectivo(page, pagoId)
      await expect(participante.getByRole('heading', { name: 'Pago confirmado', exact: true })).toBeVisible({ timeout: 10000 })
      // El servidor real libera entregas pendientes cada 30 s; la página consulta
      // su estado sin solicitar de nuevo el cierre ni crear un segundo pago.
      await expect(participante.getByText(/Constancia retenida:|Estamos preparando/)).toHaveCount(0, { timeout: 40000 })
      await participante.getByRole('link', { name: 'Mis cursos', exact: true }).click()
      const tarjeta = participante.getByRole('article').filter({ has: participante.getByRole('heading', { name: curso.titulo, exact: true }) })
      await expect(tarjeta.getByRole('link', { name: /constancia|certificado/i }).first()).toBeVisible()
      await tarjeta.getByText('Inscripciones anteriores (1)',{exact:true}).click()
      await expect(tarjeta.locator('details')).toContainText('45.00')
      await tarjeta.getByRole('button',{name:/Consultar pago #/}).click()
      await expect(tarjeta.getByRole('heading',{name:'Reserva no vigente',exact:true})).toBeVisible()
      await participante.screenshot({path:test.info().outputPath('historialIntentos.png'),fullPage:true})
    } else {
      await expect(fila.getByRole('link').first()).toHaveAttribute('href', /\/verificar\//)
      await participante.goto(`/cursos/${curso.id}`)
      await expect(participante.getByRole('button', { name: /Pagar con/ })).toHaveCount(0)
    }
  }
  await participante.close()
})
