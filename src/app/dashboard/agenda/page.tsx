'use client'
import { useState, useEffect } from 'react'
import { obtenerSolicitudes } from '@/lib/supabase/solicitudes'

export default function Agenda() {
  const [solicitudes, setSolicitudes] = useState<any[]>([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    obtenerSolicitudes()
      .then(data => { setSolicitudes(data || []); setCargando(false) })
      .catch(() => setCargando(false))
  }, [])

  const alta = solicitudes.filter(s => s.prioridad === 'Alta')
  const media = solicitudes.filter(s => s.prioridad === 'Media')
  const baja = solicitudes.filter(s => s.prioridad === 'Baja')

  const CardSolicitud = ({ s }: { s: any }) => (
    <div style={{ background:'white', borderRadius:'12px', padding:'20px', boxShadow:'0 1px 4px rgba(0,0,0,0.06)', marginBottom:'12px', borderLeft:`4px solid ${s.prioridad==='Alta'?'#E8321A':s.prioridad==='Media'?'#F59E0B':'#0D5C36'}`, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
      <div>
        <div style={{ display:'flex', gap:'8px', marginBottom:'6px' }}>
          <span style={{ background:'#0F2447', color:'white', fontSize:'11px', fontWeight:700, padding:'2px 8px', borderRadius:'20px' }}>{s.id}</span>
          <span style={{ background:s.prioridad==='Alta'?'#E8321A':s.prioridad==='Media'?'#F59E0B':'#0D5C36', color:'white', fontSize:'11px', fontWeight:700, padding:'2px 8px', borderRadius:'20px' }}>{s.prioridad}</span>
        </div>
        <p style={{ color:'#0F2447', fontWeight:700, margin:'0 0 2px' }}>{s.nombre} — {s.area}</p>
        <p style={{ color:'#888', fontSize:'13px', margin:0 }}>{s.tipo_solicitud} · {s.empresa_t1}</p>
        {s.fecha_limite && <p style={{ color:'#E8321A', fontSize:'12px', fontWeight:600, margin:'4px 0 0' }}>Fecha limite: {s.fecha_limite}</p>}
      </div>
      <div style={{ textAlign:'right' }}>
        <p style={{ color:'#888', fontSize:'12px', margin:'0 0 8px' }}>{new Date(s.created_at).toLocaleDateString('es-MX')}</p>
        <button style={{ background:'#E8321A', color:'white', border:'none', padding:'6px 16px', borderRadius:'6px', fontSize:'12px', fontWeight:700, cursor:'pointer' }}>Ver expediente</button>
      </div>
    </div>
  )

  return (
    <div style={{ padding:'32px', fontFamily:'sans-serif' }}>
      <h1 style={{ color:'#0F2447', fontSize:'24px', fontWeight:700, margin:'0 0 4px' }}>Agenda</h1>
      <p style={{ color:'#888', margin:'0 0 32px' }}>Pendientes por prioridad</p>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'16px', marginBottom:'32px' }}>
        {[
          { label:'Alta prioridad', value:alta.length, color:'#E8321A' },
          { label:'Media prioridad', value:media.length, color:'#F59E0B' },
          { label:'Baja prioridad', value:baja.length, color:'#0D5C36' },
        ].map((k,i) => (
          <div key={i} style={{ background:'white', borderRadius:'12px', padding:'20px', boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>
            <p style={{ color:'#888', fontSize:'13px', margin:'0 0 8px' }}>{k.label}</p>
            <p style={{ color:k.color, fontSize:'32px', fontWeight:700, margin:0 }}>{cargando?'...':k.value}</p>
          </div>
        ))}
      </div>

      {cargando ? (
        <div style={{ textAlign:'center', padding:'48px', color:'#888' }}>Cargando...</div>
      ) : solicitudes.length === 0 ? (
        <div style={{ background:'white', borderRadius:'16px', padding:'48px', textAlign:'center', boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>
          <p style={{ fontSize:'32px', margin:'0 0 12px' }}>📅</p>
          <p style={{ color:'#0F2447', fontWeight:700, margin:0 }}>No hay solicitudes pendientes</p>
        </div>
      ) : (
        <div>
          {alta.length > 0 && (
            <div style={{ marginBottom:'24px' }}>
              <h2 style={{ color:'#E8321A', fontSize:'16px', fontWeight:700, margin:'0 0 12px' }}>Alta prioridad</h2>
              {alta.map((s,i) => <CardSolicitud key={i} s={s} />)}
            </div>
          )}
          {media.length > 0 && (
            <div style={{ marginBottom:'24px' }}>
              <h2 style={{ color:'#F59E0B', fontSize:'16px', fontWeight:700, margin:'0 0 12px' }}>Media prioridad</h2>
              {media.map((s,i) => <CardSolicitud key={i} s={s} />)}
            </div>
          )}
          {baja.length > 0 && (
            <div>
              <h2 style={{ color:'#0D5C36', fontSize:'16px', fontWeight:700, margin:'0 0 12px' }}>Baja prioridad</h2>
              {baja.map((s,i) => <CardSolicitud key={i} s={s} />)}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
