'use client'
import { useState, useEffect } from 'react'
import { obtenerSolicitudes } from '@/lib/supabase/solicitudes'

export default function Solicitudes() {
  const [solicitudes, setSolicitudes] = useState<any[]>([])
  const [filtro, setFiltro] = useState('todas')
  const [busqueda, setBusqueda] = useState('')
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    obtenerSolicitudes()
      .then(data => { setSolicitudes(data || []); setCargando(false) })
      .catch(() => setCargando(false))
  }, [])

  const filtradas = solicitudes.filter(s => {
    const matchFiltro = filtro==='todas' || (filtro==='flujoA' && s.flujo==='A') || (filtro==='flujoB' && s.flujo==='B') || (filtro==='riesgo' && s.prioridad==='Alta') || (filtro==='confidencial' && s.confidencial)
    const matchBusqueda = (s.nombre||'').toLowerCase().includes(busqueda.toLowerCase()) || (s.id||'').toLowerCase().includes(busqueda.toLowerCase()) || (s.area||'').toLowerCase().includes(busqueda.toLowerCase())
    return matchFiltro && matchBusqueda
  })

  const prioridadColor: Record<string,string> = { Alta:'#E8321A', Media:'#F59E0B', Baja:'#0D5C36' }
  const estadoColor: Record<string,{bg:string,color:string}> = {
    'En proceso': { bg:'#EFF6FF', color:'#1D4ED8' },
    'Pendiente': { bg:'#FEF3C7', color:'#92400E' },
    'Cerrado': { bg:'#F0FDF4', color:'#166534' },
  }

  return (
    <div style={{ padding:'32px', fontFamily:'sans-serif' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'24px' }}>
        <div>
          <h1 style={{ color:'#0F2447', fontSize:'24px', fontWeight:700, margin:'0 0 4px' }}>Solicitudes</h1>
          <p style={{ color:'#888', margin:0 }}>Solicitudes reales de Supabase</p>
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'16px', marginBottom:'24px' }}>
        {[
          { label:'Total', value:solicitudes.length, color:'#0F2447' },
          { label:'Flujo A — Socio', value:solicitudes.filter(s=>s.flujo==='A').length, color:'#F59E0B' },
          { label:'Flujo B — T1', value:solicitudes.filter(s=>s.flujo==='B').length, color:'#1D4ED8' },
          { label:'Confidenciales', value:solicitudes.filter(s=>s.confidencial).length, color:'#E8321A' },
        ].map((k,i) => (
          <div key={i} style={{ background:'white', borderRadius:'12px', padding:'20px', boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>
            <p style={{ color:'#888', fontSize:'12px', margin:'0 0 8px' }}>{k.label}</p>
            <p style={{ color:k.color, fontSize:'32px', fontWeight:700, margin:0 }}>{k.value}</p>
          </div>
        ))}
      </div>

      <div style={{ background:'white', borderRadius:'16px', padding:'24px', boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>
        <div style={{ display:'flex', gap:'10px', marginBottom:'20px', flexWrap:'wrap' }}>
          <input value={busqueda} onChange={e => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre, ID o area..."
            style={{ flex:1, minWidth:'200px', padding:'10px 14px', borderRadius:'8px', border:'1.5px solid #E8E8E8', fontSize:'13px', outline:'none' }} />
          {[
            { id:'todas', label:'Todas' },
            { id:'flujoA', label:'Flujo A' },
            { id:'flujoB', label:'Flujo B' },
            { id:'confidencial', label:'Confidencial' },
          ].map((f,i) => (
            <button key={i} onClick={() => setFiltro(f.id)}
              style={{ padding:'10px 16px', borderRadius:'8px', border:`1.5px solid ${filtro===f.id?'#E8321A':'#E8E8E8'}`, background:filtro===f.id?'#FFF5F5':'white', color:filtro===f.id?'#E8321A':'#888', fontWeight:filtro===f.id?700:400, fontSize:'13px', cursor:'pointer' }}>
              {f.label}
            </button>
          ))}
        </div>

        {cargando ? (
          <div style={{ textAlign:'center', padding:'48px', color:'#888' }}>Cargando solicitudes...</div>
        ) : filtradas.length === 0 ? (
          <div style={{ textAlign:'center', padding:'48px', color:'#888' }}>No hay solicitudes</div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
            {filtradas.map((s,i) => (
              <div key={i} style={{ borderRadius:'12px', border:`1.5px solid ${s.prioridad==='Alta'?'#FCA5A5':'#F0F0F0'}`, padding:'16px 20px', background:s.prioridad==='Alta'?'#FFFAFA':'white', position:'relative', overflow:'hidden' }}>
                {s.prioridad==='Alta' && <div style={{ position:'absolute', left:0, top:0, bottom:0, width:'4px', background:'#E8321A' }} />}
                {s.flujo==='B' && s.prioridad!=='Alta' && <div style={{ position:'absolute', left:0, top:0, bottom:0, width:'4px', background:'#1D4ED8' }} />}
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'10px' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'8px', flexWrap:'wrap' }}>
                    <span style={{ background:'#0F2447', color:'white', fontSize:'12px', fontWeight:700, padding:'3px 10px', borderRadius:'20px' }}>{s.id}</span>
                    <span style={{ background:s.flujo==='A'?'#FEF3C7':'#EFF6FF', color:s.flujo==='A'?'#92400E':'#1D4ED8', fontSize:'11px', fontWeight:700, padding:'2px 8px', borderRadius:'10px' }}>
                      {s.flujo==='A'?'Socio comercial':'Direccion Juridica T1'}
                    </span>
                    {s.confidencial && <span style={{ background:'#FFF5F5', color:'#C42A15', fontSize:'11px', fontWeight:700, padding:'2px 8px', borderRadius:'10px', border:'1px solid #FFD0CC' }}>Confidencial</span>}
                    <span style={{ background:estadoColor[s.estado]?.bg||'#F8F8F8', color:estadoColor[s.estado]?.color||'#888', fontSize:'11px', fontWeight:700, padding:'2px 8px', borderRadius:'10px' }}>{s.estado}</span>
                  </div>
                  <div style={{ display:'flex', gap:'6px', alignItems:'center' }}>
                    <span style={{ background:(prioridadColor[s.prioridad]||'#888')+'20', color:prioridadColor[s.prioridad]||'#888', fontSize:'11px', fontWeight:700, padding:'2px 8px', borderRadius:'10px' }}>{s.prioridad}</span>
                    <span style={{ color:'#888', fontSize:'11px' }}>{new Date(s.created_at).toLocaleDateString('es-MX')}</span>
                  </div>
                </div>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end' }}>
                  <div>
                    <p style={{ color:'#0F2447', fontWeight:700, fontSize:'14px', margin:'0 0 2px' }}>{s.nombre} — {s.area}</p>
                    <p style={{ color:'#888', fontSize:'12px', margin:'0 0 4px' }}>{s.tipo_solicitud} · {s.empresa_t1}</p>
                    {s.descripcion && <p style={{ color:'#555', fontSize:'11px', margin:0 }}>{s.descripcion.substring(0,80)}...</p>}
                  </div>
                  <div style={{ display:'flex', gap:'6px' }}>
                    <button style={{ background:'#E8321A', color:'white', border:'none', padding:'7px 16px', borderRadius:'7px', fontSize:'12px', fontWeight:700, cursor:'pointer' }}>Abrir en Editor</button>
                    <button style={{ background:'#0F2447', color:'white', border:'none', padding:'7px 16px', borderRadius:'7px', fontSize:'12px', fontWeight:700, cursor:'pointer' }}>Ver expediente</button>
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
