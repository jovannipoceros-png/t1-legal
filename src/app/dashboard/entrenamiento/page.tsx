'use client'
import { useState } from 'react'

export default function Entrenamiento() {
  const [flujo, setFlujo] = useState<'seleccion'|'libre'|'expediente'|'simulacion'>('seleccion')
  const [perfil, setPerfil] = useState('')
  const [textoLibre, setTextoLibre] = useState('')
  const [expedienteSeleccionado, setExpedienteSeleccionado] = useState<any>(null)
  const [modoSimulacion, setModoSimulacion] = useState<'completo'|'clausulas'>('completo')
  const [clausulaActual, setClausulaActual] = useState(0)
  const [mensajes, setMensajes] = useState<{rol:string,texto:string,fundamento?:string}[]>([])
  const [input, setInput] = useState('')
  const [calificacion, setCalificacion] = useState<number|null>(null)

  const perfiles = [
    { id:'agresivo', label:'Agresivo', emoji:'🦁', desc:'Defiende cada clausula, no cede, presiona constantemente' },
    { id:'colaborativo', label:'Colaborativo', emoji:'🤝', desc:'Busca acuerdos razonables, flexible pero firme en puntos clave' },
    { id:'tecnico', label:'Tecnico-Legal', emoji:'🔬', desc:'Cita leyes y jurisprudencia, argumenta con precision juridica' },
  ]

  const expedientes = [
    { id:'C-2026-001', empresa:'Solistica S.A. de C.V.', tipo:'Contrato de servicios', clausulas:[
      { num:'I', titulo:'Objeto', texto:'T1 prestara servicios de procesamiento de pagos al CLIENTE.' },
      { num:'II', titulo:'Vigencia', texto:'El contrato tendra vigencia indefinida sin posibilidad de rescision unilateral.' },
      { num:'III', titulo:'Pago', texto:'El CLIENTE pagara dentro de los 90 dias naturales sin penalizacion por retraso.' },
      { num:'IV', titulo:'Penalizacion', texto:'En caso de incumplimiento de T1, pagara una penalizacion del 50% del valor total.' },
    ]},
    { id:'C-2026-002', empresa:'Grupo Modelo', tipo:'NDA', clausulas:[
      { num:'I', titulo:'Objeto', texto:'Las partes se obligan a mantener confidencial toda informacion intercambiada.' },
      { num:'II', titulo:'Vigencia', texto:'La obligacion de confidencialidad durara 5 años posteriores al termino.' },
    ]},
  ]

  const iniciarSimulacion = (clausulaIdx?: number) => {
    setFlujo('simulacion')
    setClausulaActual(clausulaIdx||0)
    setMensajes([{
      rol:'contraparte',
      texto: perfil==='agresivo' ? 'Buenos dias. He revisado el contrato y hay varios puntos inaceptables. La penalizacion del 50% y el plazo de 90 dias son fuera de mercado. Si T1 no mejora estas condiciones, buscaremos otro proveedor.'
        : perfil==='colaborativo' ? 'Buenos dias. En terminos generales el contrato nos parece razonable. Sin embargo, nos gustaria discutir el plazo de pago y la clausula de penalizacion.'
        : 'Buenos dias. Conforme al Art. 1796 CCF y la Tesis 1a./J. 22/2016 SCJN, los contratos obligan a su cumplimiento. Sin embargo, la clausula III podria contravenir el Art. 2117 CCF en materia de penalizaciones desproporcionadas.',
      fundamento: '⚠️ Conexion en tiempo real a SCJN e IUS — Proxima fase'
    }])
  }

  const enviar = () => {
    if (!input.trim()) return
    setMensajes(prev => [...prev, { rol:'jovanni', texto:input }])
    setInput('')
    setTimeout(() => {
      setMensajes(prev => [...prev, {
        rol:'contraparte',
        texto: perfil==='agresivo' ? 'Su propuesta no es suficiente. Necesitamos reducir la penalizacion a cero y ampliar el plazo a 120 dias.'
          : perfil==='colaborativo' ? 'Entiendo su posicion. Podriamos aceptar 30 dias habiles si flexibilizan la clausula de rescision.'
          : 'Su argumentacion es interesante pero conforme a la Tesis P./J. 64/2014 SCJN, las penalizaciones desproporcionadas son susceptibles de reduccion judicial.',
        fundamento: perfil==='agresivo' ? '' : 'Art. 2117 CCF + Tesis 1a./J. 22/2016 SCJN — Verificar en sjf.scjn.gob.mx'
      }])
    }, 1500)
  }

  if (calificacion !== null) {
    return (
      <div style={{ padding:'32px', fontFamily:'sans-serif', maxWidth:'600px' }}>
        <div style={{ background:'white', borderRadius:'16px', padding:'32px', boxShadow:'0 1px 4px rgba(0,0,0,0.06)', textAlign:'center' }}>
          <p style={{ fontSize:'48px', margin:'0 0 12px' }}>🏆</p>
          <h2 style={{ color:'#0F2447', fontSize:'22px', fontWeight:700, margin:'0 0 24px' }}>Sesion completada</h2>
          <div style={{ background:'#F8F8F8', borderRadius:'12px', padding:'24px', marginBottom:'20px' }}>
            <p style={{ color:'#888', fontSize:'14px', margin:'0 0 8px' }}>Calificacion</p>
            <p style={{ color:'#E8321A', fontSize:'56px', fontWeight:900, margin:'0 0 4px' }}>{calificacion}/10</p>
            <p style={{ color:'#0D5C36', fontSize:'13px', margin:0 }}>{calificacion>=9?'Excelente dominio de negociacion juridica':calificacion>=7?'Buena tecnica con areas de mejora':'Sigue practicando'}</p>
          </div>
          <div style={{ background:'#EFF6FF', borderRadius:'10px', padding:'16px', marginBottom:'20px', textAlign:'left' }}>
            <p style={{ color:'#1D4ED8', fontSize:'13px', fontWeight:700, margin:'0 0 8px' }}>Areas de mejora</p>
            <p style={{ color:'#1D4ED8', fontSize:'12px', margin:'0 0 4px' }}>• Refuerza argumentos con jurisprudencia SCJN</p>
            <p style={{ color:'#1D4ED8', fontSize:'12px', margin:'0 0 4px' }}>• Practica clausulas de penalizacion y pago</p>
            <p style={{ color:'#1D4ED8', fontSize:'12px', margin:0 }}>• Trabaja el control de convencionalidad</p>
          </div>
          <button onClick={() => { setFlujo('seleccion'); setMensajes([]); setCalificacion(null); setPerfil(''); setExpedienteSeleccionado(null); setTextoLibre('') }}
            style={{ width:'100%', padding:'12px', background:'#0F2447', color:'white', border:'none', borderRadius:'10px', fontWeight:700, fontSize:'14px', cursor:'pointer' }}>
            Nueva sesion
          </button>
        </div>
      </div>
    )
  }

  if (flujo==='simulacion') {
    return (
      <div style={{ padding:'32px', fontFamily:'sans-serif' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'16px' }}>
          <div>
            <h1 style={{ color:'#0F2447', fontSize:'20px', fontWeight:700, margin:'0 0 2px' }}>Simulacion — {expedienteSeleccionado?.id||'Texto libre'}</h1>
            <p style={{ color:'#888', fontSize:'13px', margin:0 }}>Contraparte: {perfiles.find(p=>p.id===perfil)?.emoji} {perfiles.find(p=>p.id===perfil)?.label}</p>
          </div>
          <div style={{ display:'flex', gap:'8px' }}>
            {modoSimulacion==='clausulas' && expedienteSeleccionado && (
              <div style={{ display:'flex', gap:'4px' }}>
                {expedienteSeleccionado.clausulas.map((_:any,i:number) => (
                  <button key={i} onClick={() => { setClausulaActual(i); setMensajes([]) }}
                    style={{ width:'28px', height:'28px', borderRadius:'50%', border:'none', background:i===clausulaActual?'#E8321A':'#F0F0F0', color:i===clausulaActual?'white':'#888', fontSize:'11px', fontWeight:700, cursor:'pointer' }}>{i+1}</button>
                ))}
              </div>
            )}
            <button style={{ background:'#EFF6FF', color:'#1D4ED8', border:'none', padding:'8px 14px', borderRadius:'8px', fontSize:'12px', fontWeight:700, cursor:'pointer' }}>💡 Sugerencia</button>
            <button onClick={() => setCalificacion(Math.floor(Math.random()*3)+7)} style={{ background:'#E8321A', color:'white', border:'none', padding:'8px 14px', borderRadius:'8px', fontSize:'12px', fontWeight:700, cursor:'pointer' }}>Terminar y calificar</button>
          </div>
        </div>
        {modoSimulacion==='clausulas' && expedienteSeleccionado && (
          <div style={{ background:'#FFF8F0', border:'1px solid #FED7AA', borderRadius:'10px', padding:'12px 16px', marginBottom:'16px' }}>
            <p style={{ color:'#92400E', fontSize:'12px', fontWeight:700, margin:'0 0 2px' }}>Clausula {expedienteSeleccionado.clausulas[clausulaActual]?.num}. {expedienteSeleccionado.clausulas[clausulaActual]?.titulo}</p>
            <p style={{ color:'#92400E', fontSize:'12px', margin:0 }}>{expedienteSeleccionado.clausulas[clausulaActual]?.texto}</p>
          </div>
        )}
        <div style={{ background:'white', borderRadius:'16px', boxShadow:'0 1px 4px rgba(0,0,0,0.06)', overflow:'hidden' }}>
          <div style={{ padding:'20px', minHeight:'380px', maxHeight:'380px', overflowY:'auto', display:'flex', flexDirection:'column', gap:'12px' }}>
            {mensajes.map((m,i) => (
              <div key={i} style={{ display:'flex', justifyContent:m.rol==='jovanni'?'flex-end':'flex-start' }}>
                <div style={{ maxWidth:'72%' }}>
                  <div style={{ padding:'12px 16px', borderRadius:m.rol==='jovanni'?'12px 12px 0 12px':'12px 12px 12px 0', background:m.rol==='jovanni'?'#0F2447':'#F8F8F8', color:m.rol==='jovanni'?'white':'#0F2447', fontSize:'13px', lineHeight:'1.6' }}>
                    {m.rol==='contraparte' && <p style={{ color:'#E8321A', fontSize:'11px', fontWeight:700, margin:'0 0 4px' }}>CONTRAPARTE {perfiles.find(p=>p.id===perfil)?.emoji}</p>}
                    {m.texto}
                  </div>
                  {m.fundamento && m.rol==='contraparte' && m.fundamento!=='' && (
                    <div style={{ background:'#EFF6FF', borderRadius:'0 0 8px 8px', padding:'6px 12px' }}>
                      <p style={{ color:'#1D4ED8', fontSize:'10px', margin:0 }}>📚 {m.fundamento}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div style={{ padding:'16px', borderTop:'1px solid #F0F0F0', display:'flex', gap:'10px' }}>
            <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key==='Enter'&&enviar()}
              placeholder="Escribe tu argumento de negociacion..." style={{ flex:1, padding:'11px 16px', borderRadius:'9px', border:'1.5px solid #E8E8E8', fontSize:'13px', outline:'none' }} />
            <button onClick={enviar} style={{ background:'#E8321A', color:'white', border:'none', padding:'11px 24px', borderRadius:'9px', fontSize:'13px', fontWeight:700, cursor:'pointer' }}>Enviar</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ padding:'32px', fontFamily:'sans-serif' }}>
      <h1 style={{ color:'#0F2447', fontSize:'24px', fontWeight:700, margin:'0 0 4px' }}>Entrenamiento de Negociacion</h1>
      <p style={{ color:'#888', margin:'0 0 24px' }}>Practica negociacion juridica con IA como contraparte</p>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'24px', marginBottom:'24px' }}>
        <div style={{ background:'white', borderRadius:'16px', padding:'24px', boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>
          <h3 style={{ color:'#0F2447', fontSize:'15px', fontWeight:700, margin:'0 0 16px' }}>Perfil de la contraparte</h3>
          {perfiles.map((p,i) => (
            <div key={i} onClick={() => setPerfil(p.id)} style={{ padding:'14px', borderRadius:'10px', border:`2px solid ${perfil===p.id?'#E8321A':'#E8E8E8'}`, cursor:'pointer', background:perfil===p.id?'#FFF5F5':'white', display:'flex', alignItems:'center', gap:'12px', marginBottom:'8px' }}>
              <span style={{ fontSize:'24px' }}>{p.emoji}</span>
              <div>
                <p style={{ color:'#0F2447', fontWeight:700, fontSize:'13px', margin:'0 0 2px' }}>{p.label}</p>
                <p style={{ color:'#888', fontSize:'11px', margin:0 }}>{p.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
          <div onClick={() => setFlujo('libre')} style={{ background:flujo==='libre'?'#FFF5F5':'white', border:`2px solid ${flujo==='libre'?'#E8321A':'#E8E8E8'}`, borderRadius:'16px', padding:'24px', cursor:'pointer', boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>
            <h3 style={{ color:'#0F2447', fontSize:'15px', fontWeight:700, margin:'0 0 8px' }}>📝 Flujo 1 — Texto libre</h3>
            <p style={{ color:'#888', fontSize:'13px', margin:0 }}>Pega una clausula o parrafo y empieza la simulacion directamente</p>
          </div>
          <div onClick={() => setFlujo('expediente')} style={{ background:flujo==='expediente'?'#FFF5F5':'white', border:`2px solid ${flujo==='expediente'?'#E8321A':'#E8E8E8'}`, borderRadius:'16px', padding:'24px', cursor:'pointer', boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>
            <h3 style={{ color:'#0F2447', fontSize:'15px', fontWeight:700, margin:'0 0 8px' }}>📁 Flujo 2 — Por expediente</h3>
            <p style={{ color:'#888', fontSize:'13px', margin:0 }}>Selecciona un expediente y simula todo el contrato o clausula por clausula</p>
          </div>
        </div>
      </div>

      {flujo==='libre' && (
        <div style={{ background:'white', borderRadius:'16px', padding:'24px', boxShadow:'0 1px 4px rgba(0,0,0,0.06)', marginBottom:'16px' }}>
          <h3 style={{ color:'#0F2447', fontSize:'14px', fontWeight:700, margin:'0 0 12px' }}>Pega tu clausula o parrafo</h3>
          <textarea value={textoLibre} onChange={e => setTextoLibre(e.target.value)} placeholder="Ej: El cliente pagara intereses del 1000% mensual en caso de retraso..." rows={5}
            style={{ width:'100%', padding:'14px', borderRadius:'10px', border:'1.5px solid #E8E8E8', fontSize:'13px', lineHeight:'1.7', resize:'none', boxSizing:'border-box', outline:'none', marginBottom:'12px' }} />
          <button onClick={() => iniciarSimulacion()} disabled={!perfil||!textoLibre.trim()}
            style={{ padding:'12px 28px', background:perfil&&textoLibre.trim()?'#E8321A':'#E8E8E8', color:perfil&&textoLibre.trim()?'white':'#aaa', border:'none', borderRadius:'9px', fontWeight:700, fontSize:'14px', cursor:perfil&&textoLibre.trim()?'pointer':'default' }}>
            {perfil?'Iniciar simulacion →':'Selecciona un perfil primero'}
          </button>
        </div>
      )}

      {flujo==='expediente' && (
        <div style={{ background:'white', borderRadius:'16px', padding:'24px', boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>
          <h3 style={{ color:'#0F2447', fontSize:'14px', fontWeight:700, margin:'0 0 16px' }}>Selecciona el expediente</h3>
          <div style={{ display:'flex', flexDirection:'column', gap:'8px', marginBottom:'16px' }}>
            {expedientes.map((e,i) => (
              <div key={i} onClick={() => setExpedienteSeleccionado(e)} style={{ padding:'14px 18px', borderRadius:'10px', border:`1.5px solid ${expedienteSeleccionado?.id===e.id?'#E8321A':'#E8E8E8'}`, cursor:'pointer', background:expedienteSeleccionado?.id===e.id?'#FFF5F5':'white', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <div>
                  <span style={{ background:'#0F2447', color:'white', fontSize:'11px', fontWeight:700, padding:'2px 8px', borderRadius:'10px', marginRight:'8px' }}>{e.id}</span>
                  <span style={{ color:'#0F2447', fontSize:'13px', fontWeight:600 }}>{e.empresa}</span>
                </div>
                <span style={{ color:'#888', fontSize:'12px' }}>{e.clausulas.length} clausulas — {e.tipo}</span>
              </div>
            ))}
          </div>
          {expedienteSeleccionado && (
            <div>
              <div style={{ display:'flex', gap:'10px', marginBottom:'16px' }}>
                <button onClick={() => setModoSimulacion('completo')} style={{ flex:1, padding:'12px', borderRadius:'9px', border:`2px solid ${modoSimulacion==='completo'?'#E8321A':'#E8E8E8'}`, background:modoSimulacion==='completo'?'#FFF5F5':'white', color:modoSimulacion==='completo'?'#E8321A':'#888', fontWeight:700, fontSize:'13px', cursor:'pointer' }}>📄 Todo el contrato</button>
                <button onClick={() => setModoSimulacion('clausulas')} style={{ flex:1, padding:'12px', borderRadius:'9px', border:`2px solid ${modoSimulacion==='clausulas'?'#E8321A':'#E8E8E8'}`, background:modoSimulacion==='clausulas'?'#FFF5F5':'white', color:modoSimulacion==='clausulas'?'#E8321A':'#888', fontWeight:700, fontSize:'13px', cursor:'pointer' }}>📋 Clausula por clausula</button>
              </div>
              {modoSimulacion==='clausulas' && (
                <div style={{ marginBottom:'16px' }}>
                  {expedienteSeleccionado.clausulas.map((c:any,i:number) => (
                    <div key={i} style={{ padding:'10px 14px', borderRadius:'8px', border:'1px solid #F0F0F0', marginBottom:'5px', background:'#FAFAFA', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                      <div>
                        <span style={{ color:'#E8321A', fontSize:'11px', fontWeight:700, marginRight:'8px' }}>Clausula {c.num}</span>
                        <span style={{ color:'#0F2447', fontSize:'12px', fontWeight:600 }}>{c.titulo}</span>
                      </div>
                      <button onClick={() => { if(perfil) iniciarSimulacion(i) }} disabled={!perfil}
                        style={{ background:perfil?'#E8321A':'#E8E8E8', color:perfil?'white':'#aaa', border:'none', padding:'5px 12px', borderRadius:'6px', fontSize:'11px', fontWeight:700, cursor:perfil?'pointer':'default' }}>
                        Simular
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {modoSimulacion==='completo' && (
                <button onClick={() => { if(perfil) iniciarSimulacion() }} disabled={!perfil}
                  style={{ width:'100%', padding:'12px', background:perfil?'#E8321A':'#E8E8E8', color:perfil?'white':'#aaa', border:'none', borderRadius:'9px', fontWeight:700, fontSize:'14px', cursor:perfil?'pointer':'default' }}>
                  {perfil?'Iniciar simulacion completa →':'Selecciona un perfil primero'}
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
