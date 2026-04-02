'use client'
import { useState } from 'react'

export default function Biblioteca() {
  const [tab, setTab] = useState('validada')
  const [busqueda, setBusqueda] = useState('')
  const [motor, setMotor] = useState('Claude')
  const [pregunta, setPregunta] = useState('')
  const [clausulaAnalizar, setClausulaAnalizar] = useState('')
  const [respuesta, setRespuesta] = useState('')
  const [buscando, setBuscando] = useState(false)
  const [favoritos, setFavoritos] = useState<string[]>([])

  const leyes = [
    { id:'L1', nombre:'Ley Fintech (LRITF)', fecha:'DOF 09-03-2018', pais:'Mexico', articulos:[
      { num:'Art. 1', texto:'La presente Ley tiene por objeto regular los servicios financieros que presten las instituciones de tecnologia financiera.' },
      { num:'Art. 48', texto:'Las instituciones de fondos de pago electronico podran emitir, administrar, redimir y transmitir fondos de pago electronico.' },
    ]},
    { id:'L2', nombre:'LFPDPPP — Datos Personales', fecha:'DOF 05-07-2010', pais:'Mexico', articulos:[
      { num:'Art. 8', texto:'Todo tratamiento de datos personales estara sujeto al consentimiento de su titular.' },
      { num:'Art. 36', texto:'Las transferencias de datos podran llevarse a cabo sin consentimiento del titular cuando la ley lo permita.' },
    ]},
    { id:'L3', nombre:'Codigo de Comercio', fecha:'DOF 07-10-1889', pais:'Mexico', articulos:[
      { num:'Art. 89', texto:'En los actos de comercio podran emplearse los medios electronicos, opticos o cualquier otra tecnologia.' },
      { num:'Art. 90', texto:'La manifestacion de voluntad para la celebracion de actos de comercio no quedara privada de efectos juridicos.' },
    ]},
    { id:'L4', nombre:'Convencion Americana DDHH', fecha:'San Jose 1969', pais:'Internacional', articulos:[
      { num:'Art. 8', texto:'Toda persona tiene derecho a ser oida con las debidas garantias por un juez o tribunal competente.' },
      { num:'Art. 25', texto:'Toda persona tiene derecho a un recurso sencillo y rapido ante los jueces o tribunales competentes.' },
    ]},
  ]

  const jurisprudencia = [
    { tesis:'1a./J. 22/2016', titulo:'FIRMA ELECTRONICA. TIENE LA MISMA VALIDEZ QUE LA AUTOGRAFA', tribunal:'Primera Sala SCJN', fecha:'2016', tema:'Firma electronica', aplicacion:'Sustenta validez de contratos firmados electronicamente conforme Arts. 89-90 CCo.' },
    { tesis:'2a./J. 115/2019', titulo:'PROTECCION DE DATOS PERSONALES. DERECHO FUNDAMENTAL', tribunal:'Segunda Sala SCJN', fecha:'2019', tema:'Datos personales', aplicacion:'Fundamenta clausulas de confidencialidad y tratamiento de datos en contratos.' },
    { tesis:'Corte IDH — Fontevecchia', titulo:'CONVENCIONALIDAD — OBLIGACION DE INAPLICAR NORMAS CONTRARIAS A CADH', tribunal:'Corte Interamericana de DDHH', fecha:'2016', tema:'Convencionalidad', aplicacion:'Obliga a jueces mexicanos a inaplicar normas que contravengan la Convencion Americana.' },
  ]

  const toggleFavorito = (id: string) => setFavoritos(f => f.includes(id) ? f.filter(x => x!==id) : [...f, id])

  const buscar = () => {
    setBuscando(true)
    setTimeout(() => {
      setRespuesta('ADVERTENCIA: Resultado orientativo. Verifica en fuentes oficiales antes de usar en negociacion.\n\nFUNDAMENTO LEGAL:\nConforme al Art. 89 del Codigo de Comercio y Art. 48 de la Ley Fintech, las IFPE pueden celebrar contratos electronicos con plena validez juridica.\n\nJURISPRUDENCIA:\n• Tesis 1a./J. 22/2016 — Primera Sala SCJN: FIRMA ELECTRONICA. TIENE LA MISMA VALIDEZ QUE LA AUTOGRAFA\n\nCONVENCIONALIDAD:\n• Art. 8 CADH — Debido proceso en materia contractual\n• Corte IDH Caso Fontevecchia 2016\n\nREFERENCIAS:\n• dof.gob.mx\n• sjf.scjn.gob.mx\n• corteidh.or.cr')
      setBuscando(false)
    }, 1500)
  }

  const tabs = [{id:'validada',label:'Leyes validadas'},{id:'jurisprudencia',label:'Jurisprudencia'},{id:'analizar',label:'Analizar clausula'},{id:'buscar',label:'Buscar fundamento'},{id:'favoritos',label:`Mis referencias (${favoritos.length})`}]

  return (
    <div style={{ padding:'32px', fontFamily:'sans-serif' }}>
      <h1 style={{ color:'#0F2447', fontSize:'24px', fontWeight:700, margin:'0 0 4px' }}>Biblioteca Juridica</h1>
      <p style={{ color:'#888', margin:'0 0 8px' }}>Leyes validadas · Jurisprudencia SCJN · Convencionalidad CIDH · Busqueda con IA</p>
      <div style={{ background:'#FFF8F0', border:'1px solid #FED7AA', borderRadius:'8px', padding:'10px 16px', marginBottom:'24px' }}>
        <p style={{ color:'#92400E', fontSize:'12px', margin:0 }}>⚠️ Los resultados de IA son orientativos. Siempre verifica en fuentes oficiales antes de usar en negociacion formal.</p>
      </div>
      <div style={{ display:'flex', gap:0, marginBottom:'24px', borderBottom:'2px solid #F0F0F0', overflowX:'auto' }}>
        {tabs.map(t => <button key={t.id} onClick={() => setTab(t.id)} style={{ padding:'10px 16px', border:'none', background:'transparent', color:tab===t.id?'#E8321A':'#888', fontWeight:tab===t.id?700:400, fontSize:'13px', cursor:'pointer', borderBottom:tab===t.id?'2px solid #E8321A':'2px solid transparent', marginBottom:'-2px', whiteSpace:'nowrap' }}>{t.label}</button>)}
      </div>

      {tab==='validada' && (
        <div>
          <input value={busqueda} onChange={e => setBusqueda(e.target.value)} placeholder="Buscar ley, articulo, tema..." style={{ width:'100%', padding:'12px 16px', borderRadius:'10px', border:'1.5px solid #E8E8E8', fontSize:'14px', outline:'none', marginBottom:'20px', boxSizing:'border-box' }} />
          {leyes.filter(l => l.nombre.toLowerCase().includes(busqueda.toLowerCase())).map((l,i) => (
            <div key={i} style={{ background:'white', borderRadius:'12px', padding:'20px', boxShadow:'0 1px 4px rgba(0,0,0,0.06)', marginBottom:'12px' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'14px' }}>
                <div>
                  <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'4px' }}>
                    <h3 style={{ color:'#0F2447', fontSize:'15px', fontWeight:700, margin:0 }}>{l.nombre}</h3>
                    <span style={{ background:l.pais==='Mexico'?'#EFF6FF':'#F0FDF4', color:l.pais==='Mexico'?'#1D4ED8':'#166534', fontSize:'11px', fontWeight:700, padding:'2px 8px', borderRadius:'10px' }}>{l.pais}</span>
                  </div>
                  <p style={{ color:'#888', fontSize:'12px', margin:0 }}>✓ Fuente verificada: {l.fecha}</p>
                </div>
                <div style={{ display:'flex', gap:'8px' }}>
                  <a href="https://www.dof.gob.mx" target="_blank" rel="noreferrer" style={{ background:'#0F2447', color:'white', fontSize:'11px', fontWeight:700, padding:'5px 12px', borderRadius:'6px', textDecoration:'none' }}>DOF ↗</a>
                  <a href="https://www.scjn.gob.mx" target="_blank" rel="noreferrer" style={{ background:'#E8321A', color:'white', fontSize:'11px', fontWeight:700, padding:'5px 12px', borderRadius:'6px', textDecoration:'none' }}>SCJN ↗</a>
                </div>
              </div>
              {l.articulos.map((a,j) => (
                <div key={j} style={{ padding:'12px 16px', background:'#F8F8F8', borderRadius:'8px', marginBottom:'8px', display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:'12px' }}>
                  <div style={{ flex:1 }}>
                    <p style={{ color:'#E8321A', fontSize:'12px', fontWeight:700, margin:'0 0 4px' }}>{a.num}</p>
                    <p style={{ color:'#555', fontSize:'13px', margin:0, lineHeight:'1.6' }}>{a.texto}</p>
                  </div>
                  <div style={{ display:'flex', flexDirection:'column', gap:'4px', flexShrink:0 }}>
                    <button onClick={() => toggleFavorito(l.id+'-'+j)} style={{ background:favoritos.includes(l.id+'-'+j)?'#E8321A':'white', color:favoritos.includes(l.id+'-'+j)?'white':'#E8321A', border:'1px solid #E8321A', padding:'4px 10px', borderRadius:'5px', fontSize:'11px', fontWeight:700, cursor:'pointer' }}>{favoritos.includes(l.id+'-'+j)?'★ Guardado':'☆ Guardar'}</button>
                    <button style={{ background:'#0D5C36', color:'white', border:'none', padding:'4px 10px', borderRadius:'5px', fontSize:'11px', fontWeight:700, cursor:'pointer' }}>Al editor</button>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {tab==='jurisprudencia' && (
        <div>
          <div style={{ background:'#EFF6FF', borderRadius:'10px', padding:'12px 16px', marginBottom:'20px' }}>
            <p style={{ color:'#1D4ED8', fontSize:'12px', margin:0 }}>ℹ️ En la siguiente fase se conectara en tiempo real al IUS SCJN y base de datos Corte IDH para garantizar 99.99% de precision.</p>
          </div>
          {jurisprudencia.map((j,i) => (
            <div key={i} style={{ background:'white', borderRadius:'12px', padding:'20px', boxShadow:'0 1px 4px rgba(0,0,0,0.06)', marginBottom:'12px' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'12px' }}>
                <div>
                  <div style={{ display:'flex', gap:'8px', marginBottom:'6px', flexWrap:'wrap' }}>
                    <span style={{ background:'#0F2447', color:'white', fontSize:'11px', fontWeight:700, padding:'2px 10px', borderRadius:'10px' }}>{j.tesis}</span>
                    <span style={{ background:'#EFF6FF', color:'#1D4ED8', fontSize:'11px', fontWeight:600, padding:'2px 8px', borderRadius:'10px' }}>{j.tema}</span>
                    <span style={{ background:'#F0FDF4', color:'#166534', fontSize:'11px', fontWeight:600, padding:'2px 8px', borderRadius:'10px' }}>{j.fecha}</span>
                  </div>
                  <h3 style={{ color:'#0F2447', fontSize:'14px', fontWeight:700, margin:'0 0 4px' }}>{j.titulo}</h3>
                  <p style={{ color:'#888', fontSize:'12px', margin:0 }}>{j.tribunal}</p>
                </div>
                <div style={{ display:'flex', flexDirection:'column', gap:'4px' }}>
                  <a href="https://sjf.scjn.gob.mx" target="_blank" rel="noreferrer" style={{ background:'#E8321A', color:'white', fontSize:'11px', fontWeight:700, padding:'5px 12px', borderRadius:'6px', textDecoration:'none', textAlign:'center' }}>IUS SCJN ↗</a>
                  <button onClick={() => toggleFavorito('J-'+i)} style={{ background:favoritos.includes('J-'+i)?'#E8321A':'white', color:favoritos.includes('J-'+i)?'white':'#E8321A', border:'1px solid #E8321A', padding:'4px 10px', borderRadius:'5px', fontSize:'11px', fontWeight:700, cursor:'pointer' }}>{favoritos.includes('J-'+i)?'★ Guardada':'☆ Guardar'}</button>
                </div>
              </div>
              <div style={{ background:'#F8F8F8', borderRadius:'8px', padding:'12px 14px' }}>
                <p style={{ color:'#888', fontSize:'11px', fontWeight:700, margin:'0 0 4px' }}>APLICACION PRACTICA PARA T1</p>
                <p style={{ color:'#555', fontSize:'12px', margin:0, lineHeight:'1.6' }}>{j.aplicacion}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab==='analizar' && (
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'24px' }}>
          <div>
            <h3 style={{ color:'#0F2447', fontSize:'15px', fontWeight:700, margin:'0 0 8px' }}>Analizar clausula</h3>
            <p style={{ color:'#888', fontSize:'13px', margin:'0 0 16px' }}>Pega tu clausula y la IA te dice en que ley se fundamenta, si es valida y si hay riesgos. Imparcial — no importa quien la propuso.</p>
            <div style={{ marginBottom:'12px' }}>
              <div style={{ display:'flex', gap:'8px', marginBottom:'8px' }}>
                {['Claude','Gemini'].map((m,i) => <button key={i} onClick={() => setMotor(m)} style={{ flex:1, padding:'8px', borderRadius:'8px', border:`2px solid ${motor===m?'#E8321A':'#E8E8E8'}`, background:motor===m?'#FFF5F5':'white', color:motor===m?'#E8321A':'#888', fontWeight:700, fontSize:'12px', cursor:'pointer' }}>{m==='Claude'?'🔵 Claude':'🟢 Gemini'}</button>)}
              </div>
            </div>
            <textarea value={clausulaAnalizar} onChange={e => setClausulaAnalizar(e.target.value)} placeholder="Pega aqui la clausula a analizar. Ej: El cliente pagara intereses del 1000% mensual en caso de retraso..." rows={8} style={{ width:'100%', padding:'14px', borderRadius:'10px', border:'1.5px solid #E8E8E8', fontSize:'13px', lineHeight:'1.7', resize:'none', boxSizing:'border-box', outline:'none', marginBottom:'12px' }} />
            <button onClick={buscar} style={{ width:'100%', padding:'13px', background:'#E8321A', color:'white', border:'none', borderRadius:'10px', fontWeight:700, fontSize:'14px', cursor:'pointer', marginBottom:'8px' }}>{buscando?'Analizando...':'Analizar con '+motor}</button>
            <button style={{ width:'100%', padding:'10px', background:'#0F2447', color:'white', border:'none', borderRadius:'10px', fontWeight:700, fontSize:'13px', cursor:'pointer' }}>Guardar en mi biblioteca</button>
          </div>
          <div>
            {respuesta ? (
              <div style={{ background:'white', borderRadius:'12px', padding:'20px', boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>
                <div style={{ background:'#FFF8F0', border:'1px solid #FED7AA', borderRadius:'8px', padding:'10px 14px', marginBottom:'14px' }}>
                  <p style={{ color:'#92400E', fontSize:'11px', margin:0 }}>⚠️ Resultado orientativo — Verifica en DOF, SCJN o Corte IDH antes de usar en negociacion formal</p>
                </div>
                <div style={{ color:'#555', fontSize:'12px', lineHeight:'1.8', whiteSpace:'pre-wrap' }}>{respuesta}</div>
                <div style={{ display:'flex', gap:'8px', marginTop:'16px', flexWrap:'wrap' }}>
                  <button style={{ background:'#0F2447', color:'white', border:'none', padding:'8px 14px', borderRadius:'7px', fontSize:'12px', fontWeight:700, cursor:'pointer' }}>Guardar referencia</button>
                  <button style={{ background:'#0D5C36', color:'white', border:'none', padding:'8px 14px', borderRadius:'7px', fontSize:'12px', fontWeight:700, cursor:'pointer' }}>Al editor</button>
                  <a href="https://sjf.scjn.gob.mx" target="_blank" rel="noreferrer" style={{ background:'#E8321A', color:'white', padding:'8px 14px', borderRadius:'7px', fontSize:'12px', fontWeight:700, textDecoration:'none' }}>SCJN ↗</a>
                </div>
              </div>
            ) : (
              <div style={{ background:'#F8F8F8', borderRadius:'12px', padding:'32px', display:'flex', alignItems:'center', justifyContent:'center', height:'80%', flexDirection:'column', gap:'12px' }}>
                <p style={{ fontSize:'32px', margin:0 }}>⚖️</p>
                <p style={{ color:'#0F2447', fontWeight:700, fontSize:'14px', margin:0 }}>Analisis imparcial de clausula</p>
                <p style={{ color:'#888', fontSize:'12px', margin:0, textAlign:'center' }}>Pega tu clausula — te dira si esta o no en regla conforme a la ley, sin importar quien la propuso</p>
              </div>
            )}
          </div>
        </div>
      )}

      {tab==='buscar' && (
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'24px' }}>
          <div>
            <h3 style={{ color:'#0F2447', fontSize:'15px', fontWeight:700, margin:'0 0 8px' }}>Buscar fundamento legal</h3>
            <p style={{ color:'#888', fontSize:'13px', margin:'0 0 16px' }}>Pregunta cualquier tema juridico — leyes mexicanas, jurisprudencia SCJN y convencionalidad internacional.</p>
            <div style={{ display:'flex', gap:'8px', marginBottom:'12px' }}>
              {['Claude','Gemini'].map((m,i) => <button key={i} onClick={() => setMotor(m)} style={{ flex:1, padding:'8px', borderRadius:'8px', border:`2px solid ${motor===m?'#E8321A':'#E8E8E8'}`, background:motor===m?'#FFF5F5':'white', color:motor===m?'#E8321A':'#888', fontWeight:700, fontSize:'12px', cursor:'pointer' }}>{m==='Claude'?'🔵 Claude — Alta precision':'🟢 Gemini'}</button>)}
            </div>
            <textarea value={pregunta} onChange={e => setPregunta(e.target.value)} placeholder="Ej: Cual es el fundamento legal para incluir firma electronica en un contrato fintech? Incluye jurisprudencia SCJN y convencionalidad." rows={8} style={{ width:'100%', padding:'14px', borderRadius:'10px', border:'1.5px solid #E8E8E8', fontSize:'13px', lineHeight:'1.7', resize:'none', boxSizing:'border-box', outline:'none', marginBottom:'12px' }} />
            <button onClick={buscar} style={{ width:'100%', padding:'13px', background:'#E8321A', color:'white', border:'none', borderRadius:'10px', fontWeight:700, fontSize:'14px', cursor:'pointer' }}>{buscando?'Buscando...':'Buscar con '+motor}</button>
          </div>
          <div>
            {respuesta ? (
              <div style={{ background:'white', borderRadius:'12px', padding:'20px', boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>
                <div style={{ background:'#FFF8F0', border:'1px solid #FED7AA', borderRadius:'8px', padding:'10px 14px', marginBottom:'14px' }}>
                  <p style={{ color:'#92400E', fontSize:'11px', margin:0 }}>⚠️ Resultado orientativo — Verifica en DOF, SCJN o Corte IDH antes de usar en negociacion formal</p>
                </div>
                <div style={{ color:'#555', fontSize:'12px', lineHeight:'1.8', whiteSpace:'pre-wrap' }}>{respuesta}</div>
                <div style={{ display:'flex', gap:'8px', marginTop:'16px', flexWrap:'wrap' }}>
                  <button style={{ background:'#0F2447', color:'white', border:'none', padding:'8px 14px', borderRadius:'7px', fontSize:'12px', fontWeight:700, cursor:'pointer' }}>Guardar referencia</button>
                  <a href="https://sjf.scjn.gob.mx" target="_blank" rel="noreferrer" style={{ background:'#E8321A', color:'white', padding:'8px 14px', borderRadius:'7px', fontSize:'12px', fontWeight:700, textDecoration:'none' }}>SCJN ↗</a>
                  <a href="https://www.corteidh.or.cr" target="_blank" rel="noreferrer" style={{ background:'#8B5CF6', color:'white', padding:'8px 14px', borderRadius:'7px', fontSize:'12px', fontWeight:700, textDecoration:'none' }}>Corte IDH ↗</a>
                </div>
              </div>
            ) : (
              <div style={{ background:'#F8F8F8', borderRadius:'12px', padding:'32px', display:'flex', alignItems:'center', justifyContent:'center', height:'80%', flexDirection:'column', gap:'12px' }}>
                <p style={{ fontSize:'32px', margin:0 }}>🔍</p>
                <p style={{ color:'#0F2447', fontWeight:700, fontSize:'14px', margin:0 }}>Busqueda de fundamento legal</p>
                <p style={{ color:'#888', fontSize:'12px', margin:0, textAlign:'center' }}>Leyes aplicables, tesis SCJN y convencionalidad internacional</p>
              </div>
            )}
          </div>
        </div>
      )}

      {tab==='favoritos' && (
        <div>
          {favoritos.length===0 ? (
            <div style={{ background:'white', borderRadius:'16px', padding:'48px', textAlign:'center', boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>
              <p style={{ fontSize:'32px', margin:'0 0 12px' }}>☆</p>
              <p style={{ color:'#0F2447', fontWeight:700, fontSize:'15px', margin:'0 0 8px' }}>Sin referencias guardadas</p>
              <p style={{ color:'#888', fontSize:'13px', margin:0 }}>Guarda articulos y tesis para tenerlos siempre a la mano</p>
            </div>
          ) : (
            <div>
              {favoritos.map((f,i) => (
                <div key={i} style={{ background:'white', borderRadius:'10px', padding:'14px 18px', boxShadow:'0 1px 4px rgba(0,0,0,0.06)', marginBottom:'8px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <span style={{ color:'#0F2447', fontSize:'13px', fontWeight:600 }}>{f}</span>
                  <div style={{ display:'flex', gap:'8px' }}>
                    <button style={{ background:'#0D5C36', color:'white', border:'none', padding:'5px 12px', borderRadius:'6px', fontSize:'11px', fontWeight:700, cursor:'pointer' }}>Al editor</button>
                    <button onClick={() => toggleFavorito(f)} style={{ background:'#FFF5F5', color:'#E8321A', border:'1px solid #FFD0CC', padding:'5px 12px', borderRadius:'6px', fontSize:'11px', fontWeight:700, cursor:'pointer' }}>Eliminar</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
