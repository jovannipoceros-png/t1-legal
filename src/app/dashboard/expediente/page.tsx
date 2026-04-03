'use client'
import { useState } from 'react'
import { obtenerSolicitudes, obtenerTracking } from '@/lib/supabase/solicitudes'

export default function Expediente() {
  const [busqueda, setBusqueda] = useState('')
  const [expediente, setExpediente] = useState<any>(null)
  const [tracking, setTracking] = useState<any[]>([])
  const [resultados, setResultados] = useState<any[]>([])
  const [buscando, setBuscando] = useState(false)

  const buscar = async () => {
    if (!busqueda.trim()) return
    setBuscando(true)
    try {
      const data = await obtenerSolicitudes()
      const filtrados = (data||[]).filter((s: any) =>
        s.id.toLowerCase().includes(busqueda.toLowerCase()) ||
        (s.nombre_empresa||'').toLowerCase().includes(busqueda.toLowerCase()) ||
        (s.nombre||'').toLowerCase().includes(busqueda.toLowerCase())
      )
      setResultados(filtrados)
      if (filtrados.length === 1) await abrirExpediente(filtrados[0])
    } finally {
      setBuscando(false)
    }
  }

  const abrirExpediente = async (s: any) => {
    setExpediente(s)
    const t = await obtenerTracking(s.id)
    setTracking(t||[])
    setResultados([])
  }

  const pasos = ['Pendiente','En revision','En negociacion','Lista para firma','Cerrado']
  const pasoActual = expediente ? pasos.indexOf(expediente.estado) : 0

  const carpetas = ['01 Solicitud','02 Documentos','03 Analisis Legal','04 Negociacion','05 Firma — Cargar contrato firmado']

  return (
    <div style={{ padding:'32px', fontFamily:'sans-serif' }}>
      <h1 style={{ color:'#0F2447', fontSize:'24px', fontWeight:700, margin:'0 0 4px' }}>Expediente Digital</h1>
      <p style={{ color:'#888', margin:'0 0 24px' }}>Busca por ID, empresa o nombre del solicitante</p>

      <div style={{ display:'flex', gap:'10px', marginBottom:'24px' }}>
        <input value={busqueda} onChange={e => setBusqueda(e.target.value)} onKeyDown={e => e.key==='Enter' && buscar()}
          placeholder="Buscar por ID (C-2026-001), empresa o nombre..."
          style={{ flex:1, padding:'12px 16px', borderRadius:'10px', border:'1.5px solid #E8E8E8', fontSize:'14px', outline:'none', color:'#0F2447' }} />
        <button onClick={buscar} disabled={buscando}
          style={{ background:'#E8321A', color:'white', border:'none', padding:'12px 24px', borderRadius:'10px', fontSize:'14px', fontWeight:700, cursor:'pointer' }}>
          {buscando ? 'Buscando...' : 'Buscar'}
        </button>
      </div>

      {resultados.length > 1 && (
        <div style={{ background:'white', borderRadius:'12px', padding:'20px', boxShadow:'0 1px 4px rgba(0,0,0,0.06)', marginBottom:'20px', border:'1px solid #F0F0F0' }}>
          <p style={{ color:'#0F2447', fontSize:'13px', fontWeight:700, margin:'0 0 12px' }}>{resultados.length} expedientes encontrados:</p>
          {resultados.map((s,i) => (
            <div key={i} onClick={() => abrirExpediente(s)}
              style={{ display:'flex', alignItems:'center', gap:'12px', padding:'10px', borderRadius:'8px', cursor:'pointer', border:'1px solid #F0F0F0', marginBottom:'6px', background:'#FAFAFA' }}>
              <span style={{ background:'#0F2447', color:'white', fontSize:'11px', fontWeight:700, padding:'2px 8px', borderRadius:'10px' }}>{s.id}</span>
              <span style={{ color:'#0F2447', fontSize:'13px', fontWeight:600 }}>{s.nombre_empresa||s.nombre||'Sin nombre'}</span>
              <span style={{ color:'#888', fontSize:'12px' }}>{s.tipo_solicitud} · {s.empresa_t1}</span>
              <span style={{ background:s.estado==='Cerrado'?'#F0FDF4':'#FEF3C7', color:s.estado==='Cerrado'?'#166534':'#92400E', fontSize:'11px', fontWeight:700, padding:'2px 8px', borderRadius:'10px', marginLeft:'auto' }}>{s.estado}</span>
            </div>
          ))}
        </div>
      )}

      {expediente && (
        <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:'24px' }}>
          <div>
            <div style={{ background:'white', borderRadius:'16px', padding:'24px', boxShadow:'0 1px 4px rgba(0,0,0,0.06)', border:'1px solid #F0F0F0', marginBottom:'20px' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'20px' }}>
                <div>
                  <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'8px', flexWrap:'wrap' }}>
                    <span style={{ background:'#0F2447', color:'white', fontSize:'13px', fontWeight:700, padding:'3px 12px', borderRadius:'20px' }}>{expediente.id}</span>
                    <span style={{ background:expediente.flujo==='A'?'#FEF3C7':'#EFF6FF', color:expediente.flujo==='A'?'#92400E':'#1D4ED8', fontSize:'11px', fontWeight:700, padding:'2px 8px', borderRadius:'10px' }}>
                      {expediente.flujo==='A'?'Documento del socio':'Documento T1'}
                    </span>
                    {expediente.confidencial && <span style={{ background:'#FFF5F5', color:'#C42A15', fontSize:'11px', fontWeight:700, padding:'2px 8px', borderRadius:'10px', border:'1px solid #FFD0CC' }}>Confidencial</span>}
                  </div>
                  <h2 style={{ color:'#0F2447', fontSize:'18px', fontWeight:700, margin:'0 0 4px' }}>{expediente.nombre_empresa||'Sin contraparte'}</h2>
                  <p style={{ color:'#888', fontSize:'13px', margin:0 }}>{expediente.tipo_solicitud} — {expediente.empresa_t1}</p>
                </div>
                <div style={{ display:'flex', gap:'8px' }}>
                  <button style={{ background:'#E8321A', color:'white', border:'none', padding:'8px 16px', borderRadius:'8px', fontSize:'12px', fontWeight:700, cursor:'pointer' }}>Ir al editor</button>
                </div>
              </div>

              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', marginBottom:'20px' }}>
                {[
                  { label:'SOLICITANTE', value:expediente.nombre||'—' },
                  { label:'AREA', value:expediente.area||'—' },
                  { label:'RFC', value:expediente.rfc||'—' },
                  { label:'APODERADO', value:expediente.apoderado||'—' },
                  { label:'VIGENCIA', value:expediente.vigencia||'—' },
                  { label:'PRIORIDAD', value:expediente.prioridad||'—' },
                  { label:'IDIOMA', value:expediente.idioma||'—' },
                  { label:'RESPONSABLE', value:'Jovanni Poceros' },
                ].map((d,i) => (
                  <div key={i} style={{ padding:'10px 14px', background:'#F8F8F8', borderRadius:'8px' }}>
                    <p style={{ color:'#888', fontSize:'10px', fontWeight:700, margin:'0 0 2px' }}>{d.label}</p>
                    <p style={{ color:'#0F2447', fontSize:'13px', fontWeight:600, margin:0 }}>{d.value}</p>
                  </div>
                ))}
              </div>

              <h3 style={{ color:'#0F2447', fontSize:'14px', fontWeight:700, margin:'0 0 16px' }}>Seguimiento del expediente</h3>
              <div style={{ position:'relative', padding:'8px 0 32px', marginBottom:'20px' }}>
                <div style={{ position:'absolute', top:'20px', left:'5%', right:'5%', height:'3px', background:'#F0F0F0' }} />
                <div style={{ position:'absolute', top:'20px', left:'5%', width:`${Math.max(0,(pasoActual/(pasos.length-1))*90)}%`, height:'3px', background:'#E8321A' }} />
                <div style={{ display:'flex', justifyContent:'space-between', position:'relative' }}>
                  {pasos.map((p,j) => (
                    <div key={j} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'8px', width:'20%' }}>
                      <div style={{ width:'28px', height:'28px', borderRadius:'50%', background:j<=pasoActual?'#E8321A':'white', border:`2px solid ${j<=pasoActual?'#E8321A':'#E0E2E6'}`, display:'flex', alignItems:'center', justifyContent:'center', zIndex:1 }}>
                        {j<pasoActual && <span style={{ color:'white', fontSize:'12px', fontWeight:700 }}>✓</span>}
                        {j===pasoActual && <span style={{ width:'8px', height:'8px', background:'white', borderRadius:'50%', display:'block' }} />}
                      </div>
                      <span style={{ fontSize:'10px', color:j<=pasoActual?'#0F2447':'#888', fontWeight:j===pasoActual?700:400, textAlign:'center' }}>{p}</span>
                    </div>
                  ))}
                </div>
              </div>

              <h3 style={{ color:'#0F2447', fontSize:'14px', fontWeight:700, margin:'0 0 14px' }}>Historial completo</h3>
              <div style={{ position:'relative', paddingLeft:'20px' }}>
                <div style={{ position:'absolute', left:'8px', top:0, bottom:0, width:'2px', background:'#F0F0F0' }} />
                <div style={{ position:'relative', marginBottom:'14px' }}>
                  <div style={{ position:'absolute', left:'-16px', top:'4px', width:'10px', height:'10px', borderRadius:'50%', background:'#0F2447' }} />
                  <p style={{ color:'#0F2447', fontSize:'12px', fontWeight:600, margin:'0 0 2px' }}>Solicitud recibida</p>
                  <p style={{ color:'#aaa', fontSize:'11px', margin:0 }}>{new Date(expediente.created_at).toLocaleString('es-MX')} — Sistema</p>
                </div>
                {tracking.map((t,i) => (
                  <div key={i} style={{ position:'relative', marginBottom:'14px' }}>
                    <div style={{ position:'absolute', left:'-16px', top:'4px', width:'10px', height:'10px', borderRadius:'50%', background:'#E8321A' }} />
                    <p style={{ color:'#0F2447', fontSize:'12px', fontWeight:600, margin:'0 0 2px' }}>{t.nota}</p>
                    <p style={{ color:'#aaa', fontSize:'11px', margin:0 }}>{new Date(t.created_at).toLocaleString('es-MX')} — {t.autor}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
            <div style={{ background:'white', borderRadius:'16px', padding:'20px', boxShadow:'0 1px 4px rgba(0,0,0,0.06)', border:'1px solid #F0F0F0' }}>
              <h3 style={{ color:'#0F2447', fontSize:'14px', fontWeight:700, margin:'0 0 14px' }}>Carpetas del expediente</h3>
              {carpetas.map((c,i) => (
                <div key={i} style={{ display:'flex', alignItems:'center', gap:'8px', padding:'8px 10px', borderRadius:'7px', border:'1px solid #F0F0F0', marginBottom:'5px', cursor:'pointer', background:'#FAFAFA' }}>
                  <span style={{ fontSize:'14px' }}>📁</span>
                  <span style={{ color:'#0F2447', fontSize:'12px', fontWeight:500 }}>{c}</span>
                </div>
              ))}
            </div>

            <div style={{ background:'white', borderRadius:'16px', padding:'20px', boxShadow:'0 1px 4px rgba(0,0,0,0.06)', border:'1px solid #F0F0F0' }}>
              <h3 style={{ color:'#0F2447', fontSize:'14px', fontWeight:700, margin:'0 0 14px' }}>Documentos cargados</h3>
              {documentos.length === 0 ? (
                <p style={{ color:'#888', fontSize:'12px', margin:0 }}>Sin documentos adjuntos</p>
              ) : documentos.map((doc: any, i: number) => (
                <div key={i} style={{ display:'flex', alignItems:'center', gap:'10px', padding:'10px', background:'#F8F8F8', borderRadius:'8px', marginBottom:'6px', border:'1px solid #F0F0F0' }}>
                  <span style={{ fontSize:'20px' }}>📄</span>
                  <div style={{ flex:1 }}>
                    <p style={{ color:'#0F2447', fontSize:'12px', fontWeight:600, margin:0 }}>{doc.name.replace(/^d+_/, '')}</p>
                    <p style={{ color:'#888', fontSize:'10px', margin:0 }}>{doc.metadata?.size ? Math.round(doc.metadata.size/1024) + ' KB' : ''}</p>
                  </div>
                  <button onClick={async () => {
                    const url = await obtenerUrlDocumento(expediente.id, doc.name)
                    if (url) window.open(url, '_blank')
                  }} style={{ background:'#0F2447', color:'white', border:'none', padding:'6px 12px', borderRadius:'6px', fontSize:'11px', fontWeight:700, cursor:'pointer' }}>
                    Descargar
                  </button>
                </div>
              ))}
              {expediente.flujo==='A' ? (
                <div style={{ padding:'12px', background:'#FFF8F0', borderRadius:'8px', border:'1px solid #FED7AA', marginBottom:'8px' }}>
                  <p style={{ color:'#92400E', fontSize:'12px', fontWeight:700, margin:'0 0 2px' }}>Contrato del socio comercial</p>
                  <p style={{ color:'#92400E', fontSize:'11px', margin:0 }}>Cargado el {new Date(expediente.created_at).toLocaleDateString('es-MX')}</p>
                </div>
              ) : (
                <p style={{ color:'#888', fontSize:'12px', margin:0 }}>Los documentos se gestionan en el Editor</p>
              )}
              {expediente.tiene_contrato_previo === 'Si' && (
                <div style={{ padding:'12px', background:'#EFF6FF', borderRadius:'8px', border:'1px solid #BFDBFE' }}>
                  <p style={{ color:'#1D4ED8', fontSize:'12px', fontWeight:700, margin:'0 0 2px' }}>Contrato previo adjunto</p>
                  <p style={{ color:'#1D4ED8', fontSize:'11px', margin:0 }}>Referencia para este expediente</p>
                </div>
              )}
            </div>

            <div style={{ background:'white', borderRadius:'16px', padding:'20px', boxShadow:'0 1px 4px rgba(0,0,0,0.06)', border:'1px solid #F0F0F0' }}>
              <h3 style={{ color:'#0F2447', fontSize:'13px', fontWeight:700, margin:'0 0 10px' }}>Acciones rapidas</h3>
              <button style={{ width:'100%', background:'#E8321A', color:'white', border:'none', padding:'10px', borderRadius:'8px', fontSize:'13px', fontWeight:700, cursor:'pointer', marginBottom:'8px' }}>Ir al editor</button>
              <button style={{ width:'100%', background:'#0F2447', color:'white', border:'none', padding:'10px', borderRadius:'8px', fontSize:'13px', fontWeight:700, cursor:'pointer', marginBottom:'8px' }}>Ver negociacion</button>
              <button style={{ width:'100%', background:'white', color:'#0F2447', border:'1px solid #E8E8E8', padding:'10px', borderRadius:'8px', fontSize:'13px', fontWeight:700, cursor:'pointer' }}>Analizar con IA</button>
            </div>
          </div>
        </div>
      )}

      {!expediente && resultados.length === 0 && (
        <div style={{ background:'white', borderRadius:'16px', padding:'48px', boxShadow:'0 1px 4px rgba(0,0,0,0.06)', textAlign:'center', border:'1px solid #F0F0F0' }}>
          <p style={{ fontSize:'32px', marginBottom:'16px' }}>📁</p>
          <p style={{ color:'#0F2447', fontWeight:700, fontSize:'16px', margin:'0 0 8px' }}>Busca un expediente</p>
          <p style={{ color:'#888', fontSize:'13px', margin:0 }}>Escribe el ID o nombre para ver el expediente completo con tracking y documentos</p>
        </div>
      )}
    </div>
  )
}
