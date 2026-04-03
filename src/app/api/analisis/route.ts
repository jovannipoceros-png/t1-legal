import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { texto, modo, motor } = await req.json()

  const prompt = `Eres un abogado experto en derecho mercantil mexicano especializado en contratos corporativos para empresas fintech como T1 Pagos y Claro Pagos.

Analiza el siguiente contrato o clausula en modo "${modo}" y responde UNICAMENTE con un JSON valido con esta estructura exacta:
{
  "score": numero del 0 al 100 donde 100 es sin riesgos,
  "resumen": "resumen ejecutivo de 2-3 oraciones",
  "riesgos": [
    {
      "nivel": "Alto o Medio o Bajo",
      "clausula": "nombre de la clausula",
      "descripcion": "descripcion del riesgo",
      "recomendacion": "recomendacion especifica"
    }
  ],
  "checklist": [
    { "item": "nombre del elemento legal", "ok": true o false }
  ]
}

El checklist debe incluir: Jurisdiccion CDMX, Penalizacion por incumplimiento, Clausula de rescision, Confidencialidad, Vigencia definida, Propiedad intelectual T1, Firma electronica, PLD.

CONTRATO A ANALIZAR:
${texto}`

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY || '',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-opus-4-5',
        max_tokens: 2000,
        messages: [{ role: 'user', content: prompt }]
      })
    })

    const data = await res.json()
    const content = data.content?.[0]?.text || ''
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const resultado = JSON.parse(jsonMatch[0])
      return NextResponse.json(resultado)
    }
    return NextResponse.json({ error: 'No se pudo parsear la respuesta de Claude' })
  } catch(e) {
    return NextResponse.json({ error: 'Error al conectar con Claude. Verifica la API key.' })
  }
}
