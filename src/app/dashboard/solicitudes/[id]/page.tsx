'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { obtenerSolicitudes, actualizarEstado, obtenerTracking, obtenerDocumentos, obtenerUrlDocumento, crearNotificacion } from '@/lib/supabase/solicitudes'

export default function SolicitudDetalle() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const [solicitud, setSolicitud] = useState<any>(null)
  const [tracking, setTracking] = useState<any[]>([])
  const [trackingExpandido, setTrackingExpandido] = useState<Record<string,boolean>>({})
  const [documentos, setDocumentos] = useState<any[]>([])
  const [cargando, setCargando] = useState(true)
  const [actualizando, setActualizando] = useState(false)
  const [enviandoEmail, setEnviandoEmail] = useState(false)
  const [emailEnviado, setEmailEnviado] = useState(false)
  const [docsFaltantes, setDocsFaltantes] = useState<string[]>([])
  const [preguntas, setPreguntas] = useState<string[]>([])
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

  const verDocumento = async (doc: any) => {
    try {
      const url = await obtenerUrlDocumento(id, doc.name)
      window.open(url, '_blank')
    } catch(e) { alert('No se pudo ver el documento') }
  }

  const ordenEstados = ['Pendiente','En revision','En negociacion','Lista para firma','Cerrado']

  const cambiarEstado = async (estado: string) => {
    setActualizando(true)
    try {
      const idxActual = ordenEstados.indexOf(solicitud?.estado || '')
      const idxNuevo = ordenEstados.indexOf(estado)
      const esRetorno = idxNuevo < idxActual

      await actualizarEstado(id, estado)

      if (esRetorno) {
        // Registrar retorno en tracking automaticamente
        const { agregarTracking } = await import('@/lib/supabase/solicitudes')
        await agregarTracking(id, estado, `Retorno a ${estado} — desde ${solicitud?.estado}`)
        // Notificacion interna automatica
        await crearNotificacion(id, 'jovanni.poceros@t1.com', 'estado_actualizado',
          `Retorno automatico: solicitud ${id} regreso a ${estado} desde ${solicitud?.estado}`,
          { link: `/dashboard/solicitudes/${id}` })
      } else {
        // Avance normal - notificar al solicitante
        if (solicitud?.correo) {
          fetch('/api/notificaciones', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tipo: 'estado_actualizado', correo: solicitud.correo, nombre: solicitud.nombre || 'Solicitante', id, estado })
          }).catch(() => {})
        }
      }
      await cargar()
    } catch(e) { alert('Error al actualizar') }
    setActualizando(false)
  }

  const enviarEmailFaltantes = async () => {
    if (docsFaltantes.filter(d=>d.trim()).length === 0) return
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
          documentos_faltantes: docsFaltantes.filter((d:string) => d.trim()).join('\n'),
          preguntas: preguntas.filter((p:string) => p.trim())
        })
      })
      const docs = docsFaltantes.filter((d: string) => d.trim())
      const pregs = preguntas.filter((p: string) => p.trim())
      const link = `/solicitar/completar/${id}?docs=${encodeURIComponent(docs.join('|'))}&preguntas=${encodeURIComponent(pregs.join('|'))}`
      const mensaje = `El area legal requiere informacion adicional para tu solicitud. ${docs.length > 0 ? `Documentos: ${docs.join(', ')}. ` : ''}${pregs.length > 0 ? `Preguntas: ${pregs.join(', ')}.` : ''}`
      await crearNotificacion(id, solicitud.correo, 'documentos_faltantes', mensaje, { link, docs, preguntas: pregs })
      // Registrar en tracking
      const trackingMsg = `Solicitud de informacion enviada. Documentos pedidos: ${docs.join(', ')}${pregs.length > 0 ? `. Preguntas: ${pregs.join(', ')}` : ''}`
      try {
        const { agregarTracking } = await import('@/lib/supabase/solicitudes')
        await agregarTracking(id, solicitud.estado, trackingMsg)
      } catch(e) {}
      if (solicitud.lider_correo) {
        await crearNotificacion(id, solicitud.lider_correo, 'documentos_faltantes', `Tu colaborador necesita entregar informacion para la solicitud ${id}`, { link, docs, preguntas: pregs })
      }
      setEmailEnviado(true)
      setDocsFaltantes([])
      setPreguntas([])
      setMostrarEmailForm(false)
      setTimeout(() => setEmailEnviado(false), 4000)
    } catch(e: any) { alert('Error: ' + (e?.message || JSON.stringify(e))) }
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

  const Chip = ({ label, color, bg }: any) => (
    <span style={{ background:bg, color, fontSize:'10px', fontWeight:700, padding:'2px 8px', borderRadius:'10px' }}>{label}</span>
  )

  const Campo = ({ label, val }: any) => val && val !== '—' ? (
    <div style={{ background:'#F8F8F8', borderRadius:'8px', padding:'10px 14px' }}>
      <p style={{ fontSize:'10px', color:'#888', margin:'0 0 3px' }}>{label}</p>
      <p style={{ fontSize:'13px', fontWeight:600, color:'#0F2447', margin:0, wordBreak:'break-word' as any }}>{val}</p>
    </div>
  ) : null

  if (cargando) return (
    <div style={{ padding:'32px', fontFamily:'sans-serif', textAlign:'center', color:'#888', paddingTop:'80px' }}>
      Cargando solicitud...
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
      <button onClick={() => router.push('/dashboard/solicitudes')} style={{ background:'none', border:'none', color:'#1D4ED8', cursor:'pointer', fontSize:'13px', marginBottom:'20px' }}>
        ← Regresar a solicitudes
      </button>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 320px', gap:'16px', alignItems:'flex-start' }}>
        <div style={{ display:'flex', flexDirection:'column', gap:'14px' }}>

          {/* ENCABEZADO */}
          <div style={{ background:'white', borderRadius:'14px', padding:'24px', border:'1px solid #F0F0F0' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'14px' }}>
              <div style={{ display:'flex', gap:'6px', flexWrap:'wrap', alignItems:'center' }}>
                <span style={{ background:'#0F2447', color:'white', fontSize:'13px', fontWeight:700, padding:'4px 12px', borderRadius:'20px' }}>{solicitud.id}</span>
                <Chip label={solicitud.flujo==='A'?'Socio comercial':'Juridica T1'} color={solicitud.flujo==='A'?'#92400E':'#1D4ED8'} bg={solicitud.flujo==='A'?'#FEF3C7':'#EFF6FF'} />
                {solicitud.confidencial && <Chip label="Confidencial" color="#C42A15" bg="#FFF5F5" />}
                {solicitud.prioridad==='Alta' && <Chip label="Urgente" color="#C42A15" bg="#FEE2E2" />}
              </div>
              <span style={{ background:estadoColor[solicitud.estado]?.bg||'#F8F8F8', color:estadoColor[solicitud.estado]?.color||'#888', fontSize:'12px', fontWeight:700, padding:'5px 12px', borderRadius:'10px' }}>
                {solicitud.estado}
              </span>
            </div>
            <h1 style={{ color:'#0F2447', fontSize:'20px', fontWeight:700, margin:'0 0 4px' }}>{solicitud.nombre_empresa || solicitud.nombre || 'Sin nombre'}</h1>
            <p style={{ color:'#888', fontSize:'13px', margin:0 }}>{solicitud.tipo_solicitud} · {solicitud.empresa_t1} · {new Date(solicitud.created_at).toLocaleDateString('es-MX')}</p>
          </div>

          {/* SOLICITANTE */}
          <div style={{ background:'white', borderRadius:'14px', padding:'20px', border:'1px solid #F0F0F0' }}>
            <p style={{ fontSize:'12px', fontWeight:700, color:'#888', textTransform:'uppercase' as any, letterSpacing:'0.05em', margin:'0 0 12px' }}>Solicitante</p>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'8px' }}>
              <Campo label="Nombre" val={solicitud.nombre||'—'} />
              <Campo label="Correo" val={solicitud.correo||'—'} />
              <Campo label="Area" val={solicitud.area||'—'} />
              <Campo label="Empresa T1" val={solicitud.empresa_t1||'—'} />
              <Campo label="Prioridad" val={solicitud.prioridad||'—'} />
              <Campo label="Fecha limite" val={solicitud.fecha_limite ? new Date(solicitud.fecha_limite).toLocaleDateString('es-MX') : null} />
            </div>
            {solicitud.lider_nombre && (
              <div style={{ marginTop:'10px', display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px' }}>
                <Campo label="Lider de area" val={solicitud.lider_nombre} />
                <Campo label="Correo del lider" val={solicitud.lider_correo} />
              </div>
            )}
          </div>

          {/* DOCUMENTO */}
          <div style={{ background:'white', borderRadius:'14px', padding:'20px', border:'1px solid #F0F0F0' }}>
            <p style={{ fontSize:'12px', fontWeight:700, color:'#888', textTransform:'uppercase' as any, letterSpacing:'0.05em', margin:'0 0 12px' }}>Documento</p>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'8px', marginBottom:'10px' }}>
              <Campo label="Tipo de solicitud" val={solicitud.tipo_solicitud||'—'} />
              <Campo label="Idioma" val={solicitud.idioma||'—'} />
              <Campo label="Requiere traduccion" val={solicitud.requiere_traduccion||'—'} />
              {solicitud.idioma_traduccion && <Campo label="Idioma de traduccion" val={solicitud.idioma_traduccion} />}
            </div>
            {solicitud.descripcion && (
              <div style={{ background:'#F8F8F8', borderRadius:'8px', padding:'12px 14px', marginBottom:'8px' }}>
                <p style={{ fontSize:'10px', color:'#888', margin:'0 0 4px' }}>Que necesita del area legal</p>
                <p style={{ fontSize:'13px', color:'#0F2447', margin:0, lineHeight:1.6 }}>{solicitud.descripcion}</p>
              </div>
            )}
          </div>

          {/* CONTRAPARTE */}
          <div style={{ background:'white', borderRadius:'14px', padding:'20px', border:'1px solid #F0F0F0' }}>
            <p style={{ fontSize:'12px', fontWeight:700, color:'#888', textTransform:'uppercase' as any, letterSpacing:'0.05em', margin:'0 0 12px' }}>Contraparte</p>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'8px' }}>
              <Campo label="Empresa" val={solicitud.nombre_empresa||'—'} />
              <Campo label="RFC" val={solicitud.rfc||'—'} />
              <Campo label="Apoderado legal" val={solicitud.apoderado||'—'} />
              <Campo label="Nacionalidad" val={solicitud.nacionalidad||'—'} />
              <Campo label="Contrato previo" val={solicitud.tiene_contrato_previo||'—'} />
            </div>
            {solicitud.nacionalidad && solicitud.nacionalidad !== 'Mexicana' && (
              <div style={{ marginTop:'10px', background:'#EFF6FF', borderRadius:'8px', padding:'10px 14px', border:'1px solid #BFDBFE' }}>
                <p style={{ fontSize:'12px', color:'#1D4ED8', fontWeight:700, margin:0 }}>Contraparte internacional — Requiere documentacion adicional</p>
              </div>
            )}
          </div>

          {/* CONDICIONES */}
          {(solicitud.vigencia || solicitud.contraprestacion || solicitud.plazo_pago || solicitud.tipo_firma || solicitud.condiciones_especiales) && (
            <div style={{ background:'white', borderRadius:'14px', padding:'20px', border:'1px solid #F0F0F0' }}>
              <p style={{ fontSize:'12px', fontWeight:700, color:'#888', textTransform:'uppercase' as any, letterSpacing:'0.05em', margin:'0 0 12px' }}>Condiciones comerciales</p>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'8px', marginBottom:'10px' }}>
                <Campo label="Vigencia" val={solicitud.vigencia||null} />
                <Campo label="Contraprestacion" val={solicitud.contraprestacion||null} />
                <Campo label="Plazo de pago" val={solicitud.plazo_pago ? `${solicitud.plazo_pago} dias ${solicitud.tipo_dias_pago||''}` : null} />
                <Campo label="Tipo de firma" val={solicitud.tipo_firma||null} />
                <Campo label="Plataforma de firma" val={solicitud.plataforma_firma||null} />
              </div>
              {solicitud.condiciones_especiales && (
                <div style={{ background:'#FFFBEB', borderRadius:'8px', padding:'12px 14px', border:'1px solid #FDE68A' }}>
                  <p style={{ fontSize:'10px', color:'#92400E', margin:'0 0 4px' }}>Condiciones especiales</p>
                  <p style={{ fontSize:'13px', color:'#0F2447', margin:0, lineHeight:1.6 }}>{solicitud.condiciones_especiales}</p>
                </div>
              )}
            </div>
          )}

          {/* DOCUMENTOS */}
          <div style={{ background:'white', borderRadius:'14px', padding:'20px', border:'1px solid #F0F0F0' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'12px' }}>
              <p style={{ fontSize:'12px', fontWeight:700, color:'#888', textTransform:'uppercase' as any, letterSpacing:'0.05em', margin:0 }}>Documentos en expediente</p>
              <span style={{ background:documentos.length>0?'#ECFDF5':'#F8F8F8', color:documentos.length>0?'#065F46':'#888', fontSize:'11px', fontWeight:700, padding:'3px 9px', borderRadius:'10px' }}>
                {documentos.length} archivo(s)
              </span>
            </div>
            {documentos.length === 0 ? (
              <p style={{ color:'#888', fontSize:'13px', margin:0 }}>Sin documentos subidos aun.</p>
            ) : documentos.map((doc,i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:'10px', padding:'9px 12px', background:'#F8F8F8', borderRadius:'8px', marginBottom:'5px' }}>
                <span style={{ fontSize:'14px' }}>📄</span>
                <span style={{ flex:1, fontSize:'12px', color:'#0F2447' }}>{doc.name.replace(/^\d+_/, '')}</span>
                <span style={{ fontSize:'11px', color:'#888', marginRight:'8px' }}>{doc.carpeta}</span>
                <button onClick={() => verDocumento(doc)}
                  style={{ background:'#0F2447', color:'white', border:'none', padding:'4px 10px', borderRadius:'6px', fontSize:'11px', fontWeight:700, cursor:'pointer', marginRight:'4px' }}>Ver</button>
                <button onClick={async () => {
                  try {
                    const url = await obtenerUrlDocumento(id, doc.name)
                    const resp = await fetch(url)
                    const blob = await resp.blob()
                    const blobUrl = URL.createObjectURL(blob)
                    const a = document.createElement('a')
                    a.href = blobUrl
                    a.download = doc.name
                    document.body.appendChild(a)
                    a.click()
                    document.body.removeChild(a)
                    URL.revokeObjectURL(blobUrl)
                  } catch(e) { alert('Error al descargar') }
                }}
                  style={{ background:'white', color:'#0F2447', border:'1px solid #E8E8E8', padding:'4px 10px', borderRadius:'6px', fontSize:'11px', fontWeight:700, cursor:'pointer' }}>Descargar</button>
              </div>
            ))}
          </div>

          {/* HISTORIAL */}
          <div style={{ background:'white', borderRadius:'14px', padding:'24px', border:'1px solid #F0F0F0' }}>
            <p style={{ fontSize:'12px', fontWeight:700, color:'#888', textTransform:'uppercase' as any, letterSpacing:'0.05em', margin:'0 0 20px' }}>Expediente cronologico</p>
            {(() => {
              const ordenEtapas = ['Pendiente','En revision','En negociacion','Lista para firma','Cerrado']
              const norm = (s:string) => s?.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
              const configEtapa: Record<string,any> = {
                'Pendiente':        { label:'Solicitud recibida',  icono:'📋', color:'#0F2447', bg:'#F8F8F8',  border:'#E8E8E8' },
                'En revision':      { label:'En revision',         icono:'🔍', color:'#1D4ED8', bg:'#EFF6FF',  border:'#BFDBFE' },
                'En negociacion':   { label:'En negociacion',      icono:'🤝', color:'#7C3AED', bg:'#F3E8FF',  border:'#DDD6FE' },
                'Lista para firma': { label:'Lista para firma',    icono:'✍️', color:'#065F46', bg:'#ECFDF5',  border:'#6EE7B7' },
                'Cerrado':          { label:'Cerrado',             icono:'✅', color:'#166534', bg:'#F0FDF4',  border:'#BBF7D0' },
              }
              const estadoActual = solicitud.estado
              const idxActual = ordenEtapas.findIndex(e => norm(e) === norm(estadoActual))
              // Mostrar etapas que tienen eventos EN TRACKING o es la etapa actual
              const etapasVistas = ordenEtapas.filter((e:string) => {
                if (norm(e) === norm(estadoActual)) return true
                return tracking.some((t:any) => {
                  const n = norm(t.estado)
                  const en = norm(e)
                  if (en === 'en revision') return n === 'en revision' || n.includes('solicitud de informacion') || n.includes('informacion recibida') || n.includes('retorno')
                  return n === en
                })
              })

              return (
                <div style={{ position:'relative' as any }}>
                  <div style={{ position:'absolute' as any, left:'15px', top:0, bottom:0, width:'2px', background:'#F0F0F0' }} />
                  {etapasVistas.map((etapaKey, idx) => {
                    const cfg = configEtapa[etapaKey]
                    const activa = norm(etapaKey) === norm(estadoActual)
                    const etapasRelacionadas = norm(etapaKey) === 'en revision'
                      ? ['en revision','solicitud de informacion enviada','informacion recibida']
                      : [norm(etapaKey)]
                    const eventosEtapa = tracking
                      .filter((t:any) => etapasRelacionadas.includes(norm(t.estado)))
                      .sort((a:any,b:any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
                      .filter((t:any, i:number, arr:any[]) => {
                        if (t.estado !== 'En revision') return true
                        return i === arr.findIndex((x:any) => x.estado === 'En revision')
                      })
                    const fechaInicio = eventosEtapa.length > 0
                      ? new Date(eventosEtapa[0].created_at).toLocaleDateString('es-MX', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' })
                      : '—'
                    const esRetorno = tracking.filter((t:any) => t.estado?.includes('Retorno') && t.nota?.includes(etapaKey)).length > 0
                    return (
                      <div key={idx} style={{ display:'flex', gap:'14px', marginBottom:'16px', position:'relative' as any, zIndex:1 }}>
                        <div style={{ width:'32px', height:'32px', borderRadius:'50%', background:cfg.color, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'14px', flexShrink:0, border:'2px solid white', boxShadow: activa?`0 0 0 3px ${cfg.color}50`:'none' }}>
                          {cfg.icono}
                        </div>
                        <div style={{ flex:1, background:cfg.bg, borderRadius:'10px', padding:'14px 16px', border:`1px solid ${cfg.border}` }}>
                          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: eventosEtapa.length>0?'10px':'0' }}>
                            <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                              <p style={{ fontSize:'13px', fontWeight:700, color:cfg.color, margin:0 }}>{cfg.label}</p>
                              {activa && <span style={{ fontSize:'10px', background:cfg.color, color:'white', padding:'2px 8px', borderRadius:'10px' }}>En progreso</span>}
                              {esRetorno && <span style={{ fontSize:'10px', background:'#FEE2E2', color:'#991B1B', padding:'2px 8px', borderRadius:'10px' }}>Retorno</span>}
                            </div>
                            <p style={{ fontSize:'11px', color:'#888', margin:0 }}>{fechaInicio}</p>
                          </div>
                          {eventosEtapa.length > 0 && (
                            <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
                              {eventosEtapa.map((t:any, j:number) => {
                                const esEnvio = norm(t.estado) === 'solicitud de informacion enviada'
                                const esRespuesta = norm(t.estado) === 'informacion recibida'
                                const esRetornoItem = t.estado?.toLowerCase().includes('retorno')
                                const tieneDetalle = (esEnvio || esRespuesta) && t.nota
                                const keyExp = `${idx}-${j}`
                                return (
                                  <div key={j} style={{ background:'white', borderRadius:'8px', padding:'10px 12px', border:`1px solid ${cfg.border}` }}>
                                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                                      <p style={{ fontSize:'12px', fontWeight:600, color: esEnvio?'#1D4ED8':esRespuesta?'#065F46':esRetornoItem?'#991B1B':'#0F2447', margin:0 }}>
                                        {esEnvio ? '📤 Se solicito informacion' : esRespuesta ? '📥 Solicitante respondio' : esRetornoItem ? `🔄 ${t.nota?.split('—')[0] || t.estado}` : `• ${t.nota?.split('.')[0] || t.estado}`}
                                      </p>
                                      <p style={{ fontSize:'10px', color:'#aaa', margin:0 }}>{new Date(t.created_at).toLocaleDateString('es-MX', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' })}</p>
                                    </div>
                                    {tieneDetalle && (
                                      <div style={{ marginTop:'6px' }}>
                                        <button onClick={() => setTrackingExpandido((prev:any) => ({...prev, [keyExp]: !prev[keyExp]}))}
                                          style={{ background:'none', border:'none', color:cfg.color, cursor:'pointer', fontSize:'11px', padding:0, fontWeight:600 }}>
                                          {(trackingExpandido as any)[keyExp] ? 'Ocultar ▲' : 'Ver detalle ▼'}
                                        </button>
                                        {(trackingExpandido as any)[keyExp] && (
                                          <div style={{ marginTop:'6px', paddingTop:'6px', borderTop:`1px solid ${cfg.border}` }}>
                                            {t.nota.split('. ').filter((l:string) => l.trim()).map((linea:string, k:number) => (
                                              <p key={k} style={{ fontSize:'11px', color:'#555', margin:'0 0 3px', lineHeight:1.5 }}>
                                                {linea.includes('Documentos pedidos')||linea.includes('Documentos subidos') ? '📄 ' : linea.includes('Preguntas')||linea.includes('Respuestas') ? '❓ ' : linea.includes('Pendientes') ? '⏳ ' : '• '}
                                                {linea.trim()}
                                              </p>
                                            ))}
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                )
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )
            })()}
          </div>

                    {/* SOLICITAR INFO */}
          <div style={{ background:'white', borderRadius:'14px', padding:'20px', border:'1px solid #F0F0F0' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'12px' }}>
              <p style={{ fontSize:'12px', fontWeight:700, color:'#888', textTransform:'uppercase' as any, letterSpacing:'0.05em', margin:0 }}>Solicitar informacion faltante</p>
              {emailEnviado && <span style={{ fontSize:'12px', color:'#065F46', fontWeight:600 }}>✓ Email enviado</span>}
            </div>
            {!mostrarEmailForm ? (
              <button onClick={() => setMostrarEmailForm(true)}
                style={{ background:'#FFF5F5', color:'#E8321A', border:'1px solid #FCA5A5', padding:'9px 16px', borderRadius:'8px', fontSize:'13px', fontWeight:700, cursor:'pointer' }}>
                Pedir documentos al solicitante →
              </button>
            ) : (
              <div>
                <p style={{ fontSize:'12px', color:'#888', margin:'0 0 8px' }}>Email para: <strong>{solicitud.correo||'sin correo'}</strong></p>
                <p style={{ fontSize:'11px', fontWeight:700, color:'#888', textTransform:'uppercase' as any, letterSpacing:'0.05em', margin:'0 0 6px' }}>Documentos faltantes</p>
                {docsFaltantes.map((doc, i) => (
                  <div key={i} style={{ display:'flex', gap:'6px', marginBottom:'6px', alignItems:'center' }}>
                    <span style={{ background:'#0F2447', color:'white', fontSize:'10px', fontWeight:700, width:'20px', height:'20px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>{i+1}</span>
                    <input value={doc} onChange={e => setDocsFaltantes(prev => prev.map((d,j) => j===i ? e.target.value : d))}
                      placeholder="Ej: Acta constitutiva"
                      style={{ flex:1, padding:'8px 12px', borderRadius:'8px', border:'1.5px solid #E8E8E8', fontSize:'12px', outline:'none', color:'#0F2447' }} />
                    <button onClick={() => setDocsFaltantes(prev => prev.filter((_,j) => j!==i))}
                      style={{ background:'none', border:'none', color:'#aaa', cursor:'pointer', fontSize:'16px' }}>✕</button>
                  </div>
                ))}
                <button onClick={() => setDocsFaltantes(prev => [...prev, ''])}
                  style={{ background:'#F8F8F8', border:'1px dashed #E8E8E8', color:'#0F2447', padding:'7px 14px', borderRadius:'8px', fontSize:'12px', cursor:'pointer', marginBottom:'14px', width:'100%' }}>
                  + Agregar documento
                </button>
                <p style={{ fontSize:'11px', fontWeight:700, color:'#888', textTransform:'uppercase' as any, letterSpacing:'0.05em', margin:'0 0 8px' }}>Preguntas (opcional)</p>
                {preguntas.map((preg, i) => (
                  <div key={i} style={{ display:'flex', gap:'6px', marginBottom:'6px', alignItems:'center' }}>
                    <span style={{ background:'#1D4ED8', color:'white', fontSize:'10px', fontWeight:700, width:'20px', height:'20px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>{i+1}</span>
                    <input value={preg} onChange={e => setPreguntas(prev => prev.map((p,j) => j===i ? e.target.value : p))}
                      placeholder="Ej: ¿Cual es el plazo de vigencia?"
                      style={{ flex:1, padding:'8px 12px', borderRadius:'8px', border:'1.5px solid #E8E8E8', fontSize:'12px', outline:'none', color:'#0F2447' }} />
                    <button onClick={() => setPreguntas(prev => prev.filter((_,j) => j!==i))}
                      style={{ background:'none', border:'none', color:'#aaa', cursor:'pointer', fontSize:'16px' }}>✕</button>
                  </div>
                ))}
                <button onClick={() => setPreguntas(prev => [...prev, ''])}
                  style={{ background:'#F0F7FF', border:'1px dashed #BFDBFE', color:'#1D4ED8', padding:'7px 14px', borderRadius:'8px', fontSize:'12px', cursor:'pointer', marginBottom:'8px', width:'100%' }}>
                  + Agregar pregunta
                </button>
                <div style={{ display:'flex', gap:'8px' }}>
                  <button onClick={enviarEmailFaltantes} disabled={enviandoEmail || docsFaltantes.filter(d=>d.trim()).length===0}
                    style={{ background:'#0F2447', color:'white', border:'none', padding:'9px 18px', borderRadius:'8px', fontSize:'13px', fontWeight:700, cursor:'pointer', opacity:(docsFaltantes.filter((d:string)=>d.trim()).length===0||enviandoEmail)?0.5:1 }}>
                    {enviandoEmail?'Enviando...':'Enviar'}
                  </button>
                  <button onClick={() => setMostrarEmailForm(false)}
                    style={{ background:'white', color:'#888', border:'1px solid #E8E8E8', padding:'9px 16px', borderRadius:'8px', fontSize:'13px', cursor:'pointer' }}>
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* COLUMNA DERECHA */}
        <div style={{ display:'flex', flexDirection:'column', gap:'14px', position:'sticky' as any, top:'24px' }}>
          <div style={{ background:'white', borderRadius:'14px', padding:'20px', border:'1px solid #F0F0F0' }}>
            <div style={{ background:estadoColor[solicitud.estado]?.bg||'#F8F8F8', borderRadius:'10px', padding:'12px', marginBottom:'14px' }}>
              <p style={{ fontSize:'10px', color:'#888', margin:'0 0 2px' }}>Estado actual</p>
              <p style={{ fontSize:'14px', fontWeight:700, color:estadoColor[solicitud.estado]?.color||'#888', margin:'0 0 2px' }}>{solicitud.estado}</p>
              <p style={{ fontSize:'11px', color:'#888', margin:0 }}>{estadoDescripcion[solicitud.estado]||''}</p>
            </div>
            <p style={{ fontSize:'11px', fontWeight:700, color:'#888', textTransform:'uppercase' as any, letterSpacing:'0.05em', margin:'0 0 8px' }}>Mover a</p>
            <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
              {estados.filter(e => e !== solicitud.estado).map((e,i) => (
                <button key={i} onClick={() => cambiarEstado(e)} disabled={actualizando}
                  style={{ background:'white', color:'#0F2447', border:'1px solid #E8E8E8', padding:'8px 12px', borderRadius:'8px', fontSize:'12px', fontWeight:600, cursor:'pointer', textAlign:'left' as any, opacity:actualizando?0.6:1 }}>
                  {e} →
                </button>
              ))}
            </div>
          </div>
          <div style={{ background:'white', borderRadius:'14px', padding:'20px', border:'1px solid #F0F0F0' }}>
            <p style={{ fontSize:'11px', fontWeight:700, color:'#888', textTransform:'uppercase' as any, letterSpacing:'0.05em', margin:'0 0 10px' }}>Ir a</p>
            <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
              <button onClick={() => window.location.href=`/dashboard/expediente?buscar=${solicitud.id}`}
                style={{ background:'#0F2447', color:'white', border:'none', padding:'10px', borderRadius:'8px', fontSize:'13px', fontWeight:700, cursor:'pointer' }}>
                Ver expediente →
              </button>
              <button onClick={() => window.location.href=`/dashboard/editor/${solicitud.id}`}
                style={{ background:'white', color:'#0F2447', border:'1px solid #E8E8E8', padding:'10px', borderRadius:'8px', fontSize:'13px', fontWeight:700, cursor:'pointer' }}>
                Abrir en editor →
              </button>
              <button onClick={() => window.location.href=`/dashboard/negociacion/${solicitud.id}`}
                style={{ background:'white', color:'#7C3AED', border:'1px solid #E8E8E8', padding:'10px', borderRadius:'8px', fontSize:'13px', fontWeight:700, cursor:'pointer' }}>
                Ver negociacion →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
