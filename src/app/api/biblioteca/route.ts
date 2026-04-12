import { NextResponse } from 'next/server'

const parsearRSS = (xml: string, tipo: string, fuente: string) => {
  const items: any[] = []
  const entries = xml.match(/<item>([\s\S]*?)<\/item>/g) || []
  for (const entry of entries.slice(0, 30)) {
    const titulo = entry.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/)?.[1] || entry.match(/<title>(.*?)<\/title>/)?.[1] || ''
    const link = entry.match(/<link>(.*?)<\/link>/)?.[1] || entry.match(/<guid[^>]*>(.*?)<\/guid>/)?.[1] || ''
    const desc = entry.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/)?.[1] || entry.match(/<description>(.*?)<\/description>/)?.[1] || ''
    const fecha = entry.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] || ''
    if (titulo?.trim()) items.push({
      tipo,
      fuente,
      titulo: titulo.trim(),
      resumen: desc.replace(/<[^>]*>/g, '').trim().substring(0, 300),
      fecha_publicacion: fecha ? new Date(fecha).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      url: link.trim(),
    })
  }
  return items
}

export async function GET() {
  const items: any[] = []
  const headers = { 'User-Agent': 'Mozilla/5.0 (compatible; T1Legal/1.0)' }

  const fuentes = [
    // DOF via proxy alternativo
    { url: 'https://www.dof.gob.mx/rss.php', tipo: 'dof', fuente: 'Diario Oficial de la Federación' },
    // SCJN Semanario
    { url: 'https://sjf2.scjn.gob.mx/rss/tesis', tipo: 'jurisprudencia', fuente: 'SCJN — Semanario Judicial' },
    // CNBV RSS
    { url: 'https://www.cnbv.gob.mx/rss/Paginas/default.aspx', tipo: 'circular', fuente: 'CNBV' },
  ]

  await Promise.allSettled(fuentes.map(async ({ url, tipo, fuente }) => {
    try {
      const res = await fetch(url, { headers, signal: AbortSignal.timeout(8000) })
      if (res.ok) {
        const xml = await res.text()
        items.push(...parsearRSS(xml, tipo, fuente))
      }
    } catch(e) {
      console.log(`Error ${fuente}:`, e)
    }
  }))

  // Si el DOF falla por SSL, intentar via allorigins proxy
  if (!items.some(i => i.tipo === 'dof')) {
    try {
      const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent('https://www.dof.gob.mx/rss.php')}`
      const res = await fetch(proxyUrl, { signal: AbortSignal.timeout(10000) })
      if (res.ok) {
        const xml = await res.text()
        items.push(...parsearRSS(xml, 'dof', 'Diario Oficial de la Federación'))
      }
    } catch(e) {
      console.log('DOF proxy error:', e)
    }
  }

  return NextResponse.json({ items, total: items.length })
}
