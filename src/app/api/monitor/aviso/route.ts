import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
  try {
    const { tipo, salud, vencidas, proximas, sinMovimiento, oblSinDoc, totalActivos } = await req.json()
    const admin = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'jovanni.poceros@t1.com'
    const colorSalud = salud >= 70 ? '#3B6D11' : salud >= 40 ? '#BA7517' : '#A32D2D'
    const hoy = new Date().toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    const fechaCap = hoy.charAt(0).toUpperCase() + hoy.slice(1)
    const esMatutino = tipo === 'matutino'

    const asunto = esMatutino ? `Resumen legal del día — ${fechaCap}` : `Cierre del día — ${fechaCap}`

    const cuerpoMatutino = `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:24px">
        <div style="background:#0F2447;border-radius:10px;padding:20px 24px;margin-bottom:20px">
          <h1 style="color:white;font-size:18px;margin:0 0 4px">Monitor Legal — T1</h1>
          <p style="color:#94A3B8;font-size:12px;margin:0">${fechaCap}</p>
        </div>
        <p style="font-size:14px;color:#0F2447;margin:0 0 6px"><strong>Buenos días</strong></p>
        <p style="font-size:13px;color:#888;margin:0 0 20px">Salud del expediente hoy: <strong style="color:${colorSalud}">${salud}/100</strong></p>
        ${vencidas > 0 ? `<div style="background:#FFF5F5;border:1px solid #FCA5A5;border-radius:8px;padding:12px 16px;margin-bottom:8px"><p style="color:#991B1B;font-size:13px;font-weight:600;margin:0">${vencidas} contrato(s) vencido(s) — acción inmediata requerida</p></div>` : ''}
        ${proximas > 0 ? `<div style="background:#FFFBEB;border:1px solid #FDE68A;border-radius:8px;padding:12px 16px;margin-bottom:8px"><p style="color:#92400E;font-size:13px;font-weight:600;margin:0">${proximas} contrato(s) vencen esta semana</p></div>` : ''}
        ${sinMovimiento > 0 ? `<div style="background:#F8F8F8;border:1px solid #E8E8E8;border-radius:8px;padding:12px 16px;margin-bottom:8px"><p style="color:#555;font-size:13px;font-weight:600;margin:0">${sinMovimiento} solicitud(es) sin movimiento — tiempo límite superado</p></div>` : ''}
        ${oblSinDoc > 0 ? `<div style="background:#FFF5F5;border:1px solid #FCA5A5;border-radius:8px;padding:12px 16px;margin-bottom:8px"><p style="color:#991B1B;font-size:13px;font-weight:600;margin:0">${oblSinDoc} obligación(es) sin documento de respaldo</p></div>` : ''}
        ${vencidas === 0 && proximas === 0 && sinMovimiento === 0 ? `<div style="background:#F0FDF4;border:1px solid #BBF7D0;border-radius:8px;padding:12px 16px;margin-bottom:8px"><p style="color:#065F46;font-size:13px;font-weight:600;margin:0">Todo en orden — no hay alertas activas hoy</p></div>` : ''}
        <div style="margin-top:24px;text-align:center">
          <a href="https://t1-legal.vercel.app/dashboard/monitor" style="background:#0F2447;color:white;padding:10px 24px;border-radius:8px;font-size:13px;font-weight:700;text-decoration:none">Abrir Monitor Legal</a>
        </div>
      </div>`

    const cuerpoCierre = `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:24px">
        <div style="background:#0D5C36;border-radius:10px;padding:20px 24px;margin-bottom:20px">
          <h1 style="color:white;font-size:18px;margin:0 0 4px">Cierre del día — T1 Legal</h1>
          <p style="color:#A7F3D0;font-size:12px;margin:0">${fechaCap}</p>
        </div>
        <p style="font-size:14px;color:#0F2447;margin:0 0 6px"><strong>Resumen de lo que sucedió hoy</strong></p>
        <p style="font-size:13px;color:#888;margin:0 0 20px">Salud al cierre: <strong style="color:${colorSalud}">${salud}/100</strong></p>
        <table style="width:100%;border-collapse:collapse">
          <tr style="background:#F8F8F8"><td style="padding:10px 14px;font-size:13px;color:#555;border-bottom:1px solid #F0F0F0">Contratos activos al cierre</td><td style="padding:10px 14px;font-size:13px;font-weight:700;color:#0F2447;text-align:right;border-bottom:1px solid #F0F0F0">${totalActivos}</td></tr>
          <tr><td style="padding:10px 14px;font-size:13px;color:#555;border-bottom:1px solid #F0F0F0">Alertas activas</td><td style="padding:10px 14px;font-size:13px;font-weight:700;color:${(vencidas + proximas + sinMovimiento) > 0 ? '#E8321A' : '#0D5C36'};text-align:right;border-bottom:1px solid #F0F0F0">${vencidas + proximas + sinMovimiento}</td></tr>
          <tr style="background:#F8F8F8"><td style="padding:10px 14px;font-size:13px;color:#555;border-bottom:1px solid #F0F0F0">Obligaciones sin respaldo documental</td><td style="padding:10px 14px;font-size:13px;font-weight:700;color:${oblSinDoc > 0 ? '#E8321A' : '#0D5C36'};text-align:right;border-bottom:1px solid #F0F0F0">${oblSinDoc}</td></tr>
        </table>
        <div style="margin-top:24px;text-align:center">
          <a href="https://t1-legal.vercel.app/dashboard/monitor" style="background:#0D5C36;color:white;padding:10px 24px;border-radius:8px;font-size:13px;font-weight:700;text-decoration:none">Ver Monitor Legal</a>
        </div>
      </div>`

    await resend.emails.send({
      from: 'T1 Legal <onboarding@resend.dev>',
      to: [admin],
      subject: asunto,
      html: esMatutino ? cuerpoMatutino : cuerpoCierre,
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Error aviso Monitor:', error)
    return NextResponse.json({ error: 'Error al enviar aviso' }, { status: 500 })
  }
}
