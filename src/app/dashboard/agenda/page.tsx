'use client'
import { useState, useEffect, useRef } from 'react'
import { obtenerSolicitudes } from '@/lib/supabase/solicitudes'
import { createClient } from '@supabase/supabase-js'

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

const EMPRESAS: Record<string, { color: string, bg: string, border: string }> = {
  'T1.com':      { color: '#E8321A', bg: '#FFF5F5', border: '#FFD0CC' },
  'Claro Pagos': { color: '#0F2447', bg: '#EFF6FF', border: '#BFDBFE' },
}

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
  const [reporteGenerado, setReporteGenerado] = useState('')
  const [generando, setGenerando] = useState(false)
  const [expandido, setExpandido] = useState<Record<string,boolean>>({})
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
      const data = sols || []
      setSolicitudes(data)

      const { data: obls } = await sb.from('obligaciones').select('*').order('fecha_limite', { ascending: true })
      setObligaciones(obls || [])

      const { data: hist } = await sb.from('minutas').select('fecha,contenido,generado_auto,updated_at').order('fecha', { ascending: false }).limit(60)
      setHistorial(hist || [])

      const { data: minutaHoy } = await sb.from('minutas').select('*').eq('fecha', fechaHoy).maybeSingle()
      if (minutaHoy) {
        setMinuta(minutaHoy)
        setMinutaTexto(minutaHoy.contenido || '')
      } else {
        const auto = generarResumenAuto(data)
        await sb.from('minutas').upsert([{ fecha: fechaHoy, generado_auto: auto, contenido: '', creado_por: 'Jovanni Poceros' }], { onConflict: 'fecha' })
        const { data: nueva } = await sb.from('minutas').select('*').eq('fecha', fechaHoy).maybeSingle()
        setMinuta(nueva)
        setMinutaTexto('')
      }
    } catch(e) { console.error(e) }
    setCargando(false)
  }

  const generarResumenAuto = (sols: any[]) => {
    const activas = sols.filter((s:any) => s.estado !== 'Cerrado')
    const cerradas = sols.filter((s:any) => s.estado === 'Cerrado')
    const urgentes = activas.filter((s:any) => s.prioridad === 'Alta')
    const t1 = activas.filter((s:any) => s.empresa_t1 === 'T1.com')
    const claro = activas.filter((s:any) => s.empresa_t1 === 'Claro Pagos')
    const lineas = [
      `📅 ${diaLabel}`,
      ``,
      `📊 ESTADO DEL PORTAFOLIO`,
      `   T1.com: ${t1.length} contratos activos`,
      `   Claro Pagos: ${claro.length} contratos activos`,
      `   Cerrados: ${cerradas.length}`,
      ``,
      urgentes.length > 0 ? `🔴 URGENTES (${urgentes.length})` : null,
      ...urgentes.map((s:any) => `   • ${s.id} — ${s.nombre_empresa || s.nombre || '—'} [${s.empresa_t1}] — ${s.estado}`),
      urgentes.length > 0 ? `` : null,
      `📋 CONTRATOS ACTIVOS POR ETAPA`,
      ...['Pendiente','En revision','En negociacion','Lista para firma'].map(e => {
        const enEtapa = activas.filter((s:any) => s.estado === e)
        return enEtapa.length > 0 ? `   ${e}: ${enEtapa.length} (${enEtapa.map((s:any) => s.id).join(', ')})` : null
      }),
    ].filter(Boolean) as string[]
    return lineas.join('\n')
  }

  const guardarMinuta = async (auto = false) => {
    if (!auto) setGuardando(true)
    try {
      await sb.from('minutas').upsert([{ fecha: fechaHoy, contenido: minutaTexto, updated_at: new Date().toISOString() }], { onConflict: 'fecha' })
      if (!auto) { setGuardado(true); setTimeout(() => setGuardado(false), 3000) }
    } catch(e) {}
    if (!auto) setGuardando(false)
  }

  const verMinutaFecha = async (fecha: string) => {
    setFechaVista(fecha)
    const { data } = await sb.from('minutas').select('*').eq('fecha', fecha).maybeSingle()
    if (data) { setMinuta(data); setMinutaTexto(data.contenido || '') }
    setTab('minuta')
  }

  const exportarMinuta = () => {
    const fecha = fechaVista || fechaHoy
    const reporte = reporteGenerado || minuta?.generado_auto || ''
    const notas = minutaTexto || ''
    const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Reporte Legal ${fecha}</title>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family: 'Arial', sans-serif; color: #0F2447; padding: 40px; background: white; }
    .header { border-bottom: 3px solid #E8321A; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: flex-end; }
    .logo { font-size: 24px; font-weight: 900; color: #0F2447; letter-spacing: -0.5px; }
    .logo span { color: #E8321A; }
    .meta { text-align: right; font-size: 12px; color: #888; line-height: 1.6; }
    .meta strong { color: #0F2447; font-size: 14px; }
    .reporte { background: #F8FAFF; border-radius: 8px; padding: 24px; margin-bottom: 24px; border-left: 4px solid #1D4ED8; }
    .reporte pre { font-family: 'Arial', sans-serif; font-size: 13px; line-height: 1.9; color: #0F2447; white-space: pre-wrap; }
    .notas-section { margin-top: 24px; }
    .notas-title { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #888; margin-bottom: 12px; }
    .notas { background: white; border: 1px solid #E8E8E8; border-radius: 8px; padding: 20px; font-size: 13px; line-height: 1.8; min-height: 120px; color: #0F2447; white-space: pre-wrap; }
    .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #E8E8E8; font-size: 11px; color: #aaa; display: flex; justify-content: space-between; }
    @media print { body { padding: 20px; } }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="logo">T1 <span>Legal</span></div>
      <div style="font-size:12px; color:#888; margin-top:4px">T1 Pagos / Claro Pagos</div>
    </div>
    <div class="meta">
      <strong>Reporte Diario de Gestión Legal</strong><br>
      Fecha: ${fecha}<br>
      Elaboró: Jovanni Poceros<br>
      Área: Legal
    </div>
  </div>
  ${reporte ? '<div class="reporte"><pre>' + reporte + '</pre></div>' : '<p style="color:#888;font-size:13px">Sin reporte generado para este día.</p>'}
  ${notas ? '<div class="notas-section"><div class="notas-title">Notas adicionales del día</div><div class="notas">' + notas + '</div></div>' : ''}
  <div class="footer">
    <span>T1 Legal — Sistema de Gestión Legal</span>
    <span>Generado: ${new Date().toLocaleString('es-MX')}</span>
  </div>
</body>
</html>`
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const win = window.open(url, '_blank')
    if (win) {
      win.onload = () => {
        setTimeout(() => { win.print() }, 500)
      }
    }
    setTimeout(() => URL.revokeObjectURL(url), 10000)
  }
  const generarReporte = async () => {
    setGenerando(true)
    try {
      const hoyStr = fechaHoy
      const { data: trackingHoy } = await sb.from('tracking')
        .select('*')
        .gte('created_at', hoyStr + 'T00:00:00')
        .lte('created_at', hoyStr + 'T23:59:59')
        .order('created_at', { ascending: true })

      const t = trackingHoy || []
      const cerradasHoy = solicitudes.filter((s:any) => s.fecha_cierre?.startsWith(hoyStr))
      const avancesHoy = t.filter((x:any) => !x.estado?.includes('Retorno') && x.estado !== 'Solicitud de informacion enviada' && x.estado !== 'Informacion recibida')
      const infoEnviada = t.filter((x:any) => x.estado === 'Solicitud de informacion enviada')
      const infoRecibida = t.filter((x:any) => x.estado === 'Informacion recibida')
      const retornos = t.filter((x:any) => x.estado?.includes('Retorno') || x.nota?.includes('Retorno'))

      const activas2 = solicitudes.filter((s:any) => s.estado !== 'Cerrado')
      const cerradas2 = solicitudes.filter((s:any) => s.estado === 'Cerrado')
      const t1activas = activas2.filter((s:any) => s.empresa_t1 === 'T1.com')
      const claroActivas = activas2.filter((s:any) => s.empresa_t1 === 'Claro Pagos')
      const urgentes2 = activas2.filter((s:any) => s.prioridad === 'Alta')
      const t1urgentes = urgentes2.filter((s:any) => s.empresa_t1 === 'T1.com')
      const claroUrgentes = urgentes2.filter((s:any) => s.empresa_t1 === 'Claro Pagos')

      const tempStr = urgentes2.length > 2 ? 'Día crítico' : urgentes2.length > 0 ? 'Día activo' : 'Día tranquilo'
      const lineas = [
        `REPORTE DIARIO DE GESTIÓN LEGAL`,
        `T1 Pagos — Legal`,
        `Fecha: ${diaLabel}`,
        `Elaboró: Jovanni Poceros`,
        `${'─'.repeat(50)}`,
        ``,
        `📊 RESUMEN EJECUTIVO`,
        `   Contratos activos:     ${activas2.length}`,
        `   Contratos cerrados:    ${cerradas2.length}`,
        `   Cerrados hoy:          ${cerradasHoy.length}`,
        `   Movimientos del día:   ${t.length}`,
        ``,
        `🏢 T1.COM`,
        `   Activos: ${t1activas.length}  |  Urgentes: ${t1urgentes.length}`,
        cerradas2.filter((s:any) => s.empresa_t1==='T1.com' && s.fecha_cierre?.startsWith(hoyStr)).length > 0
          ? `   ✅ Cerrados hoy: ${cerradas2.filter((s:any) => s.empresa_t1==='T1.com' && s.fecha_cierre?.startsWith(hoyStr)).map((s:any) => s.id).join(', ')}`
          : `   ✅ Sin cierres hoy`,
        t1urgentes.length > 0
          ? `   🔴 Urgentes: ${t1urgentes.map((s:any) => `${s.id} (${s.estado})`).join(', ')}`
          : `   🟢 Sin urgentes`,
        ``,
        `🏢 CLARO PAGOS`,
        `   Activos: ${claroActivas.length}  |  Urgentes: ${claroUrgentes.length}`,
        cerradas2.filter((s:any) => s.empresa_t1==='Claro Pagos' && s.fecha_cierre?.startsWith(hoyStr)).length > 0
          ? `   ✅ Cerrados hoy: ${cerradas2.filter((s:any) => s.empresa_t1==='Claro Pagos' && s.fecha_cierre?.startsWith(hoyStr)).map((s:any) => s.id).join(', ')}`
          : `   ✅ Sin cierres hoy`,
        claroUrgentes.length > 0
          ? `   🔴 Urgentes: ${claroUrgentes.map((s:any) => `${s.id} (${s.estado})`).join(', ')}`
          : `   🟢 Sin urgentes`,
        ``,
        avancesHoy.length > 0 ? `📤 MOVIMIENTOS DEL DÍA (${avancesHoy.length})` : null,
        ...avancesHoy.map((x:any) => `   • ${x.solicitud_id} — ${x.estado} (${new Date(x.created_at).toLocaleTimeString('es-MX', { hour:'2-digit', minute:'2-digit' })})`),
        avancesHoy.length > 0 ? `` : null,
        infoEnviada.length > 0 ? `📋 SOLICITUDES DE INFORMACIÓN ENVIADAS (${infoEnviada.length})` : null,
        ...infoEnviada.map((x:any) => `   • ${x.solicitud_id} — ${x.nota?.split('.')[0] || 'Documentos solicitados'}`),
        infoEnviada.length > 0 ? `` : null,
        infoRecibida.length > 0 ? `📥 INFORMACIÓN RECIBIDA DE SOLICITANTES (${infoRecibida.length})` : null,
        ...infoRecibida.map((x:any) => `   • ${x.solicitud_id} — ${x.nota?.split('.')[0] || 'Documentos recibidos'}`),
        infoRecibida.length > 0 ? `` : null,
        retornos.length > 0 ? `🔄 RETORNOS (${retornos.length})` : null,
        ...retornos.map((x:any) => `   • ${x.solicitud_id} — ${x.nota?.split('—')[0] || 'Retorno de etapa'}`),
        retornos.length > 0 ? `` : null,
        `⚠️  OBLIGACIONES VENCIDAS: ${obligaciones.filter((o:any) => Math.ceil((new Date(o.fecha_limite).getTime() - new Date().getTime()) / (1000*60*60*24)) < 0).length}`,
        `⏰ VENCIMIENTOS ESTA SEMANA: ${obligaciones.filter((o:any) => { const d = Math.ceil((new Date(o.fecha_limite).getTime() - new Date().getTime()) / (1000*60*60*24)); return d >= 0 && d <= 7 }).length}`,
        ``,
        `${'─'.repeat(50)}`,
        `Reporte generado: ${new Date().toLocaleString('es-MX')}`,
      ].filter(x => x !== null).join('\n')

      setReporteGenerado(lineas)
      // Guardar en minuta
      await sb.from('minutas').upsert([{
        fecha: fechaHoy,
        generado_auto: lineas,
        contenido: minutaTexto,
        updated_at: new Date().toISOString()
      }], { onConflict: 'fecha' })
      const { data: nueva } = await sb.from('minutas').select('*').eq('fecha', fechaHoy).maybeSingle()
      if (nueva) setMinuta(nueva)
    } catch(e) { console.error(e) }
    setGenerando(false)
  }

  const activas = solicitudes.filter((s:any) => s.estado !== 'Cerrado')
  const cerradas = solicitudes.filter((s:any) => s.estado === 'Cerrado')
  const urgentes = activas.filter((s:any) => s.prioridad === 'Alta')
  const oblVencidas = obligaciones.filter((o:any) => Math.ceil((new Date(o.fecha_limite).getTime() - new Date().getTime()) / (1000*60*60*24)) < 0)
  const oblProximas = obligaciones.filter((o:any) => { const d = Math.ceil((new Date(o.fecha_limite).getTime() - new Date().getTime()) / (1000*60*60*24)); return d >= 0 && d <= 7 })
  const temperatura = urgentes.length > 2 ? '🔴 Día crítico' : urgentes.length > 0 ? '🟡 Día activo' : '🟢 Día tranquilo'

  if (cargando) return <div style={{ padding:'32px', fontFamily:'sans-serif', color:'#888' }}>Cargando...</div>

  return (
    <div style={{ padding:'32px', fontFamily:'sans-serif', background:'#F7F8FA', minHeight:'100vh' }}>

      {/* HEADER */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'24px', flexWrap:'wrap', gap:'16px' }}>
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

      {/* TABS */}
      <div style={{ background:'white', borderRadius:'16px', border:'1px solid #F0F0F0', overflow:'hidden' }}>
        <div style={{ display:'flex', borderBottom:'1px solid #F0F0F0', padding:'0 20px', overflowX:'auto' as any }}>
          <Tab id="hoy" label="Hoy" />
          <Tab id="arrastre" label="Arrastre y liberados" />
          <Tab id="vencimientos" label="Radar de vencimientos" />
          <Tab id="minuta" label={fechaVista ? `Minuta ${fechaVista}` : 'Minuta del día'} />
          <Tab id="historial" label="Historial de minutas" />
        </div>

        <div style={{ padding:'24px' }}>

          {/* TAB HOY */}
          {tab === 'hoy' && (
            <div>
              {empresas.map(empresa => {
                const cfg = EMPRESAS[empresa] || { color:'#0F2447', bg:'#F8F8F8', border:'#E8E8E8' }
                const urgEmp = urgentes.filter(s => s.empresa_t1 === empresa)
                const activasEmp = activas.filter(s => s.empresa_t1 === empresa)
                if (activasEmp.length === 0) return null
                return (
                  <div key={empresa} style={{ marginBottom:'24px' }}>
                    <div onClick={() => toggleExp(`hoy-${empresa}`)}
                      style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'14px 18px', background:cfg.bg, borderRadius:'12px', border:`1px solid ${cfg.border}`, cursor:'pointer', marginBottom: expandido[`hoy-${empresa}`] ? '0' : '0', borderBottomLeftRadius: expandido[`hoy-${empresa}`] ? '0' : '12px', borderBottomRightRadius: expandido[`hoy-${empresa}`] ? '0' : '12px' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
                        <p style={{ fontSize:'14px', fontWeight:700, color:cfg.color, margin:0 }}>{empresa}</p>
                        <span style={{ background:cfg.color, color:'white', fontSize:'10px', fontWeight:700, padding:'2px 8px', borderRadius:'10px' }}>{activasEmp.length} activos</span>
                        {urgEmp.length > 0 && <span style={{ background:'#FEE2E2', color:'#991B1B', fontSize:'10px', fontWeight:700, padding:'2px 8px', borderRadius:'10px' }}>🔴 {urgEmp.length} urgentes</span>}
                      </div>
                      <span style={{ color:cfg.color, fontSize:'13px' }}>{expandido[`hoy-${empresa}`] ? '▲' : '▼'}</span>
                    </div>
                    {expandido[`hoy-${empresa}`] && (
                      <div style={{ border:`1px solid ${cfg.border}`, borderTop:'none', borderBottomLeftRadius:'12px', borderBottomRightRadius:'12px', overflow:'hidden' }}>
                        {activasEmp.map((s:any, i:number) => {
                          const dias = getDiasTranscurridos(s.created_at)
                          const esUrgente = s.prioridad === 'Alta'
                          return (
                            <div key={i} onClick={() => irA(s.id)}
                              style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 18px', background: esUrgente ? '#FFF5F5' : 'white', borderBottom:`1px solid ${cfg.border}`, cursor:'pointer' }}>
                              <div>
                                <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'3px' }}>
                                  {esUrgente && <span style={{ fontSize:'10px' }}>🔴</span>}
                                  <p style={{ fontSize:'13px', fontWeight:700, color:'#0F2447', margin:0 }}>{s.nombre_empresa || s.nombre || '—'}</p>
                                  <span style={{ background:'#F0F0F0', color:'#555', fontSize:'10px', padding:'1px 6px', borderRadius:'6px' }}>{s.id}</span>
                                </div>
                                <p style={{ fontSize:'11px', color:'#888', margin:0 }}>{s.tipo_solicitud||'—'} · {s.estado} · {s.area||'—'}</p>
                              </div>
                              <div style={{ textAlign:'right', flexShrink:0, marginLeft:'12px' }}>
                                <p style={{ fontSize:'11px', color: dias>7?'#991B1B':dias>3?'#92400E':'#888', fontWeight: dias>3?700:400, margin:'0 0 2px' }}>{dias} días</p>
                                <p style={{ fontSize:'11px', color:cfg.color, fontWeight:600, margin:0 }}>Ir al contrato →</p>
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
                <div style={{ marginBottom:'20px' }}>
                  <p style={{ fontSize:'11px', fontWeight:700, color:'#888', textTransform:'uppercase' as any, letterSpacing:'0.05em', margin:'0 0 10px' }}>Obligaciones vencidas</p>
                  {oblVencidas.map((o:any,i:number) => (
                    <div key={i} style={{ display:'flex', justifyContent:'space-between', padding:'12px 16px', background:'#FFF5F5', borderRadius:'10px', border:'1px solid #FFD0CC', marginBottom:'8px' }}>
                      <div>
                        <p style={{ fontSize:'13px', fontWeight:700, color:'#0F2447', margin:'0 0 2px' }}>{o.descripcion}</p>
                        <p style={{ fontSize:'11px', color:'#888', margin:0 }}>{o.solicitud_id} · Vencio hace {Math.abs(getDiasRestantes(o.fecha_limite))} días</p>
                      </div>
                      <span style={{ background:'#FEE2E2', color:'#991B1B', fontSize:'11px', fontWeight:700, padding:'3px 10px', borderRadius:'10px', alignSelf:'center' }}>Vencida</span>
                    </div>
                  ))}
                </div>
              )}

              {urgentes.length === 0 && oblVencidas.length === 0 && activas.length === 0 && (
                <div style={{ textAlign:'center', padding:'48px', color:'#888' }}>
                  <p style={{ fontSize:'32px', margin:'0 0 12px' }}>✅</p>
                  <p style={{ fontSize:'15px', fontWeight:700, color:'#0F2447', margin:'0 0 4px' }}>Todo en orden</p>
                  <p style={{ fontSize:'13px', margin:0 }}>No hay pendientes urgentes hoy</p>
                </div>
              )}
            </div>
          )}

          {/* TAB ARRASTRE */}
          {tab === 'arrastre' && (
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'24px' }}>
              <div>
                <p style={{ fontSize:'11px', fontWeight:700, color:'#888', textTransform:'uppercase' as any, letterSpacing:'0.05em', margin:'0 0 14px' }}>🔄 Arrastre por empresa</p>
                {empresas.map(empresa => {
                  const cfg = EMPRESAS[empresa] || { color:'#0F2447', bg:'#F8F8F8', border:'#E8E8E8' }
                  const activasEmp = activas.filter((s:any) => s.empresa_t1 === empresa)
                  if (activasEmp.length === 0) return null
                  return (
                    <div key={empresa} style={{ marginBottom:'16px' }}>
                      <div onClick={() => toggleExp(`arr-${empresa}`)}
                        style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 14px', background:cfg.bg, borderRadius:'10px', border:`1px solid ${cfg.border}`, cursor:'pointer', marginBottom:'4px' }}>
                        <p style={{ fontSize:'13px', fontWeight:700, color:cfg.color, margin:0 }}>{empresa} — {activasEmp.length} pendientes</p>
                        <span style={{ color:cfg.color }}>{expandido[`arr-${empresa}`] ? '▲' : '▼'}</span>
                      </div>
                      {expandido[`arr-${empresa}`] && activasEmp
                        .sort((a:any,b:any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
                        .map((s:any, i:number) => {
                          const dias = getDiasTranscurridos(s.created_at)
                          return (
                            <div key={i} onClick={() => irA(s.id)}
                              style={{ display:'flex', justifyContent:'space-between', padding:'10px 14px', background: dias>7?'#FFF5F5':dias>3?'#FFFBEB':'white', borderRadius:'8px', border:`1px solid ${dias>7?'#FFD0CC':dias>3?'#FDE68A':'#F0F0F0'}`, marginBottom:'6px', cursor:'pointer' }}>
                              <div>
                                <p style={{ fontSize:'12px', fontWeight:700, color:'#0F2447', margin:'0 0 2px' }}>{s.nombre_empresa || s.nombre || '—'}</p>
                                <p style={{ fontSize:'11px', color:'#888', margin:0 }}>{s.id} · {s.estado}</p>
                              </div>
                              <span style={{ fontSize:'11px', color: dias>7?'#991B1B':dias>3?'#92400E':'#888', fontWeight:700, alignSelf:'center' }}>{dias}d</span>
                            </div>
                          )
                        })}
                    </div>
                  )
                })}
              </div>
              <div>
                <p style={{ fontSize:'11px', fontWeight:700, color:'#888', textTransform:'uppercase' as any, letterSpacing:'0.05em', margin:'0 0 14px' }}>✅ Liberados — cerrados</p>
                {empresas.map(empresa => {
                  const cfg = EMPRESAS[empresa] || { color:'#0F2447', bg:'#F8F8F8', border:'#E8E8E8' }
                  const cerradasEmp = cerradas.filter((s:any) => s.empresa_t1 === empresa)
                  if (cerradasEmp.length === 0) return null
                  return (
                    <div key={empresa} style={{ marginBottom:'16px' }}>
                      <div onClick={() => toggleExp(`lib-${empresa}`)}
                        style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 14px', background:'#F0FDF4', borderRadius:'10px', border:'1px solid #BBF7D0', cursor:'pointer', marginBottom:'4px' }}>
                        <p style={{ fontSize:'13px', fontWeight:700, color:'#065F46', margin:0 }}>{empresa} — {cerradasEmp.length} cerrados</p>
                        <span style={{ color:'#065F46' }}>{expandido[`lib-${empresa}`] ? '▲' : '▼'}</span>
                      </div>
                      {expandido[`lib-${empresa}`] && cerradasEmp.map((s:any, i:number) => (
                        <div key={i} onClick={() => irA(s.id)}
                          style={{ display:'flex', justifyContent:'space-between', padding:'10px 14px', background:'#F0FDF4', borderRadius:'8px', border:'1px solid #BBF7D0', marginBottom:'6px', cursor:'pointer' }}>
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

          {/* TAB VENCIMIENTOS */}
          {tab === 'vencimientos' && (
            <div>
              <p style={{ fontSize:'11px', fontWeight:700, color:'#888', textTransform:'uppercase' as any, letterSpacing:'0.05em', margin:'0 0 16px' }}>Radar de obligaciones — próximos 30 días</p>
              {obligaciones.length === 0 && <p style={{ color:'#888', fontSize:'13px' }}>Sin obligaciones registradas</p>}
              {obligaciones.map((o:any,i:number) => {
                const dias = getDiasRestantes(o.fecha_limite)
                const color = dias < 0 ? '#991B1B' : dias <= 3 ? '#E8321A' : dias <= 7 ? '#F59E0B' : dias <= 15 ? '#1D4ED8' : '#065F46'
                const bg = dias < 0 ? '#FEE2E2' : dias <= 3 ? '#FFF5F5' : dias <= 7 ? '#FFFBEB' : dias <= 15 ? '#EFF6FF' : '#F0FDF4'
                const label = dias < 0 ? `Vencida hace ${Math.abs(dias)} días` : dias === 0 ? 'Vence HOY' : `Vence en ${dias} días`
                const pct = Math.max(5, Math.min(100, ((30 - Math.max(dias, 0)) / 30) * 100))
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


          {/* TAB MINUTA */}
          {tab === 'minuta' && (
            <div>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px', flexWrap:'wrap' as any, gap:'10px' }}>
                <div>
                  <p style={{ fontSize:'16px', fontWeight:700, color:'#0F2447', margin:'0 0 4px' }}>
                    {fechaVista ? `Reporte del ${fechaVista}` : `Reporte del día — ${diaLabel}`}
                  </p>
                  <p style={{ fontSize:'12px', color:'#888', margin:0 }}>
                    {fechaVista ? 'Reporte histórico — solo lectura' : 'Auto-guardado cada 3 segundos'}
                  </p>
                </div>
                <div style={{ display:'flex', gap:'8px', alignItems:'center' }}>
                  {guardado && <span style={{ fontSize:'12px', color:'#065F46', fontWeight:600 }}>✓ Guardado</span>}
                  {!fechaVista && (
                    <button onClick={generarReporte} disabled={generando}
                      style={{ background:'#1D4ED8', color:'white', border:'none', padding:'9px 18px', borderRadius:'8px', fontSize:'13px', fontWeight:700, cursor:'pointer', opacity:generando?0.7:1 }}>
                      {generando ? 'Generando...' : '⚡ Generar reporte del día'}
                    </button>
                  )}
                  <button onClick={exportarMinuta}
                    style={{ background:'white', color:'#0F2447', border:'1.5px solid #E8E8E8', padding:'9px 16px', borderRadius:'8px', fontSize:'13px', fontWeight:600, cursor:'pointer' }}>
                    Exportar .txt
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
                <div style={{ background:'#F0F7FF', borderRadius:'12px', padding:'20px', marginBottom:'16px', border:'1px solid #BFDBFE' }}>
                  <p style={{ fontSize:'11px', fontWeight:700, color:'#1D4ED8', margin:'0 0 12px', textTransform:'uppercase' as any, letterSpacing:'0.05em' }}>Reporte ejecutivo generado</p>
                  <pre style={{ fontSize:'12px', color:'#0F2447', margin:0, whiteSpace:'pre-wrap', fontFamily:'sans-serif', lineHeight:1.8 }}>{reporteGenerado}</pre>
                </div>
              )}

              <div>
                <p style={{ fontSize:'11px', fontWeight:700, color:'#888', textTransform:'uppercase' as any, letterSpacing:'0.05em', margin:'0 0 8px' }}>
                  {fechaVista ? 'Notas registradas' : 'Notas adicionales del día'}
                </p>
                <textarea
                  value={minutaTexto}
                  onChange={e => !fechaVista && setMinutaTexto(e.target.value)}
                  placeholder={`Agrega contexto adicional...

Ejemplo:
• Llamada con socio comercial ABC — acordaron reducir vigencia a 6 meses
• Negociación tensa con Claro Pagos — contraoferta rechazada
• Pendiente para mañana: revisar tarifas y responder a contraparte`}
                  style={{ width:'100%', minHeight:'200px', padding:'16px', borderRadius:'10px', border:'1.5px solid #E8E8E8', fontSize:'13px', color:'#0F2447', resize:'vertical', outline:'none', fontFamily:'sans-serif', lineHeight:1.7, boxSizing:'border-box' as any, background: fechaVista ? '#FAFAFA' : 'white' }}
                  readOnly={!!fechaVista}
                />
              </div>
            </div>
          )}


          {/* TAB HISTORIAL */}
          {tab === 'historial' && (
            <div>
              <p style={{ fontSize:'11px', fontWeight:700, color:'#888', textTransform:'uppercase' as any, letterSpacing:'0.05em', margin:'0 0 16px' }}>Minutas guardadas — últimos 60 días</p>
              {historial.length === 0 && <p style={{ color:'#888', fontSize:'13px' }}>Sin minutas guardadas aún</p>}
              {historial.map((m:any,i:number) => {
                const tieneNotas = m.contenido && m.contenido.trim().length > 0
                const fechaStr = new Date(m.fecha + 'T12:00:00').toLocaleDateString('es-MX', { weekday:'long', day:'numeric', month:'long', year:'numeric' })
                return (
                  <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'14px 18px', background:'white', borderRadius:'10px', border:'1px solid #F0F0F0', marginBottom:'8px' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
                      <span style={{ fontSize:'20px' }}>{tieneNotas ? '📋' : '📄'}</span>
                      <div>
                        <p style={{ fontSize:'13px', fontWeight:700, color:'#0F2447', margin:'0 0 2px', textTransform:'capitalize' as any }}>{fechaStr}</p>
                        <p style={{ fontSize:'11px', color: tieneNotas ? '#065F46' : '#aaa', margin:0 }}>
                          {tieneNotas ? `✓ Con notas — ${m.contenido.substring(0,60)}...` : 'Sin notas registradas'}
                        </p>
                      </div>
                    </div>
                    <button onClick={() => verMinutaFecha(m.fecha)}
                      style={{ background:'#0F2447', color:'white', border:'none', padding:'7px 16px', borderRadius:'8px', fontSize:'12px', fontWeight:600, cursor:'pointer', flexShrink:0 }}>
                      Ver minuta
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
