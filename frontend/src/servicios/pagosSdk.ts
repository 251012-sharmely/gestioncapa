const permitidos = new Set([
  'https://js.culqi.com/checkout-js',
  'https://sandbox-checkout.izipay.pe/payments/v1/js/index.js',
  'https://checkout.izipay.pe/payments/v1/js/index.js',
])
const cargas = new Map<string,Promise<void>>()
export async function cargarSdkPago(origen:string) {
  if (!permitidos.has(origen)) throw new Error('El proveedor de pago no está permitido.')
  const existente=cargas.get(origen)
  if (existente) return existente
  const carga=new Promise<void>((resolve,reject)=>{
    const script=document.createElement('script')
    const expirar=()=>{script.remove();cargas.delete(origen);reject(new Error('No pudimos cargar la pasarela. Consulta el estado antes de intentar otro pago.'))}
    const limite=window.setTimeout(expirar,15000)
    script.src=origen;script.async=true
    script.onload=()=>{window.clearTimeout(limite);resolve()}
    script.onerror=()=>{window.clearTimeout(limite);expirar()}
    document.head.append(script)
  })
  cargas.set(origen,carga)
  return carga
}
