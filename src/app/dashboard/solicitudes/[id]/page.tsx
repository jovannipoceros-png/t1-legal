'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { obtenerSolicitudes, actualizarEstado, obtenerTracking, obtenerDocumentos } from '@/lib/supabase/solicitudes'

export default function SolicitudDetalle() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const [solicitud, setSolicitud] = useState<any>(null)
  const [tracking, setTracking] = useState<any[]>([])
  const [documentos, setDocumentos] = useState<any[]>([])
  const [cargando, setCargando] = useState(true)
  const [actualizando, setActualizando] = useState(false)
  const [enviandoEmail, setEnviandoEmail] = useState(false)
  const [emailEnviado, setEmailEnviado] = useState(false)
  const [docsFaltantes, setDocsFaltantes] = useState('')
  const [mostrarEmailForm, setMostrarEmailForm] = useState(false)

  useEffect(() => { cargar() }, [id])

  const cargar = async () => {
    setCargando(true)
    try {
      const [data, track, docs] = await Promise.all([
        obtenerSolicitudes(),
        obtenerTracking(id),
        obtenerDocumentos(id)
      ])
      const encontrada = (data || []).find((s: any) => s.id === id)
      setSolicitud(encontrada || null)
      setTracking(track || [])
      setDocumentos(docs || [])
    } catch(e) { console.error(e) }
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
    } catch(e) { alert('Error al actualizar') }
    setActualizando(false)
  }

  const enviarEmailFaltantes = async () => {
    if (!docsFaltantes.trim() || !solicitud?.correo) return
    setEnviandoEmail(true)
    try {
      await fetch('/api/notificaciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipo: 'documentos_faltantes',
          correo: solicitud.correo,
          nombre: solicitud.nombre || 'Solicitante',
          id,
          documentos_faltantes: docsFaltantes
        })
      })
      setEmailEnviado(true)
      setDocsFaltantes('')
      setMostrarEmailForm(false)
      setTimeout(() => setEmailEnviado(false), 4000)
    } catch(e) { alert('Error al enviar email') }
    setEnviandoEmail(false)
  }

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

  const estados = ['Pendiente','En revision','En negociacion','Lista para firma']

  if (cargando) return (
    <div style={{ padding:'32px', fontFamily:'sans-serif', textAlign:'center', color:'#888', paddingTop:'80px' }}>
      <p style={{ fontSize:'16px' }}>Cargando solicitud...</p>
    </div>
  )

  if (!solicitud) return (
    <div style={{ padding:'32px', fontFamily:'sans-serif' }}>
      <button onClick={() => router.back()} style={{ background:'none', border:'none', color:'#1D4ED8', cursor:'pointer', fontSize:'13px', marginBottom:'16px' }}>← Regresar</button>
      <p style={{ color:'#888' }}>No se encontro la solicitud {id}</p>
    </div>
  )

  return (
    <div style={{ padding:'32px', fontFamily:'sans-serif', background:'#F7F8FA', minHeight:'100vh' }}>
      <button onClick={() => router.push('/dashboard/solicitudes')} style={{ background:'none', border:'none', color:'#1D4ED8', cursor:'pointer', fontSize:'13px', marginBottom:'20px', display:'flex', alignItems:'center', gap:'4px' }}>
        ← Regresar a solicitudes
      </button>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 340px', gap:'16px', alignItems:'flex-start' }}>

        <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>

          {/* ENCABEZADO */}
          <div style={{ background:'white', borderRadius:'14px', padding:'24px', border:'1px solid #F0F0F0' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'16px' }}>
              <div>
                <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'10px', flexWrap:'wrap' }}>
                  <span style={{ background:'#0F2447', color:'white', fontSize:'13px', fontWeight:700, padding:'4px 12px', borderRadius:'20px' }}>{solicitud.id}</span>
                  <span style={{ background:solicitud.flujo==='A'?'#FEF3C7':'#EFF6FF', color:solicitud.flujo==='A'?'#92400E':'#1D4ED8', fontSize:'11px', fontWeight:700, padding:'2px 8px', borderRadius:'10px' }}>
                    {solicitud.flujo==='A'?'Socio comercial':'Juridica T1'}
                  </span>
                  {solicitud.confidencial && <span style={{ background:'#FFF5F5', color:'#C42A15', fontSize:'11px', fontWeight:700, padding:'2px 8px', borderRadius:'10px', border:'1px solid #FFD0CC' }}>Confidencial</span>}
                  {solicitud.prioridad==='Alta' && <span style={{ background:'#FEE2E2', color:'#C42A15', fontSize:'11px', fontWeight:700, padding:'2px 8px', borderRadius:'10px' }}>Urgente</span>}
                </div>
                <h1 style={{ color:'#0F2447', fontSize:'20px', fontWeight:700, margin:'0 0 4px' }}>{solicitud.nombre || 'Sin nombre'} — {solicitud.area || 'Sin area'}</h1>
                <p style={{ color:'#888', fontSize:'13px', margin:0 }}>{solicitud.tipo_solicitud || 'Sin tipo'} · {solicitud.empresa_t1}</p>
              </div>
              <span style={{ background:estadoColor[solicitud.estado]?.bg||'#F8F8F8', color:estadoColor[solicitud.estado]?.color||'#888', fontSize:'12px', fontWeight:700, padding:'6px 14px', borderRadius:'10px', flexShrink:0 }}>
                {solicitud.estado}
              </span>
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'10px' }}>
              {[
                { label:'Prioridad', val: solicitud.prioridad||'—' },
                { label:'Fecha limite', val: solicitud.fecha_limite ? new Date(solicitud.fecha_limite).toLocaleDateString('es-MX') : 'Sin fecha' },
                { label:'Fecha de solicitud', val: new Date(solicitud.created_at).toLocaleDateString('es-MX') },
                { label:'Empresa T1', val: solicitud.empresa_t1||'—' },
                { label:'Correo', val: solicitud.correo||'—' },
                { label:'Nacionalidad', val: solicitud.nacionalidad||'—' },
              ].map((item,i) => (
                <div key={i} style={{ background:'#F8F8F8', borderRadius:'10px', padding:'12px 14px' }}>
                  <p style={{ fontSize:'11px', color:'#888', margin:'0 0 4px' }}>{item.label}</p>
                  <p style={{ fontSize:'13px', fontWeight:600, color:'#0F2447', margin:0, wordBreak:'break-all' as any }}>{item.val}</p>
                </div>
              ))}
            </div>

            {solicitud.descripcion && (
              <div style={{ background:'#F8F8F8', borderRadius:'10px', padding:'14px', marginTop:'12px' }}>
                <p style={{ fontSize:'11px', color:'#888', margin:'0 0 6px' }}>Descripcion</p>
                <p style={{ fontSize:'13px', color:'#0F2447', margin:0, lineHeight:1.6 }}>{solicitud.descripcion}</p>
              </div>
            )}

            {solicitud.condiciones_especiales && (
              <div style={{ background:'#FFFBEB', borderRadius:'10px', padding:'14px', marginTop:'10px', border:'1px solid #FDE68A' }}>
                <p style={{ fontSize:'11px', color:'#92400E', margin:'0 0 6px' }}>Condiciones especiales</p>
                <p style={{ fontSize:'13px', color:'#0F2447', margin:0, lineHeight:1.6 }}>{solicitud.condiciones_especiales}</p>
              </div>
            )}
          </div>

          {/* DOCUMENTOS */}
          <div style={{ background:'white', borderRadius:'14px', padding:'24px', border:'1px solid #F0F0F0' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'14px' }}>
              <p style={{ fontSize:'14px', fontWeight:700, color:'#0F2447', margin:0 }}>Documentos en expediente</p>
              <span style={{ background:documentos.length>0?'#ECFDF5':'#F8F8F8', color:documentos.length>0?'#065F46':'#888', fontSize:'12px', fontWeight:700, padding:'3px 10px', borderRadius:'10px' }}>
                {documentos.length} archivo(s)
              </span>
            </div>
            {documentos.length === 0 ? (
              <p style={{ color:'#888', fontSize:'13px', margin:0 }}>No hay documentos subidos aun en este expediente.</p>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
                {documentos.map((doc,i) => (
                  <div key={i} style={{ display:'flex', alignItems:'center', gap:'10px', padding:'10px 14px', background:'#F8F8F8', borderRadius:'8px' }}>
                    <span style={{ fontSize:'16px' }}>📄</span>
                    <span style={{ flex:1, fontSize:'13px', color:'#0F2447' }}>{doc.nombre}</span>
                    <span style={{ fontSize:'11px', color:'#888' }}>{doc.carpeta}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* HISTORIAL */}
          {tracking.length > 0 && (
            <div style={{ background:'white', borderRadius:'14px', padding:'24px', border:'1px solid #F0F0F0' }}>
              <p style={{ fontSize:'14px', fontWeight:700, color:'#0F2447', margin:'0 0 16px' }}>Historial de cambios</p>
              <div style={{ display:'flex', flexDirection:'column', gap:'0' }}>
                {tracking.map((t,i) => (
                  <div key={i} style={{ display:'flex', gap:'14px', paddingBottom:'14px', marginBottom:'14px', borderBottom:i<tracking.length-1?'1px solid #F0F0F0':'none' }}>
                    <div style={{ width:'8px', height:'8px', borderRadius:'50%', background:'#0F2447', flexShrink:0, marginTop:'5px' }} />
                    <div>
                      <p style={{ fontSize:'13px', fontWeight:600, color:'#0F2447', margin:'0 0 2px' }}>{t.estado_nuevo || t.accion || 'Cambio de estado'}</p>
                      <p style={{ fontSize:'11px', color:'#888', margin:0 }}>{new Date(t.created_at).toLocaleDateString('es-MX', { year:'numeric', month:'long', day:'numeric', hour:'2-digit', minute:'2-digit' })}</p>
                      {t.comentario && <p style={{ fontSize:'12px', color:'#555', margin:'4px 0 0', fontStyle:'italic' }}>{t.comentario}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SOLICITAR INFORMACION */}
          <div style={{ background:'white', borderRadius:'14px', padding:'24px', border:'1px solid #F0F0F0' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'14px' }}>
              <p style={{ fontSize:'14px', fontWeight:700, color:'#0F2447', margin:0 }}>Solicitar informacion faltante</p>
              {emailEnviado && <span style={{ fontSize:'12px', color:'#065F46', fontWeight:600 }}>✓ Email enviado</span>}
            </div>
            {!mostrarEmailForm ? (
              <button onClick={() => setMostrarEmailForm(true)}
                style={{ background:'#FFF5F5', color:'#E8321A', border:'1px solid #FCA5A5', padding:'10px 18px', borderRadius:'8px', fontSize:'13px', fontWeight:700, cursor:'pointer' }}>
                Pedir documentos al solicitante →
              </button>
            ) : (
              <div>
                <p style={{ fontSize:'12px', color:'#888', margin:'0 0 10px' }}>
                  Se enviara un email a <strong>{solicitud.correo||'sin correo'}</strong> con la lista de documentos faltantes.
                </p>
                <textarea
                  value={docsFaltantes}
                  onChange={e => setDocsFaltantes(e.target.value)}
                  placeholder="Ej: Acta constitutiva, identificacion oficial del representante legal, comprobante de domicilio..."
                  style={{ width:'100%', height:'100px', padding:'10px 14px', borderRadius:'8px', border:'1.5px solid #E8E8E8', fontSize:'13px', outline:'none', color:'#0F2447', resize:'vertical', boxSizing:'border-box' as any, fontFamily:'sans-serif', marginBottom:'10px' }}
                />
                <div style={{ display:'flex', gap:'8px' }}>
                  <button onClick={enviarEmailFaltantes} disabled={enviandoEmail || !docsFaltantes.trim()}
                    style={{ background:'#0F2447', color:'white', border:'none', padding:'10px 20px', borderRadius:'8px', fontSize:'13px', fontWeight:700, cursor:'pointer', opacity:(!docsFaltantes.trim()||enviandoEmail)?0.5:1 }}>
                    {enviandoEmail ? 'Enviando...' : 'Enviar email'}
                  </button>
                  <button onClick={() => setMostrarEmailForm(false)}
                    style={{ background:'white', color:'#888', border:'1px solid #E8E8E8', padding:'10px 20px', borderRadius:'8px', fontSize:'13px', cursor:'pointer' }}>
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* COLUMNA DERECHA */}
        <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>

          {/* ESTADO */}
          <div style={{ background:'white', borderRadius:'14px', padding:'20px', border:'1px solid #F0F0F0' }}>
            <div style={{ background:estadoColor[solicitud.estado]?.bg||'#F8F8F8', borderRadius:'10px', padding:'12px 14px', marginBottom:'14px' }}>
              <p style={{ fontSize:'10px', color:'#888', margin:'0 0 3px' }}>Estado actual</p>
              <p style={{ fontSize:'14px', fontWeight:700, color:estadoColor[solicitud.estado]?.color||'#888', margin:'0 0 3px' }}>{solicitud.estado}</p>
              <p style={{ fontSize:'11px', color:'#888', margin:0 }}>{estadoDescripcion[solicitud.estado]||''}</p>
            </div>
            <p style={{ fontSize:'11px', fontWeight:700, color:'#888', textTransform:'uppercase' as any, letterSpacing:'0.05em', margin:'0 0 8px' }}>Mover a</p>
            <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
              {estados.filter(e => e !== solicitud.estado).map((e,i) => (
                <button key={i} onClick={() => cambiarEstado(e)} disabled={actualizando}
                  style={{ background:'white', color:'#0F2447', border:'1px solid #E8E8E8', padding:'9px 14px', borderRadius:'8px', fontSize:'12px', fontWeight:600, cursor:'pointer', textAlign:'left' as any, opacity:actualizando?0.6:1 }}>
                  {e} →
                </button>
              ))}
            </div>
            {actualizando && <p style={{ color:'#888', fontSize:'11px', margin:'8px 0 0' }}>Guardando...</p>}
          </div>

          {/* ACCIONES */}
          <div style={{ background:'white', borderRadius:'14px', padding:'20px', border:'1px solid #F0F0F0' }}>
            <p style={{ fontSize:'11px', fontWeight:700, color:'#888', textTransform:'uppercase' as any, letterSpacing:'0.05em', margin:'0 0 10px' }}>Ir a</p>
            <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
              <button onClick={() => window.location.href=`/dashboard/expediente?buscar=${solicitud.id}`}
                style={{ background:'#0F2447', color:'white', border:'none', padding:'10px', borderRadius:'8px', fontSize:'13px', fontWeight:700, cursor:'pointer', width:'100%' }}>
                Ver expediente →
              </button>
              <button onClick={() => window.location.href=`/dashboard/editor?id=${solicitud.id}`}
                style={{ background:'white', color:'#0F2447', border:'1px solid #E8E8E8', padding:'10px', borderRadius:'8px', fontSize:'13px', fontWeight:700, cursor:'pointer', width:'100%' }}>
                Abrir en editor →
              </button>
              <button onClick={() => window.location.href=`/dashboard/negociacion?id=${solicitud.id}`}
                style={{ background:'white', color:'#7C3AED', border:'1px solid #E8E8E8', padding:'10px', borderRadius:'8px', fontSize:'13px', fontWeight:700, cursor:'pointer', width:'100%' }}>
                Ver negociacion →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
