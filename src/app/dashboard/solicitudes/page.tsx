'use client'
import { useState, useEffect } from 'react'
import { obtenerSolicitudes, actualizarEstado } from '@/lib/supabase/solicitudes'

export default function Solicitudes() {
  const [solicitudes, setSolicitudes] = useState<any[]>([])
  const [filtro, setFiltro] = useState('todas')
  const [busqueda, setBusqueda] = useState('')
  const [cargando, setCargando] = useState(true)
  const [actualizando, setActualizando] = useState<string|null>(null)

  const cargar = async () => {
    const data = await obtenerSolicitudes()
    setSolicitudes(data || [])
    setCargando(false)
  }

  useEffect(() => { cargar() }, [])

  const cambiarEstado = async (id: string, estado: string) => {
    setActualizando(id)
    try {
      await actualizarEstado(id, estado)
      const s = solicitudes.find(x => x.id === id)
      if (s?.correo) {
        fetch('https://t1-legal.vercel.app/api/notificaciones', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tipo: 'estado_actualizado',
            correo: s.correo,
            nombre: s.nombre || 'Solicitante',
            id,
            estado
          })
        }).catch(() => {})
      }
      await cargar()
    } catch(e) {
      alert('Error al actualizar')
    } finally {
      setActualizando(null)
    }
  }

  const filtradas = solicitudes.filter(s => {
    const matchFiltro = filtro==='todas' || (filtro==='flujoA' && s.flujo==='A') || (filtro==='flujoB' && s.flujo==='B') || (filtro==='urgente' && s.prioridad==='Alta') || (filtro==='confidencial' && s.confidencial)
    const matchBusqueda = (s.nombre||'').toLowerCase().includes(busqueda.toLowerCase()) || (s.id||'').toLowerCase().includes(busqueda.toLowerCase()) || (s.area||'').toLowerCase().includes(busqueda.toLowerCase())
    return matchFiltro && matchBusqueda
  })

  const estados = ['Pendiente','En revision','En negociacion','Lista para firma']
  const estadoColor: Record<string,{bg:string,color:string}> = {
    'Pendiente': { bg:'#FEF3C7', color:'#92400E' },
    'En revision': { bg:'#EFF6FF', color:'#1D4ED8' },
    'En negociacion': { bg:'#F3E8FF', color:'#7C3AED' },
    'Lista para firma': { bg:'#ECFDF5', color:'#065F46' },
    'Cerrado': { bg:'#F0FDF4', color:'#166534' },
  }

  return (
    <div style={{ padding:'32px', fontFamily:'sans-serif' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'24px' }}>
        <div>
          <h1 style={{ color:'#0F2447', fontSize:'24px', fontWeight:700, margin:'0 0 4px' }}>Solicitudes</h1>
          <p style={{ color:'#888', margin:0 }}>Gestiona y actualiza el estado de cada solicitud</p>
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'16px', marginBottom:'24px' }}>
        {[
          { label:'Total', value:solicitudes.length, color:'#0F2447' },
          { label:'Flujo A', value:solicitudes.filter(s=>s.flujo==='A').length, color:'#F59E0B' },
          { label:'Flujo B', value:solicitudes.filter(s=>s.flujo==='B').length, color:'#1D4ED8' },
          { label:'Urgentes', value:solicitudes.filter(s=>s.prioridad==='Alta').length, color:'#E8321A' },
        ].map((k,i) => (
          <div key={i} style={{ background:'white', borderRadius:'12px', padding:'20px', boxShadow:'0 1px 4px rgba(0,0,0,0.06)', border:'1px solid #F0F0F0' }}>
            <p style={{ color:'#888', fontSize:'12px', margin:'0 0 8px' }}>{k.label}</p>
            <p style={{ color:k.color, fontSize:'32px', fontWeight:700, margin:0 }}>{cargando?'...':k.value}</p>
          </div>
        ))}
      </div>

      <div style={{ background:'white', borderRadius:'16px', padding:'24px', boxShadow:'0 1px 4px rgba(0,0,0,0.06)', border:'1px solid #F0F0F0' }}>
        <div style={{ display:'flex', gap:'10px', marginBottom:'20px', flexWrap:'wrap' }}>
          <input value={busqueda} onChange={e => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre, ID o area..."
            style={{ flex:1, minWidth:'200px', padding:'10px 14px', borderRadius:'8px', border:'1.5px solid #E8E8E8', fontSize:'13px', outline:'none', color:'#0F2447' }} />
          {[
            { id:'todas', label:'Todas' },
            { id:'urgente', label:'Urgentes' },
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
          <div style={{ textAlign:'center', padding:'48px', color:'#888' }}>Cargando...</div>
        ) : filtradas.length === 0 ? (
          <div style={{ textAlign:'center', padding:'48px', color:'#888' }}>No hay solicitudes</div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
            {filtradas.map((s,i) => (
              <div key={i} style={{ borderRadius:'12px', border:'1px solid #F0F0F0', padding:'16px 20px', background:'white', borderLeft:`4px solid ${s.flujo==='A'?'#F59E0B':'#1D4ED8'}` }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'10px' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'8px', flexWrap:'wrap' }}>
                    <span style={{ background:'#0F2447', color:'white', fontSize:'12px', fontWeight:700, padding:'3px 10px', borderRadius:'20px' }}>{s.id}</span>
                    <span style={{ background:s.flujo==='A'?'#FEF3C7':'#EFF6FF', color:s.flujo==='A'?'#92400E':'#1D4ED8', fontSize:'11px', fontWeight:700, padding:'2px 8px', borderRadius:'10px' }}>
                      {s.flujo==='A'?'Socio comercial':'Direccion Juridica T1'}
                    </span>
                    {s.confidencial && <span style={{ background:'#FFF5F5', color:'#C42A15', fontSize:'11px', fontWeight:700, padding:'2px 8px', borderRadius:'10px', border:'1px solid #FFD0CC' }}>Confidencial</span>}
                    {s.prioridad==='Alta' && <span style={{ background:'#FEE2E2', color:'#C42A15', fontSize:'11px', fontWeight:700, padding:'2px 8px', borderRadius:'10px' }}>Urgente</span>}
                  </div>
                  <span style={{ color:'#888', fontSize:'11px' }}>{new Date(s.created_at).toLocaleDateString('es-MX')}</span>
                </div>

                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <div>
                    <p style={{ color:'#0F2447', fontWeight:700, fontSize:'14px', margin:'0 0 2px' }}>{s.nombre||'Sin nombre'} — {s.area||'Sin area'}</p>
                    <p style={{ color:'#888', fontSize:'12px', margin:0 }}>{s.tipo_solicitud||'Sin tipo'} · {s.empresa_t1}</p>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                    <span style={{ background:estadoColor[s.estado]?.bg||'#F8F8F8', color:estadoColor[s.estado]?.color||'#888', fontSize:'11px', fontWeight:700, padding:'3px 10px', borderRadius:'10px' }}>
                      {s.estado}
                    </span>
                    <select value={s.estado} onChange={e => cambiarEstado(s.id, e.target.value)}
                      disabled={actualizando===s.id}
                      style={{ padding:'7px 12px', borderRadius:'7px', border:'1.5px solid #E8E8E8', fontSize:'12px', color:'#0F2447', outline:'none', cursor:'pointer', background:'white' }}>
                      {estados.map((e,j) => <option key={j} value={e}>{e}</option>)}
                    </select>
                    {actualizando===s.id && <span style={{ color:'#888', fontSize:'11px' }}>Guardando...</span>}
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
