'use client'
import { useState, useEffect } from 'react'
import { obtenerSolicitudes, obtenerTracking, actualizarEstado } from '@/lib/supabase/solicitudes'

const clausulasBase = [
  'Objeto del contrato',
  'Vigencia',
  'Contraprestacion',
  'Forma de pago',
  'Confidencialidad',
  'Propiedad intelectual',
  'Responsabilidad y garantias',
  'Rescision y terminacion',
  'Jurisdiccion',
  'Firma electronica',
]

type EstadoClausula = 'pendiente' | 'acordada' | 'disputa'

export default function Negociacion() {
  const [solicitudes, setSolicitudes] = useState<any[]>([])
  const [seleccionada, setSeleccionada] = useState<any>(null)
  const [tracking, setTracking] = useState<any[]>([])
  const [tab, setTab] = useState('mesa')
  const [cargando, setCargando] = useState(true)
  const [nota, setNota] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [clausulas, setClausulas] = useState<Record<string,EstadoClausula>>({})
  const [modoDirecto, setModoDirecto] = useState(false)

  useEffect(() => {
    obtenerSolicitudes()
      .then(async data => {
        const activas = (data||[]).filter((s:any) => s.estado==='En negociacion' || s.estado==='En revision')
        setSolicitudes(activas)
        setCargando(false)
        const params = new URLSearchParams(window.location.search)
        const idParam = params.get('id')
        if (idParam) {
          setModoDirecto(true)
          const encontrada = (data||[]).find((s:any) => s.id === idParam)
          if (encontrada) await abrirSolicitud(encontrada)
        }
      })
  }, [])

  const abrirSolicitud = async (s: any) => {
    setSeleccionada(s)
    setTab('mesa')
    if (s.estado === 'En revision') {
      await actualizarEstado(s.id, 'En negociacion')
      setSeleccionada({ ...s, estado: 'En negociacion' })
    }
    const t = await obtenerTracking(s.id)
    setTracking(t||[])
    const estadoInicial: Record<string,EstadoClausula> = {}
    clausulasBase.forEach(c => { estadoInicial[c] = 'pendiente' })
    if (s.vigencia) estadoInicial['Vigencia'] = 'acordada'
    if (s.contraprestacion) estadoInicial['Contraprestacion'] = 'acordada'
    if (s.plazo_pago) estadoInicial['Forma de pago'] = 'acordada'
    if (s.tipo_firma) estadoInicial['Firma electronica'] = 'acordada'
    setClausulas(estadoInicial)
  }

  const toggleClausula = (nombre: string) => {
    setClausulas(prev => {
      const actual = prev[nombre]
      const siguiente: EstadoClausula = actual==='pendiente'?'acordada':actual==='acordada'?'disputa':'pendiente'
      return { ...prev, [nombre]: siguiente }
    })
  }

  const agregarNota = async () => {
    if (!nota.trim() || !seleccionada) return
    setEnviando(true)
    try {
      await actualizarEstado(seleccionada.id, seleccionada.estado, nota)
      const t = await obtenerTracking(seleccionada.id)
      setTracking(t||[])
      setNota('')
    } finally {
      setEnviando(false)
    }
  }

  const notasRonda = tracking.filter(t => !t.nota.startsWith('Estado actualizado'))
  const cambiosEstado = tracking.filter(t => t.nota.startsWith('Estado actualizado'))
  const acordadas = Object.values(clausulas).filter(v => v==='acordada').length
  const enDisputa = Object.values(clausulas).filter(v => v==='disputa').length
  const pendientes = Object.values(clausulas).filter(v => v==='pendiente').length
  const progreso = Math.round((acordadas / clausulasBase.length) * 100)

  const estadoColor: Record<EstadoClausula,{bg:string,color:string,label:string,dot:string}> = {
    pendiente: { bg:'#F8F8F8', color:'#888', label:'Pendiente', dot:'#E0E2E6' },
    acordada: { bg:'#F0FDF4', color:'#166534', label:'Acordada ✓', dot:'#0D5C36' },
    disputa: { bg:'#FFF5F5', color:'#C42A15', label:'En disputa', dot:'#E8321A' },
  }

  const tabs = [
    { id:'mesa', label:'Mesa de negociacion' },
    { id:'rondas', label:`Rondas ${notasRonda.length>0?'('+notasRonda.length+')':''}` },
    { id:'resultado', label:'Documento resultado' },
  ]

  return (
    <div style={{ padding:'32px', fontFamily:'sans-serif' }}>
      <h1 style={{ color:'#0F2447', fontSize:'24px', fontWeight:700, margin:'0 0 4px' }}>Negociacion</h1>
      <p style={{ color:'#888', margin:'0 0 24px' }}>Mesa de negociacion — Flujo A y Flujo B</p>

      <div style={{ display:'grid', gridTemplateColumns:'260px 1fr', gap:'24px' }}>
        <div>
          <div style={{ background:'white', borderRadius:'16px', padding:'16px', boxShadow:'0 1px 4px rgba(0,0,0,0.06)', border:'1px solid #F0F0F0' }}>
            <p style={{ color:'#0F2447', fontSize:'12px', fontWeight:700, margin:'0 0 12px' }}>SOLICITUDES ACTIVAS</p>
            {cargando ? (
              <p style={{ color:'#888', fontSize:'12px' }}>Cargando...</p>
            ) : solicitudes.length===0 ? (
              <div style={{ textAlign:'center', padding:'20px 0' }}>
                <p style={{ fontSize:'24px', margin:'0 0 8px' }}>✅</p>
                <p style={{ color:'#888', fontSize:'12px', margin:0 }}>Sin solicitudes activas</p>
              </div>
            ) : solicitudes.map((s,i) => (
              <div key={i} onClick={() => abrirSolicitud(s)}
                style={{ padding:'12px', borderRadius:'10px', border:`1.5px solid ${seleccionada?.id===s.id?'#E8321A':'#F0F0F0'}`, marginBottom:'6px', cursor:'pointer', background:seleccionada?.id===s.id?'#FFF5F5':'#FAFAFA' }}>
                <div style={{ display:'flex', gap:'5px', marginBottom:'5px' }}>
                  <span style={{ background:'#0F2447', color:'white', fontSize:'10px', fontWeight:700, padding:'1px 6px', borderRadius:'10px' }}>{s.id}</span>
                  <span style={{ background:s.flujo==='A'?'#FEF3C7':'#EFF6FF', color:s.flujo==='A'?'#92400E':'#1D4ED8', fontSize:'10px', fontWeight:700, padding:'1px 6px', borderRadius:'10px' }}>
                    Flujo {s.flujo}
                  </span>
                </div>
                <p style={{ color:'#0F2447', fontWeight:700, fontSize:'12px', margin:'0 0 2px' }}>{s.nombre_empresa||s.nombre||'Sin nombre'}</p>
                <p style={{ color:'#888', fontSize:'10px', margin:0 }}>{s.tipo_solicitud||'Sin tipo'}</p>
              </div>
            ))}
          </div>
        </div>

        {seleccionada ? (
          <div>
            <div style={{ background:'white', borderRadius:'16px', padding:'24px', boxShadow:'0 1px 4px rgba(0,0,0,0.06)', border:'1px solid #F0F0F0' }}>
              <div style={{ marginBottom:'20px', paddingBottom:'16px', borderBottom:'1px solid #F0F0F0' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'12px' }}>
                  <div>
                    <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'4px' }}>
                      <span style={{ background:'#0F2447', color:'white', fontSize:'11px', fontWeight:700, padding:'2px 8px', borderRadius:'10px' }}>{seleccionada.id}</span>
                      <span style={{ background:seleccionada.flujo==='A'?'#FEF3C7':'#EFF6FF', color:seleccionada.flujo==='A'?'#92400E':'#1D4ED8', fontSize:'11px', fontWeight:700, padding:'2px 8px', borderRadius:'10px' }}>
                        {seleccionada.flujo==='A'?'Flujo A — Socio comercial':'Flujo B — Plantilla T1'}
                      </span>
                      <span style={{ background:seleccionada.estado==='En negociacion'?'#F3E8FF':'#EFF6FF', color:seleccionada.estado==='En negociacion'?'#7C3AED':'#1D4ED8', fontSize:'11px', fontWeight:700, padding:'2px 8px', borderRadius:'10px' }}>{seleccionada.estado}</span>
                    </div>
                    <h2 style={{ color:'#0F2447', fontSize:'17px', fontWeight:700, margin:'0 0 2px' }}>{seleccionada.nombre_empresa||seleccionada.nombre||'Sin nombre'}</h2>
                    <p style={{ color:'#888', fontSize:'12px', margin:0 }}>{seleccionada.tipo_solicitud} · {seleccionada.empresa_t1}</p>
                  </div>
                  <button style={{ background:'#E8321A', color:'white', border:'none', padding:'8px 16px', borderRadius:'8px', fontSize:'12px', fontWeight:700, cursor:'pointer' }}>Abrir en Editor</button>
                </div>

                <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
                  <div style={{ flex:1, height:'8px', background:'#F0F0F0', borderRadius:'4px', overflow:'hidden' }}>
                    <div style={{ height:'100%', width:`${progreso}%`, background:progreso>=80?'#0D5C36':progreso>=50?'#F59E0B':'#E8321A', borderRadius:'4px', transition:'width 0.3s' }} />
                  </div>
                  <span style={{ color:'#0F2447', fontSize:'13px', fontWeight:700, minWidth:'40px' }}>{progreso}%</span>
                  <div style={{ display:'flex', gap:'8px' }}>
                    <span style={{ background:'#F0FDF4', color:'#166534', fontSize:'11px', fontWeight:700, padding:'2px 8px', borderRadius:'10px' }}>{acordadas} acordadas</span>
                    <span style={{ background:'#FFF5F5', color:'#C42A15', fontSize:'11px', fontWeight:700, padding:'2px 8px', borderRadius:'10px' }}>{enDisputa} en disputa</span>
                    <span style={{ background:'#F8F8F8', color:'#888', fontSize:'11px', fontWeight:700, padding:'2px 8px', borderRadius:'10px' }}>{pendientes} pendientes</span>
                  </div>
                </div>
              </div>

              <div style={{ display:'flex', gap:0, marginBottom:'24px', borderBottom:'2px solid #F0F0F0' }}>
                {tabs.map(t => (
                  <button key={t.id} onClick={() => setTab(t.id)}
                    style={{ padding:'10px 18px', border:'none', background:'transparent', color:tab===t.id?'#E8321A':'#888', fontWeight:tab===t.id?700:400, fontSize:'13px', cursor:'pointer', borderBottom:tab===t.id?'2px solid #E8321A':'2px solid transparent', marginBottom:'-2px' }}>
                    {t.label}
                  </button>
                ))}
              </div>

              {tab==='mesa' && (
                <div>
                  {seleccionada.flujo==='A' && (
                    <div style={{ background:'#FFF8F0', borderRadius:'10px', padding:'12px 16px', border:'1px solid #FED7AA', marginBottom:'16px', display:'flex', alignItems:'center', gap:'10px' }}>
                      <span style={{ fontSize:'16px' }}>📄</span>
                      <div>
                        <p style={{ color:'#92400E', fontSize:'12px', fontWeight:700, margin:'0 0 2px' }}>Flujo A — Contrato del socio comercial</p>
                        <p style={{ color:'#92400E', fontSize:'11px', margin:0 }}>El solicitante cargo el contrato. Revisa clausula por clausula y marca su estado.</p>
                      </div>
                    </div>
                  )}
                  {seleccionada.flujo==='B' && (
                    <div style={{ background:'#EFF6FF', borderRadius:'10px', padding:'12px 16px', border:'1px solid #BFDBFE', marginBottom:'16px', display:'flex', alignItems:'center', gap:'10px' }}>
                      <span style={{ fontSize:'16px' }}>📋</span>
                      <div>
                        <p style={{ color:'#1D4ED8', fontSize:'12px', fontWeight:700, margin:'0 0 2px' }}>Flujo B — Plantilla T1</p>
                        <p style={{ color:'#1D4ED8', fontSize:'11px', margin:0 }}>Documento generado con plantilla T1. Negocia con el socio y actualiza el estado de cada clausula.</p>
                      </div>
                    </div>
                  )}
                  <p style={{ color:'#0F2447', fontSize:'12px', fontWeight:600, margin:'0 0 12px' }}>Haz clic en cada clausula para cambiar su estado → Pendiente → Acordada → En disputa</p>
                  <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
                    {clausulasBase.map((c,i) => {
                      const estado = clausulas[c] || 'pendiente'
                      const col = estadoColor[estado]
                      const valor = c==='Vigencia'?seleccionada.vigencia:c==='Contraprestacion'?seleccionada.contraprestacion:c==='Forma de pago'?seleccionada.plazo_pago?`${seleccionada.plazo_pago} dias`:null:c==='Firma electronica'?seleccionada.tipo_firma:null
                      return (
                        <div key={i} onClick={() => toggleClausula(c)}
                          style={{ display:'flex', alignItems:'center', gap:'12px', padding:'14px 16px', borderRadius:'10px', border:`1.5px solid ${estado==='disputa'?'#FCA5A5':estado==='acordada'?'#BBF7D0':'#F0F0F0'}`, background:col.bg, cursor:'pointer', transition:'all 0.15s' }}>
                          <div style={{ width:'10px', height:'10px', borderRadius:'50%', background:col.dot, flexShrink:0 }} />
                          <div style={{ flex:1 }}>
                            <p style={{ color:'#0F2447', fontSize:'13px', fontWeight:600, margin:'0 0 2px' }}>{c}</p>
                            {valor && <p style={{ color:'#888', fontSize:'11px', margin:0 }}>{valor}</p>}
                          </div>
                          <span style={{ background:col.bg, color:col.color, fontSize:'11px', fontWeight:700, padding:'3px 10px', borderRadius:'10px', border:`1px solid ${estado==='disputa'?'#FCA5A5':estado==='acordada'?'#BBF7D0':'#E8E8E8'}` }}>
                            {col.label}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {tab==='rondas' && (
                <div>
                  <div style={{ background:'#F8F8F8', borderRadius:'12px', padding:'16px', marginBottom:'20px', border:'1px solid #F0F0F0' }}>
                    <label style={{ display:'block', color:'#0F2447', fontSize:'13px', fontWeight:600, marginBottom:'8px' }}>Agregar nota de ronda {notasRonda.length+1}</label>
                    <textarea value={nota} onChange={e => setNota(e.target.value)} rows={3}
                      placeholder={seleccionada.flujo==='A' ? 'Ej: Ronda 1 — Contraparte solicita reducir vigencia a 6 meses. Pendiente revision de penalizacion.' : 'Ej: Ronda 1 — Se envio plantilla T1. Socio solicita ajuste en clausula de pago.'}
                      style={{ width:'100%', padding:'12px', borderRadius:'8px', border:'1.5px solid #E8E8E8', fontSize:'13px', boxSizing:'border-box', resize:'none', outline:'none', marginBottom:'10px', background:'white' }} />
                    <button onClick={agregarNota} disabled={enviando||!nota.trim()}
                      style={{ background:nota.trim()?'#E8321A':'#E8E8E8', color:nota.trim()?'white':'#aaa', border:'none', padding:'10px 20px', borderRadius:'8px', fontSize:'13px', fontWeight:700, cursor:nota.trim()?'pointer':'default' }}>
                      {enviando ? 'Guardando...' : `Guardar ronda ${notasRonda.length+1}`}
                    </button>
                  </div>

                  {notasRonda.length===0 ? (
                    <div style={{ textAlign:'center', padding:'32px', background:'#F8F8F8', borderRadius:'12px', border:'1px solid #F0F0F0' }}>
                      <p style={{ fontSize:'28px', margin:'0 0 8px' }}>📝</p>
                      <p style={{ color:'#0F2447', fontWeight:700, fontSize:'14px', margin:'0 0 4px' }}>Sin rondas aun</p>
                      <p style={{ color:'#888', fontSize:'12px', margin:0 }}>Agrega la primera nota de ronda arriba</p>
                    </div>
                  ) : notasRonda.map((t,i) => (
                    <div key={i} style={{ display:'flex', gap:'14px', marginBottom:'16px' }}>
                      <div style={{ display:'flex', flexDirection:'column', alignItems:'center' }}>
                        <div style={{ width:'36px', height:'36px', borderRadius:'50%', background:'#E8321A', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontWeight:900, fontSize:'14px', flexShrink:0 }}>
                          {notasRonda.length-i}
                        </div>
                        {i<notasRonda.length-1 && <div style={{ width:'2px', flex:1, background:'#F0F0F0', margin:'4px 0' }} />}
                      </div>
                      <div style={{ flex:1, padding:'16px', background:'white', borderRadius:'12px', border:'1px solid #F0F0F0', marginBottom:'0' }}>
                        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'8px' }}>
                          <span style={{ color:'#E8321A', fontSize:'12px', fontWeight:700 }}>Ronda {notasRonda.length-i}</span>
                          <span style={{ color:'#aaa', fontSize:'11px' }}>{new Date(t.created_at).toLocaleString('es-MX')}</span>
                        </div>
                        <p style={{ color:'#0F2447', fontSize:'13px', lineHeight:'1.6', margin:'0 0 6px' }}>{t.nota}</p>
                        <p style={{ color:'#888', fontSize:'11px', margin:0 }}>— {t.autor}</p>
                      </div>
                    </div>
                  ))}

                  {cambiosEstado.length>0 && (
                    <div style={{ marginTop:'16px', padding:'14px', background:'#F8F8F8', borderRadius:'10px', border:'1px solid #F0F0F0' }}>
                      <p style={{ color:'#888', fontSize:'11px', fontWeight:700, margin:'0 0 8px' }}>CAMBIOS DE ESTADO</p>
                      {cambiosEstado.map((t,i) => (
                        <div key={i} style={{ display:'flex', justifyContent:'space-between', padding:'5px 0', borderBottom:'1px solid #F0F0F0' }}>
                          <span style={{ color:'#555', fontSize:'11px' }}>{t.nota}</span>
                          <span style={{ color:'#aaa', fontSize:'10px' }}>{new Date(t.created_at).toLocaleDateString('es-MX')}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {tab==='resultado' && (
                <div>
                  <div style={{ background:'#F8F8F8', borderRadius:'12px', padding:'24px', border:'1px solid #F0F0F0', marginBottom:'16px' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'16px', paddingBottom:'12px', borderBottom:'1px solid #E8E8E8' }}>
                      <div>
                        <p style={{ color:'#0F2447', fontWeight:900, fontSize:'15px', margin:'0 0 2px' }}>{seleccionada.tipo_solicitud?.toUpperCase()||'DOCUMENTO RESULTADO'}</p>
                        <p style={{ color:'#888', fontSize:'12px', margin:0 }}>Expediente {seleccionada.id} · {seleccionada.flujo==='A'?'Flujo A — Socio comercial':'Flujo B — Plantilla T1'}</p>
                      </div>
                      <div style={{ textAlign:'right' }}>
                        <p style={{ color:progreso>=80?'#0D5C36':progreso>=50?'#F59E0B':'#E8321A', fontWeight:900, fontSize:'24px', margin:'0 0 2px' }}>{progreso}%</p>
                        <p style={{ color:'#888', fontSize:'11px', margin:0 }}>completado</p>
                      </div>
                    </div>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', marginBottom:'16px' }}>
                      {[
                        { label:'Solicitante', value:seleccionada.nombre||'—' },
                        { label:'Contraparte', value:seleccionada.nombre_empresa||'—' },
                        { label:'Vigencia', value:seleccionada.vigencia||'—' },
                        { label:'Contraprestacion', value:seleccionada.contraprestacion||'—' },
                        { label:'Plazo de pago', value:seleccionada.plazo_pago?`${seleccionada.plazo_pago} dias ${seleccionada.tipo_dias_pago}`:'—' },
                        { label:'Tipo de firma', value:seleccionada.tipo_firma||'—' },
                      ].map((d,i) => (
                        <div key={i} style={{ padding:'10px', background:'white', borderRadius:'8px', border:'1px solid #E8E8E8' }}>
                          <p style={{ color:'#888', fontSize:'10px', fontWeight:700, margin:'0 0 2px' }}>{d.label.toUpperCase()}</p>
                          <p style={{ color:'#0F2447', fontSize:'13px', fontWeight:600, margin:0 }}>{d.value}</p>
                        </div>
                      ))}
                    </div>
                    <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'8px', marginBottom:'16px' }}>
                      <div style={{ padding:'10px', background:'#F0FDF4', borderRadius:'8px', textAlign:'center' }}>
                        <p style={{ color:'#0D5C36', fontWeight:700, fontSize:'18px', margin:'0 0 2px' }}>{acordadas}</p>
                        <p style={{ color:'#0D5C36', fontSize:'10px', margin:0 }}>Acordadas</p>
                      </div>
                      <div style={{ padding:'10px', background:'#FFF5F5', borderRadius:'8px', textAlign:'center' }}>
                        <p style={{ color:'#C42A15', fontWeight:700, fontSize:'18px', margin:'0 0 2px' }}>{enDisputa}</p>
                        <p style={{ color:'#C42A15', fontSize:'10px', margin:0 }}>En disputa</p>
                      </div>
                      <div style={{ padding:'10px', background:'#F8F8F8', borderRadius:'8px', textAlign:'center' }}>
                        <p style={{ color:'#888', fontWeight:700, fontSize:'18px', margin:'0 0 2px' }}>{pendientes}</p>
                        <p style={{ color:'#888', fontSize:'10px', margin:0 }}>Pendientes</p>
                      </div>
                    </div>
                    {notasRonda.length>0 && (
                      <div style={{ padding:'12px', background:'white', borderRadius:'8px', border:'1px solid #E8E8E8' }}>
                        <p style={{ color:'#0F2447', fontSize:'11px', fontWeight:700, margin:'0 0 8px' }}>RESUMEN DE NEGOCIACION ({notasRonda.length} rondas)</p>
                        {notasRonda.map((t,i) => (
                          <p key={i} style={{ color:'#555', fontSize:'12px', margin:'0 0 4px', paddingLeft:'10px', borderLeft:'2px solid #E8321A' }}>
                            Ronda {notasRonda.length-i}: {t.nota}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                  <div style={{ display:'flex', gap:'8px' }}>
                    <button style={{ background:'#0F2447', color:'white', border:'none', padding:'11px 20px', borderRadius:'8px', fontSize:'13px', fontWeight:700, cursor:'pointer' }}>Pasar al Editor</button>
                    <button style={{ background:progreso>=80?'#0D5C36':'#E8E8E8', color:progreso>=80?'white':'#aaa', border:'none', padding:'11px 20px', borderRadius:'8px', fontSize:'13px', fontWeight:700, cursor:progreso>=80?'pointer':'default' }}>
                      {progreso>=80?'Marcar lista para firma':'Completa mas clausulas para firmar'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div style={{ background:'white', borderRadius:'16px', padding:'60px', boxShadow:'0 1px 4px rgba(0,0,0,0.06)', textAlign:'center', border:'1px solid #F0F0F0' }}>
            <p style={{ fontSize:'48px', margin:'0 0 16px' }}>🤝</p>
            <p style={{ color:'#0F2447', fontWeight:700, fontSize:'18px', margin:'0 0 8px' }}>Mesa de Negociacion</p>
            <p style={{ color:'#888', fontSize:'13px', margin:0 }}>Selecciona una solicitud para abrir la mesa de negociacion</p>
          </div>
        )}
      </div>
    </div>
  )
}
