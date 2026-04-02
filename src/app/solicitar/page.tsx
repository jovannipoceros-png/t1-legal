'use client'
import { useState } from 'react'

export default function Solicitar() {
  const [paso, setPaso] = useState(0)
  const [flujo, setFlujo] = useState<'A'|'B'|''>('')
  const [form, setForm] = useState({
    nombre: '', correo: '', area: '', area_otro: '',
    empresa_t1: 'T1.com', es_lider: '', lider_nombre: '', lider_correo: '',
    tipo_solicitud: '', tipo_solicitud_otro: '',
    condiciones_especiales: '', descripcion: '',
    idioma: '', idioma_otro: '',
    nombre_empresa: '', rfc: '', apoderado: '', nacionalidad: '',
    vigencia: '', contraprestacion: '', adjunta_tarifas: false,
    plazo_pago: '', tipo_dias_pago: 'naturales',
    tipo_firma: '', plataforma_firma: '',
    prioridad: 'Media', fecha_limite: '',
    tiene_contrato_previo: '', requiere_traduccion: '', idioma_traduccion: '',
    condiciones_aplican: '',
    confidencial: false,
  })
  const [archivos, setArchivos] = useState<File[]>([])
  const [analizando, setAnalizando] = useState(false)
  const [analisisIA, setAnalisisIA] = useState<any>(null)
  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }))

  const areas = ['T1 Pagos','T1 Envios','T1 Tienda','T1 Score','Ultima Milla','Marketing','RH','TI','Juridico','Otro']
  const tipos = ['Contrato','Convenio de Confidencialidad','Convenio Modificatorio','Anexo','Otro']
  const idiomas = ['Español','Inglés','Español - Inglés','Otro']
  const firmas = ['Electronica','Fisica','SORA','Otro']
  const total = 5

  const esAccesoTotal = form.area==='Juridico'

  const getPermisoLabel = () => {
    if (esAccesoTotal) return { texto:'✓ Acceso total — Mismo nivel que Direccion Juridica', color:'#0D5C36', bg:'#F0FDF4', border:'#BBF7D0' }
    if (form.es_lider==='si') return { texto:'✓ Lider de area — Veras todas las solicitudes de tu equipo', color:'#1D4ED8', bg:'#EFF6FF', border:'#BFDBFE' }
    return { texto:'✓ Solicitante — Solo veras tus propias solicitudes', color:'#92400E', bg:'#FEF3C7', border:'#FDE68A' }
  }

  const analizarDocumento = () => {
    setAnalizando(true)
    setTimeout(() => {
      setAnalisisIA({
        datos: { nombre_empresa:'Detectado en documento', rfc:'Pendiente — No encontrado en documento', apoderado:'Detectado en documento', vigencia:'12 meses', contraprestacion:'$500,000 MXN mensuales' },
        riesgos: flujo==='A' ? [
          { nivel:'Alto', clausula:'Clausula III', descripcion:'Penalizacion del 50% del valor total a cargo del prestador de servicios.' },
          { nivel:'Alto', clausula:'Clausula V', descripcion:'Pago a 90 dias naturales sin penalizacion por retraso.' },
          { nivel:'Medio', clausula:'Clausula II', descripcion:'Vigencia indefinida sin clausula de rescision unilateral.' },
        ] : null
      })
      setAnalizando(false)
    }, 2000)
  }

  const Progress = () => (
    <div style={{ padding:'0 32px 24px', borderBottom:'1px solid #F0F0F0', marginBottom:'32px' }}>
      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'12px' }}>
        {['Solicitante','Documento','Contraparte','Condiciones','Archivos'].map((s,i) => (
          <div key={i} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'6px', width:'20%' }}>
            <div style={{ width:'32px', height:'32px', borderRadius:'50%', background:i+1<=paso?'#E8321A':'#F0F0F0', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'12px', fontWeight:700, color:i+1<=paso?'white':'#999' }}>
              {i+1<paso?'✓':i+1}
            </div>
            <span style={{ fontSize:'10px', color:i+1<=paso?'#E8321A':'#999', fontWeight:i+1===paso?700:400, textAlign:'center' }}>{s}</span>
          </div>
        ))}
      </div>
      <div style={{ height:'3px', background:'#F0F0F0', borderRadius:'2px' }}>
        <div style={{ height:'100%', width:`${((paso-1)/(total-1))*100}%`, background:'#E8321A', borderRadius:'2px', transition:'width 0.4s' }} />
      </div>
    </div>
  )

  const Label = ({ text }: { text: string }) => (
    <label style={{ display:'block', color:'#0F2447', fontSize:'13px', fontWeight:600, marginBottom:'6px' }}>{text}</label>
  )
  const Input = ({ k, placeholder, type='text' }: { k: string, placeholder: string, type?: string }) => (
    <input type={type} placeholder={placeholder} value={(form as any)[k]} onChange={e => set(k, e.target.value)}
      style={{ width:'100%', padding:'12px 16px', borderRadius:'10px', border:'1.5px solid #E8E8E8', background:'white', color:'#0F2447', fontSize:'14px', boxSizing:'border-box', outline:'none' }} />
  )
  const Select = ({ k, options }: { k: string, options: string[] }) => (
    <select value={(form as any)[k]} onChange={e => set(k, e.target.value)}
      style={{ width:'100%', padding:'12px 16px', borderRadius:'10px', border:'1.5px solid #E8E8E8', background:'white', color:'#0F2447', fontSize:'14px', boxSizing:'border-box', outline:'none' }}>
      <option value="">Selecciona...</option>
      {options.map((o,i) => <option key={i}>{o}</option>)}
    </select>
  )
  const Textarea = ({ k, placeholder }: { k: string, placeholder: string }) => (
    <textarea placeholder={placeholder} value={(form as any)[k]} onChange={e => set(k, e.target.value)} rows={3}
      style={{ width:'100%', padding:'12px 16px', borderRadius:'10px', border:'1.5px solid #E8E8E8', background:'white', color:'#0F2447', fontSize:'14px', boxSizing:'border-box', resize:'vertical', outline:'none' }} />
  )
  const Btn = ({ label, onClick, secondary=false }: { label: string, onClick: () => void, secondary?: boolean }) => (
    <button onClick={onClick} style={{ padding:'12px 28px', borderRadius:'10px', border:secondary?'1.5px solid #E8E8E8':'none', background:secondary?'white':'#E8321A', color:secondary?'#666':'white', fontWeight:700, fontSize:'14px', cursor:'pointer' }}>{label}</button>
  )

  if (paso===0) {
    return (
      <div style={{ minHeight:'100vh', background:'#F8F8F8', fontFamily:'sans-serif' }}>
        <div style={{ background:'linear-gradient(135deg, #E8321A 0%, #C42A15 100%)', padding:'20px 32px', display:'flex', alignItems:'center', gap:'12px' }}>
          <span style={{ background:'white', color:'#E8321A', fontWeight:900, fontSize:'18px', padding:'3px 12px', borderRadius:'6px' }}>T1</span>
          <span style={{ color:'white', fontWeight:700, fontSize:'18px' }}>Legal — Nueva Solicitud</span>
        </div>
        <div style={{ maxWidth:'680px', margin:'60px auto', padding:'0 16px' }}>
          <div style={{ textAlign:'center', marginBottom:'40px' }}>
            <h1 style={{ color:'#0F2447', fontSize:'26px', fontWeight:700, margin:'0 0 8px' }}>¿Como quieres trabajar este documento?</h1>
            <p style={{ color:'#888', fontSize:'14px', margin:0 }}>Selecciona el tipo de flujo para continuar</p>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px' }}>
            <div onClick={() => { setFlujo('A'); setPaso(1) }}
              style={{ background:'white', borderRadius:'16px', padding:'32px', boxShadow:'0 2px 16px rgba(0,0,0,0.06)', cursor:'pointer', border:'2px solid transparent', transition:'all 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.border='2px solid #E8321A')}
              onMouseLeave={e => (e.currentTarget.style.border='2px solid transparent')}>
              <div style={{ width:'56px', height:'56px', borderRadius:'14px', background:'#FFF5F5', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'28px', marginBottom:'16px' }}>📄</div>
              <h3 style={{ color:'#0F2447', fontSize:'17px', fontWeight:700, margin:'0 0 8px' }}>Documento del socio comercial</h3>
              <p style={{ color:'#888', fontSize:'13px', lineHeight:'1.6', margin:'0 0 16px' }}>La contraparte proporciono su contrato o documento. La IA lo analiza, extrae los datos automaticamente y detecta clausulas de riesgo para T1.</p>
              <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
                {['✓ Extraccion automatica de datos','✓ Alerta de riesgos en 60 segundos','✓ Documento listo para trabajar en Editor'].map((t,i) => (
                  <p key={i} style={{ color:'#0D5C36', fontSize:'12px', margin:0, fontWeight:600 }}>{t}</p>
                ))}
              </div>
            </div>
            <div onClick={() => { setFlujo('B'); setPaso(1) }}
              style={{ background:'white', borderRadius:'16px', padding:'32px', boxShadow:'0 2px 16px rgba(0,0,0,0.06)', cursor:'pointer', border:'2px solid transparent', transition:'all 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.border='2px solid #0F2447')}
              onMouseLeave={e => (e.currentTarget.style.border='2px solid transparent')}>
              <div style={{ width:'56px', height:'56px', borderRadius:'14px', background:'#EFF6FF', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'28px', marginBottom:'16px' }}>⚖️</div>
              <h3 style={{ color:'#0F2447', fontSize:'17px', fontWeight:700, margin:'0 0 8px' }}>Documento de Direccion Juridica T1</h3>
              <p style={{ color:'#888', fontSize:'13px', lineHeight:'1.6', margin:'0 0 16px' }}>Se trabajara con plantillas y formatos propios de T1. La IA extrae los datos de los documentos de soporte para llenar la plantilla automaticamente.</p>
              <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
                {['✓ Plantillas T1 precargadas','✓ Llenado automatico con documentos de soporte','✓ Sin analisis de riesgo — documento propio'].map((t,i) => (
                  <p key={i} style={{ color:'#1D4ED8', fontSize:'12px', margin:0, fontWeight:600 }}>{t}</p>
                ))}
              </div>
            </div>
          </div>
          <p style={{ textAlign:'center', color:'#888', fontSize:'13px', marginTop:'24px' }}>
            Ya tienes una solicitud? <a href="/login" style={{ color:'#E8321A', fontWeight:700, textDecoration:'none' }}>Ver mis solicitudes</a>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight:'100vh', background:'#F8F8F8', fontFamily:'sans-serif' }}>
      <div style={{ background:'linear-gradient(135deg, #E8321A 0%, #C42A15 100%)', padding:'20px 32px', display:'flex', alignItems:'center', gap:'12px' }}>
        <span style={{ background:'white', color:'#E8321A', fontWeight:900, fontSize:'18px', padding:'3px 12px', borderRadius:'6px' }}>T1</span>
        <span style={{ color:'white', fontWeight:700, fontSize:'18px' }}>Legal — {flujo==='A'?'Documento del socio comercial':'Documento Direccion Juridica T1'}</span>
        <span style={{ marginLeft:'auto', background:'rgba(255,255,255,0.2)', color:'white', fontSize:'12px', fontWeight:700, padding:'4px 12px', borderRadius:'20px' }}>
          {flujo==='A'?'📄 Flujo A':'⚖️ Flujo B'}
        </span>
      </div>

      <div style={{ maxWidth:'680px', margin:'40px auto', padding:'0 16px' }}>
        <div style={{ background:'white', borderRadius:'16px', boxShadow:'0 2px 16px rgba(0,0,0,0.06)', overflow:'hidden' }}>
          <Progress />
          <div style={{ padding:'0 32px 32px' }}>

            {paso===1 && (
              <div>
                <h2 style={{ color:'#0F2447', fontSize:'20px', fontWeight:700, margin:'0 0 24px' }}>Datos del solicitante</h2>
                <div style={{ marginBottom:'16px' }}><Label text="Nombre completo *" /><Input k="nombre" placeholder="Nombre y Apellido" /></div>
                <div style={{ marginBottom:'16px' }}><Label text="Correo electronico *" /><Input k="correo" placeholder="correo@empresa.com" type="email" /></div>
                <div style={{ marginBottom:'16px' }}>
                  <Label text="Area *" />
                  <Select k="area" options={areas} />
                  {form.area==='Otro' && <div style={{ marginTop:'8px' }}><Input k="area_otro" placeholder="Describe tu area..." /></div>}
                </div>
                <div style={{ marginBottom:'16px' }}>
                  <Label text="Empresa T1 *" />
                  <Select k="empresa_t1" options={['T1.com','Claro Pagos']} />
                </div>
                {!esAccesoTotal && (
                  <div style={{ marginBottom:'16px' }}>
                    <Label text="Eres lider de area? *" />
                    <div style={{ display:'flex', gap:'10px' }}>
                      {['Si, soy lider','No, tengo lider'].map((op,i) => (
                        <div key={i} onClick={() => set('es_lider', i===0?'si':'no')}
                          style={{ flex:1, padding:'12px', borderRadius:'10px', border:`2px solid ${form.es_lider===(i===0?'si':'no')?'#E8321A':'#E8E8E8'}`, cursor:'pointer', background:form.es_lider===(i===0?'si':'no')?'#FFF5F5':'white', textAlign:'center' }}>
                          <p style={{ color:form.es_lider===(i===0?'si':'no')?'#E8321A':'#888', fontWeight:700, fontSize:'13px', margin:0 }}>{op}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {form.es_lider==='no' && !esAccesoTotal && (
                  <div style={{ marginBottom:'16px', background:'#F8F8F8', borderRadius:'10px', padding:'16px' }}>
                    <Label text="Nombre de tu lider *" />
                    <div style={{ marginBottom:'10px' }}><Input k="lider_nombre" placeholder="Nombre del lider de area" /></div>
                    <Label text="Correo de tu lider *" />
                    <Input k="lider_correo" placeholder="lider@empresa.com" type="email" />
                  </div>
                )}
                {form.area && (
                  <div style={{ background:getPermisoLabel().bg, border:`1px solid ${getPermisoLabel().border}`, borderRadius:'10px', padding:'12px 16px', marginBottom:'16px' }}>
                    <p style={{ color:getPermisoLabel().color, fontSize:'12px', fontWeight:700, margin:0 }}>{getPermisoLabel().texto}</p>
                  </div>
                )}
                <div style={{ display:'flex', justifyContent:'space-between', marginTop:'8px' }}>
                  <Btn label="← Cambiar flujo" onClick={() => { setPaso(0); setFlujo('') }} secondary />
                  <Btn label="Siguiente →" onClick={() => setPaso(2)} />
                </div>
              </div>
            )}

            {paso===2 && (
              <div>
                <h2 style={{ color:'#0F2447', fontSize:'20px', fontWeight:700, margin:'0 0 24px' }}>Tipo de documento</h2>
                <div style={{ marginBottom:'16px' }}>
                  <Label text="Tipo de solicitud *" />
                  <Select k="tipo_solicitud" options={tipos} />
                  {form.tipo_solicitud==='Otro' && <div style={{ marginTop:'8px' }}><Input k="tipo_solicitud_otro" placeholder="Describe el documento que necesitas..." /></div>}
                </div>
                <div style={{ marginBottom:'16px' }}>
                  <Label text="Idioma del documento *" />
                  <Select k="idioma" options={idiomas} />
                  {form.idioma==='Otro' && <div style={{ marginTop:'8px' }}><Input k="idioma_otro" placeholder="Especifica el idioma..." /></div>}
                </div>
                <div style={{ marginBottom:'16px' }}>
                  <Label text="Que necesitas del area legal *" />
                  <Textarea k="descripcion" placeholder="Describe con detalle que necesitas. Mientras mas detalle mejor resultado." />
                </div>
                <div style={{ marginBottom:'16px' }}>
                  <Label text="Fecha limite deseada" />
                  <Input k="fecha_limite" placeholder="" type="date" />
                </div>
                <div style={{ marginBottom:'16px' }}>
                  <Label text="Prioridad *" />
                  <div style={{ display:'flex', gap:'8px' }}>
                    {['Alta','Media','Baja'].map((p,i) => (
                      <div key={i} onClick={() => set('prioridad', p)}
                        style={{ flex:1, padding:'10px', borderRadius:'8px', border:`2px solid ${form.prioridad===p?p==='Alta'?'#E8321A':p==='Media'?'#F59E0B':'#0D5C36':'#E8E8E8'}`, cursor:'pointer', background:form.prioridad===p?p==='Alta'?'#FFF5F5':p==='Media'?'#FFFBEB':'#F0FDF4':'white', textAlign:'center' }}>
                        <p style={{ color:form.prioridad===p?p==='Alta'?'#E8321A':p==='Media'?'#F59E0B':'#0D5C36':'#888', fontWeight:700, fontSize:'13px', margin:0 }}>{p}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ marginBottom:'16px' }}>
                  <Label text="¿Requiere traduccion?" />
                  <div style={{ display:'flex', gap:'8px', marginBottom:'8px' }}>
                    {['Si','No'].map((op,i) => (
                      <div key={i} onClick={() => set('requiere_traduccion', op)}
                        style={{ flex:1, padding:'10px', borderRadius:'8px', border:`2px solid ${form.requiere_traduccion===op?'#E8321A':'#E8E8E8'}`, cursor:'pointer', background:form.requiere_traduccion===op?'#FFF5F5':'white', textAlign:'center' }}>
                        <p style={{ color:form.requiere_traduccion===op?'#E8321A':'#888', fontWeight:700, fontSize:'13px', margin:0 }}>{op}</p>
                      </div>
                    ))}
                  </div>
                  {form.requiere_traduccion==='Si' && <Input k="idioma_traduccion" placeholder="¿A que idioma? Ej: Ingles, Frances..." />}
                </div>
                {(form.es_lider==='si' || esAccesoTotal) && (
                  <div style={{ marginBottom:'16px', background:'#FFF5F5', borderRadius:'10px', padding:'16px', border:'1px solid #FFD0CC' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                      <input type="checkbox" id="confidencial" checked={form.confidencial} onChange={e => set('confidencial', e.target.checked)} style={{ width:'18px', height:'18px', cursor:'pointer' }} />
                      <div>
                        <label htmlFor="confidencial" style={{ color:'#C42A15', fontWeight:700, fontSize:'13px', cursor:'pointer', display:'block' }}>🔒 Marcar como confidencial</label>
                        <p style={{ color:'#C42A15', fontSize:'11px', margin:0 }}>Solo lo vera Direccion Juridica y tu. Ni tu equipo podra verlo.</p>
                      </div>
                    </div>
                  </div>
                )}
                <div style={{ display:'flex', justifyContent:'space-between', marginTop:'8px' }}>
                  <Btn label="← Anterior" onClick={() => setPaso(1)} secondary />
                  <Btn label="Siguiente →" onClick={() => setPaso(3)} />
                </div>
              </div>
            )}

            {paso===3 && (
              <div>
                <h2 style={{ color:'#0F2447', fontSize:'20px', fontWeight:700, margin:'0 0 24px' }}>Datos de la contraparte</h2>
                <div style={{ marginBottom:'16px' }}><Label text="Nombre de la empresa *" /><Input k="nombre_empresa" placeholder="Razon social completa" /></div>
                <div style={{ marginBottom:'16px' }}><Label text="RFC" /><Input k="rfc" placeholder="EMP123456ABC" /></div>
                <div style={{ marginBottom:'16px' }}><Label text="Apoderado legal" /><Input k="apoderado" placeholder="Nombre del representante legal" /></div>
                <div style={{ marginBottom:'24px' }}>
                  <Label text="Nacionalidad *" />
                  <Select k="nacionalidad" options={['Mexicana','Estadounidense','Colombiana','Española','Otra']} />
                </div>
                {form.nacionalidad && form.nacionalidad!=='Mexicana' && (
                  <div style={{ background:'#EFF6FF', border:'1px solid #BFDBFE', borderRadius:'10px', padding:'12px 16px', marginBottom:'16px' }}>
                    <p style={{ color:'#1D4ED8', fontSize:'12px', fontWeight:700, margin:'0 0 2px' }}>ℹ️ Contraparte internacional detectada</p>
                    <p style={{ color:'#1D4ED8', fontSize:'11px', margin:0 }}>Se requeriran documentos adicionales: poder notarial apostillado, documentos de constitucion en el pais de origen y posiblemente traduccion certificada.</p>
                  </div>
                )}
                <div style={{ marginBottom:'16px' }}>
                  <Label text="¿Tiene contrato previo con T1?" />
                  <div style={{ display:'flex', gap:'8px' }}>
                    {['Si','No'].map((op,i) => (
                      <div key={i} onClick={() => set('tiene_contrato_previo', op)}
                        style={{ flex:1, padding:'10px', borderRadius:'8px', border:`2px solid ${form.tiene_contrato_previo===op?'#E8321A':'#E8E8E8'}`, cursor:'pointer', background:form.tiene_contrato_previo===op?'#FFF5F5':'white', textAlign:'center' }}>
                        <p style={{ color:form.tiene_contrato_previo===op?'#E8321A':'#888', fontWeight:700, fontSize:'13px', margin:0 }}>{op}</p>
                      </div>
                    ))}
                  </div>
                  {form.tiene_contrato_previo==='Si' && (
                    <div style={{ marginTop:'8px', background:'#FEF3C7', borderRadius:'8px', padding:'10px 14px' }}>
                      <p style={{ color:'#92400E', fontSize:'12px', margin:0, fontWeight:600 }}>Adjunta el contrato previo en el paso de documentos para agilizar la revision.</p>
                    </div>
                  )}
                </div>
                <div style={{ display:'flex', justifyContent:'space-between', marginTop:'8px' }}>
                  <Btn label="← Anterior" onClick={() => setPaso(2)} secondary />
                  <Btn label="Siguiente →" onClick={() => setPaso(4)} />
                </div>
              </div>
            )}

            {paso===4 && (
              <div>
                <h2 style={{ color:'#0F2447', fontSize:'20px', fontWeight:700, margin:'0 0 8px' }}>Condiciones del contrato</h2>
                <p style={{ color:'#888', fontSize:'13px', margin:'0 0 20px' }}>¿Aplican condiciones comerciales a este documento?</p>
                <div style={{ display:'flex', gap:'10px', marginBottom:'20px' }}>
                  {['Si aplican','No aplican'].map((op,i) => (
                    <div key={i} onClick={() => set('condiciones_aplican', i===0?'si':'no')}
                      style={{ flex:1, padding:'14px', borderRadius:'10px', border:`2px solid ${form.condiciones_aplican===(i===0?'si':'no')?'#E8321A':'#E8E8E8'}`, cursor:'pointer', background:form.condiciones_aplican===(i===0?'si':'no')?'#FFF5F5':'white', textAlign:'center' }}>
                      <p style={{ color:form.condiciones_aplican===(i===0?'si':'no')?'#E8321A':'#888', fontWeight:700, fontSize:'14px', margin:0 }}>{op}</p>
                    </div>
                  ))}
                </div>

                {form.condiciones_aplican==='si' && (
                  <div>
                    <div style={{ marginBottom:'16px' }}><Label text="Vigencia" /><Input k="vigencia" placeholder="Ej: 12 meses, 1 año, indefinida" /></div>
                    <div style={{ marginBottom:'16px' }}>
                      <Label text="Contraprestacion" />
                      <Input k="contraprestacion" placeholder="Ej: $500,000 MXN mensuales, tarifa por evento..." />
                      <div style={{ display:'flex', alignItems:'center', gap:'8px', marginTop:'8px' }}>
                        <input type="checkbox" id="tarifas" checked={form.adjunta_tarifas} onChange={e => set('adjunta_tarifas', e.target.checked)} style={{ width:'16px', height:'16px', cursor:'pointer' }} />
                        <label htmlFor="tarifas" style={{ color:'#0F2447', fontSize:'12px', fontWeight:600, cursor:'pointer' }}>Se adjunta Excel o tarifas en documentos</label>
                      </div>
                    </div>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px', marginBottom:'16px' }}>
                      <div><Label text="Plazo de pago" /><Input k="plazo_pago" placeholder="Ej: 30" /></div>
                      <div><Label text="Tipo de dias" /><Select k="tipo_dias_pago" options={['naturales','habiles']} /></div>
                    </div>
                    <div style={{ marginBottom:'16px' }}>
                      <Label text="Tipo de firma" />
                      <Select k="tipo_firma" options={firmas} />
                      {form.tipo_firma==='Otro' && <div style={{ marginTop:'8px' }}><Input k="plataforma_firma" placeholder="Especifica la plataforma de firma..." /></div>}
                    </div>
                  </div>
                )}

                <div style={{ marginBottom:'16px' }}>
                  <Label text={form.condiciones_aplican==='no'?'¿Alguna condicion especial? (opcional)':'Condiciones especiales adicionales (opcional)'} />
                  <Textarea k="condiciones_especiales" placeholder="Describe cualquier condicion especial, restriccion o requerimiento particular..." />
                </div>

                <div style={{ display:'flex', justifyContent:'space-between', marginTop:'8px' }}>
                  <Btn label="← Anterior" onClick={() => setPaso(3)} secondary />
                  <Btn label="Siguiente →" onClick={() => setPaso(5)} />
                </div>
              </div>
            )}

            {paso===5 && (
              <div>
                <h2 style={{ color:'#0F2447', fontSize:'20px', fontWeight:700, margin:'0 0 8px' }}>Documentos de soporte</h2>
                <p style={{ color:'#888', fontSize:'13px', margin:'0 0 8px' }}>
                  {flujo==='A' ? 'Carga el contrato de la contraparte. La IA extraera los datos y detectara clausulas de riesgo automaticamente.' : 'Carga los documentos de soporte (acta constitutiva, poder notarial, identificacion, etc.). La IA extraera los datos para llenar la plantilla.'}
                </p>

                {flujo==='A' && (
                  <div style={{ background:'#FFF5F5', border:'1px solid #FFD0CC', borderRadius:'10px', padding:'12px 16px', marginBottom:'16px' }}>
                    <p style={{ color:'#C42A15', fontSize:'12px', fontWeight:700, margin:'0 0 2px' }}>⚠️ Flujo A — Analisis de riesgo automatico</p>
                    <p style={{ color:'#C42A15', fontSize:'11px', margin:0 }}>Al subir el contrato la IA lo analizara y generara una alerta de clausulas de riesgo para T1 en menos de 60 segundos.</p>
                  </div>
                )}

                {flujo==='B' && (
                  <div style={{ background:'#EFF6FF', border:'1px solid #BFDBFE', borderRadius:'10px', padding:'12px 16px', marginBottom:'16px' }}>
                    <p style={{ color:'#1D4ED8', fontSize:'12px', fontWeight:700, margin:'0 0 2px' }}>⚖️ Flujo B — Llenado automatico de plantilla</p>
                    <p style={{ color:'#1D4ED8', fontSize:'11px', margin:0 }}>La IA extraera los datos de los documentos que cargues para llenar la plantilla de T1 automaticamente.</p>
                  </div>
                )}

                <div onClick={() => document.getElementById('file-input')?.click()}
                  style={{ border:'2px dashed #E8E8E8', borderRadius:'12px', padding:'32px', textAlign:'center', cursor:'pointer', marginBottom:'16px', background:'#FAFAFA' }}>
                  <div style={{ fontSize:'32px', marginBottom:'8px' }}>📎</div>
                  <p style={{ color:'#0F2447', fontWeight:600, margin:'0 0 4px' }}>Haz clic para adjuntar archivos</p>
                  <p style={{ color:'#888', fontSize:'12px', margin:0 }}>PDF, Word, Excel, imagenes y mas — sin limite de tipo</p>
                  <input id="file-input" type="file" multiple style={{ display:'none' }}
                    onChange={e => { if (e.target.files) setArchivos(Array.from(e.target.files)) }} />
                </div>

                {archivos.length>0 && (
                  <div style={{ marginBottom:'16px' }}>
                    {archivos.map((f,i) => (
                      <div key={i} style={{ display:'flex', alignItems:'center', gap:'10px', padding:'10px 14px', background:'#F8F8F8', borderRadius:'8px', marginBottom:'6px', border:'1px solid #F0F0F0' }}>
                        <span>📄</span>
                        <span style={{ color:'#0F2447', fontSize:'13px', flex:1 }}>{f.name}</span>
                        <span style={{ color:'#888', fontSize:'12px' }}>{(f.size/1024).toFixed(0)} KB</span>
                      </div>
                    ))}
                    {!analisisIA && (
                      <button onClick={analizarDocumento}
                        style={{ width:'100%', marginTop:'8px', padding:'11px', background:'#0F2447', color:'white', border:'none', borderRadius:'9px', fontSize:'13px', fontWeight:700, cursor:'pointer' }}>
                        {analizando?'⏳ Analizando documento...':'🤖 Analizar documento con IA'}
                      </button>
                    )}
                  </div>
                )}

                {analisisIA && (
                  <div style={{ marginBottom:'16px' }}>
                    {flujo==='A' && analisisIA.riesgos && (
                      <div style={{ background:'#FFF5F5', border:'1px solid #FFD0CC', borderRadius:'12px', padding:'16px', marginBottom:'12px' }}>
                        <p style={{ color:'#C42A15', fontSize:'13px', fontWeight:700, margin:'0 0 10px' }}>⚠️ Alerta de riesgo — Resumen en 60 segundos</p>
                        {analisisIA.riesgos.map((r:any,i:number) => (
                          <div key={i} style={{ padding:'8px 12px', background:'white', borderRadius:'8px', marginBottom:'6px', borderLeft:`3px solid ${r.nivel==='Alto'?'#E8321A':'#F59E0B'}` }}>
                            <p style={{ color:'#0F2447', fontSize:'12px', fontWeight:700, margin:'0 0 2px' }}>{r.clausula} — <span style={{ color:r.nivel==='Alto'?'#E8321A':'#F59E0B' }}>{r.nivel}</span></p>
                            <p style={{ color:'#555', fontSize:'11px', margin:0 }}>{r.descripcion}</p>
                          </div>
                        ))}
                      </div>
                    )}
                    <div style={{ background:'#F0FDF4', border:'1px solid #BBF7D0', borderRadius:'12px', padding:'16px' }}>
                      <p style={{ color:'#166534', fontSize:'13px', fontWeight:700, margin:'0 0 10px' }}>✓ Datos extraidos automaticamente</p>
                      {Object.entries(analisisIA.datos).map(([k,v]:any,i) => (
                        <div key={i} style={{ display:'flex', justifyContent:'space-between', padding:'5px 0', borderBottom:'1px solid #D1FAE5' }}>
                          <span style={{ color:'#166534', fontSize:'12px', textTransform:'capitalize' }}>{k.replace(/_/g,' ')}</span>
                          <span style={{ color:'#0F2447', fontSize:'12px', fontWeight:600 }}>{v}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {form.confidencial && (
                  <div style={{ background:'#FFF5F5', border:'1px solid #FFD0CC', borderRadius:'10px', padding:'12px 16px', marginBottom:'16px' }}>
                    <p style={{ color:'#C42A15', fontSize:'12px', fontWeight:700, margin:0 }}>🔒 Solicitud CONFIDENCIAL — Solo la vera Direccion Juridica y tu</p>
                  </div>
                )}

                <div style={{ background:'#FFF5F5', border:'1px solid #FFD0CC', borderRadius:'10px', padding:'12px 16px', marginBottom:'24px' }}>
                  <p style={{ color:'#C42A15', fontSize:'12px', margin:0 }}>🔒 Documentos almacenados de forma segura y encriptada. Solo Direccion Juridica tiene acceso.</p>
                </div>

                <div style={{ display:'flex', justifyContent:'space-between' }}>
                  <Btn label="← Anterior" onClick={() => setPaso(4)} secondary />
                  <button style={{ padding:'13px 32px', borderRadius:'10px', border:'none', background:'#E8321A', color:'white', fontWeight:700, fontSize:'15px', cursor:'pointer' }}>
                    Enviar solicitud ✓
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
        <p style={{ textAlign:'center', color:'#888', fontSize:'13px', marginTop:'16px' }}>
          Ya tienes una solicitud? <a href="/login" style={{ color:'#E8321A', fontWeight:700, textDecoration:'none' }}>Ver mis solicitudes</a>
        </p>
      </div>
    </div>
  )
}
