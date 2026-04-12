'use client'
import { useState, useEffect, useRef } from 'react'
import { obtenerSolicitudes } from '@/lib/supabase/solicitudes'
import { createClient } from '@supabase/supabase-js'

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export default function Entrenamiento() {
  const [flujo, setFlujo] = useState<'inicio'|'config'|'sesion'|'reporte'>('inicio')
  const [solicitudes, setSolicitudes] = useState<any[]>([])
  const [solicitudSel, setSolicitudSel] = useState<any>(null)
  const [rolClaude, setRolClaude] = useState<'contraparte'|'t1'|''>('')
  const [perfil, setPerfil] = useState<'agresivo'|'colaborativo'|'tecnico'|'impredecible'|''>('')
  const [mensajes, setMensajes] = useState<any[]>([])
  const [input, setInput] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [sesiones, setSesiones] = useState<any[]>([])
  const [tab, setTab] = useState<'nuevo'|'historial'>('nuevo')
  const [reporte, setReporte] = useState('')
  const [generandoReporte, setGenerandoReporte] = useState(false)
  const [busquedaContrato, setBusquedaContrato] = useState('')
  const [modoNeg, setModoNeg] = useState<'completo'|'clausula'>('completo')
  const [clausulasSel, setClausulasSel] = useState<string[]>([])
  const [cargando, setCargando] = useState(true)
  const chatRef = useRef<any>(null)

  useEffect(() => { cargar() }, [])
  useEffect(() => { if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight }, [mensajes])

  const cargar = async () => {
    setCargando(true)
    try {
      const sols = await obtenerSolicitudes()
      setSolicitudes(sols || [])
      const { data } = await sb.from('sesiones_entrenamiento').select('*').order('created_at', { ascending: false }).limit(20)
      setSesiones(data || [])
    } catch(e) { console.error(e) }
    setCargando(false)
  }

  const perfiles = [
    { id:'agresivo', label:'Agresivo', emoji:'🦁', color:'#E8321A', bg:'#FFF5F5', border:'#FFD0CC', desc:'Presiona constantemente, no cede fácilmente, usa tácticas de presión y amenaza con buscar otro proveedor' },
    { id:'colaborativo', label:'Colaborativo', emoji:'🤝', color:'#065F46', bg:'#F0FDF4', border:'#BBF7D0', desc:'Busca acuerdos razonables, flexible pero firme en puntos clave, orientado a la relación a largo plazo' },
    { id:'tecnico', label:'Técnico-Legal', emoji:'🔬', color:'#1D4ED8', bg:'#EFF6FF', border:'#BFDBFE', desc:'Cita leyes y jurisprudencia en cada argumento, preciso, difícil de rebatir sin fundamento legal' },
    { id:'impredecible', label:'Impredecible', emoji:'🎭', color:'#7C3AED', bg:'#F3E8FF', border:'#DDD6FE', desc:'Mezcla estilos como en la vida real — a veces colabora, a veces presiona, impredecible' },
  ]

  const roles = [
    {
      id: 'contraparte',
      label: 'Claude es la Contraparte',
      emoji: '🏢',
      color: '#0F2447',
      bg: '#EFF6FF',
      border: '#BFDBFE',
      desc: 'Tú representas a T1. Claude toma el rol del cliente o contraparte. Practica defender los intereses de T1.',
      tuRol: 'Tú = T1',
      claudeRol: 'Claude = Contraparte / Cliente'
    },
    {
      id: 't1',
      label: 'Claude es T1',
      emoji: '⚖️',
      color: '#7C3AED',
      bg: '#F3E8FF',
      border: '#DDD6FE',
      desc: 'Tú representas al cliente o contraparte. Claude defiende los intereses de T1. Practica entender el otro lado.',
      tuRol: 'Tú = Contraparte / Cliente',
      claudeRol: 'Claude = T1'
    },
  ]

  const iniciarSesion = async () => {
    if (!solicitudSel || !rolClaude || !perfil) return
    const clausulasTexto = modoNeg === 'clausula' && clausulasSel.filter(c=>c.trim()).length > 0 ? `Las cláusulas a negociar son: ${clausulasSel.filter(c=>c.trim()).join(', ')}.` : 'Negocia el contrato completo.'
      const sistemPrompt = rolClaude === 'contraparte'
      ? `Eres la contraparte/cliente en una negociación de contrato con T1. El contrato es: ${solicitudSel.tipo_solicitud || 'Contrato'} con ${solicitudSel.nombre_empresa || solicitudSel.nombre}. ${clausulasTexto} Tu perfil es ${perfil}. ${perfil === 'agresivo' ? 'Presiona constantemente, no cedas fácilmente, amenaza con buscar otro proveedor si no obtienes lo que quieres.' : perfil === 'colaborativo' ? 'Busca acuerdos razonables pero mantén firmes tus puntos clave.' : perfil === 'tecnico' ? 'Cita leyes mexicanas y jurisprudencia SCJN en cada argumento.' : 'Varía tu estilo — a veces colabora, a veces presiona.'} Responde SIEMPRE en español, de forma concisa (máximo 3 párrafos). Al final de cada mensaje incluye una táctica de negociación entre corchetes [TÁCTICA: nombre].`
      : `Eres el representante legal de T1 en una negociación. El contrato es: ${solicitudSel.tipo_solicitud || 'Contrato'} con ${solicitudSel.nombre_empresa || solicitudSel.nombre}. ${clausulasTexto} Tu perfil es ${perfil}. Defiende los intereses de T1. ${perfil === 'agresivo' ? 'Mantén posiciones firmes, no cedas en puntos clave para T1.' : perfil === 'colaborativo' ? 'Busca acuerdos pero protege los intereses de T1.' : perfil === 'tecnico' ? 'Argumenta con leyes mexicanas y jurisprudencia SCJN.' : 'Varía tu estilo según la situación.'} Responde SIEMPRE en español, de forma concisa. Al final incluye [TÁCTICA: nombre].`

    const mensajeInicial = rolClaude === 'contraparte'
      ? `Buenos días. He revisado el contrato ${solicitudSel.tipo_solicitud || ''} y quisiera discutir algunos puntos antes de proceder.`
      : `Buenos días. Les presento el contrato de ${solicitudSel.tipo_solicitud || 'servicios'} que hemos preparado para esta relación comercial.`

    setMensajes([{
      rol: 'claude',
      texto: mensajeInicial,
      sistemaPrompt: sistemPrompt,
      perfil,
      rolClaude
    }])
    setFlujo('sesion')
  }

  const enviarMensaje = async () => {
    if (!input.trim() || enviando) return
    const nuevoMensaje = { rol: 'user', texto: input }
    const historial = [...mensajes, nuevoMensaje]
    setMensajes(historial)
    setInput('')
    setEnviando(true)

    try {
      const sistemPrompt = mensajes[0]?.sistemaPrompt || ''
      const messagesAPI = historial.map((m:any) => ({
        role: m.rol === 'user' ? 'user' : 'assistant',
        content: m.texto
      }))

      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          system: sistemPrompt,
          messages: messagesAPI
        })
      })
      const data = await res.json()

      if (data.error?.type === 'authentication_error') {
        setMensajes(prev => [...prev, {
          rol: 'claude',
          texto: '⚠️ API key de Claude pendiente de configurar. Este simulador se activará automáticamente cuando se configure.',
        }])
      } else {
        const respuesta = data.content?.[0]?.text || 'Sin respuesta'
        setMensajes(prev => [...prev, { rol: 'claude', texto: respuesta }])
      }
    } catch(e) {
      setMensajes(prev => [...prev, { rol: 'claude', texto: '⚠️ API key pendiente de configurar.' }])
    }
    setEnviando(false)
  }

  const generarReporte = async () => {
    setGenerandoReporte(true)
    setFlujo('reporte')
    try {
      const conversacion = mensajes.map((m:any) => `${m.rol === 'user' ? 'Negociador' : 'Contraparte'}: ${m.texto}`).join('\n\n')
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          system: 'Eres un experto en negociación legal. Analiza la conversación de negociación y genera un reporte de desempeño detallado en español.',
          messages: [{
            role: 'user',
            content: `Analiza esta negociación y genera un reporte con: 1) Calificación general (1-10), 2) Fortalezas demostradas, 3) Áreas de mejora, 4) Momentos clave, 5) Recomendaciones específicas.\n\nConversación:\n${conversacion}`
          }]
        })
      })
      const data = await res.json()
      if (data.error?.type === 'authentication_error') {
        setReporte('⚠️ API key pendiente. El reporte de desempeño se activará cuando se configure Claude.')
      } else {
        setReporte(data.content?.[0]?.text || 'Sin reporte')
        // Guardar sesion
        await sb.from('sesiones_entrenamiento').insert([{
          contrato_id: solicitudSel?.id,
          empresa: solicitudSel?.nombre_empresa || solicitudSel?.nombre,
          rol_claude: rolClaude,
          perfil,
          mensajes: mensajes,
          reporte: data.content?.[0]?.text,
          created_at: new Date().toISOString()
        }])
      }
    } catch(e) {
      setReporte('⚠️ API key pendiente de configurar.')
    }
    setGenerandoReporte(false)
  }

  const Tab = ({ id, label }: any) => (
    <button onClick={() => setTab(id)}
      style={{ padding:'10px 20px', background:'none', border:'none', borderBottom:`2px solid ${tab===id?'#E8321A':'transparent'}`, color:tab===id?'#E8321A':'#888', fontWeight:tab===id?700:400, fontSize:'13px', cursor:'pointer', fontFamily:'sans-serif' }}>
      {label}
    </button>
  )

  if (cargando) return <div style={{ padding:'32px', fontFamily:'sans-serif', color:'#888' }}>Cargando...</div>

  return (
    <div style={{ padding:'32px', fontFamily:'sans-serif', background:'#F7F8FA', minHeight:'100vh' }}>

      {/* HEADER */}
      <div style={{ marginBottom:'24px' }}>
        <h1 style={{ color:'#0F2447', fontSize:'22px', fontWeight:700, margin:'0 0 4px' }}>El Dojo — Simulador de Negociación</h1>
        <p style={{ color:'#888', margin:0, fontSize:'13px' }}>Practica negociaciones reales con IA como contraparte</p>
      </div>

      <div style={{ background:'white', borderRadius:'16px', border:'1px solid #F0F0F0', overflow:'hidden' }}>
        <div style={{ display:'flex', borderBottom:'1px solid #F0F0F0', padding:'0 20px' }}>
          <Tab id="nuevo" label="Nueva sesión" />
          <Tab id="historial" label={`Historial (${sesiones.length})`} />
        </div>

        <div style={{ padding:'24px' }}>

          {/* HISTORIAL */}
          {tab === 'historial' && (
            <div>
              {sesiones.length === 0 ? (
                <div style={{ textAlign:'center', padding:'48px', color:'#888' }}>
                  <p style={{ fontSize:'32px', margin:'0 0 12px' }}>🥋</p>
                  <p style={{ fontSize:'15px', fontWeight:700, color:'#0F2447', margin:'0 0 8px' }}>Sin sesiones aún</p>
                  <p style={{ fontSize:'13px', margin:0 }}>Completa tu primera simulación para ver el historial</p>
                </div>
              ) : sesiones.map((s:any, i:number) => (
                <div key={i} style={{ padding:'16px 18px', background:'white', borderRadius:'10px', border:'1px solid #F0F0F0', marginBottom:'8px' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <div>
                      <p style={{ fontSize:'13px', fontWeight:700, color:'#0F2447', margin:'0 0 4px' }}>{s.empresa} — {s.contrato_id}</p>
                      <p style={{ fontSize:'11px', color:'#888', margin:0 }}>
                        {s.rol_claude === 'contraparte' ? '🏢 Claude como Contraparte' : '⚖️ Claude como T1'} · 
                        {s.perfil === 'agresivo' ? ' 🦁 Agresivo' : s.perfil === 'colaborativo' ? ' 🤝 Colaborativo' : s.perfil === 'tecnico' ? ' 🔬 Técnico' : ' 🎭 Impredecible'} · 
                        {new Date(s.created_at).toLocaleDateString('es-MX', { day:'numeric', month:'short', year:'numeric' })}
                      </p>
                    </div>
                    <span style={{ fontSize:'11px', color:'#1D4ED8', fontWeight:600 }}>{s.mensajes?.length || 0} mensajes</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* NUEVA SESION — INICIO */}
          {tab === 'nuevo' && flujo === 'inicio' && (
            <div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px', marginBottom:'32px' }}>
                {[
                  { emoji:'🥋', titulo:'Practicar negociación', desc:'Simula una negociación real con un contrato de tu sistema', accion:'nueva' },
                  { emoji:'📊', titulo:'Ver historial', desc:'Revisa tus sesiones anteriores y tu progreso', accion:'historial' },
                ].map((c,i) => (
                  <div key={i} onClick={() => c.accion === 'nueva' ? setFlujo('config') : setTab('historial')}
                    style={{ padding:'24px', background:'#F8F8F8', borderRadius:'12px', border:'1px solid #F0F0F0', cursor:'pointer', textAlign:'center' }}>
                    <p style={{ fontSize:'36px', margin:'0 0 12px' }}>{c.emoji}</p>
                    <p style={{ fontSize:'14px', fontWeight:700, color:'#0F2447', margin:'0 0 6px' }}>{c.titulo}</p>
                    <p style={{ fontSize:'12px', color:'#888', margin:0 }}>{c.desc}</p>
                  </div>
                ))}
              </div>

              <div style={{ background:'#F0F7FF', borderRadius:'12px', padding:'20px', border:'1px solid #BFDBFE' }}>
                <p style={{ fontSize:'13px', fontWeight:700, color:'#1D4ED8', margin:'0 0 8px' }}>⚡ Powered by Claude AI</p>
                <p style={{ fontSize:'12px', color:'#555', margin:0 }}>Este simulador usa Claude para generar respuestas reales de negociación. Cuando se configure el API key, la contraparte responderá con argumentos legales reales basados en tu contrato.</p>
              </div>
            </div>
          )}

          {/* CONFIGURACION */}
          {tab === 'nuevo' && flujo === 'config' && (
            <div>
              <div style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'24px' }}>
                <button onClick={() => setFlujo('inicio')}
                  style={{ background:'none', border:'none', color:'#888', cursor:'pointer', fontSize:'13px', padding:0 }}>← Volver</button>
                <p style={{ fontSize:'16px', fontWeight:700, color:'#0F2447', margin:0 }}>Configurar simulación</p>
              </div>

              {/* PASO 1 — CONTRATO */}
              <div style={{ marginBottom:'24px' }}>
                <p style={{ fontSize:'11px', fontWeight:700, color:'#888', textTransform:'uppercase' as any, letterSpacing:'0.05em', margin:'0 0 12px' }}>1. Selecciona el contrato a negociar</p>
                {/* Busqueda */}
                <div style={{ position:'relative' as any, marginBottom:'8px' }}>
                  <input value={busquedaContrato} onChange={e => { setBusquedaContrato(e.target.value); if (!e.target.value) setSolicitudSel(null) }}
                    placeholder="Buscar por empresa, ID o tipo de contrato..."
                    style={{ width:'100%', padding:'11px 14px', borderRadius:'9px', border:`1.5px solid ${solicitudSel?'#1D4ED8':'#E8E8E8'}`, fontSize:'13px', outline:'none', color:'#0F2447', boxSizing:'border-box' as any }} />
                  {solicitudSel && <span style={{ position:'absolute' as any, right:'12px', top:'50%', transform:'translateY(-50%)', fontSize:'11px', color:'#065F46', fontWeight:700 }}>✓ Seleccionado</span>}
                </div>

                {/* Resultados solo cuando hay busqueda y no hay seleccion */}
                {busquedaContrato && !solicitudSel && (
                  <div style={{ background:'white', border:'1px solid #E8E8E8', borderRadius:'10px', overflow:'hidden', marginBottom:'8px', boxShadow:'0 4px 12px rgba(0,0,0,0.08)' }}>
                    {solicitudes.filter((s:any) => s.estado !== 'Cerrado' && (
                      s.id?.toLowerCase().includes(busquedaContrato.toLowerCase()) ||
                      (s.nombre_empresa||s.nombre||'').toLowerCase().includes(busquedaContrato.toLowerCase()) ||
                      (s.tipo_solicitud||'').toLowerCase().includes(busquedaContrato.toLowerCase())
                    )).slice(0,8).map((s:any, i:number) => (
                      <div key={i} onClick={() => { setSolicitudSel(s); setBusquedaContrato(`${s.nombre_empresa||s.nombre||'—'} — ${s.id}`); setClausulasSel([]) }}
                        style={{ padding:'12px 16px', borderBottom:'1px solid #F0F0F0', cursor:'pointer', display:'flex', justifyContent:'space-between', alignItems:'center' }}
                        onMouseEnter={e => (e.currentTarget.style.background='#F8F8F8')}
                        onMouseLeave={e => (e.currentTarget.style.background='white')}>
                        <div>
                          <p style={{ fontSize:'13px', fontWeight:700, color:'#0F2447', margin:'0 0 2px' }}>{s.nombre_empresa||s.nombre||'—'}</p>
                          <p style={{ fontSize:'11px', color:'#888', margin:0 }}>{s.tipo_solicitud||'—'} · {s.empresa_t1||'—'} · {s.estado}</p>
                        </div>
                        <span style={{ fontSize:'11px', color:'#aaa', flexShrink:0, marginLeft:'12px' }}>{s.id}</span>
                      </div>
                    ))}
                    {solicitudes.filter((s:any) => s.estado !== 'Cerrado' && (
                      s.id?.toLowerCase().includes(busquedaContrato.toLowerCase()) ||
                      (s.nombre_empresa||s.nombre||'').toLowerCase().includes(busquedaContrato.toLowerCase()) ||
                      (s.tipo_solicitud||'').toLowerCase().includes(busquedaContrato.toLowerCase())
                    )).length === 0 && (
                      <p style={{ padding:'16px', color:'#888', fontSize:'13px', margin:0 }}>Sin resultados</p>
                    )}
                  </div>
                )}

                {/* Contrato seleccionado */}
                {solicitudSel && (
                  <div style={{ background:'#EFF6FF', borderRadius:'10px', padding:'14px 16px', border:'1.5px solid #BFDBFE', marginBottom:'16px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <div>
                      <p style={{ fontSize:'13px', fontWeight:700, color:'#0F2447', margin:'0 0 2px' }}>{solicitudSel.nombre_empresa||solicitudSel.nombre||'—'}</p>
                      <p style={{ fontSize:'11px', color:'#888', margin:0 }}>{solicitudSel.tipo_solicitud||'—'} · {solicitudSel.empresa_t1||'—'} · {solicitudSel.id}</p>
                    </div>
                    <button onClick={() => { setSolicitudSel(null); setBusquedaContrato('') }}
                      style={{ background:'none', border:'none', color:'#888', cursor:'pointer', fontSize:'16px' }}>✕</button>
                  </div>
                )}

                {/* Modo negociacion - aparece solo cuando hay contrato */}
                {solicitudSel && (
                  <div style={{ marginTop:'4px' }}>
                    <p style={{ fontSize:'11px', fontWeight:700, color:'#888', textTransform:'uppercase' as any, letterSpacing:'0.05em', margin:'0 0 10px' }}>Modo de negociación</p>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', marginBottom: modoNeg==='clausula'?'12px':'0' }}>
                      {[
                        { id:'completo', label:'Contrato completo', emoji:'📄', desc:'Negocia todo el contrato' },
                        { id:'clausula', label:'Cláusula específica', emoji:'🔍', desc:'Selecciona cláusulas puntuales' },
                      ].map((m:any) => (
                        <div key={m.id} onClick={() => setModoNeg(m.id)}
                          style={{ padding:'12px 14px', background: modoNeg===m.id?'#EFF6FF':'white', borderRadius:'10px', border:`1.5px solid ${modoNeg===m.id?'#1D4ED8':'#F0F0F0'}`, cursor:'pointer' }}>
                          <p style={{ fontSize:'13px', fontWeight:700, color: modoNeg===m.id?'#1D4ED8':'#0F2447', margin:'0 0 3px' }}>{m.emoji} {m.label}</p>
                          <p style={{ fontSize:'11px', color:'#888', margin:0 }}>{m.desc}</p>
                        </div>
                      ))}
                    </div>
                    {modoNeg === 'clausula' && (
                      <textarea value={clausulasSel.join('\n')} onChange={e => setClausulasSel(e.target.value.split('\n'))}
                        placeholder={"Escribe las cláusulas a negociar, una por línea:\n\nEj: Condiciones de pago\nVigencia del contrato\nPenalizaciones"}
                        style={{ width:'100%', minHeight:'90px', padding:'10px', borderRadius:'8px', border:'1.5px solid #E8E8E8', fontSize:'12px', color:'#0F2447', resize:'vertical', outline:'none', fontFamily:'sans-serif', boxSizing:'border-box' as any }} />
                    )}
                  </div>
                )}
              </div>

              {/* PASO 2 — ROL */}
              <div style={{ marginBottom:'24px' }}>
                <p style={{ fontSize:'11px', fontWeight:700, color:'#888', textTransform:'uppercase' as any, letterSpacing:'0.05em', margin:'0 0 12px' }}>2. Define los roles</p>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
                  {roles.map((r:any) => (
                    <div key={r.id} onClick={() => setRolClaude(r.id)}
                      style={{ padding:'16px', background: rolClaude===r.id ? r.bg : 'white', borderRadius:'12px', border:`1.5px solid ${rolClaude===r.id ? r.border : '#F0F0F0'}`, cursor:'pointer' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'8px' }}>
                        <span style={{ fontSize:'20px' }}>{r.emoji}</span>
                        <p style={{ fontSize:'13px', fontWeight:700, color:r.color, margin:0 }}>{r.label}</p>
                      </div>
                      <p style={{ fontSize:'11px', color:'#555', margin:'0 0 8px', lineHeight:1.5 }}>{r.desc}</p>
                      <div style={{ display:'flex', gap:'6px', flexWrap:'wrap' as any }}>
                        <span style={{ background:r.bg, color:r.color, fontSize:'10px', fontWeight:700, padding:'2px 8px', borderRadius:'10px', border:`1px solid ${r.border}` }}>{r.tuRol}</span>
                        <span style={{ background:'#F8F8F8', color:'#555', fontSize:'10px', fontWeight:600, padding:'2px 8px', borderRadius:'10px' }}>{r.claudeRol}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* PASO 3 — PERFIL */}
              <div style={{ marginBottom:'24px' }}>
                <p style={{ fontSize:'11px', fontWeight:700, color:'#888', textTransform:'uppercase' as any, letterSpacing:'0.05em', margin:'0 0 12px' }}>3. Perfil de la contraparte</p>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:'10px' }}>
                  {perfiles.map((p:any) => (
                    <div key={p.id} onClick={() => setPerfil(p.id)}
                      style={{ padding:'14px 16px', background: perfil===p.id ? p.bg : 'white', borderRadius:'10px', border:`1.5px solid ${perfil===p.id ? p.border : '#F0F0F0'}`, cursor:'pointer' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'4px' }}>
                        <span style={{ fontSize:'18px' }}>{p.emoji}</span>
                        <p style={{ fontSize:'13px', fontWeight:700, color:p.color, margin:0 }}>{p.label}</p>
                      </div>
                      <p style={{ fontSize:'11px', color:'#666', margin:0, lineHeight:1.5 }}>{p.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              <button onClick={iniciarSesion} disabled={!solicitudSel || !rolClaude || !perfil || !modoNeg}
                style={{ background:'#0F2447', color:'white', border:'none', padding:'12px 32px', borderRadius:'10px', fontSize:'14px', fontWeight:700, cursor:'pointer', opacity:(!solicitudSel||!rolClaude||!perfil)?0.5:1, width:'100%' }}>
                🥋 Iniciar simulación
              </button>
            </div>
          )}

          {/* SESION ACTIVA */}
          {tab === 'nuevo' && flujo === 'sesion' && (
            <div>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'16px' }}>
                <div>
                  <p style={{ fontSize:'14px', fontWeight:700, color:'#0F2447', margin:'0 0 2px' }}>
                    {solicitudSel?.nombre_empresa || solicitudSel?.nombre} — {solicitudSel?.tipo_solicitud}
                  </p>
                  <p style={{ fontSize:'11px', color:'#888', margin:0 }}>
                    {rolClaude === 'contraparte' ? '🏢 Claude = Contraparte | Tú = T1' : '⚖️ Claude = T1 | Tú = Contraparte'} · 
                    {perfil === 'agresivo' ? ' 🦁 Agresivo' : perfil === 'colaborativo' ? ' 🤝 Colaborativo' : perfil === 'tecnico' ? ' 🔬 Técnico' : ' 🎭 Impredecible'}
                  </p>
                </div>
                <button onClick={generarReporte} disabled={mensajes.length < 3}
                  style={{ background:'#065F46', color:'white', border:'none', padding:'9px 18px', borderRadius:'8px', fontSize:'12px', fontWeight:700, cursor:'pointer', opacity:mensajes.length < 3 ? 0.5 : 1 }}>
                  📊 Terminar y ver reporte
                </button>
              </div>

              <div ref={chatRef} style={{ height:'400px', overflowY:'auto', background:'#F8F8F8', borderRadius:'12px', padding:'16px', marginBottom:'12px', display:'flex', flexDirection:'column', gap:'10px' }}>
                {mensajes.filter((m:any) => m.rol !== 'config').map((m:any, i:number) => (
                  <div key={i} style={{ display:'flex', justifyContent: m.rol==='user'?'flex-end':'flex-start' }}>
                    <div style={{ maxWidth:'75%', padding:'12px 16px', borderRadius: m.rol==='user'?'16px 16px 4px 16px':'16px 16px 16px 4px', background: m.rol==='user'?'#0F2447':'white', color: m.rol==='user'?'white':'#0F2447', fontSize:'13px', lineHeight:1.6, boxShadow:'0 1px 4px rgba(0,0,0,0.08)' }}>
                      <p style={{ margin:'0 0 4px', fontSize:'10px', fontWeight:700, opacity:0.7 }}>
                        {m.rol==='user' ? 'Tú' : rolClaude==='contraparte'?'Contraparte':'T1 (Claude)'}
                      </p>
                      <p style={{ margin:0, whiteSpace:'pre-wrap' }}>{m.texto}</p>
                    </div>
                  </div>
                ))}
                {enviando && (
                  <div style={{ display:'flex', justifyContent:'flex-start' }}>
                    <div style={{ padding:'12px 16px', borderRadius:'16px 16px 16px 4px', background:'white', color:'#888', fontSize:'13px' }}>
                      Escribiendo...
                    </div>
                  </div>
                )}
              </div>

              <div style={{ display:'flex', gap:'8px' }}>
                <input value={input} onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key==='Enter' && !e.shiftKey && enviarMensaje()}
                  placeholder="Escribe tu argumento de negociación..."
                  style={{ flex:1, padding:'12px 16px', borderRadius:'10px', border:'1.5px solid #E8E8E8', fontSize:'13px', outline:'none', color:'#0F2447', fontFamily:'sans-serif' }} />
                <button onClick={enviarMensaje} disabled={enviando || !input.trim()}
                  style={{ background:'#0F2447', color:'white', border:'none', padding:'12px 20px', borderRadius:'10px', fontSize:'13px', fontWeight:700, cursor:'pointer', opacity:(enviando||!input.trim())?0.5:1 }}>
                  Enviar
                </button>
              </div>
            </div>
          )}

          {/* REPORTE */}
          {tab === 'nuevo' && flujo === 'reporte' && (
            <div>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px' }}>
                <p style={{ fontSize:'16px', fontWeight:700, color:'#0F2447', margin:0 }}>📊 Reporte de desempeño</p>
                <button onClick={() => { setFlujo('inicio'); setMensajes([]); setSolicitudSel(null); setRolClaude(''); setPerfil('') }}
                  style={{ background:'#0F2447', color:'white', border:'none', padding:'9px 18px', borderRadius:'8px', fontSize:'13px', fontWeight:700, cursor:'pointer' }}>
                  Nueva simulación
                </button>
              </div>

              {generandoReporte ? (
                <div style={{ textAlign:'center', padding:'48px', color:'#888' }}>
                  <p style={{ fontSize:'32px', margin:'0 0 12px' }}>⏳</p>
                  <p style={{ fontSize:'14px', fontWeight:700, color:'#0F2447', margin:0 }}>Analizando tu desempeño...</p>
                </div>
              ) : (
                <div style={{ background:'#F0F7FF', borderRadius:'12px', padding:'24px', border:'1px solid #BFDBFE' }}>
                  <pre style={{ fontSize:'13px', color:'#0F2447', margin:0, whiteSpace:'pre-wrap', fontFamily:'sans-serif', lineHeight:1.9 }}>{reporte}</pre>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
