'use client'
import { useState, useEffect } from 'react'
import { obtenerSolicitudes } from '@/lib/supabase/solicitudes'

export default function Dashboard() {
  const [solicitudes, setSolicitudes] = useState<any[]>([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    obtenerSolicitudes()
      .then(data => { setSolicitudes(data || []); setCargando(false) })
      .catch(() => setCargando(false))
  }, [])

  const pendientes = solicitudes.filter(s => s.estado === 'Pendiente')
  const urgentes = solicitudes.filter(s => s.prioridad === 'Alta')
  const cerradas = solicitudes.filter(s => s.estado === 'Cerrado')
  const recientes = solicitudes.slice(0, 5)

  const kpis = [
    { label:'Total Solicitudes', value:solicitudes.length, color:'#0F2447' },
    { label:'Pendientes', value:pendientes.length, color:'#F59E0B' },
    { label:'Urgentes', value:urgentes.length, color:'#E8321A' },
    { label:'Cerradas', value:cerradas.length, color:'#0D5C36' },
  ]

  return (
    <div style={{ padding:'32px', fontFamily:'sans-serif' }}>
      <h1 style={{ color:'#0F2447', fontSize:'24px', fontWeight:700, margin:'0 0 4px' }}>Dashboard</h1>
      <p style={{ color:'#888', margin:'0 0 32px' }}>Bienvenido, Jovanni</p>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'16px', marginBottom:'32px' }}>
        {kpis.map((k,i) => (
          <div key={i} style={{ background:'white', borderRadius:'12px', padding:'20px', boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>
            <p style={{ color:'#888', fontSize:'13px', margin:'0 0 8px' }}>{k.label}</p>
            <p style={{ color:k.color, fontSize:'32px', fontWeight:700, margin:0 }}>
              {cargando ? '...' : k.value}
            </p>
          </div>
        ))}
      </div>

      <div style={{ background:'white', borderRadius:'12px', padding:'24px', boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>
        <h2 style={{ color:'#0F2447', fontSize:'16px', fontWeight:700, margin:'0 0 16px' }}>Solicitudes recientes</h2>
        {cargando ? (
          <p style={{ color:'#888', textAlign:'center', padding:'24px 0' }}>Cargando...</p>
        ) : recientes.length === 0 ? (
          <p style={{ color:'#888', textAlign:'center', padding:'24px 0' }}>No hay solicitudes aun</p>
        ) : (
          recientes.map((s,i) => (
            <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 0', borderBottom:'1px solid #F0F0F0' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                <span style={{ background:'#0F2447', color:'white', fontSize:'11px', fontWeight:700, padding:'2px 8px', borderRadius:'10px' }}>{s.id}</span>
                <div>
                  <p style={{ color:'#0F2447', fontWeight:600, fontSize:'13px', margin:'0 0 2px' }}>{s.nombre} — {s.area}</p>
                  <p style={{ color:'#888', fontSize:'11px', margin:0 }}>{s.tipo_solicitud} · {s.empresa_t1}</p>
                </div>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                <span style={{ background:s.flujo==='A'?'#FEF3C7':'#EFF6FF', color:s.flujo==='A'?'#92400E':'#1D4ED8', fontSize:'11px', fontWeight:700, padding:'2px 8px', borderRadius:'10px' }}>
                  {s.flujo==='A'?'Flujo A':'Flujo B'}
                </span>
                <span style={{ background:s.prioridad==='Alta'?'#FEE2E2':s.prioridad==='Media'?'#FEF3C7':'#F0FDF4', color:s.prioridad==='Alta'?'#C42A15':s.prioridad==='Media'?'#92400E':'#166534', fontSize:'11px', fontWeight:700, padding:'2px 8px', borderRadius:'10px' }}>
                  {s.prioridad}
                </span>
                <span style={{ color:'#888', fontSize:'11px' }}>{new Date(s.created_at).toLocaleDateString('es-MX')}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
