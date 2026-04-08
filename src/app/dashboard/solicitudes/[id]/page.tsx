'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { obtenerSolicitudes, actualizarEstado } from '@/lib/supabase/solicitudes'

export default function SolicitudDetalle() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const [solicitud, setSolicitud] = useState<any>(null)
  const [cargando, setCargando] = useState(true)
  const [actualizando, setActualizando] = useState(false)

  useEffect(() => {
    cargar()
  }, [id])

  const cargar = async () => {
    setCargando(true)
    const data = await obtenerSolicitudes()
    const encontrada = (data || []).find((s: any) => s.id === id)
    setSolicitud(encontrada || null)
    setCargando(false)
  }

  const cambiarEstado = async (estado: string) => {
    setActualizando(true)
    try {
      await actualizarEstado(id, estado)
      if (solicitud?.correo) {
        fetch('/api/notificaciones', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tipo: 'estado_actualizado', correo: solicitud.correo, nombre: solicitud.nombre || 'Solicitante', id, estado })
        }).catch(() => {})
      }
      await cargar()
    } catch(e) {
      alert('Error al actualizar')
    }
    setActualizando(false)
  }

  const estadoColor: Record<string,{bg:string,color:string}> = {
    'Pendiente': { bg:'#FEF3C7', color:'#92400E' },
    'En revision': { bg:'#EFF6FF', color:'#1D4ED8' },
    'En negociacion': { bg:'#F3E8FF', color:'#7C3AED' },
    'Lista para firma': { bg:'#ECFDF5', color:'#065F46' },
    'Cerrado': { bg:'#F0FDF4', color:'#166534' },
  }
  const estados = ['Pendiente','En revision','En negociacion','Lista para firma']

  if (cargando) return (
    <div style={{ padding:'32px', fontFamily:'sans-serif', textAlign:'center', color:'#888' }}>Cargando solicitud...</div>
  )

  if (!solicitud) return (
    <div style={{ padding:'32px', fontFamily:'sans-serif' }}>
      <button onClick={() => router.back()} style={{ background:'none', border:'none', color:'#1D4ED8', cursor:'pointer', fontSize:'13px', marginBottom:'16px' }}>← Regresar</button>
      <p style={{ color:'#888' }}>No se encontró la solicitud {id}</p>
    </div>
  )

  return (
    <div style={{ padding:'32px', fontFamily:'sans-serif', background:'#F7F8FA', minHeight:'100vh' }}>
      <button onClick={() => router.back()} style={{ background:'none', border:'none', color:'#1D4ED8', cursor:'pointer', fontSize:'13px', marginBottom:'20px', display:'flex', alignItems:'center', gap:'4px' }}>
        ← Regresar
      </button>

      <div style={{ background:'white', borderRadius:'14px', padding:'24px', border:'1px solid #F0F0F0', marginBottom:'16px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'20px' }}>
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'8px', flexWrap:'wrap' }}>
              <span style={{ background:'#0F2447', color:'white', fontSize:'13px', fontWeight:700, padding:'4px 12px', borderRadius:'20px' }}>{solicitud.id}</span>
              <span style={{ background:solicitud.flujo==='A'?'#FEF3C7':'#EFF6FF', color:solicitud.flujo==='A'?'#92400E':'#1D4ED8', fontSize:'11px', fontWeight:700, padding:'2px 8px', borderRadius:'10px' }}>
                {solicitud.flujo==='A'?'Socio comercial':'Dirección Jurídica T1'}
              </span>
              {solicitud.confidencial && <span style={{ background:'#FFF5F5', color:'#C42A15', fontSize:'11px', fontWeight:700, padding:'2px 8px', borderRadius:'10px', border:'1px solid #FFD0CC' }}>Confidencial</span>}
              {solicitud.prioridad==='Alta' && <span style={{ background:'#FEE2E2', color:'#C42A15', fontSize:'11px', fontWeight:700, padding:'2px 8px', borderRadius:'10px' }}>Urgente</span>}
            </div>
            <h1 style={{ color:'#0F2447', fontSize:'20px', fontWeight:700, margin:'0 0 4px' }}>{solicitud.nombre || 'Sin nombre'} — {solicitud.area || 'Sin área'}</h1>
            <p style={{ color:'#888', fontSize:'13px', margin:0 }}>{solicitud.tipo_solicitud || 'Sin tipo'} · {solicitud.empresa_t1}</p>
          </div>
          <div style={{ textAlign:'right' }}>
            <p style={{ color:'#888', fontSize:'11px', margin:'0 0 6px' }}>Estado actual</p>
            <span style={{ background:estadoColor[solicitud.estado]?.bg||'#F8F8F8', color:estadoColor[solicitud.estado]?.color||'#888', fontSize:'12px', fontWeight:700, padding:'4px 12px', borderRadius:'10px' }}>
              {solicitud.estado}
            </span>
          </div>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'12px', marginBottom:'20px' }}>
          {[
            { label:'Prioridad', val: solicitud.prioridad || 'Sin prioridad' },
            { label:'Fecha de solicitud', val: new Date(solicitud.created_at).toLocaleDateString('es-MX') },
            { label:'Fecha límite', val: solicitud.fecha_limite ? new Date(solicitud.fecha_limite).toLocaleDateString('es-MX') : 'Sin fecha' },
            { label:'Empresa T1', val: solicitud.empresa_t1 || '—' },
            { label:'Nacionalidad', val: solicitud.nacionalidad || '—' },
            { label:'Correo', val: solicitud.correo || '—' },
          ].map((item, i) => (
            <div key={i} style={{ background:'#F8F8F8', borderRadius:'10px', padding:'12px 14px' }}>
              <p style={{ fontSize:'11px', color:'#888', margin:'0 0 4px' }}>{item.label}</p>
              <p style={{ fontSize:'13px', fontWeight:600, color:'#0F2447', margin:0 }}>{item.val}</p>
            </div>
          ))}
        </div>

        {solicitud.descripcion && (
          <div style={{ background:'#F8F8F8', borderRadius:'10px', padding:'14px', marginBottom:'12px' }}>
            <p style={{ fontSize:'11px', color:'#888', margin:'0 0 6px' }}>Descripción</p>
            <p style={{ fontSize:'13px', color:'#0F2447', margin:0, lineHeight:1.6 }}>{solicitud.descripcion}</p>
          </div>
        )}

        {solicitud.condiciones_especiales && (
          <div style={{ background:'#FFFBEB', borderRadius:'10px', padding:'14px', marginBottom:'12px', border:'1px solid #FDE68A' }}>
            <p style={{ fontSize:'11px', color:'#92400E', margin:'0 0 6px' }}>Condiciones especiales</p>
            <p style={{ fontSize:'13px', color:'#0F2447', margin:0, lineHeight:1.6 }}>{solicitud.condiciones_especiales}</p>
          </div>
        )}
      </div>

      <div style={{ background:'white', borderRadius:'14px', padding:'24px', border:'1px solid #F0F0F0', marginBottom:'16px' }}>
        <p style={{ fontSize:'13px', fontWeight:700, color:'#0F2447', margin:'0 0 14px' }}>Cambiar estado</p>
        <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
          {estados.map((e, i) => (
            <button key={i} onClick={() => cambiarEstado(e)} disabled={actualizando || solicitud.estado === e}
              style={{ padding:'9px 16px', borderRadius:'8px', border:`1.5px solid ${solicitud.estado===e?'#0F2447':'#E8E8E8'}`, background:solicitud.estado===e?'#0F2447':'white', color:solicitud.estado===e?'white':'#555', fontSize:'12px', fontWeight:600, cursor:solicitud.estado===e?'default':'pointer', opacity:actualizando?0.6:1 }}>
              {e}
            </button>
          ))}
        </div>
        {actualizando && <p style={{ color:'#888', fontSize:'12px', marginTop:'8px' }}>Guardando...</p>}
      </div>

      <div style={{ display:'flex', gap:'10px' }}>
        <button onClick={() => router.push(`/dashboard/expediente?id=${solicitud.id}`)}
          style={{ background:'#0F2447', color:'white', border:'none', padding:'10px 20px', borderRadius:'8px', fontSize:'13px', fontWeight:700, cursor:'pointer' }}>
          Ver expediente →
        </button>
        <button onClick={() => router.push(`/dashboard/negociacion?id=${solicitud.id}`)}
          style={{ background:'white', color:'#0F2447', border:'1px solid #E8E8E8', padding:'10px 20px', borderRadius:'8px', fontSize:'13px', fontWeight:700, cursor:'pointer' }}>
          Ver negociación →
        </button>
      </div>
    </div>
  )
}
