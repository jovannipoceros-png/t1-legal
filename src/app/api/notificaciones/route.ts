import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { tipo, correo, nombre, id, estado, tipo_solicitud } = await req.json()
    const key = process.env.RESEND_API_KEY
    if (!key) return NextResponse.json({ error: 'API key no configurada' })

    let subject = ''
    let html = ''

    if (tipo === 'nueva_solicitud') {
      subject = `Nueva solicitud recibida — ${id}`
      html = `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
          <div style="background:#0F2447;padding:20px 32px;border-radius:8px 8px 0 0">
            <span style="background:#E8321A;color:white;font-weight:900;font-size:18px;padding:3px 12px;border-radius:5px">T1</span>
            <span style="color:white;font-weight:700;font-size:16px;margin-left:8px">Legal</span>
          </div>
          <div style="background:white;padding:32px;border:1px solid #F0F0F0;border-radius:0 0 8px 8px">
            <h2 style="color:#0F2447;margin:0 0 16px">Nueva solicitud recibida</h2>
            <p style="color:#555">Se ha recibido una nueva solicitud en T1 Legal:</p>
            <div style="background:#F8F8F8;padding:16px;border-radius:8px;margin:16px 0">
              <p style="margin:0 0 8px"><strong>ID:</strong> ${id}</p>
              <p style="margin:0 0 8px"><strong>Solicitante:</strong> ${nombre}</p>
              <p style="margin:0"><strong>Tipo:</strong> ${tipo_solicitud}</p>
            </div>
            <a href="https://t1-legal.vercel.app/dashboard/solicitudes" style="background:#E8321A;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:700;display:inline-block;margin-top:16px">Ver solicitud</a>
          </div>
        </div>
      `
    } else if (tipo === 'estado_actualizado') {
      subject = `Tu solicitud ${id} fue actualizada`
      html = `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
          <div style="background:#0F2447;padding:20px 32px;border-radius:8px 8px 0 0">
            <span style="background:#E8321A;color:white;font-weight:900;font-size:18px;padding:3px 12px;border-radius:5px">T1</span>
            <span style="color:white;font-weight:700;font-size:16px;margin-left:8px">Legal</span>
          </div>
          <div style="background:white;padding:32px;border:1px solid #F0F0F0;border-radius:0 0 8px 8px">
            <h2 style="color:#0F2447;margin:0 0 16px">Tu solicitud fue actualizada</h2>
            <p style="color:#555">Hola ${nombre}, tu solicitud ha sido actualizada:</p>
            <div style="background:#F8F8F8;padding:16px;border-radius:8px;margin:16px 0">
              <p style="margin:0 0 8px"><strong>ID:</strong> ${id}</p>
              <p style="margin:0"><strong>Nuevo estado:</strong> <span style="color:#E8321A;font-weight:700">${estado}</span></p>
            </div>
            <a href="https://t1-legal.vercel.app/portal" style="background:#E8321A;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:700;display:inline-block;margin-top:16px">Ver mis solicitudes</a>
          </div>
        </div>
      `
    }

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`
      },
      body: JSON.stringify({
        from: 'T1 Legal <onboarding@resend.dev>',
        to: [correo],
        subject,
        html
      })
    })

    const data = await res.json()
    if (data.error) return NextResponse.json({ error: data.error.message || data.error })
    return NextResponse.json({ ok: true, id: data.id })
  } catch(e: any) {
    return NextResponse.json({ error: e.message })
  }
}
