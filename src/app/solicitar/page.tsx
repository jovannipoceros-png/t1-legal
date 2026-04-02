'use client'
import { useState } from 'react'

export default function Solicitar() {
  const [paso, setPaso] = useState(1)
  const [form, setForm] = useState({
    nombre: '', correo: '', area: '', area_otro: '', puesto: '',
    empresa_t1: 'T1.com', es_lider: '', lider_nombre: '', lider_correo: '',
    tipo_solicitud: '', tipo_solicitud_otro: '',
    condiciones_especiales: '', descripcion: '',
    nombre_empresa: '', rfc: '', apoderado: '',
    vigencia: '', plazo_pago: '', tipo_dias_pago: 'naturales',
    tipo_firma: 'Electronica', prioridad: 'Normal',
    confidencial: false,
  })
  const [archivos, setArchivos] = useState<File[]>([])
  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }))
  const total = 5

  const areas = ['T1 Pagos','T1 Envios','T1 Tienda','T1 Score','Ultima Milla','Marketing','RH','TI','Legal','Juridico','Otro']
  const tipos = ['Contrato','Convenio de Confidencialidad','Convenio Modificatorio','Anexo','NDA','Otro']

  const esAccesoTotal = form.area==='Legal' || form.area==='Juridico' || form.puesto.toLowerCase().includes('ceo')

  const getPermisoLabel = () => {
    if (esAccesoTotal) return { texto:'✓ Acceso total — Mismo nivel que Legal', color:'#0D5C36', bg:'#F0FDF4', border:'#BBF7D0' }
    if (form.es_lider==='si') return { texto:'✓ Lider de area — Veras todas las solicitudes de tu equipo', color:'#1D4ED8', bg:'#EFF6FF', border:'#BFDBFE' }
    return { texto:'✓ Solicitante — Solo veras tus propias solicitudes', color:'#92400E', bg:'#FEF3C7', border:'#FDE68A' }
  }

  const Progress = () => (
    <div style={{ padding:'0 32px 24px', borderBottom:'1px solid #F0F0F0', marginBottom:'32px' }}>
      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'12px' }}>
        {['Solicitante','Documento','Contraparte','Condiciones','Documentos'].map((s,i) => (
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

  return (
    <div style={{ minHeight:'100vh', background:'#F8F8F8', fontFamily:'sans-serif' }}>
      <div style={{ background:'linear-gradient(135deg, #E8321A 0%, #C42A15 100%)', padding:'20px 32px', display:'flex', alignItems:'center', gap:'12px' }}>
        <span style={{ background:'white', color:'#E8321A', fontWeight:900, fontSize:'18px', padding:'3px 12px', borderRadius:'6px' }}>T1</span>
        <span style={{ color:'white', fontWeight:700, fontSize:'18px' }}>Legal — Nueva Solicitud</span>
        <span style={{ marginLeft:'auto', color:'rgba(255,255,255,0.8)', fontSize:'13px' }}>Paso {paso} de {total}</span>
      </div>

      <div style={{ maxWidth:'640px', margin:'40px auto', padding:'0 16px' }}>
        <div style={{ background:'white', borderRadius:'16px', boxShadow:'0 2px 16px rgba(0,0,0,0.06)', overflow:'hidden' }}>
          <Progress />
          <div style={{ padding:'0 32px 32px' }}>

            {paso===1 && (
              <div>
                <h2 style={{ color:'#0F2447', fontSize:'20px', fontWeight:700, margin:'0 0 24px' }}>Datos del solicitante</h2>
                <div style={{ marginBottom:'16px' }}><Label text="Nombre completo *" /><Input k="nombre" placeholder="Nombre y Apellido" /></div>
                <div style={{ marginBottom:'16px' }}><Label text="Correo electronico *" /><Input k="correo" placeholder="correo@empresa.com" type="email" /></div>
                <div style={{ marginBottom:'16px' }}><Label text="Puesto o cargo" /><Input k="puesto" placeholder="Ej: CEO, Gerente Comercial, Analista..." /></div>
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
                    <Input k="lider_correo" placeholder="lider@t1.com" type="email" />
                  </div>
                )}

                {(form.area || form.puesto) && (
                  <div style={{ background:getPermisoLabel().bg, border:`1px solid ${getPermisoLabel().border}`, borderRadius:'10px', padding:'12px 16px', marginBottom:'16px' }}>
                    <p style={{ color:getPermisoLabel().color, fontSize:'12px', fontWeight:700, margin:0 }}>{getPermisoLabel().texto}</p>
                  </div>
                )}

                <div style={{ display:'flex', justifyContent:'flex-end', marginTop:'8px' }}>
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
                  <Label text="Que necesitas del area legal *" />
                  <Textarea k="descripcion" placeholder="Describe con detalle que necesitas. Mientras mas detalle mejor resultado." />
                </div>
                <div style={{ marginBottom:'16px' }}>
                  <Label text="Condiciones especiales (opcional)" />
                  <Textarea k="condiciones_especiales" placeholder="Ej: clausula de exclusividad, penalizacion por incumplimiento, etc." />
                </div>
                <div style={{ marginBottom:'16px' }}>
                  <Label text="Prioridad *" />
                  <Select k="prioridad" options={['Normal','Urgente']} />
                </div>
                {(form.es_lider==='si' || esAccesoTotal) && (
                  <div style={{ marginBottom:'16px', background:'#FFF5F5', borderRadius:'10px', padding:'16px', border:'1px solid #FFD0CC' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                      <input type="checkbox" id="confidencial" checked={form.confidencial}
                        onChange={e => set('confidencial', e.target.checked)}
                        style={{ width:'18px', height:'18px', cursor:'pointer' }} />
                      <div>
                        <label htmlFor="confidencial" style={{ color:'#C42A15', fontWeight:700, fontSize:'13px', cursor:'pointer', display:'block' }}>
                          🔒 Marcar como confidencial
                        </label>
                        <p style={{ color:'#C42A15', fontSize:'11px', margin:0 }}>Solo lo vera el area Legal y tu. Ni tu equipo podra verlo.</p>
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
                <div style={{ marginBottom:'16px' }}><Label text="Nombre de la empresa *" /><Input k="nombre_empresa" placeholder="Empresa S.A. de C.V." /></div>
                <div style={{ marginBottom:'16px' }}><Label text="RFC" /><Input k="rfc" placeholder="EMP123456ABC" /></div>
                <div style={{ marginBottom:'24px' }}><Label text="Apoderado legal" /><Input k="apoderado" placeholder="Nombre del representante legal" /></div>
                <div style={{ display:'flex', justifyContent:'space-between' }}>
                  <Btn label="← Anterior" onClick={() => setPaso(2)} secondary />
                  <Btn label="Siguiente →" onClick={() => setPaso(4)} />
                </div>
              </div>
            )}

            {paso===4 && (
              <div>
                <h2 style={{ color:'#0F2447', fontSize:'20px', fontWeight:700, margin:'0 0 24px' }}>Condiciones del contrato</h2>
                <div style={{ marginBottom:'16px' }}><Label text="Vigencia" /><Input k="vigencia" placeholder="Ej: 12 meses, 1 año, indefinida" /></div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px', marginBottom:'16px' }}>
                  <div><Label text="Plazo de pago" /><Input k="plazo_pago" placeholder="Ej: 30" /></div>
                  <div><Label text="Tipo de dias" /><Select k="tipo_dias_pago" options={['naturales','habiles']} /></div>
                </div>
                <div style={{ marginBottom:'24px' }}>
                  <Label text="Tipo de firma" />
                  <Select k="tipo_firma" options={['Electronica','Fisica','SORA','Otro']} />
                </div>
                <div style={{ display:'flex', justifyContent:'space-between' }}>
                  <Btn label="← Anterior" onClick={() => setPaso(3)} secondary />
                  <Btn label="Siguiente →" onClick={() => setPaso(5)} />
                </div>
              </div>
            )}

            {paso===5 && (
              <div>
                <h2 style={{ color:'#0F2447', fontSize:'20px', fontWeight:700, margin:'0 0 8px' }}>Documentos de soporte</h2>
                <p style={{ color:'#888', fontSize:'13px', margin:'0 0 24px' }}>Adjunta contratos previos, VoBo, documentos corporativos o cualquier archivo de soporte.</p>
                {form.confidencial && (
                  <div style={{ background:'#FFF5F5', border:'1px solid #FFD0CC', borderRadius:'10px', padding:'12px 16px', marginBottom:'16px', display:'flex', alignItems:'center', gap:'8px' }}>
                    <span>🔒</span>
                    <p style={{ color:'#C42A15', fontSize:'12px', fontWeight:700, margin:0 }}>Esta solicitud es CONFIDENCIAL — Solo la vera Legal y tu</p>
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
                  </div>
                )}
                <div style={{ background:'#FFF5F5', border:'1px solid #FFD0CC', borderRadius:'10px', padding:'12px 16px', marginBottom:'16px' }}>
                  <p style={{ color:'#C42A15', fontSize:'12px', margin:0 }}>🔒 Tus documentos se almacenan de forma segura y encriptada. Solo el area legal de T1 tiene acceso.</p>
                </div>
                <div style={{ background:'#F8F8F8', borderRadius:'12px', padding:'16px', marginBottom:'24px' }}>
                  <p style={{ color:'#0F2447', fontSize:'13px', fontWeight:700, margin:'0 0 10px' }}>Resumen</p>
                  {[
                    { label:'Nombre', value:form.nombre },
                    { label:'Puesto', value:form.puesto },
                    { label:'Area', value:form.area==='Otro'?form.area_otro:form.area },
                    { label:'Empresa T1', value:form.empresa_t1 },
                    { label:'Tipo', value:form.tipo_solicitud==='Otro'?form.tipo_solicitud_otro:form.tipo_solicitud },
                    { label:'Prioridad', value:form.prioridad },
                    { label:'Acceso', value:esAccesoTotal?'Total — Legal/CEO':form.es_lider==='si'?'Lider de area':'Solicitante' },
                    { label:'Lider', value:form.es_lider==='no'?form.lider_nombre:'' },
                    { label:'Confidencial', value:form.confidencial?'Si — Solo Legal y tu':'No' },
                  ].filter(r => r.value).map((r,i) => (
                    <div key={i} style={{ display:'flex', justifyContent:'space-between', padding:'6px 0', borderBottom:'1px solid #F0F0F0' }}>
                      <span style={{ color:'#888', fontSize:'12px' }}>{r.label}</span>
                      <span style={{ color:r.label==='Confidencial'&&form.confidencial?'#E8321A':r.label==='Acceso'&&esAccesoTotal?'#0D5C36':'#0F2447', fontSize:'12px', fontWeight:600 }}>{r.value}</span>
                    </div>
                  ))}
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
