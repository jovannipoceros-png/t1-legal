import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { id, nombre, correo, docsSubidos, docsPendientes, respuestas, preguntasSinResponder } = await req.json()
    const key = process.env.RESEND_API_KEY
    const admin = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'jovanni.poceros@t1.com'
    if (!key) return NextResponse.json({ error: 'API key no configurada' })

    const tieneDocsPendientes = docsPendientes?.length > 0
    const tienePreguntasPendientes = preguntasSinResponder?.length > 0

    const html = `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
        <div style="background:#0D5C36;padding:20px 32px;border-radius:8px 8px 0 0">
          <span style="background:white;color:#0D5C36;font-weight:900;font-size:16px;padding:2px 10px;border-radius:5px">T1</span>
          <span style="color:white;font-weight:700;font-size:15px;margin-left:8px">Legal — Respuesta recibida</span>
        </div>
        <div style="background:white;padding:28px 32px;border:1px solid #F0F0F0;border-radius:0 0 8px 8px">
          <h2 style="color:#0F2447;margin:0 0 6px">${nombre} respondio a tu solicitud</h2>
          <p style="color:#888;font-size:13px;margin:0 0 20px">Expediente: <strong>${id}</strong></p>

          ${docsSubidos?.length > 0 ? `
          <div style="margin-bottom:16px">
            <p style="color:#0F2447;font-weight:700;font-size:13px;margin:0 0 8px">Documentos recibidos (${docsSubidos.length}):</p>
            ${docsSubidos.map((d: string) => `
              <div style="display:flex;align-items:center;gap:8px;padding:8px 12px;background:#F0FDF4;border-radius:6px;margin-bottom:4px">
                <span style="color:#065F46;font-weight:700">✓</span>
                <span style="color:#065F46;font-size:13px">${d}</span>
              </div>
            `).join('')}
          </div>` : ''}

          ${tieneDocsPendientes ? `
          <div style="background:#FFF5F5;border:1px solid #FCA5A5;border-radius:8px;padding:12px 16px;margin-bottom:16px">
            <p style="color:#991B1B;font-weight:700;font-size:13px;margin:0 0 6px">Documentos aun pendientes:</p>
            ${docsPendientes.map((d: string) => `<p style="color:#991B1B;font-size:12px;margin:0 0 3px">• ${d}</p>`).join('')}
          </div>` : ''}

          ${Object.keys(respuestas || {}).length > 0 ? `
          <div style="margin-bottom:16px">
            <p style="color:#0F2447;font-weight:700;font-size:13px;margin:0 0 8px">Respuestas recibidas:</p>
            ${Object.entries(respuestas).map(([preg, resp]: [string, any]) => `
              <div style="padding:10px 14px;background:#EFF6FF;border-radius:6px;margin-bottom:6px">
                <p style="color:#1D4ED8;font-size:12px;font-weight:700;margin:0 0 4px">${preg}</p>
                <p style="color:#0F2447;font-size:13px;margin:0;font-style:italic">"${resp}"</p>
              </div>
            `).join('')}
          </div>` : ''}

          ${tienePreguntasPendientes ? `
          <div style="background:#FFF5F5;border:1px solid #FCA5A5;border-radius:8px;padding:12px 16px;margin-bottom:16px">
            <p style="color:#991B1B;font-weight:700;font-size:13px;margin:0 0 6px">Preguntas sin responder:</p>
            ${preguntasSinResponder.map((p: string) => `<p style="color:#991B1B;font-size:12px;margin:0 0 3px">• ${p}</p>`).join('')}
          </div>` : ''}

          <a href="https://t1-legal.vercel.app/dashboard/solicitudes/${id}" style="background:#0F2447;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:700;font-size:13px;display:inline-block;margin-top:8px">Ver expediente ${id} →</a>
        </div>
      </div>
    `

    // Notificacion interna a Jovanni
    try {
      const { createClient } = await import('@supabase/supabase-js')
      const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
      const docsSubidosLista = docsSubidos || []
      const respuestasObj = respuestas || {}
      const resumen = `${nombre} respondio. Docs: ${docsSubidosLista.join(', ')||'ninguno'}. Respuestas: ${Object.entries(respuestasObj).map(([p,r]:any) => `${p}: ${r}`).join(', ')||'ninguna'}`
      await sb.from('notificaciones').insert([{
        solicitud_id: id,
        correo_destinatario: 'jovanni.poceros@t1.com',
        tipo: 'respuesta_recibida',
        mensaje: resumen,
        datos: { link: `/dashboard/solicitudes/${id}`, docsSubidos: docsSubidosLista, respuestas: respuestasObj, docsPendientes, preguntasSinResponder }
      }])
      // Tracking de respuesta
      const trackingMsg = `Solicitante respondio. Documentos subidos: ${docsSubidosLista.join(', ')||'ninguno'}${docsPendientes?.length > 0 ? `. Pendientes: ${docsPendientes.join(', ')}` : ''}. Respuestas: ${Object.entries(respuestasObj).map(([p,r]:any) => `${p} → ${r}`).join(' | ')||'ninguna'}`
      await sb.from('tracking').insert([{
        solicitud_id: id,
        estado_nuevo: 'Informacion recibida',
        comentario: trackingMsg
      }])
    } catch(e) { console.error('Error notif interna:', e) }

    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
      body: JSON.stringify({
        from: 'T1 Legal <onboarding@resend.dev>',
        to: [admin],
        subject: `${nombre} respondio — ${id}`,
        html
      })
    })

    return NextResponse.json({ ok: true })
  } catch(e: any) {
    return NextResponse.json({ error: e.message })
  }
}
