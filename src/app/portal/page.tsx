'use client'
import { useState } from 'react'
import { obtenerSolicitudesPorCorreo, obtenerTracking } from '@/lib/supabase/solicitudes'

const pasosTracking = ['Pendiente','En revision','En negociacion','Lista para firma','Cerrado']

export default function Portal() {
  const [solicitudes, setSolicitudes] = useState<any[]>([])
  const [trackings, setTrackings] = useState<Record<string,any[]>>({})
  const [correo, setCorreo] = useState('')
  const [buscando, setBuscando] = useState(false)
  const [buscado, setBuscado] = useState(false)
  const [expandido, setExpandido] = useState<string|null>(null)

  const buscar = async () => {
    if (!correo) return
    setBuscando(true)
    try {
      const data = await obtenerSolicitudesPorCorreo(correo)
      setSolicitudes(data || [])
      setBuscado(true)
      const trackingData: Record<string,any[]> = {}
      for (const s of (data || [])) {
        const t = await obtenerTracking(s.id)
        trackingData[s.id] = t || []
      }
      setTrackings(trackingData)
    } catch(e) {
      setSolicitudes([])
      setBuscado(true)
    } finally {
      setBuscando(false)
    }
  }

  const pasoActual = (estado: string) => pasosTracking.indexOf(estado)

  return (
    <div style={{ minHeight:'100vh', background:'#F8F8F8', fontFamily:'sans-serif' }}>
      <div style={{ background:'white', borderBottom:'1px solid #F0F0F0', padding:'0 32px', height:'56px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
          <span style={{ background:'#E8321A', color:'white', fontWeight:900, fontSize:'16px', padding:'2px 10px', borderRadius:'5px' }}>T1</span>
          <span style={{ color:'#0F2447', fontWeight:700, fontSize:'15px' }}>Legal — Mi Portal</span>
        </div>
        <div style={{ display:'flex', gap:'12px', alignItems:'center' }}>
          <a href="/solicitar" style={{ background:'#E8321A', color:'white', padding:'7px 16px', borderRadius:'7px', textDecoration:'none', fontWeight:700, fontSize:'13px' }}>+ Nueva solicitud</a>
          <a href="/login" style={{ color:'#888', fontSize:'13px', textDecoration:'none', padding:'6px 14px', border:'1px solid #E8E8E8', borderRadius:'6px' }}>Salir</a>
        </div>
      </div>

      <div style={{ maxWidth:'900px', margin:'0 auto', padding:'40px 32px' }}>
        <h1 style={{ color:'#0F2447', fontSize:'26px', fontWeight:700, margin:'0 0 4px' }}>Mis Solicitudes</h1>
        <p style={{ color:'#888', margin:'0 0 32px' }}>Seguimiento en tiempo real de tus contratos</p>

        <div style={{ background:'white', borderRadius:'12px', padding:'24px', boxShadow:'0 1px 4px rgba(0,0,0,0.06)', marginBottom:'24px', border:'1px solid #F0F0F0' }}>
          <p style={{ color:'#0F2447', fontSize:'14px', fontWeight:600, margin:'0 0 12px' }}>Ingresa tu correo para ver tus solicitudes</p>
          <div style={{ display:'flex', gap:'10px' }}>
            <input value={correo} onChange={e => setCorreo(e.target.value)} onKeyDown={e => e.key==='Enter' && buscar()}
              placeholder="correo@empresa.com" type="email"
              style={{ flex:1, padding:'11px 16px', borderRadius:'9px', border:'1.5px solid #E8E8E8', fontSize:'14px', outline:'none', color:'#0F2447' }} />
            <button onClick={buscar} disabled={buscando}
              style={{ background:'#E8321A', color:'white', border:'none', padding:'11px 24px', borderRadius:'9px', fontSize:'14px', fontWeight:700, cursor:'pointer' }}>
              {buscando ? 'Buscando...' : 'Buscar'}
            </button>
          </div>
        </div>

        {buscado && (
          <div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'16px', marginBottom:'24px' }}>
              {[
                { label:'Total', value:solicitudes.length, color:'#0F2447' },
                { label:'En proceso', value:solicitudes.filter(s => s.estado!=='Pendiente'&&s.estado!=='Cerrado').length, color:'#1D4ED8' },
                { label:'Cerradas', value:solicitudes.filter(s => s.estado==='Cerrado').length, color:'#0D5C36' },
              ].map((k,i) => (
                <div key={i} style={{ background:'white', borderRadius:'12px', padding:'20px', boxShadow:'0 1px 4px rgba(0,0,0,0.06)', border:'1px solid #F0F0F0' }}>
                  <p style={{ color:'#888', fontSize:'13px', margin:'0 0 8px' }}>{k.label}</p>
                  <p style={{ color:k.color, fontSize:'32px', fontWeight:700, margin:0 }}>{k.value}</p>
                </div>
              ))}
            </div>

            {solicitudes.length === 0 ? (
              <div style={{ background:'white', borderRadius:'12px', padding:'48px', textAlign:'center', border:'1px solid #F0F0F0' }}>
                <p style={{ color:'#888', fontSize:'14px', margin:'0 0 12px' }}>No hay solicitudes para este correo</p>
                <a href="/solicitar" style={{ color:'#E8321A', fontWeight:700, textDecoration:'none' }}>Hacer una solicitud →</a>
              </div>
            ) : solicitudes.map((s,i) => (
              <div key={i} style={{ background:'white', borderRadius:'12px', padding:'24px', boxShadow:'0 1px 4px rgba(0,0,0,0.06)', marginBottom:'16px', border:'1px solid #F0F0F0', borderLeft:`4px solid ${s.flujo==='A'?'#E8321A':'#0F2447'}` }}>
                <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'12px', flexWrap:'wrap' }}>
                  <span style={{ background:'#0F2447', color:'white', fontSize:'12px', fontWeight:700, padding:'3px 10px', borderRadius:'20px' }}>{s.id}</span>
                  <span style={{ background:s.flujo==='A'?'#FEF3C7':'#EFF6FF', color:s.flujo==='A'?'#92400E':'#1D4ED8', fontSize:'11px', fontWeight:700, padding:'2px 8px', borderRadius:'10px' }}>
                    {s.flujo==='A' ? 'Documento del socio' : 'Documento T1'}
                  </span>
                  {s.confidencial && <span style={{ background:'#FFF5F5', color:'#C42A15', fontSize:'11px', fontWeight:700, padding:'2px 8px', borderRadius:'10px', border:'1px solid #FFD0CC' }}>Confidencial</span>}
                  <span style={{ background:'#FEF3C7', color:'#92400E', fontSize:'11px', fontWeight:700, padding:'2px 8px', borderRadius:'10px' }}>{s.estado}</span>
                </div>

                <h3 style={{ color:'#0F2447', fontSize:'16px', fontWeight:700, margin:'0 0 4px' }}>{s.tipo_solicitud||'Sin tipo'}</h3>
                <p style={{ color:'#888', fontSize:'13px', margin:'0 0 16px' }}>{s.empresa_t1} — Enviada el {new Date(s.created_at).toLocaleDateString('es-MX')}</p>

                <div style={{ position:'relative', padding:'8px 0 24px', marginBottom:'16px' }}>
                  <div style={{ position:'absolute', top:'20px', left:'5%', right:'5%', height:'3px', background:'#F0F0F0' }} />
                  <div style={{ position:'absolute', top:'20px', left:'5%', width:`${Math.max(0, pasoActual(s.estado)/(pasosTracking.length-1))*90}%`, height:'3px', background:'#E8321A' }} />
                  <div style={{ display:'flex', justifyContent:'space-between', position:'relative' }}>
                    {pasosTracking.map((p,j) => (
                      <div key={j} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'8px', width:'20%' }}>
                        <div style={{ width:'28px', height:'28px', borderRadius:'50%', background:j<=pasoActual(s.estado)?'#E8321A':'white', border:`2px solid ${j<=pasoActual(s.estado)?'#E8321A':'#E0E2E6'}`, display:'flex', alignItems:'center', justifyContent:'center', zIndex:1 }}>
                          {j<pasoActual(s.estado) && <span style={{ color:'white', fontSize:'12px', fontWeight:700 }}>✓</span>}
                          {j===pasoActual(s.estado) && <span style={{ width:'8px', height:'8px', background:'white', borderRadius:'50%', display:'block' }} />}
                        </div>
                        <span style={{ fontSize:'10px', color:j<=pasoActual(s.estado)?'#0F2447':'#888', fontWeight:j===pasoActual(s.estado)?700:400, textAlign:'center' }}>{p}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button onClick={() => setExpandido(expandido===s.id?null:s.id)}
                  style={{ background:'#F8F8F8', color:'#0F2447', border:'1px solid #F0F0F0', padding:'8px 16px', borderRadius:'7px', fontSize:'12px', fontWeight:600, cursor:'pointer', width:'100%' }}>
                  {expandido===s.id ? 'Ocultar historial ▲' : 'Ver historial completo ▼'}
                </button>

                {expandido===s.id && (
                  <div style={{ marginTop:'16px', paddingLeft:'16px', borderLeft:'2px solid #F0F0F0' }}>
                    <div style={{ padding:'10px 0', borderBottom:'1px solid #F8F8F8' }}>
                      <p style={{ color:'#0F2447', fontSize:'12px', fontWeight:600, margin:'0 0 2px' }}>Solicitud recibida</p>
                      <p style={{ color:'#aaa', fontSize:'11px', margin:0 }}>{new Date(s.created_at).toLocaleString('es-MX')} — Sistema</p>
                    </div>
                    {(trackings[s.id]||[]).map((t,j) => (
                      <div key={j} style={{ padding:'10px 0', borderBottom:'1px solid #F8F8F8' }}>
                        <p style={{ color:'#0F2447', fontSize:'12px', fontWeight:600, margin:'0 0 2px' }}>{t.nota}</p>
                        <p style={{ color:'#aaa', fontSize:'11px', margin:0 }}>{new Date(t.created_at).toLocaleString('es-MX')} — {t.autor}</p>
                      </div>
                    ))}
                    {(trackings[s.id]||[]).length === 0 && (
                      <p style={{ color:'#888', fontSize:'12px', margin:'10px 0' }}>Sin actualizaciones adicionales aun</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
