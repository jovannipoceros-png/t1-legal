import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

const CORREO_ADMIN = 'jovanni.poceros@t1.com'
const PASSWORD_ADMIN = 'T1Legal2026!'

export async function POST(req: NextRequest) {
  const { accion, password, codigo } = await req.json()

  if (accion === 'verificar_password') {
    if (password !== PASSWORD_ADMIN) {
      return NextResponse.json({ ok: false, error: 'Contraseña incorrecta' })
    }
    // Generar codigo de 6 digitos
    const code = Math.floor(100000 + Math.random() * 900000).toString()

    // Guardar en Supabase
    await sb.from('sistema_codigos').insert([{
      codigo: code,
      correo: CORREO_ADMIN,
      expira_at: new Date(Date.now() + 10 * 60 * 1000).toISOString()
    }])

    // Enviar por email via Resend
    try {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`
        },
        body: JSON.stringify({
          from: 'T1 Legal <onboarding@resend.dev>',
          to: [CORREO_ADMIN],
          subject: 'Código de acceso — Sistema T1 Legal',
          html: `
            <div style="font-family:Arial,sans-serif;max-width:400px;margin:0 auto;padding:32px">
              <div style="background:#0F2447;padding:20px;border-radius:12px;text-align:center;margin-bottom:24px">
                <h1 style="color:white;margin:0;font-size:20px">T1 Legal</h1>
                <p style="color:#aaa;margin:8px 0 0;font-size:12px">Centro de Control</p>
              </div>
              <p style="color:#333;font-size:14px">Tu código de acceso al Centro de Control es:</p>
              <div style="background:#F0F7FF;border:2px solid #BFDBFE;border-radius:12px;padding:24px;text-align:center;margin:20px 0">
                <p style="font-size:42px;font-weight:900;color:#0F2447;margin:0;letter-spacing:8px">${code}</p>
              </div>
              <p style="color:#888;font-size:12px">Este código expira en 10 minutos. Si no solicitaste este acceso, ignora este mensaje.</p>
            </div>
          `
        })
      })
    } catch(e) {
      console.error('Error enviando email:', e)
    }

    return NextResponse.json({ ok: true, correo: CORREO_ADMIN })
  }

  if (accion === 'verificar_codigo') {
    const { data } = await sb.from('sistema_codigos')
      .select('*')
      .eq('codigo', codigo)
      .eq('usado', false)
      .gt('expira_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)

    if (!data || data.length === 0) {
      return NextResponse.json({ ok: false, error: 'Código incorrecto o expirado' })
    }

    // Marcar como usado
    await sb.from('sistema_codigos').update({ usado: true }).eq('id', data[0].id)

    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ ok: false, error: 'Acción no válida' })
}
