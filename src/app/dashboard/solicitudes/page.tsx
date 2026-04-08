'use client'
import { useState, useEffect } from 'react'
import { obtenerSolicitudes, actualizarEstado } from '@/lib/supabase/solicitudes'

export default function Solicitudes() {
  const [solicitudes, setSolicitudes] = useState<any[]>([])
  const [filtro, setFiltro] = useState('todas')
  const [busqueda, setBusqueda] = useState('')
  const [cargando, setCargando] = useState(true)
  const [actualizando, setActualizando] = useState<string|null>(null)
  const [seleccionada, setSeleccionada] = useState<any>(null)
  const irA = (id: string) => window.location.href = `/dashboard/solicitudes/${id}`

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
          body: JSON.stringify({ tipo: 'estado_actualizado', correo: s.correo, nombre: s.nombre || 'Solicitante', id, estado })
        }).catch(() => {})
      }
      await cargar()
      if (seleccionada?.id === id) setSeleccionada((prev: any) => ({ ...prev, estado }))
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

  const estadoColor: Record<string,{bg:string,color:string}> = {
    'Pendiente':        { bg:'#FEF3C7', color:'#92400E' },
    'En revision':      { bg:'#EFF6FF', color:'#1D4ED8' },
    'En negociacion':   { bg:'#F3E8FF', color:'#7C3AED' },
    'Lista para firma': { bg:'#ECFDF5', color:'#065F46' },
    'Cerrado':          { bg:'#F0FDF4', color:'#166534' },
  }

  const estadoDescripcion: Record<string,string> = {
    'Pendiente':        'Solicitud recibida, pendiente de revision',
    'En revision':      'Expediente abierto, documentos en revision',
    'En negociacion':   'Contrato en mesa de negociacion',
    'Lista para firma': 'Contrato listo, proceso de firma iniciado',
    'Cerrado':          'Contrato firmado y expediente cerrado',
  }

  const kpis = [
    { label:'Total',    value:solicitudes.length,                                 color:'#0F2447', filtro:'todas'   },
    { label:'Flujo A',  value:solicitudes.filter(s=>s.flujo==='A').length,        color:'#F59E0B', filtro:'flujoA'  },
    { label:'Flujo B',  value:solicitudes.filter(s=>s.flujo==='B').length,        color:'#1D4ED8', filtro:'flujoB'  },
    { label:'Urgentes', value:solicitudes.filter(s=>s.prioridad==='Alta').length, color:'#E8321A', filtro:'urgente' },
  ]

  const estados = ['Pendiente','En revision','En negociacion','Lista para firma']

  return (
    <div style={{ padding:'32px', fontFamily:'sans-serif', background:'#F7F8FA', minHeight:'100vh' }}>
      <div style={{ marginBottom:'24px' }}>
        <h1 style={{ color:'#0F2447', fontSize:'24px', fontWeight:700, margin:'0 0 4px' }}>Solicitudes</h1>
        <p style={{ color:'#888', margin:0 }}>Gestiona y actualiza el estado de cada solicitud</p>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'16px', marginBottom:'24px' }}>
        {kpis.map((k,i) => (
          <div key={i} onClick={() => setFiltro(k.filtro)}
            style={{ background:filtro===k.filtro?'#0F2447':'white', borderRadius:'12px', padding:'20px', border:`2px solid ${filtro===k.filtro?'#0F2447':'#F0F0F0'}`, cursor:'pointer' }}>
            <p style={{ color:filtro===k.filtro?'rgba(255,255,255,0.7)':'#888', fontSize:'12px', margin:'0 0 8px' }}>{k.label}</p>
            <p style={{ color:filtro===k.filtro?'white':k.color, fontSize:'32px', fontWeight:700, margin:0 }}>{cargando?'...':k.value}</p>
          </div>
        ))}
      </div>

      <div style={{ display:'flex', gap:'16px', alignItems:'flex-start' }}>
        <div style={{ flex:1, background:'white', borderRadius:'16px', padding:'24px', border:'1px solid #F0F0F0' }}>
          <input value={busqueda} onChange={e => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre, ID o area..."
            style={{ width:'100%', marginBottom:'20px', padding:'10px 14px', borderRadius:'8px', border:'1.5px solid #E8E8E8', fontSize:'13px', outline:'none', color:'#0F2447', boxSizing:'border-box' as any }} />

          {cargando ? (
            <div style={{ textAlign:'center', padding:'48px', color:'#888' }}>Cargando...</div>
          ) : filtradas.length === 0 ? (
            <div style={{ textAlign:'center', padding:'48px', color:'#888' }}>No hay solicitudes</div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
              {filtradas.map((s,i) => (
                <div key={i} onClick={() => irA(s.id)}
                  style={{ borderRadius:'12px', border:`1.5px solid ${seleccionada?.id===s.id?'#0F2447':'#F0F0F0'}`, padding:'14px 18px', background:seleccionada?.id===s.id?'#F8F9FF':'white', borderLeft:`4px solid ${s.flujo==='A'?'#F59E0B':'#1D4ED8'}`, cursor:'pointer' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'8px' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:'6px', flexWrap:'wrap' }}>
                      <span style={{ background:'#0F2447', color:'white', fontSize:'11px', fontWeight:700, padding:'2px 8px', borderRadius:'20px' }}>{s.id}</span>
                      <span style={{ background:s.flujo==='A'?'#FEF3C7':'#EFF6FF', color:s.flujo==='A'?'#92400E':'#1D4ED8', fontSize:'10px', fontWeight:700, padding:'2px 7px', borderRadius:'10px' }}>
                        {s.flujo==='A'?'Socio comercial':'Juridica T1'}
                      </span>
                      {s.confidencial && <span style={{ background:'#FFF5F5', color:'#C42A15', fontSize:'10px', fontWeight:700, padding:'2px 7px', borderRadius:'10px', border:'1px solid #FFD0CC' }}>Confidencial</span>}
                      {s.prioridad==='Alta' && <span style={{ background:'#FEE2E2', color:'#C42A15', fontSize:'10px', fontWeight:700, padding:'2px 7px', borderRadius:'10px' }}>Urgente</span>}
                    </div>
                    <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                      <span style={{ background:estadoColor[s.estado]?.bg||'#F8F8F8', color:estadoColor[s.estado]?.color||'#888', fontSize:'10px', fontWeight:700, padding:'2px 8px', borderRadius:'10px' }}>{s.estado}</span>
                      <span style={{ color:'#888', fontSize:'11px' }}>{new Date(s.created_at).toLocaleDateString('es-MX')}</span>
                    </div>
                  </div>
                  <p style={{ color:'#0F2447', fontWeight:700, fontSize:'13px', margin:'0 0 2px' }}>{s.nombre||'Sin nombre'} - {s.area||'Sin area'}</p>
                  <p style={{ color:'#888', fontSize:'12px', margin:0 }}>{s.tipo_solicitud||'Sin tipo'} · {s.empresa_t1}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {seleccionada && (
          <div style={{ width:'360px', flexShrink:0, background:'white', borderRadius:'16px', padding:'24px', border:'1px solid #F0F0F0', position:'sticky' as any, top:'24px' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'16px' }}>
              <span style={{ background:'#0F2447', color:'white', fontSize:'12px', fontWeight:700, padding:'4px 12px', borderRadius:'20px' }}>{seleccionada.id}</span>
              <button onClick={() => setSeleccionada(null)} style={{ background:'none', border:'none', color:'#888', cursor:'pointer', fontSize:'18px' }}>x</button>
            </div>
            <h2 style={{ color:'#0F2447', fontSize:'16px', fontWeight:700, margin:'0 0 2px' }}>{seleccionada.nombre||'Sin nombre'}</h2>
            <p style={{ color:'#888', fontSize:'12px', margin:'0 0 16px' }}>{seleccionada.tipo_solicitud||'Sin tipo'} · {seleccionada.empresa_t1}</p>

            <div style={{ background:estadoColor[seleccionada.estado]?.bg||'#F8F8F8', borderRadius:'10px', padding:'12px 14px', marginBottom:'16px' }}>
              <p style={{ fontSize:'10px', color:'#888', margin:'0 0 3px' }}>Estado actual</p>
              <p style={{ fontSize:'13px', fontWeight:700, color:estadoColor[seleccionada.estado]?.color||'#888', margin:'0 0 3px' }}>{seleccionada.estado}</p>
              <p style={{ fontSize:'11px', color:'#888', margin:0 }}>{estadoDescripcion[seleccionada.estado]||''}</p>
            </div>

            <p style={{ fontSize:'11px', fontWeight:700, color:'#888', textTransform:'uppercase' as any, letterSpacing:'0.05em', margin:'0 0 8px' }}>Mover a</p>
            <div style={{ display:'flex', flexDirection:'column', gap:'6px', marginBottom:'16px' }}>
              {estados.filter(e => e !== seleccionada.estado).map((e,i) => (
                <button key={i} onClick={() => cambiarEstado(seleccionada.id, e)}
                  disabled={actualizando===seleccionada.id}
                  style={{ background:'white', color:'#0F2447', border:'1px solid #E8E8E8', padding:'8px 12px', borderRadius:'8px', fontSize:'12px', fontWeight:600, cursor:'pointer', textAlign:'left' as any, opacity:actualizando===seleccionada.id?0.6:1 }}>
                  {e} →
                </button>
              ))}
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px', marginBottom:'16px' }}>
              {[
                { label:'Prioridad', val: seleccionada.prioridad||'—' },
                { label:'Area', val: seleccionada.area||'—' },
                { label:'Flujo', val: seleccionada.flujo==='A'?'Socio comercial':'Juridica T1' },
                { label:'Fecha limite', val: seleccionada.fecha_limite ? new Date(seleccionada.fecha_limite).toLocaleDateString('es-MX') : 'Sin fecha' },
                { label:'Correo', val: seleccionada.correo||'—' },
                { label:'Nacionalidad', val: seleccionada.nacionalidad||'—' },
              ].map((item,i) => (
                <div key={i} style={{ background:'#F8F8F8', borderRadius:'8px', padding:'10px 12px' }}>
                  <p style={{ fontSize:'10px', color:'#888', margin:'0 0 3px' }}>{item.label}</p>
                  <p style={{ fontSize:'12px', fontWeight:600, color:'#0F2447', margin:0, wordBreak:'break-all' as any }}>{item.val}</p>
                </div>
              ))}
            </div>

            {seleccionada.descripcion && (
              <div style={{ background:'#F8F8F8', borderRadius:'8px', padding:'12px', marginBottom:'10px' }}>
                <p style={{ fontSize:'10px', color:'#888', margin:'0 0 4px' }}>Descripcion</p>
                <p style={{ fontSize:'12px', color:'#0F2447', margin:0, lineHeight:1.5 }}>{seleccionada.descripcion}</p>
              </div>
            )}

            {seleccionada.condiciones_especiales && (
              <div style={{ background:'#FFFBEB', borderRadius:'8px', padding:'12px', marginBottom:'10px', border:'1px solid #FDE68A' }}>
                <p style={{ fontSize:'10px', color:'#92400E', margin:'0 0 4px' }}>Condiciones especiales</p>
                <p style={{ fontSize:'12px', color:'#0F2447', margin:0, lineHeight:1.5 }}>{seleccionada.condiciones_especiales}</p>
              </div>
            )}

            <div style={{ display:'flex', flexDirection:'column', gap:'8px', marginTop:'16px', borderTop:'1px solid #F0F0F0', paddingTop:'16px' }}>
              <button onClick={() => window.location.href=`/dashboard/expediente?buscar=${seleccionada.id}`}
                style={{ background:'#0F2447', color:'white', border:'none', padding:'10px', borderRadius:'8px', fontSize:'13px', fontWeight:700, cursor:'pointer', width:'100%' }}>
                Ver expediente →
              </button>
              <button onClick={() => window.location.href=`/dashboard/editor?id=${seleccionada.id}`}
                style={{ background:'white', color:'#0F2447', border:'1px solid #E8E8E8', padding:'10px', borderRadius:'8px', fontSize:'13px', fontWeight:700, cursor:'pointer', width:'100%' }}>
                Abrir en editor →
              </button>
              <button onClick={() => window.location.href=`/dashboard/negociacion?id=${seleccionada.id}`}
                style={{ background:'white', color:'#7C3AED', border:'1px solid #E8E8E8', padding:'10px', borderRadius:'8px', fontSize:'13px', fontWeight:700, cursor:'pointer', width:'100%' }}>
                Ver negociacion →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
