import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { texto, origen, destino } = await req.json()
    const prompt = `Traduce este texto legal del ${origen} al ${destino}. Solo responde con la traduccion, sin explicaciones:\n\n${texto}`
    const key = process.env.GEMINI_API_KEY
    if (!key) return NextResponse.json({ error: 'API key no configurada' })
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    })
    const data = await res.json()
    if (data.error) return NextResponse.json({ error: data.error.message })
    const traduccion = data.candidates?.[0]?.content?.parts?.[0]?.text
    if (!traduccion) return NextResponse.json({ error: 'Sin respuesta de Gemini' })
    return NextResponse.json({ traduccion })
  } catch(e: any) {
    return NextResponse.json({ error: e.message || 'Error desconocido' })
  }
}
