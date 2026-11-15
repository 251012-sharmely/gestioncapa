import nodemailer,{type SendMailOptions} from 'nodemailer';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { env } from '../../config/env.js';
import { pool } from '../../shared/database.js';
import { crearPdfTexto } from '../../shared/pdf.js';

type Aviso={id:string;pagoId:string;tipo:'COMPROBANTE'|'RECHAZO';destinatario:string;asunto:string;texto:string;intentos:number};
export async function enviarNotificacionesPago() {
  if(!env.correoHabilitado) return 0;
  const transporte=nodemailer.createTransport({host:env.correoServidor!,port:env.correoPuerto,secure:env.correoSeguro,
    requireTLS:!env.correoSinTlsParaPruebas,ignoreTLS:env.correoSinTlsParaPruebas,
    ...(env.correoUsuario?{auth:{user:env.correoUsuario,pass:env.correoClave!}}:{}),
    connectionTimeout:10000,greetingTimeout:10000,socketTimeout:30000,
    disableFileAccess:true,disableUrlAccess:true,logger:false,debug:false});
  let enviados=0;
  try {
    for(let turno=0;turno<5;turno++) {
      // Cada envío obtiene su propio lease, para que la espera SMTP de otros
      // mensajes del lote no agote por adelantado el bloqueo de este mensaje.
      const procesamientoId=randomUUID();
      const aviso=(await pool.query<Aviso>(`update "notificacionesPago" set estado='ENVIANDO',"procesamientoId"=$1,
        "bloqueadoHasta"=clock_timestamp()+interval '2 minutes',intentos=intentos+1
        where id=(select id from "notificacionesPago" where (estado='PENDIENTE' and "intentarEn"<=clock_timestamp())
          or (estado='ENVIANDO' and "bloqueadoHasta"<=clock_timestamp()) order by "creadoEn" for update skip locked limit 1)
        returning id,"pagoId"::text,tipo,destinatario,asunto,texto,intentos`,[procesamientoId])).rows[0];
      if(!aviso) break;
      try {
        if(!z.email().safeParse(aviso.destinatario).success) throw new Error('Destinatario inválido');
        // El plazo total cancela y cierra SMTP antes de vencer el lease de 2 min.
        const mensaje:SendMailOptions & {signal:AbortSignal}={signal:AbortSignal.timeout(env.correoPlazoEnvioMs),from:env.correoRemitente!,to:{address:aviso.destinatario,name:''},subject:aviso.asunto,text:aviso.texto,
          messageId:`<pago-${aviso.id}@gestioncapa.invalid>`,disableFileAccess:true,disableUrlAccess:true,
          ...(aviso.tipo==='COMPROBANTE'?{attachments:[{filename:`comprobante-${aviso.pagoId}.pdf`,contentType:'application/pdf',
            content:crearPdfTexto('Comprobante de recepción - CPPP',aviso.texto.split('\n'))}]}:{})};
        const resultado=await transporte.sendMail(mensaje);
        if(!resultado.accepted?.length) throw new Error('Entrega no aceptada');
        const actualizado=await pool.query(`update "notificacionesPago" set estado='ENVIADO',"enviadoEn"=clock_timestamp(),"ultimoError"=null,
          "procesamientoId"=null,"bloqueadoHasta"=null where id=$1 and "procesamientoId"=$2`,[aviso.id,procesamientoId]);
        enviados+=actualizado.rowCount??0;
      } catch {
        const espera=Math.min(3600,30*2**Math.min(aviso.intentos,7));
        await pool.query(`update "notificacionesPago" set estado='PENDIENTE',"intentarEn"=clock_timestamp()+make_interval(secs=>$3::integer),
          "ultimoError"='SMTP_NO_ENTREGADO',"procesamientoId"=null,"bloqueadoHasta"=null where id=$1 and "procesamientoId"=$2`,[aviso.id,procesamientoId,espera]);
      }
    }
  } finally {transporte.close();}
  return enviados;
}
