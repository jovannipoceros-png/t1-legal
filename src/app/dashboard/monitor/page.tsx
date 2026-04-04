'use client'
import { useState, useEffect } from 'react'
import { obtenerSolicitudes } from '@/lib/supabase/solicitudes'

export default function Monitor() {
  const [solicitudes, setSolicitudes] = useState<any[]>([])
  const [cargando, setCargando] = useState(true)
  const [tab, setTab] = useState('alertas')
  const [keywords, setKeywords] = useState(['indemnizacion','penalizacion','rescision','confidencialidad','arbitraje','jurisdiccion extranjera','fuerza mayor'])
  const [nuevaKeyword, setNuevaKeyword] = useState('')

  useEffect(() => {
    obtenerSolicitudes()
      .then(data => { setSolicitudes(data||[]); setCargando(false) })
      .catch(() => setCargando(false))
  }, [])

  const hoy = new Date()

  const vencenProximo = solicitudes.filter(s => {
    if (!s.fecha_limite || s.estado==='Cerrado') return false
    const fecha = new Date(s.fecha_limite)
    const dias = Math.ceil((fecha.getTime() - hoy.getTime()) / (1000*60*60*24))
    return dias <= 7 && dias >= 0
  })

  const vencidas = solicitudes.filter(s => {
    if (!s.fecha_limite || s.estado==='Cerrado') return false
    const fecha = new Date(s.fecha_limite)
    return fecha < hoy
  })

  const sinMovimiento = solicitudes.filter(s => {
    if (s.estado==='Cerrado') return false
    const fecha = new Date(s.created_at)
    const dias = Math.ceil((hoy.getTime() - fecha.getTime()) / (1000*60*60*24))
    return dias >= 5 && s.estado==='Pendiente'
  })

  const urgentes = solicitudes.filter(s => s.prioridad==='Alta' && s.estado!=='Cerrado')

  const internacionales = solicitudes.filter(s => s.nacionalidad && s.nacionalidad!=='Mexicana' && s.estado!=='Cerrado')

  const getDias = (fecha: string) => {
    const f = new Date(fecha)
    const dias = Math.ceil((f.getTime() - hoy.getTime()) / (1000*60*60*24))
    return dias
  }

  const tabs = [
    { id:'alertas', label:'Alertas', badge: vencidas.length + vencenProximo.length + sinMovimiento.length },
    { id:'fuentes', label:'Fuentes y sectores' },
    { id:'keywords', label:'Keywords legales' },
  ]

  return (
    <div style={{ padding:'32px', fontFamily:'sans-serif' }}>
      <h1 style={{ color:'#0F2447', fontSize:'24px', fontWeight:700, margin:'0 0 4px' }}>Monitor Legal</h1>
      <p style={{ color:'#888', margin:'0 0 24px' }}>Alertas, vencimientos y seguimiento proactivo</p>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'16px', marginBottom:'24px' }}>
        {[
          { label:'Vencidas', value:vencidas.length, color:'#E8321A', bg:'#FFF5F5', icon:'🔴' },
          { label:'Vencen en 7 dias', value:vencenProximo.length, color:'#F59E0B', bg:'#FFFBEB', icon:'🟡' },
          { label:'Sin movimiento +5 dias', value:sinMovimiento.length, color:'#888', bg:'#F8F8F8', icon:'⚪' },
          { label:'Contratos internacionales', value:internacionales.length, color:'#1D4ED8', bg:'#EFF6FF', icon:'🌎' },
        ].map((k,i) => (
          <div key={i} style={{ background:k.bg, borderRadius:'12px', padding:'20px', boxShadow:'0 1px 4px rgba(0,0,0,0.06)', border:`1px solid ${k.color}20` }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'8px' }}>
              <p style={{ color:'#888', fontSize:'12px', margin:0 }}>{k.label}</p>
              <span style={{ fontSize:'16px' }}>{k.icon}</span>
            </div>
            <p style={{ color:k.color, fontSize:'32px', fontWeight:700, margin:0 }}>{cargando?'...':k.value}</p>
          </div>
        ))}
      </div>

      <div style={{ display:'flex', gap:0, marginBottom:'24px', borderBottom:'2px solid #F0F0F0', background:'white', borderRadius:'12px 12px 0 0', padding:'0 20px' }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{ padding:'14px 20px', border:'none', background:'transparent', color:tab===t.id?'#E8321A':'#888', fontWeight:tab===t.id?700:400, fontSize:'13px', cursor:'pointer', borderBottom:tab===t.id?'2px solid #E8321A':'2px solid transparent', marginBottom:'-2px', display:'flex', alignItems:'center', gap:'6px' }}>
            {t.label}
            {t.badge && t.badge > 0 ? <span style={{ background:'#E8321A', color:'white', fontSize:'10px', fontWeight:700, padding:'1px 6px', borderRadius:'10px' }}>{t.badge}</span> : null}
          </button>
        ))}
      </div>

      <div style={{ background:'white', borderRadius:'0 0 16px 16px', padding:'24px', boxShadow:'0 1px 4px rgba(0,0,0,0.06)', border:'1px solid #F0F0F0', borderTop:'none' }}>

        {tab==='alertas' && (
          <div>
            {vencidas.length > 0 && (
              <div style={{ marginBottom:'24px' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'12px' }}>
                  <span style={{ fontSize:'16px' }}>🔴</span>
                  <h3 style={{ color:'#E8321A', fontSize:'14px', fontWeight:700, margin:0 }}>Vencidas — Accion inmediata requerida</h3>
                </div>
                {vencidas.map((s,i) => (
                  <div key={i} style={{ display:'flex', alignItems:'center', gap:'12px', padding:'14px 16px', borderRadius:'10px', border:'1.5px solid #FCA5A5', background:'#FFF5F5', marginBottom:'8px' }}>
                    <div style={{ flex:1 }}>
                      <div style={{ display:'flex', gap:'6px', marginBottom:'4px' }}>
                        <span style={{ background:'#0F2447', color:'white', fontSize:'10px', fontWeight:700, padding:'1px 6px', borderRadius:'10px' }}>{s.id}</span>
                        <span style={{ background:'#E8321A', color:'white', fontSize:'10px', fontWeight:700, padding:'1px 6px', borderRadius:'10px' }}>VENCIDA</span>
                      </div>
                      <p style={{ color:'#0F2447', fontSize:'13px', fontWeight:600, margin:'0 0 2px' }}>{s.nombre_empresa||s.nombre||'Sin nombre'} — {s.tipo_solicitud}</p>
                      <p style={{ color:'#E8321A', fontSize:'11px', margin:0, fontWeight:600 }}>Vencio el {new Date(s.fecha_limite).toLocaleDateString('es-MX')} — hace {Math.abs(getDias(s.fecha_limite))} dias</p>
                    </div>
                    <span style={{ background:'#FEF3C7', color:'#92400E', fontSize:'11px', fontWeight:700, padding:'3px 10px', borderRadius:'10px' }}>{s.estado}</span>
                  </div>
                ))}
              </div>
            )}

            {vencenProximo.length > 0 && (
              <div style={{ marginBottom:'24px' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'12px' }}>
                  <span style={{ fontSize:'16px' }}>🟡</span>
                  <h3 style={{ color:'#F59E0B', fontSize:'14px', fontWeight:700, margin:0 }}>Vencen en los proximos 7 dias</h3>
                </div>
                {vencenProximo.map((s,i) => {
                  const dias = getDias(s.fecha_limite)
                  return (
                    <div key={i} style={{ display:'flex', alignItems:'center', gap:'12px', padding:'14px 16px', borderRadius:'10px', border:'1.5px solid #FDE68A', background:'#FFFBEB', marginBottom:'8px' }}>
                      <div style={{ flex:1 }}>
                        <div style={{ display:'flex', gap:'6px', marginBottom:'4px' }}>
                          <span style={{ background:'#0F2447', color:'white', fontSize:'10px', fontWeight:700, padding:'1px 6px', borderRadius:'10px' }}>{s.id}</span>
                          <span style={{ background:dias<=2?'#E8321A':'#F59E0B', color:'white', fontSize:'10px', fontWeight:700, padding:'1px 6px', borderRadius:'10px' }}>
                            {dias===0?'HOY':dias===1?'MAÑANA':`${dias} DIAS`}
                          </span>
                        </div>
                        <p style={{ color:'#0F2447', fontSize:'13px', fontWeight:600, margin:'0 0 2px' }}>{s.nombre_empresa||s.nombre||'Sin nombre'} — {s.tipo_solicitud}</p>
                        <p style={{ color:'#888', fontSize:'11px', margin:0 }}>Fecha limite: {new Date(s.fecha_limite).toLocaleDateString('es-MX')}</p>
                      </div>
                      <span style={{ background:'#EFF6FF', color:'#1D4ED8', fontSize:'11px', fontWeight:700, padding:'3px 10px', borderRadius:'10px' }}>{s.estado}</span>
                    </div>
                  )
                })}
              </div>
            )}

            {sinMovimiento.length > 0 && (
              <div style={{ marginBottom:'24px' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'12px' }}>
                  <span style={{ fontSize:'16px' }}>⚠️</span>
                  <h3 style={{ color:'#888', fontSize:'14px', fontWeight:700, margin:0 }}>Sin movimiento — Mas de 5 dias en Pendiente</h3>
                </div>
                {sinMovimiento.map((s,i) => {
                  const dias = Math.ceil((hoy.getTime() - new Date(s.created_at).getTime()) / (1000*60*60*24))
                  return (
                    <div key={i} style={{ display:'flex', alignItems:'center', gap:'12px', padding:'14px 16px', borderRadius:'10px', border:'1px solid #E8E8E8', background:'#F8F8F8', marginBottom:'8px' }}>
                      <div style={{ flex:1 }}>
                        <div style={{ display:'flex', gap:'6px', marginBottom:'4px' }}>
                          <span style={{ background:'#0F2447', color:'white', fontSize:'10px', fontWeight:700, padding:'1px 6px', borderRadius:'10px' }}>{s.id}</span>
                          <span style={{ background:'#F8F8F8', color:'#888', fontSize:'10px', fontWeight:700, padding:'1px 6px', borderRadius:'10px', border:'1px solid #E8E8E8' }}>{dias} DIAS SIN MOVER</span>
                        </div>
                        <p style={{ color:'#0F2447', fontSize:'13px', fontWeight:600, margin:'0 0 2px' }}>{s.nombre_empresa||s.nombre||'Sin nombre'} — {s.tipo_solicitud}</p>
                        <p style={{ color:'#888', fontSize:'11px', margin:0 }}>Recibido el {new Date(s.created_at).toLocaleDateString('es-MX')}</p>
                      </div>
                      <span style={{ background:'#FEF3C7', color:'#92400E', fontSize:'11px', fontWeight:700, padding:'3px 10px', borderRadius:'10px' }}>{s.estado}</span>
                    </div>
                  )
                })}
              </div>
            )}

            {urgentes.length > 0 && (
              <div>
                <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'12px' }}>
                  <span style={{ fontSize:'16px' }}>🚨</span>
                  <h3 style={{ color:'#E8321A', fontSize:'14px', fontWeight:700, margin:0 }}>Prioridad Alta activas</h3>
                </div>
                {urgentes.map((s,i) => (
                  <div key={i} style={{ display:'flex', alignItems:'center', gap:'12px', padding:'14px 16px', borderRadius:'10px', border:'1px solid #FCA5A5', background:'white', marginBottom:'8px' }}>
                    <div style={{ flex:1 }}>
                      <div style={{ display:'flex', gap:'6px', marginBottom:'4px' }}>
                        <span style={{ background:'#0F2447', color:'white', fontSize:'10px', fontWeight:700, padding:'1px 6px', borderRadius:'10px' }}>{s.id}</span>
                        <span style={{ background:'#E8321A', color:'white', fontSize:'10px', fontWeight:700, padding:'1px 6px', borderRadius:'10px' }}>URGENTE</span>
                      </div>
                      <p style={{ color:'#0F2447', fontSize:'13px', fontWeight:600, margin:'0 0 2px' }}>{s.nombre_empresa||s.nombre||'Sin nombre'} — {s.tipo_solicitud}</p>
                      <p style={{ color:'#888', fontSize:'11px', margin:0 }}>{s.area} · {s.empresa_t1}</p>
                    </div>
                    <span style={{ background:'#EFF6FF', color:'#1D4ED8', fontSize:'11px', fontWeight:700, padding:'3px 10px', borderRadius:'10px' }}>{s.estado}</span>
                  </div>
                ))}
              </div>
            )}

            {vencidas.length===0 && vencenProximo.length===0 && sinMovimiento.length===0 && urgentes.length===0 && (
              <div style={{ textAlign:'center', padding:'48px' }}>
                <p style={{ fontSize:'48px', margin:'0 0 16px' }}>✅</p>
                <p style={{ color:'#0F2447', fontWeight:700, fontSize:'16px', margin:'0 0 8px' }}>Todo en orden</p>
                <p style={{ color:'#888', fontSize:'13px', margin:0 }}>No hay alertas activas en este momento</p>
              </div>
            )}
          </div>
        )}

        {tab==='fuentes' && (
          <div>
            <p style={{ color:'#0F2447', fontSize:'14px', fontWeight:700, margin:'0 0 16px' }}>Sectores con contratos activos</p>
            {['Fintech','Pagos digitales','Telecomunicaciones','Logistica','Marketing','Recursos Humanos','Tecnologia'].map((sector,i) => {
              const count = solicitudes.filter(s => s.area?.toLowerCase().includes(sector.toLowerCase().split(' ')[0]) || s.descripcion?.toLowerCase().includes(sector.toLowerCase())).length
              return (
                <div key={i} style={{ display:'flex', alignItems:'center', gap:'12px', padding:'12px 16px', borderRadius:'10px', border:'1px solid #F0F0F0', marginBottom:'6px', background:'#FAFAFA' }}>
                  <div style={{ width:'8px', height:'8px', borderRadius:'50%', background:count>0?'#0D5C36':'#E0E2E6' }} />
                  <span style={{ color:'#0F2447', fontSize:'13px', fontWeight:500, flex:1 }}>{sector}</span>
                  <span style={{ color:count>0?'#0D5C36':'#888', fontSize:'12px', fontWeight:700 }}>{count} contratos</span>
                </div>
              )
            })}

            <p style={{ color:'#0F2447', fontSize:'14px', fontWeight:700, margin:'20px 0 16px' }}>Contrapartes internacionales</p>
            {internacionales.length===0 ? (
              <p style={{ color:'#888', fontSize:'13px' }}>Sin contratos internacionales activos</p>
            ) : internacionales.map((s,i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:'12px', padding:'12px 16px', borderRadius:'10px', border:'1px solid #BFDBFE', background:'#EFF6FF', marginBottom:'6px' }}>
                <span style={{ fontSize:'16px' }}>🌎</span>
                <div style={{ flex:1 }}>
                  <p style={{ color:'#0F2447', fontSize:'13px', fontWeight:600, margin:'0 0 2px' }}>{s.nombre_empresa||'Sin nombre'}</p>
                  <p style={{ color:'#888', fontSize:'11px', margin:0 }}>Nacionalidad: {s.nacionalidad} · {s.tipo_solicitud}</p>
                </div>
                <span style={{ background:'#1D4ED8', color:'white', fontSize:'10px', fontWeight:700, padding:'2px 8px', borderRadius:'10px' }}>{s.id}</span>
              </div>
            ))}
          </div>
        )}

        {tab==='keywords' && (
          <div>
            <p style={{ color:'#0F2447', fontSize:'13px', fontWeight:600, margin:'0 0 16px' }}>Keywords a monitorear en contratos y descripciones</p>
            <div style={{ display:'flex', gap:'8px', marginBottom:'20px' }}>
              <input value={nuevaKeyword} onChange={e => setNuevaKeyword(e.target.value)}
                onKeyDown={e => { if(e.key==='Enter' && nuevaKeyword.trim()) { setKeywords(k=>[...k, nuevaKeyword.trim()]); setNuevaKeyword('') }}}
                placeholder="Agregar keyword..."
                style={{ flex:1, padding:'10px 14px', borderRadius:'8px', border:'1.5px solid #E8E8E8', fontSize:'13px', outline:'none', color:'#0F2447' }} />
              <button onClick={() => { if(nuevaKeyword.trim()) { setKeywords(k=>[...k, nuevaKeyword.trim()]); setNuevaKeyword('') }}}
                style={{ background:'#0F2447', color:'white', border:'none', padding:'10px 20px', borderRadius:'8px', fontSize:'13px', fontWeight:700, cursor:'pointer' }}>
                Agregar
              </button>
            </div>
            <div style={{ display:'flex', flexWrap:'wrap', gap:'8px', marginBottom:'24px' }}>
              {keywords.map((k,i) => {
                const aparece = solicitudes.filter(s =>
                  (s.descripcion||'').toLowerCase().includes(k.toLowerCase()) ||
                  (s.condiciones_especiales||'').toLowerCase().includes(k.toLowerCase())
                ).length
                return (
                  <div key={i} style={{ display:'flex', alignItems:'center', gap:'6px', padding:'6px 12px', borderRadius:'20px', background:aparece>0?'#FFF5F5':'#F8F8F8', border:`1px solid ${aparece>0?'#FCA5A5':'#E8E8E8'}` }}>
                    <span style={{ color:aparece>0?'#E8321A':'#555', fontSize:'12px', fontWeight:600 }}>{k}</span>
                    {aparece>0 && <span style={{ background:'#E8321A', color:'white', fontSize:'10px', fontWeight:700, padding:'1px 5px', borderRadius:'10px' }}>{aparece}</span>}
                    <button onClick={() => setKeywords(ks => ks.filter((_,j)=>j!==i))}
                      style={{ background:'none', border:'none', color:'#888', cursor:'pointer', fontSize:'12px', padding:0 }}>✕</button>
                  </div>
                )
              })}
            </div>
            <div>
              <p style={{ color:'#0F2447', fontSize:'13px', fontWeight:700, margin:'0 0 12px' }}>Contratos con keywords detectadas</p>
              {solicitudes.filter(s =>
                keywords.some(k =>
                  (s.descripcion||'').toLowerCase().includes(k.toLowerCase()) ||
                  (s.condiciones_especiales||'').toLowerCase().includes(k.toLowerCase())
                )
              ).map((s,i) => {
                const kDetectadas = keywords.filter(k =>
                  (s.descripcion||'').toLowerCase().includes(k.toLowerCase()) ||
                  (s.condiciones_especiales||'').toLowerCase().includes(k.toLowerCase())
                )
                return (
                  <div key={i} style={{ padding:'14px 16px', borderRadius:'10px', border:'1px solid #F0F0F0', marginBottom:'8px', background:'#FAFAFA' }}>
                    <div style={{ display:'flex', gap:'6px', marginBottom:'6px' }}>
                      <span style={{ background:'#0F2447', color:'white', fontSize:'10px', fontWeight:700, padding:'1px 6px', borderRadius:'10px' }}>{s.id}</span>
                      {kDetectadas.map((k,j) => (
                        <span key={j} style={{ background:'#FFF5F5', color:'#E8321A', fontSize:'10px', fontWeight:700, padding:'1px 6px', borderRadius:'10px', border:'1px solid #FCA5A5' }}>{k}</span>
                      ))}
                    </div>
                    <p style={{ color:'#0F2447', fontSize:'13px', fontWeight:600, margin:'0 0 2px' }}>{s.nombre_empresa||s.nombre||'Sin nombre'} — {s.tipo_solicitud}</p>
                    <p style={{ color:'#888', fontSize:'11px', margin:0 }}>{s.descripcion?.substring(0,80)}</p>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
