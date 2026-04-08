'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function Monitor() {
  const [solicitudes, setSolicitudes] = useState<any[]>([])
  const [obligaciones, setObligaciones] = useState<any[]>([])
  const [keywords, setKeywords] = useState<string[]>([])
  const [nuevaKeyword, setNuevaKeyword] = useState('')
  const [cargando, setCargando] = useState(true)
  const [tab, setTab] = useState('alertas')
  const [avisoEnviado, setAvisoEnviado] = useState(false)
  const [enviandoAviso, setEnviandoAviso] = useState(false)
  const [filtroActivo, setFiltroActivo] = useState<string|null>(null)

  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)

  useEffect(() => { cargarDatos() }, [])

  async function cargarDatos() {
    setCargando(true)
    try {
      const [{ data: sols }, { data: obls }, { data: config }] = await Promise.all([
        supabase.from('solicitudes').select('*').neq('estado', 'Cerrado'),
        supabase.from('obligaciones').select('*').order('fecha_limite', { ascending: true }),
        supabase.from('monitor_config').select('*').limit(1)
      ])
      setSolicitudes(sols || [])
      setObligaciones(obls || [])
      if (config && config.length > 0 && config[0].keywords) {
        setKeywords(config[0].keywords)
      }
    } catch (e) { console.error(e) }
    setCargando(false)
  }

  const getDiasRestantes = (fecha: string) => {
    const f = new Date(fecha)
    f.setHours(0, 0, 0, 0)
    return Math.ceil((f.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24))
  }

  const getLimitePorPrioridad = (prioridad: string) => {
    if (prioridad === 'Alta') return 1
    if (prioridad === 'Media') return 3
    return 5
  }

  const vencidas = solicitudes.filter(s => s.fecha_limite && getDiasRestantes(s.fecha_limite) < 0)
  const proximas = solicitudes.filter(s => {
    if (!s.fecha_limite) return false
    const d = getDiasRestantes(s.fecha_limite)
    return d >= 0 && d <= 7
  })
  const sinMovimiento = solicitudes.filter(s => {
    const limite = getLimitePorPrioridad(s.prioridad || 'Baja')
    const diasCreado = Math.ceil((hoy.getTime() - new Date(s.created_at).getTime()) / (1000 * 60 * 60 * 24))
    return diasCreado > limite && s.estado === 'Pendiente'
  })
  const internacionales = solicitudes.filter(s => s.nacionalidad && s.nacionalidad !== 'Mexicana')

  const calcularSalud = () => {
    if (solicitudes.length === 0) return 100
    let p = 0
    p += vencidas.length * 15
    p += proximas.length * 8
    p += sinMovimiento.length * 5
    p += internacionales.length * 3
    return Math.max(0, Math.min(100, 100 - p))
  }
  const salud = calcularSalud()
  const colorSalud = salud >= 70 ? '#3B6D11' : salud >= 40 ? '#BA7517' : '#A32D2D'

  const oblProximas = obligaciones.filter(o => { const d = getDiasRestantes(o.fecha_limite); return d >= 0 && d <= 30 })
  const oblVencidas = obligaciones.filter(o => getDiasRestantes(o.fecha_limite) < 0)
  const oblSinDoc = obligaciones.filter(o => !o.tiene_documento)

  async function guardarKeywords(nuevas: string[]) {
    const { data } = await supabase.from('monitor_config').select('id').limit(1)
    if (data && data.length > 0) {
      await supabase.from('monitor_config').update({ keywords: nuevas, updated_at: new Date().toISOString() }).eq('id', data[0].id)
    } else {
      await supabase.from('monitor_config').insert({ keywords: nuevas })
    }
  }

  const agregarKeyword = async () => {
    const kw = nuevaKeyword.trim().toLowerCase()
    if (!kw || keywords.includes(kw)) return
    const nuevas = [...keywords, kw]
    setKeywords(nuevas)
    setNuevaKeyword('')
    await guardarKeywords(nuevas)
  }

  const eliminarKeyword = async (i: number) => {
    const nuevas = keywords.filter((_, j) => j !== i)
    setKeywords(nuevas)
    await guardarKeywords(nuevas)
  }

  const solicitudesConKeyword = solicitudes.filter(s =>
    keywords.some(k =>
      (s.descripcion || '').toLowerCase().includes(k) ||
      (s.condiciones_especiales || '').toLowerCase().includes(k)
    )
  )

  const enviarAviso = async (tipo: 'matutino' | 'cierre') => {
    setEnviandoAviso(true)
    try {
      await fetch('/api/monitor/aviso', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tipo, salud, vencidas: vencidas.length, proximas: proximas.length, sinMovimiento: sinMovimiento.length, oblSinDoc: oblSinDoc.length, totalActivos: solicitudes.length })
      })
      setAvisoEnviado(true)
      setTimeout(() => setAvisoEnviado(false), 4000)
    } catch (e) { console.error(e) }
    setEnviandoAviso(false)
  }

  const totalAlertas = vencidas.length + proximas.length + sinMovimiento.length
  const fecha = hoy.toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
  const fechaCap = fecha.charAt(0).toUpperCase() + fecha.slice(1)
  const tabs = [
    { id: 'alertas', label: 'Alertas', badge: totalAlertas },
    { id: 'obligaciones', label: 'Obligaciones', badge: oblVencidas.length + oblSinDoc.length },
    { id: 'keywords', label: 'Palabras clave', badge: solicitudesConKeyword.length },
    { id: 'aviso', label: 'Aviso diario', badge: 0 },
  ]

  const chipId = { background: '#0F2447', color: 'white', fontSize: '10px', fontWeight: 700, padding: '2px 7px', borderRadius: '10px', flexShrink: 0 } as any
  const secTit = (mt?: boolean) => ({ fontSize: '11px', fontWeight: 700, color: '#888', textTransform: 'uppercase' as any, letterSpacing: '0.05em', margin: mt ? '20px 0 10px' : '0 0 10px' })
  const btnVer = { background: 'none', border: 'none', color: '#1D4ED8', fontSize: '11px', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline', flexShrink: 0 } as any

  return (
    <div style={{ padding: '32px', fontFamily: 'sans-serif', background: '#F7F8FA', minHeight: '100vh' }}>

      <div style={{ background: 'white', borderRadius: '14px', padding: '24px', marginBottom: '16px', border: '1px solid #F0F0F0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <div>
            <h1 style={{ color: '#0F2447', fontSize: '22px', fontWeight: 700, margin: '0 0 4px' }}>Monitor Legal</h1>
            <p style={{ color: '#888', fontSize: '13px', margin: 0 }}>{fechaCap}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '40px', fontWeight: 700, color: colorSalud, lineHeight: 1 }}>{cargando ? '—' : salud}</div>
            <div style={{ fontSize: '11px', color: '#888', marginTop: '4px' }}>Salud del expediente</div>
            <div style={{ width: '130px', height: '6px', background: '#F0F0F0', borderRadius: '3px', marginTop: '8px' }}>
              <div style={{ height: '100%', borderRadius: '3px', background: colorSalud, width: `${salud}%`, transition: 'width 1s ease' }} />
            </div>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px' }}>
          {[
            { label: 'Vencidos', val: vencidas.length, color: '#E8321A', bg: '#FFF5F5', filtro:'vencidas' },
            { label: 'Proximos a vencer', val: proximas.length, color: '#F59E0B', bg: '#FFFBEB', filtro:'proximas' },
            { label: 'Sin movimiento', val: sinMovimiento.length, color: '#888', bg: '#F8F8F8', filtro:'sinMovimiento' },
            { label: 'Contratos extranjeros', val: internacionales.length, color: '#1D4ED8', bg: '#EFF6FF', filtro:'internacionales' },
          ].map((k, i) => (
            <div key={i} style={{ background: k.bg, borderRadius: '10px', padding: '16px', border: `1px solid ${k.color}20` }}>
              <p style={{ fontSize: '30px', fontWeight: 700, color: k.color, margin: '0 0 4px' }}>{cargando ? '...' : k.val}</p>
              <p style={{ fontSize: '12px', color: '#888', margin: 0 }}>{k.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', background: 'white', borderRadius: '12px 12px 0 0', padding: '0 20px', borderBottom: '2px solid #F0F0F0' }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ padding: '13px 18px', border: 'none', background: 'transparent', color: tab === t.id ? '#E8321A' : '#888', fontWeight: tab === t.id ? 700 : 400, fontSize: '13px', cursor: 'pointer', borderBottom: tab === t.id ? '2px solid #E8321A' : '2px solid transparent', marginBottom: '-2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            {t.label}
            {t.badge > 0 && <span style={{ background: '#E8321A', color: 'white', fontSize: '10px', fontWeight: 700, padding: '1px 6px', borderRadius: '10px' }}>{t.badge}</span>}
          </button>
        ))}
      </div>

      <div style={{ background: 'white', borderRadius: '0 0 14px 14px', padding: '24px', border: '1px solid #F0F0F0', borderTop: 'none', marginBottom: '16px' }}>

        {tab === 'alertas' && (
          <div>
            {filtroActivo && (
              <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'16px', padding:'8px 14px', background:'#F0F0F0', borderRadius:'8px' }}>
                <span style={{ fontSize:'12px', color:'#555' }}>Filtrando: <strong>{filtroActivo==='vencidas'?'Vencidos':filtroActivo==='proximas'?'Proximos a vencer':filtroActivo==='sinMovimiento'?'Sin movimiento':'Contratos extranjeros'}</strong></span>
                <button onClick={() => setFiltroActivo(null)} style={{ background:'none', border:'none', color:'#E8321A', cursor:'pointer', fontSize:'12px', fontWeight:700, marginLeft:'auto' }}>Quitar filtro ✕</button>
              </div>
            )}
            {(filtroActivo===null || filtroActivo==='vencidas') && vencidas.length > 0 && (<>
              <p style={secTit()}>Vencidos — acción inmediata</p>
              {vencidas.map((s, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 14px', borderRadius: '10px', border: '1px solid #FCA5A5', background: '#FFF5F5', marginBottom: '6px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#E8321A', flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#0F2447', display: 'block', marginBottom: '2px' }}>{s.nombre_empresa || s.nombre || 'Sin nombre'} — {s.tipo_solicitud}</span>
                    <p style={{ fontSize: '11px', color: '#E8321A', fontWeight: 600, margin: 0 }}>Venció hace {Math.abs(getDiasRestantes(s.fecha_limite))} día(s) · {s.estado}</p>
                  </div>
                  <span style={chipId}>{s.id}</span>
                  <span style={{ background: '#FEF3C7', color: '#92400E', fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '10px' }}>{s.prioridad || 'Sin prioridad'}</span>
                  <button style={btnVer} onClick={() => window.location.href = `/dashboard/expediente?buscar=${s.id}`}>Ver expediente →</button>
                    <button style={{...btnVer, color:'#7C3AED'}} onClick={() => window.location.href = `/dashboard/solicitudes/${s.id}`}>Ver solicitud →</button>
                </div>
              ))}
            </>)}

            {(filtroActivo===null || filtroActivo==='proximas') && proximas.length > 0 && (<>
              <p style={secTit(vencidas.length > 0)}>Próximos a vencer</p>
              {proximas.map((s, i) => {
                const dias = getDiasRestantes(s.fecha_limite)
                const limite = getLimitePorPrioridad(s.prioridad || 'Baja')
                const enRiesgo = dias <= limite
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 14px', borderRadius: '10px', border: `1px solid ${enRiesgo ? '#FCA5A5' : '#FDE68A'}`, background: enRiesgo ? '#FFF5F5' : '#FFFBEB', marginBottom: '6px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: enRiesgo ? '#E8321A' : '#F59E0B', flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: '#0F2447', display: 'block', marginBottom: '2px' }}>{s.nombre_empresa || s.nombre || 'Sin nombre'} — {s.tipo_solicitud}</span>
                      <p style={{ fontSize: '11px', color: enRiesgo ? '#E8321A' : '#92400E', fontWeight: 600, margin: 0 }}>
                        {dias === 0 ? 'Vence hoy' : dias === 1 ? 'Vence mañana' : `Vence en ${dias} días`}
                        {enRiesgo ? ` · Prioridad ${s.prioridad} — límite ${limite} día(s)` : ''}
                      </p>
                    </div>
                    <span style={chipId}>{s.id}</span>
                    <span style={{ background: '#FEF3C7', color: '#92400E', fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '10px' }}>{s.prioridad || 'Sin prioridad'}</span>
                    <button style={btnVer} onClick={() => window.location.href = `/dashboard/expediente?buscar=${s.id}`}>Ver expediente →</button>
                    <button style={{...btnVer, color:'#7C3AED'}} onClick={() => window.location.href = `/dashboard/solicitudes/${s.id}`}>Ver solicitud →</button>
                  </div>
                )
              })}
            </>)}

            {(filtroActivo===null || filtroActivo==='sinMovimiento') && sinMovimiento.length > 0 && (<>
              <p style={secTit(true)}>Sin movimiento — tiempo límite superado</p>
              {sinMovimiento.map((s, i) => {
                const limite = getLimitePorPrioridad(s.prioridad || 'Baja')
                const diasSinMover = Math.ceil((hoy.getTime() - new Date(s.created_at).getTime()) / (1000 * 60 * 60 * 24))
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 14px', borderRadius: '10px', border: '1px solid #E8E8E8', background: '#F8F8F8', marginBottom: '6px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#888', flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: '#0F2447', display: 'block', marginBottom: '2px' }}>{s.nombre_empresa || s.nombre || 'Sin nombre'} — {s.tipo_solicitud}</span>
                      <p style={{ fontSize: '11px', color: '#666', fontWeight: 600, margin: 0 }}>{diasSinMover} días sin movimiento · Prioridad {s.prioridad || 'Baja'} — límite {limite} día(s)</p>
                    </div>
                    <span style={chipId}>{s.id}</span>
                    <span style={{ background: '#FEF3C7', color: '#92400E', fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '10px' }}>{s.estado}</span>
                    <button style={btnVer} onClick={() => window.location.href = `/dashboard/solicitudes/${s.id}`}>Ver solicitud →</button>
                  </div>
                )
              })}
            </>)}

            {totalAlertas === 0 && !cargando && (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <p style={{ fontSize: '40px', margin: '0 0 12px' }}>✅</p>
                <p style={{ color: '#0F2447', fontWeight: 700, fontSize: '15px', margin: '0 0 6px' }}>Todo en orden</p>
                <p style={{ color: '#888', fontSize: '13px', margin: 0 }}>No hay alertas activas en este momento</p>
              </div>
            )}
          </div>
        )}

        {tab === 'obligaciones' && (
          <div>
            {oblVencidas.length > 0 && (<>
              <p style={secTit()}>Obligaciones vencidas</p>
              {oblVencidas.map((o, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '11px 14px', borderRadius: '10px', border: '1px solid #FCA5A5', background: '#FFF5F5', marginBottom: '6px' }}>
                  <span style={chipId}>{o.id_solicitud}</span>
                  <span style={{ flex: 1, fontSize: '12px', color: '#0F2447' }}>{o.descripcion}</span>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#E8321A', flexShrink: 0 }}>Hace {Math.abs(getDiasRestantes(o.fecha_limite))} día(s)</span>
                  <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 7px', borderRadius: '10px', background: o.tiene_documento ? '#D1FAE5' : '#FEE2E2', color: o.tiene_documento ? '#065F46' : '#991B1B' }}>{o.tiene_documento ? 'Con documento' : 'Sin documento'}</span>
                </div>
              ))}
            </>)}

            {oblProximas.length > 0 && (<>
              <p style={secTit(oblVencidas.length > 0)}>Próximas — 30 días</p>
              {oblProximas.map((o, i) => {
                const dias = getDiasRestantes(o.fecha_limite)
                const colorFecha = dias === 0 ? '#E8321A' : dias <= 3 ? '#F59E0B' : '#0D5C36'
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '11px 14px', borderRadius: '10px', border: '1px solid #F0F0F0', background: '#FAFAFA', marginBottom: '6px' }}>
                    <span style={chipId}>{o.id_solicitud}</span>
                    <span style={{ flex: 1, fontSize: '12px', color: '#0F2447' }}>{o.descripcion}</span>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: colorFecha, flexShrink: 0 }}>{dias === 0 ? 'Hoy' : dias === 1 ? 'Mañana' : `En ${dias} días`}</span>
                    <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 7px', borderRadius: '10px', background: o.tiene_documento ? '#D1FAE5' : '#FEE2E2', color: o.tiene_documento ? '#065F46' : '#991B1B' }}>{o.tiene_documento ? 'Con documento' : 'Sin documento'}</span>
                  </div>
                )
              })}
            </>)}

            {oblVencidas.length === 0 && oblProximas.length === 0 && !cargando && (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <p style={{ fontSize: '40px', margin: '0 0 12px' }}>📋</p>
                <p style={{ color: '#0F2447', fontWeight: 700, fontSize: '15px', margin: '0 0 6px' }}>Sin obligaciones próximas</p>
                <p style={{ color: '#888', fontSize: '13px', margin: 0 }}>No hay obligaciones en los próximos 30 días</p>
              </div>
            )}

            {oblSinDoc.length > 0 && (
              <div style={{ marginTop: '16px', padding: '12px 14px', background: '#FFF5F5', borderRadius: '10px', border: '1px solid #FCA5A5' }}>
                <p style={{ fontSize: '12px', color: '#991B1B', fontWeight: 600, margin: 0 }}>{oblSinDoc.length} obligación(es) sin documento de respaldo — sin evidencia no puedes acreditar el cumplimiento</p>
              </div>
            )}
          </div>
        )}

        {tab === 'keywords' && (
          <div>
            <p style={secTit()}>Palabras a buscar en contratos activos</p>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              <input value={nuevaKeyword} onChange={e => setNuevaKeyword(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') agregarKeyword() }} placeholder="Escribe una palabra y presiona Enter..." style={{ flex: 1, padding: '9px 13px', borderRadius: '8px', border: '1.5px solid #E8E8E8', fontSize: '13px', outline: 'none', color: '#0F2447' }} />
              <button onClick={agregarKeyword} style={{ background: '#0F2447', color: 'white', border: 'none', padding: '9px 18px', borderRadius: '8px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>Agregar</button>
            </div>
            <div style={{ marginBottom: '20px' }}>
              {keywords.length === 0 && <p style={{ color: '#888', fontSize: '13px' }}>Aún no hay palabras. Agrega una para empezar.</p>}
              {keywords.map((k, i) => {
                const cnt = solicitudes.filter(s => (s.descripcion || '').toLowerCase().includes(k) || (s.condiciones_especiales || '').toLowerCase().includes(k)).length
                return (
                  <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '5px 10px', borderRadius: '20px', background: cnt > 0 ? '#FFF5F5' : '#F8F8F8', border: `1px solid ${cnt > 0 ? '#FCA5A5' : '#E8E8E8'}`, margin: '3px' }}>
                    <span style={{ fontSize: '12px', color: cnt > 0 ? '#E8321A' : '#555', fontWeight: 600 }}>{k}</span>
                    {cnt > 0 && <span style={{ background: '#E8321A', color: 'white', fontSize: '10px', fontWeight: 700, padding: '1px 5px', borderRadius: '10px' }}>{cnt}</span>}
                    <button onClick={() => eliminarKeyword(i)} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: '12px', padding: 0 }}>✕</button>
                  </span>
                )
              })}
            </div>
            {solicitudesConKeyword.length > 0 && (<>
              <p style={secTit()}>Contratos donde aparecen estas palabras</p>
              {solicitudesConKeyword.map((s, i) => {
                const kEncontradas = keywords.filter(k => (s.descripcion || '').toLowerCase().includes(k) || (s.condiciones_especiales || '').toLowerCase().includes(k))
                return (
                  <div key={i} style={{ padding: '12px 14px', borderRadius: '10px', border: '1px solid #F0F0F0', marginBottom: '8px', background: '#FAFAFA' }}>
                    <div style={{ marginBottom: '6px' }}>
                      <span style={chipId}>{s.id}</span>
                      {kEncontradas.map((k, j) => <span key={j} style={{ background: '#FFF5F5', color: '#E8321A', fontSize: '10px', fontWeight: 700, padding: '1px 6px', borderRadius: '10px', border: '1px solid #FCA5A5', marginLeft: '4px' }}>{k}</span>)}
                    </div>
                    <p style={{ fontSize: '13px', fontWeight: 600, color: '#0F2447', margin: '0 0 3px' }}>{s.nombre_empresa || s.nombre || 'Sin nombre'} — {s.tipo_solicitud}</p>
                    <p style={{ fontSize: '11px', color: '#888', margin: '0 0 6px' }}>{(s.descripcion || '').substring(0, 100)}{(s.descripcion || '').length > 100 ? '...' : ''}</p>
                    <button style={btnVer} onClick={() => window.location.href = `/dashboard/expediente?buscar=${s.id}`}>Ver expediente →</button>
                    <button style={{...btnVer, color:'#7C3AED'}} onClick={() => window.location.href = `/dashboard/solicitudes/${s.id}`}>Ver solicitud →</button>
                  </div>
                )
              })}
            </>)}
            {keywords.length > 0 && solicitudesConKeyword.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <p style={{ fontSize: '40px', margin: '0 0 12px' }}>🔍</p>
                <p style={{ color: '#0F2447', fontWeight: 700, fontSize: '15px', margin: '0 0 6px' }}>Sin coincidencias</p>
                <p style={{ color: '#888', fontSize: '13px', margin: 0 }}>Ningún contrato activo contiene estas palabras</p>
              </div>
            )}
          </div>
        )}

        {tab === 'aviso' && (
          <div>
            <p style={secTit()}>Inicio del día</p>
            <div style={{ border: '1px solid #F0F0F0', borderRadius: '12px', overflow: 'hidden', marginBottom: '24px' }}>
              <div style={{ background: '#F8F8F8', padding: '14px 18px', borderBottom: '1px solid #F0F0F0' }}>
                <p style={{ fontSize: '11px', color: '#888', margin: '0 0 2px' }}>Para: {process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'jovanni.poceros@t1.com'}</p>
                <p style={{ fontSize: '13px', fontWeight: 700, color: '#0F2447', margin: 0 }}>Resumen legal del día — {fechaCap}</p>
              </div>
              <div style={{ padding: '20px' }}>
                <p style={{ fontSize: '13px', fontWeight: 600, color: '#0F2447', margin: '0 0 4px' }}>Buenos días</p>
                <p style={{ fontSize: '12px', color: '#888', margin: '0 0 16px' }}>Salud del expediente: <strong style={{ color: colorSalud }}>{salud}/100</strong></p>
                {vencidas.length > 0 && <div style={{ display: 'flex', gap: '10px', padding: '9px 12px', background: '#FFF5F5', borderRadius: '8px', marginBottom: '6px' }}><div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#E8321A', color: 'white', fontSize: '10px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>!</div><span style={{ fontSize: '12px', color: '#0F2447' }}>{vencidas.length} contrato(s) vencido(s) — acción inmediata requerida</span></div>}
                {proximas.length > 0 && <div style={{ display: 'flex', gap: '10px', padding: '9px 12px', background: '#FFFBEB', borderRadius: '8px', marginBottom: '6px' }}><div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#F59E0B', color: 'white', fontSize: '10px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>!</div><span style={{ fontSize: '12px', color: '#0F2447' }}>{proximas.length} contrato(s) vencen esta semana</span></div>}
                {sinMovimiento.length > 0 && <div style={{ display: 'flex', gap: '10px', padding: '9px 12px', background: '#F8F8F8', borderRadius: '8px', marginBottom: '6px' }}><div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#888', color: 'white', fontSize: '10px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>!</div><span style={{ fontSize: '12px', color: '#0F2447' }}>{sinMovimiento.length} solicitud(es) sin movimiento — tiempo límite superado</span></div>}
                {oblSinDoc.length > 0 && <div style={{ display: 'flex', gap: '10px', padding: '9px 12px', background: '#FFF5F5', borderRadius: '8px', marginBottom: '6px' }}><div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#E8321A', color: 'white', fontSize: '10px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>!</div><span style={{ fontSize: '12px', color: '#0F2447' }}>{oblSinDoc.length} obligación(es) sin documento de respaldo</span></div>}
                {totalAlertas === 0 && oblSinDoc.length === 0 && <div style={{ display: 'flex', gap: '10px', padding: '9px 12px', background: '#F0FDF4', borderRadius: '8px', marginBottom: '6px' }}><div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#0D5C36', color: 'white', fontSize: '10px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>✓</div><span style={{ fontSize: '12px', color: '#0F2447' }}>Todo en orden — no hay prioridades para hoy</span></div>}
                <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <button onClick={() => enviarAviso('matutino')} disabled={enviandoAviso} style={{ background: '#0F2447', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>{enviandoAviso ? 'Enviando...' : 'Enviar aviso de inicio'}</button>
                  {avisoEnviado && <span style={{ fontSize: '12px', color: '#0D5C36', fontWeight: 600 }}>✓ Enviado correctamente</span>}
                </div>
              </div>
            </div>

            <p style={secTit()}>Cierre del día</p>
            <div style={{ border: '1px solid #F0F0F0', borderRadius: '12px', overflow: 'hidden' }}>
              <div style={{ background: '#F8F8F8', padding: '14px 18px', borderBottom: '1px solid #F0F0F0' }}>
                <p style={{ fontSize: '11px', color: '#888', margin: '0 0 2px' }}>Para: {process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'jovanni.poceros@t1.com'}</p>
                <p style={{ fontSize: '13px', fontWeight: 700, color: '#0F2447', margin: 0 }}>Cierre del día — {fechaCap}</p>
              </div>
              <div style={{ padding: '20px' }}>
                <p style={{ fontSize: '13px', fontWeight: 600, color: '#0F2447', margin: '0 0 4px' }}>Resumen de lo que sucedió hoy</p>
                <p style={{ fontSize: '12px', color: '#888', margin: '0 0 16px' }}>Salud al cierre: <strong style={{ color: colorSalud }}>{salud}/100</strong></p>
                {[
                  { label: 'Contratos activos al cerrar el día', val: solicitudes.length, alerta: false },
                  { label: 'Alertas activas al cierre', val: totalAlertas, alerta: totalAlertas > 0 },
                  { label: 'Obligaciones sin documento de respaldo', val: oblSinDoc.length, alerta: oblSinDoc.length > 0 },
                  { label: 'Contratos con palabras de riesgo detectadas', val: solicitudesConKeyword.length, alerta: solicitudesConKeyword.length > 0 },
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: i % 2 === 0 ? '#F8F8F8' : 'white', borderBottom: '1px solid #F0F0F0' }}>
                    <span style={{ fontSize: '13px', color: '#555' }}>{item.label}</span>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: item.alerta ? '#E8321A' : '#0D5C36' }}>{item.val}</span>
                  </div>
                ))}
                <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <button onClick={() => enviarAviso('cierre')} disabled={enviandoAviso} style={{ background: '#0D5C36', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>{enviandoAviso ? 'Enviando...' : 'Enviar resumen de cierre'}</button>
                  {avisoEnviado && <span style={{ fontSize: '12px', color: '#0D5C36', fontWeight: 600 }}>✓ Enviado correctamente</span>}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
