'use client'
import { useState } from 'react'

export default function Editor() {
  const [tab, setTab] = useState('redactar')
  const [contenido, setContenido] = useState(`CONTRATO DE PRESTACION DE SERVICIOS\n\nQue celebran por una parte [NOMBRE CLIENTE], en adelante "EL CLIENTE", representado por [APODERADO], con RFC [RFC];\n\ny por la otra parte T1 Pagos S.A. de C.V., en adelante "T1", al tenor de las siguientes clausulas:\n\nI. OBJETO\nT1 prestara los servicios de [DESCRIPCION] al CLIENTE durante la vigencia del presente contrato.\n\nII. VIGENCIA\nEl presente contrato tendra una vigencia de [VIGENCIA] a partir de la fecha de firma.\n\nIII. CONTRAPRESTACION\nEl CLIENTE pagara a T1 la cantidad de [MONTO] dentro de los [PLAZO] dias [TIPO_DIAS] siguientes a la facturacion.\n\nIV. CONFIDENCIALIDAD\nAmbas partes se obligan a mantener confidencial toda informacion intercambiada durante la vigencia del contrato.`)
  const [clausulaSeleccionada, setClausulaSeleccionada] = useState('')

  const tabs = ['redactar','documento','clausulas','colaboradores','enviar']
  const tabLabels: Record<string, string> = { redactar:'Redactar', documento:'Documento base', clausulas:'Clausulas', colaboradores:'Colaboradores', enviar:'Enviar' }

  const clausulas = [
    { id:'C1', titulo:'Confidencialidad', texto:'Las partes se obligan a mantener confidencial toda informacion intercambiada.' },
    { id:'C2', titulo:'Vigencia con prorroga', texto:'El contrato tendra vigencia de [X] meses, prorrogable automaticamente.' },
    { id:'C3', titulo:'Penalizacion por incumplimiento', texto:'En caso de incumplimiento, la parte responsable pagara el [X]% del valor del contrato.' },
    { id:'C4', titulo:'Rescision', texto:'Cualquiera de las partes podra rescindir con [X] dias de anticipacion.' },
    { id:'C5', titulo:'Jurisdiccion CDMX', texto:'Para todo lo relacionado con el presente, las partes se someten a los tribunales de CDMX.' },
    { id:'C6', titulo:'Firma electronica', texto:'Las partes aceptan la firma electronica con plena validez legal conforme Arts. 89-90 CCo.' },
    { id:'C7', titulo:'Limitacion de responsabilidad', texto:'La responsabilidad de T1 se limita al monto del contrato en ningun caso.' },
    { id:'C8', titulo:'Propiedad intelectual T1', texto:'Todos los desarrollos y creaciones son propiedad exclusiva de T1 Pagos.' },
  ]

  const trackingLegal = [
    { fecha:'04/04/2026 09:15', accion:'Jovanni abrio clausula III para estudio', tipo:'estudio', visible:'legal' },
    { fecha:'04/04/2026 09:22', accion:'IA detecto riesgo en plazo de pago — recomendo 30 dias habiles', tipo:'ia', visible:'legal' },
    { fecha:'04/04/2026 09:25', accion:'Jovanni acepto recomendacion IA — clausula III actualizada', tipo:'cambio', visible:'legal' },
    { fecha:'04/04/2026 09:30', accion:'Jovanni marco clausula V para revision adicional', tipo:'estudio', visible:'legal' },
  ]

  const trackingComercial = [
    { fecha:'01/04/2026', accion:'Solicitud recibida de Comercial', tipo:'recibido' },
    { fecha:'04/04/2026', accion:'Jovanni inicio revision del contrato', tipo:'proceso' },
    { fecha:'04/04/2026', accion:'Documento en revision interna', tipo:'proceso' },
  ]

  const colaboradores = [
    { nombre:'Jovanni Poceros', rol:'Responsable legal', estado:'Trabajando', color:'#0D5C36' },
    { nombre:'Angel (ejemplo)', rol:'Abogado junior', estado:'Pendiente revision', color:'#F59E0B' },
    { nombre:'Finanzas', rol:'Revisor de clausulas economicas', estado:'VoBo pendiente', color:'#3B82F6' },
  ]

  const Sidebar = () => (
    <div style={{ display: 'flex', gap: '0', marginBottom: '24px', borderBottom: '2px solid #F0F0F0' }}>
      {tabs.map(t => (
        <button key={t} onClick={() => setTab(t)} style={{ padding: '10px 20px', border: 'none', background: 'transparent', color: tab === t ? '#E8321A' : '#888', fontWeight: tab === t ? 700 : 400, fontSize: '13px', cursor: 'pointer', borderBottom: tab === t ? '2px solid #E8321A' : '2px solid transparent', marginBottom: '-2px' }}>
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
        <Sidebar />

        {tab === 'redactar' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '24px' }}>
            <div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px', padding: '10px', background: '#F8F8F8', borderRadius: '8px' }}>
                {['B','I','U','H1','H2','Lista','Tabla','Imagen'].map((t,i) => (
                  <button key={i} style={{ padding: '4px 10px', borderRadius: '5px', border: '1px solid #E0E2E6', background: 'white', color: '#0F2447', fontSize: '12px', cursor: 'pointer', fontWeight: 600 }}>{t}</button>
                ))}
              </div>
              <textarea value={contenido} onChange={e => setContenido(e.target.value)}
                style={{ width: '100%', minHeight: '480px', padding: '20px', borderRadius: '10px', border: '1.5px solid #E8E8E8', fontSize: '14px', color: '#0F2447', lineHeight: '1.8', resize: 'vertical', fontFamily: 'serif', boxSizing: 'border-box', outline: 'none' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ background: '#F8F8F8', borderRadius: '12px', padding: '16px' }}>
                <h3 style={{ color: '#0F2447', fontSize: '13px', fontWeight: 700, margin: '0 0 10px' }}>Plantillas</h3>
                {['Contrato Cliente','Contrato Proveedor','NDA','Convenio Modificatorio','Anexo','Terminos y Condiciones'].map((p,i) => (
                  <div key={i} style={{ padding: '8px 10px', borderRadius: '7px', border: '1px solid #E8E8E8', marginBottom: '5px', cursor: 'pointer', fontSize: '12px', color: '#0F2447', background: 'white', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>📄</span>{p}
                  </div>
                ))}
              </div>
              <div style={{ background: '#F8F8F8', borderRadius: '12px', padding: '16px' }}>
                <h3 style={{ color: '#0F2447', fontSize: '13px', fontWeight: 700, margin: '0 0 10px' }}>Campos del solicitante</h3>
                {['[NOMBRE CLIENTE]','[RFC]','[APODERADO]','[VIGENCIA]','[MONTO]','[PLAZO]'].map((c,i) => (
                  <div key={i} style={{ padding: '5px 10px', borderRadius: '6px', border: '1px solid #E8E8E8', marginBottom: '4px', fontSize: '11px', color: '#E8321A', background: 'white', cursor: 'pointer', fontFamily: 'monospace' }}>{c}</div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === 'documento' && (
          <div>
            <div style={{ background: '#FFF8F0', border: '1px solid #FED7AA', borderRadius: '10px', padding: '12px 16px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span>📎</span>
              <div>
                <p style={{ color: '#92400E', fontWeight: 700, fontSize: '13px', margin: 0 }}>Contrato cargado por el solicitante</p>
                <p style={{ color: '#92400E', fontSize: '12px', margin: 0 }}>Contrato_Solistica_v1.pdf — Cargado el 01/04/2026</p>
              </div>
              <button style={{ marginLeft: 'auto', background: '#E8321A', color: 'white', border: 'none', padding: '6px 14px', borderRadius: '6px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>Descargar</button>
            </div>
            <div style={{ background: '#F8F8F8', borderRadius: '10px', padding: '24px', minHeight: '400px', border: '1.5px solid #E8E8E8' }}>
              <p style={{ color: '#0F2447', fontWeight: 700, textAlign: 'center', marginBottom: '16px' }}>CONTRATO ORIGINAL DEL SOLICITANTE</p>
              <p style={{ color: '#555', fontSize: '13px', lineHeight: '1.8' }}>Clausula I. Objeto — <span style={{ background: '#FEF9C3', padding: '1px 3px' }}>Los servicios incluiran penalizacion del 50% [MARCADO PARA REVISION]</span></p>
              <p style={{ color: '#555', fontSize: '13px', lineHeight: '1.8' }}>Clausula II. Vigencia — El contrato tendra vigencia indefinida sin posibilidad de rescision.</p>
              <p style={{ color: '#555', fontSize: '13px', lineHeight: '1.8' }}>Clausula III. Pago — <span style={{ background: '#FEE2E2', padding: '1px 3px' }}>El pago se realizara a 90 dias naturales [RIESGO DETECTADO]</span></p>
            </div>
            <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
              <button style={{ background: '#E8321A', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>Enviar clausula a estudio IA</button>
              <button style={{ background: '#0F2447', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>Trabajar en editor</button>
            </div>
          </div>
        )}

        {tab === 'clausulas' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <div>
              <h3 style={{ color: '#0F2447', fontSize: '14px', fontWeight: 700, margin: '0 0 16px' }}>Libreria de clausulas base</h3>
              {clausulas.map((c,i) => (
                <div key={i} onClick={() => setClausulaSeleccionada(c.id)}
                  style={{ padding: '12px 16px', borderRadius: '10px', border: `1.5px solid ${clausulaSeleccionada === c.id ? '#E8321A' : '#E8E8E8'}`, marginBottom: '8px', cursor: 'pointer', background: clausulaSeleccionada === c.id ? '#FFF5F5' : 'white' }}>
                  <p style={{ color: '#0F2447', fontWeight: 700, fontSize: '13px', margin: '0 0 4px' }}>{c.titulo}</p>
                  <p style={{ color: '#888', fontSize: '12px', margin: 0 }}>{c.texto.substring(0,60)}...</p>
                </div>
              ))}
            </div>
            <div>
              {clausulaSeleccionada && (() => {
                const c = clausulas.find(x => x.id === clausulaSeleccionada)!
                return (
                  <div>
                    <h3 style={{ color: '#0F2447', fontSize: '14px', fontWeight: 700, margin: '0 0 16px' }}>Clausula seleccionada</h3>
                    <div style={{ background: '#F8F8F8', borderRadius: '10px', padding: '16px', marginBottom: '16px' }}>
                      <p style={{ color: '#0F2447', fontWeight: 700, margin: '0 0 8px' }}>{c.titulo}</p>
                      <p style={{ color: '#555', fontSize: '13px', lineHeight: '1.7', margin: 0 }}>{c.texto}</p>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <button style={{ background: '#E8321A', color: 'white', border: 'none', padding: '10px', borderRadius: '8px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>
                        Enviar a estudio IA →
                      </button>
                      <button style={{ background: '#0F2447', color: 'white', border: 'none', padding: '10px', borderRadius: '8px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>
                        Insertar en editor
                      </button>
                      <button style={{ background: '#0D5C36', color: 'white', border: 'none', padding: '10px', borderRadius: '8px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>
                        Insertar y cerrar
                      </button>
                    </div>
                    <div style={{ marginTop: '16px', background: '#EFF6FF', borderRadius: '10px', padding: '12px' }}>
                      <p style={{ color: '#1D4ED8', fontSize: '12px', fontWeight: 700, margin: '0 0 4px' }}>Tracking legal de esta clausula</p>
                      <p style={{ color: '#1D4ED8', fontSize: '12px', margin: 0 }}>Sin estudios previos — primera vez que se trabaja</p>
                    </div>
                  </div>
                )
              })()}
              {!clausulaSeleccionada && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px', color: '#888', fontSize: '13px' }}>
                  Selecciona una clausula para ver opciones
                </div>
              )}
            </div>
          </div>
        )}

        {tab === 'colaboradores' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ color: '#0F2447', fontSize: '14px', fontWeight: 700, margin: 0 }}>Equipo de trabajo</h3>
              <button style={{ background: '#0F2447', color: 'white', border: 'none', padding: '8px 18px', borderRadius: '8px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>+ Invitar colaborador</button>
            </div>
            {colaboradores.map((c,i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', borderRadius: '10px', border: '1px solid #F0F0F0', marginBottom: '8px', background: 'white' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: c.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '14px' }}>
                  {c.nombre.charAt(0)}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ color: '#0F2447', fontWeight: 700, fontSize: '14px', margin: '0 0 2px' }}>{c.nombre}</p>
                  <p style={{ color: '#888', fontSize: '12px', margin: 0 }}>{c.rol}</p>
                </div>
                <span style={{ background: c.color + '20', color: c.color, fontSize: '12px', fontWeight: 700, padding: '4px 12px', borderRadius: '20px' }}>{c.estado}</span>
              </div>
            ))}
            <div style={{ marginTop: '24px' }}>
              <h3 style={{ color: '#0F2447', fontSize: '14px', fontWeight: 700, margin: '0 0 16px' }}>Tracking legal (solo equipo legal)</h3>
              {trackingLegal.map((t,i) => (
                <div key={i} style={{ display: 'flex', gap: '12px', padding: '10px 0', borderBottom: '1px solid #F0F0F0' }}>
                  <span style={{ fontSize: '16px' }}>{t.tipo === 'ia' ? '🤖' : t.tipo === 'estudio' ? '🔍' : '✏️'}</span>
                  <div>
                    <p style={{ color: '#0F2447', fontSize: '13px', margin: '0 0 2px' }}>{t.accion}</p>
                    <p style={{ color: '#888', fontSize: '11px', margin: 0 }}>{t.fecha}</p>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: '24px' }}>
              <h3 style={{ color: '#0F2447', fontSize: '14px', fontWeight: 700, margin: '0 0 16px' }}>Tracking comercial (visible para solicitante)</h3>
              {trackingComercial.map((t,i) => (
                <div key={i} style={{ display: 'flex', gap: '12px', padding: '10px 0', borderBottom: '1px solid #F0F0F0' }}>
                  <span style={{ fontSize: '16px' }}>{t.tipo === 'recibido' ? '📥' : '⚙️'}</span>
                  <div>
                    <p style={{ color: '#0F2447', fontSize: '13px', margin: '0 0 2px' }}>{t.accion}</p>
                    <p style={{ color: '#888', fontSize: '11px', margin: 0 }}>{t.fecha}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'enviar' && (
          <div style={{ maxWidth: '500px' }}>
            <h3 style={{ color: '#0F2447', fontSize: '16px', fontWeight: 700, margin: '0 0 24px' }}>Enviar documento al solicitante</h3>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', color: '#0F2447', fontWeight: 600, fontSize: '13px', marginBottom: '10px' }}>Formato de envio</label>
              <div style={{ display: 'flex', gap: '12px' }}>
                {['PDF','Word (DOCX)'].map((f,i) => (
                  <div key={i} style={{ flex: 1, padding: '16px', borderRadius: '10px', border: `2px solid ${i === 0 ? '#E8321A' : '#E8E8E8'}`, cursor: 'pointer', textAlign: 'center', background: i === 0 ? '#FFF5F5' : 'white' }}>
                    <div style={{ fontSize: '24px', marginBottom: '6px' }}>{i === 0 ? '📕' : '📘'}</div>
                    <p style={{ color: i === 0 ? '#E8321A' : '#888', fontWeight: 700, fontSize: '13px', margin: 0 }}>{f}</p>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', color: '#0F2447', fontWeight: 600, fontSize: '13px', marginBottom: '8px' }}>Mensaje para el solicitante (opcional)</label>
              <textarea rows={3} placeholder="Ej: Adjunto el contrato revisado. Por favor revisa las clausulas III y V..." style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1.5px solid #E8E8E8', fontSize: '13px', boxSizing: 'border-box', resize: 'vertical', outline: 'none' }} />
            </div>
            <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '10px', padding: '12px 16px', marginBottom: '24px' }}>
              <p style={{ color: '#166534', fontSize: '12px', margin: 0 }}>✓ El solicitante recibira una notificacion en su portal y podra descargar el documento. Quedara registrado en el tracking con fecha y hora.</p>
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
