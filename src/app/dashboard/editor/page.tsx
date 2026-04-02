'use client'
import { useState } from 'react'

export default function Editor() {
  const [tab, setTab] = useState('redactar')
  const [contenido, setContenido] = useState(`CONTRATO DE PRESTACION DE SERVICIOS\n\nQue celebran por una parte [NOMBRE CLIENTE], en adelante "EL CLIENTE", representado por [APODERADO], con RFC [RFC];\n\ny por la otra parte T1 Pagos S.A. de C.V., en adelante "T1", al tenor de las siguientes clausulas:\n\nI. OBJETO\nT1 prestara los servicios de [DESCRIPCION] al CLIENTE durante la vigencia del presente contrato.\n\nII. VIGENCIA\nEl presente contrato tendra una vigencia de [VIGENCIA] a partir de la fecha de firma.\n\nIII. CONTRAPRESTACION\nEl CLIENTE pagara a T1 la cantidad de [MONTO] dentro de los [PLAZO] dias [TIPO_DIAS] siguientes a la facturacion.\n\nIV. CONFIDENCIALIDAD\nAmbas partes se obligan a mantener confidencial toda informacion intercambiada durante la vigencia del contrato.`)
  const [clausulaSeleccionada, setClausulaSeleccionada] = useState('')
  const [mostrarNuevaClausula, setMostrarNuevaClausula] = useState(false)
  const [nuevaClausula, setNuevaClausula] = useState({ titulo: '', texto: '' })

  const tabs = ['redactar', 'documento', 'biblioteca', 'colaboradores', 'enviar']
  const tabLabels: Record<string, string> = {
    redactar: 'Redactar',
    documento: 'Documento base',
    biblioteca: 'Plantillas y Clausulas',
    colaboradores: 'Colaboradores',
    enviar: 'Enviar'
  }

  const plantillas = [
    { id: 'P1', tipo: 'plantilla', titulo: 'Contrato de Servicios', campos: ['NOMBRE CLIENTE', 'RFC', 'APODERADO', 'VIGENCIA', 'MONTO', 'PLAZO'] },
    { id: 'P2', tipo: 'plantilla', titulo: 'Contrato de Compraventa', campos: ['NOMBRE CLIENTE', 'RFC', 'APODERADO', 'PRECIO', 'FORMA DE PAGO'] },
    { id: 'P3', tipo: 'plantilla', titulo: 'NDA', campos: ['NOMBRE CLIENTE', 'RFC', 'APODERADO', 'VIGENCIA'] },
    { id: 'P4', tipo: 'plantilla', titulo: 'Convenio Modificatorio', campos: ['CONTRATO ORIGINAL', 'CLAUSULAS A MODIFICAR'] },
    { id: 'P5', tipo: 'plantilla', titulo: 'Terminos y Condiciones', campos: ['NOMBRE EMPRESA', 'FECHA'] },
  ]

  const clausulas = [
    { id: 'C1', tipo: 'clausula', titulo: 'Confidencialidad', texto: 'Las partes se obligan a mantener confidencial toda informacion intercambiada.' },
    { id: 'C2', tipo: 'clausula', titulo: 'Vigencia con prorroga', texto: 'El contrato tendra vigencia de [X] meses, prorrogable automaticamente.' },
    { id: 'C3', tipo: 'clausula', titulo: 'Penalizacion por incumplimiento', texto: 'En caso de incumplimiento, la parte responsable pagara el [X]% del valor del contrato.' },
    { id: 'C4', tipo: 'clausula', titulo: 'Rescision', texto: 'Cualquiera de las partes podra rescindir con [X] dias de anticipacion.' },
    { id: 'C5', tipo: 'clausula', titulo: 'Jurisdiccion CDMX', texto: 'Para todo lo relacionado con el presente, las partes se someten a los tribunales de CDMX.' },
    { id: 'C6', tipo: 'clausula', titulo: 'Firma electronica', texto: 'Las partes aceptan la firma electronica con plena validez legal conforme Arts. 89-90 CCo.' },
    { id: 'C7', tipo: 'clausula', titulo: 'Limitacion de responsabilidad', texto: 'La responsabilidad de T1 se limita al monto del contrato en ningun caso.' },
    { id: 'C8', tipo: 'clausula', titulo: 'Propiedad intelectual T1', texto: 'Todos los desarrollos y creaciones son propiedad exclusiva de T1 Pagos.' },
  ]

  const colaboradores = [
    { nombre: 'Jovanni Poceros', rol: 'Responsable legal', estado: 'Trabajando', color: '#0D5C36' },
    { nombre: 'Finanzas', rol: 'Revisor clausulas economicas', estado: 'VoBo pendiente', color: '#3B82F6' },
  ]

  const Tabs = () => (
    <div style={{ display: 'flex', gap: 0, marginBottom: '24px', borderBottom: '2px solid #F0F0F0' }}>
      {tabs.map(t => (
        <button key={t} onClick={() => setTab(t)} style={{ padding: '10px 18px', border: 'none', background: 'transparent', color: tab === t ? '#E8321A' : '#888', fontWeight: tab === t ? 700 : 400, fontSize: '13px', cursor: 'pointer', borderBottom: tab === t ? '2px solid #E8321A' : '2px solid transparent', marginBottom: '-2px' }}>
          {tabLabels[t]}
        </button>
      ))}
    </div>
  )

  return (
    <div style={{ padding: '32px', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ color: '#0F2447', fontSize: '24px', fontWeight: 700, margin: '0 0 4px' }}>Editor de Contratos</h1>
          <p style={{ color: '#888', margin: 0 }}>C-2026-001 — Empresa A — Contrato de servicios</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <span style={{ background: '#EFF6FF', color: '#1D4ED8', fontSize: '12px', fontWeight: 700, padding: '4px 12px', borderRadius: '20px' }}>En proceso</span>
          <span style={{ background: '#FEF3C7', color: '#92400E', fontSize: '12px', fontWeight: 700, padding: '4px 12px', borderRadius: '20px' }}>Version 3</span>
        </div>
      </div>

      <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        <Tabs />

        {tab === 'redactar' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: '24px' }}>
            <div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px', padding: '10px', background: '#F8F8F8', borderRadius: '8px' }}>
                {['B', 'I', 'U', 'H1', 'H2', 'Lista', 'Tabla'].map((t, i) => (
                  <button key={i} style={{ padding: '4px 10px', borderRadius: '5px', border: '1px solid #E0E2E6', background: 'white', color: '#0F2447', fontSize: '12px', cursor: 'pointer', fontWeight: 600 }}>{t}</button>
                ))}
                <button style={{ padding: '4px 14px', borderRadius: '5px', border: 'none', background: '#0D5C36', color: 'white', fontSize: '12px', cursor: 'pointer', fontWeight: 700, marginLeft: 'auto' }}>Guardar borrador</button>
              </div>
              <textarea value={contenido} onChange={e => setContenido(e.target.value)}
                style={{ width: '100%', minHeight: '520px', padding: '24px', borderRadius: '10px', border: '1.5px solid #E8E8E8', fontSize: '14px', color: '#0F2447', lineHeight: '1.9', resize: 'vertical', fontFamily: 'Georgia, serif', boxSizing: 'border-box', outline: 'none' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ background: '#F8F8F8', borderRadius: '12px', padding: '16px' }}>
                <p style={{ color: '#0F2447', fontSize: '12px', fontWeight: 700, margin: '0 0 8px' }}>CAMPOS DEL SOLICITANTE</p>
                <p style={{ color: '#888', fontSize: '11px', margin: '0 0 10px' }}>Haz clic para insertar en el editor</p>
                {['[NOMBRE CLIENTE]', '[RFC]', '[APODERADO]', '[VIGENCIA]', '[MONTO]', '[PLAZO]', '[TIPO_DIAS]', '[DESCRIPCION]'].map((c, i) => (
                  <div key={i} style={{ padding: '5px 10px', borderRadius: '6px', border: '1px solid #E8E8E8', marginBottom: '4px', fontSize: '11px', color: '#E8321A', background: 'white', cursor: 'pointer', fontFamily: 'monospace', fontWeight: 700 }}>{c}</div>
                ))}
              </div>
              <div style={{ background: '#FFF5F5', borderRadius: '12px', padding: '14px', border: '1px solid #FFD0CC' }}>
                <p style={{ color: '#C42A15', fontSize: '11px', fontWeight: 700, margin: '0 0 4px' }}>TIP DE PRODUCTIVIDAD</p>
                <p style={{ color: '#C42A15', fontSize: '11px', margin: 0 }}>Ve a Plantillas y Clausulas para cargar una plantilla completa. Los campos se llenan automaticamente con los datos del solicitante.</p>
              </div>
            </div>
          </div>
        )}

        {tab === 'documento' && (
          <div>
            <div style={{ background: '#FFF8F0', border: '1px solid #FED7AA', borderRadius: '10px', padding: '14px 18px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '24px' }}>📎</span>
              <div style={{ flex: 1 }}>
                <p style={{ color: '#92400E', fontWeight: 700, fontSize: '13px', margin: '0 0 2px' }}>Documento cargado por el solicitante</p>
                <p style={{ color: '#92400E', fontSize: '12px', margin: 0 }}>Contrato_v1.pdf — Cargado el 01/04/2026 por el area Comercial</p>
              </div>
              <button style={{ background: '#0F2447', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>Descargar original</button>
            </div>

            <div style={{ background: '#F8F8F8', borderRadius: '10px', padding: '24px', minHeight: '400px', border: '1.5px solid #E8E8E8', marginBottom: '16px' }}>
              <p style={{ color: '#0F2447', fontWeight: 700, textAlign: 'center', marginBottom: '20px', fontSize: '15px' }}>DOCUMENTO ORIGINAL DEL SOLICITANTE</p>

              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <p style={{ color: '#0F2447', fontWeight: 700, fontSize: '13px', margin: 0 }}>Clausula I. Objeto</p>
                  <button style={{ background: '#E8321A', color: 'white', border: 'none', padding: '4px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}>Enviar a estudio IA</button>
                </div>
                <p style={{ color: '#555', fontSize: '13px', lineHeight: '1.7', margin: 0, background: '#FEF9C3', padding: '8px 12px', borderRadius: '6px' }}>Los servicios incluiran penalizacion del 50% sobre el valor total. <span style={{ color: '#92400E', fontWeight: 700 }}>[Marcado para revision]</span></p>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <p style={{ color: '#0F2447', fontWeight: 700, fontSize: '13px', margin: 0 }}>Clausula II. Vigencia</p>
                  <button style={{ background: '#E8321A', color: 'white', border: 'none', padding: '4px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}>Enviar a estudio IA</button>
                </div>
                <p style={{ color: '#555', fontSize: '13px', lineHeight: '1.7', margin: 0 }}>El contrato tendra vigencia indefinida sin posibilidad de rescision unilateral.</p>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <p style={{ color: '#0F2447', fontWeight: 700, fontSize: '13px', margin: 0 }}>Clausula III. Pago</p>
                  <button style={{ background: '#E8321A', color: 'white', border: 'none', padding: '4px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}>Enviar a estudio IA</button>
                </div>
                <p style={{ color: '#555', fontSize: '13px', lineHeight: '1.7', margin: 0, background: '#FEE2E2', padding: '8px 12px', borderRadius: '6px' }}>El pago se realizara a 90 dias naturales sin penalizacion por retraso. <span style={{ color: '#C42A15', fontWeight: 700 }}>[Riesgo alto para T1]</span></p>
              </div>

              <div style={{ marginBottom: '0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <p style={{ color: '#0F2447', fontWeight: 700, fontSize: '13px', margin: 0 }}>Documento completo</p>
                  <button style={{ background: '#0F2447', color: 'white', border: 'none', padding: '4px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}>Enviar documento completo a IA</button>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button style={{ background: '#0D5C36', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>Pasar version final al editor</button>
            </div>
          </div>
        )}

        {tab === 'biblioteca' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h3 style={{ color: '#0F2447', fontSize: '16px', fontWeight: 700, margin: '0 0 4px' }}>Plantillas y Clausulas</h3>
                <p style={{ color: '#888', fontSize: '13px', margin: 0 }}>Carga una plantilla completa o agrega clausulas individuales al documento</p>
              </div>
              <button onClick={() => setMostrarNuevaClausula(!mostrarNuevaClausula)}
                style={{ background: '#0F2447', color: 'white', border: 'none', padding: '8px 18px', borderRadius: '8px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>+ Agregar nueva</button>
            </div>

            {mostrarNuevaClausula && (
              <div style={{ background: '#F8F8F8', borderRadius: '12px', padding: '20px', marginBottom: '20px', border: '1.5px solid #E8E8E8' }}>
                <h4 style={{ color: '#0F2447', fontSize: '14px', fontWeight: 700, margin: '0 0 16px' }}>Nueva clausula o plantilla</h4>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', color: '#0F2447', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>Titulo</label>
                  <input value={nuevaClausula.titulo} onChange={e => setNuevaClausula(n => ({ ...n, titulo: e.target.value }))}
                    placeholder="Ej: Clausula de exclusividad" style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #E8E8E8', fontSize: '13px', boxSizing: 'border-box', outline: 'none' }} />
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', color: '#0F2447', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>Contenido</label>
                  <textarea value={nuevaClausula.texto} onChange={e => setNuevaClausula(n => ({ ...n, texto: e.target.value }))}
                    placeholder="Escribe el texto de la clausula o plantilla..." rows={4}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #E8E8E8', fontSize: '13px', boxSizing: 'border-box', resize: 'vertical', outline: 'none' }} />
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button style={{ background: '#E8321A', color: 'white', border: 'none', padding: '8px 20px', borderRadius: '8px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>Guardar en biblioteca</button>
                  <button onClick={() => setMostrarNuevaClausula(false)} style={{ background: 'white', color: '#888', border: '1.5px solid #E8E8E8', padding: '8px 20px', borderRadius: '8px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>Cancelar</button>
                </div>
              </div>
            )}

            <div style={{ marginBottom: '24px' }}>
              <p style={{ color: '#0F2447', fontSize: '13px', fontWeight: 700, margin: '0 0 12px', padding: '0 0 8px', borderBottom: '1px solid #F0F0F0' }}>PLANTILLAS COMPLETAS</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px' }}>
                {plantillas.map((p, i) => (
                  <div key={i} style={{ padding: '16px', borderRadius: '10px', border: '1.5px solid #E8E8E8', background: 'white', cursor: 'pointer' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                      <span style={{ fontSize: '20px' }}>📄</span>
                      <p style={{ color: '#0F2447', fontWeight: 700, fontSize: '13px', margin: 0 }}>{p.titulo}</p>
                    </div>
                    <p style={{ color: '#888', fontSize: '11px', margin: '0 0 10px' }}>Campos: {p.campos.join(', ')}</p>
                    <button style={{ width: '100%', background: '#0F2447', color: 'white', border: 'none', padding: '7px', borderRadius: '6px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>
                      Cargar al editor
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p style={{ color: '#0F2447', fontSize: '13px', fontWeight: 700, margin: '0 0 12px', padding: '0 0 8px', borderBottom: '1px solid #F0F0F0' }}>CLAUSULAS BASE</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {clausulas.map((c, i) => (
                  <div key={i} onClick={() => setClausulaSeleccionada(clausulaSeleccionada === c.id ? '' : c.id)}
                    style={{ padding: '14px 16px', borderRadius: '10px', border: `1.5px solid ${clausulaSeleccionada === c.id ? '#E8321A' : '#E8E8E8'}`, background: clausulaSeleccionada === c.id ? '#FFF5F5' : 'white', cursor: 'pointer' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ flex: 1 }}>
                        <p style={{ color: '#0F2447', fontWeight: 700, fontSize: '13px', margin: '0 0 4px' }}>{c.titulo}</p>
                        <p style={{ color: '#888', fontSize: '11px', margin: 0 }}>{c.texto.substring(0, 55)}...</p>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginLeft: '10px' }}>
                        <button style={{ background: '#0F2447', color: 'white', border: 'none', padding: '4px 10px', borderRadius: '5px', fontSize: '11px', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>Insertar</button>
                        <button style={{ background: '#E8321A', color: 'white', border: 'none', padding: '4px 10px', borderRadius: '5px', fontSize: '11px', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>Al final</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === 'colaboradores' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ color: '#0F2447', fontSize: '14px', fontWeight: 700, margin: 0 }}>Equipo de trabajo en este contrato</h3>
              <button style={{ background: '#0F2447', color: 'white', border: 'none', padding: '8px 18px', borderRadius: '8px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>+ Invitar colaborador</button>
            </div>
            {colaboradores.map((c, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', borderRadius: '10px', border: '1px solid #F0F0F0', marginBottom: '8px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: c.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '16px' }}>
                  {c.nombre.charAt(0)}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ color: '#0F2447', fontWeight: 700, fontSize: '14px', margin: '0 0 2px' }}>{c.nombre}</p>
                  <p style={{ color: '#888', fontSize: '12px', margin: 0 }}>{c.rol}</p>
                </div>
                <span style={{ background: c.color + '20', color: c.color, fontSize: '12px', fontWeight: 700, padding: '4px 12px', borderRadius: '20px' }}>{c.estado}</span>
              </div>
            ))}
            <div style={{ background: '#EFF6FF', borderRadius: '10px', padding: '14px 18px', marginTop: '16px' }}>
              <p style={{ color: '#1D4ED8', fontSize: '13px', fontWeight: 700, margin: '0 0 4px' }}>El tracking completo de este contrato vive en Expediente</p>
              <p style={{ color: '#1D4ED8', fontSize: '12px', margin: '0 0 10px' }}>Ahi puedes ver el historial completo de versiones, revisiones y cambios.</p>
              <button style={{ background: '#0F2447', color: 'white', border: 'none', padding: '8px 18px', borderRadius: '8px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>Ver expediente C-2026-001</button>
            </div>
          </div>
        )}

        {tab === 'enviar' && (
          <div style={{ maxWidth: '520px' }}>
            <h3 style={{ color: '#0F2447', fontSize: '16px', fontWeight: 700, margin: '0 0 24px' }}>Enviar documento al solicitante</h3>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', color: '#0F2447', fontWeight: 600, fontSize: '13px', marginBottom: '10px' }}>Formato de envio</label>
              <div style={{ display: 'flex', gap: '12px' }}>
                {[{ label: 'PDF', icon: '📕' }, { label: 'Word (DOCX)', icon: '📘' }].map((f, i) => (
                  <div key={i} style={{ flex: 1, padding: '16px', borderRadius: '10px', border: `2px solid ${i === 0 ? '#E8321A' : '#E8E8E8'}`, cursor: 'pointer', textAlign: 'center', background: i === 0 ? '#FFF5F5' : 'white' }}>
                    <div style={{ fontSize: '28px', marginBottom: '6px' }}>{f.icon}</div>
                    <p style={{ color: i === 0 ? '#E8321A' : '#888', fontWeight: 700, fontSize: '13px', margin: 0 }}>{f.label}</p>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', color: '#0F2447', fontWeight: 600, fontSize: '13px', marginBottom: '8px' }}>Mensaje para el solicitante (opcional)</label>
              <textarea rows={3} placeholder="Ej: Adjunto el contrato revisado. Por favor revisa las clausulas III y V..."
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1.5px solid #E8E8E8', fontSize: '13px', boxSizing: 'border-box', resize: 'vertical', outline: 'none' }} />
            </div>
            <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '10px', padding: '12px 16px', marginBottom: '24px' }}>
              <p style={{ color: '#166534', fontSize: '12px', margin: 0 }}>✓ El solicitante recibira una notificacion en su portal y podra descargar el documento. Quedara registrado en el tracking del expediente con fecha y hora exacta.</p>
            </div>
            <button style={{ width: '100%', padding: '14px', background: '#E8321A', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 700, fontSize: '15px', cursor: 'pointer' }}>
              Enviar documento →
            </button>
          </div>
        )}

      </div>
    </div>
  )
}
