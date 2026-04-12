import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const [dofRes, scjnRes] = await Promise.allSettled([
      fetch('https://www.dof.gob.mx/rss.php'),
      fetch('https://sjf2.scjn.gob.mx/rss/tesis'),
    ])

    const items: any[] = []

    if (dofRes.status === 'fulfilled' && dofRes.value.ok) {
      const xml = await dofRes.value.text()
      const entries = xml.match(/<item>([\s\S]*?)<\/item>/g) || []
      for (const entry of entries.slice(0, 30)) {
        const titulo = entry.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/)?.[1] || entry.match(/<title>(.*?)<\/title>/)?.[1] || ''
        const link = entry.match(/<link>(.*?)<\/link>/)?.[1] || entry.match(/<guid>(.*?)<\/guid>/)?.[1] || ''
        const desc = entry.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/)?.[1] || entry.match(/<description>(.*?)<\/description>/)?.[1] || ''
        const fecha = entry.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] || ''
        if (titulo) items.push({
          tipo: 'dof',
          fuente: 'Diario Oficial de la Federación',
          titulo: titulo.trim(),
          resumen: desc.replace(/<[^>]*>/g, '').trim().substring(0, 300),
          fecha_publicacion: fecha ? new Date(fecha).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          url: link.trim(),
        })
      }
    }

    if (scjnRes.status === 'fulfilled' && scjnRes.value.ok) {
      const xml = await scjnRes.value.text()
      const entries = xml.match(/<item>([\s\S]*?)<\/item>/g) || []
      for (const entry of entries.slice(0, 15)) {
        const titulo = entry.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/)?.[1] || entry.match(/<title>(.*?)<\/title>/)?.[1] || ''
        const link = entry.match(/<link>(.*?)<\/link>/)?.[1] || ''
        const desc = entry.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/)?.[1] || ''
        const fecha = entry.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] || ''
        if (titulo) items.push({
          tipo: 'jurisprudencia',
          fuente: 'SCJN — Semanario Judicial',
          titulo: titulo.trim(),
          resumen: desc.replace(/<[^>]*>/g, '').trim().substring(0, 300),
          fecha_publicacion: fecha ? new Date(fecha).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          url: link.trim(),
        })
      }
    }

    return NextResponse.json({ items })
  } catch(e) {
    return NextResponse.json({ items: [], error: String(e) })
  }
}
