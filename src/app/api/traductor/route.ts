import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { texto, origen, destino } = await req.json()

  const prompt = `Eres un traductor juridico especializado. Traduce el siguiente texto legal del ${origen} al ${destino} de manera precisa manteniendo los terminos juridicos correctos. Responde UNICAMENTE con la traduccion, sin explicaciones ni comentarios adicionales.

TEXTO A TRADUCIR:
${texto}`

  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    })
    const data = await res.json()
    const traduccion = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Error al traducir'
    return NextResponse.json({ traduccion })
  } catch(e) {
    return NextResponse.json({ error: 'Error al conectar con Gemini' })
  }
}
