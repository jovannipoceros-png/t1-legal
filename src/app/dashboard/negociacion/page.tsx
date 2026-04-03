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
        const enNegociacion = (data||[]).filter(s => s.estado === 'En negociacion' || s.estado === 'En revision')
        setSolicitudes(enNegociacion)
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

  const tabs = [
    { id:'clausulas', label:'Clausulas' },
    { id:'resultado', label:'Documento resultado' },
    { id:'historial', label:'Historial de rondas' },
  ]

  return (
    <div style={{ padding:'32px', fontFamily:'sans-serif' }}>
      <h1 style={{ color:'#0F2447', fontSize:'24px', fontWeight:700, margin:'0 0 4px' }}>Negociacion</h1>
      <p style={{ color:'#888', margin:'0 0 24px' }}>Solicitudes en revision o negociacion activa</p>

      <div style={{ display:'grid', gridTemplateColumns:'300px 1fr', gap:'24px' }}>
        <div style={{ background:'white', borderRadius:'16px', padding:'20px', boxShadow:'0 1px 4px rgba(0,0,0,0.06)', border:'1px solid #F0F0F0', height:'fit-content' }}>
          <h3 style={{ color:'#0F2447', fontSize:'14px', fontWeight:700, margin:'0 0 14px' }}>Solicitudes activas</h3>
          {cargando ? (
            <p style={{ color:'#888', fontSize:'13px' }}>Cargando...</p>
          ) : solicitudes.length === 0 ? (
            <p style={{ color:'#888', fontSize:'13px' }}>No hay solicitudes en negociacion</p>
          ) : solicitudes.map((s,i) => (
            <div key={i} onClick={() => abrirSolicitud(s)}
              style={{ padding:'12px', borderRadius:'10px', border:`1.5px solid ${seleccionada?.id===s.id?'#E8321A':'#F0F0F0'}`, marginBottom:'8px', cursor:'pointer', background:seleccionada?.id===s.id?'#FFF5F5':'#FAFAFA' }}>
              <div style={{ display:'flex', gap:'6px', marginBottom:'6px' }}>
                <span style={{ background:'#0F2447', color:'white', fontSize:'10px', fontWeight:700, padding:'2px 6px', borderRadius:'10px' }}>{s.id}</span>
                <span style={{ background:s.prioridad==='Alta'?'#FEE2E2':'#FEF3C7', color:s.prioridad==='Alta'?'#C42A15':'#92400E', fontSize:'10px', fontWeight:700, padding:'2px 6px', borderRadius:'10px' }}>{s.prioridad}</span>
              </div>
              <p style={{ color:'#0F2447', fontWeight:700, fontSize:'13px', margin:'0 0 2px' }}>{s.nombre_empresa||s.nombre||'Sin nombre'}</p>
              <p style={{ color:'#888', fontSize:'11px', margin:0 }}>{s.tipo_solicitud} · {s.estado}</p>
            </div>
          ))}
        </div>

        {seleccionada ? (
          <div style={{ background:'white', borderRadius:'16px', padding:'24px', boxShadow:'0 1px 4px rgba(0,0,0,0.06)', border:'1px solid #F0F0F0' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px' }}>
              <div>
                <h2 style={{ color:'#0F2447', fontSize:'18px', fontWeight:700, margin:'0 0 4px' }}>{seleccionada.id} — {seleccionada.nombre_empresa||seleccionada.nombre||'Sin nombre'}</h2>
                <p style={{ color:'#888', fontSize:'13px', margin:0 }}>{seleccionada.tipo_solicitud} · {seleccionada.empresa_t1}</p>
              </div>
              <span style={{ background:'#EFF6FF', color:'#1D4ED8', fontSize:'12px', fontWeight:700, padding:'4px 12px', borderRadius:'20px' }}>{seleccionada.estado}</span>
            </div>

            <div style={{ display:'flex', gap:0, marginBottom:'24px', borderBottom:'2px solid #F0F0F0' }}>
              {tabs.map(t => (
                <button key={t.id} onClick={() => setTab(t.id)}
                  style={{ padding:'10px 18px', border:'none', background:'transparent', color:tab===t.id?'#E8321A':'#888', fontWeight:tab===t.id?700:400, fontSize:'13px', cursor:'pointer', borderBottom:tab===t.id?'2px solid #E8321A':'2px solid transparent', marginBottom:'-2px' }}>
                  {t.label}
                </button>
              ))}
            </div>

            {tab==='clausulas' && (
              <div>
                <div style={{ background:'#F8F8F8', borderRadius:'12px', padding:'20px', marginBottom:'20px', border:'1px solid #F0F0F0' }}>
                  <h3 style={{ color:'#0F2447', fontSize:'14px', fontWeight:700, margin:'0 0 12px' }}>Descripcion de la solicitud</h3>
                  <p style={{ color:'#555', fontSize:'13px', lineHeight:'1.7', margin:'0 0 10px' }}>{seleccionada.descripcion||'Sin descripcion'}</p>
                  {seleccionada.condiciones_especiales && (
                    <div style={{ background:'#FFF8F0', borderRadius:'8px', padding:'12px', border:'1px solid #FED7AA' }}>
                      <p style={{ color:'#92400E', fontSize:'12px', fontWeight:700, margin:'0 0 4px' }}>Condiciones especiales:</p>
                      <p style={{ color:'#92400E', fontSize:'12px', margin:0 }}>{seleccionada.condiciones_especiales}</p>
                    </div>
                  )}
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', marginBottom:'20px' }}>
                  {[
                    { label:'Vigencia', value:seleccionada.vigencia },
                    { label:'Contraprestacion', value:seleccionada.contraprestacion },
                    { label:'Plazo de pago', value:seleccionada.plazo_pago ? `${seleccionada.plazo_pago} dias ${seleccionada.tipo_dias_pago}` : null },
                    { label:'Tipo de firma', value:seleccionada.tipo_firma },
                    { label:'Nacionalidad', value:seleccionada.nacionalidad },
                    { label:'Idioma', value:seleccionada.idioma },
                  ].filter(d => d.value).map((d,i) => (
                    <div key={i} style={{ padding:'12px', background:'#F8F8F8', borderRadius:'8px', border:'1px solid #F0F0F0' }}>
                      <p style={{ color:'#888', fontSize:'11px', fontWeight:700, margin:'0 0 4px' }}>{d.label.toUpperCase()}</p>
                      <p style={{ color:'#0F2447', fontSize:'13px', fontWeight:600, margin:0 }}>{d.value}</p>
                    </div>
                  ))}
                </div>
                <div style={{ display:'flex', gap:'8px' }}>
                  <button style={{ background:'#E8321A', color:'white', border:'none', padding:'10px 20px', borderRadius:'8px', fontSize:'13px', fontWeight:700, cursor:'pointer' }}>Abrir en Editor</button>
                  <button style={{ background:'#0F2447', color:'white', border:'none', padding:'10px 20px', borderRadius:'8px', fontSize:'13px', fontWeight:700, cursor:'pointer' }}>Analizar con IA</button>
                </div>
              </div>
            )}

            {tab==='resultado' && (
              <div>
                <div style={{ background:'#F8F8F8', borderRadius:'12px', padding:'24px', minHeight:'300px', border:'1px solid #F0F0F0', marginBottom:'16px' }}>
                  <p style={{ color:'#0F2447', fontWeight:700, textAlign:'center', marginBottom:'20px' }}>DOCUMENTO RESULTADO — {seleccionada.id}</p>
                  <p style={{ color:'#555', fontSize:'13px', lineHeight:'1.8' }}>
                    <strong>Solicitante:</strong> {seleccionada.nombre||'—'}<br/>
                    <strong>Empresa:</strong> {seleccionada.nombre_empresa||'—'}<br/>
                    <strong>Tipo:</strong> {seleccionada.tipo_solicitud||'—'}<br/>
                    <strong>Vigencia:</strong> {seleccionada.vigencia||'—'}<br/>
                    <strong>Contraprestacion:</strong> {seleccionada.contraprestacion||'—'}<br/>
                    <strong>Firma:</strong> {seleccionada.tipo_firma||'—'}
                  </p>
                </div>
                <div style={{ display:'flex', gap:'8px' }}>
                  <button style={{ background:'#0F2447', color:'white', border:'none', padding:'10px 20px', borderRadius:'8px', fontSize:'13px', fontWeight:700, cursor:'pointer' }}>Pasar al editor</button>
                  <button style={{ background:'#E8321A', color:'white', border:'none', padding:'10px 20px', borderRadius:'8px', fontSize:'13px', fontWeight:700, cursor:'pointer' }}>Exportar</button>
                </div>
              </div>
            )}

            {tab==='historial' && (
              <div>
                <div style={{ marginBottom:'20px' }}>
                  <label style={{ display:'block', color:'#0F2447', fontSize:'13px', fontWeight:600, marginBottom:'8px' }}>Agregar nota o comentario de ronda</label>
                  <textarea value={nota} onChange={e => setNota(e.target.value)} rows={3}
                    placeholder="Ej: Ronda 2 — Contraparte acepto reducir penalizacion al 10%. Pendiente clausula de vigencia."
                    style={{ width:'100%', padding:'12px', borderRadius:'8px', border:'1.5px solid #E8E8E8', fontSize:'13px', boxSizing:'border-box', resize:'vertical', outline:'none', marginBottom:'8px' }} />
                  <button onClick={agregarNota} disabled={enviando||!nota.trim()}
                    style={{ background:nota.trim()?'#E8321A':'#E8E8E8', color:nota.trim()?'white':'#aaa', border:'none', padding:'10px 20px', borderRadius:'8px', fontSize:'13px', fontWeight:700, cursor:nota.trim()?'pointer':'default' }}>
                    {enviando?'Guardando...':'Guardar nota'}
                  </button>
                </div>

                <h3 style={{ color:'#0F2447', fontSize:'14px', fontWeight:700, margin:'0 0 16px' }}>Historial de rondas</h3>
                <div style={{ position:'relative', paddingLeft:'20px' }}>
                  <div style={{ position:'absolute', left:'8px', top:0, bottom:0, width:'2px', background:'#F0F0F0' }} />
                  <div style={{ position:'relative', marginBottom:'14px' }}>
                    <div style={{ position:'absolute', left:'-16px', top:'4px', width:'10px', height:'10px', borderRadius:'50%', background:'#0F2447' }} />
                    <p style={{ color:'#0F2447', fontSize:'12px', fontWeight:600, margin:'0 0 2px' }}>Solicitud recibida</p>
                    <p style={{ color:'#aaa', fontSize:'11px', margin:0 }}>{new Date(seleccionada.created_at).toLocaleString('es-MX')}</p>
                  </div>
                  {tracking.map((t,i) => (
                    <div key={i} style={{ position:'relative', marginBottom:'14px' }}>
                      <div style={{ position:'absolute', left:'-16px', top:'4px', width:'10px', height:'10px', borderRadius:'50%', background:'#E8321A' }} />
                      <p style={{ color:'#0F2447', fontSize:'12px', fontWeight:600, margin:'0 0 2px' }}>{t.nota}</p>
                      <p style={{ color:'#aaa', fontSize:'11px', margin:0 }}>{new Date(t.created_at).toLocaleString('es-MX')} — {t.autor}</p>
                    </div>
                  ))}
                  {tracking.length===0 && <p style={{ color:'#888', fontSize:'12px', margin:'8px 0' }}>Sin notas de rondas aun</p>}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div style={{ background:'white', borderRadius:'16px', padding:'48px', boxShadow:'0 1px 4px rgba(0,0,0,0.06)', textAlign:'center', border:'1px solid #F0F0F0' }}>
            <p style={{ fontSize:'32px', margin:'0 0 12px' }}>🤝</p>
            <p style={{ color:'#0F2447', fontWeight:700, fontSize:'16px', margin:'0 0 8px' }}>Selecciona una solicitud</p>
            <p style={{ color:'#888', fontSize:'13px', margin:0 }}>Elige una solicitud de la lista para ver el detalle de la negociacion</p>
          </div>
        )}
      </div>
    </div>
  )
}
