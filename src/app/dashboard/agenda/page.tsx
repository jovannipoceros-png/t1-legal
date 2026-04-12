'use client'
import { useState, useEffect, useRef } from 'react'
import { obtenerSolicitudes } from '@/lib/supabase/solicitudes'
import { createClient } from '@supabase/supabase-js'

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export default function Agenda() {
  const [tab, setTab] = useState('hoy')
  const [solicitudes, setSolicitudes] = useState<any[]>([])
  const [obligaciones, setObligaciones] = useState<any[]>([])
  const [minuta, setMinuta] = useState<any>(null)
  const [minutaTexto, setMinutaTexto] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [guardado, setGuardado] = useState(false)
  const [cargando, setCargando] = useState(true)
  const [historial, setHistorial] = useState<any[]>([])
  const [fechaVista, setFechaVista] = useState<string|null>(null)
  const [expandido, setExpandido] = useState<Record<string,boolean>>({})
  const [reporteGenerado, setReporteGenerado] = useState('')
  const [generando, setGenerando] = useState(false)
  const autoGuardado = useRef<any>(null)

  const hoy = new Date()
  const fechaHoy = hoy.toISOString().split('T')[0]
  const diasSemana = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado']
  const meses = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre']
  const diaLabel = `${diasSemana[hoy.getDay()]} ${hoy.getDate()} de ${meses[hoy.getMonth()]} de ${hoy.getFullYear()}`
  const hora = hoy.getHours()
  const saludo = hora < 12 ? 'Buenos días' : hora < 19 ? 'Buenas tardes' : 'Buenas noches'

  useEffect(() => { cargar() }, [])

  useEffect(() => {
    if (autoGuardado.current) clearTimeout(autoGuardado.current)
    if (minutaTexto) autoGuardado.current = setTimeout(() => guardarMinuta(true), 3000)
    return () => clearTimeout(autoGuardado.current)
  }, [minutaTexto])

  const cargar = async () => {
    setCargando(true)
    try {
      const sols = await obtenerSolicitudes()
      setSolicitudes(sols || [])
      const { data: obls } = await sb.from('obligaciones').select('*').order('fecha_limite', { ascending: true })
      setObligaciones(obls || [])
      const { data: hist } = await sb.from('minutas').select('fecha,contenido,generado_auto,updated_at').order('fecha', { ascending: false }).limit(60)
      setHistorial(hist || [])
      const { data: m } = await sb.from('minutas').select('*').eq('fecha', fechaHoy).maybeSingle()
      if (m) { setMinuta(m); setMinutaTexto(m.contenido || ''); if (m.generado_auto) setReporteGenerado(m.generado_auto) }
      else {
        await sb.from('minutas').upsert([{ fecha: fechaHoy, contenido: '', creado_por: 'Jovanni Poceros' }], { onConflict: 'fecha' })
        const { data: nueva } = await sb.from('minutas').select('*').eq('fecha', fechaHoy).maybeSingle()
        setMinuta(nueva)
      }
    } catch(e) { console.error(e) }
    setCargando(false)
  }

  const dias = (f: string) => Math.ceil((new Date(f).getTime() - hoy.getTime()) / 86400000)
  const diasAtras = (f: string) => Math.ceil((hoy.getTime() - new Date(f).getTime()) / 86400000)

  const guardarMinuta = async (auto = false) => {
    if (!auto) setGuardando(true)
    try {
      await sb.from('minutas').upsert([{ fecha: fechaHoy, contenido: minutaTexto, updated_at: new Date().toISOString() }], { onConflict: 'fecha' })
      if (!auto) { setGuardado(true); setTimeout(() => setGuardado(false), 3000) }
    } catch(e) {}
    if (!auto) setGuardando(false)
  }

  const generarReporte = async () => {
    setGenerando(true)
    try {
      const { data: t } = await sb.from('tracking').select('*').gte('created_at', fechaHoy + 'T00:00:00').lte('created_at', fechaHoy + 'T23:59:59').order('created_at', { ascending: true })
      const track = t || []
      const activas2 = solicitudes.filter((s:any) => s.estado !== 'Cerrado')
      const cerradas2 = solicitudes.filter((s:any) => s.estado === 'Cerrado')
      const urgentes2 = activas2.filter((s:any) => s.prioridad === 'Alta')
      const t1a = activas2.filter((s:any) => s.empresa_t1 === 'T1.com')
      const t1u = urgentes2.filter((s:any) => s.empresa_t1 === 'T1.com')
      const cla = activas2.filter((s:any) => s.empresa_t1 === 'Claro Pagos')
      const clu = urgentes2.filter((s:any) => s.empresa_t1 === 'Claro Pagos')
      const cerHoy = solicitudes.filter((s:any) => s.fecha_cierre?.startsWith(fechaHoy))
      const avances = track.filter((x:any) => !['Solicitud de informacion enviada','Informacion recibida'].includes(x.estado) && !x.estado?.includes('Retorno'))
      const enviadas = track.filter((x:any) => x.estado === 'Solicitud de informacion enviada')
      const recibidas = track.filter((x:any) => x.estado === 'Informacion recibida')
      const retornos = track.filter((x:any) => x.estado?.includes('Retorno') || x.nota?.includes('Retorno'))
      const oblV = obligaciones.filter((o:any) => dias(o.fecha_limite) < 0)
      const oblP = obligaciones.filter((o:any) => { const d = dias(o.fecha_limite); return d >= 0 && d <= 7 })
      const tempStr = urgentes2.length > 2 ? 'Día crítico' : urgentes2.length > 0 ? 'Día activo' : 'Día tranquilo'

      const lineas = [
        `REPORTE DIARIO DE GESTIÓN LEGAL`,
        `T1 Pagos — Área Legal`,
        `Fecha: ${diaLabel}`,
        `Elaboró: Jovanni Poceros`,
        `Estado del día: ${tempStr}`,
        `${'─'.repeat(50)}`,
        ``,
        `📊 RESUMEN EJECUTIVO`,
        `   Contratos activos:      ${activas2.length}`,
        `   Contratos cerrados:     ${cerradas2.length}`,
        `   Cerrados hoy:           ${cerHoy.length}`,
        `   Movimientos del día:    ${track.length}`,
        ``,
        `🏢 T1.COM`,
        `   Activos: ${t1a.length}  |  Urgentes: ${t1u.length}`,
        cerHoy.filter((s:any) => s.empresa_t1==='T1.com').length > 0 ? `   ✅ Cerrados hoy: ${cerHoy.filter((s:any) => s.empresa_t1==='T1.com').map((s:any) => s.id).join(', ')}` : `   ✅ Sin cierres hoy`,
        t1u.length > 0 ? `   🔴 Urgentes: ${t1u.map((s:any) => `${s.id} (${s.estado})`).join(', ')}` : `   🟢 Sin urgentes`,
        ``,
        `🏢 CLARO PAGOS`,
        `   Activos: ${cla.length}  |  Urgentes: ${clu.length}`,
        cerHoy.filter((s:any) => s.empresa_t1==='Claro Pagos').length > 0 ? `   ✅ Cerrados hoy: ${cerHoy.filter((s:any) => s.empresa_t1==='Claro Pagos').map((s:any) => s.id).join(', ')}` : `   ✅ Sin cierres hoy`,
        clu.length > 0 ? `   🔴 Urgentes: ${clu.map((s:any) => `${s.id} (${s.estado})`).join(', ')}` : `   🟢 Sin urgentes`,
        ``,
        avances.length > 0 ? `📤 MOVIMIENTOS DEL DÍA (${avances.length})` : null,
        ...avances.map((x:any) => `   • ${x.solicitud_id} — ${x.estado} [${new Date(x.created_at).toLocaleTimeString('es-MX', { hour:'2-digit', minute:'2-digit' })}]`),
        avances.length > 0 ? `` : null,
        enviadas.length > 0 ? `📋 SOLICITUDES DE INFORMACIÓN ENVIADAS (${enviadas.length})` : null,
        ...enviadas.map((x:any) => `   • ${x.solicitud_id} — ${x.nota?.split('.')[0] || 'Documentos solicitados'}`),
        enviadas.length > 0 ? `` : null,
        recibidas.length > 0 ? `📥 INFORMACIÓN RECIBIDA (${recibidas.length})` : null,
        ...recibidas.map((x:any) => `   • ${x.solicitud_id} — ${x.nota?.split('.')[0] || 'Documentos recibidos'}`),
        recibidas.length > 0 ? `` : null,
        retornos.length > 0 ? `🔄 RETORNOS (${retornos.length})` : null,
        ...retornos.map((x:any) => `   • ${x.solicitud_id} — ${x.nota?.split('—')[0] || 'Retorno'}`),
        retornos.length > 0 ? `` : null,
        oblV.length > 0 ? `⚠️  OBLIGACIONES VENCIDAS: ${oblV.length}` : null,
        oblP.length > 0 ? `⏰ VENCIMIENTOS ESTA SEMANA: ${oblP.length}` : null,
        ``,
        `${'─'.repeat(50)}`,
        `Reporte generado: ${new Date().toLocaleString('es-MX')}`,
      ].filter((x:any) => x !== null).join('\n')

      setReporteGenerado(lineas)
      await sb.from('minutas').upsert([{ fecha: fechaHoy, generado_auto: lineas, contenido: minutaTexto, updated_at: new Date().toISOString() }], { onConflict: 'fecha' })
    } catch(e) { console.error(e) }
    setGenerando(false)
  }

  const exportarPDF = () => {
    const fecha = fechaVista || fechaHoy
    const html = `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><title>Reporte Legal ${fecha}</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:Arial,sans-serif;color:#0F2447;padding:40px;background:white}
  .header{border-bottom:3px solid #E8321A;padding-bottom:20px;margin-bottom:30px;display:flex;justify-content:space-between;align-items:flex-end}
  .logo{font-size:22px;font-weight:900;color:#0F2447}.logo span{color:#E8321A}
  .meta{text-align:right;font-size:12px;color:#888;line-height:1.6}
  .meta strong{color:#0F2447;font-size:14px;display:block}
  .reporte{background:#F0F7FF;border-radius:8px;padding:24px;margin-bottom:24px;border-left:4px solid #1D4ED8}
  .reporte pre{font-family:Arial,sans-serif;font-size:13px;line-height:1.9;color:#0F2447;white-space:pre-wrap}
  .notas-title{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#888;margin-bottom:12px;margin-top:24px}
  .notas{border:1px solid #E8E8E8;border-radius:8px;padding:20px;font-size:13px;line-height:1.8;min-height:100px;white-space:pre-wrap}
  .footer{margin-top:40px;padding-top:16px;border-top:1px solid #E8E8E8;font-size:11px;color:#aaa;display:flex;justify-content:space-between}
  @media print{body{padding:20px}}
</style></head><body>
<div class="header">
  <div><div class="logo">T1 <span>Legal</span></div><div style="font-size:12px;color:#888;margin-top:4px">T1 Pagos / Claro Pagos</div></div>
  <div class="meta"><strong>Reporte Diario de Gestión Legal</strong>Fecha: ${fecha}<br>Elaboró: Jovanni Poceros</div>
</div>
${reporteGenerado ? '<div class="reporte"><pre>' + reporteGenerado + '</pre></div>' : '<p style="color:#888">Sin reporte generado.</p>'}
${minutaTexto ? '<div class="notas-title">Notas del día</div><div class="notas">' + minutaTexto + '</div>' : ''}
<div class="footer"><span>T1 Legal — Sistema de Gestión Legal</span><span>Generado: ${new Date().toLocaleString('es-MX')}</span></div>
</body></html>`
    const win = window.open('', '_blank')
    if (win) { win.document.write(html); win.document.close(); setTimeout(() => win.print(), 500) }
  }

  const verMinutaFecha = async (fecha: string) => {
    setFechaVista(fecha)
    const { data } = await sb.from('minutas').select('*').eq('fecha', fecha).maybeSingle()
    if (data) { setMinuta(data); setMinutaTexto(data.contenido || ''); setReporteGenerado(data.generado_auto || '') }
    setTab('minuta')
  }

  const activas = solicitudes.filter((s:any) => s.estado !== 'Cerrado')
  const cerradas = solicitudes.filter((s:any) => s.estado === 'Cerrado')
  const urgentes = activas.filter((s:any) => s.prioridad === 'Alta')
  const oblVencidas = obligaciones.filter((o:any) => dias(o.fecha_limite) < 0)
  const oblProximas = obligaciones.filter((o:any) => { const d = dias(o.fecha_limite); return d >= 0 && d <= 7 })
  const temperatura = urgentes.length > 2 ? '🔴 Día crítico' : urgentes.length > 0 ? '🟡 Día activo' : '🟢 Día tranquilo'
  const empresas = ['T1.com', 'Claro Pagos']
  const cfgEmp: Record<string,any> = {
    'T1.com': { color:'#E8321A', bg:'#FFF5F5', border:'#FFD0CC' },
    'Claro Pagos': { color:'#0F2447', bg:'#EFF6FF', border:'#BFDBFE' },
  }

  const Tab = ({ id, label }: any) => (
    <button onClick={() => { setTab(id); if (id !== 'minuta') setFechaVista(null) }}
      style={{ padding:'10px 20px', background:'none', border:'none', borderBottom:`2px solid ${tab===id?'#E8321A':'transparent'}`, color:tab===id?'#E8321A':'#888', fontWeight:tab===id?700:400, fontSize:'13px', cursor:'pointer', fontFamily:'sans-serif', whiteSpace:'nowrap' as any }}>
      {label}
    </button>
  )

  const tog = (k: string) => setExpandido(p => ({...p, [k]: !p[k]}))
  const irA = (id: string) => window.location.href = `/dashboard/solicitudes/${id}`

  if (cargando) return <div style={{ padding:'32px', fontFamily:'sans-serif', color:'#888' }}>Cargando...</div>

  return (
    <div style={{ padding:'32px', fontFamily:'sans-serif', background:'#F7F8FA', minHeight:'100vh' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'24px', flexWrap:'wrap' as any, gap:'16px' }}>
        <div>
          <h1 style={{ color:'#0F2447', fontSize:'22px', fontWeight:700, margin:'0 0 4px' }}>{saludo}, Jovanni</h1>
          <p style={{ color:'#888', margin:'0 0 6px', fontSize:'13px' }}>{diaLabel}</p>
          <span style={{ fontSize:'13px', fontWeight:600 }}>{temperatura}</span>
        </div>
        <div style={{ display:'flex', gap:'10px' }}>
          {[
            { label:'Activos', val:activas.length, color:'#0F2447', sub:'contratos' },
            { label:'Urgentes', val:urgentes.length, color:'#E8321A', sub:'requieren atención' },
            { label:'Vencimientos', val:oblVencidas.length + oblProximas.length, color:'#F59E0B', sub:'esta semana' },
          ].map((k,i) => (
            <div key={i} style={{ background:'white', borderRadius:'12px', padding:'14px 20px', border:'1px solid #F0F0F0', textAlign:'center', minWidth:'110px' }}>
              <p style={{ fontSize:'26px', fontWeight:700, color:k.color, margin:'0 0 2px' }}>{k.val}</p>
              <p style={{ fontSize:'11px', color:'#0F2447', fontWeight:600, margin:'0 0 2px' }}>{k.label}</p>
              <p style={{ fontSize:'10px', color:'#aaa', margin:0 }}>{k.sub}</p>
            </div>
          ))}
        </div>
      </div>

      <div style={{ background:'white', borderRadius:'16px', border:'1px solid #F0F0F0', overflow:'hidden' }}>
        <div style={{ display:'flex', borderBottom:'1px solid #F0F0F0', padding:'0 20px', overflowX:'auto' as any }}>
          <Tab id="hoy" label="Hoy" />
          <Tab id="arrastre" label="Arrastre y liberados" />
          <Tab id="vencimientos" label="Radar de vencimientos" />
          <Tab id="minuta" label={fechaVista ? `Minuta ${fechaVista}` : 'Minuta del día'} />
          <Tab id="historial" label="Historial de minutas" />
        </div>

        <div style={{ padding:'24px' }}>

          {tab === 'hoy' && (
            <div>
              {empresas.map(emp => {
                const cfg = cfgEmp[emp]
                const actEmp = activas.filter((s:any) => s.empresa_t1 === emp)
                const urgEmp = urgentes.filter((s:any) => s.empresa_t1 === emp)
                if (actEmp.length === 0) return null
                return (
                  <div key={emp} style={{ marginBottom:'16px' }}>
                    <div onClick={() => tog(`hoy-${emp}`)} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'14px 18px', background:cfg.bg, borderRadius: expandido[`hoy-${emp}`] ? '12px 12px 0 0' : '12px', border:`1px solid ${cfg.border}`, cursor:'pointer' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                        <p style={{ fontSize:'14px', fontWeight:700, color:cfg.color, margin:0 }}>{emp}</p>
                        <span style={{ background:cfg.color, color:'white', fontSize:'10px', fontWeight:700, padding:'2px 8px', borderRadius:'10px' }}>{actEmp.length} activos</span>
                        {urgEmp.length > 0 && <span style={{ background:'#FEE2E2', color:'#991B1B', fontSize:'10px', fontWeight:700, padding:'2px 8px', borderRadius:'10px' }}>🔴 {urgEmp.length} urgentes</span>}
                      </div>
                      <span style={{ color:cfg.color }}>{expandido[`hoy-${emp}`] ? '▲' : '▼'}</span>
                    </div>
                    {expandido[`hoy-${emp}`] && (
                      <div style={{ border:`1px solid ${cfg.border}`, borderTop:'none', borderRadius:'0 0 12px 12px', overflow:'hidden' }}>
                        {actEmp.map((s:any, i:number) => {
                          const d = diasAtras(s.created_at)
                          return (
                            <div key={i} onClick={() => irA(s.id)} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 18px', background: s.prioridad==='Alta'?'#FFF5F5':'white', borderBottom:`1px solid ${cfg.border}`, cursor:'pointer' }}>
                              <div>
                                <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'3px' }}>
                                  {s.prioridad==='Alta' && <span>🔴</span>}
                                  <p style={{ fontSize:'13px', fontWeight:700, color:'#0F2447', margin:0 }}>{s.nombre_empresa || s.nombre || '—'}</p>
                                  <span style={{ background:'#F0F0F0', color:'#555', fontSize:'10px', padding:'1px 6px', borderRadius:'6px' }}>{s.id}</span>
                                </div>
                                <p style={{ fontSize:'11px', color:'#888', margin:0 }}>{s.tipo_solicitud||'—'} · {s.estado} · {s.area||'—'}</p>
                              </div>
                              <div style={{ textAlign:'right', flexShrink:0, marginLeft:'12px' }}>
                                <p style={{ fontSize:'11px', color:d>7?'#991B1B':d>3?'#92400E':'#888', fontWeight:d>3?700:400, margin:'0 0 2px' }}>{d} días</p>
                                <p style={{ fontSize:'11px', color:cfg.color, fontWeight:600, margin:0 }}>Ir →</p>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
              {oblVencidas.length > 0 && (
                <div style={{ marginTop:'8px' }}>
                  <p style={{ fontSize:'11px', fontWeight:700, color:'#888', textTransform:'uppercase' as any, letterSpacing:'0.05em', margin:'0 0 10px' }}>Obligaciones vencidas</p>
                  {oblVencidas.map((o:any,i:number) => (
                    <div key={i} style={{ display:'flex', justifyContent:'space-between', padding:'12px 16px', background:'#FFF5F5', borderRadius:'10px', border:'1px solid #FFD0CC', marginBottom:'8px' }}>
                      <div>
                        <p style={{ fontSize:'13px', fontWeight:700, color:'#0F2447', margin:'0 0 2px' }}>{o.descripcion}</p>
                        <p style={{ fontSize:'11px', color:'#888', margin:0 }}>{o.solicitud_id} · Vencio hace {Math.abs(dias(o.fecha_limite))} días</p>
                      </div>
                      <span style={{ background:'#FEE2E2', color:'#991B1B', fontSize:'11px', fontWeight:700, padding:'3px 10px', borderRadius:'10px', alignSelf:'center' }}>Vencida</span>
                    </div>
                  ))}
                </div>
              )}
              {activas.length === 0 && <div style={{ textAlign:'center', padding:'48px', color:'#888' }}><p style={{ fontSize:'32px', margin:'0 0 12px' }}>✅</p><p style={{ fontSize:'15px', fontWeight:700, color:'#0F2447', margin:'0 0 4px' }}>Todo en orden</p></div>}
            </div>
          )}

          {tab === 'arrastre' && (
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'24px' }}>
              <div>
                <p style={{ fontSize:'11px', fontWeight:700, color:'#888', textTransform:'uppercase' as any, letterSpacing:'0.05em', margin:'0 0 14px' }}>🔄 Arrastre por empresa</p>
                {empresas.map(emp => {
                  const cfg = cfgEmp[emp]
                  const actEmp = activas.filter((s:any) => s.empresa_t1 === emp).sort((a:any,b:any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
                  if (actEmp.length === 0) return null
                  return (
                    <div key={emp} style={{ marginBottom:'16px' }}>
                      <div onClick={() => tog(`arr-${emp}`)} style={{ display:'flex', justifyContent:'space-between', padding:'10px 14px', background:cfg.bg, borderRadius:'10px', border:`1px solid ${cfg.border}`, cursor:'pointer', marginBottom:'4px' }}>
                        <p style={{ fontSize:'13px', fontWeight:700, color:cfg.color, margin:0 }}>{emp} — {actEmp.length} pendientes</p>
                        <span style={{ color:cfg.color }}>{expandido[`arr-${emp}`] ? '▲' : '▼'}</span>
                      </div>
                      {expandido[`arr-${emp}`] && actEmp.map((s:any, i:number) => {
                        const d = diasAtras(s.created_at)
                        return (
                          <div key={i} onClick={() => irA(s.id)} style={{ display:'flex', justifyContent:'space-between', padding:'10px 14px', background:d>7?'#FFF5F5':d>3?'#FFFBEB':'white', borderRadius:'8px', border:`1px solid ${d>7?'#FFD0CC':d>3?'#FDE68A':'#F0F0F0'}`, marginBottom:'6px', cursor:'pointer' }}>
                            <div>
                              <p style={{ fontSize:'12px', fontWeight:700, color:'#0F2447', margin:'0 0 2px' }}>{s.nombre_empresa || s.nombre || '—'}</p>
                              <p style={{ fontSize:'11px', color:'#888', margin:0 }}>{s.id} · {s.estado}</p>
                            </div>
                            <span style={{ fontSize:'11px', color:d>7?'#991B1B':d>3?'#92400E':'#888', fontWeight:700, alignSelf:'center' }}>{d}d</span>
                          </div>
                        )
                      })}
                    </div>
                  )
                })}
              </div>
              <div>
                <p style={{ fontSize:'11px', fontWeight:700, color:'#888', textTransform:'uppercase' as any, letterSpacing:'0.05em', margin:'0 0 14px' }}>✅ Liberados</p>
                {empresas.map(emp => {
                  const cfg = cfgEmp[emp]
                  const cerEmp = cerradas.filter((s:any) => s.empresa_t1 === emp)
                  if (cerEmp.length === 0) return null
                  return (
                    <div key={emp} style={{ marginBottom:'16px' }}>
                      <div onClick={() => tog(`lib-${emp}`)} style={{ display:'flex', justifyContent:'space-between', padding:'10px 14px', background:'#F0FDF4', borderRadius:'10px', border:'1px solid #BBF7D0', cursor:'pointer', marginBottom:'4px' }}>
                        <p style={{ fontSize:'13px', fontWeight:700, color:'#065F46', margin:0 }}>{emp} — {cerEmp.length} cerrados</p>
                        <span style={{ color:'#065F46' }}>{expandido[`lib-${emp}`] ? '▲' : '▼'}</span>
                      </div>
                      {expandido[`lib-${emp}`] && cerEmp.map((s:any, i:number) => (
                        <div key={i} onClick={() => irA(s.id)} style={{ display:'flex', justifyContent:'space-between', padding:'10px 14px', background:'#F0FDF4', borderRadius:'8px', border:'1px solid #BBF7D0', marginBottom:'6px', cursor:'pointer' }}>
                          <div>
                            <p style={{ fontSize:'12px', fontWeight:700, color:'#0F2447', margin:'0 0 2px' }}>{s.nombre_empresa || s.nombre || '—'}</p>
                            <p style={{ fontSize:'11px', color:'#888', margin:0 }}>{s.id} · {s.tipo_solicitud||'—'}</p>
                          </div>
                          <span style={{ fontSize:'11px', color:'#065F46', fontWeight:700, alignSelf:'center' }}>✓</span>
                        </div>
                      ))}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {tab === 'vencimientos' && (
            <div>
              <p style={{ fontSize:'11px', fontWeight:700, color:'#888', textTransform:'uppercase' as any, letterSpacing:'0.05em', margin:'0 0 16px' }}>Radar de obligaciones — próximos 30 días</p>
              {obligaciones.length === 0 && <p style={{ color:'#888', fontSize:'13px' }}>Sin obligaciones registradas</p>}
              {obligaciones.map((o:any,i:number) => {
                const d = dias(o.fecha_limite)
                const color = d<0?'#991B1B':d<=3?'#E8321A':d<=7?'#F59E0B':d<=15?'#1D4ED8':'#065F46'
                const bg = d<0?'#FEE2E2':d<=3?'#FFF5F5':d<=7?'#FFFBEB':d<=15?'#EFF6FF':'#F0FDF4'
                const label = d<0?`Vencida hace ${Math.abs(d)} días`:d===0?'Vence HOY':`Vence en ${d} días`
                const pct = Math.max(5, Math.min(100, ((30-Math.max(d,0))/30)*100))
                return (
                  <div key={i} style={{ padding:'16px', background:'white', borderRadius:'12px', border:`1px solid ${bg}`, marginBottom:'10px' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'10px' }}>
                      <div>
                        <p style={{ fontSize:'13px', fontWeight:700, color:'#0F2447', margin:'0 0 2px' }}>{o.descripcion}</p>
                        <p style={{ fontSize:'11px', color:'#888', margin:0 }}>{o.solicitud_id} · {new Date(o.fecha_limite).toLocaleDateString('es-MX', { day:'numeric', month:'long', year:'numeric' })}</p>
                      </div>
                      <span style={{ background:bg, color, fontSize:'11px', fontWeight:700, padding:'4px 12px', borderRadius:'10px', flexShrink:0, marginLeft:'12px' }}>{label}</span>
                    </div>
                    <div style={{ height:'6px', background:'#F0F0F0', borderRadius:'3px', overflow:'hidden' }}>
                      <div style={{ height:'100%', width:`${pct}%`, background:color, borderRadius:'3px' }} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {tab === 'minuta' && (
            <div>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px', flexWrap:'wrap' as any, gap:'10px' }}>
                <div>
                  <p style={{ fontSize:'16px', fontWeight:700, color:'#0F2447', margin:'0 0 4px' }}>{fechaVista ? `Reporte del ${fechaVista}` : `Reporte del día — ${diaLabel}`}</p>
                  <p style={{ fontSize:'12px', color:'#888', margin:0 }}>{fechaVista ? 'Solo lectura' : 'Auto-guardado cada 3 segundos'}</p>
                </div>
                <div style={{ display:'flex', gap:'8px', alignItems:'center' }}>
                  {guardado && <span style={{ fontSize:'12px', color:'#065F46', fontWeight:600 }}>✓ Guardado</span>}
                  {!fechaVista && (
                    <button onClick={generarReporte} disabled={generando}
                      style={{ background:'#1D4ED8', color:'white', border:'none', padding:'9px 18px', borderRadius:'8px', fontSize:'13px', fontWeight:700, cursor:'pointer', opacity:generando?0.7:1 }}>
                      {generando ? 'Generando...' : '⚡ Generar reporte del día'}
                    </button>
                  )}
                  <button onClick={exportarPDF} style={{ background:'white', color:'#0F2447', border:'1.5px solid #E8E8E8', padding:'9px 16px', borderRadius:'8px', fontSize:'13px', fontWeight:600, cursor:'pointer' }}>
                    Exportar PDF
                  </button>
                  {!fechaVista && (
                    <button onClick={() => guardarMinuta()} disabled={guardando}
                      style={{ background:'#0F2447', color:'white', border:'none', padding:'9px 18px', borderRadius:'8px', fontSize:'13px', fontWeight:700, cursor:'pointer', opacity:guardando?0.7:1 }}>
                      {guardando ? 'Guardando...' : 'Guardar'}
                    </button>
                  )}
                  {fechaVista && (
                    <button onClick={() => { setFechaVista(null); cargar(); setTab('minuta') }}
                      style={{ background:'#0F2447', color:'white', border:'none', padding:'9px 16px', borderRadius:'8px', fontSize:'13px', fontWeight:700, cursor:'pointer' }}>
                      ← Volver a hoy
                    </button>
                  )}
                </div>
              </div>

              {reporteGenerado && (
                <div style={{ background:'#F0F7FF', borderRadius:'12px', padding:'24px', marginBottom:'16px', border:'1px solid #BFDBFE' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'14px' }}>
                    <p style={{ fontSize:'11px', fontWeight:700, color:'#1D4ED8', margin:0, textTransform:'uppercase' as any, letterSpacing:'0.05em' }}>Reporte ejecutivo generado</p>
                  </div>
                  <pre style={{ fontSize:'13px', color:'#0F2447', margin:0, whiteSpace:'pre-wrap', fontFamily:'sans-serif', lineHeight:1.9 }}>{reporteGenerado}</pre>
                </div>
              )}

              {!reporteGenerado && !fechaVista && (
                <div style={{ textAlign:'center', padding:'40px', background:'#F8F8F8', borderRadius:'12px', marginBottom:'16px' }}>
                  <p style={{ fontSize:'32px', margin:'0 0 12px' }}>⚡</p>
                  <p style={{ fontSize:'15px', fontWeight:700, color:'#0F2447', margin:'0 0 8px' }}>Genera el reporte del día</p>
                  <p style={{ fontSize:'13px', color:'#888', margin:'0 0 16px' }}>El sistema leerá toda la actividad de hoy y generará un reporte ejecutivo para tu CEO</p>
                  <button onClick={generarReporte} disabled={generando}
                    style={{ background:'#1D4ED8', color:'white', border:'none', padding:'12px 24px', borderRadius:'10px', fontSize:'14px', fontWeight:700, cursor:'pointer' }}>
                    {generando ? 'Generando...' : '⚡ Generar reporte del día'}
                  </button>
                </div>
              )}

              <div>
                <p style={{ fontSize:'11px', fontWeight:700, color:'#888', textTransform:'uppercase' as any, letterSpacing:'0.05em', margin:'0 0 8px' }}>
                  {fechaVista ? 'Notas registradas' : 'Notas adicionales del día'}
                </p>
                <textarea value={minutaTexto} onChange={e => !fechaVista && setMinutaTexto(e.target.value)}
                  placeholder={`Agrega contexto del día...\n\n• Llamada con socio comercial — acordaron reducir vigencia\n• Negociación tensa con Claro Pagos\n• Pendiente para mañana: revisar tarifas`}
                  style={{ width:'100%', minHeight:'180px', padding:'16px', borderRadius:'10px', border:'1.5px solid #E8E8E8', fontSize:'13px', color:'#0F2447', resize:'vertical', outline:'none', fontFamily:'sans-serif', lineHeight:1.7, boxSizing:'border-box' as any, background:fechaVista?'#FAFAFA':'white' }}
                  readOnly={!!fechaVista} />
              </div>
            </div>
          )}

          {tab === 'historial' && (
            <div>
              <p style={{ fontSize:'11px', fontWeight:700, color:'#888', textTransform:'uppercase' as any, letterSpacing:'0.05em', margin:'0 0 16px' }}>Minutas guardadas</p>
              {historial.length === 0 && <p style={{ color:'#888', fontSize:'13px' }}>Sin minutas aún</p>}
              {historial.map((m:any,i:number) => {
                const tieneNotas = m.contenido?.trim().length > 0
                const tieneReporte = m.generado_auto?.trim().length > 0
                return (
                  <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'14px 18px', background:'white', borderRadius:'10px', border:'1px solid #F0F0F0', marginBottom:'8px' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
                      <span style={{ fontSize:'20px' }}>{tieneReporte ? '📊' : tieneNotas ? '📋' : '📄'}</span>
                      <div>
                        <p style={{ fontSize:'13px', fontWeight:700, color:'#0F2447', margin:'0 0 2px', textTransform:'capitalize' as any }}>
                          {new Date(m.fecha + 'T12:00:00').toLocaleDateString('es-MX', { weekday:'long', day:'numeric', month:'long', year:'numeric' })}
                        </p>
                        <p style={{ fontSize:'11px', color:tieneReporte?'#1D4ED8':tieneNotas?'#065F46':'#aaa', margin:0 }}>
                          {tieneReporte ? '📊 Con reporte ejecutivo' : tieneNotas ? `✓ Con notas` : 'Sin contenido'}
                        </p>
                      </div>
                    </div>
                    <button onClick={() => verMinutaFecha(m.fecha)}
                      style={{ background:'#0F2447', color:'white', border:'none', padding:'7px 16px', borderRadius:'8px', fontSize:'12px', fontWeight:600, cursor:'pointer' }}>
                      Ver →
                    </button>
                  </div>
                )
              })}
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
