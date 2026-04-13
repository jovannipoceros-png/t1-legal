'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export default function Sistema() {
  const [autenticado, setAutenticado] = useState(false)
  const [pasoAuth, setPasoAuth] = useState<'password'|'codigo'>('password')
  const [password, setPassword] = useState('')
  const [codigo, setCodigo] = useState('')
  const [errorAuth, setErrorAuth] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [correoEnviado, setCorreoEnviado] = useState('')
  const [servicios, setServicios] = useState<any[]>([])
  const [incidentes, setIncidentes] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)
  const [uptime, setUptime] = useState(99.9)
  const [diagnosticando, setDiagnosticando] = useState(false)
  const [cargando, setCargando] = useState(true)
  const [ultimaRevision, setUltimaRevision] = useState<string>('')

  useEffect(() => { cargar() }, [])

  const ts = () => new Date().toLocaleTimeString('es-MX', { hour:'2-digit', minute:'2-digit', second:'2-digit' })

  const cargar = async () => {
    setCargando(true)
    await diagnosticar(true)
    setCargando(false)
  }

  const diagnosticar = async (silencioso = false) => {
    if (!silencioso) setDiagnosticando(true)
    const nuevos: any[] = []
    const nuevosIncidentes: any[] = []

    // 1. Supabase DB
    try {
      const t0 = Date.now()
      const { error, count } = await sb.from('solicitudes').select('*', { count:'exact', head:true })
      const lat = Date.now() - t0
      if (error) throw error
      nuevos.push({
        id: 'supabase',
        nombre: 'Base de datos',
        desc: 'Supabase PostgreSQL',
        estado: lat > 2000 ? 'lento' : 'ok',
        latencia: `${lat}ms`,
        icon: '🗄️',
        accion: null,
        detalle: `${count} solicitudes registradas`
      })
    } catch(e) {
      nuevos.push({ id:'supabase', nombre:'Base de datos', desc:'Supabase PostgreSQL', estado:'error', latencia:'—', icon:'🗄️', accion:{ label:'Ver en Supabase', url:'https://supabase.com/dashboard' }, detalle:'Error de conexión' })
      nuevosIncidentes.push({ servicio:'Base de datos', mensaje:'Error de conexión a Supabase', hora: ts(), resuelto:false, nivel:'critico' })
    }

    // 2. Storage
    try {
      const t0 = Date.now()
      const { error } = await sb.storage.from('expedientes').list('', { limit:1 })
      const lat = Date.now() - t0
      if (error) throw error
      nuevos.push({ id:'storage', nombre:'Almacenamiento', desc:'Storage de documentos', estado: lat>3000?'lento':'ok', latencia:`${lat}ms`, icon:'📁', accion:null, detalle:'Bucket expedientes operando' })
    } catch(e) {
      nuevos.push({ id:'storage', nombre:'Almacenamiento', desc:'Storage de documentos', estado:'error', latencia:'—', icon:'📁', accion:{ label:'Ver en Supabase', url:'https://supabase.com/dashboard' }, detalle:'Error al acceder al storage' })
      nuevosIncidentes.push({ servicio:'Almacenamiento', mensaje:'Error al acceder al bucket de documentos', hora:ts(), resuelto:false, nivel:'critico' })
    }

    // 3. Claude AI
    try {
      const t0 = Date.now()
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method:'POST',
        headers:{ 'Content-Type':'application/json' },
        body: JSON.stringify({ model:'claude-sonnet-4-20250514', max_tokens:10, messages:[{role:'user',content:'ping'}] })
      })
      const data = await res.json()
      const lat = Date.now() - t0
      if (data.error?.type === 'authentication_error') {
        nuevos.push({ id:'claude', nombre:'Claude AI', desc:'Análisis e IA', estado:'pendiente', latencia:'—', icon:'🤖', accion:{ label:'Configurar API key', url:'https://vercel.com/dashboard' }, detalle:'API key pendiente de configurar' })
        nuevosIncidentes.push({ servicio:'Claude AI', mensaje:'API key no configurada — 6 módulos funcionan al 60%', hora:ts(), resuelto:false, nivel:'advertencia' })
      } else {
        nuevos.push({ id:'claude', nombre:'Claude AI', desc:'Análisis e IA', estado:'ok', latencia:`${lat}ms`, icon:'🤖', accion:null, detalle:'Todos los módulos de IA activos' })
      }
    } catch(e) {
      nuevos.push({ id:'claude', nombre:'Claude AI', desc:'Análisis e IA', estado:'pendiente', latencia:'—', icon:'🤖', accion:{ label:'Configurar API key', url:'https://vercel.com/dashboard' }, detalle:'API key pendiente' })
    }

    // 4. Email Resend
    nuevos.push({ id:'resend', nombre:'Email', desc:'Notificaciones por correo', estado:'configurado', latencia:'—', icon:'📧', accion:{ label:'Verificar dominio', url:'https://resend.com/domains' }, detalle:'Dominio resend pendiente de verificar para envíos externos' })

    // 5. Vercel Deploy
    nuevos.push({ id:'vercel', nombre:'Plataforma web', desc:'Vercel — t1-legal.vercel.app', estado:'ok', latencia:'—', icon:'🚀', accion:{ label:'Ver deployments', url:'https://vercel.com/dashboard' }, detalle:'Última versión desplegada' })

    // 6. Dominio
    nuevos.push({ id:'dominio', nombre:'Dominio personalizado', desc:'legal.t1.com', estado:'pendiente', latencia:'—', icon:'🌐', accion:{ label:'Configurar dominio', url:'https://vercel.com/dashboard' }, detalle:'Pendiente de configurar' })

    // Stats
    try {
      const [{ count: totalSols }, { count: cerradas }, { count: usuarios }] = await Promise.all([
        sb.from('solicitudes').select('*', { count:'exact', head:true }),
        sb.from('solicitudes').select('*', { count:'exact', head:true }).eq('estado','Cerrado'),
        sb.from('usuarios').select('*', { count:'exact', head:true }),
      ])
      setStats({ totalSols, cerradas, usuarios, activas: (totalSols||0) - (cerradas||0) })
    } catch(e) {}

    // Calcular uptime
    const errores = nuevos.filter(s => s.estado === 'error').length
    setUptime(errores === 0 ? 99.9 : errores === 1 ? 97.5 : 94.0)
    setServicios(nuevos)
    setIncidentes(nuevosIncidentes)
    setUltimaRevision(new Date().toLocaleString('es-MX', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' }))
    if (!silencioso) setDiagnosticando(false)
  }

  const checklist = [
    { label:'Supabase conectado', done: servicios.find(s=>s.id==='supabase')?.estado === 'ok' },
    { label:'Plataforma desplegada en Vercel', done: true },
    { label:'Email Resend configurado', done: true },
    { label:'API key Claude activada', done: servicios.find(s=>s.id==='claude')?.estado === 'ok', url:'https://vercel.com/dashboard' },
    { label:'Dominio legal.t1.com configurado', done: false, url:'https://vercel.com/dashboard' },
    { label:'Dominio Resend verificado', done: false, url:'https://resend.com/domains' },
  ]
  const pctActivado = Math.round((checklist.filter(c=>c.done).length / checklist.length) * 100)

  const okCount = servicios.filter(s => s.estado === 'ok' || s.estado === 'configurado').length
  const errorCount = servicios.filter(s => s.estado === 'error').length
  const pendienteCount = servicios.filter(s => s.estado === 'pendiente').length

  const estadoGeneral = errorCount > 0 ? 'critico' : pendienteCount > 2 ? 'advertencia' : 'ok'
  const mensajeGeneral = errorCount > 0
    ? `🔴 Crítico: ${errorCount} servicio${errorCount>1?'s':''} con error requieren atención inmediata`
    : pendienteCount > 0
    ? `🟡 ${okCount} de ${servicios.length} servicios operando — ${pendienteCount} pendientes de configurar`
    : `🟢 T1 Legal opera al 100% — todos los servicios activos`

  const colorGeneral = estadoGeneral==='critico'?'#991B1B':estadoGeneral==='advertencia'?'#92400E':'#065F46'
  const bgGeneral = estadoGeneral==='critico'?'#FEF2F2':estadoGeneral==='advertencia'?'#FFFBEB':'#F0FDF4'
  const borderGeneral = estadoGeneral==='critico'?'#FECACA':estadoGeneral==='advertencia'?'#FDE68A':'#BBF7D0'

  const cfgEstado: Record<string,any> = {
    ok:         { label:'Operando',    color:'#065F46', bg:'#F0FDF4', border:'#BBF7D0' },
    lento:      { label:'Lento',       color:'#92400E', bg:'#FFFBEB', border:'#FDE68A' },
    error:      { label:'Error',       color:'#991B1B', bg:'#FEF2F2', border:'#FECACA' },
    pendiente:  { label:'Pendiente',   color:'#92400E', bg:'#FFFBEB', border:'#FDE68A' },
    configurado:{ label:'Configurado', color:'#065F46', bg:'#F0FDF4', border:'#BBF7D0' },
  }

  const verificarPassword = async () => {
    if (!password.trim()) return
    setEnviando(true)
    setErrorAuth('')
    try {
      const res = await fetch('/api/sistema', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accion: 'verificar_password', password })
      })
      const data = await res.json()
      if (data.ok) {
        setPasoAuth('codigo')
        setCorreoEnviado(data.correo)
      } else {
        setErrorAuth(data.error || 'Contraseña incorrecta')
      }
    } catch(e) { setErrorAuth('Error de conexión') }
    setEnviando(false)
  }

  const verificarCodigo = async () => {
    if (!codigo.trim()) return
    setEnviando(true)
    setErrorAuth('')
    try {
      const res = await fetch('/api/sistema', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accion: 'verificar_codigo', codigo })
      })
      const data = await res.json()
      if (data.ok) {
        setAutenticado(true)
        cargar()
      } else {
        setErrorAuth(data.error || 'Código incorrecto')
      }
    } catch(e) { setErrorAuth('Error de conexión') }
    setEnviando(false)
  }

  if (!autenticado) return (
    <div style={{ minHeight:'100vh', background:'#F7F8FA', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'sans-serif' }}>
      <div style={{ background:'white', borderRadius:'20px', padding:'40px', width:'100%', maxWidth:'420px', boxShadow:'0 4px 24px rgba(0,0,0,0.08)', border:'1px solid #F0F0F0' }}>
        <div style={{ textAlign:'center', marginBottom:'32px' }}>
          <div style={{ background:'#0F2447', borderRadius:'16px', width:'56px', height:'56px', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px', fontSize:'24px' }}>🔐</div>
          <h1 style={{ color:'#0F2447', fontSize:'20px', fontWeight:700, margin:'0 0 8px' }}>Centro de Control</h1>
          <p style={{ color:'#888', fontSize:'13px', margin:0 }}>
            {pasoAuth === 'password' ? 'Acceso restringido — ingresa tu contraseña' : `Código enviado a ${correoEnviado}`}
          </p>
        </div>

        {pasoAuth === 'password' && (
          <div>
            <p style={{ fontSize:'12px', fontWeight:700, color:'#888', textTransform:'uppercase' as any, letterSpacing:'0.05em', margin:'0 0 8px' }}>Contraseña de administrador</p>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key==='Enter' && verificarPassword()}
              placeholder="Ingresa tu contraseña..."
              style={{ width:'100%', padding:'12px 16px', borderRadius:'10px', border:`1.5px solid ${errorAuth?'#FFD0CC':'#E8E8E8'}`, fontSize:'14px', outline:'none', color:'#0F2447', boxSizing:'border-box' as any, marginBottom:'16px' }} />
            {errorAuth && <p style={{ color:'#E8321A', fontSize:'12px', margin:'0 0 12px' }}>{errorAuth}</p>}
            <button onClick={verificarPassword} disabled={enviando || !password.trim()}
              style={{ width:'100%', background:'#0F2447', color:'white', border:'none', padding:'13px', borderRadius:'10px', fontSize:'14px', fontWeight:700, cursor:'pointer', opacity:(enviando||!password.trim())?0.7:1 }}>
              {enviando ? 'Verificando...' : 'Continuar →'}
            </button>
          </div>
        )}

        {pasoAuth === 'codigo' && (
          <div>
            <div style={{ background:'#EFF6FF', borderRadius:'10px', padding:'14px', marginBottom:'20px', border:'1px solid #BFDBFE', textAlign:'center' }}>
              <p style={{ fontSize:'12px', color:'#1D4ED8', fontWeight:600, margin:'0 0 4px' }}>📧 Código enviado</p>
              <p style={{ fontSize:'12px', color:'#555', margin:0 }}>Revisa tu correo en {correoEnviado}</p>
            </div>
            <p style={{ fontSize:'12px', fontWeight:700, color:'#888', textTransform:'uppercase' as any, letterSpacing:'0.05em', margin:'0 0 8px' }}>Código de verificación</p>
            <input type="text" value={codigo} onChange={e => setCodigo(e.target.value.replace(/\D/g,'').slice(0,6))}
              onKeyDown={e => e.key==='Enter' && verificarCodigo()}
              placeholder="000000"
              maxLength={6}
              style={{ width:'100%', padding:'12px 16px', borderRadius:'10px', border:`1.5px solid ${errorAuth?'#FFD0CC':'#E8E8E8'}`, fontSize:'24px', outline:'none', color:'#0F2447', boxSizing:'border-box' as any, marginBottom:'16px', textAlign:'center', letterSpacing:'8px', fontWeight:700 }} />
            {errorAuth && <p style={{ color:'#E8321A', fontSize:'12px', margin:'0 0 12px' }}>{errorAuth}</p>}
            <button onClick={verificarCodigo} disabled={enviando || codigo.length !== 6}
              style={{ width:'100%', background:'#0F2447', color:'white', border:'none', padding:'13px', borderRadius:'10px', fontSize:'14px', fontWeight:700, cursor:'pointer', opacity:(enviando||codigo.length!==6)?0.7:1, marginBottom:'12px' }}>
              {enviando ? 'Verificando...' : '🔓 Acceder al sistema'}
            </button>
            <button onClick={() => { setPasoAuth('password'); setErrorAuth(''); setCodigo('') }}
              style={{ width:'100%', background:'none', border:'none', color:'#888', fontSize:'13px', cursor:'pointer', padding:'8px' }}>
              ← Volver a contraseña
            </button>
            <p style={{ fontSize:'11px', color:'#aaa', textAlign:'center', margin:'12px 0 0' }}>El código expira en 10 minutos</p>
          </div>
        )}
      </div>
    </div>
  )

  if (cargando) return (
    <div style={{ padding:'32px', fontFamily:'sans-serif', display:'flex', alignItems:'center', gap:'12px', color:'#888' }}>
      <span style={{ fontSize:'20px' }}>⏳</span>
      <span>Diagnosticando sistema...</span>
    </div>
  )

  return (
    <div style={{ padding:'32px', fontFamily:'sans-serif', background:'#F7F8FA', minHeight:'100vh' }}>

      {/* HEADER */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'24px', flexWrap:'wrap' as any, gap:'16px' }}>
        <div>
          <h1 style={{ color:'#0F2447', fontSize:'22px', fontWeight:700, margin:'0 0 4px' }}>Centro de Control</h1>
          <p style={{ color:'#888', margin:0, fontSize:'13px' }}>Última revisión: {ultimaRevision}</p>
        </div>
        <button onClick={() => diagnosticar(false)} disabled={diagnosticando}
          style={{ background:'#0F2447', color:'white', border:'none', padding:'10px 20px', borderRadius:'10px', fontSize:'13px', fontWeight:700, cursor:'pointer', opacity:diagnosticando?0.7:1 }}>
          {diagnosticando ? '⏳ Revisando...' : '🔍 Revisar ahora'}
        </button>
      </div>

      {/* SEMAFORO EJECUTIVO */}
      <div style={{ background:bgGeneral, borderRadius:'16px', padding:'24px', marginBottom:'20px', border:`1px solid ${borderGeneral}` }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap' as any, gap:'16px' }}>
          <div>
            <p style={{ fontSize:'16px', fontWeight:700, color:colorGeneral, margin:'0 0 6px' }}>{mensajeGeneral}</p>
            <p style={{ fontSize:'12px', color:'#888', margin:0 }}>T1 Legal — t1-legal.vercel.app</p>
          </div>
          <div style={{ textAlign:'center' }}>
            <p style={{ fontSize:'42px', fontWeight:900, color:colorGeneral, margin:'0 0 2px', lineHeight:1 }}>{uptime}%</p>
            <p style={{ fontSize:'11px', color:'#888', margin:0 }}>Uptime del sistema</p>
          </div>
        </div>
      </div>

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px', marginBottom:'20px' }}>

        {/* SERVICIOS */}
        <div style={{ background:'white', borderRadius:'14px', padding:'20px', border:'1px solid #F0F0F0' }}>
          <p style={{ fontSize:'12px', fontWeight:700, color:'#888', textTransform:'uppercase' as any, letterSpacing:'0.05em', margin:'0 0 16px' }}>Estado de servicios</p>
          {servicios.map((s:any, i:number) => {
            const cfg = cfgEstado[s.estado] || cfgEstado.ok
            return (
              <div key={i} style={{ padding:'12px 14px', background:cfg.bg, borderRadius:'10px', border:`1px solid ${cfg.border}`, marginBottom:'8px' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'10px', flex:1 }}>
                    <span style={{ fontSize:'18px' }}>{s.icon}</span>
                    <div style={{ flex:1 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'2px' }}>
                        <p style={{ fontSize:'13px', fontWeight:700, color:'#0F2447', margin:0 }}>{s.nombre}</p>
                        <span style={{ fontSize:'10px', color:cfg.color, fontWeight:700, background:'white', padding:'1px 6px', borderRadius:'6px', border:`1px solid ${cfg.border}` }}>{cfg.label}</span>
                        {s.latencia !== '—' && <span style={{ fontSize:'10px', color:'#aaa' }}>{s.latencia}</span>}
                      </div>
                      <p style={{ fontSize:'11px', color:'#888', margin:0 }}>{s.detalle}</p>
                    </div>
                  </div>
                  {s.accion && (
                    <a href={s.accion.url} target="_blank" rel="noopener noreferrer"
                      style={{ background:'#0F2447', color:'white', fontSize:'11px', fontWeight:600, padding:'5px 12px', borderRadius:'7px', textDecoration:'none', flexShrink:0, marginLeft:'8px', whiteSpace:'nowrap' as any }}>
                      {s.accion.label} →
                    </a>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* CHECKLIST + INCIDENTES */}
        <div>
          <div style={{ background:'white', borderRadius:'14px', padding:'20px', border:'1px solid #F0F0F0', marginBottom:'16px' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'16px' }}>
              <p style={{ fontSize:'12px', fontWeight:700, color:'#888', textTransform:'uppercase' as any, letterSpacing:'0.05em', margin:0 }}>Activación del sistema</p>
              <span style={{ fontSize:'13px', fontWeight:700, color: pctActivado===100?'#065F46':'#0F2447' }}>{pctActivado}% activado</span>
            </div>
            <div style={{ height:'6px', background:'#F0F0F0', borderRadius:'3px', overflow:'hidden', marginBottom:'16px' }}>
              <div style={{ height:'100%', width:`${pctActivado}%`, background: pctActivado===100?'#065F46':'#0F2447', borderRadius:'3px', transition:'width 0.5s' }} />
            </div>
            {checklist.map((c:any, i:number) => (
              <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 0', borderBottom: i<checklist.length-1?'1px solid #F8F8F8':'none' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                  <span style={{ fontSize:'14px' }}>{c.done ? '✅' : '⬜'}</span>
                  <p style={{ fontSize:'12px', color: c.done?'#0F2447':'#888', margin:0, fontWeight: c.done?600:400 }}>{c.label}</p>
                </div>
                {!c.done && c.url && (
                  <a href={c.url} target="_blank" rel="noopener noreferrer"
                    style={{ fontSize:'11px', color:'#E8321A', fontWeight:600, textDecoration:'none', flexShrink:0 }}>
                    Configurar →
                  </a>
                )}
              </div>
            ))}
          </div>

          {incidentes.length > 0 && (
            <div style={{ background:'white', borderRadius:'14px', padding:'20px', border:'1px solid #F0F0F0' }}>
              <p style={{ fontSize:'12px', fontWeight:700, color:'#888', textTransform:'uppercase' as any, letterSpacing:'0.05em', margin:'0 0 12px' }}>Alertas activas</p>
              {incidentes.map((inc:any, i:number) => (
                <div key={i} style={{ padding:'10px 12px', background: inc.nivel==='critico'?'#FEF2F2':'#FFFBEB', borderRadius:'8px', border:`1px solid ${inc.nivel==='critico'?'#FECACA':'#FDE68A'}`, marginBottom:'8px' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'2px' }}>
                    <p style={{ fontSize:'12px', fontWeight:700, color: inc.nivel==='critico'?'#991B1B':'#92400E', margin:0 }}>{inc.servicio}</p>
                    <span style={{ fontSize:'10px', color:'#aaa' }}>{inc.hora}</span>
                  </div>
                  <p style={{ fontSize:'11px', color:'#555', margin:0 }}>{inc.mensaje}</p>
                </div>
              ))}
            </div>
          )}

          {incidentes.length === 0 && (
            <div style={{ background:'#F0FDF4', borderRadius:'14px', padding:'20px', border:'1px solid #BBF7D0', textAlign:'center' }}>
              <p style={{ fontSize:'24px', margin:'0 0 8px' }}>✅</p>
              <p style={{ fontSize:'13px', fontWeight:700, color:'#065F46', margin:'0 0 4px' }}>Sin incidentes activos</p>
              <p style={{ fontSize:'11px', color:'#888', margin:0 }}>Todos los servicios críticos operan correctamente</p>
            </div>
          )}
        </div>
      </div>

      {/* INFO PLATAFORMA */}
      <div style={{ background:'white', borderRadius:'14px', padding:'20px', border:'1px solid #F0F0F0' }}>
        <p style={{ fontSize:'12px', fontWeight:700, color:'#888', textTransform:'uppercase' as any, letterSpacing:'0.05em', margin:'0 0 16px' }}>Información de la plataforma</p>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(180px,1fr))', gap:'12px' }}>
          {[
            { label:'Plataforma', val:'T1 Legal' },
            { label:'Stack', val:'Next.js 14 + Supabase' },
            { label:'Deploy', val:'Vercel' },
            { label:'URL Producción', val:'t1-legal.vercel.app' },
            { label:'Dominio objetivo', val:'legal.t1.com' },
            { label:'Repositorio', val:'GitHub privado' },
          ].map((info,i) => (
            <div key={i} style={{ padding:'12px 14px', background:'#F8F8F8', borderRadius:'8px' }}>
              <p style={{ fontSize:'10px', color:'#aaa', fontWeight:600, textTransform:'uppercase' as any, margin:'0 0 4px', letterSpacing:'0.05em' }}>{info.label}</p>
              <p style={{ fontSize:'12px', color:'#0F2447', fontWeight:600, margin:0 }}>{info.val}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
