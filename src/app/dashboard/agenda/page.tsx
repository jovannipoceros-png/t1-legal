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
  const [fechaVista, setFechaVista] = useState<string | null>(null)
  const autoGuardado = useRef<any>(null)

  const hoy = new Date()
  const fechaHoy = hoy.toISOString().split('T')[0]
  const diasSemana = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado']
  const meses = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre']
  const diaLabel = `${diasSemana[hoy.getDay()]} ${hoy.getDate()} de ${meses[hoy.getMonth()]} de ${hoy.getFullYear()}`

  useEffect(() => { cargar() }, [])

  useEffect(() => {
    if (autoGuardado.current) clearTimeout(autoGuardado.current)
    if (minutaTexto) {
      autoGuardado.current = setTimeout(() => guardarMinuta(true), 3000)
    }
    return () => clearTimeout(autoGuardado.current)
  }, [minutaTexto])

  const cargar = async () => {
    setCargando(true)
    try {
      const [sols, obls, minutaHoy, hist] = await Promise.all([
        obtenerSolicitudes(),
        sb.from('obligaciones').select('*').order('fecha_limite', { ascending: true }),
        sb.from('minutas').select('*').eq('fecha', fechaHoy).single().catch(() => ({ data: null })),
        sb.from('minutas').select('fecha, creado_por, updated_at').order('fecha', { ascending: false }).limit(30)
      ])
      const data = sols || []
      setSolicitudes(data)
      setObligaciones((obls as any).data || [])
      setHistorial((hist as any).data || [])

      if ((minutaHoy as any).data) {
        setMinuta((minutaHoy as any).data)
        setMinutaTexto((minutaHoy as any).data.contenido || '')
      } else {
        const auto = generarMinutaAuto(data)
        setMinuta(null)
        setMinutaTexto('')
        await sb.from('minutas').upsert([{ fecha: fechaHoy, generado_auto: auto, contenido: '', creado_por: 'Jovanni Poceros' }])
        const m = await sb.from('minutas').select('*').eq('fecha', fechaHoy).single()
        setMinuta((m as any).data)
      }
    } catch(e) { console.error(e) }
    setCargando(false)
  }

  const generarMinutaAuto = (sols: any[]) => {
    const activas = sols.filter(s => s.estado !== 'Cerrado')
    const cerradas = sols.filter(s => s.estado === 'Cerrado')
    const urgentes = sols.filter(s => s.prioridad === 'Alta' && s.estado !== 'Cerrado')
    return [
      `RESUMEN AUTOMATICO — ${diaLabel}`,
      ``,
      `Contratos activos: ${activas.length}`,
      `Contratos cerrados: ${cerradas.length}`,
      urgentes.length > 0 ? `Urgentes: ${urgentes.map((s:any) => s.id).join(', ')}` : 'Sin urgentes',
      ``,
      `PENDIENTES DEL DIA:`,
      activas.filter((s:any) => s.prioridad === 'Alta').map((s:any) => `- [URGENTE] ${s.id}: ${s.nombre_empresa || s.nombre} — ${s.estado}`).join('\n'),
      activas.filter((s:any) => s.prioridad === 'Media').slice(0,3).map((s:any) => `- ${s.id}: ${s.nombre_empresa || s.nombre} — ${s.estado}`).join('\n'),
    ].filter(Boolean).join('\n')
  }

  const guardarMinuta = async (auto = false) => {
    if (!auto) setGuardando(true)
    try {
      await sb.from('minutas').upsert([{ fecha: fechaHoy, contenido: minutaTexto, updated_at: new Date().toISOString() }], { onConflict: 'fecha' })
      if (!auto) { setGuardado(true); setTimeout(() => setGuardado(false), 3000) }
    } catch(e) {}
    if (!auto) setGuardando(false)
  }

  const verMinutaHistorial = async (fecha: string) => {
    setFechaVista(fecha)
    const { data } = await sb.from('minutas').select('*').eq('fecha', fecha).single()
    if (data) { setMinuta(data); setMinutaTexto(data.contenido || '') }
    setTab('minuta')
  }

  const getDiasRestantes = (fecha: string) => {
    const d = new Date(fecha)
    const diff = Math.ceil((d.getTime() - hoy.getTime()) / (1000*60*60*24))
    return diff
  }

  const activas = solicitudes.filter(s => s.estado !== 'Cerrado')
  const cerradas = solicitudes.filter(s => s.estado === 'Cerrado')
  const urgentes = activas.filter(s => s.prioridad === 'Alta')
  const sinMovimiento = activas.filter(s => {
    const dias = Math.ceil((hoy.getTime() - new Date(s.created_at).getTime()) / (1000*60*60*24))
    return dias > 3
  })
  const liberadasHoy = solicitudes.filter(s => {
    if (!s.fecha_cierre) return false
    return s.fecha_cierre?.startsWith(fechaHoy)
  })
  const oblVencidas = obligaciones.filter(o => getDiasRestantes(o.fecha_limite) < 0)
  const oblProximas = obligaciones.filter(o => { const d = getDiasRestantes(o.fecha_limite); return d >= 0 && d <= 7 })
  const oblOk = obligaciones.filter(o => getDiasRestantes(o.fecha_limite) > 7)

  const hora = hoy.getHours()
  const saludo = hora < 12 ? 'Buenos días' : hora < 19 ? 'Buenas tardes' : 'Buenas noches'
  const temperatura = urgentes.length > 2 ? '🔴 Día crítico' : urgentes.length > 0 ? '🟡 Día activo' : '🟢 Día tranquilo'

  const Tab = ({ id, label }: any) => (
    <button onClick={() => { setTab(id); setFechaVista(null) }}
      style={{ padding:'10px 20px', background:'none', border:'none', borderBottom:`2px solid ${tab===id?'#E8321A':'transparent'}`, color:tab===id?'#E8321A':'#888', fontWeight:tab===id?700:400, fontSize:'13px', cursor:'pointer', fontFamily:'sans-serif' }}>
      {label}
    </button>
  )

  const irA = (id: string) => window.location.href = `/dashboard/solicitudes/${id}`

  if (cargando) return <div style={{ padding:'32px', fontFamily:'sans-serif', color:'#888' }}>Cargando...</div>

  return (
    <div style={{ padding:'32px', fontFamily:'sans-serif', background:'#F7F8FA', minHeight:'100vh' }}>
      <div style={{ marginBottom:'24px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
          <div>
            <h1 style={{ color:'#0F2447', fontSize:'24px', fontWeight:700, margin:'0 0 4px' }}>{saludo}, Jovanni</h1>
            <p style={{ color:'#888', margin:'0 0 6px', fontSize:'13px' }}>{diaLabel}</p>
            <span style={{ fontSize:'13px', fontWeight:600 }}>{temperatura}</span>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'12px', textAlign:'center' }}>
            {[
              { label:'Contratos activos', val:activas.length, color:'#0F2447' },
              { label:'Liberados hoy', val:liberadasHoy.length, color:'#065F46' },
              { label:'Requieren atención', val:urgentes.length + oblVencidas.length, color:'#E8321A' },
            ].map((k,i) => (
              <div key={i} style={{ background:'white', borderRadius:'10px', padding:'14px 18px', border:'1px solid #F0F0F0', minWidth:'130px' }}>
                <p style={{ fontSize:'28px', fontWeight:700, color:k.color, margin:'0 0 4px' }}>{k.val}</p>
                <p style={{ fontSize:'11px', color:'#888', margin:0 }}>{k.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ background:'white', borderRadius:'16px', border:'1px solid #F0F0F0', overflow:'hidden' }}>
        <div style={{ display:'flex', borderBottom:'1px solid #F0F0F0', padding:'0 20px' }}>
          <Tab id="hoy" label="Hoy" />
          <Tab id="arrastre" label="Arrastre y liberados" />
          <Tab id="vencimientos" label="Radar de vencimientos" />
          <Tab id="minuta" label={fechaVista ? `Minuta ${fechaVista}` : 'Minuta del día'} />
          <Tab id="historial" label="Historial de minutas" />
        </div>

        <div style={{ padding:'24px' }}>

          {tab === 'hoy' && (
            <div>
              {urgentes.length > 0 && (
                <div style={{ marginBottom:'20px' }}>
                  <p style={{ fontSize:'11px', fontWeight:700, color:'#888', textTransform:'uppercase', letterSpacing:'0.05em', margin:'0 0 10px' }}>Acción urgente requerida</p>
                  {urgentes.map((s,i) => (
                    <div key={i} onClick={() => irA(s.id)} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'14px 16px', background:'#FFF5F5', borderRadius:'10px', border:'1px solid #FFD0CC', marginBottom:'8px', cursor:'pointer' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                        <span style={{ fontSize:'16px' }}>🔴</span>
                        <div>
                          <p style={{ fontSize:'13px', fontWeight:700, color:'#0F2447', margin:'0 0 2px' }}>{s.nombre_empresa || s.nombre} — {s.tipo_solicitud}</p>
                          <p style={{ fontSize:'11px', color:'#888', margin:0 }}>{s.id} · {s.estado} · {s.area}</p>
                        </div>
                      </div>
                      <span style={{ color:'#E8321A', fontSize:'12px', fontWeight:700 }}>Atender →</span>
                    </div>
                  ))}
                </div>
              )}

              {oblVencidas.length > 0 && (
                <div style={{ marginBottom:'20px' }}>
                  <p style={{ fontSize:'11px', fontWeight:700, color:'#888', textTransform:'uppercase', letterSpacing:'0.05em', margin:'0 0 10px' }}>Obligaciones vencidas</p>
                  {oblVencidas.map((o,i) => (
                    <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 16px', background:'#FFF5F5', borderRadius:'10px', border:'1px solid #FFD0CC', marginBottom:'8px' }}>
                      <div>
                        <p style={{ fontSize:'13px', fontWeight:700, color:'#0F2447', margin:'0 0 2px' }}>{o.descripcion}</p>
                        <p style={{ fontSize:'11px', color:'#888', margin:0 }}>{o.solicitud_id} · Vencio hace {Math.abs(getDiasRestantes(o.fecha_limite))} días</p>
                      </div>
                      <span style={{ background:'#FEE2E2', color:'#991B1B', fontSize:'11px', fontWeight:700, padding:'3px 10px', borderRadius:'10px' }}>Vencida</span>
                    </div>
                  ))}
                </div>
              )}

              {oblProximas.length > 0 && (
                <div style={{ marginBottom:'20px' }}>
                  <p style={{ fontSize:'11px', fontWeight:700, color:'#888', textTransform:'uppercase', letterSpacing:'0.05em', margin:'0 0 10px' }}>Vencen esta semana</p>
                  {oblProximas.map((o,i) => (
                    <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 16px', background:'#FFFBEB', borderRadius:'10px', border:'1px solid #FDE68A', marginBottom:'8px' }}>
                      <div>
                        <p style={{ fontSize:'13px', fontWeight:700, color:'#0F2447', margin:'0 0 2px' }}>{o.descripcion}</p>
                        <p style={{ fontSize:'11px', color:'#888', margin:0 }}>{o.solicitud_id} · Vence en {getDiasRestantes(o.fecha_limite)} días</p>
                      </div>
                      <span style={{ background:'#FEF3C7', color:'#92400E', fontSize:'11px', fontWeight:700, padding:'3px 10px', borderRadius:'10px' }}>Próxima</span>
                    </div>
                  ))}
                </div>
              )}

              {sinMovimiento.length > 0 && (
                <div>
                  <p style={{ fontSize:'11px', fontWeight:700, color:'#888', textTransform:'uppercase', letterSpacing:'0.05em', margin:'0 0 10px' }}>Sin movimiento — requieren seguimiento</p>
                  {sinMovimiento.slice(0,5).map((s,i) => (
                    <div key={i} onClick={() => irA(s.id)} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 16px', background:'#F8F8F8', borderRadius:'10px', border:'1px solid #F0F0F0', marginBottom:'8px', cursor:'pointer' }}>
                      <div>
                        <p style={{ fontSize:'13px', fontWeight:600, color:'#0F2447', margin:'0 0 2px' }}>{s.nombre_empresa || s.nombre} — {s.tipo_solicitud}</p>
                        <p style={{ fontSize:'11px', color:'#888', margin:0 }}>{s.id} · {s.estado}</p>
                      </div>
                      <span style={{ color:'#888', fontSize:'11px' }}>Ver →</span>
                    </div>
                  ))}
                </div>
              )}

              {urgentes.length === 0 && oblVencidas.length === 0 && sinMovimiento.length === 0 && (
                <div style={{ textAlign:'center', padding:'48px', color:'#888' }}>
                  <p style={{ fontSize:'32px', margin:'0 0 12px' }}>✅</p>
                  <p style={{ fontSize:'16px', fontWeight:700, color:'#0F2447', margin:'0 0 4px' }}>Todo en orden</p>
                  <p style={{ fontSize:'13px', margin:0 }}>No hay pendientes urgentes para hoy</p>
                </div>
              )}
            </div>
          )}

          {tab === 'arrastre' && (
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'24px' }}>
              <div>
                <p style={{ fontSize:'11px', fontWeight:700, color:'#888', textTransform:'uppercase', letterSpacing:'0.05em', margin:'0 0 12px' }}>🔄 Arrastre — pendientes sin resolver</p>
                {activas.length === 0 && <p style={{ color:'#888', fontSize:'13px' }}>Sin arrastre</p>}
                {activas.sort((a,b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()).map((s,i) => {
                  const dias = Math.ceil((hoy.getTime() - new Date(s.created_at).getTime()) / (1000*60*60*24))
                  return (
                    <div key={i} onClick={() => irA(s.id)} style={{ padding:'14px 16px', background: dias>7?'#FFF5F5':dias>3?'#FFFBEB':'#F8F8F8', borderRadius:'10px', border:`1px solid ${dias>7?'#FFD0CC':dias>3?'#FDE68A':'#F0F0F0'}`, marginBottom:'8px', cursor:'pointer' }}>
                      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'4px' }}>
                        <p style={{ fontSize:'13px', fontWeight:700, color:'#0F2447', margin:0 }}>{s.nombre_empresa || s.nombre}</p>
                        <span style={{ fontSize:'11px', color: dias>7?'#991B1B':dias>3?'#92400E':'#888', fontWeight:700 }}>{dias} días</span>
                      </div>
                      <p style={{ fontSize:'11px', color:'#888', margin:0 }}>{s.id} · {s.estado} · {s.prioridad}</p>
                    </div>
                  )
                })}
              </div>
              <div>
                <p style={{ fontSize:'11px', fontWeight:700, color:'#888', textTransform:'uppercase', letterSpacing:'0.05em', margin:'0 0 12px' }}>✅ Liberados — cerrados recientemente</p>
                {cerradas.length === 0 && <p style={{ color:'#888', fontSize:'13px' }}>Sin liberados aún</p>}
                {cerradas.slice(0,10).map((s,i) => (
                  <div key={i} onClick={() => irA(s.id)} style={{ padding:'14px 16px', background:'#F0FDF4', borderRadius:'10px', border:'1px solid #BBF7D0', marginBottom:'8px', cursor:'pointer' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'4px' }}>
                      <p style={{ fontSize:'13px', fontWeight:700, color:'#0F2447', margin:0 }}>{s.nombre_empresa || s.nombre}</p>
                      <span style={{ fontSize:'11px', color:'#065F46', fontWeight:700 }}>Cerrado ✓</span>
                    </div>
                    <p style={{ fontSize:'11px', color:'#888', margin:0 }}>{s.id} · {s.tipo_solicitud}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'vencimientos' && (
            <div>
              <p style={{ fontSize:'11px', fontWeight:700, color:'#888', textTransform:'uppercase', letterSpacing:'0.05em', margin:'0 0 16px' }}>Radar de obligaciones contractuales — próximos 30 días</p>
              {obligaciones.length === 0 && <p style={{ color:'#888', fontSize:'13px' }}>Sin obligaciones registradas</p>}
              {obligaciones.map((o,i) => {
                const dias = getDiasRestantes(o.fecha_limite)
                const color = dias < 0 ? '#991B1B' : dias <= 3 ? '#E8321A' : dias <= 7 ? '#F59E0B' : dias <= 15 ? '#0F2447' : '#065F46'
                const bg = dias < 0 ? '#FEE2E2' : dias <= 3 ? '#FFF5F5' : dias <= 7 ? '#FFFBEB' : dias <= 15 ? '#EFF6FF' : '#F0FDF4'
                const label = dias < 0 ? `Vencida hace ${Math.abs(dias)} días` : dias === 0 ? 'Vence HOY' : `Vence en ${dias} días`
                const pct = Math.max(0, Math.min(100, ((30 - dias) / 30) * 100))
                return (
                  <div key={i} style={{ padding:'16px', background:'white', borderRadius:'12px', border:`1px solid ${bg}`, marginBottom:'10px', boxShadow:'0 1px 4px rgba(0,0,0,0.04)' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'10px' }}>
                      <div>
                        <p style={{ fontSize:'13px', fontWeight:700, color:'#0F2447', margin:'0 0 2px' }}>{o.descripcion}</p>
                        <p style={{ fontSize:'11px', color:'#888', margin:0 }}>{o.solicitud_id} · {new Date(o.fecha_limite).toLocaleDateString('es-MX', { day:'numeric', month:'long', year:'numeric' })}</p>
                      </div>
                      <span style={{ background:bg, color, fontSize:'11px', fontWeight:700, padding:'4px 12px', borderRadius:'10px', flexShrink:0 }}>{label}</span>
                    </div>
                    <div style={{ height:'6px', background:'#F0F0F0', borderRadius:'3px', overflow:'hidden' }}>
                      <div style={{ height:'100%', width:`${pct}%`, background:color, borderRadius:'3px', transition:'width 0.5s' }} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {tab === 'minuta' && (
            <div>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'16px' }}>
                <div>
                  <p style={{ fontSize:'16px', fontWeight:700, color:'#0F2447', margin:'0 0 2px' }}>
                    {fechaVista ? `Minuta del ${fechaVista}` : `Minuta de hoy — ${diaLabel}`}
                  </p>
                  <p style={{ fontSize:'12px', color:'#888', margin:0 }}>Se guarda automáticamente cada 3 segundos</p>
                </div>
                <div style={{ display:'flex', gap:'8px', alignItems:'center' }}>
                  {guardado && <span style={{ fontSize:'12px', color:'#065F46', fontWeight:600 }}>✓ Guardado</span>}
                  <button onClick={() => guardarMinuta()} disabled={guardando}
                    style={{ background:'#0F2447', color:'white', border:'none', padding:'9px 18px', borderRadius:'8px', fontSize:'13px', fontWeight:700, cursor:'pointer', opacity:guardando?0.7:1 }}>
                    {guardando ? 'Guardando...' : 'Guardar minuta'}
                  </button>
                </div>
              </div>

              {minuta?.generado_auto && (
                <div style={{ background:'#EFF6FF', borderRadius:'10px', padding:'14px 16px', marginBottom:'16px', border:'1px solid #BFDBFE' }}>
                  <p style={{ fontSize:'11px', fontWeight:700, color:'#1D4ED8', margin:'0 0 8px' }}>Resumen generado automáticamente</p>
                  <pre style={{ fontSize:'12px', color:'#0F2447', margin:0, whiteSpace:'pre-wrap', fontFamily:'sans-serif', lineHeight:1.6 }}>{minuta.generado_auto}</pre>
                </div>
              )}

              <textarea
                value={minutaTexto}
                onChange={e => setMinutaTexto(e.target.value)}
                placeholder={`Escribe las notas del día...\n\nEjemplo:\n- Llamada con socio comercial Empresa X — acordaron reducir vigencia a 6 meses\n- Retorno de documentos C-2026-3174 — faltó poder notarial\n- Negociación C-2026-5448 tensa, contraoferta rechazada\n- Pendiente para mañana: revisar tarifas actualizadas`}
                style={{ width:'100%', minHeight:'320px', padding:'16px', borderRadius:'10px', border:'1.5px solid #E8E8E8', fontSize:'13px', color:'#0F2447', resize:'vertical', outline:'none', fontFamily:'sans-serif', lineHeight:1.7, boxSizing:'border-box' as any }}
                readOnly={!!fechaVista}
              />

              {fechaVista && (
                <div style={{ marginTop:'12px', display:'flex', gap:'8px' }}>
                  <button onClick={() => { setFechaVista(null); setTab('minuta'); cargar() }}
                    style={{ background:'#0F2447', color:'white', border:'none', padding:'9px 18px', borderRadius:'8px', fontSize:'13px', fontWeight:700, cursor:'pointer' }}>
                    ← Volver a hoy
                  </button>
                </div>
              )}
            </div>
          )}

          {tab === 'historial' && (
            <div>
              <p style={{ fontSize:'11px', fontWeight:700, color:'#888', textTransform:'uppercase', letterSpacing:'0.05em', margin:'0 0 16px' }}>Minutas guardadas</p>
              {historial.length === 0 && <p style={{ color:'#888', fontSize:'13px' }}>Sin minutas guardadas aún</p>}
              {historial.map((m,i) => (
                <div key={i} onClick={() => verMinutaHistorial(m.fecha)}
                  style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'14px 16px', background:'white', borderRadius:'10px', border:'1px solid #F0F0F0', marginBottom:'8px', cursor:'pointer' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
                    <span style={{ fontSize:'20px' }}>📋</span>
                    <div>
                      <p style={{ fontSize:'13px', fontWeight:700, color:'#0F2447', margin:'0 0 2px' }}>
                        {new Date(m.fecha + 'T12:00:00').toLocaleDateString('es-MX', { weekday:'long', day:'numeric', month:'long', year:'numeric' })}
                      </p>
                      <p style={{ fontSize:'11px', color:'#888', margin:0 }}>Actualizada: {new Date(m.updated_at).toLocaleDateString('es-MX', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' })}</p>
                    </div>
                  </div>
                  <span style={{ color:'#1D4ED8', fontSize:'12px', fontWeight:600 }}>Ver minuta →</span>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
