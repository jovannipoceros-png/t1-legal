'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { obtenerSolicitudes, obtenerTracking, obtenerDocumentos, obtenerUrlDocumento, subirDocumento } from '@/lib/supabase/solicitudes'

export default function ExpedienteDetalle() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const [expediente, setExpediente] = useState<any>(null)
  const [tracking, setTracking] = useState<any[]>([])
  const [documentos, setDocumentos] = useState<any[]>([])
  const [cargando, setCargando] = useState(true)
  const [vistaPrevia, setVistaPrevia] = useState<string|null>(null)
  const [vistaNombre, setVistaNombre] = useState('')
  const [subiendo, setSubiendo] = useState(false)

  useEffect(() => { cargar() }, [id])

  const cargar = async () => {
    setCargando(true)
    try {
      const [data, track, docs] = await Promise.all([
        obtenerSolicitudes(),
        obtenerTracking(id),
        obtenerDocumentos(id)
      ])
      const encontrado = (data || []).find((s: any) => s.id === id)
      setExpediente(encontrado || null)
      setTracking(track || [])
      setDocumentos(docs || [])
    } catch(e) { console.error(e) }
    setCargando(false)
  }

  const verDocumento = async (doc: any) => {
    try {
      const url = await obtenerUrlDocumento(id, doc.nombre)
      if (url) { setVistaPrevia(url); setVistaNombre(doc.nombre) }
    } catch(e) { console.error(e) }
  }

  const handleSubir = async (e: React.ChangeEvent<HTMLInputElement>, carpeta: string) => {
    const archivo = e.target.files?.[0]
    if (!archivo) return
    setSubiendo(true)
    try {
      await subirDocumento(id, archivo)
      await cargar()
    } catch(e) { alert('Error al subir documento') }
    setSubiendo(false)
  }

  const estadoColor: Record<string,{bg:string,color:string}> = {
    'Pendiente': { bg:'#FEF3C7', color:'#92400E' },
    'En revision': { bg:'#EFF6FF', color:'#1D4ED8' },
    'En negociacion': { bg:'#F3E8FF', color:'#7C3AED' },
    'Lista para firma': { bg:'#ECFDF5', color:'#065F46' },
    'Cerrado': { bg:'#F0FDF4', color:'#166534' },
  }

  const carpetas = ['Contratos', 'Anexos', 'Correspondencia', 'Identificaciones', 'Otros']

  if (cargando) return (
    <div style={{ padding:'32px', fontFamily:'sans-serif', textAlign:'center', color:'#888' }}>Cargando expediente...</div>
  )

  if (!expediente) return (
    <div style={{ padding:'32px', fontFamily:'sans-serif' }}>
      <button onClick={() => router.back()} style={{ background:'none', border:'none', color:'#1D4ED8', cursor:'pointer', fontSize:'13px', marginBottom:'16px' }}>← Regresar</button>
      <p style={{ color:'#888' }}>No se encontró el expediente {id}</p>
    </div>
  )

  return (
    <div style={{ padding:'32px', fontFamily:'sans-serif', background:'#F7F8FA', minHeight:'100vh' }}>
      <button onClick={() => router.back()} style={{ background:'none', border:'none', color:'#1D4ED8', cursor:'pointer', fontSize:'13px', marginBottom:'20px' }}>← Regresar</button>

      {/* ENCABEZADO */}
      <div style={{ background:'white', borderRadius:'14px', padding:'24px', border:'1px solid #F0F0F0', marginBottom:'16px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'16px' }}>
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'8px', flexWrap:'wrap' }}>
              <span style={{ background:'#0F2447', color:'white', fontSize:'13px', fontWeight:700, padding:'4px 12px', borderRadius:'20px' }}>{expediente.id}</span>
              <span style={{ background:expediente.flujo==='A'?'#FEF3C7':'#EFF6FF', color:expediente.flujo==='A'?'#92400E':'#1D4ED8', fontSize:'11px', fontWeight:700, padding:'2px 8px', borderRadius:'10px' }}>
                {expediente.flujo==='A'?'Socio comercial':'Dirección Jurídica T1'}
              </span>
              {expediente.prioridad==='Alta' && <span style={{ background:'#FEE2E2', color:'#C42A15', fontSize:'11px', fontWeight:700, padding:'2px 8px', borderRadius:'10px' }}>Urgente</span>}
            </div>
            <h1 style={{ color:'#0F2447', fontSize:'20px', fontWeight:700, margin:'0 0 4px' }}>{expediente.nombre_empresa || expediente.nombre || 'Sin nombre'}</h1>
            <p style={{ color:'#888', fontSize:'13px', margin:0 }}>{expediente.tipo_solicitud || 'Sin tipo'} · {expediente.empresa_t1}</p>
          </div>
          <span style={{ background:estadoColor[expediente.estado]?.bg||'#F8F8F8', color:estadoColor[expediente.estado]?.color||'#888', fontSize:'12px', fontWeight:700, padding:'4px 12px', borderRadius:'10px' }}>
            {expediente.estado}
          </span>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'10px' }}>
          {[
            { label:'Área', val: expediente.area || '—' },
            { label:'Prioridad', val: expediente.prioridad || '—' },
            { label:'Fecha límite', val: expediente.fecha_limite ? new Date(expediente.fecha_limite).toLocaleDateString('es-MX') : 'Sin fecha' },
            { label:'Nacionalidad', val: expediente.nacionalidad || '—' },
            { label:'Correo', val: expediente.correo || '—' },
            { label:'Fecha de solicitud', val: new Date(expediente.created_at).toLocaleDateString('es-MX') },
          ].map((item, i) => (
            <div key={i} style={{ background:'#F8F8F8', borderRadius:'10px', padding:'12px 14px' }}>
              <p style={{ fontSize:'11px', color:'#888', margin:'0 0 4px' }}>{item.label}</p>
              <p style={{ fontSize:'13px', fontWeight:600, color:'#0F2447', margin:0 }}>{item.val}</p>
            </div>
          ))}
        </div>
      </div>

      {/* DOCUMENTOS */}
      <div style={{ background:'white', borderRadius:'14px', padding:'24px', border:'1px solid #F0F0F0', marginBottom:'16px' }}>
        <p style={{ fontSize:'14px', fontWeight:700, color:'#0F2447', margin:'0 0 16px' }}>Documentos del expediente</p>
        {carpetas.map((carpeta, i) => {
          const docsEnCarpeta = documentos.filter(d => d.carpeta === carpeta)
          return (
            <div key={i} style={{ marginBottom:'12px', border:'1px solid #F0F0F0', borderRadius:'10px', overflow:'hidden' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 16px', background:'#F8F8F8' }}>
                <span style={{ fontSize:'13px', fontWeight:600, color:'#0F2447' }}>{carpeta} ({docsEnCarpeta.length})</span>
                <label style={{ background:'#0F2447', color:'white', fontSize:'11px', fontWeight:700, padding:'5px 12px', borderRadius:'6px', cursor:'pointer' }}>
                  {subiendo ? 'Subiendo...' : '+ Subir'}
                  <input type="file" style={{ display:'none' }} onChange={e => handleSubir(e, carpeta)} disabled={subiendo} />
                </label>
              </div>
              {docsEnCarpeta.length > 0 && (
                <div style={{ padding:'8px 16px' }}>
                  {docsEnCarpeta.map((doc, j) => (
                    <div key={j} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 0', borderBottom: j < docsEnCarpeta.length-1 ? '1px solid #F0F0F0' : 'none' }}>
                      <span style={{ fontSize:'12px', color:'#0F2447' }}>{doc.nombre}</span>
                      <button onClick={() => verDocumento(doc)} style={{ background:'none', border:'none', color:'#1D4ED8', fontSize:'11px', fontWeight:600, cursor:'pointer', textDecoration:'underline' }}>Ver →</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* HISTORIAL */}
      {tracking.length > 0 && (
        <div style={{ background:'white', borderRadius:'14px', padding:'24px', border:'1px solid #F0F0F0', marginBottom:'16px' }}>
          <p style={{ fontSize:'14px', fontWeight:700, color:'#0F2447', margin:'0 0 16px' }}>Historial de cambios</p>
          {tracking.map((t, i) => (
            <div key={i} style={{ display:'flex', gap:'12px', paddingBottom:'12px', marginBottom:'12px', borderBottom: i < tracking.length-1 ? '1px solid #F0F0F0' : 'none' }}>
              <div style={{ width:'8px', height:'8px', borderRadius:'50%', background:'#0F2447', flexShrink:0, marginTop:'4px' }} />
              <div>
                <p style={{ fontSize:'12px', fontWeight:600, color:'#0F2447', margin:'0 0 2px' }}>{t.estado_nuevo || t.accion || 'Cambio de estado'}</p>
                <p style={{ fontSize:'11px', color:'#888', margin:0 }}>{new Date(t.created_at).toLocaleDateString('es-MX', { year:'numeric', month:'long', day:'numeric', hour:'2-digit', minute:'2-digit' })}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* VISTA PREVIA */}
      {vistaPrevia && (
        <div style={{ position:'fixed' as any, top:0, left:0, right:0, bottom:0, background:'rgba(0,0,0,0.7)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000 }}>
          <div style={{ background:'white', borderRadius:'14px', padding:'24px', width:'80%', maxWidth:'900px', maxHeight:'90vh', overflow:'auto' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'16px' }}>
              <p style={{ fontSize:'14px', fontWeight:700, color:'#0F2447', margin:0 }}>{vistaNombre}</p>
              <button onClick={() => setVistaPrevia(null)} style={{ background:'none', border:'none', fontSize:'20px', cursor:'pointer', color:'#888' }}>✕</button>
            </div>
            <iframe src={vistaPrevia} style={{ width:'100%', height:'70vh', border:'none', borderRadius:'8px' }} />
          </div>
        </div>
      )}

      <div style={{ display:'flex', gap:'10px' }}>
        <button onClick={() => router.push(`/dashboard/solicitudes/${expediente.id}`)}
          style={{ background:'white', color:'#0F2447', border:'1px solid #E8E8E8', padding:'10px 20px', borderRadius:'8px', fontSize:'13px', fontWeight:700, cursor:'pointer' }}>
          Ver solicitud →
        </button>
        <button onClick={() => router.push(`/dashboard/expediente`)}
          style={{ background:'#0F2447', color:'white', border:'none', padding:'10px 20px', borderRadius:'8px', fontSize:'13px', fontWeight:700, cursor:'pointer' }}>
          Ir al expediente completo →
        </button>
      </div>
    </div>
  )
}
