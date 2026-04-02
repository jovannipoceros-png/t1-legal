'use client'
import { useState } from 'react'

export default function Solicitar() {
  const [paso, setPaso] = useState(1)
  const [form, setForm] = useState({
    nombre: '', correo: '', area: '', area_otro: '',
    empresa_t1: 'T1.com', tipo_solicitud: '', tipo_solicitud_otro: '',
    tipo_contrato: '', tipo_contrato_otro: '',
    condiciones_especiales: '', descripcion: '',
    nombre_empresa: '', rfc: '', apoderado: '',
    vigencia: '', plazo_pago: '', tipo_dias_pago: 'naturales',
    tipo_firma: 'electronica', prioridad: 'Normal',
  })
  const [archivos, setArchivos] = useState<File[]>([])

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))
  const total = 5

  const areas = ['Comercial','Finanzas','Tecnologia','Operaciones','Recursos Humanos','Direccion','Otro']
  const tipos = ['Contrato','Convenio de Confidencialidad','Convenio Modificatorio','Anexo','NDA','Otro']
  const contratos = ['Servicios','Compraventa','Prestamo','Distribucion','Licencia','Otro']

  const Progress = () => (
    <div style={{ marginBottom: '32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
        {['Solicitante','Documento','Contraparte','Condiciones','Documentos'].map((s, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', width: '20%' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: i + 1 <= paso ? '#E8321A' : 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, color: 'white' }}>
              {i + 1 < paso ? '✓' : i + 1}
            </div>
            <span style={{ fontSize: '10px', color: i + 1 <= paso ? 'white' : 'rgba(255,255,255,0.5)', textAlign: 'center' }}>{s}</span>
          </div>
        ))}
      </div>
      <div style={{ height: '4px', background: 'rgba(255,255,255,0.2)', borderRadius: '2px' }}>
        <div style={{ height: '100%', width: `${((paso-1)/(total-1))*100}%`, background: '#E8321A', borderRadius: '2px', transition: 'width 0.4s' }} />
      </div>
    </div>
  )

  const Label = ({ text }: { text: string }) => (
    <label style={{ display: 'block', color: 'rgba(255,255,255,0.8)', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>{text}</label>
  )
  const Input = ({ k, placeholder, type='text' }: { k: string, placeholder: string, type?: string }) => (
    <input type={type} placeholder={placeholder} value={(form as any)[k]} onChange={e => set(k, e.target.value)}
      style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.1)', color: 'white', fontSize: '14px', boxSizing: 'border-box', outline: 'none' }} />
  )
  const Select = ({ k, options }: { k: string, options: string[] }) => (
    <select value={(form as any)[k]} onChange={e => set(k, e.target.value)}
      style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.2)', background: '#1B3A6B', color: 'white', fontSize: '14px', boxSizing: 'border-box', outline: 'none' }}>
      <option value="">Selecciona...</option>
      {options.map((o,i) => <option key={i}>{o}</option>)}
    </select>
  )
  const Textarea = ({ k, placeholder }: { k: string, placeholder: string }) => (
    <textarea placeholder={placeholder} value={(form as any)[k]} onChange={e => set(k, e.target.value)} rows={3}
      style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.1)', color: 'white', fontSize: '14px', boxSizing: 'border-box', resize: 'vertical', outline: 'none' }} />
  )
  const Btn = ({ label, onClick, secondary=false }: { label: string, onClick: () => void, secondary?: boolean }) => (
    <button onClick={onClick} style={{ padding: '13px 28px', borderRadius: '10px', border: secondary ? '1px solid rgba(255,255,255,0.3)' : 'none', background: secondary ? 'transparent' : '#E8321A', color: 'white', fontWeight: 700, fontSize: '15px', cursor: 'pointer' }}>{label}</button>
  )

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0F2447 0%, #1B3A6B 60%, #0F2447 100%)', fontFamily: 'sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px' }}>
      <div style={{ width: '100%', maxWidth: '620px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <span style={{ background: '#E8321A', color: 'white', fontWeight: 900, fontSize: '22px', padding: '4px 16px', borderRadius: '6px' }}>T1</span>
          <h1 style={{ color: 'white', fontSize: '24px', fontWeight: 700, margin: '12px 0 4px' }}>Solicitud Legal</h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', margin: 0 }}>Paso {paso} de {total}</p>
        </div>
        <Progress />
        <div style={{ background: 'rgba(255,255,255,0.07)', borderRadius: '16px', padding: '32px', border: '1px solid rgba(255,255,255,0.12)' }}>

          {paso === 1 && (
            <div>
              <h2 style={{ color: 'white', fontSize: '18px', fontWeight: 700, margin: '0 0 24px' }}>Datos del solicitante</h2>
              <div style={{ marginBottom: '16px' }}><Label text="Nombre completo *" /><Input k="nombre" placeholder="Juan Garcia" /></div>
              <div style={{ marginBottom: '16px' }}><Label text="Correo electronico *" /><Input k="correo" placeholder="juan@t1.com" type="email" /></div>
              <div style={{ marginBottom: '16px' }}>
                <Label text="Area *" />
                <Select k="area" options={areas} />
                {form.area === 'Otro' && <div style={{ marginTop: '8px' }}><Input k="area_otro" placeholder="Describe tu area..." /></div>}
              </div>
              <div style={{ marginBottom: '24px' }}>
                <Label text="Empresa T1 *" />
                <Select k="empresa_t1" options={['T1.com','Claro Pagos']} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Btn label="Siguiente →" onClick={() => setPaso(2)} />
              </div>
            </div>
          )}

          {paso === 2 && (
            <div>
              <h2 style={{ color: 'white', fontSize: '18px', fontWeight: 700, margin: '0 0 24px' }}>Tipo de documento</h2>
              <div style={{ marginBottom: '16px' }}>
                <Label text="Tipo de solicitud *" />
                <Select k="tipo_solicitud" options={tipos} />
                {form.tipo_solicitud === 'Otro' && <div style={{ marginTop: '8px' }}><Input k="tipo_solicitud_otro" placeholder="Describe el documento que necesitas..." /></div>}
              </div>
              {(form.tipo_solicitud === 'Contrato' || form.tipo_solicitud === 'Convenio Modificatorio') && (
                <div style={{ marginBottom: '16px' }}>
                  <Label text="Tipo de contrato *" />
                  <Select k="tipo_contrato" options={contratos} />
                  {form.tipo_contrato === 'Otro' && <div style={{ marginTop: '8px' }}><Input k="tipo_contrato_otro" placeholder="Describe el tipo de contrato..." /></div>}
                </div>
              )}
              <div style={{ marginBottom: '16px' }}>
                <Label text="Descripcion de lo que necesitas *" />
                <Textarea k="descripcion" placeholder="Describe con detalle que necesitas del area legal. Mientras mas detalle, mejor resultado." />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <Label text="Condiciones especiales (opcional)" />
                <Textarea k="condiciones_especiales" placeholder="Ej: El contrato debe incluir clausula de exclusividad, penalizacion por incumplimiento, etc." />
              </div>
              <div style={{ marginBottom: '24px' }}>
                <Label text="Prioridad *" />
                <Select k="prioridad" options={['Normal','Urgente']} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Btn label="← Anterior" onClick={() => setPaso(1)} secondary />
                <Btn label="Siguiente →" onClick={() => setPaso(3)} />
              </div>
            </div>
          )}

          {paso === 3 && (
            <div>
              <h2 style={{ color: 'white', fontSize: '18px', fontWeight: 700, margin: '0 0 24px' }}>Datos de la contraparte</h2>
              <div style={{ marginBottom: '16px' }}><Label text="Nombre de la empresa *" /><Input k="nombre_empresa" placeholder="Empresa S.A. de C.V." /></div>
              <div style={{ marginBottom: '16px' }}><Label text="RFC" /><Input k="rfc" placeholder="EMP123456ABC" /></div>
              <div style={{ marginBottom: '24px' }}><Label text="Apoderado legal" /><Input k="apoderado" placeholder="Nombre del representante legal" /></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Btn label="← Anterior" onClick={() => setPaso(2)} secondary />
                <Btn label="Siguiente →" onClick={() => setPaso(4)} />
              </div>
            </div>
          )}

          {paso === 4 && (
            <div>
              <h2 style={{ color: 'white', fontSize: '18px', fontWeight: 700, margin: '0 0 24px' }}>Condiciones del contrato</h2>
              <div style={{ marginBottom: '16px' }}><Label text="Vigencia" /><Input k="vigencia" placeholder="Ej: 12 meses, 1 año, indefinida" /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div><Label text="Plazo de pago" /><Input k="plazo_pago" placeholder="Ej: 30" /></div>
                <div><Label text="Tipo de dias" /><Select k="tipo_dias_pago" options={['naturales','habiles']} /></div>
              </div>
              <div style={{ marginBottom: '24px' }}>
                <Label text="Tipo de firma" />
                <Select k="tipo_firma" options={['Electronica','Fisica','SORA','Otro']} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Btn label="← Anterior" onClick={() => setPaso(3)} secondary />
                <Btn label="Siguiente →" onClick={() => setPaso(5)} />
              </div>
            </div>
          )}

          {paso === 5 && (
            <div>
              <h2 style={{ color: 'white', fontSize: '18px', fontWeight: 700, margin: '0 0 8px' }}>Documentos de soporte</h2>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', margin: '0 0 24px' }}>Adjunta contratos previos, VoBo, documentos corporativos o cualquier archivo de soporte. PDF, Word, Excel y mas.</p>
              <div
                onClick={() => document.getElementById('file-input')?.click()}
                style={{ border: '2px dashed rgba(255,255,255,0.3)', borderRadius: '12px', padding: '32px', textAlign: 'center', cursor: 'pointer', marginBottom: '16px', transition: 'border-color 0.2s' }}>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>📎</div>
                <p style={{ color: 'white', fontWeight: 600, margin: '0 0 4px' }}>Haz clic para adjuntar archivos</p>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', margin: 0 }}>PDF, Word, Excel, imagenes y mas — sin limite de tipo</p>
                <input id="file-input" type="file" multiple style={{ display: 'none' }}
                  onChange={e => { if (e.target.files) setArchivos(Array.from(e.target.files)) }} />
              </div>
              {archivos.length > 0 && (
                <div style={{ marginBottom: '24px' }}>
                  {archivos.map((f, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', background: 'rgba(255,255,255,0.08)', borderRadius: '8px', marginBottom: '6px' }}>
                      <span style={{ fontSize: '16px' }}>📄</span>
                      <span style={{ color: 'white', fontSize: '13px', flex: 1 }}>{f.name}</span>
                      <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px' }}>{(f.size/1024).toFixed(0)} KB</span>
                    </div>
                  ))}
                </div>
              )}
              <div style={{ background: 'rgba(232,50,26,0.15)', border: '1px solid rgba(232,50,26,0.3)', borderRadius: '10px', padding: '12px 16px', marginBottom: '24px' }}>
                <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px', margin: 0 }}>🔒 Tus documentos se almacenan de forma segura y encriptada. Solo el area legal de T1 tiene acceso.</p>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Btn label="← Anterior" onClick={() => setPaso(4)} secondary />
                <button style={{ padding: '13px 32px', borderRadius: '10px', border: 'none', background: '#E8321A', color: 'white', fontWeight: 700, fontSize: '15px', cursor: 'pointer' }}>
                  Enviar solicitud ✓
                </button>
              </div>
            </div>
          )}

        </div>
        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.5)', fontSize: '13px', marginTop: '16px' }}>
          Ya tienes una solicitud? <a href="/login" style={{ color: 'white', fontWeight: 700, textDecoration: 'none' }}>Ver mis solicitudes</a>
        </p>
      </div>
    </div>
  )
}
