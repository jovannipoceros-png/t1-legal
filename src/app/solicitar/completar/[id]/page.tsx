'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { obtenerSolicitudes, subirDocumento, actualizarEstado } from '@/lib/supabase/solicitudes'

export default function CompletarSolicitud() {
  const params = useParams()
  const id = params.id as string
  const [solicitud, setSolicitud] = useState<any>(null)
  const [cargando, setCargando] = useState(true)
  const [enviado, setEnviado] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [docsSubidos, setDocsSubidos] = useState<Record<string,File|null>>({})
  const [respuestas, setRespuestas] = useState<Record<string,string>>({})
  const [docs, setDocs] = useState<string[]>([])
  const [pregs, setPregs] = useState<string[]>([])

  useEffect(() => {
    const cargar = async () => {
      try {
        const params_url = new URLSearchParams(window.location.search)
        const docsParam = params_url.get('docs') || ''
        const preguntasParam = params_url.get('preguntas') || ''
        setDocs(docsParam.split('|').filter(Boolean))
        setPregs(preguntasParam.split('|').filter(Boolean))
        const data = await obtenerSolicitudes()
        const encontrada = (data||[]).find((s:any) => s.id === id)
        setSolicitud(encontrada || null)
      } catch(e) { console.error(e) }
      setCargando(false)
    }
    cargar()
  }, [id])

  const handleSubir = (docNombre: string, file: File | null) => {
    setDocsSubidos(prev => ({ ...prev, [docNombre]: file }))
  }

  const enviar = async () => {
    setEnviando(true)
    try {
      for (const [nombre, file] of Object.entries(docsSubidos)) {
        if (file) await subirDocumento(id, file)
      }

      const docsSubidosLista = Object.keys(docsSubidos).filter(k => docsSubidos[k])
      const docsPendientes = docs.filter(d => !docsSubidos[d])
      const preguntasSinResponder = pregs.filter(p => !respuestas[p]?.trim())

      const res = await fetch('/api/completar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          nombre: solicitud?.nombre || 'Solicitante',
          correo: solicitud?.correo || '',
          docsSubidos: docsSubidosLista,
          docsPendientes,
          respuestas,
          preguntasSinResponder
        })
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setEnviado(true)
    } catch(e: any) {
      alert('Error al enviar: ' + e.message)
    }
    setEnviando(false)
  }

  if (cargando) return (
    <div style={{ minHeight:'100vh', background:'#F8F8F8', fontFamily:'sans-serif', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <p style={{ color:'#888' }}>Cargando...</p>
    </div>
  )

  if (!solicitud) return (
    <div style={{ minHeight:'100vh', background:'#F8F8F8', fontFamily:'sans-serif', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <p style={{ color:'#888' }}>No se encontro la solicitud {id}</p>
    </div>
  )

  if (enviado) return (
    <div style={{ minHeight:'100vh', background:'#F8F8F8', fontFamily:'sans-serif', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ background:'white', borderRadius:'16px', padding:'40px', maxWidth:'480px', width:'100%', textAlign:'center', border:'1px solid #F0F0F0' }}>
        <div style={{ width:'56px', height:'56px', borderRadius:'50%', background:'#F0FDF4', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px', fontSize:'24px' }}>✓</div>
        <h2 style={{ color:'#0F2447', fontSize:'18px', fontWeight:700, margin:'0 0 8px' }}>Informacion enviada correctamente</h2>
        <p style={{ color:'#888', fontSize:'13px', margin:'0 0 20px' }}>El area legal recibio tus documentos y respuestas. Te notificaremos cuando avance tu solicitud.</p>
        <div style={{ background:'#F8F8F8', borderRadius:'10px', padding:'14px', textAlign:'left', marginBottom:'16px' }}>
          <p style={{ fontSize:'12px', color:'#555', margin:'0 0 4px' }}>Expediente: <strong style={{ color:'#0F2447' }}>{id}</strong></p>
          <p style={{ fontSize:'12px', color:'#555', margin:'0 0 4px' }}>Documentos subidos: <strong style={{ color:'#0F2447' }}>{Object.values(docsSubidos).filter(Boolean).length} de {docs.length}</strong></p>
          <p style={{ fontSize:'12px', color:'#555', margin:0 }}>Preguntas respondidas: <strong style={{ color:'#0F2447' }}>{Object.values(respuestas).filter(v=>v.trim()).length} de {pregs.length}</strong></p>
        </div>
        <p style={{ fontSize:'12px', color:'#888' }}>Puedes regresar a esta pagina para completar lo que falta.</p>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight:'100vh', background:'#F8F8F8', fontFamily:'sans-serif' }}>
      <div style={{ background:'#0F2447', padding:'16px 24px', display:'flex', alignItems:'center', gap:'10px' }}>
        <span style={{ background:'#E8321A', color:'white', fontWeight:900, fontSize:'16px', padding:'2px 10px', borderRadius:'5px' }}>T1</span>
        <span style={{ color:'white', fontWeight:700, fontSize:'15px' }}>Legal — Completar informacion</span>
      </div>

      <div style={{ maxWidth:'560px', margin:'32px auto', padding:'0 16px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'20px', background:'white', borderRadius:'10px', padding:'12px 16px', border:'1px solid #F0F0F0' }}>
          <span style={{ background:'#0F2447', color:'white', fontSize:'11px', fontWeight:700, padding:'2px 8px', borderRadius:'20px' }}>{id}</span>
          <span style={{ fontSize:'13px', color:'#0F2447', fontWeight:600 }}>{solicitud.nombre_empresa || solicitud.nombre || 'Sin nombre'} — {solicitud.tipo_solicitud}</span>
        </div>

        {docs.length > 0 && (
          <div style={{ background:'white', borderRadius:'14px', padding:'20px', border:'1px solid #F0F0F0', marginBottom:'16px' }}>
            <h3 style={{ color:'#0F2447', fontSize:'14px', fontWeight:700, margin:'0 0 4px' }}>Documentos solicitados</h3>
            <p style={{ color:'#888', fontSize:'12px', margin:'0 0 16px' }}>Sube cada documento en su espacio. Se guardaran directo en tu expediente.</p>
            {docs.map((doc, i) => (
              <div key={i} style={{ border:'1px solid #F0F0F0', borderRadius:'10px', padding:'14px', marginBottom:'10px', background:'#FAFAFA' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'10px' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                    <span style={{ background:'#0F2447', color:'white', fontSize:'10px', fontWeight:700, width:'20px', height:'20px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>{i+1}</span>
                    <span style={{ fontSize:'13px', fontWeight:600, color:'#0F2447' }}>{doc}</span>
                  </div>
                  {docsSubidos[doc] ? (
                    <span style={{ background:'#F0FDF4', color:'#065F46', fontSize:'10px', fontWeight:700, padding:'2px 8px', borderRadius:'10px' }}>Subido ✓</span>
                  ) : (
                    <span style={{ background:'#FFF5F5', color:'#991B1B', fontSize:'10px', fontWeight:700, padding:'2px 8px', borderRadius:'10px' }}>Pendiente</span>
                  )}
                </div>
                {docsSubidos[doc] ? (
                  <div style={{ display:'flex', alignItems:'center', gap:'8px', padding:'8px 10px', background:'#F0FDF4', borderRadius:'8px' }}>
                    <span style={{ fontSize:'14px' }}>📄</span>
                    <span style={{ fontSize:'12px', color:'#065F46', flex:1 }}>{docsSubidos[doc]?.name}</span>
                    <button onClick={() => handleSubir(doc, null)} style={{ background:'none', border:'none', color:'#888', cursor:'pointer', fontSize:'11px' }}>Cambiar</button>
                  </div>
                ) : (
                  <label style={{ display:'block', border:'1.5px dashed #E8E8E8', borderRadius:'8px', padding:'16px', textAlign:'center', cursor:'pointer', background:'white' }}>
                    <div style={{ fontSize:'24px', marginBottom:'6px' }}>📎</div>
                    <p style={{ color:'#0F2447', fontWeight:600, fontSize:'13px', margin:'0 0 2px' }}>Haz clic para subir</p>
                    <p style={{ color:'#888', fontSize:'11px', margin:0 }}>PDF, Word, Excel, imagenes y mas</p>
                    <input type="file" style={{ display:'none' }} onChange={e => handleSubir(doc, e.target.files?.[0] || null)} />
                  </label>
                )}
              </div>
            ))}
          </div>
        )}

        {pregs.length > 0 && (
          <div style={{ background:'white', borderRadius:'14px', padding:'20px', border:'1px solid #F0F0F0', marginBottom:'16px' }}>
            <h3 style={{ color:'#0F2447', fontSize:'14px', fontWeight:700, margin:'0 0 4px' }}>Preguntas del area legal</h3>
            <p style={{ color:'#888', fontSize:'12px', margin:'0 0 16px' }}>Responde cada pregunta para continuar con tu solicitud.</p>
            {pregs.map((preg, i) => (
              <div key={i} style={{ border:'1px solid #F0F0F0', borderRadius:'10px', padding:'14px', marginBottom:'10px', background:'#FAFAFA' }}>
                <div style={{ display:'flex', alignItems:'flex-start', gap:'8px', marginBottom:'10px' }}>
                  <span style={{ background:'#1D4ED8', color:'white', fontSize:'10px', fontWeight:700, width:'20px', height:'20px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, marginTop:'1px' }}>{i+1}</span>
                  <p style={{ fontSize:'13px', fontWeight:600, color:'#0F2447', margin:0 }}>{preg}</p>
                </div>
                <textarea
                  value={respuestas[preg] || ''}
                  onChange={e => setRespuestas(prev => ({ ...prev, [preg]: e.target.value }))}
                  placeholder="Escribe tu respuesta aqui..."
                  style={{ width:'100%', padding:'10px', borderRadius:'8px', border:`1.5px solid ${respuestas[preg]?.trim()?'#22C55E':'#E8E8E8'}`, fontSize:'12px', color:'#0F2447', resize:'vertical', outline:'none', fontFamily:'sans-serif', minHeight:'60px', boxSizing:'border-box' as any }}
                />
              </div>
            ))}
          </div>
        )}

        <div style={{ background:'#FFF5F5', borderRadius:'10px', padding:'12px 16px', marginBottom:'16px', border:'1px solid #FFD0CC' }}>
          <p style={{ fontSize:'12px', color:'#C42A15', margin:0 }}>🔒 Documentos almacenados de forma segura. Solo el area legal de T1 tiene acceso.</p>
        </div>

        <button onClick={enviar} disabled={enviando}
          style={{ width:'100%', background:'#0F2447', color:'white', border:'none', padding:'14px', borderRadius:'10px', fontSize:'14px', fontWeight:700, cursor:enviando?'not-allowed':'pointer', opacity:enviando?0.7:1 }}>
          {enviando ? 'Enviando...' : 'Enviar al area legal →'}
        </button>
      </div>
    </div>
  )
}
