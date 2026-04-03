'use client'
import { useState, useEffect } from 'react'
import { obtenerSolicitudes, obtenerTracking, actualizarEstado } from '@/lib/supabase/solicitudes'

export default function Negociacion() {
  const [solicitudes, setSolicitudes] = useState<any[]>([])
  const [seleccionada, setSeleccionada] = useState<any>(null)
  const [tracking, setTracking] = useState<any[]>([])
  const [tab, setTab] = useState('clausulas')
  const [cargando, setCargando] = useState(true)
  const [nota, setNota] = useState('')
  const [enviando, setEnviando] = useState(false)

  useEffect(() => {
    obtenerSolicitudes()
      .then(data => {
        const activas = (data||[]).filter(s => s.estado==='En negociacion' || s.estado==='En revision')
        setSolicitudes(activas)
        setCargando(false)
      })
  }, [])

  const abrirSolicitud = async (s: any) => {
    setSeleccionada(s)
    setTab('clausulas')
    const t = await obtenerTracking(s.id)
    setTracking(t||[])
  }

  const agregarNota = async () => {
    if (!nota.trim() || !seleccionada) return
    setEnviando(true)
    try {
      await actualizarEstado(seleccionada.id, seleccionada.estado, nota)
      const t = await obtenerTracking(seleccionada.id)
      setTracking(t||[])
      setNota('')
    } finally {
      setEnviando(false)
    }
  }

  const notasRonda = tracking.filter(t => !t.nota.startsWith('Estado actualizado'))
  const cambiosEstado = tracking.filter(t => t.nota.startsWith('Estado actualizado'))

  const clausulas = seleccionada ? [
    { nombre:'Vigencia', valor:seleccionada.vigencia, riesgo: seleccionada.vigencia ? 'ok' : 'pendiente' },
    { nombre:'Contraprestacion', valor:seleccionada.contraprestacion, riesgo: seleccionada.contraprestacion ? 'ok' : 'pendiente' },
    { nombre:'Plazo de pago', valor:seleccionada.plazo_pago ? `${seleccionada.plazo_pago} dias ${seleccionada.tipo_dias_pago}` : null, riesgo: seleccionada.plazo_pago ? 'ok' : 'pendiente' },
    { nombre:'Tipo de firma', valor:seleccionada.tipo_firma, riesgo: seleccionada.tipo_firma ? 'ok' : 'pendiente' },
    { nombre:'Nacionalidad contraparte', valor:seleccionada.nacionalidad, riesgo: seleccionada.nacionalidad==='Mexicana' ? 'ok' : seleccionada.nacionalidad ? 'alerta' : 'pendiente' },
    { nombre:'Confidencialidad', valor:seleccionada.confidencial ? 'Si — Marcada como confidencial' : 'No aplica', riesgo: 'ok' },
    { nombre:'Condiciones especiales', valor:seleccionada.condiciones_especiales, riesgo: seleccionada.condiciones_especiales ? 'alerta' : 'ok' },
    { nombre:'Traduccion requerida', valor:seleccionada.requiere_traduccion==='Si' ? `Si — ${seleccionada.idioma_traduccion}` : 'No', riesgo: seleccionada.requiere_traduccion==='Si' ? 'alerta' : 'ok' },
  ] : []

  const tabs = [
    { id:'clausulas', label:'Clausulas' },
    { id:'historial', label:'Historial de rondas' },
    { id:'resultado', label:'Documento resultado' },
  ]

  const riesgoColor: Record<string,{bg:string,color:string,label:string}> = {
    ok: { bg:'#F0FDF4', color:'#166534', label:'OK' },
    alerta: { bg:'#FFF8F0', color:'#92400E', label:'Revisar' },
    pendiente: { bg:'#F8F8F8', color:'#888', label:'Pendiente' },
  }

  return (
    <div style={{ padding:'32px', fontFamily:'sans-serif' }}>
      <h1 style={{ color:'#0F2447', fontSize:'24px', fontWeight:700, margin:'0 0 4px' }}>Negociacion</h1>
      <p style={{ color:'#888', margin:'0 0 24px' }}>Solicitudes en revision o negociacion activa</p>

      <div style={{ display:'grid', gridTemplateColumns:'280px 1fr', gap:'24px' }}>
        <div>
          <div style={{ background:'white', borderRadius:'16px', padding:'20px', boxShadow:'0 1px 4px rgba(0,0,0,0.06)', border:'1px solid #F0F0F0' }}>
            <h3 style={{ color:'#0F2447', fontSize:'13px', fontWeight:700, margin:'0 0 14px' }}>Solicitudes activas</h3>
            {cargando ? (
              <p style={{ color:'#888', fontSize:'12px' }}>Cargando...</p>
            ) : solicitudes.length===0 ? (
              <div style={{ textAlign:'center', padding:'20px 0' }}>
                <p style={{ fontSize:'24px', margin:'0 0 8px' }}>✅</p>
                <p style={{ color:'#888', fontSize:'12px', margin:0 }}>Sin solicitudes activas</p>
              </div>
            ) : solicitudes.map((s,i) => (
              <div key={i} onClick={() => abrirSolicitud(s)}
                style={{ padding:'12px', borderRadius:'10px', border:`1.5px solid ${seleccionada?.id===s.id?'#E8321A':'#F0F0F0'}`, marginBottom:'8px', cursor:'pointer', background:seleccionada?.id===s.id?'#FFF5F5':'#FAFAFA' }}>
                <div style={{ display:'flex', gap:'5px', marginBottom:'5px', flexWrap:'wrap' }}>
                  <span style={{ background:'#0F2447', color:'white', fontSize:'10px', fontWeight:700, padding:'1px 6px', borderRadius:'10px' }}>{s.id}</span>
                  <span style={{ background:s.estado==='En negociacion'?'#F3E8FF':'#EFF6FF', color:s.estado==='En negociacion'?'#7C3AED':'#1D4ED8', fontSize:'10px', fontWeight:700, padding:'1px 6px', borderRadius:'10px' }}>{s.estado}</span>
                </div>
                <p style={{ color:'#0F2447', fontWeight:700, fontSize:'12px', margin:'0 0 2px' }}>{s.nombre_empresa||s.nombre||'Sin nombre'}</p>
                <p style={{ color:'#888', fontSize:'11px', margin:0 }}>{s.tipo_solicitud||'Sin tipo'}</p>
              </div>
            ))}
          </div>
        </div>

        {seleccionada ? (
          <div>
            <div style={{ background:'white', borderRadius:'16px', padding:'24px', boxShadow:'0 1px 4px rgba(0,0,0,0.06)', border:'1px solid #F0F0F0' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px', paddingBottom:'16px', borderBottom:'1px solid #F0F0F0' }}>
                <div>
                  <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'4px' }}>
                    <span style={{ background:'#0F2447', color:'white', fontSize:'11px', fontWeight:700, padding:'2px 8px', borderRadius:'10px' }}>{seleccionada.id}</span>
                    <span style={{ background:seleccionada.estado==='En negociacion'?'#F3E8FF':'#EFF6FF', color:seleccionada.estado==='En negociacion'?'#7C3AED':'#1D4ED8', fontSize:'11px', fontWeight:700, padding:'2px 8px', borderRadius:'10px' }}>{seleccionada.estado}</span>
                    {seleccionada.prioridad==='Alta' && <span style={{ background:'#FEE2E2', color:'#C42A15', fontSize:'11px', fontWeight:700, padding:'2px 8px', borderRadius:'10px' }}>Urgente</span>}
                  </div>
                  <h2 style={{ color:'#0F2447', fontSize:'17px', fontWeight:700, margin:'0 0 2px' }}>{seleccionada.nombre_empresa||seleccionada.nombre||'Sin nombre'}</h2>
                  <p style={{ color:'#888', fontSize:'12px', margin:0 }}>{seleccionada.tipo_solicitud} · {seleccionada.empresa_t1} · {notasRonda.length} notas de ronda</p>
                </div>
                <div style={{ display:'flex', gap:'8px' }}>
                  <button style={{ background:'#E8321A', color:'white', border:'none', padding:'8px 16px', borderRadius:'8px', fontSize:'12px', fontWeight:700, cursor:'pointer' }}>Abrir en Editor</button>
                </div>
              </div>

              <div style={{ display:'flex', gap:0, marginBottom:'24px', borderBottom:'2px solid #F0F0F0' }}>
                {tabs.map(t => (
                  <button key={t.id} onClick={() => setTab(t.id)}
                    style={{ padding:'10px 18px', border:'none', background:'transparent', color:tab===t.id?'#E8321A':'#888', fontWeight:tab===t.id?700:400, fontSize:'13px', cursor:'pointer', borderBottom:tab===t.id?'2px solid #E8321A':'2px solid transparent', marginBottom:'-2px' }}>
                    {t.label}
                    {t.id==='historial' && notasRonda.length>0 && <span style={{ background:'#E8321A', color:'white', fontSize:'10px', fontWeight:700, padding:'1px 5px', borderRadius:'10px', marginLeft:'6px' }}>{notasRonda.length}</span>}
                  </button>
                ))}
              </div>

              {tab==='clausulas' && (
                <div>
                  <p style={{ color:'#0F2447', fontSize:'13px', fontWeight:600, margin:'0 0 16px' }}>Semaforo de clausulas clave</p>
                  <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
                    {clausulas.map((c,i) => (
                      <div key={i} style={{ display:'flex', alignItems:'center', gap:'12px', padding:'14px 16px', borderRadius:'10px', border:'1px solid #F0F0F0', background:'white' }}>
                        <div style={{ width:'8px', height:'8px', borderRadius:'50%', background:c.riesgo==='ok'?'#0D5C36':c.riesgo==='alerta'?'#F59E0B':'#E0E2E6', flexShrink:0 }} />
                        <div style={{ flex:1 }}>
                          <p style={{ color:'#0F2447', fontSize:'13px', fontWeight:600, margin:'0 0 2px' }}>{c.nombre}</p>
                          <p style={{ color:'#888', fontSize:'12px', margin:0 }}>{c.valor||'Sin definir'}</p>
                        </div>
                        <span style={{ background:riesgoColor[c.riesgo].bg, color:riesgoColor[c.riesgo].color, fontSize:'11px', fontWeight:700, padding:'3px 10px', borderRadius:'10px' }}>
                          {riesgoColor[c.riesgo].label}
                        </span>
                      </div>
                    ))}
                  </div>
                  {seleccionada.descripcion && (
                    <div style={{ marginTop:'16px', padding:'16px', background:'#F8F8F8', borderRadius:'10px', border:'1px solid #F0F0F0' }}>
                      <p style={{ color:'#0F2447', fontSize:'12px', fontWeight:700, margin:'0 0 6px' }}>Descripcion del solicitante</p>
                      <p style={{ color:'#555', fontSize:'13px', lineHeight:'1.6', margin:0 }}>{seleccionada.descripcion}</p>
                    </div>
                  )}
                </div>
              )}

              {tab==='historial' && (
                <div>
                  <div style={{ background:'#F8F8F8', borderRadius:'12px', padding:'16px', marginBottom:'20px', border:'1px solid #F0F0F0' }}>
                    <label style={{ display:'block', color:'#0F2447', fontSize:'13px', fontWeight:600, marginBottom:'8px' }}>Nueva nota de ronda</label>
                    <textarea value={nota} onChange={e => setNota(e.target.value)} rows={3}
                      placeholder="Ej: Ronda 2 — Contraparte acepto reducir penalizacion al 10%. Pendiente clausula de vigencia..."
                      style={{ width:'100%', padding:'12px', borderRadius:'8px', border:'1.5px solid #E8E8E8', fontSize:'13px', boxSizing:'border-box', resize:'none', outline:'none', marginBottom:'10px', background:'white' }} />
                    <button onClick={agregarNota} disabled={enviando||!nota.trim()}
                      style={{ background:nota.trim()?'#E8321A':'#E8E8E8', color:nota.trim()?'white':'#aaa', border:'none', padding:'10px 20px', borderRadius:'8px', fontSize:'13px', fontWeight:700, cursor:nota.trim()?'pointer':'default' }}>
                      {enviando ? 'Guardando...' : 'Guardar nota de ronda'}
                    </button>
                  </div>

                  {notasRonda.length === 0 ? (
                    <div style={{ textAlign:'center', padding:'32px', background:'#F8F8F8', borderRadius:'12px' }}>
                      <p style={{ fontSize:'24px', margin:'0 0 8px' }}>📝</p>
                      <p style={{ color:'#888', fontSize:'13px', margin:0 }}>Sin notas de rondas aun. Agrega la primera nota arriba.</p>
                    </div>
                  ) : (
                    <div>
                      <p style={{ color:'#0F2447', fontSize:'13px', fontWeight:700, margin:'0 0 14px' }}>{notasRonda.length} nota{notasRonda.length>1?'s':''} de ronda</p>
                      {notasRonda.map((t,i) => (
                        <div key={i} style={{ display:'flex', gap:'14px', marginBottom:'16px' }}>
                          <div style={{ display:'flex', flexDirection:'column', alignItems:'center' }}>
                            <div style={{ width:'32px', height:'32px', borderRadius:'50%', background:'#E8321A', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontWeight:700, fontSize:'12px', flexShrink:0 }}>
                              {notasRonda.length - i}
                            </div>
                            {i < notasRonda.length-1 && <div style={{ width:'2px', flex:1, background:'#F0F0F0', margin:'4px 0' }} />}
                          </div>
                          <div style={{ flex:1, padding:'14px 16px', background:'white', borderRadius:'12px', border:'1px solid #F0F0F0', marginBottom:'0' }}>
                            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'8px' }}>
                              <span style={{ color:'#E8321A', fontSize:'11px', fontWeight:700 }}>Ronda {notasRonda.length - i}</span>
                              <span style={{ color:'#aaa', fontSize:'11px' }}>{new Date(t.created_at).toLocaleString('es-MX')}</span>
                            </div>
                            <p style={{ color:'#0F2447', fontSize:'13px', lineHeight:'1.6', margin:'0 0 6px' }}>{t.nota}</p>
                            <p style={{ color:'#888', fontSize:'11px', margin:0 }}>— {t.autor}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {cambiosEstado.length > 0 && (
                    <div style={{ marginTop:'20px', padding:'14px 16px', background:'#F8F8F8', borderRadius:'10px', border:'1px solid #F0F0F0' }}>
                      <p style={{ color:'#0F2447', fontSize:'12px', fontWeight:700, margin:'0 0 10px' }}>Cambios de estado</p>
                      {cambiosEstado.map((t,i) => (
                        <div key={i} style={{ display:'flex', justifyContent:'space-between', padding:'6px 0', borderBottom:'1px solid #F0F0F0' }}>
                          <span style={{ color:'#555', fontSize:'12px' }}>{t.nota}</span>
                          <span style={{ color:'#aaa', fontSize:'11px' }}>{new Date(t.created_at).toLocaleDateString('es-MX')}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {tab==='resultado' && (
                <div>
                  <div style={{ background:'#F8F8F8', borderRadius:'12px', padding:'24px', border:'1px solid #F0F0F0', marginBottom:'16px' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px', paddingBottom:'12px', borderBottom:'1px solid #E8E8E8' }}>
                      <div>
                        <p style={{ color:'#0F2447', fontWeight:900, fontSize:'15px', margin:'0 0 2px' }}>{seleccionada.tipo_solicitud?.toUpperCase()||'DOCUMENTO RESULTADO'}</p>
                        <p style={{ color:'#888', fontSize:'12px', margin:0 }}>Expediente {seleccionada.id}</p>
                      </div>
                      <span style={{ background:'#0F2447', color:'white', fontSize:'11px', fontWeight:700, padding:'3px 10px', borderRadius:'10px' }}>{seleccionada.empresa_t1}</span>
                    </div>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', marginBottom:'16px' }}>
                      {[
                        { label:'Solicitante', value:seleccionada.nombre||'—' },
                        { label:'Contraparte', value:seleccionada.nombre_empresa||'—' },
                        { label:'RFC', value:seleccionada.rfc||'—' },
                        { label:'Apoderado', value:seleccionada.apoderado||'—' },
                        { label:'Vigencia', value:seleccionada.vigencia||'—' },
                        { label:'Contraprestacion', value:seleccionada.contraprestacion||'—' },
                        { label:'Plazo de pago', value:seleccionada.plazo_pago?`${seleccionada.plazo_pago} dias ${seleccionada.tipo_dias_pago}`:'—' },
                        { label:'Tipo de firma', value:seleccionada.tipo_firma||'—' },
                      ].map((d,i) => (
                        <div key={i} style={{ padding:'10px', background:'white', borderRadius:'8px', border:'1px solid #E8E8E8' }}>
                          <p style={{ color:'#888', fontSize:'10px', fontWeight:700, margin:'0 0 2px' }}>{d.label.toUpperCase()}</p>
                          <p style={{ color:'#0F2447', fontSize:'13px', fontWeight:600, margin:0 }}>{d.value}</p>
                        </div>
                      ))}
                    </div>
                    {seleccionada.condiciones_especiales && (
                      <div style={{ padding:'12px', background:'#FFF8F0', borderRadius:'8px', border:'1px solid #FED7AA' }}>
                        <p style={{ color:'#92400E', fontSize:'11px', fontWeight:700, margin:'0 0 4px' }}>CONDICIONES ESPECIALES</p>
                        <p style={{ color:'#92400E', fontSize:'12px', margin:0 }}>{seleccionada.condiciones_especiales}</p>
                      </div>
                    )}
                    {notasRonda.length > 0 && (
                      <div style={{ marginTop:'12px', padding:'12px', background:'white', borderRadius:'8px', border:'1px solid #E8E8E8' }}>
                        <p style={{ color:'#0F2447', fontSize:'11px', fontWeight:700, margin:'0 0 8px' }}>NOTAS DE NEGOCIACION ({notasRonda.length} rondas)</p>
                        {notasRonda.map((t,i) => (
                          <p key={i} style={{ color:'#555', fontSize:'12px', margin:'0 0 4px', paddingLeft:'10px', borderLeft:'2px solid #E8321A' }}>Ronda {notasRonda.length-i}: {t.nota}</p>
                        ))}
                      </div>
                    )}
                  </div>
                  <div style={{ display:'flex', gap:'8px' }}>
                    <button style={{ background:'#0F2447', color:'white', border:'none', padding:'10px 20px', borderRadius:'8px', fontSize:'13px', fontWeight:700, cursor:'pointer' }}>Pasar al Editor</button>
                    <button style={{ background:'#E8321A', color:'white', border:'none', padding:'10px 20px', borderRadius:'8px', fontSize:'13px', fontWeight:700, cursor:'pointer' }}>Marcar como listo para firma</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div style={{ background:'white', borderRadius:'16px', padding:'48px', boxShadow:'0 1px 4px rgba(0,0,0,0.06)', textAlign:'center', border:'1px solid #F0F0F0' }}>
            <p style={{ fontSize:'40px', margin:'0 0 16px' }}>🤝</p>
            <p style={{ color:'#0F2447', fontWeight:700, fontSize:'16px', margin:'0 0 8px' }}>Selecciona una solicitud</p>
            <p style={{ color:'#888', fontSize:'13px', margin:0 }}>Elige una solicitud de la lista para gestionar la negociacion</p>
          </div>
        )}
      </div>
    </div>
  )
}
