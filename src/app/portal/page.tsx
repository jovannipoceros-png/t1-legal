'use client'
import { useState } from 'react'
import { obtenerSolicitudesPorCorreo } from '@/lib/supabase/solicitudes'

const pasos = ['Recibida','En revision','En negociacion','Lista para firma','Cerrada']

export default function Portal() {
  const [solicitudes, setSolicitudes] = useState<any[]>([])
  const [correo, setCorreo] = useState('')
  const [buscando, setBuscando] = useState(false)
  const [buscado, setBuscado] = useState(false)

  const buscar = async () => {
    if (!correo) return
    setBuscando(true)
    try {
      const data = await obtenerSolicitudesPorCorreo(correo)
      setSolicitudes(data || [])
      setBuscado(true)
    } catch(e) {
      setSolicitudes([])
      setBuscado(true)
    } finally {
      setBuscando(false)
    }
  }

  return (
    <div style={{ minHeight:'100vh', background:'#F5F6F7', fontFamily:'sans-serif' }}>
      <div style={{ background:'#0F2447', padding:'0 32px' }}>
        <div style={{ maxWidth:'1100px', margin:'0 auto', display:'flex', alignItems:'center', justifyContent:'space-between', height:'64px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
            <span style={{ background:'#E8321A', color:'white', fontWeight:900, fontSize:'16px', padding:'3px 10px', borderRadius:'4px' }}>T1</span>
            <span style={{ color:'white', fontWeight:700 }}>Legal - Mi Portal</span>
          </div>
          <a href="/login" style={{ color:'#B0C4DE', fontSize:'13px', textDecoration:'none', border:'1px solid rgba(255,255,255,0.2)', padding:'4px 12px', borderRadius:'6px' }}>Salir</a>
        </div>
      </div>
      <div style={{ maxWidth:'1100px', margin:'0 auto', padding:'40px 32px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'32px' }}>
          <div>
            <h1 style={{ color:'#0F2447', fontSize:'26px', fontWeight:700, margin:'0 0 4px' }}>Mis Solicitudes</h1>
            <p style={{ color:'#888', margin:0 }}>Seguimiento en tiempo real de tus contratos</p>
          </div>
          <a href="/solicitar" style={{ background:'#E8321A', color:'white', padding:'12px 24px', borderRadius:'10px', textDecoration:'none', fontWeight:700, fontSize:'14px' }}>+ Nueva solicitud</a>
        </div>
        <div style={{ background:'white', borderRadius:'16px', padding:'24px', boxShadow:'0 1px 4px rgba(0,0,0,0.06)', marginBottom:'24px' }}>
          <p style={{ color:'#0F2447', fontSize:'14px', fontWeight:600, margin:'0 0 12px' }}>Ingresa tu correo para ver tus solicitudes</p>
          <div style={{ display:'flex', gap:'10px' }}>
            <input value={correo} onChange={e => setCorreo(e.target.value)} onKeyDown={e => e.key==='Enter' && buscar()} placeholder="tu@empresa.com" type="email" style={{ flex:1, padding:'11px 16px', borderRadius:'9px', border:'1.5px solid #E8E8E8', fontSize:'14px', outline:'none' }} />
            <button onClick={buscar} disabled={buscando} style={{ background:'#E8321A', color:'white', border:'none', padding:'11px 24px', borderRadius:'9px', fontSize:'14px', fontWeight:700, cursor:'pointer' }}>
              {buscando ? 'Buscando...' : 'Ver mis solicitudes'}
            </button>
          </div>
        </div>
        {buscado && (
          <div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'16px', marginBottom:'24px' }}>
              {[
                { label:'Total', value:solicitudes.length, color:'#0F2447' },
                { label:'En proceso', value:solicitudes.filter(s => s.estado==='En proceso').length, color:'#1D4ED8' },
                { label:'Pendientes', value:solicitudes.filter(s => s.estado==='Pendiente').length, color:'#F59E0B' },
              ].map((k,i) => (
                <div key={i} style={{ background:'white', borderRadius:'12px', padding:'20px', boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>
                  <p style={{ color:'#888', fontSize:'13px', margin:'0 0 8px' }}>{k.label}</p>
                  <p style={{ color:k.color, fontSize:'32px', fontWeight:700, margin:0 }}>{k.value}</p>
                </div>
              ))}
            </div>
            {solicitudes.length === 0 ? (
              <div style={{ background:'white', borderRadius:'16px', padding:'48px', textAlign:'center', boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>
                <p style={{ fontSize:'32px', margin:'0 0 12px' }}>No hay solicitudes para este correo</p>
                <a href="/solicitar" style={{ color:'#E8321A', fontWeight:700, textDecoration:'none' }}>Hacer una solicitud</a>
              </div>
            ) : solicitudes.map((s,i) => (
              <div key={i} style={{ background:'white', borderRadius:'16px', padding:'28px', boxShadow:'0 1px 4px rgba(0,0,0,0.06)', marginBottom:'16px', borderLeft:`4px solid ${s.flujo==='A'?'#F59E0B':'#1D4ED8'}` }}>
                <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'12px', flexWrap:'wrap' }}>
                  <span style={{ background:'#0F2447', color:'white', fontSize:'12px', fontWeight:700, padding:'3px 10px', borderRadius:'20px' }}>{s.id}</span>
                  <span style={{ background:s.flujo==='A'?'#FEF3C7':'#EFF6FF', color:s.flujo==='A'?'#92400E':'#1D4ED8', fontSize:'11px', fontWeight:700, padding:'2px 8px', borderRadius:'10px' }}>
                    {s.flujo==='A' ? 'Documento del socio' : 'Documento T1'}
                  </span>
                  {s.confidencial && <span style={{ background:'#FFF5F5', color:'#C42A15', fontSize:'11px', fontWeight:700, padding:'2px 8px', borderRadius:'10px', border:'1px solid #FFD0CC' }}>Confidencial</span>}
                  <span style={{ background:'#FEF3C7', color:'#92400E', fontSize:'11px', fontWeight:700, padding:'2px 8px', borderRadius:'10px' }}>{s.estado}</span>
                  <span style={{ background:s.prioridad==='Alta'?'#FEE2E2':s.prioridad==='Media'?'#FEF3C7':'#F0FDF4', color:s.prioridad==='Alta'?'#C42A15':s.prioridad==='Media'?'#92400E':'#166534', fontSize:'11px', fontWeight:700, padding:'2px 8px', borderRadius:'10px' }}>{s.prioridad}</span>
                </div>
                <h3 style={{ color:'#0F2447', fontSize:'16px', fontWeight:700, margin:'0 0 4px' }}>{s.tipo_solicitud}</h3>
                <p style={{ color:'#888', fontSize:'13px', margin:'0 0 16px' }}>{s.empresa_t1} - Enviada el {new Date(s.created_at).toLocaleDateString('es-MX')}</p>
                <p style={{ color:'#0F2447', fontSize:'13px', fontWeight:600, marginBottom:'16px' }}>Seguimiento:</p>
                <div style={{ position:'relative', padding:'8px 0 32px' }}>
                  <div style={{ position:'absolute', top:'20px', left:'5%', right:'5%', height:'3px', background:'#E0E2E6' }} />
                  <div style={{ position:'absolute', top:'20px', left:'5%', width:'0%', height:'3px', background:'#E8321A' }} />
                  <div style={{ display:'flex', justifyContent:'space-between', position:'relative' }}>
                    {pasos.map((p,j) => (
                      <div key={j} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'8px', width:'20%' }}>
                        <div style={{ width:'32px', height:'32px', borderRadius:'50%', background:j===0?'#E8321A':'white', border:`3px solid ${j===0?'#E8321A':'#E0E2E6'}`, display:'flex', alignItems:'center', justifyContent:'center', zIndex:1 }}>
                          {j===0 && <span style={{ width:'10px', height:'10px', background:'white', borderRadius:'50%', display:'block' }} />}
                        </div>
                        <span style={{ fontSize:'11px', color:j===0?'#0F2447':'#888', fontWeight:j===0?700:400, textAlign:'center' }}>{p}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
