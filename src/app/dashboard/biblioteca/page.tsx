'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export default function Biblioteca() {
  const [tab, setTab] = useState('novedades')
  const [items, setItems] = useState<any[]>([])
  const [miMarco, setMiMarco] = useState<any[]>([])
  const [cargando, setCargando] = useState(true)
  const [cargandoRSS, setCargandoRSS] = useState(false)
  const [busqueda, setBusqueda] = useState('')
  const [filtroTipo, setFiltroTipo] = useState('todos')
  const [expandido, setExpandido] = useState<Record<string,boolean>>({})
  const [preguntaIA, setPreguntaIA] = useState('')
  const [consultando, setConsultando] = useState(false)
  const [respuestaIA, setRespuestaIA] = useState('')

  useEffect(() => { cargar() }, [])

  const cargar = async () => {
    setCargando(true)
    try {
      const { data } = await sb.from('biblioteca_items').select('*').order('created_at', { ascending: false })
      setMiMarco((data || []).filter((i:any) => i.relevancia === 'aplica'))
      setItems(data || [])
    } catch(e) { console.error(e) }
    setCargando(false)
  }

  const cargarRSS = async () => {
    setCargandoRSS(true)
    try {
      const res = await fetch('/api/biblioteca')
      const { items: nuevos, error } = await res.json()
      if (error) { alert('Error al cargar RSS: ' + error); setCargandoRSS(false); return }

      // Guardar en Supabase los que no existan
      const existentes = items.map((i:any) => i.url)
      const porGuardar = nuevos.filter((n:any) => !existentes.includes(n.url))

      if (porGuardar.length > 0) {
        await sb.from('biblioteca_items').insert(porGuardar)
        await cargar()
      } else {
        alert('Ya tienes las novedades más recientes')
      }
    } catch(e) { console.error(e) }
    setCargandoRSS(false)
  }

  const marcarRelevancia = async (id: string, relevancia: string) => {
    await sb.from('biblioteca_items').update({ relevancia }).eq('id', id)
    await cargar()
  }

  const guardarNota = async (id: string, nota: string) => {
    await sb.from('biblioteca_items').update({ nota_personal: nota }).eq('id', id)
  }

  const consultarIA = async () => {
    if (!preguntaIA.trim()) return
    setConsultando(true)
    setRespuestaIA('')
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          system: 'Eres un experto en derecho mexicano especializado en Fintech, pagos electrónicos, protección de datos y comercio electrónico. El usuario trabaja en el área legal de T1 Pagos / Claro Pagos, empresa de pagos electrónicos en México. Responde en español de forma clara y práctica. Indica siempre si aplica o no aplica, y por qué.',
          messages: [{ role: 'user', content: preguntaIA }]
        })
      })
      const data = await res.json()
      if (data.error?.type === 'authentication_error') {
        setRespuestaIA('⚠️ API key de Claude pendiente de configurar. Este módulo se activará automáticamente cuando se configure la clave.')
      } else {
        setRespuestaIA(data.content?.[0]?.text || 'Sin respuesta')
      }
    } catch(e) {
      setRespuestaIA('⚠️ API key de Claude pendiente de configurar.')
    }
    setConsultando(false)
  }

  const tog = (k: string) => setExpandido(p => ({...p, [k]: !p[k]}))

  const novedades = items.filter((i:any) => i.relevancia === 'pendiente')
  const descartados = items.filter((i:any) => i.relevancia === 'no_aplica')
  const revisar = items.filter((i:any) => i.relevancia === 'revisar')

  const itemsFiltrados = items.filter((i:any) => {
    const matchBusqueda = !busqueda || i.titulo?.toLowerCase().includes(busqueda.toLowerCase()) || i.resumen?.toLowerCase().includes(busqueda.toLowerCase())
    const matchTipo = filtroTipo === 'todos' || i.tipo === filtroTipo
    return matchBusqueda && matchTipo
  })

  const Tab = ({ id, label, count }: any) => (
    <button onClick={() => setTab(id)}
      style={{ padding:'10px 18px', background:'none', border:'none', borderBottom:`2px solid ${tab===id?'#E8321A':'transparent'}`, color:tab===id?'#E8321A':'#888', fontWeight:tab===id?700:400, fontSize:'13px', cursor:'pointer', fontFamily:'sans-serif', whiteSpace:'nowrap' as any, display:'flex', alignItems:'center', gap:'6px' }}>
      {label}
      {count !== undefined && count > 0 && <span style={{ background:tab===id?'#E8321A':'#E8E8E8', color:tab===id?'white':'#555', fontSize:'10px', fontWeight:700, padding:'1px 6px', borderRadius:'10px' }}>{count}</span>}
    </button>
  )

  const CardItem = ({ item }: { item: any }) => {
    const [nota, setNota] = useState(item.nota_personal || '')
    const colores: Record<string,any> = {
      dof: { color:'#0F2447', bg:'#EFF6FF', border:'#BFDBFE', label:'DOF' },
      jurisprudencia: { color:'#7C3AED', bg:'#F3E8FF', border:'#DDD6FE', label:'SCJN' },
      circular: { color:'#065F46', bg:'#F0FDF4', border:'#BBF7D0', label:'Circular' },
    }
    const cfg = colores[item.tipo] || { color:'#0F2447', bg:'#F8F8F8', border:'#E8E8E8', label:'Legal' }
    const fecha = item.fecha_publicacion ? new Date(item.fecha_publicacion + 'T12:00:00').toLocaleDateString('es-MX', { day:'numeric', month:'short', year:'numeric' }) : '—'

    return (
      <div style={{ background:'white', borderRadius:'12px', border:'1px solid #F0F0F0', marginBottom:'10px', overflow:'hidden' }}>
        <div style={{ padding:'16px 18px' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:'12px' }}>
            <div style={{ flex:1 }}>
              <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'6px', flexWrap:'wrap' as any }}>
                <span style={{ background:cfg.bg, color:cfg.color, fontSize:'10px', fontWeight:700, padding:'2px 8px', borderRadius:'10px', border:`1px solid ${cfg.border}` }}>{cfg.label}</span>
                <span style={{ fontSize:'11px', color:'#aaa' }}>{fecha}</span>
                <span style={{ fontSize:'11px', color:'#888' }}>{item.fuente}</span>
              </div>
              <p style={{ fontSize:'14px', fontWeight:700, color:'#0F2447', margin:'0 0 6px', lineHeight:1.4 }}>{item.titulo}</p>
              {item.resumen && <p style={{ fontSize:'12px', color:'#666', margin:0, lineHeight:1.5 }}>{item.resumen.substring(0, 180)}{item.resumen.length > 180 ? '...' : ''}</p>}
            </div>
            {item.relevancia === 'aplica' && <span style={{ background:'#F0FDF4', color:'#065F46', fontSize:'11px', fontWeight:700, padding:'4px 10px', borderRadius:'10px', border:'1px solid #BBF7D0', flexShrink:0 }}>✓ Me aplica</span>}
            {item.relevancia === 'revisar' && <span style={{ background:'#FFFBEB', color:'#92400E', fontSize:'11px', fontWeight:700, padding:'4px 10px', borderRadius:'10px', border:'1px solid #FDE68A', flexShrink:0 }}>🔖 Revisar</span>}
            {item.relevancia === 'no_aplica' && <span style={{ background:'#F8F8F8', color:'#aaa', fontSize:'11px', fontWeight:700, padding:'4px 10px', borderRadius:'10px', border:'1px solid #E8E8E8', flexShrink:0 }}>✗ No aplica</span>}
          </div>

          <div style={{ display:'flex', gap:'8px', marginTop:'12px', flexWrap:'wrap' as any }}>
            {item.url && (
              <a href={item.url} target="_blank" rel="noopener noreferrer"
                style={{ background:'#0F2447', color:'white', fontSize:'11px', fontWeight:600, padding:'5px 12px', borderRadius:'7px', textDecoration:'none', cursor:'pointer' }}>
                Ver publicación oficial →
              </a>
            )}
            {item.relevancia !== 'aplica' && (
              <button onClick={() => marcarRelevancia(item.id, 'aplica')}
                style={{ background:'#F0FDF4', color:'#065F46', border:'1px solid #BBF7D0', fontSize:'11px', fontWeight:600, padding:'5px 12px', borderRadius:'7px', cursor:'pointer' }}>
                ✓ Me aplica
              </button>
            )}
            {item.relevancia !== 'revisar' && (
              <button onClick={() => marcarRelevancia(item.id, 'revisar')}
                style={{ background:'#FFFBEB', color:'#92400E', border:'1px solid #FDE68A', fontSize:'11px', fontWeight:600, padding:'5px 12px', borderRadius:'7px', cursor:'pointer' }}>
                🔖 Revisar después
              </button>
            )}
            {item.relevancia !== 'no_aplica' && (
              <button onClick={() => marcarRelevancia(item.id, 'no_aplica')}
                style={{ background:'#F8F8F8', color:'#888', border:'1px solid #E8E8E8', fontSize:'11px', fontWeight:600, padding:'5px 12px', borderRadius:'7px', cursor:'pointer' }}>
                ✗ No me aplica
              </button>
            )}
            <button onClick={() => tog(item.id)}
              style={{ background:'none', border:'none', color:'#1D4ED8', fontSize:'11px', fontWeight:600, cursor:'pointer', padding:'5px 0' }}>
              {expandido[item.id] ? 'Ocultar nota ▲' : 'Agregar nota ▼'}
            </button>
          </div>

          {expandido[item.id] && (
            <div style={{ marginTop:'10px' }}>
              <textarea value={nota} onChange={e => setNota(e.target.value)}
                onBlur={() => guardarNota(item.id, nota)}
                placeholder="Escribe tu nota sobre esta publicación..."
                style={{ width:'100%', padding:'10px', borderRadius:'8px', border:'1.5px solid #E8E8E8', fontSize:'12px', color:'#0F2447', resize:'vertical', outline:'none', fontFamily:'sans-serif', lineHeight:1.6, boxSizing:'border-box' as any, minHeight:'80px' }} />
            </div>
          )}
        </div>
      </div>
    )
  }

  if (cargando) return <div style={{ padding:'32px', fontFamily:'sans-serif', color:'#888' }}>Cargando...</div>

  return (
    <div style={{ padding:'32px', fontFamily:'sans-serif', background:'#F7F8FA', minHeight:'100vh' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'24px', flexWrap:'wrap' as any, gap:'16px' }}>
        <div>
          <h1 style={{ color:'#0F2447', fontSize:'22px', fontWeight:700, margin:'0 0 4px' }}>Biblioteca Jurídica</h1>
          <p style={{ color:'#888', margin:0, fontSize:'13px' }}>Centro de inteligencia legal — DOF, SCJN y más</p>
        </div>
        <div style={{ display:'flex', gap:'10px', alignItems:'center' }}>
          <div style={{ display:'flex', gap:'8px' }}>
            {[
              { label:'Pendientes', val:novedades.length, color:'#0F2447' },
              { label:'Me aplica', val:miMarco.length, color:'#065F46' },
              { label:'Por revisar', val:revisar.length, color:'#F59E0B' },
            ].map((k,i) => (
              <div key={i} style={{ background:'white', borderRadius:'10px', padding:'10px 16px', border:'1px solid #F0F0F0', textAlign:'center' }}>
                <p style={{ fontSize:'20px', fontWeight:700, color:k.color, margin:'0 0 2px' }}>{k.val}</p>
                <p style={{ fontSize:'10px', color:'#888', margin:0 }}>{k.label}</p>
              </div>
            ))}
          </div>
          <button onClick={cargarRSS} disabled={cargandoRSS}
            style={{ background:'#E8321A', color:'white', border:'none', padding:'10px 20px', borderRadius:'10px', fontSize:'13px', fontWeight:700, cursor:'pointer', opacity:cargandoRSS?0.7:1 }}>
            {cargandoRSS ? 'Actualizando...' : '🔄 Actualizar novedades'}
          </button>
        </div>
      </div>

      <div style={{ background:'white', borderRadius:'16px', border:'1px solid #F0F0F0', overflow:'hidden' }}>
        <div style={{ display:'flex', borderBottom:'1px solid #F0F0F0', padding:'0 20px', overflowX:'auto' as any }}>
          <Tab id="novedades" label="Novedades" count={novedades.length} />
          <Tab id="marco" label="Mi marco legal" count={miMarco.length} />
          <Tab id="revisar" label="Por revisar" count={revisar.length} />
          <Tab id="todo" label="Todo" />
          <Tab id="ia" label="Consultar con IA" />
        </div>

        <div style={{ padding:'24px' }}>

          {(tab === 'novedades' || tab === 'marco' || tab === 'revisar' || tab === 'todo') && (
            <div style={{ display:'flex', gap:'12px', marginBottom:'20px', flexWrap:'wrap' as any }}>
              <input value={busqueda} onChange={e => setBusqueda(e.target.value)}
                placeholder="Buscar por título o contenido..."
                style={{ flex:1, minWidth:'200px', padding:'10px 14px', borderRadius:'9px', border:'1.5px solid #E8E8E8', fontSize:'13px', outline:'none', color:'#0F2447' }} />
              <select value={filtroTipo} onChange={e => setFiltroTipo(e.target.value)}
                style={{ padding:'10px 14px', borderRadius:'9px', border:'1.5px solid #E8E8E8', fontSize:'13px', color:'#0F2447', background:'white', cursor:'pointer' }}>
                <option value="todos">Todas las fuentes</option>
                <option value="dof">DOF</option>
                <option value="jurisprudencia">SCJN</option>
                <option value="circular">Circulares</option>
              </select>
            </div>
          )}

          {tab === 'novedades' && (
            <div>
              {novedades.length === 0 ? (
                <div style={{ textAlign:'center', padding:'48px', color:'#888' }}>
                  <p style={{ fontSize:'32px', margin:'0 0 12px' }}>📋</p>
                  <p style={{ fontSize:'15px', fontWeight:700, color:'#0F2447', margin:'0 0 8px' }}>Sin novedades pendientes</p>
                  <p style={{ fontSize:'13px', margin:'0 0 20px' }}>Haz clic en "Actualizar novedades" para cargar las últimas publicaciones del DOF y SCJN</p>
                  <button onClick={cargarRSS} disabled={cargandoRSS}
                    style={{ background:'#E8321A', color:'white', border:'none', padding:'12px 24px', borderRadius:'10px', fontSize:'14px', fontWeight:700, cursor:'pointer' }}>
                    {cargandoRSS ? 'Cargando...' : '🔄 Cargar novedades'}
                  </button>
                </div>
              ) : (
                novedades.filter((i:any) => {
                  const matchBusqueda = !busqueda || i.titulo?.toLowerCase().includes(busqueda.toLowerCase())
                  const matchTipo = filtroTipo === 'todos' || i.tipo === filtroTipo
                  return matchBusqueda && matchTipo
                }).map((item:any) => <CardItem key={item.id} item={item} />)
              )}
            </div>
          )}

          {tab === 'marco' && (
            <div>
              {miMarco.length === 0 ? (
                <div style={{ textAlign:'center', padding:'48px', color:'#888' }}>
                  <p style={{ fontSize:'32px', margin:'0 0 12px' }}>⚖️</p>
                  <p style={{ fontSize:'15px', fontWeight:700, color:'#0F2447', margin:'0 0 8px' }}>Tu marco legal está vacío</p>
                  <p style={{ fontSize:'13px', margin:0 }}>Marca publicaciones como "Me aplica" para construir tu marco legal personalizado</p>
                </div>
              ) : (
                miMarco.filter((i:any) => {
                  const matchBusqueda = !busqueda || i.titulo?.toLowerCase().includes(busqueda.toLowerCase())
                  const matchTipo = filtroTipo === 'todos' || i.tipo === filtroTipo
                  return matchBusqueda && matchTipo
                }).map((item:any) => <CardItem key={item.id} item={item} />)
              )}
            </div>
          )}

          {tab === 'revisar' && (
            <div>
              {revisar.length === 0 ? (
                <div style={{ textAlign:'center', padding:'48px', color:'#888' }}>
                  <p style={{ fontSize:'32px', margin:'0 0 12px' }}>🔖</p>
                  <p style={{ fontSize:'15px', fontWeight:700, color:'#0F2447', margin:'0 0 8px' }}>Sin pendientes por revisar</p>
                </div>
              ) : (
                revisar.filter((i:any) => {
                  const matchBusqueda = !busqueda || i.titulo?.toLowerCase().includes(busqueda.toLowerCase())
                  const matchTipo = filtroTipo === 'todos' || i.tipo === filtroTipo
                  return matchBusqueda && matchTipo
                }).map((item:any) => <CardItem key={item.id} item={item} />)
              )}
            </div>
          )}

          {tab === 'todo' && (
            <div>
              {itemsFiltrados.length === 0 ? (
                <p style={{ color:'#888', fontSize:'13px' }}>Sin resultados</p>
              ) : (
                itemsFiltrados.map((item:any) => <CardItem key={item.id} item={item} />)
              )}
            </div>
          )}

          {tab === 'ia' && (
            <div>
              <div style={{ background:'#F0F7FF', borderRadius:'12px', padding:'20px', marginBottom:'20px', border:'1px solid #BFDBFE' }}>
                <p style={{ fontSize:'13px', fontWeight:700, color:'#1D4ED8', margin:'0 0 4px' }}>Consultar con Inteligencia Artificial</p>
                <p style={{ fontSize:'12px', color:'#555', margin:0 }}>Pega una ley, reforma o cláusula y pregunta si te aplica y cómo impacta a T1 Pagos / Claro Pagos</p>
              </div>

              <textarea value={preguntaIA} onChange={e => setPreguntaIA(e.target.value)}
                placeholder={`Ejemplos:\n• "¿La reforma a la Ley Fintech publicada el [fecha] me aplica y cómo?"\n• "¿Esta cláusula de protección de datos cumple con la LFPDPPP?"\n• "¿Qué obligaciones tengo con esta nueva circular de CNBV?"`}
                style={{ width:'100%', minHeight:'140px', padding:'16px', borderRadius:'10px', border:'1.5px solid #E8E8E8', fontSize:'13px', color:'#0F2447', resize:'vertical', outline:'none', fontFamily:'sans-serif', lineHeight:1.7, boxSizing:'border-box' as any, marginBottom:'12px' }} />

              <button onClick={consultarIA} disabled={consultando || !preguntaIA.trim()}
                style={{ background:'#0F2447', color:'white', border:'none', padding:'11px 24px', borderRadius:'9px', fontSize:'13px', fontWeight:700, cursor:'pointer', opacity:(consultando||!preguntaIA.trim())?0.6:1, marginBottom:'20px' }}>
                {consultando ? 'Consultando...' : '⚡ Consultar con IA'}
              </button>

              {respuestaIA && (
                <div style={{ background:'white', borderRadius:'12px', padding:'20px', border:'1px solid #E8E8E8' }}>
                  <p style={{ fontSize:'11px', fontWeight:700, color:'#888', textTransform:'uppercase' as any, letterSpacing:'0.05em', margin:'0 0 12px' }}>Respuesta</p>
                  <pre style={{ fontSize:'13px', color:'#0F2447', margin:0, whiteSpace:'pre-wrap', fontFamily:'sans-serif', lineHeight:1.8 }}>{respuestaIA}</pre>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
