import { cargarSdkPago } from './pagosSdk'

type CheckoutCulqi={open:()=>void;close:()=>void;token?:{id:string};error?:unknown;culqi?:()=>void}
declare global {
  interface Window { CulqiCheckout?:new(clavePublica:string,config:Record<string,unknown>)=>CheckoutCulqi }
}
// Checkout Custom, reemplazo vigente del checkout v4:
// https://docs.culqi.com/es/documentacion/checkout/checkout-custom/
export async function abrirCulqi(clavePublica:string,importeCentimos:number,alToken:(token:string)=>void,alError:()=>void) {
  await cargarSdkPago('https://js.culqi.com/checkout-js')
  if (!window.CulqiCheckout) throw new Error('Culqi no está disponible. Vuelve a consultar tu operación.')
  const checkout=new window.CulqiCheckout(clavePublica,{
    settings:{title:'Cursos CPPP',currency:'PEN',amount:importeCentimos},
    options:{lang:'es',installments:false,modal:true,paymentMethods:{tarjeta:true,yape:false,billetera:false,bancaMovil:false,agente:false,cuotealo:false},paymentMethodsSort:['tarjeta']},
  })
  checkout.culqi=()=>{
    if (checkout.token?.id) { checkout.close();alToken(checkout.token.id) }
    else if (checkout.error) alError()
  }
  checkout.open()
}
