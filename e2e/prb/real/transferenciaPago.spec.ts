import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { test,expect } from '../../ayud/prueba'
import { cuentaReal,cuentas } from '../../ayud/datos'
import { entrar } from '../../ayud/sesion'
import { entornoBackendReal } from '../../ayud/entornoReal'

test('T25: declara, rechaza y confirma una transferencia real en API/BD sin simular un abono bancario',async({page,context})=>{
  test.setTimeout(90000)
  const errores:string[]=[]
  page.on('pageerror',error=>errores.push(error.message))
  const {stdout}=await promisify(execFile)('node',['--import','tsx','src/scripts/transferenciaDemoE2e.ts'],{cwd:'backend',env:{...process.env,...entornoBackendReal}})
  const curso=JSON.parse(stdout) as {id:string;titulo:string}
  await page.setViewportSize({width:360,height:800})
  await entrar(page,cuentaReal)
  const participante=await context.newPage()
  participante.on('pageerror',error=>errores.push(error.message))
  await participante.setViewportSize({width:360,height:800})
  await entrar(participante,cuentas.part)
  await participante.goto(`/cursos/${curso.id}`)
  const alta=participante.waitForResponse(respuesta=>respuesta.url().endsWith(`/cursos/${curso.id}/inscribirme`))
  await participante.getByRole('button',{name:'Inscribirme',exact:true}).click()
  const {pagoId}=await (await alta).json() as {pagoId:string}
  await expect(participante.getByRole('button',{name:'Pagar con Culqi'})).toHaveCount(0)
  await expect(participante.getByText('BANCO FICTICIO E2E',{exact:true})).toBeVisible()
  await participante.screenshot({path:test.info().outputPath('declararTransferencia.png'),fullPage:true})
  for(const numero of [1,2]) {
    const referencia=`ABONO-E2E-${pagoId}-${numero}`
    const formulario=participante.getByRole('form',{name:'Declarar transferencia bancaria'})
    await expect(formulario).toBeVisible()
    await formulario.getByRole('textbox',{name:'Referencia de la transferencia',exact:true}).fill(referencia)
    await formulario.getByLabel('Fecha de la operación bancaria').fill('2026-01-01')
    await formulario.getByRole('checkbox',{name:/Ya realicé la transferencia/}).check()
    const declaracion=participante.waitForResponse(respuesta=>respuesta.request().method()==='POST'&&respuesta.url().endsWith(`/pagos/${pagoId}/transferencias`))
    await formulario.getByRole('button',{name:'Declarar transferencia',exact:true}).click()
    expect((await declaracion).status()).toBe(201)
    await expect(participante.getByRole('status').filter({hasText:`Transferencia ${referencia} · Pendiente de revisión`})).toBeVisible()
    await participante.reload()
    await expect(participante.getByRole('button',{name:'Pagar con Izipay'})).toBeDisabled()
    await expect(participante.getByRole('heading',{name:'1. Contenido tras transferencia'})).toHaveCount(0)
    await page.goto(`/admin/pagos?pago=${pagoId}`)
    const revision=page.getByRole('region',{name:`Transferencia ${referencia}`,exact:true})
    await expect(revision.getByText('BANCO FICTICIO E2E',{exact:false})).toBeVisible()
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true)
    if(numero===1) {
      await revision.getByLabel('Motivo del rechazo').fill('No se encuentra el abono en la cuenta de pruebas.')
      await revision.getByRole('button',{name:'Rechazar transferencia',exact:true}).click()
      await expect(revision.getByRole('status')).toContainText('Transferencia rechazada')
      await expect(participante.getByText('No se encuentra el abono en la cuenta de pruebas.',{exact:true})).toBeVisible({timeout:10000})
    } else {
      await expect(revision.getByRole('button',{name:'Confirmar abono bancario'})).toBeDisabled()
      await revision.getByLabel('Importe abonado (S/)').fill('30.50')
      await revision.getByRole('checkbox',{name:/He verificado el abono real/}).check()
      await page.screenshot({path:test.info().outputPath('revisarTransferencia.png'),fullPage:true})
      const confirmacion=page.waitForResponse(respuesta=>respuesta.request().method()==='POST'&&respuesta.url().includes('/revision'))
      await revision.getByRole('button',{name:'Confirmar abono bancario'}).click()
      expect((await confirmacion).status()).toBe(200)
      await expect(page.getByRole('status').filter({hasText:'Pago confirmado'})).toBeVisible()
    }
  }
  await expect(participante.getByRole('heading',{name:'Pago confirmado',exact:true})).toBeVisible({timeout:10000})
  await expect(participante.getByRole('heading',{name:'1. Contenido tras transferencia'})).toBeVisible()
  for(const ancho of [320,768,1024,1440]) {
    await participante.setViewportSize({width:ancho,height:900})
    await participante.evaluate(()=>document.fonts.ready)
    const medidas=await participante.evaluate(()=>({ancho:innerWidth,contenido:document.documentElement.scrollWidth,
      extremos:[...document.querySelectorAll('body *')].filter(elemento=>elemento.getBoundingClientRect().right>innerWidth&&elemento.getBoundingClientRect().width>0).slice(0,8).map(elemento=>({etiqueta:elemento.tagName,clase:elemento.className,texto:elemento.textContent?.slice(0,80)}))}))
    expect(medidas.contenido,JSON.stringify(medidas)).toBeLessThanOrEqual(medidas.ancho)
  }
  await participante.screenshot({path:test.info().outputPath('transferenciaConfirmada.png'),fullPage:true})
  expect(errores).toEqual([])
  await participante.close()
})
