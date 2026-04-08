'use client'
import { useState, useEffect } from 'react'

import { obtenerSolicitudes, obtenerTracking, obtenerDocumentos, obtenerUrlDocumento, cerrarExpediente, subirDocumento, crearFirma, obtenerFirma, actualizarFirmantes, guardarFirmanteCatalogo, buscarFirmantesCatalogo } from '@/lib/supabase/solicitudes'

export default function Expediente() {
  const [busqueda, setBusqueda] = useState('')

  const [expediente, setExpediente] = useState<any>(null)
  const [tracking, setTracking] = useState<any[]>([])
  const [documentos, setDocumentos] = useState<any[]>([])
  const [resultados, setResultados] = useState<any[]>([])
  const [buscando, setBuscando] = useState(false)
  const [carpetaAbierta, setCarpetaAbierta] = useState<string|null>(null)
  const [vistaPrevia, setVistaPrevia] = useState<string|null>(null)
  const [vistaNombre, setVistaNombre] = useState('')
  const [cerrandoExp, setCerrandoExp] = useState(false)
  const [firma, setFirma] = useState<any>(null)
  const [configurandoFirma, setConfigurandoFirma] = useState(false)
  const [tipoFirma, setTipoFirma] = useState('Fisica')
  const [plataforma, setPlataforma] = useState('SORA')
  const [firmantes, setFirmantes] = useState<any[]>([])
  const [nNombre, setNNombre] = useState('')
  const [nRol, setNRol] = useState('')
  const [nEmpresa, setNEmpresa] = useState('')
  const [guardandoFirma, setGuardandoFirma] = useState(false)
  const [sugerencias, setSugerencias] = useState<any[]>([])

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
    setResultados([])
    setCarpetaAbierta(null)
    setFirma(null)
    const t = await obtenerTracking(s.id)
    setTracking(t||[])
    const docs = await obtenerDocumentos(s.id)
    setDocumentos(docs||[])
  }

  const abrirCarpeta = async (carpeta: string) => {
    setCarpetaAbierta(carpetaAbierta===carpeta?null:carpeta)
    if (carpeta==='Firma' && carpetaAbierta!=='Firma') {
      const f = await obtenerFirma(expediente.id)
      setFirma(f)
      setConfigurandoFirma(!f)
    }
  }

  const verDocumento = async (doc: any) => {
    const url = await obtenerUrlDocumento(expediente.id, doc.name)
    if (url) { setVistaNombre(doc.name.replace(/^\d+_/, '')); setVistaPrevia(url) }
  }

  const descargarDocumento = async (doc: any) => {
    const url = await obtenerUrlDocumento(expediente.id, doc.name)
    if (url) window.open(url, '_blank')
  }

  const agregarFirmante = () => {
    if (!nNombre) return
    setFirmantes(prev => [...prev, { nombre:nNombre, rol:nRol, empresa:nEmpresa, estado:'pendiente', fecha:null }])
    guardarFirmanteCatalogo(nNombre, nRol, nEmpresa).catch(()=>{})
    setNNombre('')
    setNRol('')
    setNEmpresa('')
  }

  const eliminarFirmante = (i: number) => {
    setFirmantes(prev => prev.filter((_,j) => j!==i))
  }

  const guardarConfigFirma = async () => {
    console.log('firmantes:', firmantes, 'expediente:', expediente?.id)
    if (firmantes.length===0) { alert('Agrega al menos un firmante'); return }
    setGuardandoFirma(true)
    try {
      await crearFirma(expediente.id, tipoFirma, plataforma, firmantes)
      const f = await obtenerFirma(expediente.id)
      setFirma(f)
      setConfigurandoFirma(false)
    } finally {
      setGuardandoFirma(false)
    }
  }

  const marcarFirmado = async (idx: number) => {
    if (!firma) return
    const nuevos = [...firma.firmantes]
    nuevos[idx] = { ...nuevos[idx], estado:'firmado', fecha:new Date().toLocaleString('es-MX') }
    await actualizarFirmantes(expediente.id, nuevos)
    setFirma((prev: any) => ({ ...prev, firmantes:nuevos }))
    const todosfirmaron = nuevos.every((f: any) => f.estado==='firmado')
    if (todosFirmaron) {
      alert('Todos han firmado. Carga el contrato firmado para cerrar el expediente.')
    }
  }

  const handleCargarFirmado = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const archivo = e.target.files?.[0]
    if (!archivo) return
    try {
      await subirDocumento(expediente.id, archivo)
      const confirmar = window.confirm('Contrato firmado cargado. Deseas cerrar el expediente ahora?')
      if (confirmar) {
        setCerrandoExp(true)
        await cerrarExpediente(expediente.id, archivo.name)
        setExpediente((prev: any) => ({...prev, estado:'Cerrado', fecha_cierre:new Date().toISOString()}))
        const t = await obtenerTracking(expediente.id)
        setTracking(t||[])
        const docs = await obtenerDocumentos(expediente.id)
        setDocumentos(docs||[])
        setCerrandoExp(false)
        alert('Expediente cerrado exitosamente')
      }
    } catch(err) {
      alert('Error al cargar el archivo')
      setCerrandoExp(false)
    }
  }

  const pasos = ['Pendiente','En revision','En negociacion','Lista para firma','Cerrado']
  const pasoActual = expediente ? Math.max(0, pasos.indexOf(expediente.estado)) : 0
  const carpetas = ['Solicitud','Documentos','Analisis Legal','Negociacion','Firma']

  const todosFirmaron = firma?.firmantes?.every((f: any) => f.estado==='firmado') || false

  return (
    <div style={{ padding:'32px', fontFamily:'sans-serif' }}>
      {vistaPrevia && (
        <div style={{ position:'fixed', top:0, left:0, right:0, bottom:0, background:'rgba(0,0,0,0.85)', zIndex:1000, display:'flex', flexDirection:'column' }}>
          <div style={{ background:'white', padding:'12px 20px', display:'flex', alignItems:'center', justifyContent:'space-between', borderBottom:'1px solid #F0F0F0' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
              <span style={{ background:'#E8321A', color:'white', fontWeight:900, fontSize:'14px', padding:'2px 10px', borderRadius:'4px' }}>T1</span>
              <p style={{ color:'#0F2447', fontWeight:700, fontSize:'14px', margin:0 }}>{vistaNombre}</p>
            </div>
            <div style={{ display:'flex', gap:'8px' }}>
              <button onClick={() => window.open(vistaPrevia, '_blank')} style={{ background:'#0F2447', color:'white', border:'none', padding:'7px 16px', borderRadius:'7px', fontSize:'13px', fontWeight:700, cursor:'pointer' }}>Descargar</button>
              <button onClick={() => setVistaPrevia(null)} style={{ background:'#E8321A', color:'white', border:'none', padding:'7px 16px', borderRadius:'7px', fontSize:'13px', fontWeight:700, cursor:'pointer' }}>Cerrar X</button>
            </div>
          </div>
          <iframe src={vistaPrevia} style={{ flex:1, border:'none', width:'100%' }} />
        </div>
      )}

      <h1 style={{ color:'#0F2447', fontSize:'24px', fontWeight:700, margin:'0 0 4px' }}>Expediente Digital</h1>
      <p style={{ color:'#888', margin:'0 0 24px' }}>Busca por ID, empresa o nombre del solicitante</p>

      <div style={{ display:'flex', gap:'10px', marginBottom:'24px' }}>
        <input value={busqueda} onChange={e => setBusqueda(e.target.value)} onKeyDown={e => e.key==='Enter' && buscar()} id="input-buscar"
          placeholder="Buscar por ID, empresa o nombre..."
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
              <span style={{ color:'#888', fontSize:'12px' }}>{s.tipo_solicitud}</span>
              <span style={{ background:'#FEF3C7', color:'#92400E', fontSize:'11px', fontWeight:700, padding:'2px 8px', borderRadius:'10px', marginLeft:'auto' }}>{s.estado}</span>
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
                    <span style={{ background:expediente.estado==='Cerrado'?'#F0FDF4':'#FEF3C7', color:expediente.estado==='Cerrado'?'#166534':'#92400E', fontSize:'11px', fontWeight:700, padding:'2px 8px', borderRadius:'10px' }}>{expediente.estado}</span>
                  </div>
                  <h2 style={{ color:'#0F2447', fontSize:'18px', fontWeight:700, margin:'0 0 4px' }}>{expediente.nombre_empresa||'Sin contraparte'}</h2>
                  <p style={{ color:'#888', fontSize:'13px', margin:0 }}>{expediente.tipo_solicitud} — {expediente.empresa_t1}</p>
                </div>
                <button style={{ background:'#E8321A', color:'white', border:'none', padding:'8px 16px', borderRadius:'8px', fontSize:'12px', fontWeight:700, cursor:'pointer' }}>Ir al editor</button>
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

              <h3 style={{ color:'#0F2447', fontSize:'14px', fontWeight:700, margin:'0 0 16px' }}>Seguimiento</h3>
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

              <h3 style={{ color:'#0F2447', fontSize:'14px', fontWeight:700, margin:'0 0 14px' }}>Historial</h3>
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
              {carpetas.map((carpeta,i) => (
                <div key={i}>
                  <div onClick={() => abrirCarpeta(carpeta)}
                    style={{ display:'flex', alignItems:'center', gap:'8px', padding:'8px 10px', borderRadius:'7px', border:'1px solid #F0F0F0', marginBottom:'4px', cursor:'pointer', background:carpetaAbierta===carpeta?'#FFF5F5':'#FAFAFA' }}>
                    <span style={{ fontSize:'14px' }}>{carpetaAbierta===carpeta?'📂':'📁'}</span>
                    <span style={{ color:'#0F2447', fontSize:'12px', fontWeight:500, flex:1 }}>{carpeta}</span>
                    {carpeta==='Documentos' && documentos.length>0 && (
                      <span style={{ background:'#E8321A', color:'white', fontSize:'10px', fontWeight:700, padding:'1px 6px', borderRadius:'10px' }}>{documentos.length}</span>
                    )}
                    {carpeta==='Firma' && expediente.estado==='Cerrado' && (
                      <span style={{ background:'#F0FDF4', color:'#166534', fontSize:'10px', fontWeight:700, padding:'1px 6px', borderRadius:'10px' }}>Cerrado</span>
                    )}
                    {carpeta==='Firma' && firma && expediente.estado!=='Cerrado' && (
                      <span style={{ background:todosFirmaron?'#F0FDF4':'#FEF3C7', color:todosFirmaron?'#166534':'#92400E', fontSize:'10px', fontWeight:700, padding:'1px 6px', borderRadius:'10px' }}>
                        {firma.firmantes.filter((f:any)=>f.estado==='firmado').length}/{firma.firmantes.length}
                      </span>
                    )}
                  </div>

                  {carpetaAbierta===carpeta && carpeta==='Documentos' && (
                    <div style={{ paddingLeft:'16px', marginBottom:'4px' }}>
                      {documentos.length===0 ? (
                        <p style={{ color:'#888', fontSize:'11px', margin:'4px 0 8px' }}>Sin documentos</p>
                      ) : documentos.map((doc: any, j: number) => (
                        <div key={j} style={{ display:'flex', alignItems:'center', gap:'8px', padding:'8px 10px', borderRadius:'7px', border:'1px solid #F0F0F0', marginBottom:'4px', background:'white' }}>
                          <span style={{ fontSize:'14px' }}>📄</span>
                          <span style={{ color:'#0F2447', fontSize:'11px', fontWeight:500, flex:1 }}>{doc.name.replace(/^\d+_/, '')}</span>
                          <button onClick={() => verDocumento(doc)} style={{ background:'#0F2447', color:'white', border:'none', padding:'4px 8px', borderRadius:'5px', fontSize:'10px', fontWeight:700, cursor:'pointer' }}>Ver</button>
                          <button onClick={() => descargarDocumento(doc)} style={{ background:'#E8321A', color:'white', border:'none', padding:'4px 8px', borderRadius:'5px', fontSize:'10px', fontWeight:700, cursor:'pointer' }}>⬇</button>
                        </div>
                      ))}
                    </div>
                  )}

                  {carpetaAbierta===carpeta && carpeta==='Firma' && (
                    <div style={{ paddingLeft:'16px', marginBottom:'4px' }}>
                      {expediente.estado==='Cerrado' ? (
                        <div style={{ padding:'12px', background:'#F0FDF4', borderRadius:'8px', border:'1px solid #BBF7D0', margin:'4px 0' }}>
                          <p style={{ color:'#166534', fontSize:'12px', fontWeight:700, margin:'0 0 2px' }}>✓ Expediente cerrado</p>
                          <p style={{ color:'#166534', fontSize:'11px', margin:0 }}>Cerrado el {expediente.fecha_cierre ? new Date(expediente.fecha_cierre).toLocaleDateString('es-MX') : 'N/A'}</p>
                        </div>
                      ) : configurandoFirma ? (
                        <div style={{ padding:'12px', background:'#F8F8F8', borderRadius:'8px', border:'1px solid #F0F0F0', margin:'4px 0' }}>
                          <p style={{ color:'#0F2447', fontSize:'12px', fontWeight:700, margin:'0 0 12px' }}>Configurar proceso de firma</p>
                          <div style={{ marginBottom:'10px' }}>
                            <p style={{ color:'#0F2447', fontSize:'11px', fontWeight:600, margin:'0 0 6px' }}>Tipo de firma</p>
                            <div style={{ display:'flex', gap:'6px' }}>
                              {['Fisica','Electronica'].map(t => (
                                <button key={t} onClick={() => setTipoFirma(t)}
                                  style={{ flex:1, padding:'7px', borderRadius:'6px', border:`1.5px solid ${tipoFirma===t?'#E8321A':'#E8E8E8'}`, background:tipoFirma===t?'#FFF5F5':'white', color:tipoFirma===t?'#E8321A':'#888', fontWeight:tipoFirma===t?700:400, fontSize:'11px', cursor:'pointer' }}>
                                  {t}
                                </button>
                              ))}
                            </div>
                          </div>
                          {tipoFirma==='Electronica' && (
                            <div style={{ marginBottom:'10px' }}>
                              <p style={{ color:'#0F2447', fontSize:'11px', fontWeight:600, margin:'0 0 6px' }}>Plataforma</p>
                              <div style={{ display:'flex', gap:'6px' }}>
                                {['SORA','DocuSign','Otra'].map(p => (
                                  <button key={p} onClick={() => setPlataforma(p)}
                                    style={{ flex:1, padding:'6px', borderRadius:'6px', border:`1.5px solid ${plataforma===p?'#E8321A':'#E8E8E8'}`, background:plataforma===p?'#FFF5F5':'white', color:plataforma===p?'#E8321A':'#888', fontWeight:plataforma===p?700:400, fontSize:'10px', cursor:'pointer' }}>
                                    {p}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                          <p style={{ color:'#0F2447', fontSize:'11px', fontWeight:600, margin:'0 0 6px' }}>Firmantes (en orden)</p>
                          {firmantes.map((f,j) => (
                            <div key={j} style={{ display:'flex', alignItems:'center', gap:'6px', padding:'6px 8px', background:'white', borderRadius:'6px', border:'1px solid #F0F0F0', marginBottom:'4px' }}>
                              <span style={{ background:'#0F2447', color:'white', fontSize:'10px', fontWeight:700, padding:'1px 5px', borderRadius:'10px', minWidth:'16px', textAlign:'center' }}>{j+1}</span>
                              <span style={{ color:'#0F2447', fontSize:'11px', flex:1 }}>{f.nombre} — {f.rol}</span>
                              <button onClick={() => eliminarFirmante(j)} style={{ background:'none', border:'none', color:'#E8321A', cursor:'pointer', fontSize:'12px', fontWeight:700 }}>✕</button>
                            </div>
                          ))}
                          <div style={{ display:'flex', flexDirection:'column', gap:'4px', marginTop:'8px', marginBottom:'8px' }}>
                            <input value={nNombre} onChange={async e => { setNNombre(e.target.value); if(e.target.value.length>=2){const s=await buscarFirmantesCatalogo(e.target.value);setSugerencias(s);}else{setSugerencias([])} }} placeholder="Nombre completo"
                              style={{ padding:'6px 8px', borderRadius:'6px', border:'1px solid #E8E8E8', fontSize:'11px', outline:'none' }} />
                            {sugerencias.length>0 && (
                              <div style={{ background:'white', borderRadius:'6px', border:'1px solid #E8E8E8', boxShadow:'0 2px 8px rgba(0,0,0,0.1)' }}>
                                {sugerencias.map((s,j) => (
                                  <div key={j} onClick={() => { setNNombre(s.nombre); setNRol(s.rol||''); setNEmpresa(s.empresa||''); setSugerencias([]) }}
                                    style={{ padding:'8px 10px', cursor:'pointer', borderBottom:'1px solid #F0F0F0', display:'flex', flexDirection:'column' }}>
                                    <span style={{ color:'#0F2447', fontSize:'11px', fontWeight:600 }}>{s.nombre}</span>
                                    <span style={{ color:'#888', fontSize:'10px' }}>{s.rol} · {s.empresa}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                            <input value={nRol} onChange={e => setNRol(e.target.value)} placeholder="Rol (Ej: Director Juridico)"
                              style={{ padding:'6px 8px', borderRadius:'6px', border:'1px solid #E8E8E8', fontSize:'11px', outline:'none' }} />
                            <input value={nEmpresa} onChange={e => setNEmpresa(e.target.value)} placeholder="Empresa"
                              style={{ padding:'6px 8px', borderRadius:'6px', border:'1px solid #E8E8E8', fontSize:'11px', outline:'none' }} />
                            <button onClick={agregarFirmante}
                              style={{ padding:'6px', background:'#0F2447', color:'white', border:'none', borderRadius:'6px', fontSize:'11px', fontWeight:700, cursor:'pointer' }}>
                              + Agregar firmante
                            </button>
                          </div>
                          <button onClick={guardarConfigFirma} disabled={guardandoFirma}
                            style={{ width:'100%', padding:'8px', background:'#E8321A', color:'white', border:'none', borderRadius:'7px', fontSize:'12px', fontWeight:700, cursor:'pointer' }}>
                            {guardandoFirma ? 'Guardando...' : 'Iniciar proceso de firma'}
                          </button>
                        </div>
                      ) : firma ? (
                        <div style={{ padding:'12px', background:'#F8F8F8', borderRadius:'8px', border:'1px solid #F0F0F0', margin:'4px 0' }}>
                          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'10px' }}>
                            <p style={{ color:'#0F2447', fontSize:'11px', fontWeight:700, margin:0 }}>
                              Firma {firma.tipo_firma} {firma.tipo_firma==='Electronica'?`— ${firma.plataforma}`:''}
                            </p>
                            <span style={{ color:todosFirmaron?'#166534':'#92400E', fontSize:'10px', fontWeight:700 }}>
                              {firma.firmantes.filter((f:any)=>f.estado==='firmado').length}/{firma.firmantes.length} firmados
                            </span>
                          </div>
                          <div style={{ marginBottom:'10px' }}>
                            {firma.firmantes.map((f:any, j:number) => (
                              <div key={j} style={{ display:'flex', alignItems:'center', gap:'8px', padding:'8px 10px', background:'white', borderRadius:'7px', border:`1px solid ${f.estado==='firmado'?'#BBF7D0':'#F0F0F0'}`, marginBottom:'4px' }}>
                                <div style={{ width:'24px', height:'24px', borderRadius:'50%', background:f.estado==='firmado'?'#0D5C36':'#E0E2E6', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontSize:'11px', fontWeight:700, flexShrink:0 }}>
                                  {f.estado==='firmado'?'✓':(j+1)}
                                </div>
                                <div style={{ flex:1 }}>
                                  <p style={{ color:'#0F2447', fontSize:'11px', fontWeight:600, margin:'0 0 1px' }}>{f.nombre}</p>
                                  <p style={{ color:'#888', fontSize:'10px', margin:0 }}>{f.rol} · {f.empresa}</p>
                                  {f.estado==='firmado' && f.fecha && <p style={{ color:'#0D5C36', fontSize:'10px', margin:'2px 0 0', fontWeight:600 }}>Firmado: {f.fecha}</p>}
                                </div>
                                {f.estado==='pendiente' && (
                                  <button onClick={() => marcarFirmado(j)}
                                    style={{ background:'#0D5C36', color:'white', border:'none', padding:'4px 10px', borderRadius:'5px', fontSize:'10px', fontWeight:700, cursor:'pointer' }}>
                                    Marcar firmado
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                          {todosFirmaron && (
                            <div style={{ padding:'10px', background:'#F0FDF4', borderRadius:'8px', border:'1px solid #BBF7D0', marginBottom:'8px' }}>
                              <p style={{ color:'#166534', fontSize:'11px', fontWeight:700, margin:'0 0 8px' }}>Todos han firmado. Carga el contrato final para cerrar.</p>
                              <label style={{ display:'block', background:'#0D5C36', color:'white', padding:'8px 12px', borderRadius:'7px', fontSize:'11px', fontWeight:700, cursor:'pointer', textAlign:'center' }}>
                                {cerrandoExp ? 'Cerrando...' : 'Cargar contrato firmado y cerrar'}
                                <input type="file" accept=".pdf,.docx,.doc" style={{ display:'none' }} onChange={handleCargarFirmado} />
                              </label>
                            </div>
                          )}
                          <button onClick={() => setConfigurandoFirma(true)}
                            style={{ width:'100%', padding:'6px', background:'white', color:'#888', border:'1px solid #E8E8E8', borderRadius:'6px', fontSize:'10px', cursor:'pointer' }}>
                            Editar configuracion
                          </button>
                        </div>
                      ) : null}
                    </div>
                  )}
                </div>
              ))}
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

      {!expediente && resultados.length===0 && (
        <div style={{ background:'white', borderRadius:'16px', padding:'48px', boxShadow:'0 1px 4px rgba(0,0,0,0.06)', textAlign:'center', border:'1px solid #F0F0F0' }}>
          <p style={{ fontSize:'32px', marginBottom:'16px' }}>📁</p>
          <p style={{ color:'#0F2447', fontWeight:700, fontSize:'16px', margin:'0 0 8px' }}>Busca un expediente</p>
          <p style={{ color:'#888', fontSize:'13px', margin:0 }}>Escribe el ID o nombre para ver el expediente completo</p>
        </div>
      )}
    </div>
  )
}
