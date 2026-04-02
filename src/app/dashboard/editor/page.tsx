'use client'
import { useState } from 'react'

export default function Editor() {
  const [tab, setTab] = useState('redactar')
  const [contenido, setContenido] = useState(`CONTRATO DE PRESTACION DE SERVICIOS\n\nQue celebran por una parte [NOMBRE CLIENTE], en adelante "EL CLIENTE", representado por [APODERADO], con RFC [RFC];\n\ny por la otra parte T1 Pagos S.A. de C.V., en adelante "T1", al tenor de las siguientes clausulas:\n\nI. OBJETO\nT1 prestara los servicios de [DESCRIPCION] al CLIENTE durante la vigencia del presente contrato.\n\nII. VIGENCIA\nEl presente contrato tendra una vigencia de [VIGENCIA] a partir de la fecha de firma.\n\nIII. CONTRAPRESTACION\nEl CLIENTE pagara a T1 la cantidad de [MONTO] dentro de los [PLAZO] dias [TIPO_DIAS] siguientes a la facturacion.\n\nIV. CONFIDENCIALIDAD\nAmbas partes se obligan a mantener confidencial toda informacion intercambiada durante la vigencia del contrato.`)
  const [clausulaSeleccionada, setClausulaSeleccionada] = useState('')
  const [mostrarNuevaClausula, setMostrarNuevaClausula] = useState(false)
  const [nuevaClausula, setNuevaClausula] = useState({ titulo: '', texto: '' })
  const [mostrarAutocompletar, setMostrarAutocompletar] = useState(false)
  const [plantillaSeleccionada, setPlantillaSeleccionada] = useState('')
  const [formatoEnvio, setFormatoEnvio] = useState('PDF')

  const datosSolicitante = {
    nombre: 'Empresa Solistica S.A. de C.V.',
    rfc: 'SOL920301ABC',
    apoderado: 'Carlos Ramirez Lopez',
    vigencia: '12 meses',
    plazo: '30',
    tipo_dias: 'naturales',
    descripcion: 'Servicios de logistica y distribucion',
    monto: '$500,000 MXN',
  }

  const tabs = ['redactar','documento','biblioteca','colaboradores','enviar']
  const tabLabels: Record<string,string> = {
    redactar:'Redactar', documento:'Documento base',
    biblioteca:'Plantillas y Clausulas', colaboradores:'Colaboradores', enviar:'Enviar'
  }

  const plantillas = [
    { id:'P1', titulo:'Contrato de Servicios', campos:['NOMBRE CLIENTE','RFC','APODERADO','VIGENCIA','MONTO','PLAZO','TIPO_DIAS','DESCRIPCION'] },
    { id:'P2', titulo:'Contrato de Compraventa', campos:['NOMBRE CLIENTE','RFC','APODERADO','PRECIO','FORMA DE PAGO'] },
    { id:'P3', titulo:'NDA', campos:['NOMBRE CLIENTE','RFC','APODERADO','VIGENCIA'] },
    { id:'P4', titulo:'Convenio Modificatorio', campos:['CONTRATO ORIGINAL','CLAUSULAS A MODIFICAR'] },
    { id:'P5', titulo:'Terminos y Condiciones', campos:['NOMBRE EMPRESA','FECHA'] },
    { id:'P6', titulo:'Anexo', campos:['NOMBRE CLIENTE','RFC','CONTRATO REFERENCIA'] },
  ]

  const clausulas = [
    { id:'C1', titulo:'Confidencialidad', texto:'Las partes se obligan a mantener confidencial toda informacion intercambiada durante la vigencia y 2 años posteriores.' },
    { id:'C2', titulo:'Vigencia con prorroga', texto:'El contrato tendra vigencia de [X] meses, prorrogable automaticamente por periodos iguales.' },
    { id:'C3', titulo:'Penalizacion por incumplimiento', texto:'En caso de incumplimiento, la parte responsable pagara el [X]% del valor total del contrato.' },
    { id:'C4', titulo:'Rescision', texto:'Cualquiera de las partes podra rescindir con [X] dias naturales de anticipacion mediante aviso por escrito.' },
    { id:'C5', titulo:'Jurisdiccion CDMX', texto:'Para todo lo relacionado con el presente, las partes se someten a los tribunales competentes de CDMX.' },
    { id:'C6', titulo:'Firma electronica', texto:'Las partes aceptan la firma electronica con plena validez legal conforme Arts. 89-90 Codigo de Comercio.' },
    { id:'C7', titulo:'Limitacion de responsabilidad', texto:'La responsabilidad de T1 se limita en todo caso al monto total pactado en el presente contrato.' },
    { id:'C8', titulo:'Propiedad intelectual T1', texto:'Todos los desarrollos, creaciones y entregables son propiedad exclusiva e intransferible de T1 Pagos.' },
  ]

  const colaboradores = [
    { nombre:'Jovanni Poceros', rol:'Responsable legal', estado:'Trabajando', color:'#0D5C36' },
    { nombre:'Finanzas', rol:'Revisor clausulas economicas', estado:'VoBo pendiente', color:'#3B82F6' },
  ]

  const autocompletar = () => {
    let nuevo = contenido
    nuevo = nuevo.replace(/\[NOMBRE CLIENTE\]/g, datosSolicitante.nombre)
    nuevo = nuevo.replace(/\[RFC\]/g, datosSolicitante.rfc)
    nuevo = nuevo.replace(/\[APODERADO\]/g, datosSolicitante.apoderado)
    nuevo = nuevo.replace(/\[VIGENCIA\]/g, datosSolicitante.vigencia)
    nuevo = nuevo.replace(/\[PLAZO\]/g, datosSolicitante.plazo)
    nuevo = nuevo.replace(/\[TIPO_DIAS\]/g, datosSolicitante.tipo_dias)
    nuevo = nuevo.replace(/\[DESCRIPCION\]/g, datosSolicitante.descripcion)
    nuevo = nuevo.replace(/\[MONTO\]/g, datosSolicitante.monto)
    setContenido(nuevo)
    setMostrarAutocompletar(false)
  }

  const Tabs = () => (
    <div style={{ display:'flex', gap:0, marginBottom:'24px', borderBottom:'2px solid #F0F0F0' }}>
      {tabs.map(t => (
        <button key={t} onClick={() => setTab(t)} style={{ padding:'10px 18px', border:'none', background:'transparent', color:tab===t?'#E8321A':'#888', fontWeight:tab===t?700:400, fontSize:'13px', cursor:'pointer', borderBottom:tab===t?'2px solid #E8321A':'2px solid transparent', marginBottom:'-2px' }}>
          {tabLabels[t]}
        </button>
      ))}
    </div>
  )

  return (
    <div style={{ padding:'32px', fontFamily:'sans-serif' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'24px' }}>
        <div>
          <h1 style={{ color:'#0F2447', fontSize:'24px', fontWeight:700, margin:'0 0 4px' }}>Editor de Contratos</h1>
          <p style={{ color:'#888', margin:0 }}>C-2026-001 — Empresa Solistica — Contrato de servicios</p>
        </div>
        <div style={{ display:'flex', gap:'8px' }}>
          <span style={{ background:'#EFF6FF', color:'#1D4ED8', fontSize:'12px', fontWeight:700, padding:'4px 12px', borderRadius:'20px' }}>En proceso</span>
          <span style={{ background:'#FEF3C7', color:'#92400E', fontSize:'12px', fontWeight:700, padding:'4px 12px', borderRadius:'20px' }}>Version 3</span>
        </div>
      </div>

      {mostrarAutocompletar && (
        <div style={{ position:'fixed', top:0, left:0, right:0, bottom:0, background:'rgba(0,0,0,0.5)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <div style={{ background:'white', borderRadius:'16px', padding:'32px', width:'100%', maxWidth:'520px', boxShadow:'0 8px 32px rgba(0,0,0,0.2)' }}>
            <h3 style={{ color:'#0F2447', fontSize:'18px', fontWeight:700, margin:'0 0 8px' }}>Autocompletar con datos del solicitante</h3>
            <p style={{ color:'#888', fontSize:'13px', margin:'0 0 20px' }}>Se llenaran automaticamente los siguientes campos:</p>
            <div style={{ background:'#F8F8F8', borderRadius:'10px', padding:'16px', marginBottom:'20px' }}>
              {Object.entries(datosSolicitante).map(([k,v],i) => (
                <div key={i} style={{ display:'flex', justifyContent:'space-between', padding:'6px 0', borderBottom:'1px solid #F0F0F0' }}>
                  <span style={{ color:'#E8321A', fontSize:'12px', fontWeight:700, fontFamily:'monospace' }}>[{k.toUpperCase().replace('_',' ')}]</span>
                  <span style={{ color:'#0F2447', fontSize:'12px', fontWeight:600 }}>{v}</span>
                </div>
              ))}
            </div>
            <div style={{ display:'flex', gap:'10px' }}>
              <button onClick={autocompletar} style={{ flex:1, padding:'12px', background:'#E8321A', color:'white', border:'none', borderRadius:'8px', fontWeight:700, fontSize:'14px', cursor:'pointer' }}>
                ✓ Autocompletar ahora
              </button>
              <button onClick={() => setMostrarAutocompletar(false)} style={{ padding:'12px 20px', background:'white', color:'#888', border:'1.5px solid #E8E8E8', borderRadius:'8px', fontWeight:700, fontSize:'14px', cursor:'pointer' }}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{ background:'white', borderRadius:'16px', padding:'24px', boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>
        <Tabs />

        {tab === 'redactar' && (
          <div style={{ display:'grid', gridTemplateColumns:'1fr 260px', gap:'24px' }}>
            <div>
              <div style={{ display:'flex', gap:'6px', flexWrap:'wrap', marginBottom:'12px', padding:'10px', background:'#F8F8F8', borderRadius:'8px', alignItems:'center' }}>
                {['B','I','U','H1','H2','Lista','Tabla'].map((t,i) => (
                  <button key={i} style={{ padding:'4px 10px', borderRadius:'5px', border:'1px solid #E0E2E6', background:'white', color:'#0F2447', fontSize:'12px', cursor:'pointer', fontWeight:600 }}>{t}</button>
                ))}
                <div style={{ marginLeft:'auto', display:'flex', gap:'6px' }}>
                  <button onClick={() => setMostrarAutocompletar(true)}
                    style={{ padding:'6px 14px', borderRadius:'6px', border:'none', background:'#E8321A', color:'white', fontSize:'12px', cursor:'pointer', fontWeight:700 }}>
                    ⚡ Autocompletar
                  </button>
                  <button style={{ padding:'6px 14px', borderRadius:'6px', border:'none', background:'#0D5C36', color:'white', fontSize:'12px', cursor:'pointer', fontWeight:700 }}>
                    Guardar
                  </button>
                </div>
              </div>
              <textarea value={contenido} onChange={e => setContenido(e.target.value)}
                style={{ width:'100%', minHeight:'520px', padding:'24px', borderRadius:'10px', border:'1.5px solid #E8E8E8', fontSize:'14px', color:'#0F2447', lineHeight:'1.9', resize:'vertical', fontFamily:'Georgia, serif', boxSizing:'border-box', outline:'none' }} />
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
              <div style={{ background:'#FFF5F5', borderRadius:'12px', padding:'16px', border:'1px solid #FFD0CC' }}>
                <p style={{ color:'#C42A15', fontSize:'12px', fontWeight:700, margin:'0 0 6px' }}>⚡ GENERACION RAPIDA</p>
                <p style={{ color:'#C42A15', fontSize:'11px', margin:'0 0 10px' }}>Ve a Plantillas y Clausulas, selecciona una plantilla y haz clic en Autocompletar. El contrato se llena en segundos con los datos del solicitante.</p>
                <button onClick={() => setTab('biblioteca')} style={{ width:'100%', padding:'8px', background:'#E8321A', color:'white', border:'none', borderRadius:'6px', fontSize:'12px', fontWeight:700, cursor:'pointer' }}>
                  Ir a Plantillas →
                </button>
              </div>
              <div style={{ background:'#F8F8F8', borderRadius:'12px', padding:'14px' }}>
                <p style={{ color:'#0F2447', fontSize:'12px', fontWeight:700, margin:'0 0 8px' }}>CAMPOS DISPONIBLES</p>
                {['[NOMBRE CLIENTE]','[RFC]','[APODERADO]','[VIGENCIA]','[MONTO]','[PLAZO]','[TIPO_DIAS]','[DESCRIPCION]'].map((c,i) => (
                  <div key={i} onClick={() => setContenido(prev => prev + ' ' + c)}
                    style={{ padding:'5px 10px', borderRadius:'6px', border:'1px solid #E8E8E8', marginBottom:'4px', fontSize:'11px', color:'#E8321A', background:'white', cursor:'pointer', fontFamily:'monospace', fontWeight:700 }}>{c}</div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === 'documento' && (
          <div>
            <div style={{ background:'#FFF8F0', border:'1px solid #FED7AA', borderRadius:'10px', padding:'14px 18px', marginBottom:'20px', display:'flex', alignItems:'center', gap:'12px' }}>
              <span style={{ fontSize:'24px' }}>📎</span>
              <div style={{ flex:1 }}>
                <p style={{ color:'#92400E', fontWeight:700, fontSize:'13px', margin:'0 0 2px' }}>Documento cargado por el solicitante</p>
                <p style={{ color:'#92400E', fontSize:'12px', margin:0 }}>Contrato_Solistica_v1.pdf — Cargado el 01/04/2026</p>
              </div>
              <button style={{ background:'#0F2447', color:'white', border:'none', padding:'8px 16px', borderRadius:'8px', fontSize:'12px', fontWeight:700, cursor:'pointer' }}>Descargar</button>
            </div>
            <div style={{ background:'#F8F8F8', borderRadius:'10px', padding:'24px', minHeight:'400px', border:'1.5px solid #E8E8E8', marginBottom:'16px' }}>
              <p style={{ color:'#0F2447', fontWeight:700, textAlign:'center', marginBottom:'20px', fontSize:'15px' }}>DOCUMENTO ORIGINAL DEL SOLICITANTE</p>
              {[
                { num:'I. Objeto', texto:'Los servicios incluiran penalizacion del 50% sobre el valor total.', riesgo:'alto', tag:'Riesgo alto para T1' },
                { num:'II. Vigencia', texto:'El contrato tendra vigencia indefinida sin posibilidad de rescision unilateral.', riesgo:'medio', tag:'Revision recomendada' },
                { num:'III. Pago', texto:'El pago se realizara a 90 dias naturales sin penalizacion por retraso.', riesgo:'alto', tag:'Riesgo alto para T1' },
              ].map((c,i) => (
                <div key={i} style={{ marginBottom:'16px', padding:'14px', background:'white', borderRadius:'8px', border:'1px solid #F0F0F0' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'8px' }}>
                    <p style={{ color:'#0F2447', fontWeight:700, fontSize:'13px', margin:0 }}>Clausula {c.num}</p>
                    <div style={{ display:'flex', gap:'6px' }}>
                      <span style={{ background:c.riesgo==='alto'?'#FEE2E2':'#FEF9C3', color:c.riesgo==='alto'?'#C42A15':'#92400E', fontSize:'11px', fontWeight:700, padding:'2px 8px', borderRadius:'10px' }}>{c.tag}</span>
                      <button style={{ background:'#E8321A', color:'white', border:'none', padding:'4px 10px', borderRadius:'5px', fontSize:'11px', fontWeight:700, cursor:'pointer' }}>Enviar a IA</button>
                    </div>
                  </div>
                  <p style={{ color:'#555', fontSize:'13px', margin:0, lineHeight:'1.6' }}>{c.texto}</p>
                </div>
              ))}
            </div>
            <div style={{ display:'flex', gap:'8px' }}>
              <button style={{ background:'#E8321A', color:'white', border:'none', padding:'10px 20px', borderRadius:'8px', fontSize:'13px', fontWeight:700, cursor:'pointer' }}>Enviar documento completo a IA</button>
              <button style={{ background:'#0D5C36', color:'white', border:'none', padding:'10px 20px', borderRadius:'8px', fontSize:'13px', fontWeight:700, cursor:'pointer' }}>Pasar version final al editor</button>
            </div>
          </div>
        )}

        {tab === 'biblioteca' && (
          <div>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px' }}>
              <div>
                <h3 style={{ color:'#0F2447', fontSize:'16px', fontWeight:700, margin:'0 0 4px' }}>Plantillas y Clausulas</h3>
                <p style={{ color:'#888', fontSize:'13px', margin:0 }}>Carga una plantilla completa o inserta clausulas individuales</p>
              </div>
              <button onClick={() => setMostrarNuevaClausula(!mostrarNuevaClausula)}
                style={{ background:'#0F2447', color:'white', border:'none', padding:'8px 18px', borderRadius:'8px', fontSize:'13px', fontWeight:700, cursor:'pointer' }}>+ Agregar nueva</button>
            </div>

            {mostrarNuevaClausula && (
              <div style={{ background:'#F8F8F8', borderRadius:'12px', padding:'20px', marginBottom:'20px', border:'1.5px solid #E8E8E8' }}>
                <h4 style={{ color:'#0F2447', fontSize:'14px', fontWeight:700, margin:'0 0 16px' }}>Nueva clausula o plantilla</h4>
                <input value={nuevaClausula.titulo} onChange={e => setNuevaClausula(n => ({...n, titulo:e.target.value}))}
                  placeholder="Titulo" style={{ width:'100%', padding:'10px 14px', borderRadius:'8px', border:'1.5px solid #E8E8E8', fontSize:'13px', boxSizing:'border-box', outline:'none', marginBottom:'10px' }} />
                <textarea value={nuevaClausula.texto} onChange={e => setNuevaClausula(n => ({...n, texto:e.target.value}))}
                  placeholder="Contenido de la clausula o plantilla..." rows={4}
                  style={{ width:'100%', padding:'10px 14px', borderRadius:'8px', border:'1.5px solid #E8E8E8', fontSize:'13px', boxSizing:'border-box', resize:'vertical', outline:'none', marginBottom:'12px' }} />
                <div style={{ display:'flex', gap:'8px' }}>
                  <button style={{ background:'#E8321A', color:'white', border:'none', padding:'8px 20px', borderRadius:'8px', fontSize:'13px', fontWeight:700, cursor:'pointer' }}>Guardar en biblioteca</button>
                  <button onClick={() => setMostrarNuevaClausula(false)} style={{ background:'white', color:'#888', border:'1.5px solid #E8E8E8', padding:'8px 20px', borderRadius:'8px', fontSize:'13px', fontWeight:700, cursor:'pointer' }}>Cancelar</button>
                </div>
              </div>
            )}

            <p style={{ color:'#0F2447', fontSize:'13px', fontWeight:700, margin:'0 0 12px', paddingBottom:'8px', borderBottom:'1px solid #F0F0F0' }}>PLANTILLAS COMPLETAS — Generacion automatica en segundos</p>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'12px', marginBottom:'28px' }}>
              {plantillas.map((p,i) => (
                <div key={i} style={{ padding:'16px', borderRadius:'10px', border:`1.5px solid ${plantillaSeleccionada===p.id?'#E8321A':'#E8E8E8'}`, background:plantillaSeleccionada===p.id?'#FFF5F5':'white', cursor:'pointer' }}
                  onClick={() => setPlantillaSeleccionada(p.id)}>
                  <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'8px' }}>
                    <span style={{ fontSize:'18px' }}>📄</span>
                    <p style={{ color:'#0F2447', fontWeight:700, fontSize:'13px', margin:0 }}>{p.titulo}</p>
                  </div>
                  <p style={{ color:'#888', fontSize:'11px', margin:'0 0 10px' }}>{p.campos.length} campos automaticos</p>
                  <button onClick={e => { e.stopPropagation(); setPlantillaSeleccionada(p.id); setMostrarAutocompletar(true) }}
                    style={{ width:'100%', background:'#E8321A', color:'white', border:'none', padding:'7px', borderRadius:'6px', fontSize:'12px', fontWeight:700, cursor:'pointer' }}>
                    ⚡ Cargar y autocompletar
                  </button>
                </div>
              ))}
            </div>

            <p style={{ color:'#0F2447', fontSize:'13px', fontWeight:700, margin:'0 0 12px', paddingBottom:'8px', borderBottom:'1px solid #F0F0F0' }}>CLAUSULAS BASE</p>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
              {clausulas.map((c,i) => (
                <div key={i} onClick={() => setClausulaSeleccionada(clausulaSeleccionada===c.id?'':c.id)}
                  style={{ padding:'14px 16px', borderRadius:'10px', border:`1.5px solid ${clausulaSeleccionada===c.id?'#E8321A':'#E8E8E8'}`, background:clausulaSeleccionada===c.id?'#FFF5F5':'white', cursor:'pointer' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                    <div style={{ flex:1 }}>
                      <p style={{ color:'#0F2447', fontWeight:700, fontSize:'13px', margin:'0 0 4px' }}>{c.titulo}</p>
                      <p style={{ color:'#888', fontSize:'11px', margin:0 }}>{c.texto.substring(0,55)}...</p>
                    </div>
                    <div style={{ display:'flex', flexDirection:'column', gap:'4px', marginLeft:'10px' }}>
                      <button onClick={e => { e.stopPropagation(); setContenido(prev => prev + '\n\n' + c.texto) }}
                        style={{ background:'#0F2447', color:'white', border:'none', padding:'4px 10px', borderRadius:'5px', fontSize:'11px', fontWeight:700, cursor:'pointer' }}>Insertar</button>
                      <button onClick={e => { e.stopPropagation(); setContenido(prev => prev + '\n\n' + c.texto); setTab('redactar') }}
                        style={{ background:'#E8321A', color:'white', border:'none', padding:'4px 10px', borderRadius:'5px', fontSize:'11px', fontWeight:700, cursor:'pointer' }}>+ Editor</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'colaboradores' && (
          <div>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px' }}>
              <h3 style={{ color:'#0F2447', fontSize:'14px', fontWeight:700, margin:0 }}>Equipo de trabajo en este contrato</h3>
              <button style={{ background:'#0F2447', color:'white', border:'none', padding:'8px 18px', borderRadius:'8px', fontSize:'13px', fontWeight:700, cursor:'pointer' }}>+ Invitar colaborador</button>
            </div>
            {colaboradores.map((c,i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:'16px', padding:'16px', borderRadius:'10px', border:'1px solid #F0F0F0', marginBottom:'8px' }}>
                <div style={{ width:'40px', height:'40px', borderRadius:'50%', background:c.color, display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontWeight:700, fontSize:'16px' }}>
                  {c.nombre.charAt(0)}
                </div>
                <div style={{ flex:1 }}>
                  <p style={{ color:'#0F2447', fontWeight:700, fontSize:'14px', margin:'0 0 2px' }}>{c.nombre}</p>
                  <p style={{ color:'#888', fontSize:'12px', margin:0 }}>{c.rol}</p>
                </div>
                <span style={{ background:c.color+'20', color:c.color, fontSize:'12px', fontWeight:700, padding:'4px 12px', borderRadius:'20px' }}>{c.estado}</span>
              </div>
            ))}
            <div style={{ background:'#EFF6FF', borderRadius:'10px', padding:'14px 18px', marginTop:'16px' }}>
              <p style={{ color:'#1D4ED8', fontSize:'13px', fontWeight:700, margin:'0 0 4px' }}>El tracking completo vive en Expediente</p>
              <p style={{ color:'#1D4ED8', fontSize:'12px', margin:'0 0 10px' }}>Historial de versiones, revisiones y cambios en tiempo real.</p>
              <button style={{ background:'#0F2447', color:'white', border:'none', padding:'8px 18px', borderRadius:'8px', fontSize:'12px', fontWeight:700, cursor:'pointer' }}>Ver expediente C-2026-001</button>
            </div>
          </div>
        )}

        {tab === 'enviar' && (
          <div>
            <h3 style={{ color:'#0F2447', fontSize:'16px', fontWeight:700, margin:'0 0 24px' }}>Enviar documento al solicitante</h3>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'24px' }}>
              <div>
                <label style={{ display:'block', color:'#0F2447', fontWeight:600, fontSize:'13px', marginBottom:'12px' }}>Formato de envio</label>
                <div style={{ display:'flex', gap:'12px', marginBottom:'20px' }}>
                  {[{label:'PDF',icon:'📕'},{label:'Word (DOCX)',icon:'📘'}].map((f,i) => (
                    <div key={i} onClick={() => setFormatoEnvio(f.label)}
                      style={{ flex:1, padding:'20px 16px', borderRadius:'12px', border:`2px solid ${formatoEnvio===f.label?'#E8321A':'#E8E8E8'}`, cursor:'pointer', textAlign:'center', background:formatoEnvio===f.label?'#FFF5F5':'white', transition:'all 0.2s' }}>
                      <div style={{ fontSize:'32px', marginBottom:'8px' }}>{f.icon}</div>
                      <p style={{ color:formatoEnvio===f.label?'#E8321A':'#888', fontWeight:700, fontSize:'13px', margin:0 }}>{f.label}</p>
                      {formatoEnvio===f.label && <p style={{ color:'#E8321A', fontSize:'11px', margin:'4px 0 0', fontWeight:600 }}>✓ Seleccionado</p>}
                    </div>
                  ))}
                </div>
                <label style={{ display:'block', color:'#0F2447', fontWeight:600, fontSize:'13px', marginBottom:'8px' }}>Mensaje (opcional)</label>
                <textarea rows={4} placeholder="Ej: Adjunto el contrato revisado. Por favor revisa las clausulas III y V y confirma tu conformidad..."
                  style={{ width:'100%', padding:'12px', borderRadius:'8px', border:'1.5px solid #E8E8E8', fontSize:'13px', boxSizing:'border-box', resize:'vertical', outline:'none', marginBottom:'16px' }} />
                <button style={{ width:'100%', padding:'14px', background:'#E8321A', color:'white', border:'none', borderRadius:'10px', fontWeight:700, fontSize:'15px', cursor:'pointer' }}>
                  Enviar documento en {formatoEnvio} →
                </button>
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
                <div style={{ background:'#F0FDF4', border:'1px solid #BBF7D0', borderRadius:'12px', padding:'16px' }}>
                  <p style={{ color:'#166534', fontSize:'13px', fontWeight:700, margin:'0 0 6px' }}>✓ Que pasa cuando envias</p>
                  {['El solicitante recibe notificacion en su portal','Puede descargar el documento en el formato elegido','Queda registrado en el expediente con fecha y hora','El tracking se actualiza automaticamente'].map((t,i) => (
                    <p key={i} style={{ color:'#166534', fontSize:'12px', margin:'4px 0', display:'flex', gap:'6px', alignItems:'flex-start' }}>
                      <span>•</span>{t}
                    </p>
                  ))}
                </div>
                <div style={{ background:'#FFF8F0', border:'1px solid #FED7AA', borderRadius:'12px', padding:'16px' }}>
                  <p style={{ color:'#92400E', fontSize:'13px', fontWeight:700, margin:'0 0 6px' }}>📋 Detalles del envio</p>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'4px' }}>
                    <span style={{ color:'#92400E', fontSize:'12px' }}>Destinatario:</span>
                    <span style={{ color:'#92400E', fontSize:'12px', fontWeight:600 }}>Empresa Solistica</span>
                  </div>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'4px' }}>
                    <span style={{ color:'#92400E', fontSize:'12px' }}>Expediente:</span>
                    <span style={{ color:'#92400E', fontSize:'12px', fontWeight:600 }}>C-2026-001</span>
                  </div>
                  <div style={{ display:'flex', justifyContent:'space-between' }}>
                    <span style={{ color:'#92400E', fontSize:'12px' }}>Formato:</span>
                    <span style={{ color:'#92400E', fontSize:'12px', fontWeight:600 }}>{formatoEnvio}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
